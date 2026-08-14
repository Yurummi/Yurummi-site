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
 * Строит индексы событий на текущий рендер, чтобы не сканировать
 * весь STREAMS_LIST заново для каждого дня месяца.
 */
function _indexEvents(list) {
    const byDate = Object.create(null);
    const periods = [];

    for (let i = 0; i < list.length; i++) {
        const event = list[i];
        if (event.startDate) {
            periods.push(event);
        } else if (event.date) {
            byDate[event.date] = event;
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

/**
 * Строит HTML одной ячейки дня.
 */
function _renderDayCell(year, month, day, todayStr, index) {
    const dateStr     = _dateStr(year, month + 1, day);
    const periodEvent = _findPeriodEvent(index.periods, dateStr);
    const streamEvent = index.byDate[dateStr];

    let classes       = 'day-cell';
    let content       = '<div class="day-number">' + day + '</div>';
    let inlineStyles  = '';

    if (dateStr === todayStr) classes += ' today';

    if (periodEvent) {
        // Периодическое событие (отпуск, марафон)
        classes += ' ' + periodEvent.type;
        content += '<div class="period-text">' + _escapeHtml(periodEvent.text) + '</div>';

    } else if (streamEvent) {
        // Определяем тип ячейки
        if (streamEvent.isNoir) {
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

            inlineStyles =
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
        const infoHtml = _escapeHtml(streamEvent.time) + '<br>' + _escapeHtml(streamEvent.text);
        if (streamEvent.isCanceled) {
            classes += ' canceled-day';
            content += '<div class="stream-info">' + infoHtml + '</div>';
        } else {
            content += '<div class="stream-info ' + specialClass + '">' + infoHtml + '</div>';
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

    monthYearEl.innerText = MONTH_NAMES[month] + ' ' + year;

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
        html.push(_renderDayCell(year, month, day, todayStr, index));
    }

    daysContainer.innerHTML = html.join('');
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
