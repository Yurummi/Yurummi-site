/**
 * calendar.js — Интерактивный календарь стримов.
 * Зависит от: data.js (STREAMS_LIST)
 *
 * changeMonth() глобальная — вызывается из onclick в HTML.
 */

// День месяца зафиксирован на 1, чтобы переключение месяцев было стабильным
// (иначе, например, 31 января + месяц = 3 марта из-за особенностей Date).
let _calendarDate = new Date();
_calendarDate.setDate(1);

const MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель',
    'Май', 'Июнь', 'Июль', 'Август',
    'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Иконки для дней рисования (меняются по номеру дня)
const ART_ICONS = ['🎨', '🖌️', '✏️', '🖍️', '✒️'];

// Органические формы для ячеек рисования
const ART_SHAPES = [
    '20% 80% 30% 70% / 60% 30% 70% 40%',
    '60% 40% 50% 50% / 40% 50% 50% 60%',
    '30% 70% 60% 40% / 50% 30% 70% 50%',
    '80% 20% 40% 60% / 60% 50% 50% 40%'
];

/**
 * Экранирует спецсимволы HTML, чтобы текст из data.js нельзя было
 * случайно (или намеренно) интерпретировать как разметку.
 */
function _escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Конвертирует время стрима из времени стримера (Германия, Europe/Berlin)
 * в точный объект Date (с учетом часового пояса зрителя).
 */
function _getStreamLocalDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    const timeClean = String(timeStr).replace(/[^\d:]/g, '').trim();
    if (!timeClean.includes(':')) return null;
    const [h, m] = timeClean.split(':').map(Number);

    try {
        const [y, mon, d] = dateStr.split('-').map(Number);
        const targetUtc = new Date(Date.UTC(y, mon - 1, d, h, m));

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

        const berlinOffsetMs = berlinUtc - targetUtc.getTime();
        const exactUtcMs = targetUtc.getTime() - berlinOffsetMs;
        return new Date(exactUtcMs);
    } catch (e) {
        return null;
    }
}

/**
 * Строит индексы событий на текущий рендер, чтобы не сканировать
 * весь STREAMS_LIST заново для каждого дня месяца.
 * Индексирует разовые события по ЛОКАЛЬНОЙ дате зрителя,
 * чтобы при переходе через полночь (+5ч и т.д.) стрим отображался
 * в правильной ячейке дня пользователя.
 */
function _indexEvents(list) {
    const byDate = Object.create(null);
    const periods = [];

    for (let i = 0; i < list.length; i++) {
        const event = list[i];
        if (event.startDate) {
            periods.push(event);
        } else if (event.date) {
            let localDateStr = event.date;
            let localTimeStr = event.time || '';
            let isShiftedDay = false;
            let dayShift = 0;

            if (event.time) {
                const exactDate = _getStreamLocalDateTime(event.date, event.time);
                if (exactDate) {
                    const y = exactDate.getFullYear();
                    const m = exactDate.getMonth() + 1;
                    const d = exactDate.getDate();
                    localDateStr = _dateStr(y, m, d);

                    const userH = String(exactDate.getHours()).padStart(2, '0');
                    const userM = String(exactDate.getMinutes()).padStart(2, '0');
                    const prefix = event.time.includes('±') ? '±' : '';
                    localTimeStr = prefix + `${userH}:${userM}`;

                    if (localDateStr !== event.date) {
                        isShiftedDay = true;
                        const origDateObj = new Date(event.date + 'T12:00:00Z');
                        const localDateObj = new Date(localDateStr + 'T12:00:00Z');
                        dayShift = Math.round((localDateObj - origDateObj) / (1000 * 60 * 60 * 24));
                    }
                }
            }

            const localEvent = Object.assign({}, event, {
                localDateStr: localDateStr,
                localTimeStr: localTimeStr,
                isShiftedDay: isShiftedDay,
                dayShift: dayShift,
                originalDate: event.date,
                originalTime: event.time
            });

            byDate[localDateStr] = localEvent;
        }
    }

    return { byDate: byDate, periods: periods };
}

