// ── Stream Status & Interactive Enhancements for Yurummi ────────────────────────
// Управляйте статусом эфира прямо здесь: измените isLive на true, когда начинаете стрим!
window.STREAM_CONFIG = {
    isLive: false, // Автоматически синхронизируется в реальном времени с Twitch (DecAPI)
    platform: 'twitch',
    channelUrl: 'https://twitch.tv/yurummi',
    game: '',
    title: '',
    scheduleInfo: 'Стримы по расписанию'
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\'/g, '&#39;');
}

// ── Автоматическая синхронизация статуса с Twitch (DecAPI) ─────
async function checkTwitchLiveStatus() {
    // Поддержка ручного принудительного режима через ?live=1 или ?live=0
    if (typeof window !== 'undefined' && window.location.search) {
        if (window.location.search.includes('live=1')) {
            window.STREAM_CONFIG.isLive = true;
            if (!window.STREAM_CONFIG.game) window.STREAM_CONFIG.game = 'Just Chatting';
            if (!window.STREAM_CONFIG.title) window.STREAM_CONFIG.title = 'Стрим на Twitch';
            updateLiveStatusPills();
            initStreamHeroBanner();
            return;
        }
        if (window.location.search.includes('live=0')) {
            window.STREAM_CONFIG.isLive = false;
            updateLiveStatusPills();
            initStreamHeroBanner();
            return;
        }
    }

    const channel = 'yurummi';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);

        const uptimeRes = await fetch(`https://decapi.me/twitch/uptime/${channel}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!uptimeRes.ok) return;
        const uptimeText = (await uptimeRes.text()).trim().toLowerCase();

        const isLive = !uptimeText.includes('offline') && 
                       !uptimeText.includes('not streaming') && 
                       !uptimeText.includes('user not found') &&
                       uptimeText.length > 0;

        if (isLive) {
            let game = '';
            let title = '';
            try {
                const [gameRes, titleRes] = await Promise.all([
                    fetch(`https://decapi.me/twitch/game/${channel}`),
                    fetch(`https://decapi.me/twitch/title/${channel}`)
                ]);
                if (gameRes.ok) game = (await gameRes.text()).trim();
                if (titleRes.ok) title = (await titleRes.text()).trim();
            } catch (err) {}

            window.STREAM_CONFIG.isLive = true;
            window.STREAM_CONFIG.game = game || 'Стрим на Twitch';
            window.STREAM_CONFIG.title = title || 'Присоединяйся к трансляции!';
        } else {
            window.STREAM_CONFIG.isLive = false;
        }

        updateLiveStatusPills();
        initStreamHeroBanner();

    } catch (e) {
        // При сетевом сбое оставляем предыдущее состояние
    }
}

