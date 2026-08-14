/**
 * calendar.js — Интерактивный календарь стримов.
 * Зависит от: data.js (STREAMS_LIST)
 *
 * changeMonth() глобальная — вызывается из onclick в HTML.
 */

let _calendarDate = new Date();

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
 * Рендерит календарь для текущего месяца.
 */
function renderCalendar() {
    var year  = _calendarDate.getFullYear();
    var month = _calendarDate.getMonth();

    document.getElementById('monthYearDisplay').innerText = MONTH_NAMES[month] + ' ' + year;

    var daysContainer = document.getElementById('calendarDays');
    daysContainer.innerHTML = '';

    // Первый день месяца (0=вс → приводим к пн=0)
    var firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    var daysInMonth = new Date(year, month + 1, 0).getDate();

    var today = new Date();
    var todayStr = _dateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

    // Пустые ячейки до первого дня
    for (var i = 0; i < firstDay; i++) {
        daysContainer.innerHTML += '<div class="day-cell empty"></div>';
    }

    // Ячейки дней
    for (var day = 1; day <= daysInMonth; day++) {
        var dateStr     = _dateStr(year, month + 1, day);
        var streamEvent = STREAMS_LIST.find(function (s) { return s.date === dateStr; });
        var periodEvent = STREAMS_LIST.find(function (s) {
            return s.startDate && dateStr >= s.startDate && dateStr <= s.endDate;
        });

        var classes      = 'day-cell';
        var content      = '<div class="day-number">' + day + '</div>';
        var inlineStyles = '';

        if (dateStr === todayStr) classes += ' today';

        if (periodEvent) {
            // Периодическое событие (отпуск, марафон)
            classes += ' ' + periodEvent.type;
            content += '<div class="period-text">' + periodEvent.text + '</div>';

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
                var icon  = streamEvent.artIcon || ART_ICONS[day % ART_ICONS.length];
                content  += '<div class="art-icon">' + icon + '</div>';

                // CSS-переменные для случайного внешнего вида
                var hue1  = (day * 65) % 360;
                var hue2  = (hue1 + 60) % 360;
                var angle = 45 + (day * 37) % 360;
                var rot   = -6 + (day * 11) % 12;
                var shape = ART_SHAPES[day % ART_SHAPES.length];

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
            var specialClass = streamEvent.isSpecial ? 'special' : '';
            if (streamEvent.isCanceled) {
                classes += ' canceled-day';
                content += '<div class="stream-info">' + streamEvent.time + '<br>' + streamEvent.text + '</div>';
            } else {
                content += '<div class="stream-info ' + specialClass + '">' + streamEvent.time + '<br>' + streamEvent.text + '</div>';
            }
        }

        daysContainer.innerHTML +=
            '<div class="' + classes + '" style="' + inlineStyles + '">' + content + '</div>';
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