function _findPeriodEvent(periods, dateStr) {
    for (let i = 0; i < periods.length; i++) {
        const p = periods[i];
        if (dateStr >= p.startDate && dateStr <= p.endDate) return p;
    }
    return null;
}

function _formatStreamCellTime(streamEvent) {
    if (!streamEvent) return '';
    if (streamEvent.localTimeStr) return streamEvent.localTimeStr;
    if (!streamEvent.time) return '';
    const exactDate = _getStreamLocalDateTime(streamEvent.originalDate || streamEvent.date, streamEvent.time);
    if (!exactDate) return _escapeHtml(streamEvent.time);

    const userH = String(exactDate.getHours()).padStart(2, '0');
    const userM = String(exactDate.getMinutes()).padStart(2, '0');
    const prefix = streamEvent.time.includes('±') ? '±' : '';
    return prefix + `${userH}:${userM}`;
}

/**
 * Строит HTML одной ячейки дня.
 */
function _renderDayCell(year, month, day, todayStr, index, firstDay) {
    const dateStr     = _dateStr(year, month + 1, day);
    const periodEvent = _findPeriodEvent(index.periods, dateStr);
    const streamEvent = index.byDate[dateStr];
    const isOctober   = (month === 9);

    // Вычисляем координаты ячейки в сетке для эффекта блика
    const positionIndex = firstDay + (day - 1);
    const x = positionIndex % 7;
    const y = Math.floor(positionIndex / 7);

    let classes       = 'day-cell';
    let content       = '<div class="day-number">' + day + '</div>';
    let inlineStyles  = '';

    if (dateStr === todayStr) classes += ' today';

    // Хеллоуинские украшения для Октября
    if (isOctober) {
        if (day >= 18) {
            // Последние 2 недели: Хеллоуинский сезон
            classes += ' spooky-cell';
            if (day === 31) {
                classes += ' halloween-boss';
            }
            const SPOOKY_STAMPS = {
                18: '🦇', 19: '🕷️', 20: '🎃', 21: '👻', 22: '🍬',
                23: '🕯️', 24: '🕸️', 25: '🦇', 26: '🕷️', 27: '🧙‍♀️',
                28: '👻', 29: '🍬', 30: '🕯️', 31: '🎃'
            };
            const stamp = SPOOKY_STAMPS[day] || '🎃';
            content += '<div class="spooky-stamp" title="Хеллоуин">' + stamp + '</div>';
        } else {
            classes += ' october-cell';
        }
    }

    if (periodEvent) {
        // Периодическое событие (отпуск, марафон)
        classes += ' ' + periodEvent.type;
        content += '<div class="period-text">' + _escapeHtml(periodEvent.text) + '</div>';

    } else if (streamEvent) {
        // Определяем тип ячейки
        if (streamEvent.isSonic) {
            classes += ' sonic-cell stream-day';

            if (streamEvent.isCanceled) {
                // Изменённый контент для отменённого стрима: Broken TV Monitor
                content = '<div class="tv-monitor"><div class="tv-static"></div><div class="tv-x">✖</div></div>';
            } else {
                // Контент для обычного Соник-стрима: Истинное 3D-кольцо (Торус из 7 слоёв)
                let ringFaces = '';
                for (let i = 0; i < 7; i++) {
                    ringFaces += '<div class="ring-face" style="--i: ' + i + '"></div>';
                }
                
                content = 
                    '<div class="ring-wrapper">' + 
                        '<div class="ring-3d">' + 
                            ringFaces + 
                            '<div class="ring-shine"></div>' +
                        '</div>' + 
                        '<div class="day-number">' + day + '</div>' + 
                    '</div>';
            }

            // Проверяем соседние дни на наличие Соник-стримов для создания "островов"
            const prevDate = new Date(year, month, day - 1);
            const nextDate = new Date(year, month, day + 1);
            const prevDateStr = _dateStr(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate());
            const nextDateStr = _dateStr(nextDate.getFullYear(), nextDate.getMonth() + 1, nextDate.getDate());
            
            const prevEvent = index.byDate[prevDateStr];
            const nextEvent = index.byDate[nextDateStr];
            
            let isPrevSonic = prevEvent && prevEvent.isSonic;
            let isNextSonic = nextEvent && nextEvent.isSonic;
            
            // Разрываем визуальную связь на стыке недель (Понедельник = 0, Воскресенье = 6)
            const gridCol = (firstDay + day - 1) % 7;
            if (gridCol === 0) {
                isPrevSonic = false; // Понедельник не соединяется с Воскресеньем
            }
            if (gridCol === 6) {
                isNextSonic = false; // Воскресенье не соединяется с Понедельником
            }
            
            if (isPrevSonic && isNextSonic) {
                classes += ' island-mid';
            } else if (isPrevSonic && !isNextSonic) {
                classes += ' island-end';
            } else if (!isPrevSonic && isNextSonic) {
                classes += ' island-start';
            } else {
                classes += ' island-single';
            }
            
            inlineStyles += '--x:' + x + ';--y:' + y + ';';
            
        } else if (streamEvent.isNoir) {
            classes += ' noir-day';
        } else if (streamEvent.isGlitch) {
            classes += ' glitch-day';
        } else if (streamEvent.isExam) {
            classes += ' panic-day';
        } else if (streamEvent.isArt) {
            classes += ' art-day';

            // Автоматическая иконка по номеру дня
            const icon = streamEvent.artIcon || ART_ICONS[day % ART_ICONS.length];
            content   += '<div class="art-icon">' + _escapeHtml(icon) + '</div>';

            // CSS-переменные для случайного внешнего вида
            const hue1  = (day * 65) % 360;
            const hue2  = (hue1 + 60) % 360;
            const angle = 45 + (day * 37) % 360;
            const rot   = -6 + (day * 11) % 12;
            const shape = ART_SHAPES[day % ART_SHAPES.length];

            inlineStyles +=
                '--art-angle:' + angle + 'deg;' +
                '--art-color1:hsl(' + hue1 + ',90%,65%);' +
                '--art-color2:hsl(' + hue2 + ',90%,55%);' +
                '--art-shape:' + shape + ';' +
                '--art-rot:' + rot + 'deg;';
        } else {
            classes += ' stream-day';
        }

        // Прошедший стрим
        if (dateStr < todayStr && !streamEvent.isCanceled) {
            classes += ' past-stream';
        }

        // Содержимое плашки
        const specialClass = streamEvent.isSpecial ? 'special' : '';
        const timeDisplay = _formatStreamCellTime(streamEvent);
        let timeTooltip = 'Время стримера: ' + _escapeHtml(streamEvent.originalTime || streamEvent.time) + ' (Германия)';
        let shiftBadge = '';

        if (streamEvent.isShiftedDay && streamEvent.originalDate) {
            const parts = streamEvent.originalDate.split('-');
            const origDay = parseInt(parts[2], 10);
            const origMonIndex = parseInt(parts[1], 10) - 1;
            const origMonths = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
            const origMon = origMonths[origMonIndex] || '';
            const shiftSign = streamEvent.dayShift > 0 ? '+1д' : '-1д';
            timeTooltip = `Время стримера: ${streamEvent.originalTime || streamEvent.time} (${origDay} ${origMon}, Германия)`;
            shiftBadge = ` <span class="cell-shift-pill" title="${timeTooltip}">${shiftSign}</span>`;
        }

        const infoHtml = '<span class="cell-time" title="' + timeTooltip + '">' + timeDisplay + shiftBadge + '</span><br>' + _escapeHtml(streamEvent.text);
        if (streamEvent.isCanceled) {
            classes += ' canceled-day';
            content += '<div class="stream-info">' + infoHtml + '</div>';
        } else {
            content += '<div class="stream-info ' + specialClass + '">' + infoHtml + '</div>';
        }
    } else {
        // День без стримов: на 31 октября вешаем праздничный тег Хеллоуина
        if (isOctober && day === 31) {
            content += '<div class="stream-info halloween-tag">🎃 ХЕЛЛОУИН</div>';
        }
    }

    return '<div class="' + classes + '" style="' + inlineStyles + '">' + content + '</div>';
}

