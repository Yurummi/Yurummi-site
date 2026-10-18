// HowLongToBeat (HLTB) dataset and integration for Yurummi's gaming library
// Provides estimated completion times (Main Story, Main+Extra, Completionist)
// and personal comparison with Yurummi's actual stream/playtime.

window.HLTB_DATA = {
    // ── Вне Steam & Особенные проекты ─────────────────────────────────────────
    9900001: {
        title: "Minecraft",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: null,
        note: "Культовая песочница с бесконечными процедурными мирами, сборками Create и серверами: наиграно 8000+ ч. у Yurummi!"
    },
    319510: {
        title: "Five Nights at Freddy's",
        main: 2.5,
        extra: 3.5,
        complete: 4.5,
        type: "story",
        label: "~2.5 ч.",
        note: "Yurummi проходил 6 часов — это его личный хейтер!"
    },
    332800: {
        title: "Five Nights at Freddy's 2",
        main: 3,
        extra: 4.5,
        complete: 6.5,
        type: "story",
        label: "~3 ч.",
        note: "Yurummi прошёл примерно за 2.5 часа."
    },
    354140: {
        title: "Five Nights at Freddy's 3",
        main: 2.5,
        extra: 3.5,
        complete: 5,
        type: "story",
        label: "~2.5 ч.",
        note: "Yurummi прошёл примерно за 2.5 часа."
    },
    388090: {
        title: "Five Nights at Freddy's 4",
        main: 2.5,
        extra: 4,
        complete: 6.5,
        type: "story",
        label: "~2.5 ч.",
        note: "Yurummi прошёл примерно за 2.5 часа."
    },
    506610: {
        title: "Five Nights at Freddy's: Sister Location",
        main: 2.5,
        extra: 3.5,
        complete: 5.5,
        type: "story",
        label: "~2.5 ч.",
        note: "Yurummi прошёл примерно за 2.5 часа."
    },
    2638370: {
        title: "Five Nights at Freddy's: Into the Pit",
        main: 3.5,
        extra: 4.5,
        complete: 6,
        type: "story",
        label: "~3.5 ч.",
        note: "Yurummi прошёл полностью за ~3 часа на стриме."
    },
    1850570: {
        title: "Death Stranding Director's Cut",
        main: 36,
        extra: 59,
        complete: 113,
        type: "story",
        label: "~36 ч.",
        note: "Yurummi наиграл 15 часов (начальные сюжетные регионы)."
    },
    9900002: {
        title: "Sonic Advance",
        main: 2.5,
        extra: 4,
        complete: 7,
        type: "story",
        label: "~2.5 ч.",
        note: "Yurummi полностью прошёл за ~3 часа на стриме марафона."
    },
    9900003: {
        title: "Sonic Advance 2",
        main: 3,
        extra: 5.5,
        complete: 12,
        type: "story",
        label: "~3 ч.",
        note: "Yurummi полностью прошёл за ~3 часа на стриме марафона."
    },
    9900004: {
        title: "Sonic Advance 3",
        main: 3.5,
        extra: 6.5,
        complete: 15,
        type: "story",
        label: "~3.5 ч.",
        note: "Yurummi полностью прошёл за ~3 часа на стриме марафона."
    },
    9900005: {
        title: "Sonic Triple Trouble 16-Bit",
        main: 2,
        extra: 3,
        complete: 4,
        type: "story",
        label: "~2 ч.",
        note: "Игралась по рекомендации на марафоне Соника (2 часа, заброшена)."
    },
    9900006: {
        title: "Sonic the Hedgehog Time Twisted",
        main: 2.5,
        extra: 3.5,
        complete: 5,
        type: "story",
        label: "~2.5 ч.",
        note: "Игралась по рекомендации на марафоне Соника (2 часа, заброшена)."
    },

    // ── Steam игры (Марафон Соника & Ключевые тайтлы) ─────────────────────────
    71250: {
        title: "Sonic Adventure DX",
        main: 11.5,
        extra: 21,
        complete: 35,
        type: "story",
        label: "~11.5 ч.",
        note: "Yurummi потратил 2 стрима по 4 часа (8 ч.) и забросил."
    },
    213610: {
        title: "Sonic Adventure 2",
        main: 14,
        extra: 27,
        complete: 45,
        type: "story",
        label: "~14 ч.",
        note: "Yurummi потратил 8 часов и забросил."
    },
    570: {
        title: "Dota 2",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Главная соревновательная MOBA стримера — колоссальные 13 081 ч.!"
    },
    730: {
        title: "Counter-Strike 2",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Тактический шутер от первого лица — почти 2 000 ч. (1 991 ч.)."
    },
    1172470: {
        title: "Apex Legends",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Динамичный батл-рояль — 229 ч., получены 100% ачивок Steam!"
    },
    271590: {
        title: "Grand Theft Auto V",
        main: 31.5,
        extra: 48,
        complete: 83,
        type: "story",
        label: "~31.5 ч.",
        note: "Yurummi наиграл 523 ч. (кампания + активные сессии в GTA Online)."
    },
    2527500: {
        title: "MiSide",
        main: 3.5,
        extra: 4.5,
        complete: 6,
        type: "story",
        label: "~3.5 ч.",
        note: "Пройдена за 3.8 ч., получены все 100% достижений Steam."
    },
    383870: {
        title: "Firewatch",
        main: 4,
        extra: 4.5,
        complete: 4.5,
        type: "story",
        label: "~4 ч.",
        note: "Пройдена за 4.3 ч., получены все 100% достижений Steam."
    },
    2138710: {
        title: "Sifu",
        main: 9.5,
        extra: 17,
        complete: 44,
        type: "story",
        label: "~9.5 ч.",
        note: "Хардкорный кунг-фу экшен — Yurummi наиграл 64 ч. мастерства."
    },
    1086940: {
        title: "Baldur's Gate 3",
        main: 68,
        extra: 110,
        complete: 158,
        type: "story",
        label: "~68 ч.",
        note: "Грандиозная партийная RPG — 44.4 ч. в мире Забытых Королевств."
    },
    747660: {
        title: "Five Nights at Freddy's: Security Breach",
        main: 11,
        extra: 15,
        complete: 22,
        type: "story",
        label: "~11 ч.",
        note: "Масштабный 3D хоррор в мега-пиццаплексе."
    },
    738050: {
        title: "Freddy Fazbear's Pizzeria Simulator",
        main: 4,
        extra: 6,
        complete: 8,
        type: "story",
        label: "~4 ч.",
        note: "Шестая номерная часть FNaF с управлением пиццерией."
    },
    400: {
        title: "Portal",
        main: 3,
        extra: 5,
        complete: 9.5,
        type: "story",
        label: "~3 ч."
    },
    620: {
        title: "Portal 2",
        main: 8.5,
        extra: 13,
        complete: 21,
        type: "story",
        label: "~8.5 ч."
    },
    220: {
        title: "Half-Life 2",
        main: 13,
        extra: 15,
        complete: 19.5,
        type: "story",
        label: "~13 ч."
    },
    105600: {
        title: "Terraria",
        main: 32,
        extra: 70,
        complete: 180,
        type: "endless",
        label: "~32 ч. / ∞"
    },
    252490: {
        title: "Rust",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер"
    },
    1966720: {
        title: "Lethal Company",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    739630: {
        title: "Phasmophobia",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    945360: {
        title: "Among Us",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра"
    },
    4000: {
        title: "Garry's Mod",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Песочница"
    },
    440: {
        title: "Team Fortress 2",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер"
    },
    218620: {
        title: "PAYDAY 2",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    367520: {
        title: "Hollow Knight",
        main: 27,
        extra: 41,
        complete: 63,
        type: "story",
        label: "~27 ч."
    },
    391540: {
        title: "Undertale",
        main: 6.5,
        extra: 9.5,
        complete: 21,
        type: "story",
        label: "~6.5 ч."
    },
    268910: {
        title: "Cuphead",
        main: 10.5,
        extra: 15,
        complete: 25,
        type: "story",
        label: "~10.5 ч."
    },
    2050650: {
        title: "Resident Evil 4",
        main: 16,
        extra: 21,
        complete: 40,
        type: "story",
        label: "~16 ч."
    },
    418370: {
        title: "Resident Evil 7 Biohazard",
        main: 9.5,
        extra: 12,
        complete: 20,
        type: "story",
        label: "~9.5 ч."
    },
    1196590: {
        title: "Resident Evil Village",
        main: 9.5,
        extra: 12.5,
        complete: 37,
        type: "story",
        label: "~9.5 ч."
    },
    374320: {
        title: "Dark Souls III",
        main: 32,
        extra: 48,
        complete: 85,
        type: "story",
        label: "~32 ч."
    },
    1245620: {
        title: "ELDEN RING",
        main: 58,
        extra: 101,
        complete: 133,
        type: "story",
        label: "~58 ч."
    },
    1091500: {
        title: "Cyberpunk 2077",
        main: 25,
        extra: 60,
        complete: 105,
        type: "story",
        label: "~25 ч."
    },
    292030: {
        title: "The Witcher 3: Wild Hunt",
        main: 51,
        extra: 103,
        complete: 173,
        type: "story",
        label: "~51 ч."
    },
    238320: {
        title: "Outlast",
        main: 5,
        extra: 6.5,
        complete: 10,
        type: "story",
        label: "~5 ч."
    },
    414700: {
        title: "Outlast 2",
        main: 7,
        extra: 8.5,
        complete: 14,
        type: "story",
        label: "~7 ч."
    },
    57300: {
        title: "Amnesia: The Dark Descent",
        main: 8,
        extra: 9,
        complete: 11,
        type: "story",
        label: "~8 ч."
    },
    1721470: {
        title: "Poppy Playtime",
        main: 1,
        extra: 1.5,
        complete: 2,
        type: "story",
        label: "~1 ч."
    },
    424840: {
        title: "Little Nightmares",
        main: 3.5,
        extra: 4.5,
        complete: 6.5,
        type: "story",
        label: "~3.5 ч."
    },
    860510: {
        title: "Little Nightmares II",
        main: 5.5,
        extra: 6.5,
        complete: 9,
        type: "story",
        label: "~5.5 ч."
    },
    48000: {
        title: "LIMBO",
        main: 3.5,
        extra: 4,
        complete: 6.5,
        type: "story",
        label: "~3.5 ч."
    },
    304430: {
        title: "INSIDE",
        main: 3.5,
        extra: 4,
        complete: 4.5,
        type: "story",
        label: "~3.5 ч."
    },
    1332010: {
        title: "Stray",
        main: 5,
        extra: 6.5,
        complete: 10,
        type: "story",
        label: "~5 ч."
    },
    264710: {
        title: "Subnautica",
        main: 29,
        extra: 44,
        complete: 56,
        type: "story",
        label: "~29 ч."
    },
    322330: {
        title: "Don't Starve Together",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Выживание"
    },
    242760: {
        title: "The Forest",
        main: 15,
        extra: 27,
        complete: 50,
        type: "story",
        label: "~15 ч."
    },
    1326470: {
        title: "Sons of the Forest",
        main: 13,
        extra: 21,
        complete: 35,
        type: "story",
        label: "~13 ч."
    },
    648800: {
        title: "Raft",
        main: 20,
        extra: 32,
        complete: 45,
        type: "story",
        label: "~20 ч."
    },
    227300: {
        title: "Euro Truck Simulator 2",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Симулятор"
    },
    322170: {
        title: "Geometry Dash",
        main: 4,
        extra: 15,
        complete: 80,
        type: "story",
        label: "~4 ч."
    },
    219150: {
        title: "Hotline Miami",
        main: 5,
        extra: 7.5,
        complete: 16,
        type: "story",
        label: "~5 ч."
    },
    274170: {
        title: "Hotline Miami 2: Wrong Number",
        main: 9,
        extra: 14,
        complete: 30,
        type: "story",
        label: "~9 ч."
    },
    504230: {
        title: "Celeste",
        main: 8,
        extra: 14,
        complete: 38,
        type: "story",
        label: "~8 ч."
    },
    381210: {
        title: "Dead by Daylight",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер"
    },
    588650: {
        title: "Dead Cells",
        main: 14,
        extra: 38,
        complete: 105,
        type: "story",
        label: "~14 ч."
    },
    1145360: {
        title: "Hades",
        main: 22,
        extra: 48,
        complete: 96,
        type: "story",
        label: "~22 ч."
    },
    646570: {
        title: "Slay the Spire",
        main: 12,
        extra: 50,
        complete: 150,
        type: "story",
        label: "~12 ч."
    },
    250900: {
        title: "The Binding of Isaac: Rebirth",
        main: 11,
        extra: 60,
        complete: 300,
        type: "story",
        label: "~11 ч."
    },
    2835570: {
        title: "Buckshot Roulette",
        main: 1.5,
        extra: 2.5,
        complete: 4,
        type: "story",
        label: "~1.5 ч."
    },
    2881650: {
        title: "Content Warning",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    1444480: {
        title: "Class of '09",
        main: 2,
        extra: 3,
        complete: 4,
        type: "story",
        label: "~2 ч."
    },
    698780: {
        title: "Doki Doki Literature Club!",
        main: 4.5,
        extra: 5.5,
        complete: 6.5,
        type: "story",
        label: "~4.5 ч."
    },
    1451940: {
        title: "NEEDY STREAMER OVERLOAD",
        main: 3.5,
        extra: 7,
        complete: 14,
        type: "story",
        label: "~3.5 ч."
    },
    1150690: {
        title: "OMORI",
        main: 21,
        extra: 29,
        complete: 65,
        type: "story",
        label: "~21 ч."
    },
    2231450: {
        title: "Pizza Tower",
        main: 6,
        extra: 9.5,
        complete: 18,
        type: "story",
        label: "~6 ч."
    },
    1229490: {
        title: "ULTRAKILL",
        main: 8,
        extra: 14,
        complete: 30,
        type: "story",
        label: "~8 ч."
    },
    1794680: {
        title: "Vampire Survivors",
        main: 14,
        extra: 27,
        complete: 48,
        type: "story",
        label: "~14 ч."
    },
    1761270: {
        title: "Choo-Choo Charles",
        main: 2.5,
        extra: 3,
        complete: 3.5,
        type: "story",
        label: "~2.5 ч."
    },
    1274570: {
        title: "DEVOUR",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    1929610: {
        title: "Demonologist",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    1368030: {
        title: "In Silence",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    1295920: {
        title: "Pacify",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп"
    },
    1568590: {
        title: "Propnight",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер"
    },
    // ── Гонки & Автосимуляторы ───────────────────────────────────────────────
    2225070: {
        title: "Trackmania",
        main: 15,
        extra: 35,
        complete: 90,
        type: "racing",
        label: "~15 ч.",
        mainLabel: "Карьера / Треки",
        extraLabel: "Все сезоны",
        compLabel: "100% Все медали",
        note: "Одиночные сезонные треки и заезды на медали (~15 ч.) + бесконечный онлайн."
    },
    11020: {
        title: "TrackMania Nations Forever",
        main: 15,
        extra: 25,
        complete: 65,
        type: "racing",
        label: "~15 ч.",
        mainLabel: "Одиночные треки",
        extraLabel: "Все флаги / Кубки",
        compLabel: "100% Золотые медали",
        note: "Одиночные треки (Stadium) от белых до черных (~15 ч.) и заезды на время."
    },
    690790: {
        title: "DiRT Rally 2.0",
        main: 24,
        extra: 45,
        complete: 80,
        type: "racing",
        label: "~24 ч.",
        mainLabel: "Карьера / Ралли",
        extraLabel: "Чемпионаты FIA World RX",
        compLabel: "100% Мастер-ралли",
        note: "Карьерные раллийные этапы и чемпионаты FIA World Rallycross."
    },
    310560: {
        title: "DiRT Rally",
        main: 22,
        extra: 40,
        complete: 75,
        type: "racing",
        label: "~22 ч.",
        mainLabel: "Карьера / Ралли",
        extraLabel: "Чемпионаты",
        compLabel: "100% Мастер-ралли"
    },
    550: {
        title: "Left 4 Dead 2",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        mainLabel: "Кооператив",
        note: "Культовый кооперативный зомби-шутер для совместной игры с друзьями."
    },

    // ── Море воров (Sea of Thieves) — Актуальные данные HowLongToBeat ────────
    1172620: {
        title: "Sea of Thieves",
        main: 68,
        extra: 226,
        complete: 450,
        type: "coop",
        label: "Кооп",
        mainLabel: "Истории Tall Tales",
        extraLabel: "PvPvE / Все сезоны",
        compLabel: "Легендарный пират",
        note: "Пиратская MMO-песочница: совместные приключения Tall Tales на HLTB занимают ~68 ч., а PvPvE и сезоны — от 226 ч.!"
    },

    // ── Кооперативные проекты (без сюжетных часов, статус 'Кооп') ────────────
    1203220: {
        title: "NARAKA: BLADEPOINT",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Динамичная экшен-королевская битва с упором на ближний бой, паркур и командную игру."
    },
    444090: {
        title: "Paladins",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Командный геройский шутер — совместные командные матчи с друзьями."
    },
    548430: {
        title: "Deep Rock Galactic",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Культовый кооперативный шутер про космических дворфов с процедурной генерацией пещер."
    },
    1097150: {
        title: "Fall Guys",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Весёлая пати-игра с полосой препятствий для совместного веселья с друзьями."
    },
    3527290: {
        title: "PEAK",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный экшен на выживание."
    },
    3241660: {
        title: "R.E.P.O.",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный хоррор-экшен для совместных рейдов с друзьями."
    },
    1599600: {
        title: "PlateUp!",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный кулинарный рогалик с управлением рестораном."
    },
    477160: {
        title: "Human Fall Flat",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Физическая головоломка для весёлого совместного прохождения с друзьями."
    },
    1144200: {
        title: "Ready or Not",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Тактический SWAT-шутер для слаженной командной зачистки операций."
    },
    1203620: {
        title: "Enshrouded",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативное экшен-выживание с крафтом и строительством в мире Пелены."
    },
    1621690: {
        title: "Core Keeper",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная подземная песочница с добычей ресурсов и боссами."
    },
    774801: {
        title: "Crab Champions",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Динамичный кооперативный рогалик про крабов с пушками."
    },
    1304930: {
        title: "The Outlast Trials",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный сурвайвал-хоррор: совместное прохождение испытаний корпорации Меркофф."
    },
    2567870: {
        title: "Chained Together",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный челлендж: побег из ада на одной общей цепи с друзьями."
    },
    1119730: {
        title: "Ranch Simulator",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный симулятор восстановления семейного ранчо."
    },
    2448970: {
        title: "Dungeonborne",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативное мрачное PvPvE фэнтези с рейдами в подземелья."
    },
    2139020: {
        title: "What the Fog",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Динамичный кооперативный рогалик от авторов Dead by Daylight."
    },
    304930: {
        title: "Unturned",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Популярная кооперативная выживалка в мире зомби-апокалипсиса."
    },
    448510: {
        title: "Overcooked",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Культовая кооперативная кулинарная суматоха на безумных кухнях."
    },
    728880: {
        title: "Overcooked! 2",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная кулинария: бросайте ингредиенты и готовьте блюда вместе с друзьями."
    },
    238370: {
        title: "Magicka 2",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативное колдовство: комбинируйте стихии и случайно сжигайте тиммейтов."
    },
    677160: {
        title: "We Were Here Too",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная головоломка для двоих с голосовой связью по рации."
    },
    865360: {
        title: "We Were Here Together",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная головоломка для двоих в заснеженных пустошах."
    },
    582500: {
        title: "We Were Here",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Оригинальная кооперативная головоломка для двоих игроков."
    },
    1301720: {
        title: "Escape Room - The Sick Colleague",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный квест в комнате загадок для прохождения с друзьями."
    },
    1509960: {
        title: "PICO PARK",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный платформер для компании друзей."
    },
    674940: {
        title: "Stick Fight: The Game",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Угарные физические бои стикменов для компании."
    },
    341800: {
        title: "Keep Talking and Nobody Explodes",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная игра по разминированию бомбы по инструкции."
    },
    3949040: {
        title: "RV There Yet?",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативное дорожное приключение на фургоне с друзьями."
    },
    1695840: {
        title: "Fear Therapy",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Психологический кооперативный хоррор для совместного расследования."
    },
    2551020: {
        title: "One-armed robber",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативные ограбления одной рукой."
    },
    1977530: {
        title: "One-armed cook",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная готовка одной рукой на кухне."
    },
    2827200: {
        title: "MIMESIS",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативный хоррор с прятками и монстрами."
    },
    1807080: {
        title: "Ghost Exile",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная охота на призраков с ритуалами изгнания."
    },
    858820: {
        title: "Tribes of Midgard",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативное экшен-выживание в мире скандинавских мифов."
    },
    1071870: {
        title: "Biped",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативное приключение для двух милых двуногих роботов."
    },
    1016920: {
        title: "Unrailed!",
        main: null,
        extra: null,
        complete: null,
        type: "coop",
        label: "Кооп",
        note: "Кооперативная прокладка железнодорожных путей в процедурном мире."
    },

    // ── Соревновательный мультиплеер & Пати-игры ──────────────────────────────
    252950: {
        title: "Rocket League",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Соревновательный автофутбол: у Yurummi наиграно более 530 часов!"
    },
    386180: {
        title: "Crossout",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Постапокалиптический онлайн-экшен с конструктором боевых бронемобилей."
    },
    1190340: {
        title: "SUPER PEOPLE",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Динамичная супергеройская королевская битва."
    },
    109600: {
        title: "Neverwinter",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ MMORPG",
        note: "Классическая фэнтезийная MMORPG по вселенной Dungeons & Dragons."
    },
    1260320: {
        title: "Party Animals",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Физические битвы милых зверушек на различных аренах."
    },
    880940: {
        title: "Pummel Party",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Весёлая настольная пати-игра с разрушительными мини-играми."
    },
    3097560: {
        title: "Liar's Bar",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Психологическая карточная игра с блефом и русской рулеткой в тёмном баре."
    },
    207140: {
        title: "SpeedRunners",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Сумасшедший соревновательный 4-player платформер-гонка с крюками-кошками."
    },
    431240: {
        title: "Golf With Your Friends",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Мини-гольф для большой компании друзей на безумных полях."
    },
    1088150: {
        title: "Scribble It!",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Мультиплеерная игра в угадывание рисунков на скорость."
    },
    3553500: {
        title: "SIGame",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Викторина",
        note: "Своя Игра для стримов и дружеских посиделок с кастомными паками."
    },
    1170970: {
        title: "Marbles on Stream",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Стрим-игра",
        note: "Гонки шариков для интерактива со зрителями на стриме."
    },
    1455630: {
        title: "THE GAME OF LIFE 2",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Цифровая настольная игра про выбор жизненного пути для совместной игры."
    },
    1422450: {
        title: "Deadlock",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Новейший геройский шутер от Valve с механиками MOBA и рельсами."
    },
    470220: {
        title: "UNO",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Классическая карточная игра UNO для компании."
    },
    466240: {
        title: "Deceit",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Пати-игра",
        note: "Социальная дедукция и выживание среди заражённых."
    },
    1675900: {
        title: "Warlander",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Средневековая командная осада замков с магией и роботами."
    },
    633230: {
        title: "NARUTO TO BORUTO: SHINOBI STRIKER",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Сетевые командные бои ниндзя 4 на 4."
    },
    1238860: {
        title: "Battlefield 4™",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Масштабные сетевые баталии на 64 игрока с техникой и разрушениями."
    },
    1808500: {
        title: "ARC Raiders",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Кооперативный PvPvE экстракшен-шутер."
    },
    2073850: {
        title: "THE FINALS",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Сверхдинамичный соревновательный шутер с тотальной разрушаемостью арен."
    },
    1049590: {
        title: "Eternal Return",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Аниме-батлрояль с элементами MOBA и крафта на острове Люмия."
    },
    386360: {
        title: "SMITE",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ MOBA",
        note: "MOBA от третьего лица в мифологическом сеттинге."
    },
    868270: {
        title: "The Cycle: Frontier",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "PvPvE экстракшен-шутер на опасной планете Фортуна III."
    },
    2167580: {
        title: "Summoners War: Chronicles",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ MMORPG",
        note: "Экшен-MMORPG по вселенной Summoners War."
    },
    836620: {
        title: "Black Desert (Retired)",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ MMORPG",
        note: "Корейская MMORPG с динамичным нон-таргет боем."
    },
    238960: {
        title: "Path of Exile",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Экшен-RPG",
        note: "Культовая изометрическая ARPG с гигантским деревом пассивных навыков."
    },
    236390: {
        title: "War Thunder",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Военный симулятор масштабных сражений бронетехники, авиации и флота."
    },
    1046930: {
        title: "Dota Underlords",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Автобатлер по мотивам вселенной Dota 2."
    },
    380600: {
        title: "Fishing Planet",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Симулятор",
        note: "Реалистичный онлайн-симулятор рыбалки от первого лица."
    },
    3684820: {
        title: "Prime World: Classic",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ MOBA",
        note: "Классическая MOBA с развитием замка и талантами героев."
    },
    299360: {
        title: "Block N Load",
        main: null,
        extra: null,
        complete: null,
        type: "multi",
        label: "∞ Мультиплеер",
        note: "Командный воксельный шутер с постройкой укреплений."
    },

    // ── Сюжетные тайтлы с проверенными данными HowLongToBeat ───────────────────
    1222140: {
        title: "Detroit: Become Human",
        main: 12,
        extra: 16.5,
        complete: 31,
        type: "story",
        label: "~12 ч.",
        note: "Интерактивная драма Quantic Dream: прохождение основной истории занимает ~12 ч."
    },
    214490: {
        title: "Alien: Isolation",
        main: 18.5,
        extra: 22.5,
        complete: 34.5,
        type: "story",
        label: "~18.5 ч.",
        note: "Культовый хоррор на станции «Севастополь»: сюжетная линия противостояния с Ксеноморфом занимает ~18.5 ч."
    },
    1954200: {
        title: "Kena: Bridge of Spirits",
        main: 10.5,
        extra: 15.5,
        complete: 26.5,
        type: "story",
        label: "~10.5 ч.",
        note: "Красочное анимационное приключение Кена: освобождение духов занимает ~10.5 ч."
    },
    1659420: {
        title: "UNCHARTED™: Наследие воров. Коллекция",
        main: 22,
        extra: 30,
        complete: 45,
        type: "story",
        label: "~22 ч.",
        note: "Кинематографичные приключения Нейтана Дрейка и Хлои Фрейзер: две грандиозные кампании суммарно на ~22 ч."
    },
    1466640: {
        title: "Road 96",
        main: 7.5,
        extra: 9.5,
        complete: 13.5,
        type: "story",
        label: "~7.5 ч.",
        note: "Процедурное дорожное приключение о побеге через границу: сюжетная арка занимает ~7.5 ч."
    },
    1092790: {
        title: "Inscryption",
        main: 12.5,
        extra: 16.5,
        complete: 24,
        type: "story",
        label: "~12.5 ч.",
        note: "Загадочный карточный рогалик с мета-нарративом: все три акта истории занимают ~12.5 ч."
    },
    1281590: {
        title: "The Dark Pictures Anthology: House of Ashes",
        main: 6,
        extra: 7.5,
        complete: 11.5,
        type: "story",
        label: "~6 ч.",
        note: "Кинематографичный хоррор в древнем шумерском храме: прохождение истории занимает ~6 ч."
    },
    939850: {
        title: "The Dark Pictures Anthology: Man of Medan",
        main: 4.5,
        extra: 6,
        complete: 10,
        type: "story",
        label: "~4.5 ч."
    },
    1622910: {
        title: "Still Wakes the Deep",
        main: 4.5,
        extra: 5.5,
        complete: 7.5,
        type: "story",
        label: "~4.5 ч.",
        note: "Атмосферный психологический хоррор на буровой платформе в Северном море: сюжет занимает ~4.5 ч."
    },
    1794960: {
        title: "Sonic Origins",
        main: 8,
        extra: 14,
        complete: 25,
        type: "story",
        label: "~8 ч.",
        note: "Сборник классических 16-битных частей Соника: прохождение сюжетного режима всех игр занимает ~8 ч."
    },
    203650: {
        title: "SONIC THE HEDGEHOG 4 Episode II",
        main: 2.5,
        extra: 4.5,
        complete: 7,
        type: "story",
        label: "~2.5 ч."
    },
    202530: {
        title: "SONIC THE HEDGEHOG 4 Episode I",
        main: 2,
        extra: 3.5,
        complete: 5.5,
        type: "story",
        label: "~2 ч."
    },
    2055290: {
        title: "Sonic Colors: Ultimate",
        main: 4.5,
        extra: 8,
        complete: 18,
        type: "story",
        label: "~4.5 ч."
    },
    389730: {
        title: "TEKKEN 7",
        main: 4,
        extra: 8.5,
        complete: 18.5,
        type: "story",
        label: "~4 ч.",
        note: "Сюжетная кампания семьи Мисима занимает ~4 ч. + бесконечные соревновательные бои."
    },
    413150: {
        title: "Stardew Valley",
        main: 52,
        extra: 93,
        complete: 150,
        type: "endless",
        label: "~52 ч. / ∞",
        note: "Уютная фермерская RPG: базовое закрытие узелков клуба занимает ~52 ч., а остров и жизнь долины — бесконечны."
    },
    433340: {
        title: "Slime Rancher",
        main: 14,
        extra: 22.5,
        complete: 35,
        type: "story",
        label: "~14 ч.",
        note: "Приключения Беатрикс Лебо на Запределье: сюжетные письма и локации проходятся за ~14 ч."
    },
    1356280: {
        title: "Kitaria Fables",
        main: 18,
        extra: 25,
        complete: 40,
        type: "story",
        label: "~18 ч.",
        note: "Милое кошачье RPG-приключение с фермерством и крафтом: кампания занимает ~18 ч."
    },
    1432860: {
        title: "Sun Haven",
        main: 45,
        extra: 80,
        complete: 150,
        type: "story",
        label: "~45 ч.",
        note: "Фэнтезийная фермерская RPG с драконами и магией: сюжетные квесты занимают ~45 ч."
    },
    960910: {
        title: "Heavy Rain",
        main: 10,
        extra: 13,
        complete: 25.5,
        type: "story",
        label: "~10 ч.",
        note: "Классический детективный триллер про Мастера Оригами: сюжет занимает ~10 ч."
    },
    313690: {
        title: "LEGO® Batman™ 3: Beyond Gotham",
        main: 9,
        extra: 18,
        complete: 33,
        type: "story",
        label: "~9 ч."
    },
    829110: {
        title: "LEGO® DC Super-Villains",
        main: 10,
        extra: 21,
        complete: 42,
        type: "story",
        label: "~10 ч."
    },
    233290: {
        title: "MURDERED: SOUL SUSPECT™",
        main: 7.5,
        extra: 9.5,
        complete: 12,
        type: "story",
        label: "~7.5 ч."
    },
    683320: {
        title: "GRIS",
        main: 3.5,
        extra: 4.5,
        complete: 6.5,
        type: "story",
        label: "~3.5 ч."
    },
    702670: {
        title: "Donut County",
        main: 2,
        extra: 2.5,
        complete: 3,
        type: "story",
        label: "~2 ч."
    },
    557600: {
        title: "Gorogoa",
        main: 2,
        extra: 2.5,
        complete: 3.5,
        type: "story",
        label: "~2 ч."
    },
    414340: {
        title: "Hellblade: Senua's Sacrifice",
        main: 7.5,
        extra: 8.5,
        complete: 9,
        type: "story",
        label: "~7.5 ч."
    },
    1577120: {
        title: "The Quarry",
        main: 10,
        extra: 14,
        complete: 28,
        type: "story",
        label: "~10 ч."
    },
    1164050: {
        title: "When The Past Was Around",
        main: 2,
        extra: 2.5,
        complete: 3,
        type: "story",
        label: "~2 ч."
    },
    475550: {
        title: "Beholder",
        main: 4,
        extra: 7,
        complete: 12.5,
        type: "story",
        label: "~4 ч."
    },
    307690: {
        title: "Sleeping Dogs: Definitive Edition",
        main: 14,
        extra: 21,
        complete: 31.5,
        type: "story",
        label: "~14 ч."
    },
    2653790: {
        title: "The Exit 8",
        main: 1,
        extra: 1.5,
        complete: 3,
        type: "story",
        label: "~1 ч."
    },
    1102130: {
        title: "Florence",
        main: 0.6,
        extra: 0.8,
        complete: 1,
        type: "story",
        label: "~35 мин."
    },
    1868140: {
        title: "DAVE THE DIVER",
        main: 25,
        extra: 36,
        complete: 65,
        type: "story",
        label: "~25 ч."
    },
    223710: {
        title: "Cry of Fear",
        main: 8,
        extra: 12,
        complete: 24,
        type: "story",
        label: "~8 ч."
    },
    337340: {
        title: "Finding Paradise",
        main: 5,
        extra: 5.5,
        complete: 6,
        type: "story",
        label: "~5 ч."
    },
    1643320: {
        title: "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
        main: 35,
        extra: 60,
        complete: 100,
        type: "story",
        label: "~35 ч."
    },
    1238840: {
        title: "Battlefield™ 1",
        main: 6.5,
        extra: 10,
        complete: 20,
        type: "story",
        label: "~6.5 ч."
    },
    2723430: {
        title: "inKONBINI: One Store. Many Stories",
        main: 3,
        extra: 4.5,
        complete: 7,
        type: "story",
        label: "~3 ч."
    },
    3021100: {
        title: "Five Hearts Under One Roof",
        main: 6,
        extra: 9,
        complete: 14,
        type: "story",
        label: "~6 ч."
    },
    615530: {
        title: "Love, Money, Rock'n'Roll",
        main: 22,
        extra: 32,
        complete: 55,
        type: "story",
        label: "~22 ч."
    },
    518790: {
        title: "theHunter: Call of the Wild™",
        main: 45,
        extra: 110,
        complete: 250,
        type: "endless",
        label: "~45 ч. / ∞"
    },
    255710: {
        title: "Cities: Skylines",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Градострой"
    },
    1222670: {
        title: "The Sims™ 4",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Песочница"
    },
    289070: {
        title: "Sid Meier's Civilization VI",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Стратегия"
    },
    916440: {
        title: "Anno 1800",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Стратегия"
    },
    227860: {
        title: "Castle Story",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Песочница"
    },
    508440: {
        title: "Totally Accurate Battle Simulator",
        main: 8,
        extra: 15,
        complete: 30,
        type: "story",
        label: "~8 ч."
    },
    1600780: {
        title: "MY LITTLE PONY: Приключение в бухте Мэритайм",
        main: 2,
        extra: 2.5,
        complete: 3,
        type: "story",
        label: "~2 ч."
    },

    // ── Автосимуляторы & Гонки ────────────────────────────────────────────────
    1551360: {
        title: "Forza Horizon 5",
        main: 19,
        extra: 50,
        complete: 110,
        type: "racing",
        label: "~19 ч.",
        mainLabel: "Кампания фестиваля",
        extraLabel: "Все гонки и заезды",
        compLabel: "100% Зал славы",
        note: "Фестиваль Horizon в Мексике: кампания занимает ~19 ч., а на заезды и исследования уйдёт 50+ ч."
    },
    1222680: {
        title: "Need for Speed™ Heat",
        main: 13,
        extra: 23,
        complete: 42,
        type: "racing",
        label: "~13 ч.",
        mainLabel: "Сюжетная кампания",
        extraLabel: "Сюжет + Доп. заезды",
        compLabel: "100% Золотые медали",
        note: "Дневные официальные гонки и ночные нелегальные заезды в Палм-Сити: сюжет занимает ~13 ч."
    },
    1846380: {
        title: "Need for Speed™ Unbound",
        main: 22,
        extra: 35,
        complete: 60,
        type: "racing",
        label: "~22 ч.",
        mainLabel: "Гранд-финал (Сюжет)",
        extraLabel: "Все состязания",
        compLabel: "100% Коллекция машин",
        note: "Путь к Гранд-заезду Лейкшора: прохождение сюжетной квалификации занимает ~22 ч."
    },
    1262580: {
        title: "Need for Speed™ Payback",
        main: 16.5,
        extra: 28,
        complete: 55,
        type: "racing",
        label: "~16.5 ч."
    },
    1465360: {
        title: "SnowRunner",
        main: 95,
        extra: 200,
        complete: 330,
        type: "racing",
        label: "Кооп / ~95 ч.",
        mainLabel: "Контракты регионов",
        extraLabel: "Все поручения",
        compLabel: "100% Все вышки и грузы",
        note: "Суровое преодоление бездорожья: основные контракты занимают ~95 ч., а полное закрытие регионов — от 200 ч.!"
    },
    284160: {
        title: "BeamNG.drive",
        main: null,
        extra: null,
        complete: null,
        type: "endless",
        label: "∞ Песочница",
        note: "Продвинутая мягкотельная физика деформации автомобилей — бесконечные тесты и эксперименты."
    },

    // ── Программы & Творческие инструменты (HLTB не отображается) ─────────────
    1325860: { title: "VTube Studio", type: "tool", isTool: true },
    280680: { title: "Krita", type: "tool", isTool: true },
    431960: { title: "Wallpaper Engine", type: "tool", isTool: true },
    365670: { title: "Blender", type: "tool", isTool: true },
    2942: { title: "OBS Studio", type: "tool", isTool: true },
    1905180: { title: "OBS Studio", type: "tool", isTool: true },
    2135: { title: "Soundpad", type: "tool", isTool: true },
    629520: { title: "Soundpad", type: "tool", isTool: true },
    1814730: { title: "Soundpad Demo", type: "tool", isTool: true },
    1949770: { title: "Rock Simulator 2", type: "tool", isTool: true },
    2784840: { title: "EGG", type: "tool", isTool: true },
    438100: { title: "VRChat", type: "multi", label: "∞ Социальная" }
};

/**
 * Проверка: является ли тайтл рабочей программой / софтом, а не видеоигрой
 */
function isSoftwareOrTool(game) {
    if (!game) return false;
    const appId = Number(game.id);
    const toolIds = new Set([1325860, 280680, 431960, 365670, 2942, 1905180, 2135, 629520, 1814730, 1949770, 2784840, 343510, 882000, 1677740]);
    if (toolIds.has(appId)) return true;

    const title = (game.title || '').toLowerCase();
    if (['vtube studio', 'krita', 'wallpaper engine', 'blender', 'soundpad', 'obs studio', 'rock simulator', 'egg', 'aseprite', 'fps monitor', 'sharex', 'voicemeeter'].some(t => title.includes(t))) {
        return true;
    }

    const genres = Array.isArray(game.genres) ? game.genres.map(g => g.toLowerCase()) : [];
    const toolKeywords = ['софт', 'инструменты', 'утилиты', 'дизайн', 'иллюстрация', 'анимация', 'vtuber', 'utilities', 'software', 'design & illustration', 'animation & modeling', 'audio production', 'web publishing'];
    const gameKeywords = ['экшен', 'приключения', 'ролевая', 'rpg', 'хоррор', 'платформер', 'головоломка', 'шутер', 'стратегия', 'гонки', 'выживание'];

    const hasTool = genres.some(g => toolKeywords.some(tk => g.includes(tk)));
    const hasGame = genres.some(g => gameKeywords.some(gk => g.includes(gk)));

    return hasTool && !hasGame;
}

/**
 * Получить данные HowLongToBeat для игры
 * @param {Object} game Объект игры из window.STEAM_GAMES
 * @returns {Object} Информация HLTB { main, extra, complete, type, label, mainLabel, extraLabel, compLabel, note, url, isTool }
 */
window.getHltbData = function(game) {
    if (!game) return null;

    // 1. Проверяем программы и инструменты (для них HLTB не выводится)
    if (isSoftwareOrTool(game)) {
        return {
            isTool: true,
            type: 'tool',
            label: null
        };
    }

    const appId = Number(game.id);
    let entry = window.HLTB_DATA[appId];

    // Fallback: поиск по названию без регистра
    if (!entry && game.title) {
        const titleLower = game.title.trim().toLowerCase();
        for (const key of Object.keys(window.HLTB_DATA)) {
            const item = window.HLTB_DATA[key];
            if (item && item.title && item.title.toLowerCase() === titleLower) {
                entry = item;
                break;
            }
        }
    }

    if (entry && entry.isTool) {
        return entry;
    }

    // Если прямого совпадения нет — строим эвристическую оценку на базе жанров
    if (!entry) {
        const genres = Array.isArray(game.genres) ? game.genres.join(' ').toLowerCase() : '';
        const title = (game.title || '').toLowerCase();

        // 1. Кооперативные игры (проверяются ДО общего мультиплеера!)
        const isCoop = genres.includes('кооператив') || genres.includes('кооп') || genres.includes('co-op') || genres.includes('cooperative') || title.includes('together') || title.includes('co-op');
        if (isCoop) {
            entry = {
                main: null,
                extra: null,
                complete: null,
                type: 'coop',
                label: 'Кооп',
                mainLabel: 'Кооператив',
                note: 'Кооперативная игра для совместного прохождения с друзьями.'
            };
        }
        // 2. Соревновательный мультиплеер, пати-игры, батл-рояли, ММО, сессионные
        else if (genres.includes('мультиплеер') || genres.includes('многопользовательские') || genres.includes('пати') || genres.includes('party') || genres.includes('соревновательная') || genres.includes('pvp') || genres.includes('battle royale') || genres.includes('королевская битва') || genres.includes('ммо') || genres.includes('mmorpg') || genres.includes('moba') || genres.includes('сессионная') || genres.includes('онлайн') || ['dota', 'counter-strike', 'cs:go', 'cs2', 'apex', 'valorant', 'team fortress', 'rust', 'pubg', 'overwatch', 'paladins', 'naraka', 'crossout'].some(t => title.includes(t))) {
            const isParty = genres.includes('пати') || genres.includes('party') || title.includes('party');
            entry = {
                main: null,
                extra: null,
                complete: null,
                type: 'multi',
                label: isParty ? '∞ Пати-игра' : '∞ Мультиплеер',
                note: isParty ? 'Пати-игра для веселья в компании друзей.' : 'Соревновательная сессионная игра без сюжетного финала.'
            };
        }
        // 3. Гонки и симуляторы (Trackmania, DiRT, Rally, Forza, NFS)
        else if (genres.includes('гонки') || genres.includes('racing') || title.includes('rally') || title.includes('trackmania') || title.includes('forza') || title.includes('kart') || title.includes('speed')) {
            entry = {
                main: 16,
                extra: 30,
                complete: 65,
                type: 'racing',
                label: '~16 ч.',
                mainLabel: 'Карьера / Все трассы',
                extraLabel: 'Все чемпионаты',
                compLabel: '100% Золотые медали',
                note: 'Одиночные карьерные чемпионаты и заезды на время.'
            };
        }
        // 4. Ролевые игры (RPG)
        else if (genres.includes('ролевая') || genres.includes('rpg')) {
            entry = {
                main: 35,
                extra: 65,
                complete: 110,
                type: 'story',
                label: '~35 ч.',
                mainLabel: 'Сюжетная кампания',
                extraLabel: 'Сюжет + Доп. квесты',
                compLabel: '100% Полное прохождение'
            };
        }
        // 5. Визуальные новеллы
        else if (genres.includes('визуальная новелла') || genres.includes('новелла')) {
            entry = {
                main: 6,
                extra: 10,
                complete: 16,
                type: 'story',
                label: '~6 ч.',
                mainLabel: 'Основная линия',
                extraLabel: 'Все руты',
                compLabel: '100% Все концовки'
            };
        }
        // 6. Хорроры
        else if (genres.includes('хоррор')) {
            entry = {
                main: 5,
                extra: 7.5,
                complete: 11,
                type: 'story',
                label: '~5 ч.',
                mainLabel: 'Сюжетная кампания',
                extraLabel: 'Сюжет + Секреты',
                compLabel: '100% Полное прохождение'
            };
        }
        // 7. Платформеры и инди
        else if (genres.includes('платформер') || genres.includes('инди')) {
            entry = {
                main: 4.5,
                extra: 7.5,
                complete: 14,
                type: 'story',
                label: '~4.5 ч.',
                mainLabel: 'Сюжетная кампания',
                extraLabel: 'Сюжет + Доп. уровни',
                compLabel: '100% Полное прохождение'
            };
        }
        // 8. Стандартные игры
        else {
            entry = {
                main: 8,
                extra: 14,
                complete: 24,
                type: 'story',
                label: '~8 ч.',
                mainLabel: 'Сюжетная кампания',
                extraLabel: 'Сюжет + Доп. задания',
                compLabel: '100% Полное прохождение'
            };
        }
    }

    const hltbSearchUrl = `https://howlongtobeat.com/?q=${encodeURIComponent(game.title || '')}`;

    return {
        ...entry,
        url: hltbSearchUrl
    };
};

/**
 * Сформировать понятное сравнительное описание между наигранными часами и HLTB
 */
window.formatHltbComparison = function(game, hltb) {
    if (!game || !hltb || hltb.isTool) return null;

    if (hltb.note) {
        return hltb.note;
    }

    const hours = Number(game.hours) || 0;

    if (hltb.type === 'multi' || hltb.type === 'endless') {
        if (hours > 0) {
            return `Бесконечная сессионная игра: Yurummi провёл в ней уже ${hours >= 1000 ? hours.toLocaleString('ru-RU') : hours} ч.`;
        }
        return 'Бесконечная игра или соревновательный мультиплеер без фиксированного сюжета.';
    }

    if (hltb.type === 'racing') {
        if (hours === 0) return `В бэклоге: карьера и заезды займут примерно ~${hltb.main} ч.`;
        return `🏎️ Заезды и трассы: наиграно ${hours} ч. (среднее время карьеры по HLTB: ~${hltb.main} ч.).`;
    }

    if (hltb.type === 'coop') {
        if (hours > 0) return `👥 Кооператив: Yurummi отыграл ${hours >= 1000 ? hours.toLocaleString('ru-RU') : hours} ч. в совместных сессиях и миссиях с друзьями.`;
        return '👥 Кооперативная игра для совместного прохождения с друзьями.';
    }

    if (!hltb.main) return null;

    if (hours === 0) {
        return `В бэклоге: на прохождение кампании уйдёт примерно ~${hltb.main} ч.`;
    }

    if (hours <= hltb.main * 0.85) {
        return `⚡ Спидран-темп: Yurummi уложился быстрее среднего (${hours} ч. против ~${hltb.main} ч. на HLTB)!`;
    }

    if (hours >= hltb.main * 1.6) {
        return `🔍 Глубокое погружение: Yurummi провёл в игре ${hours} ч., изучив больше, чем базовую кампанию (~${hltb.main} ч.).`;
    }

    return `🎯 Отличный темп: наиграно ${hours} ч. при средней длительности кампании ~${hltb.main} ч. по HLTB.`;
};
