/**
 * data.js — Все данные сайта в одном месте.
 * Чтобы добавить слайд или стрим — редактируй только этот файл.
 */

// ============================================================
//  СЛАЙДЕР
//  badgeStyle: 'yellow' | 'green' | 'pink' | 'none'
//  url: '' — слайд без ссылки (не кликабельный)
// ============================================================
const SLIDES_DATA = [
    {
        file: 'img/news/news_29_08_2026_cosplay.webp',
        badgeStyle: 'green',
        badgeText: 'СБОР',
        textMain: 'Косплей-Рулетка',
        textAuthor: '',
        url: ''
    },
    {
        file: 'img/arts/Ya_i_Maku_final.webp',
        badgeStyle: 'pink',
        badgeText: '💖 АРТ',
        textMain: 'Я и Маку',
        textAuthor: '@yurummi',
        url: ''
    },
    {
        file: 'img/fanarts/mmr_abuser_sketch.webp',
        badgeStyle: 'pink',
        badgeText: '💖 АРТ',
        textMain: 'Фан арт',
        textAuthor: '@mmr_abuser',
        url: ''
    },
    {
        file: 'img/sketches/Соник.webp',
        badgeStyle: 'green',
        badgeText: 'ИВЕНТ',
        textMain: 'Соник',
        textAuthor: 'Марафон',
        url: 'https://t.me/yurummiyt/740'
    },
    {
        file: 'img/arts/Фарочан ФИНАЛЛ.webp',
        badgeStyle: 'pink',
        badgeText: '💖 АРТ',
        textMain: 'Фарочан',
        textAuthor: '@yurummi',
        url: 'https://t.me/yurummiyt/728'
    },
    {
        file: 'img/fanarts/СПИНА.webp',
        badgeStyle: 'pink',
        badgeText: '💖 АРТ',
        textMain: 'Фан арт от Маку',
        textAuthor: '@Maku_q',
        url: 'https://t.me/maku_qq'
    },
    {
        file: 'img/slider/vacation.webp',
        badgeStyle: 'none',
        badgeText: '',
        textMain: 'Отпуск📌',
        textAuthor: '',
        url: 'https://t.me/yurummiyt/714'
    },
    {
        file: 'img/slider/Ютубоснова.webp',
        badgeStyle: 'none',
        badgeText: '',
        textMain: 'Новый YouTube канал',
        textAuthor: '',
        url: 'https://www.youtube.com/@itsYurummi?sub_confirmation=1'
    },
    {
        file: 'img/arts/Тутрфинал.webp',
        badgeStyle: 'pink',
        badgeText: '💖 АРТ',
        textMain: '3/9',
        textAuthor: '@yurummi',
        url: 'https://t.me/yurummiyt/657'
    },
    {
        file: 'img/slider/анонсвидео.webp',
        badgeStyle: 'green',
        badgeText: 'АНОНС',
        textMain: 'Первое длинное видео для ютуба',
        textAuthor: '',
        url: ''
    },
    {
        file: 'img/arts/птицафинал.webp',
        badgeStyle: 'pink',
        badgeText: '💖 АРТ',
        textMain: '4/9',
        textAuthor: '@yurummi',
        url: 'https://t.me/yurummiyt/662'
    }
];

// ============================================================
//  РАСПИСАНИЕ СТРИМОВ
//
//  Разовые события:
//    date       — 'YYYY-MM-DD'
//    time       — строка с временем, например '19:00' или '±20:00'
//    text       — название события
//    isSpecial  — true → розовая плашка (особый стрим)
//    isArt      — true → ячейка "рисование" (органическая форма)
//    isExam     — true → паника-режим (красный глитч)
//    isNoir     — true → стиль стикера/заметки
//    isGlitch   — true → фиолетовый портал
//    isCanceled — true → серая ячейка с пометкой "ОТМЕНЕН"
//
//  Периодические события (несколько дней подряд):
//    startDate  — 'YYYY-MM-DD'
//    endDate    — 'YYYY-MM-DD'
//    text       — название
//    type       — 'vacation' | 'marathon'
// ============================================================
const STREAMS_LIST = [
    { date: '2026-05-29', time: '19:00',   text: 'Стрим возвращение',   isSpecial: false, isCanceled: false },
    { date: '2026-05-31', time: '15:00',   text: 'Крафт коробки',       isSpecial: true,  isCanceled: false },
    { date: '2026-06-02', time: '19:00',   text: 'Стрим',               isSpecial: false, isCanceled: true  },
    { date: '2026-06-05', time: '19:00',   text: 'Костюм горничной',    isSpecial: true,  isCanceled: false },
    { date: '2026-06-09', time: '20:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-06-12', time: '19:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-06-17', time: '20:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-06-19', time: '19:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-06-20', time: '19:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-06-23', time: '20:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-06-25', time: '20:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-06-30', time: '20:00',   text: 'Стрим',               isSpecial: false, isCanceled: true  },
    { date: '2026-07-01', time: '20:00',   text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-07-03', time: '±19:30',  text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-07-04', time: '',        text: 'Стрим',               isSpecial: false, isCanceled: true  },
    { date: '2026-07-19', time: '±19:30',  text: 'Стрим',               isSpecial: false, isCanceled: true  },
    { date: '2026-07-21', time: '19:00',   text: 'Рисование',           isArt: true,      isCanceled: true  },
    { date: '2026-07-24', time: '',        text: 'ЭКЗАМЕН',             isExam: true                        },
    { date: '2026-07-28', time: '±19:30',  text: 'Рисование',           isArt: true,      isCanceled: false },
    { date: '2026-07-29', time: '±19:30',  text: 'Рисование',           isArt: true,      isCanceled: false },
    { date: '2026-07-31', time: '±19:30',  text: 'Рисование',           isArt: true,      isCanceled: false },
    { date: '2026-08-01', time: '±20:00',  text: 'Рисование',           isArt: true,      isCanceled: false },
    { date: '2026-08-04', time: '±20:00',  text: 'Рисование',           isArt: true,      isCanceled: false },
    { date: '2026-08-07', time: '±20:00',  text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-08-09', time: '±20:00',  text: 'Рисование',           isArt: true,      isCanceled: false },
    { date: '2026-08-11', time: '±20:00',  text: 'Стрим',               isSpecial: false, isCanceled: false },
    { date: '2026-08-14', time: '±20:00',  text: 'Стрим',               isSpecial: false, isCanceled: true },
    { date: '2026-08-15', time: '±20:00',  text: 'Стрим',               isSpecial: false, isCanceled: false },
    

    // Соник Марафон — Пн/Вт/Ср + Пт/Сб до конца августа
    { date: '2026-08-17', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-18', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: true },
    { date: '2026-08-19', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-21', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-22', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-24', time: '15:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-25', time: '15:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-26', time: '15:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-28', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-29', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-08-31', time: '15:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-09-01', time: '15:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-09-02', time: '15:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-09-04', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },
    { date: '2026-09-05', time: '±20:00', text: 'Соник', isSonic: true, isCanceled: false },

    // Периодические события
    { startDate: '2026-07-06', endDate: '2026-07-17', text: 'ОТПУСК 🌴', type: 'vacation' }
];