// ── Всплывающий тост ──────────────────────────────────────────
function showToast(message) {
    let toast = document.getElementById('site-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'site-toast';
        toast.className = 'toast-notice';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

// ── Индикатор скролла и кнопка "Наверх" ───────────────────────
function initScrollEnhancements() {
    const progressBar = document.getElementById('scroll-progress');
    const bttBtn = document.getElementById('back-to-top');

    window.addEventListener('scroll', function () {
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (progressBar) {
            const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
            progressBar.style.width = scrolled + '%';
        }

        if (bttBtn) {
            if (winScroll > 380) {
                bttBtn.classList.add('visible');
            } else {
                bttBtn.classList.remove('visible');
            }
        }
    }, { passive: true });

    if (bttBtn) {
        bttBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ── Копирование команд чата в 1 клик ──────────────────────────
function initCommandCopying() {
    const cmdNames = document.querySelectorAll('.cmd-name');
    if (!cmdNames || cmdNames.length === 0) return;

    cmdNames.forEach(btn => {
        btn.setAttribute('title', 'Нажми, чтобы скопировать');
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            // Получаем чистый текст команды без иконок
            const fullText = this.innerText || '';
            const cmdMatch = fullText.match(/![^\s✓📋]+/);
            const cmd = cmdMatch ? cmdMatch[0] : fullText.replace(/[✓📋]/g, '').trim();

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(cmd).then(() => {
                    handleCopySuccess(this, cmd);
                }).catch(() => {
                    fallbackCopy(cmd);
                    handleCopySuccess(this, cmd);
                });
            } else {
                fallbackCopy(cmd);
                handleCopySuccess(this, cmd);
            }
        });
    });

    function handleCopySuccess(el, cmd) {
        el.classList.add('copied');
        showToast(`📋 Команда ${cmd} скопирована! Вставь в чат Twitch.`);
        setTimeout(() => {
            el.classList.remove('copied');
        }, 1200);
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    }
}

// ── Обновление статуса в шапке (Пилюля LIVE / Offline) ────────
function updateLiveStatusPills() {
    const pills = document.querySelectorAll('.nav-live-pill');
    if (!pills || pills.length === 0) return;

    const cfg = window.STREAM_CONFIG || {};
    pills.forEach(pill => {
        pill.href = cfg.channelUrl || 'https://twitch.tv/yurummi';
        if (cfg.isLive) {
            pill.className = 'nav-live-pill online';
            const gameText = cfg.game || 'Twitch';
            const titleSnippet = cfg.title ? ` — ${cfg.title}` : '';
            pill.innerHTML = `<span class="nlp-dot live-pulse"></span><span class="nlp-text">LIVE: <strong>${escapeHtml(gameText)}</strong>${escapeHtml(titleSnippet)}</span>`;
            pill.title = `${cfg.title || 'В эфире'} (${cfg.game || ''}) — Кликните для перехода на трансляцию!`;
        } else {
            pill.className = 'nav-live-pill offline';
            pill.innerHTML = `<span class="nlp-dot"></span><span class="nlp-text">Оффлайн</span>`;
            pill.title = `${cfg.scheduleInfo || 'Стримы по расписанию'}. Кликните, чтобы открыть Twitch канал`;
        }
    });
}

// ── Умный баннер стрима & обратный отсчёт ─────────────────────
function initStreamHeroBanner() {
    const banner = document.getElementById('stream-hero-bar');
    if (!banner) return;

    const cfg = window.STREAM_CONFIG || {};
    const pill = document.getElementById('shb-pill');
    const pillText = document.getElementById('shb-pill-text');
    const title = document.getElementById('shb-title');
    const center = document.getElementById('shb-center');
    const right = document.getElementById('shb-right');

    if (pill) {
        pill.style.cursor = 'pointer';
        pill.setAttribute('title', 'Кликните для перехода на трансляцию Twitch!');
        pill.onclick = () => window.open(cfg.channelUrl || 'https://twitch.tv/yurummi', '_blank');
    }

    if (cfg.isLive) {
        banner.classList.add('is-live');
        if (pill) {
            pill.className = 'shb-status-pill online';
            if (pillText) pillText.textContent = 'В ЭФИРЕ';
        }
        if (title) title.innerHTML = `🔴 <strong>${escapeHtml(cfg.game || 'Стрим на Twitch')}</strong>`;
        if (center) center.innerHTML = `<span style="color:#fca5a5;">${escapeHtml(cfg.title || 'Присоединяйся к трансляции прямо сейчас!')}</span>`;
        if (right) {
            right.innerHTML = `
                <a href="${cfg.channelUrl || 'https://twitch.tv/yurummi'}" target="_blank" rel="noopener" class="shb-btn shb-btn-twitch">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:inline-block; vertical-align:-2px; flex-shrink:0;"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                    <span>Смотреть на Twitch ➔</span>
                </a>
            `;
        }
        return;
    }

    // Если оффлайн — проверяем расписание и периоды
    banner.classList.remove('is-live');
    const streams = (typeof STREAMS_LIST !== 'undefined' ? STREAMS_LIST : (window.STREAMS_LIST || []));
    const now = new Date();
    
    // Формат YYYY-MM-DD
    const pad = n => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // Проверяем период (например, отпуск)
    const activePeriod = streams.find(s => s.startDate && s.endDate && todayStr >= s.startDate && todayStr <= s.endDate);

    // Ищем ближайший запланированный стрим с учетом часового пояса стримера (Берлин)
    function findNextStream() {
        const futureStreams = [];
        for (const s of streams) {
            if (!s.date || s.isCanceled) continue;
            // Распарсим дату и время (по Германии)
            const timeStr = (s.time || '20:00').replace(/[±~]/g, '').trim();
            const [hours, minutes] = (timeStr.includes(':') ? timeStr.split(':') : [timeStr, '00']).map(Number);
            
            // Находим точный момент в UTC по времени Europe/Berlin:
            const [y, mon, d] = s.date.split('-').map(Number);
            const targetUtc = new Date(Date.UTC(y, mon - 1, d, hours || 20, minutes || 0));

            const berlinFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Europe/Berlin',
                year: 'numeric', month: 'numeric', day: 'numeric',
                hour: 'numeric', minute: 'numeric',
                hourCycle: 'h23'
            });

            const parts = berlinFormatter.formatToParts(targetUtc);
            const p = {};
            for (const part of parts) p[part.type] = part.value;

            const berlinUtc = Date.UTC(
                parseInt(p.year, 10),
                parseInt(p.month, 10) - 1,
                parseInt(p.day, 10),
                parseInt(p.hour, 10),
                parseInt(p.minute, 10)
            );

            const streamDate = new Date(targetUtc.getTime() - (berlinUtc - targetUtc.getTime()));

            if (streamDate > now) {
                const userH = String(streamDate.getHours()).padStart(2, '0');
                const userM = String(streamDate.getMinutes()).padStart(2, '0');
                futureStreams.push({ 
                    event: s, 
                    dateObj: streamDate,
                    localTimeStr: `${userH}:${userM}`
                });
            }
        }
        futureStreams.sort((a, b) => a.dateObj - b.dateObj);
        return futureStreams[0] || null;
    }

    const next = findNextStream();

    if (next) {
        if (pill) {
            pill.className = activePeriod ? 'shb-status-pill vacation' : 'shb-status-pill offline';
            if (pillText) pillText.textContent = activePeriod ? 'ОТПУСК 🍁' : 'ОФФЛАЙН';
        }
        if (title) {
            const timeDisplay = next.localTimeStr || next.event.time || '20:00';
            const berlinNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
            const isDiffTz = Math.abs(now.getTime() - berlinNow.getTime()) >= 30 * 60 * 1000;
            const tzSuffix = isDiffTz ? ' по вашему времени' : '';
            title.innerHTML = `Следующий стрим: <strong>${next.event.text || 'Стрим'}</strong> (${formatNiceDate(next.dateObj)}, <strong>${timeDisplay}</strong>${tzSuffix})`;
        }
        if (center) {
            center.innerHTML = `
                <span class="shb-countdown-label">⏳ До стрима:</span>
                <strong class="shb-countdown-timer" id="shb-timer">-- дн. -- ч. -- мин.</strong>
                ${activePeriod ? `<span style="font-size:12px; color:#fcd34d; margin-left:6px;">(отпуск до ${formatNiceDate(activePeriod.endDate)})</span>` : ''}
            `;
        }
        if (right) {
            right.innerHTML = `
                <a href="#schedule" class="shb-btn shb-btn-schedule">📅 Расписание</a>
                <a href="https://twitch.tv/yurummi" target="_blank" rel="noopener" class="shb-btn shb-btn-twitch">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:inline-block; vertical-align:-2px; flex-shrink:0;"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
                    <span>Twitch</span>
                </a>
            `;
        }

        const timerEl = document.getElementById('shb-timer');

        function updateCountdown() {
            const curNow = new Date();
            const diff = next.dateObj - curNow;
            if (diff <= 0) {
                if (timerEl) timerEl.textContent = 'Подрубаем с минуты на минуту! 🔥';
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);

            let timerText = '';
            if (days > 0) {
                timerText = `${days} дн. ${hrs} ч. ${mins} мин. ${secs} сек.`;
            } else {
                timerText = `${hrs} ч. ${mins} мин. ${secs} сек.`;
            }
            if (timerEl) timerEl.textContent = timerText;
        }

        updateCountdown();
        setInterval(updateCountdown, 1000);
    } else if (activePeriod) {
        if (pill) {
            pill.className = 'shb-status-pill vacation';
            if (pillText) pillText.textContent = 'ОТПУСК 🌴';
        }
        if (title) title.textContent = activePeriod.text || 'Отпуск канала';
        if (center) {
            center.innerHTML = `
                <span>Отдыхаем до <strong>${formatNiceDate(activePeriod.endDate)}</strong> • Скоро увидимся на стримах!</span>
            `;
        }
        if (right) {
            right.innerHTML = `
                <a href="https://discord.gg/b8qjYMTJcf" target="_blank" rel="noopener" class="shb-btn shb-btn-schedule">👾 Наш Discord</a>
                <a href="https://t.me/yurummiyt" target="_blank" rel="noopener" class="shb-btn shb-btn-twitch">✈️ Telegram</a>
            `;
        }
    } else {
        // Запасной вариант если все даты в прошлом
        if (pill) {
            pill.className = 'shb-status-pill offline';
            if (pillText) pillText.textContent = 'ОФФЛАЙН';
        }
        if (title) title.textContent = 'Стримы по расписанию';
        if (center) {
            center.innerHTML = `<span>Анонсы каждого стрима публикуются в нашем <strong>Telegram</strong>!</span>`;
        }
        if (right) {
            right.innerHTML = `
                <a href="#schedule" class="shb-btn shb-btn-schedule">📅 Расписание</a>
                <a href="https://t.me/yurummiyt" target="_blank" rel="noopener" class="shb-btn shb-btn-twitch">✈️ Telegram</a>
            `;
        }
    }

    function formatNiceDate(val) {
        if (!val) return '';
        let d, m;
        if (val instanceof Date) {
            d = val.getDate();
            m = val.getMonth();
        } else {
            const parts = String(val).split('-');
            if (parts.length !== 3) return val;
            m = parseInt(parts[1], 10) - 1;
            d = parseInt(parts[2], 10);
        }
        const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
        return `${d} ${months[m] || ''}`;
    }
}

// ── Показ/скрытие ссылки на Медиа-Хаб ─────────────────────────
function checkMediaHubVisibility() {
    const navGames = document.getElementById('nav-games-link');
    if (!navGames) return;
    
    const isVisible = (typeof IS_MEDIA_HUB_ACTIVE !== 'undefined' && IS_MEDIA_HUB_ACTIVE) ||
        (typeof window !== 'undefined' && (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:' ||
            (window.location.search && window.location.search.includes('preview'))
        ));

    if (isVisible) {
        navGames.style.display = 'inline-block';
    } else {
        navGames.style.display = 'none';
    }
}

// ── Инициализация всех модулей ────────────────────────────────
function initAllEnhancements() {
    updateLiveStatusPills();
    initStreamHeroBanner();
    initScrollEnhancements();
    initCommandCopying();
    checkMediaHubVisibility();

    // Автоматическая проверка Twitch сразу и каждые 60 секунд
    checkTwitchLiveStatus();
    setInterval(checkTwitchLiveStatus, 60000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllEnhancements);
} else {
    initAllEnhancements();
}