/**
 * Рендерит календарь для текущего месяца.
 */
function renderCalendar() {
    const monthYearEl   = document.getElementById('monthYearDisplay');
    const daysContainer = document.getElementById('calendarDays');
    if (!monthYearEl || !daysContainer) return;

    const year  = _calendarDate.getFullYear();
    const month = _calendarDate.getMonth();
    const isOctober = (month === 9);

    // Добавляем или убираем хеллоуинскую тему обёртки
    const calendarWrapper = document.querySelector('.calendar-wrapper');
    if (calendarWrapper) {
        calendarWrapper.classList.toggle('halloween-theme', isOctober);
    }

    if (isOctober) {
        monthYearEl.innerHTML = '<span class="hw-spiderweb">🕸️</span> <span class="hw-title">Октябрь ' + year + '</span> <span class="hw-pumpkin">🎃</span>';
    } else {
        monthYearEl.innerText = MONTH_NAMES[month] + ' ' + year;
    }

    // Первый день месяца (0=вс → приводим к пн=0)
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today    = new Date();
    const todayStr = _dateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const index = _indexEvents(STREAMS_LIST);

    // Собираем весь HTML в массив и вставляем одной операцией —
    // так браузер не перестраивает DOM на каждой ячейке.
    const html = [];

    // Пустые ячейки до первого дня
    for (let i = 0; i < firstDay; i++) {
        html.push('<div class="day-cell empty"></div>');
    }

    // Ячейки дней
    for (let day = 1; day <= daysInMonth; day++) {
        html.push(_renderDayCell(year, month, day, todayStr, index, firstDay));
    }

    daysContainer.innerHTML = html.join('');

    // Обновляем плашку часового пояса под зрителя
    const tzNote = document.querySelector('.timezone-note');
    if (tzNote) {
        try {
            const tzOffsetMin = -new Date().getTimezoneOffset();
            const tzSign = tzOffsetMin >= 0 ? '+' : '-';
            const tzHours = Math.floor(Math.abs(tzOffsetMin) / 60);
            const tzMins = Math.abs(tzOffsetMin) % 60;
            const tzStr = `UTC${tzSign}${tzHours}` + (tzMins > 0 ? `:${String(tzMins).padStart(2, '0')}` : '');

            const now = new Date();
            const berlinNow = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));
            const diffHours = Math.round((now.getTime() - berlinNow.getTime()) / (1000 * 60 * 60));

            if (diffHours === 0) {
                tzNote.innerHTML = `⏰ Время стримов указано по вашему местному времени (<strong>${tzStr}</strong>, Германия / Европа)`;
            } else {
                tzNote.innerHTML = `⏰ Время и дни стримов адаптированы под ваш часовой пояс (<strong>${tzStr}</strong>) • Время стримера: 20:00 (Германия, GMT+2)`;
            }
        } catch (e) {}
    }
}

/**
 * Переключает месяц вперёд или назад.
 * Остаётся глобальной для вызова из onclick="changeMonth(-1)".
 * @param {number} step — +1 или -1
 */
function changeMonth(step) {
    _calendarDate.setMonth(_calendarDate.getMonth() + step);
    renderCalendar();
}

// Форматирует дату в строку YYYY-MM-DD
function _dateStr(y, m, d) {
    return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
}

// Инициализация
renderCalendar();
