'use strict';

(function () {
    const DB = window.YurummiDB;

    const CATEGORY_META = {
        anime:   { icon: '🎌', label: 'Аниме' },
        film:    { icon: '🎬', label: 'Фильм' },
        series:  { icon: '📺', label: 'Сериал' },
        cartoon: { icon: '🎨', label: 'Мультик' },
        manga:   { icon: '📖', label: 'Манга' },
    };

    const MEDIA_BATCH = 42;
    const GAMES_BATCH = 36;

    const state = {
        zone: document.documentElement.dataset.zone || 'media',
        theme: document.documentElement.dataset.theme || 'yurummi',
        viewMode: 'grid',
        media: {
            tab: 'all',
            filter: 'all',
            genres: new Set(),
            genreMode: 'and',
            genreSearch: '',
            search: '',
            sort: 'rating-desc',
            visible: MEDIA_BATCH,
            filtered: [],
        },
        games: {
            filter: 'all',
            genres: new Set(),
            genreMode: 'and',
            genreSearch: '',
            search: '',
            sort: 'hours-desc',
            visible: GAMES_BATCH,
            filtered: [],
        },
    };

    let lastModalTrigger = null;
    let mediaObserver = null;
    let gamesObserver = null;

    function esc(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function lsGet(k, fallback) {
        try { return localStorage.getItem(k) || fallback; } catch { return fallback; }
    }
    function lsSet(k, v) {
        try { localStorage.setItem(k, v); } catch {}
    }

    // ── BOOTSTRAP ─────────────────────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', async () => {
        const savedView = lsGet('yurummi_v2_view', 'grid');
        if (savedView === 'list' || savedView === 'grid') state.viewMode = savedView;

        setupNavHeightObserver();
        setupThemeAndFooterControls();
        setupNavigationControls();
        setupMediaControls();
        setupGameControls();
        setupModals();
        setupInfiniteObservers();
        applyViewMode(state.viewMode, false);
        applyTheme(state.theme, false);

        await DB.init(state.zone);
        updateDbTelemetryBadge();
        populateStaticStatsAndWeekly();

        await switchZone(state.zone, false);

        // Фоновая догрузка остальных таблиц после первой отрисовки
        const preloadRest = async () => {
            try {
                await Promise.all([DB.ensureAllMedia(), DB.ensureGames()]);
                updateDbTelemetryBadge();
                populateStaticStatsAndWeekly();
            } catch (e) {
                console.warn('Preload error:', e);
            }
        };
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(() => preloadRest(), { timeout: 2500 });
        } else {
            setTimeout(preloadRest, 1200);
        }
    });

    // ── THEME PICKER & DB TELEMETRY ───────────────────────────────────────────
    function setupThemeAndFooterControls() {
        const themeSel = document.getElementById('theme-select');
        if (themeSel) {
            themeSel.value = state.theme;
            themeSel.addEventListener('change', (e) => applyTheme(e.target.value, true));
        }
        document.getElementById('btn-open-db-inspector')?.addEventListener('click', openDbModal);
    }

    function applyTheme(theme, save) {
        const valid = ['yurummi', 'velvet', 'slate', 'mono'].includes(theme) ? theme : 'yurummi';
        state.theme = valid;
        document.documentElement.dataset.theme = valid;
        if (save) lsSet('yurummi_v2_theme', valid);
        const themeSel = document.getElementById('theme-select');
        if (themeSel && themeSel.value !== valid) {
            themeSel.value = valid;
        }
    }

    function applyViewMode(mode, save) {
        state.viewMode = mode;
        if (save) lsSet('yurummi_v2_view', mode);
        document.querySelectorAll('[data-view-opt]').forEach(b => {
            b.classList.toggle('active', b.dataset.viewOpt === mode);
        });
        document.getElementById('media-grid')?.classList.toggle('is-list-view', mode === 'list');
        document.getElementById('games-grid')?.classList.toggle('is-list-view', mode === 'list');
    }

    function updateDbTelemetryBadge() {
        const el = document.getElementById('lab-db-summary');
        if (!el) return;
        const t = DB.getTelemetry();
        el.textContent = `${t.loadedCount}/${t.totalTables} табл. · ${t.totalMs} мс`;
    }

    // ── STATS, WEEKLY PICK, STEAM STRIP ───────────────────────────────────────
    function populateStaticStatsAndWeekly() {
        const stats = DB.getStats();
        if (stats) {
            const m = stats.media;
            const g = stats.games;
            setText('top-count-media', m.total);
            setText('top-count-games', g.total);

            renderMediaCategoryNav(m);
            renderGameFilterNav(g);
        }

        // Weekly Highlight (из db/tables/manifest.json)
        const { cfg, item } = DB.getWeeklyHighlight();
        const titleStr = item?.title || cfg.titleMatch || 'Топ Ган: Мэверик';
        const quoteStr = (item?.review || cfg.quote || '').trim();
        const catMeta = item ? CATEGORY_META[item.category] : CATEGORY_META.film;
        const metaParts = [];
        if (catMeta) metaParts.push(`${catMeta.icon} ${catMeta.label}`);
        if (item?.director) metaParts.push(item.director);

        setText('ws-title', titleStr);
        setText('ws-badge', `✦ ${cfg.badge || 'Рекомендация недели'}`);
        setText('ws-rating', `👑 ${item?.rating || 100}`);
        setText('ws-meta', metaParts.join(' · '));
        setText('ws-quote', quoteStr ? `«${quoteStr}»` : '');

        const wsImg = document.getElementById('ws-poster-img');
        const wsFb = document.getElementById('ws-poster-fallback');
        if (wsImg) {
            if (item?.poster) {
                wsImg.style.display = 'block';
                if (wsFb) wsFb.style.display = 'none';
                wsImg.onerror = () => {
                    wsImg.style.display = 'none';
                    if (wsFb) wsFb.style.display = 'inline';
                };
                wsImg.src = item.poster;
                wsImg.alt = titleStr;
            } else if (!wsImg.getAttribute('src')) {
                wsImg.style.display = 'none';
                if (wsFb) wsFb.style.display = 'inline';
            }
        }

        const openWeekly = async () => {
            if (item) {
                openMediaModal(item);
                return;
            }
            await DB.ensureCoreMedia();
            updateDbTelemetryBadge();
            const hl = DB.getWeeklyHighlight();
            if (hl.item) openMediaModal(hl.item);
        };

        const wsCard = document.getElementById('weekly-spotlight');
        if (wsCard) {
            wsCard.onclick = openWeekly;
            wsCard.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openWeekly();
                }
            };
        }

        // Dynamic Steam strip stats (no hardcoded counts)
        const steamStripStats = document.getElementById('steam-strip-stats');
        if (steamStripStats && stats?.games) {
            const gStats = stats.games;
            const top1 = DB.gamesBuilt ? DB.getTopLegends(1)[0] : null;
            const mc = DB.gamesBuilt ? DB.gamesMerged.find(x => (x.title || '').toLowerCase() === 'minecraft') : null;
            const parts = [
                `<span>🎮 ${gStats.total} игр</span>`,
                `<span>· 🏆 ${gStats.perfect} идеальных</span>`,
            ];
            if (top1) {
                parts.push(`<span>· 🔥 ${esc(formatGameHours(top1))} в ${esc(top1.title)}</span>`);
            }
            if (mc && mc !== top1) {
                parts.push(`<span>· ⛏️ ${esc(formatGameHours(mc))} в ${esc(mc.title)}</span>`);
            }
            steamStripStats.innerHTML = parts.join('');
        }
    }

    function setText(id, val) {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.textContent = val;
    }

    function setupNavHeightObserver() {
        const navEl = document.querySelector('nav');
        if (!navEl) return;
        const update = () => {
            const h = Math.round(navEl.getBoundingClientRect().height);
            if (h > 0) document.documentElement.style.setProperty('--nav-h', `${h}px`);
        };
        update();
        if ('ResizeObserver' in window) {
            new ResizeObserver(update).observe(navEl);
        } else {
            window.addEventListener('resize', update);
        }
    }

    // ── NAVIGATION / ZONES ────────────────────────────────────────────────────
    function setupNavigationControls() {
        document.querySelectorAll('[data-zone-btn]').forEach(btn => {
            btn.addEventListener('click', () => switchZone(btn.dataset.zoneBtn, true));
        });

        document.querySelectorAll('[data-view-opt]').forEach(btn => {
            btn.addEventListener('click', () => applyViewMode(btn.dataset.viewOpt, true));
        });

        // Browser back/forward hash sync
        window.addEventListener('hashchange', () => {
            const h = (window.location.hash || '').replace('#', '').toLowerCase();
            const target = (h === 'games' || h === 'steam') ? 'games' : 'media';
            if (target !== state.zone) switchZone(target, false);
        });
    }

    async function switchZone(zone, updateHash = true) {
        state.zone = zone;
        document.documentElement.dataset.zone = zone;
        lsSet('yurummi_v2_zone', zone);

        if (updateHash && window.history?.replaceState) {
            const hash = zone === 'games' ? '#games' : '#media';
            if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
        }

        document.querySelectorAll('[data-zone-btn]').forEach(b => {
            const active = b.dataset.zoneBtn === zone;
            b.classList.toggle('active', active);
            if (b.getAttribute('role') === 'tab') b.setAttribute('aria-selected', String(active));
        });

        const secMedia = document.getElementById('section-media');
        const secGames = document.getElementById('section-games');

        if (zone === 'games') {
            await DB.ensureGames();
            updateDbTelemetryBadge();
            populateStaticStatsAndWeekly();

            secMedia.style.display = 'none';
            secGames.style.display = 'block';

            renderGamesGenreCloud();
            renderGames();
        } else {
            await DB.ensureCoreMedia();
            updateDbTelemetryBadge();
            populateStaticStatsAndWeekly();

            secMedia.style.display = 'block';
            secGames.style.display = 'none';

            renderMediaGenreCloud();
            renderMedia();
        }
    }

    // ── MEDIA CATEGORY & FILTER NAVIGATION ────────────────────────────────────
    function getMediaTabDefs(mStats) {
        return [
            { id: 'all',     label: '🗂️ Всё',          count: mStats.activeTotal },
            { id: 'anime',   label: '🎌 Аниме',        count: mStats.anime },
            { id: 'film',    label: '🎬 Фильмы',       count: mStats.films },
            { id: 'shelf',   label: '🍿 Хочу глянуть', count: mStats.shelf },
            { id: 'marvel',  label: '🦸‍♂️ Marvel',      count: mStats.marvel },
            { id: 'dc',      label: '🦇 DC',           count: mStats.dc },
            { id: 'series',  label: '📺 Сериалы',      count: mStats.series },
            { id: 'cartoon', label: '🎨 Мультики',     count: mStats.cartoons },
            { id: 'manga',   label: '📖 Манга',        count: mStats.manga },
        ];
    }

    const MEDIA_FILTER_DEFS = [
        { id: 'all',         label: 'Все' },
        { id: 'masterpiece', label: '👑 Шедевры 100+' },
        { id: 'ongoing',     label: '🔥 Онгоинги / Смотрю' },
        { id: 'exceeded',    label: '🚀 Выше ожиданий' },
        { id: 'solid',       label: '⭐ База (10)' },
        { id: 'reviews',     label: '💬 С отзывами' },
        { id: 'watched',     label: '✅ Просмотрено' },
        { id: 'watching',    label: '▶️ Смотрю' },
        { id: 'planned',     label: '📋 В планах' },
    ];

    function renderMediaCategoryNav(mStats) {
        const defs = getMediaTabDefs(mStats);
        const strip = document.getElementById('media-category-strip');
        if (strip) {
            strip.innerHTML = defs.map(d => `
                <button type="button" class="cat-tab ${state.media.tab === d.id ? 'active' : ''}" data-media-tab="${d.id}" role="tab">
                    <span>${d.label}</span>
                    <span class="cat-tab-count">${d.count}</span>
                </button>`).join('');
            strip.querySelectorAll('[data-media-tab]').forEach(b => {
                b.addEventListener('click', () => selectMediaTab(b.dataset.mediaTab));
            });
        }
    }

    async function selectMediaTab(tabId) {
        const prev = state.media.tab;
        state.media.tab = tabId;
        state.media.visible = MEDIA_BATCH;

        if (tabId === 'shelf') {
            await DB.ensureShelf();
            updateDbTelemetryBadge();
        }

        // Авто-переключение на хронологию для Marvel/DC
        const sortEl = document.getElementById('media-sort-select');
        if (tabId === 'marvel' || tabId === 'dc') {
            state.media.sort = 'chrono';
            if (sortEl) sortEl.value = 'chrono';
        } else if ((prev === 'marvel' || prev === 'dc') && state.media.sort === 'chrono') {
            state.media.sort = 'rating-desc';
            if (sortEl) sortEl.value = 'rating-desc';
        }

        document.querySelectorAll('[data-media-tab]').forEach(b => {
            b.classList.toggle('active', b.dataset.mediaTab === tabId);
        });

        renderMediaGenreCloud();
        renderMedia();
    }

    async function selectMediaFilter(filterId) {
        state.media.filter = filterId;
        state.media.visible = MEDIA_BATCH;

        if (filterId === 'planned') {
            await DB.ensureAllMedia();
            updateDbTelemetryBadge();
        }

        const sel = document.getElementById('media-filter-select');
        if (sel) sel.value = filterId;
        document.querySelectorAll('[data-media-filter]').forEach(b => {
            b.classList.toggle('active', b.dataset.mediaFilter === filterId);
        });
        renderMedia();
    }

    function setupMediaControls() {
        const searchInput = document.getElementById('media-search-input');
        const clearBtn = document.getElementById('media-search-clear');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                state.media.search = searchInput.value;
                state.media.visible = MEDIA_BATCH;
                if (clearBtn) clearBtn.hidden = !searchInput.value;
                renderMedia();
            });
        }
        clearBtn?.addEventListener('click', () => {
            searchInput.value = '';
            state.media.search = '';
            clearBtn.hidden = true;
            state.media.visible = MEDIA_BATCH;
            renderMedia();
        });

        document.getElementById('media-filter-select')?.addEventListener('change', (e) => {
            selectMediaFilter(e.target.value);
        });

        document.getElementById('media-sort-select')?.addEventListener('change', (e) => {
            state.media.sort = e.target.value;
            renderMedia();
        });

        // Genre drawer toggle
        const gBtn = document.getElementById('btn-media-genres-toggle');
        const gDrawer = document.getElementById('media-genre-drawer');
        gBtn?.addEventListener('click', () => {
            const willOpen = gDrawer.hidden;
            gDrawer.hidden = !willOpen;
            gBtn.setAttribute('aria-expanded', String(willOpen));
        });

        document.getElementById('media-genre-search')?.addEventListener('input', e => {
            state.media.genreSearch = e.target.value.trim().toLowerCase();
            renderMediaGenreCloud();
        });

        document.querySelectorAll('[data-media-gmode]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.media.genreMode = btn.dataset.mediaGmode;
                document.querySelectorAll('[data-media-gmode]').forEach(b => {
                    b.classList.toggle('active', b.dataset.mediaGmode === state.media.genreMode);
                });
                state.media.visible = MEDIA_BATCH;
                renderMedia();
            });
        });

        document.getElementById('btn-media-genre-reset')?.addEventListener('click', () => {
            state.media.genres.clear();
            state.media.visible = MEDIA_BATCH;
            renderMediaGenreCloud();
            renderMedia();
        });

        document.getElementById('btn-media-random')?.addEventListener('click', () => {
            const pool = state.media.filtered.length ? state.media.filtered : DB.queryMedia({ tab: state.media.tab });
            if (!pool.length) return;
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick) openMediaModal(pick, true);
        });
    }

    function toggleMediaGenre(g, forceAdd = false) {
        if (!g) return;
        if (forceAdd) state.media.genres.add(g);
        else if (state.media.genres.has(g)) state.media.genres.delete(g);
        else state.media.genres.add(g);
        state.media.visible = MEDIA_BATCH;
        renderMediaGenreCloud();
        renderMedia();
    }

    function renderMediaGenreCloud() {
        const list = DB.getMediaGenres(state.media.tab);
        const filtered = state.media.genreSearch
            ? list.filter(x => x.name.toLowerCase().includes(state.media.genreSearch))
            : list;

        const html = filtered.length
            ? filtered.map(g => {
                const act = state.media.genres.has(g.name);
                return `<button type="button" class="gchip ${act ? 'active' : ''}" data-mg="${esc(g.name)}">${esc(g.name)} <span class="gchip-cnt">${g.count}</span></button>`;
            }).join('')
            : `<span class="results-text">Жанр не найден</span>`;

        const el = document.getElementById('media-genre-cloud');
        if (el) {
            el.innerHTML = html;
            el.querySelectorAll('[data-mg]').forEach(chip => {
                chip.addEventListener('click', () => toggleMediaGenre(chip.dataset.mg));
            });
        }

        const cnt = state.media.genres.size;
        const badge = document.getElementById('media-genre-badge');
        const resetBtn = document.getElementById('btn-media-genre-reset');
        if (badge) {
            badge.hidden = cnt === 0;
            badge.textContent = cnt;
        }
        if (resetBtn) resetBtn.hidden = cnt === 0;
    }

    // ── RENDER MEDIA GRID ─────────────────────────────────────────────────────
    function renderMedia() {
        const grid = document.getElementById('media-grid');
        const countEl = document.getElementById('media-results-count');
        const chipsEl = document.getElementById('media-active-chips');
        const moreEl = document.getElementById('media-load-more');
        if (!grid) return;

        const items = DB.queryMedia({
            tab: state.media.tab,
            filter: state.media.filter,
            genres: state.media.genres,
            genreMode: state.media.genreMode,
            search: state.media.search,
            sort: state.media.sort,
        });
        state.media.filtered = items;

        const shownCount = Math.min(state.media.visible, items.length);
        if (countEl) {
            countEl.innerHTML = `Показано <strong>${shownCount}</strong> из <strong>${items.length}</strong>`;
        }

        // Active filter chips bar
        if (chipsEl) {
            const chips = [];
            if (state.media.filter !== 'all') {
                const fDef = MEDIA_FILTER_DEFS.find(f => f.id === state.media.filter);
                chips.push(`<button type="button" class="achip" data-clear-mfilter>${esc(fDef?.label || state.media.filter)} ✕</button>`);
            }
            if (state.media.search.trim()) {
                chips.push(`<button type="button" class="achip" data-clear-msearch>«${esc(state.media.search.trim())}» ✕</button>`);
            }
            for (const g of state.media.genres) {
                chips.push(`<button type="button" class="achip" data-remove-mg="${esc(g)}">🎭 ${esc(g)} ✕</button>`);
            }
            if (chips.length > 1) {
                chips.push(`<button type="button" class="achip-clear-all" data-clear-mall>Сбросить всё</button>`);
            }
            chipsEl.innerHTML = chips.join('');
            chipsEl.querySelector('[data-clear-mfilter]')?.addEventListener('click', () => selectMediaFilter('all'));
            chipsEl.querySelector('[data-clear-msearch]')?.addEventListener('click', () => {
                const inp = document.getElementById('media-search-input');
                if (inp) inp.value = '';
                document.getElementById('media-search-clear').hidden = true;
                state.media.search = '';
                renderMedia();
            });
            chipsEl.querySelectorAll('[data-remove-mg]').forEach(b => {
                b.addEventListener('click', () => toggleMediaGenre(b.dataset.removeMg));
            });
            chipsEl.querySelector('[data-clear-mall]')?.addEventListener('click', () => {
                state.media.filter = 'all';
                state.media.genres.clear();
                state.media.search = '';
                const inp = document.getElementById('media-search-input');
                if (inp) inp.value = '';
                const clr = document.getElementById('media-search-clear');
                if (clr) clr.hidden = true;
                const fsel = document.getElementById('media-filter-select');
                if (fsel) fsel.value = 'all';
                document.querySelectorAll('[data-media-filter]').forEach(b => b.classList.toggle('active', b.dataset.mediaFilter === 'all'));
                renderMediaGenreCloud();
                renderMedia();
            });
        }

        if (items.length === 0) {
            let extraHint = '';
            if (state.media.tab === 'all' && state.media.search.trim()) {
                const shelfMatches = DB.rawTables.has('media_shelf')
                    ? DB.queryMedia({ tab: 'shelf', search: state.media.search })
                    : [];
                if (shelfMatches.length > 0) {
                    extraHint = `<button type="button" class="empty-box-btn" id="btn-jump-shelf-search">Найдено в «Хочу глянуть»: ${shelfMatches.length} — перейти</button>`;
                } else if (!DB.rawTables.has('media_shelf')) {
                    DB.ensureShelf().then(() => {
                        updateDbTelemetryBadge();
                        if (state.zone === 'media' && state.media.tab === 'all' && state.media.search.trim() && state.media.filtered.length === 0) {
                            renderMedia();
                        }
                    });
                }
            }
            grid.innerHTML = `<div class="empty-box"><p>Ничего не найдено. Попробуйте изменить запрос или сбросить фильтры.</p>${extraHint}</div>`;
            document.getElementById('btn-jump-shelf-search')?.addEventListener('click', () => selectMediaTab('shelf'));
            if (moreEl) moreEl.innerHTML = '';
            return;
        }

        const visibleItems = items.slice(0, state.media.visible);
        grid.innerHTML = visibleItems.map((it, idx) => renderMediaCard(it, idx)).join('');

        grid.querySelectorAll('.v2-media-card').forEach(card => {
            card.addEventListener('click', () => {
                const it = visibleItems[Number(card.dataset.idx)];
                if (it) openMediaModal(it);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const it = visibleItems[Number(card.dataset.idx)];
                    if (it) openMediaModal(it);
                }
            });
        });

        grid.querySelectorAll('[data-card-dir]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                filterMediaByDirector(btn.dataset.cardDir);
            });
        });

        grid.querySelectorAll('[data-card-mg]').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMediaGenre(pill.dataset.cardMg);
            });
        });

        if (moreEl) {
            if (shownCount < items.length) {
                moreEl.innerHTML = `<button type="button" class="btn-load-more" id="btn-more-media">Показать ещё (${items.length - shownCount} осталось)</button>`;
                document.getElementById('btn-more-media').onclick = () => {
                    state.media.visible += MEDIA_BATCH;
                    renderMedia();
                };
            } else {
                moreEl.innerHTML = '';
            }
        }
    }

    function formatRatingPill(item) {
        if (item.status === 'dropped') return `<span class="v2-rate-pill rate-status">🛑 Брошено</span>`;
        if (item.status === 'watching') return `<span class="v2-rate-pill rate-watching">▶️ Смотрю</span>`;
        if (item.status === 'planned') {
            const upcoming = Boolean(item.universeOrder && /\d{4}/.test(item.universeOrder));
            return upcoming
                ? `<span class="v2-rate-pill rate-status">⏳ Скоро</span>`
                : `<span class="v2-rate-pill rate-status">📋 В планах</span>`;
        }
        const r = item.rating;
        if (r === null || r === undefined) return `<span class="v2-rate-pill rate-status">✅ Просмотрено</span>`;
        if (r >= 100) return `<span class="v2-rate-pill rate-masterpiece">👑 ${r}</span>`;
        if (r >= 20) return `<span class="v2-rate-pill rate-exceeded">🚀 ${r}</span>`;
        if (r > 10) return `<span class="v2-rate-pill rate-exceeded">✨ ${r}</span>`;
        if (r === 10) return `<span class="v2-rate-pill rate-solid">⭐ 10</span>`;
        return `<span class="v2-rate-pill rate-good">${r}/10</span>`;
    }

    function renderMediaCard(item, idx) {
        const meta = CATEGORY_META[item.category] || { icon: '📄', label: item.category };
        const isMaster = item.tier === 'masterpiece' || (item.rating !== null && item.rating >= 100);
        const fr = DB.getFranchise(item);

        let epBadge = '';
        if (item.category === 'film' && fr && fr.totalSeasons > 1) {
            epBadge = `<span class="vmc-ep-pill is-franchise" title="Часть ${fr.currentIndex} из ${fr.totalSeasons}">${fr.currentIndex}/${fr.totalSeasons}</span>`;
        } else if (item.category === 'anime') {
            if (fr && fr.totalSeasons > 1) {
                epBadge = `<span class="vmc-ep-pill is-franchise" title="В сезоне ${item.episodes || '?'} сер. / Всего ${fr.totalEpisodes}">${item.episodes || '?'} / ${fr.totalEpisodes} сер.</span>`;
            } else if (item.kind === 'movie' || (item.episodes === 1 && /фильм|movie/i.test(item.title))) {
                epBadge = `<span class="vmc-ep-pill">Фильм</span>`;
            } else if (item.episodes) {
                epBadge = `<span class="vmc-ep-pill">${item.episodes} сер.</span>`;
            }
        } else if ((item.category === 'series' || item.category === 'cartoon') && fr && fr.totalSeasons > 1) {
            epBadge = `<span class="vmc-ep-pill is-franchise">${fr.currentIndex}/${fr.totalSeasons}</span>`;
        }

        const dirHtml = item.director
            ? `<span>·</span><button type="button" class="vmc-dir-btn" data-card-dir="${esc(item.director)}" title="Найти все работы: ${esc(item.director)}">${esc(item.director)}</button>`
            : '';

        const uniHtml = item.universeOrder
            ? `<span>· ${esc(item.universeOrder)}</span>`
            : '';

        const hasReview = Boolean(item.review && item.review.trim());
        const reviewHtml = hasReview
            ? `<div class="vmc-review-line" title="${esc(item.review)}">💬 ${esc(item.review)}</div>`
            : '';

        const hasDesc = Boolean(item.desc && item.desc.trim());
        const descHtml = hasDesc
            ? `<div class="vmc-desc-line ${hasReview ? 'vmc-desc-list-only' : ''}">${esc(item.desc)}</div>`
            : '';

        const genres = Array.isArray(item.genres) ? item.genres.slice(0, 4) : [];
        const genreHtml = genres.map((g, gi) =>
            `<button type="button" class="mini-pill ${gi >= 2 ? 'is-extra-genre' : ''} ${state.media.genres.has(g) ? 'active' : ''}" data-card-mg="${esc(g)}">${esc(g)}</button>`
        ).join('');

        const posterHtml = item.poster
            ? `<img src="${esc(item.poster)}" alt="${esc(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline';"><span class="vmc-placeholder" style="display:none">${meta.icon}</span>`
            : `<span class="vmc-placeholder">${meta.icon}</span>`;

        const statusLabels = {
            watched: '✅ Просмотрено',
            watching: '▶️ Смотрю',
            planned: '📋 В планах',
            dropped: '🛑 Брошено',
        };
        const isRatingStatusOnly = (item.status === 'dropped' || item.status === 'watching' || item.status === 'planned' || item.rating === null || item.rating === undefined);
        const asideSub = isRatingStatusOnly
            ? (fr && fr.totalSeasons > 1 ? `${fr.totalSeasons} ч. в серии` : '')
            : (statusLabels[item.status] || '');

        return `
            <article class="v2-media-card ${isMaster ? 'is-masterpiece' : ''}" data-idx="${idx}" tabindex="0" role="button">
                <div class="vmc-poster">${posterHtml}</div>
                <div class="vmc-main">
                    <div class="vmc-top">
                        <div class="vmc-meta-left">
                            <span>${meta.icon} ${meta.label}</span>
                            ${uniHtml}
                            ${dirHtml}
                        </div>
                        ${epBadge}
                    </div>
                    <h3 class="vmc-title" title="${esc(item.title)}">${esc(item.title)}</h3>
                    ${reviewHtml}
                    ${descHtml}
                    ${genres.length ? `<div class="vmc-genres">${genreHtml}</div>` : ''}
                </div>
                <div class="vmc-aside">
                    <div class="vmc-aside-rate">${formatRatingPill(item)}</div>
                    <div class="vmc-aside-meta">
                        ${asideSub ? `<span class="vmc-aside-status">${asideSub}</span>` : ''}
                        <span class="vmc-open-hint">Подробнее →</span>
                    </div>
                </div>
            </article>`;
    }

    function filterMediaByDirector(name) {
        const inp = document.getElementById('media-search-input');
        const clear = document.getElementById('media-search-clear');
        if (inp) inp.value = name;
        if (clear) clear.hidden = false;
        state.media.search = name;
        state.media.visible = MEDIA_BATCH;
        renderMedia();
        document.getElementById('media-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ── GAMES CATEGORY & CONTROLS ─────────────────────────────────────────────
    function getGameFilterDefs(gStats) {
        return [
            { id: 'all',       label: '🎮 Все игры',          count: gStats.total },
            { id: 'perfect',   label: '🏆 100% Идеальные',    count: gStats.perfect },
            { id: 'non-steam', label: '⭐ Вне Steam / EGS',   count: gStats.nonSteam },
            { id: 'hours',     label: '🔥 10+ часов',         count: gStats.hours10 ?? (DB.gamesBuilt ? DB._filterGamesByCategory(DB.gamesMerged, 'hours').length : undefined) },
            { id: 'reviewed',  label: '💬 С отзывами',        count: gStats.reviewed },
            { id: 'games-only',label: '🕹️ Только игры',       count: gStats.total - gStats.software },
            { id: 'software',  label: '🛠️ Софт и утилиты',   count: gStats.software },
        ];
    }

    function renderGameFilterNav(gStats) {
        const defs = getGameFilterDefs(gStats);
        const strip = document.getElementById('games-filter-strip');
        if (strip) {
            strip.innerHTML = defs.map(d => `
                <button type="button" class="cat-tab ${state.games.filter === d.id ? 'active' : ''}" data-game-filter="${d.id}" role="tab">
                    <span>${d.label}</span>
                    ${d.count !== undefined ? `<span class="cat-tab-count">${d.count}</span>` : ''}
                </button>`).join('');
            strip.querySelectorAll('[data-game-filter]').forEach(b => {
                b.addEventListener('click', () => selectGameFilter(b.dataset.gameFilter));
            });
        }
    }

    function selectGameFilter(filterId) {
        state.games.filter = filterId;
        state.games.visible = GAMES_BATCH;
        document.querySelectorAll('[data-game-filter]').forEach(b => {
            b.classList.toggle('active', b.dataset.gameFilter === filterId);
        });
        renderGamesGenreCloud();
        renderGames();
    }

    function setupGameControls() {
        const searchInput = document.getElementById('games-search-input');
        const clearBtn = document.getElementById('games-search-clear');
        searchInput?.addEventListener('input', () => {
            state.games.search = searchInput.value;
            state.games.visible = GAMES_BATCH;
            if (clearBtn) clearBtn.hidden = !searchInput.value;
            renderGames();
        });
        clearBtn?.addEventListener('click', () => {
            searchInput.value = '';
            state.games.search = '';
            clearBtn.hidden = true;
            state.games.visible = GAMES_BATCH;
            renderGames();
        });

        document.getElementById('games-sort-select')?.addEventListener('change', (e) => {
            state.games.sort = e.target.value;
            renderGames();
        });

        const gBtn = document.getElementById('btn-games-genres-toggle');
        const gDrawer = document.getElementById('games-genre-drawer');
        gBtn?.addEventListener('click', () => {
            const willOpen = gDrawer.hidden;
            gDrawer.hidden = !willOpen;
            gBtn.setAttribute('aria-expanded', String(willOpen));
        });

        document.getElementById('games-genre-search')?.addEventListener('input', e => {
            state.games.genreSearch = e.target.value.trim().toLowerCase();
            renderGamesGenreCloud();
        });

        document.querySelectorAll('[data-game-gmode]').forEach(btn => {
            btn.addEventListener('click', () => {
                state.games.genreMode = btn.dataset.gameGmode;
                document.querySelectorAll('[data-game-gmode]').forEach(b => {
                    b.classList.toggle('active', b.dataset.gameGmode === state.games.genreMode);
                });
                state.games.visible = GAMES_BATCH;
                renderGames();
            });
        });

        document.getElementById('btn-games-genre-reset')?.addEventListener('click', () => {
            state.games.genres.clear();
            state.games.visible = GAMES_BATCH;
            renderGamesGenreCloud();
            renderGames();
        });

        const randomGame = () => {
            const pool = state.games.filtered.length ? state.games.filtered : DB.gamesMerged;
            if (!pool.length) return;
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (pick) openSteamModal(pick, true);
        };
        document.getElementById('btn-games-random')?.addEventListener('click', randomGame);
    }

    function toggleGameGenre(g) {
        if (!g) return;
        if (state.games.genres.has(g)) state.games.genres.delete(g);
        else state.games.genres.add(g);
        state.games.visible = GAMES_BATCH;
        renderGamesGenreCloud();
        renderGames();
    }

    function renderGamesGenreCloud() {
        const list = DB.getGameGenres(state.games.filter);
        const filtered = state.games.genreSearch
            ? list.filter(x => x.name.toLowerCase().includes(state.games.genreSearch))
            : list;

        const html = filtered.length
            ? filtered.map(g => {
                const act = state.games.genres.has(g.name);
                return `<button type="button" class="gchip ${act ? 'active' : ''}" data-gg="${esc(g.name)}">${esc(g.name)} <span class="gchip-cnt">${g.count}</span></button>`;
            }).join('')
            : `<span class="results-text">Жанр не найден</span>`;

        const el = document.getElementById('games-genre-cloud');
        if (el) {
            el.innerHTML = html;
            el.querySelectorAll('[data-gg]').forEach(chip => {
                chip.addEventListener('click', () => toggleGameGenre(chip.dataset.gg));
            });
        }

        const cnt = state.games.genres.size;
        const badge = document.getElementById('games-genre-badge');
        const resetBtn = document.getElementById('btn-games-genre-reset');
        if (badge) {
            badge.hidden = cnt === 0;
            badge.textContent = cnt;
        }
        if (resetBtn) resetBtn.hidden = cnt === 0;
    }

    // ── RENDER GAMES GRID ─────────────────────────────────────────────────────
    function formatGameHours(g) {
        if (g.hoursDisplay) return g.hoursDisplay;
        if (g.minutes > 0 && g.minutes < 120) return `${g.minutes} мин.`;
        if (g.hours >= 1000) return `${g.hours.toLocaleString('ru-RU')} ч.`;
        return `${String(g.hours).replace('.', ',')} ч.`;
    }

    function renderGames() {
        const grid = document.getElementById('games-grid');
        const countEl = document.getElementById('games-results-count');
        const chipsEl = document.getElementById('games-active-chips');
        const moreEl = document.getElementById('games-load-more');
        if (!grid) return;

        const games = DB.queryGames({
            filter: state.games.filter,
            genres: state.games.genres,
            genreMode: state.games.genreMode,
            search: state.games.search,
            sort: state.games.sort,
        });
        state.games.filtered = games;

        const shownCount = Math.min(state.games.visible, games.length);
        if (countEl) {
            countEl.innerHTML = `Показано <strong>${shownCount}</strong> из <strong>${games.length}</strong> игр`;
        }

        if (chipsEl) {
            const chips = [];
            if (state.games.search.trim()) {
                chips.push(`<button type="button" class="achip" data-clear-gsearch>«${esc(state.games.search.trim())}» ✕</button>`);
            }
            for (const g of state.games.genres) {
                chips.push(`<button type="button" class="achip" data-remove-gg="${esc(g)}">🎮 ${esc(g)} ✕</button>`);
            }
            if (chips.length > 1) {
                chips.push(`<button type="button" class="achip-clear-all" data-clear-gall>Сбросить всё</button>`);
            }
            chipsEl.innerHTML = chips.join('');
            chipsEl.querySelector('[data-clear-gsearch]')?.addEventListener('click', () => {
                const inp = document.getElementById('games-search-input');
                if (inp) inp.value = '';
                document.getElementById('games-search-clear').hidden = true;
                state.games.search = '';
                renderGames();
            });
            chipsEl.querySelectorAll('[data-remove-gg]').forEach(b => {
                b.addEventListener('click', () => toggleGameGenre(b.dataset.removeGg));
            });
            chipsEl.querySelector('[data-clear-gall]')?.addEventListener('click', () => {
                state.games.genres.clear();
                state.games.search = '';
                const inp = document.getElementById('games-search-input');
                if (inp) inp.value = '';
                const clr = document.getElementById('games-search-clear');
                if (clr) clr.hidden = true;
                renderGamesGenreCloud();
                renderGames();
            });
        }

        if (games.length === 0) {
            grid.innerHTML = `<div class="empty-box"><p>Игры не найдены. Попробуйте сбросить фильтры.</p></div>`;
            if (moreEl) moreEl.innerHTML = '';
            return;
        }

        const visibleGames = games.slice(0, state.games.visible);
        grid.innerHTML = visibleGames.map((g, idx) => renderGameCard(g, idx)).join('');

        grid.querySelectorAll('.v2-game-card').forEach(card => {
            card.addEventListener('click', () => {
                const game = visibleGames[Number(card.dataset.gidx)];
                if (game) openSteamModal(game);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const game = visibleGames[Number(card.dataset.gidx)];
                    if (game) openSteamModal(game);
                }
            });
        });

        grid.querySelectorAll('[data-card-gg]').forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleGameGenre(pill.dataset.cardGg);
            });
        });

        grid.querySelectorAll('.vgc-ext-link').forEach(a => {
            a.addEventListener('click', e => e.stopPropagation());
        });

        if (moreEl) {
            if (shownCount < games.length) {
                moreEl.innerHTML = `<button type="button" class="btn-load-more" id="btn-more-games">Показать ещё (${games.length - shownCount} осталось)</button>`;
                document.getElementById('btn-more-games').onclick = () => {
                    state.games.visible += GAMES_BATCH;
                    renderGames();
                };
            } else {
                moreEl.innerHTML = '';
            }
        }
    }

    function renderGameCard(g, idx) {
        const hoursStr = formatGameHours(g);
        const hltb = DB.getHltb(g);
        const isNonSteam = g.platform && g.platform !== 'Steam';

        let trBadge = '';
        let statusTag = '';
        if (g.perfect) {
            trBadge = `<span class="vgc-corner-tr is-gold">🏆 100%</span>`;
            statusTag = `<span class="vgc-list-badge is-gold">🏆 100% Идеал</span>`;
        } else if (hltb && hltb.isTool) {
            trBadge = `<span class="vgc-corner-tr">🛠️ Софт</span>`;
            statusTag = `<span class="vgc-list-badge">🛠️ Софт / Утилита</span>`;
        } else if (isNonSteam) {
            trBadge = `<span class="vgc-corner-tr">${esc(g.platformBadge || g.platform)}</span>`;
            statusTag = `<span class="vgc-list-badge">${esc(g.platformBadge || g.platform)}</span>`;
        } else if (hltb && !hltb.isTool && hltb.label) {
            trBadge = `<span class="vgc-corner-tr">${esc(hltb.label)}</span>`;
            statusTag = `<span class="vgc-list-badge">${esc(hltb.label)}</span>`;
        }

        const coverSrc = g.header || g.cover || '';
        const fallbackSrc = (g.cover && g.cover !== coverSrc) ? g.cover : '';
        const coverImgHtml = coverSrc
            ? `<img src="${esc(coverSrc)}" data-fallback="${esc(fallbackSrc)}" alt="${esc(g.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="if(!this.dataset.tried&&this.dataset.fallback){this.dataset.tried='1';this.src=this.dataset.fallback;}else{this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';}">`
            : '';
        const coverFallbackHtml = `<div class="vgc-cover-fallback" style="display:${coverSrc ? 'none' : 'flex'}">🎮</div>`;

        const genres = Array.isArray(g.genres) ? g.genres.slice(0, 4) : [];
        const genresHtml = genres.map((gn, gi) =>
            `<button type="button" class="mini-pill ${gi >= 3 ? 'is-extra-genre' : ''} ${state.games.genres.has(gn) ? 'active' : ''}" data-card-gg="${esc(gn)}">${esc(gn)}</button>`
        ).join('');

        const achHtml = g.achTotal > 0 ? (() => {
            const pct = g.achPercent || 0;
            return `
                <div class="vgc-ach-row">
                    <div class="vgc-ach-meta">
                        <span>${g.perfect ? '🏆 Все ачивки' : 'Достижения'}</span>
                        <span>${g.achUnlocked}/${g.achTotal} (${pct}%)</span>
                    </div>
                    <div class="vgc-ach-track"><div class="vgc-ach-fill" style="width:${pct}%"></div></div>
                </div>`;
        })() : '';

        const hasReview = Boolean(g.reviewText && g.reviewText.trim());
        const reviewHtml = hasReview
            ? `<div class="vgc-snippet is-review ${g.achTotal > 0 ? 'show-list-only' : ''}">💬 «${esc(g.reviewText)}»</div>`
            : '';
        const descHtml = (g.desc && g.desc.trim())
            ? `<div class="vgc-snippet ${(g.achTotal > 0 || hasReview) ? 'show-list-only' : ''}">${esc(g.desc)}</div>`
            : '';

        const leftFooter = g.reviewText
            ? `💬 Отзыв Yurummi`
            : (hltb && !hltb.isTool && hltb.label ? esc(hltb.label) : (isNonSteam ? esc(g.platform) : 'Steam'));

        const storeText = isNonSteam ? 'Страница ↗' : 'Steam ↗';

        return `
            <article class="v2-game-card ${g.perfect ? 'is-perfect' : ''}" data-gidx="${idx}" tabindex="0" role="button">
                <div class="vgc-cover">
                    ${coverImgHtml}
                    ${coverFallbackHtml}
                    <span class="vgc-corner-tl">🔥 ${esc(hoursStr)}</span>
                    ${trBadge}
                </div>
                <div class="vgc-body">
                    <h3 class="vgc-title" title="${esc(g.title)}">${esc(g.title)}</h3>
                    ${genres.length ? `<div class="vgc-genres">${genresHtml}</div>` : ''}
                    ${achHtml}
                    ${reviewHtml}
                    ${descHtml}
                </div>
                <div class="vgc-footer">
                    <span class="vgc-footer-left">${leftFooter}</span>
                    <div class="vgc-list-stats">
                        <span class="vgc-list-hours">🔥 ${esc(hoursStr)}</span>
                        ${statusTag}
                    </div>
                    <a href="${esc(g.url)}" target="_blank" rel="noopener" class="vgc-ext-link">${storeText}</a>
                </div>
            </article>`;
    }

    // ── INFINITE INTERSECTION OBSERVER ────────────────────────────────────────
    function setupInfiniteObservers() {
        if (!('IntersectionObserver' in window)) return;
        const mSent = document.getElementById('media-sentinel');
        const gSent = document.getElementById('games-sentinel');

        mediaObserver = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && state.zone === 'media' && state.media.visible < state.media.filtered.length) {
                state.media.visible += MEDIA_BATCH;
                renderMedia();
            }
        }, { rootMargin: '300px' });
        if (mSent) mediaObserver.observe(mSent);

        gamesObserver = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && state.zone === 'games' && state.games.visible < state.games.filtered.length) {
                state.games.visible += GAMES_BATCH;
                renderGames();
            }
        }, { rootMargin: '300px' });
        if (gSent) gamesObserver.observe(gSent);
    }

    // ── MODALS ────────────────────────────────────────────────────────────────
    function setupModals() {
        const bindModal = (id, closeBtnId) => {
            const modal = document.getElementById(id);
            const closeBtn = document.getElementById(closeBtnId);
            if (!modal) return;
            closeBtn?.addEventListener('click', () => closeModalById(id));
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModalById(id);
            });
        };

        bindModal('media-modal', 'modal-close-btn');
        bindModal('steam-modal', 'steam-modal-close-btn');
        bindModal('legend-modal', 'legend-modal-close');
        bindModal('db-modal', 'db-modal-close');

        document.getElementById('btn-open-legend')?.addEventListener('click', openLegendModal);
        document.querySelectorAll('[data-open-legend]').forEach(b => b.addEventListener('click', openLegendModal));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ['media-modal', 'steam-modal', 'legend-modal', 'db-modal'].forEach(id => {
                    const m = document.getElementById(id);
                    if (m?.classList.contains('is-open')) closeModalById(id);
                });
            }
        });
    }

    function openModalById(id, focusCloseId) {
        lastModalTrigger = document.activeElement;
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.add('is-open');
        m.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        if (focusCloseId) document.getElementById(focusCloseId)?.focus({ preventScroll: true });
    }

    function closeModalById(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.remove('is-open');
        m.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
            lastModalTrigger.focus({ preventScroll: true });
        }
    }

    function openMediaModal(item, isRandom = false) {
        const meta = CATEGORY_META[item.category] || { icon: '📄', label: item.category };
        setText('modal-title', item.title);
        setText('modal-cat-tag', `${meta.icon} ${meta.label}`);

        const randPill = document.getElementById('modal-random-pill');
        if (randPill) randPill.style.display = isRandom ? 'inline-flex' : 'none';

        const subEl = document.getElementById('modal-subcat-tag');
        if (subEl) {
            if (item.subcat === 'marvel') { subEl.textContent = 'MARVEL'; subEl.style.display = 'inline-block'; }
            else if (item.subcat === 'dc') { subEl.textContent = 'DC'; subEl.style.display = 'inline-block'; }
            else subEl.style.display = 'none';
        }

        const uniEl = document.getElementById('modal-universe-tag');
        if (uniEl) {
            if (item.universeOrder) { uniEl.textContent = `⏳ ${item.universeOrder}`; uniEl.style.display = 'inline-block'; }
            else uniEl.style.display = 'none';
        }

        const dirEl = document.getElementById('modal-director-tag');
        if (dirEl) {
            if (item.director) {
                const icon = item.category === 'anime' ? '🎌' : '🎬';
                dirEl.textContent = `${icon} ${item.director}`;
                dirEl.style.display = 'inline-block';
                dirEl.onclick = () => {
                    closeModalById('media-modal');
                    filterMediaByDirector(item.director);
                };
            } else {
                dirEl.style.display = 'none';
            }
        }

        const stEl = document.getElementById('modal-status-tag');
        if (stEl) {
            const labels = { watched: '✅ Просмотрено', watching: '▶️ Смотрю', planned: '📋 В планах', dropped: '🛑 Брошено' };
            stEl.textContent = labels[item.status] || '📄 В списке';
        }

        const epEl = document.getElementById('modal-episodes-tag');
        if (epEl) {
            if (item.category === 'anime' && item.episodes) {
                epEl.textContent = item.kind === 'movie' ? '🎬 Фильм' : `📺 ${item.episodes} сер.`;
                epEl.style.display = 'inline-block';
            } else epEl.style.display = 'none';
        }

        // Rating box
        const rBox = document.getElementById('modal-rating-box');
        if (rBox) rBox.innerHTML = formatRatingPill(item);

        // Poster
        const pImg = document.getElementById('modal-poster-img');
        const pFb = document.getElementById('modal-poster-fallback');
        setText('modal-fallback-icon', meta.icon);
        if (item.poster) {
            pImg.src = item.poster;
            pImg.alt = item.title;
            pImg.style.display = 'block';
            pFb.style.display = 'none';
            pImg.onerror = () => { pImg.style.display = 'none'; pFb.style.display = 'flex'; };
        } else {
            pImg.style.display = 'none';
            pFb.style.display = 'flex';
        }

        // Genres
        const gRow = document.getElementById('modal-genres-row');
        if (gRow) {
            if (Array.isArray(item.genres) && item.genres.length) {
                gRow.innerHTML = item.genres.map(g =>
                    `<button type="button" class="mini-pill ${state.media.genres.has(g) ? 'active' : ''}" data-mmg="${esc(g)}">${esc(g)}</button>`
                ).join('');
                gRow.style.display = 'flex';
                gRow.querySelectorAll('[data-mmg]').forEach(b => {
                    b.addEventListener('click', () => {
                        closeModalById('media-modal');
                        toggleMediaGenre(b.dataset.mmg, true);
                    });
                });
            } else gRow.style.display = 'none';
        }

        // Franchise O(1) lookup
        const frBlock = document.getElementById('modal-franchise-block');
        const frInfo = DB.getFranchise(item);
        if (frBlock && frInfo && frInfo.totalSeasons > 1) {
            frBlock.style.display = 'block';
            setText('modal-franchise-title', `Франшиза «${frInfo.franchiseTitle || item.title}»`);
            setText('modal-franchise-stats', item.category === 'film'
                ? `Часть ${frInfo.currentIndex} из ${frInfo.totalSeasons}`
                : `${frInfo.totalSeasons} частей · ${frInfo.totalEpisodes} сер.`);
            const track = document.getElementById('modal-franchise-track');
            track.innerHTML = frInfo.items.map((s, idx) => {
                const isCur = s._uid === item._uid;
                const sub = item.category === 'film' ? `Часть ${s.franchiseOrder || idx + 1}` : (s.episodes ? `${s.episodes} сер.` : 'Часть');
                return `
                    <button type="button" class="v2-fr-card ${isCur ? 'is-current' : ''}" data-fr-uid="${esc(s._uid)}">
                        ${s.poster ? `<img src="${esc(s.poster)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">` : ''}
                        <div class="v2-fr-meta">
                            <div class="v2-fr-name">${esc(s.title)}</div>
                            <div class="v2-fr-sub">${esc(sub)}${s.rating ? ` · ${s.rating}` : ''}</div>
                        </div>
                    </button>`;
            }).join('');
            track.querySelectorAll('[data-fr-uid]').forEach(el => {
                el.addEventListener('click', () => {
                    const next = frInfo.items.find(x => x._uid === el.dataset.frUid);
                    if (next && next._uid !== item._uid) openMediaModal(next);
                });
            });
        } else if (frBlock) {
            frBlock.style.display = 'none';
        }

        // Review & Desc
        const revBlk = document.getElementById('modal-review-block');
        if (item.review && item.review.trim()) {
            setText('modal-review-text', `«${item.review}»`);
            revBlk.style.display = 'block';
        } else revBlk.style.display = 'none';

        setText('modal-desc-text', (item.desc && item.desc.trim()) ? item.desc : 'Описание пока не добавлено.');

        const ext = document.getElementById('modal-external-link');
        if (ext) {
            if (item.url) {
                ext.href = item.url;
                ext.textContent = item.url.includes('shikimori') ? '🔗 Открыть на Shikimori ↗' : (item.url.includes('tmdb') || item.url.includes('themoviedb') ? '🔗 Открыть на TMDb ↗' : '🔗 Открыть страницу ↗');
            } else {
                ext.href = (item.category === 'anime' || item.category === 'manga')
                    ? `https://shikimori.one/animes?search=${encodeURIComponent(item.title)}`
                    : `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(item.title)}`;
                ext.textContent = '🔎 Найти подробнее ↗';
            }
        }

        openModalById('media-modal', 'modal-close-btn');
    }

    function openSteamModal(game, isRandom = false) {
        const banner = document.getElementById('steam-modal-banner');
        const bannerUrl = game.header || game.cover || '';
        if (banner) banner.style.backgroundImage = bannerUrl ? `url("${bannerUrl.replace(/"/g, '%22')}")` : 'none';
        const cov = document.getElementById('steam-modal-cover');
        if (cov) {
            const primaryCov = game.cover || game.header || '';
            const secondaryCov = (game.header && game.header !== primaryCov) ? game.header : '';
            cov.style.display = primaryCov ? 'block' : 'none';
            cov.dataset.tried = '';
            cov.onerror = () => {
                if (!cov.dataset.tried && secondaryCov) {
                    cov.dataset.tried = '1';
                    cov.src = secondaryCov;
                } else {
                    cov.style.display = 'none';
                }
            };
            cov.src = primaryCov;
            cov.alt = game.title;
        }

        setText('steam-modal-title', game.title);
        setText('steam-modal-hours-badge', `🔥 ${formatGameHours(game)}`);
        const isNonSteam = game.platform && game.platform !== 'Steam';
        setText('steam-modal-appid-badge', isNonSteam ? (game.platformBadge || game.platform) : `App #${game.id}`);

        const randPill = document.getElementById('steam-modal-random-pill');
        if (randPill) randPill.style.display = isRandom ? 'inline-flex' : 'none';

        const perfEl = document.getElementById('steam-modal-perfect-badge');
        if (perfEl) perfEl.style.display = game.perfect ? 'inline-block' : 'none';

        const hltb = DB.getHltb(game);
        const hltbBadge = document.getElementById('steam-modal-hltb-badge');
        if (hltbBadge) {
            if (hltb && !hltb.isTool && hltb.label) {
                hltbBadge.textContent = hltb.label;
                hltbBadge.style.display = 'inline-block';
            } else hltbBadge.style.display = 'none';
        }

        const genresEl = document.getElementById('steam-modal-genres');
        if (genresEl) {
            genresEl.innerHTML = (game.genres || []).map(gn =>
                `<button type="button" class="mini-pill" data-smg="${esc(gn)}">${esc(gn)}</button>`
            ).join('');
            genresEl.querySelectorAll('[data-smg]').forEach(b => {
                b.addEventListener('click', () => {
                    closeModalById('steam-modal');
                    toggleGameGenre(b.dataset.smg);
                });
            });
        }

        // Achievements
        const achBlk = document.getElementById('steam-modal-ach-block');
        if (achBlk) {
            if (game.achTotal > 0) {
                achBlk.style.display = 'block';
                setText('steam-modal-ach-counts', `${game.achUnlocked} / ${game.achTotal} (${game.achPercent || 0}%)`);
                const bar = document.getElementById('steam-modal-ach-bar');
                if (bar) bar.style.width = `${game.achPercent || 0}%`;
            } else achBlk.style.display = 'none';
        }

        // Review
        const revBlk = document.getElementById('steam-modal-review-block');
        if (revBlk) {
            if (game.reviewText && game.reviewText.trim()) {
                revBlk.style.display = 'block';
                setText('steam-modal-review-text', `«${game.reviewText}»`);
            } else revBlk.style.display = 'none';
        }

        // HLTB block
        const hltbBlk = document.getElementById('steam-modal-hltb-block');
        if (hltbBlk) {
            if (hltb && !hltb.isTool && hltb.label) {
                hltbBlk.style.display = 'block';
                const link = document.getElementById('steam-modal-hltb-link');
                if (link) link.href = hltb.url;
                const cardsEl = document.getElementById('steam-modal-hltb-cards');
                if (hltb.type === 'multi' || hltb.type === 'endless' || (hltb.type === 'coop' && !hltb.main)) {
                    cardsEl.innerHTML = `<div class="v2-hltb-cell is-full"><span class="vhc-val">${esc(hltb.label)}</span><span class="vhc-lbl">${esc(hltb.note || 'Без фиксированного финала')}</span></div>`;
                } else {
                    cardsEl.innerHTML = `
                        <div class="v2-hltb-cell"><span class="vhc-val">${hltb.main ? `~${hltb.main} ч.` : '—'}</span><span class="vhc-lbl">${esc(hltb.mainLabel || 'Сюжет')}</span></div>
                        <div class="v2-hltb-cell"><span class="vhc-val">${hltb.extra ? `~${hltb.extra} ч.` : '—'}</span><span class="vhc-lbl">${esc(hltb.extraLabel || 'Сюжет + Допы')}</span></div>
                        <div class="v2-hltb-cell"><span class="vhc-val">${hltb.complete ? `~${hltb.complete} ч.` : '—'}</span><span class="vhc-lbl">${esc(hltb.compLabel || '100% Идеал')}</span></div>`;
                }
                const cmp = DB.formatHltbComparison(game, hltb);
                const cmpEl = document.getElementById('steam-modal-hltb-compare');
                const noteAlreadyShown = (hltb.type === 'multi' || hltb.type === 'endless' || (hltb.type === 'coop' && !hltb.main))
                    && hltb.note && cmp === hltb.note;
                if (cmp && !noteAlreadyShown && cmpEl) { cmpEl.textContent = cmp; cmpEl.style.display = 'block'; }
                else if (cmpEl) cmpEl.style.display = 'none';
            } else hltbBlk.style.display = 'none';
        }

        const descBlk = document.getElementById('steam-modal-desc-block');
        if (descBlk) {
            if (game.desc) { descBlk.style.display = 'block'; setText('steam-modal-desc-text', game.desc); }
            else descBlk.style.display = 'none';
        }

        const store = document.getElementById('steam-modal-store-link');
        if (store) {
            store.href = game.url || `https://store.steampowered.com/app/${game.id}`;
            store.textContent = isNonSteam ? 'Открыть страницу игры ↗' : 'Открыть в магазине Steam ↗';
        }

        openModalById('steam-modal', 'steam-modal-close-btn');
    }

    function openLegendModal() {
        const list = document.getElementById('legend-modal-list');
        if (list) {
            const rules = DB.getScaleLegend();
            list.innerHTML = rules.map(r => `
                <div class="v2-legend-row">
                    <div class="vlr-left"><span>${esc(r.icon)}</span><span>${esc(r.range)} — ${esc(r.label)}</span></div>
                    <div class="vlr-desc">${esc(r.desc)}</div>
                </div>`).join('');
        }
        openModalById('legend-modal', 'legend-modal-close');
    }

    function openDbModal() {
        const body = document.getElementById('db-inspector-body');
        if (body) {
            const t = DB.getTelemetry();
            const rows = t.loaded.map(r => `
                <tr>
                    <td><code>${esc(r.table)}</code></td>
                    <td>${r.count}</td>
                    <td>${esc(r.transport)}</td>
                    <td>${r.ms} мс</td>
                </tr>`).join('');
            const unloaded = t.unloaded.length
                ? `<p class="v2-sm-sub">Отложенные (подгрузятся только при открытии): ${t.unloaded.map(u => `<code>${esc(u)}</code>`).join(', ')}</p>`
                : `<p class="v2-sm-sub">Все таблицы загружены в память и проиндексированы (поиск за &lt;1 мс).</p>`;

            body.innerHTML = `
                <div class="db-summary-grid">
                    <div class="db-stat-box"><span>Транспорт</span><strong>${esc(t.transportMode)}</strong></div>
                    <div class="db-stat-box"><span>Таблиц в памяти</span><strong>${t.loadedCount} / ${t.totalTables}</strong></div>
                    <div class="db-stat-box"><span>Время чтения</span><strong>${t.totalMs} мс</strong></div>
                </div>
                ${unloaded}
                <table class="db-table-list">
                    <thead><tr><th>Таблица</th><th>Записей</th><th>Метод</th><th>Время</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
                <p class="v2-sm-sub">Редактировать данные удобно напрямую в <code>db/tables/*.json</code>, а для обновления оффлайн-чанков достаточно запустить <code>python scripts/build_db.py</code>.</p>`;
        }
        openModalById('db-modal', 'db-modal-close');
    }
})();
