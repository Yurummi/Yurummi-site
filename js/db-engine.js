'use strict';

/**
 * YurummiDB — Клиентский движок статической базы данных (Dual-Transport: JSON fetch + offline file:// chunks)
 * Обеспечивает:
 *  - Ленивую подгрузку таблиц по зонам и вкладкам (не грузит лишние мегабайты сразу)
 *  - Индексацию франшиз (O(1) вместо перебора всей базы на каждую карточку)
 *  - Предвычисленный поисковый индекс и кэш жанров
 *  - Полную телеметрию загрузки (время, транспорт, активные таблицы)
 */
(function (global) {
    const isFileProtocol = global.location && global.location.protocol === 'file:';

    const STEAM_GENRE_MAP = {
        'Экшены': 'Экшен',
        'Боевик': 'Экшен',
        'Приключенческие игры': 'Приключения',
        'Казуальные игры': 'Казуальные',
        'Казуальная': 'Казуальные',
        'Симуляторы': 'Симулятор',
        'Ролевые игры': 'RPG',
        'Ролевая игра': 'RPG',
        'Стратегии': 'Стратегия',
        'Многопользовательские игры': 'Мультиплеер',
        'Бесплатные': 'Бесплатная',
    };

    const STEAM_TAG_ENRICH = {
        739630:  ['Хоррор', 'Кооператив', 'Мистика', 'Инди'],
        1929610: ['Хоррор', 'Кооператив', 'Мистика', 'Экшен'],
        1966720: ['Хоррор', 'Кооператив', 'Выживание', 'Инди'],
        3241660: ['Хоррор', 'Кооператив', 'Экшен', 'Инди'],
        2881650: ['Хоррор', 'Кооператив', 'Юмор', 'Инди'],
        1850740: ['Хоррор', 'Кооператив', 'Мистика'],
        1274570: ['Хоррор', 'Кооператив', 'Выживание'],
        1846380: ['Гонки', 'Аркада', 'Стилизация', 'Мультиплеер'],
        1304930: ['Хоррор', 'Кооператив', 'Выживание', 'Экшен'],
        1695840: ['Хоррор', 'Кооператив', 'Мистика', 'Инди'],
        1807080: ['Хоррор', 'Кооператив', 'Мистика', 'Инди'],
        1172620: ['Кооператив', 'Пираты', 'Мультиплеер', 'Приключения'],
        1203220: ['Королевская битва', 'Кооператив', 'Экшен', 'Мультиплеер'],
        444090:  ['Геройский шутер', 'Кооператив', 'Мультиплеер', 'Бесплатная'],
        548430:  ['Кооператив', 'Шутер', 'Космос', 'Экшен'],
        1097150: ['Вечеринка', 'Кооператив', 'Мультиплеер', 'Платформер'],
        3527290: ['Кооператив', 'Приключения', 'Выживание', 'Экшен'],
        1599600: ['Симулятор', 'Кооператив', 'Кулинария', 'Менеджмент'],
        448510:  ['Симулятор', 'Кооператив', 'Кулинария', 'Вечеринка'],
        728880:  ['Симулятор', 'Кооператив', 'Кулинария', 'Вечеринка'],
        477160:  ['Головоломка', 'Кооператив', 'Физика', 'Юмор'],
        2567870: ['Кооператив', 'Платформер', 'Физика', 'Челлендж'],
        1144200: ['Тактический шутер', 'Кооператив', 'Экшен', 'Реализм'],
        1203620: ['Выживание', 'Кооператив', 'Крафт', 'RPG'],
        1621690: ['Песочница', 'Кооператив', 'Выживание', 'Пиксельная'],
        774801:  ['Рогалик', 'Кооператив', 'Шутер', 'Экшен'],
        1119730: ['Симулятор', 'Кооператив', 'Строительство', 'Открытый мир'],
        2448970: ['Экшен-RPG', 'Подземелья', 'Кооператив', 'PvPvE'],
        2139020: ['Кооператив', 'Рогалик', 'Экшен', 'Платформер'],
        304930:  ['Выживание', 'Зомби', 'Кооператив', 'Песочница'],
        238370:  ['Экшен-RPG', 'Кооператив', 'Магия', 'Юмор'],
        582500:  ['Головоломка', 'Кооператив', 'Приключения'],
        677160:  ['Головоломка', 'Кооператив', 'Приключения'],
        865360:  ['Головоломка', 'Кооператив', 'Приключения'],
        1301720: ['Головоломка', 'Кооператив', 'Квест'],
        1509960: ['Платформер', 'Кооператив', 'Головоломка'],
        674940:  ['Файтинг', 'Кооператив', 'Физика', 'Юмор'],
        341800:  ['Головоломка', 'Кооператив', 'Бомбы', 'Общение'],
        1016920: ['Кооператив', 'Поезда', 'Пиксельная', 'Инди'],
        570:     ['MOBA', 'Стратегия', 'Мультиплеер', 'Киберспорт'],
        730:     ['Шутер', 'Экшен', 'Мультиплеер', 'Киберспорт'],
        1172470: ['Королевская битва', 'Шутер', 'Экшен', 'Мультиплеер'],
        252950:  ['Спорт', 'Мультиплеер', 'Гонки', 'Соревновательная'],
        386180:  ['Гонки на выживание', 'Мультиплеер', 'Крафт', 'Экшен'],
        1422450: ['Шутер от третьего лица', 'MOBA', 'Мультиплеер', 'Экшен'],
        1190340: ['Королевская битва', 'Шутер', 'Мультиплеер', 'Экшен'],
        1260320: ['Вечеринка', 'Мультиплеер', 'Физика', 'Юмор'],
        880940:  ['Вечеринка', 'Мультиплеер', 'Мини-игры', 'Юмор'],
        3097560: ['Вечеринка', 'Мультиплеер', 'Психология', 'Карточная'],
        207140:  ['Платформер', 'Мультиплеер', 'Гонки', 'Вечеринка'],
        431240:  ['Мини-гольф', 'Мультиплеер', 'Казуальная', 'Спорт'],
        1088150: ['Рисование', 'Мультиплеер', 'Казуальная', 'Слова'],
        3553500: ['Викторина', 'Мультиплеер', 'Казуальная', 'Слова'],
        1170970: ['Стрим-игра', 'Казуальная', 'Мультиплеер', 'Симулятор'],
        1455630: ['Настольная', 'Мультиплеер', 'Казуальная', 'Семья'],
        945360:  ['Социальная дедукция', 'Мультиплеер', 'Пати-игра'],
        438100:  ['Социальная сеть', 'Песочница', 'VR', 'Мультиплеер'],
        1551360: ['Гонки', 'Симулятор', 'Открытый мир', 'Мультиплеер'],
        1465360: ['Симулятор', 'Гонки', 'Бездорожье', 'Кооператив'],
        1222680: ['Гонки', 'Аркада', 'Открытый мир', 'Тюнинг'],
        690790:  ['Гонки', 'Симулятор', 'Ралли', 'Реализм'],
        11020:   ['Гонки', 'Аркада', 'Тайм-триал', 'Киберспорт'],
        2225070: ['Гонки', 'Аркада', 'Тайм-триал', 'Мультиплеер'],
        284160:  ['Физика', 'Симулятор', 'Гонки', 'Песочница'],
        1245620: ['Соулслайк', 'RPG', 'Экшен', 'Фэнтези'],
        1086940: ['RPG', 'Пошаговая', 'Фэнтези', 'Приключения'],
        271590:  ['Открытый мир', 'Экшен', 'Мультиплеер', 'Криминал'],
        2138710: ['Боевые искусства', 'Экшен', 'Сюжет', 'Сложная'],
        322330:  ['Выживание', 'Кооператив', 'Инди', 'Крафт'],
        105600:  ['Песочница', 'Выживание', 'Приключения', 'Пиксельная'],
        383870:  ['Сюжет', 'Приключения', 'Атмосфера', 'Инди'],
        2527500: ['Хоррор', 'Психология', 'Аниме', 'Сюжет'],
        501300:  ['Сюжет', 'Приключения', 'Интерактивная история'],
        2533960: ['Строительство', 'Казуальные', 'Песочница', 'Инди'],
        2653790: ['Хоррор', 'Головоломка', 'Психология'],
        1102130: ['Романтика', 'Сюжет', 'Казуальные', 'Инди'],
        1222140: ['Интерактивное кино', 'Сюжет', 'Фантастика', 'Детектив'],
        214490:  ['Хоррор', 'Выживание', 'Фантастика', 'Стелс'],
        1954200: ['Экшен', 'Приключения', 'Фэнтези', 'Красивая'],
        1659420: ['Экшен', 'Приключения', 'Кинематографичная', 'Сюжет'],
        1466640: ['Сюжет', 'Приключения', 'Инди', 'Выборы'],
        1092790: ['ККИ', 'Рогалик', 'Психология', 'Мистика'],
        1281590: ['Интерактивное кино', 'Хоррор', 'Сюжет', 'Выживание'],
        1622910: ['Хоррор', 'Сюжет', 'Атмосфера', 'Инди'],
        433340:  ['Приключения', 'Исследования', 'Слаймы', 'Милая'],
        413150:  ['Ферма', 'RPG', 'Пиксельная', 'Песочница'],
    };

    const TOOL_IDS = new Set([1325860, 280680, 431960, 365670, 2942, 1905180, 2135, 629520, 1814730, 1949770, 2784840, 343510, 882000, 1677740]);
    const TOOL_TITLE_KEYWORDS = ['vtube studio', 'krita', 'wallpaper engine', 'blender', 'soundpad', 'obs studio', 'rock simulator', 'egg', 'aseprite', 'fps monitor', 'sharex', 'voicemeeter'];
    const TOOL_GENRE_KW = ['софт', 'инструменты', 'утилиты', 'дизайн', 'иллюстрация', 'анимация', 'vtuber', 'utilities', 'software', 'design & illustration', 'animation & modeling', 'audio production', 'web publishing'];
    const GAME_GENRE_KW = ['экшен', 'приключения', 'ролевая', 'rpg', 'хоррор', 'платформер', 'головоломка', 'шутер', 'стратегия', 'гонки', 'выживание'];

    const CORE_MEDIA_TABLES = ['media_films', 'media_series', 'media_cartoons', 'media_marvel', 'media_dc', 'media_manga', 'media_anime'];
    const ALL_MEDIA_TABLES = [...CORE_MEDIA_TABLES, 'media_shelf'];
    const ALL_GAME_TABLES = ['games_steam', 'games_custom', 'games_hltb'];

    const pendingWaiters = new Map();

    global.__YURUMMI_DB_INGEST__ = function (tableName, payload) {
        const resolver = pendingWaiters.get(tableName);
        if (resolver) {
            pendingWaiters.delete(tableName);
            resolver(payload);
        }
    };

    function getSeasonOrderNum(title) {
        if (/\b0\b|фильм\s*0|нулевой/i.test(title)) return 0;
        if (/девочки-зайк/i.test(title)) return 1;
        if (/санта-клаус/i.test(title)) return 2;
        if (/кусочек|piece/i.test(title)) return 2;
        if (/месть\s*масамунэ\s*r\b/i.test(title)) return 2;
        if (/квартал\s*красных\s*фонарей/i.test(title)) return 2;
        if (/деревня\s*кузнецов/i.test(title)) return 3;
        if (/тренировка\s*хашира/i.test(title)) return 4;
        if (/вечность\s*и\s*призрак/i.test(title)) return 2;
        if (/вайолет\s*эвергарден\.\s*фильм/i.test(title)) return 3;
        if (/восстань\s*из\s*тени/i.test(title)) return 2;
        if (/\b1\b|первый\s+сезон|часть\s+1/i.test(title)) return 1;
        const m = title.match(/(?:\s+|сезон\s+|часть\s+)(\d+)/i);
        if (m) return parseInt(m[1], 10);
        if (/спешл|special/i.test(title)) return 920;
        if (/фильм|movie/i.test(title)) return 900;
        if (/рекап|ova|ona/i.test(title)) return 950;
        return 1;
    }

    class DatabaseEngine {
        constructor() {
            this.manifest = null;
            this.rawTables = new Map();
            this.loadPromises = new Map();
            this.telemetry = [];
            this.mediaItems = [];
            this.mediaUidSeq = 1;
            this.mediaByTable = new Map();
            this.franchiseIndex = new Map();
            this.gamesProfile = null;
            this.gamesMerged = [];
            this.hltbMap = {};
            this.gamesBuilt = false;
            this.transportMode = isFileProtocol ? 'Local Chunk (<script>)' : 'JSON Fetch (HTTP)';
        }

        async loadChunkViaScript(tableName) {
            return new Promise((resolve, reject) => {
                pendingWaiters.set(tableName, resolve);
                const script = document.createElement('script');
                script.src = `db/chunks/${tableName}.js`;
                script.async = true;
                script.onerror = () => {
                    pendingWaiters.delete(tableName);
                    reject(new Error(`Failed to load db/chunks/${tableName}.js`));
                };
                document.head.appendChild(script);
            });
        }

        async loadTable(tableName) {
            if (this.rawTables.has(tableName)) {
                return this.rawTables.get(tableName);
            }
            if (this.loadPromises.has(tableName)) {
                return this.loadPromises.get(tableName);
            }

            const t0 = performance.now();
            const promise = (async () => {
                let data;
                let usedTransport = 'Local Chunk';
                if (!isFileProtocol) {
                    try {
                        const res = await fetch(`db/tables/${tableName}.json`, { cache: 'default' });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        data = await res.json();
                        usedTransport = 'JSON Fetch';
                    } catch (err) {
                        data = await this.loadChunkViaScript(tableName);
                        usedTransport = 'Chunk Fallback';
                    }
                } else {
                    data = await this.loadChunkViaScript(tableName);
                    usedTransport = 'Local Chunk';
                }

                this.rawTables.set(tableName, data);
                this._indexTable(tableName, data);
                const ms = Math.round((performance.now() - t0) * 10) / 10;
                const count = Array.isArray(data)
                    ? data.length
                    : (data && Array.isArray(data.games) ? data.games.length : Object.keys(data || {}).length);
                this.telemetry.push({ table: tableName, transport: usedTransport, ms, count });
                return data;
            })();

            this.loadPromises.set(tableName, promise);
            return promise;
        }

        _indexTable(tableName, data) {
            if (tableName.startsWith('media_') && Array.isArray(data)) {
                const enriched = data.map(raw => {
                    const poster = raw.poster
                        ? raw.poster.replace(/https?:\/\/shikimori\.(one|me)/g, 'https://shikimori.io')
                        : '';
                    const item = {
                        ...raw,
                        _uid: `m${this.mediaUidSeq++}`,
                        _table: tableName,
                        poster,
                        _search: [
                            raw.title || '',
                            raw.review || '',
                            raw.desc || '',
                            raw.director || '',
                            raw.franchiseTitle || '',
                            Array.isArray(raw.genres) ? raw.genres.join(' ') : '',
                        ].join(' ').toLowerCase(),
                    };
                    return item;
                });
                this.mediaByTable.set(tableName, enriched);
                this.mediaItems.push(...enriched);
                this._rebuildFranchiseIndex();
            } else if (tableName === 'games_hltb' && data) {
                this.hltbMap = data;
            }
        }

        _rebuildFranchiseIndex() {
            const groups = new Map();
            for (const item of this.mediaItems) {
                if (!item.franchise) continue;
                const key = `${item.category}::${item.franchise}`;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(item);
            }

            this.franchiseIndex.clear();
            for (const [key, list] of groups.entries()) {
                if (list.length <= 1) continue;
                const sorted = [...list].sort((a, b) => {
                    const oa = a.franchiseOrder ?? a.chronoOrder ?? getSeasonOrderNum(a.title);
                    const ob = b.franchiseOrder ?? b.chronoOrder ?? getSeasonOrderNum(b.title);
                    if (oa !== ob) return oa - ob;
                    return a.title.localeCompare(b.title, 'ru');
                });
                const totalEpisodes = sorted.reduce((s, it) => s + (it.episodes || 0), 0);
                const watchedEpisodes = sorted.filter(it => it.status === 'watched').reduce((s, it) => s + (it.episodes || 0), 0);
                const info = {
                    key,
                    franchiseTitle: sorted.find(x => x.franchiseTitle)?.franchiseTitle || null,
                    items: sorted,
                    totalSeasons: sorted.length,
                    totalEpisodes,
                    watchedEpisodes,
                };
                for (let idx = 0; idx < sorted.length; idx++) {
                    this.franchiseIndex.set(sorted[idx]._uid, {
                        ...info,
                        currentIndex: idx + 1,
                    });
                }
            }
        }

        _buildGamesStore() {
            if (this.gamesBuilt) return;
            const steamObj = this.rawTables.get('games_steam');
            const customObj = this.rawTables.get('games_custom');
            if (!steamObj || !customObj) return;

            this.gamesProfile = { ...(steamObj.profile || {}) };
            const steamRaw = (steamObj.games || []).map(g => ({ ...g, platform: g.platform || 'Steam' }));

            // Apply explicit overrides (Sonic Adventure DX & 2 marathon completions)
            const overrideMap = new Map();
            for (const ov of (customObj.overrides || [])) {
                overrideMap.set(Number(ov.id), ov);
            }

            const existingIds = new Set();
            const normalizedSteam = steamRaw.map(g => {
                const aid = Number(g.id);
                existingIds.add(aid);
                const ov = overrideMap.get(aid);
                return ov ? { ...g, ...ov } : g;
            });

            const extraCustom = (customObj.games || [])
                .filter(g => !existingIds.has(Number(g.id)))
                .map(g => ({ ...g }));

            const combined = [...extraCustom, ...normalizedSteam].map(g => {
                const aid = Number(g.id);
                let cleanGenres = g.genres;
                if (STEAM_TAG_ENRICH[aid]) {
                    cleanGenres = [...STEAM_TAG_ENRICH[aid]];
                } else if (Array.isArray(g.genres)) {
                    const out = [];
                    for (const item of g.genres) {
                        const mapped = STEAM_GENRE_MAP[item] || item;
                        if (!out.includes(mapped)) out.push(mapped);
                    }
                    cleanGenres = out.length ? out : ['Экшен', 'Приключения'];
                } else {
                    cleanGenres = ['Экшен', 'Приключения'];
                }

                const toolFlag = this.isSoftware({ ...g, genres: cleanGenres });
                return {
                    ...g,
                    genres: cleanGenres,
                    _isTool: toolFlag,
                    _search: [
                        g.title || '',
                        g.desc || '',
                        g.reviewText || '',
                        g.platform || '',
                        cleanGenres.join(' '),
                    ].join(' ').toLowerCase(),
                };
            });

            this.gamesMerged = combined;
            this.gamesProfile.gamesCount = combined.length;
            this.gamesProfile.reviewsCount = combined.filter(g => g.reviewed || (g.reviewText || '').trim()).length;
            this.gamesBuilt = true;
        }

        async init(preferredZone = 'media') {
            this.manifest = await this.loadTable('manifest');
            if (preferredZone === 'games') {
                await this.ensureGames();
            } else {
                await this.ensureCoreMedia();
            }
            return this.manifest;
        }

        async ensureCoreMedia() {
            await Promise.all(CORE_MEDIA_TABLES.map(t => this.loadTable(t)));
        }

        async ensureShelf() {
            await this.loadTable('media_shelf');
        }

        async ensureAllMedia() {
            await Promise.all(ALL_MEDIA_TABLES.map(t => this.loadTable(t)));
        }

        async ensureGames() {
            await Promise.all(ALL_GAME_TABLES.map(t => this.loadTable(t)));
            this._buildGamesStore();
        }

        getStats() {
            return this.manifest ? this.manifest.stats : null;
        }

        getWeeklyHighlight() {
            const cfg = this.manifest?.weeklyHighlight || {
                titleMatch: 'Топ Ган: Мэверик',
                badge: 'Рекомендация недели',
                quote: 'Круто отснят и ваще эмоции круто передал. На одном дыхании смотрелся.',
            };
            const q = (cfg.titleMatch || '').toLowerCase();
            const found = this.mediaItems.find(i => i.title && i.title.toLowerCase().includes(q))
                || this.mediaItems.find(i => (i.rating || 0) >= 100)
                || this.mediaItems[0]
                || null;
            return { cfg, item: found };
        }

        getScaleLegend() {
            return this.manifest?.scaleLegend || [];
        }

        getFranchise(item) {
            if (!item || !item._uid) return null;
            return this.franchiseIndex.get(item._uid) || null;
        }

        getMediaBaseList(tab) {
            if (tab === 'shelf') return this.mediaByTable.get('media_shelf') || [];
            if (tab === 'anime') return this.mediaByTable.get('media_anime') || [];
            if (tab === 'film') return this.mediaByTable.get('media_films') || [];
            if (tab === 'marvel') return this.mediaByTable.get('media_marvel') || [];
            if (tab === 'dc') return this.mediaByTable.get('media_dc') || [];
            if (tab === 'series') return this.mediaByTable.get('media_series') || [];
            if (tab === 'cartoon') return this.mediaByTable.get('media_cartoons') || [];
            if (tab === 'manga') return this.mediaByTable.get('media_manga') || [];
            if (tab === 'all') {
                // Combine active collections (exclude 327 shelf backlog unless planned filter explicitly chosen)
                return CORE_MEDIA_TABLES.flatMap(t => this.mediaByTable.get(t) || []);
            }
            return this.mediaItems;
        }

        getMediaGenres(tab) {
            const base = this.getMediaBaseList(tab);
            const counts = {};
            for (const it of base) {
                if (!Array.isArray(it.genres)) continue;
                for (const g of it.genres) {
                    counts[g] = (counts[g] || 0) + 1;
                }
            }
            return Object.keys(counts)
                .sort((a, b) => (counts[b] - counts[a]) || a.localeCompare(b, 'ru'))
                .map(name => ({ name, count: counts[name] }));
        }

        queryMedia({ tab = 'all', filter = 'all', genres = new Set(), genreMode = 'and', search = '', sort = 'rating-desc' } = {}) {
            let items;
            if (tab === 'all' && filter === 'planned') {
                items = [...this.mediaItems];
            } else {
                items = [...this.getMediaBaseList(tab)];
            }

            if (genres && genres.size > 0) {
                const sel = Array.from(genres);
                items = items.filter(i => {
                    if (!Array.isArray(i.genres) || i.genres.length === 0) return false;
                    return genreMode === 'and'
                        ? sel.every(g => i.genres.includes(g))
                        : sel.some(g => i.genres.includes(g));
                });
            }

            if (filter === 'ongoing') {
                items = items.filter(i =>
                    i.status === 'watching' ||
                    (i.category === 'anime' && Array.isArray(i.genres) && i.genres.some(g => g.toLowerCase().includes('онгоинг')))
                );
            } else if (filter === 'masterpiece') {
                items = items.filter(i => i.tier === 'masterpiece' || (i.rating !== null && i.rating >= 100));
            } else if (filter === 'exceeded') {
                items = items.filter(i => i.rating !== null && i.rating >= 20 && i.rating < 100);
            } else if (filter === 'solid') {
                items = items.filter(i => i.rating === 10);
            } else if (filter === 'reviews') {
                items = items.filter(i => i.review && i.review.trim().length > 0);
            } else if (filter === 'watched') {
                items = items.filter(i => i.status === 'watched');
            } else if (filter === 'watching') {
                items = items.filter(i => i.status === 'watching');
            } else if (filter === 'planned') {
                items = items.filter(i => i.status === 'planned');
            }

            if (search) {
                const q = search.trim().toLowerCase();
                if (q) items = items.filter(i => i._search.includes(q));
            }

            if (sort === 'chrono') {
                items.sort((a, b) => {
                    const ca = a.chronoOrder ?? 9999;
                    const cb = b.chronoOrder ?? 9999;
                    return ca !== cb ? ca - cb : a.title.localeCompare(b.title, 'ru');
                });
            } else if (sort === 'rating-desc') {
                items.sort((a, b) => {
                    const ra = a.rating !== null && a.rating !== undefined ? a.rating : -999;
                    const rb = b.rating !== null && b.rating !== undefined ? b.rating : -999;
                    return rb !== ra ? rb - ra : a.title.localeCompare(b.title, 'ru');
                });
            } else if (sort === 'rating-asc') {
                items.sort((a, b) => {
                    const ra = a.rating !== null && a.rating !== undefined ? a.rating : 99999;
                    const rb = b.rating !== null && b.rating !== undefined ? b.rating : 99999;
                    return ra !== rb ? ra - rb : a.title.localeCompare(b.title, 'ru');
                });
            } else if (sort === 'title-asc') {
                items.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
            } else if (sort === 'title-desc') {
                items.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
            }

            return items;
        }

        isSoftware(game) {
            if (!game) return false;
            const aid = Number(game.id);
            if (TOOL_IDS.has(aid)) return true;
            const title = (game.title || '').toLowerCase();
            if (TOOL_TITLE_KEYWORDS.some(t => title.includes(t))) return true;
            const genres = Array.isArray(game.genres) ? game.genres.map(g => g.toLowerCase()) : [];
            const hasTool = genres.some(g => TOOL_GENRE_KW.some(tk => g.includes(tk)));
            const hasGame = genres.some(g => GAME_GENRE_KW.some(gk => g.includes(gk)));
            return hasTool && !hasGame;
        }

        getHltb(game) {
            if (!game) return null;
            if (game._isTool || this.isSoftware(game)) {
                return { isTool: true, type: 'tool', label: null };
            }

            const appId = Number(game.id);
            let entry = this.hltbMap[String(appId)] || this.hltbMap[appId];

            if (!entry && game.title) {
                const tLower = game.title.trim().toLowerCase();
                for (const key of Object.keys(this.hltbMap)) {
                    const item = this.hltbMap[key];
                    if (item && item.title && item.title.toLowerCase() === tLower) {
                        entry = item;
                        break;
                    }
                }
            }

            if (entry && entry.isTool) return entry;

            if (!entry) {
                const genres = Array.isArray(game.genres) ? game.genres.join(' ').toLowerCase() : '';
                const title = (game.title || '').toLowerCase();
                const isCoop = genres.includes('кооператив') || genres.includes('кооп') || genres.includes('co-op') || title.includes('together');
                if (isCoop) {
                    entry = { main: null, extra: null, complete: null, type: 'coop', label: 'Кооп', mainLabel: 'Кооператив', note: 'Кооперативная игра для совместного прохождения с друзьями.' };
                } else if (genres.includes('мультиплеер') || genres.includes('пати') || genres.includes('party') || genres.includes('pvp') || genres.includes('moba') || ['dota', 'counter-strike', 'cs2', 'apex', 'paladins', 'naraka'].some(t => title.includes(t))) {
                    const isParty = genres.includes('пати') || title.includes('party');
                    entry = { main: null, extra: null, complete: null, type: 'multi', label: isParty ? '∞ Пати-игра' : '∞ Мультиплеер', note: isParty ? 'Пати-игра для веселья с друзьями.' : 'Соревновательная сессионная игра без сюжетного финала.' };
                } else if (genres.includes('гонки') || title.includes('rally') || title.includes('trackmania') || title.includes('forza')) {
                    entry = { main: 16, extra: 30, complete: 65, type: 'racing', label: '~16 ч.', mainLabel: 'Карьера / Трассы', extraLabel: 'Все чемпионаты', compLabel: '100% Золотые медали' };
                } else if (genres.includes('ролевая') || genres.includes('rpg')) {
                    entry = { main: 35, extra: 65, complete: 110, type: 'story', label: '~35 ч.', mainLabel: 'Сюжетная кампания', extraLabel: 'Сюжет + Допы', compLabel: '100% Идеал' };
                } else if (genres.includes('визуальная новелла')) {
                    entry = { main: 6, extra: 10, complete: 16, type: 'story', label: '~6 ч.', mainLabel: 'Основная линия', extraLabel: 'Все руты', compLabel: '100% Все концовки' };
                } else if (genres.includes('хоррор')) {
                    entry = { main: 5, extra: 7.5, complete: 11, type: 'story', label: '~5 ч.', mainLabel: 'Сюжетная кампания', extraLabel: 'Сюжет + Секреты', compLabel: '100% Идеал' };
                } else if (genres.includes('платформер') || genres.includes('инди')) {
                    entry = { main: 4.5, extra: 7.5, complete: 14, type: 'story', label: '~4.5 ч.', mainLabel: 'Сюжетная кампания', extraLabel: 'Сюжет + Уровни', compLabel: '100% Идеал' };
                } else {
                    entry = { main: 8, extra: 14, complete: 24, type: 'story', label: '~8 ч.', mainLabel: 'Сюжетная кампания', extraLabel: 'Сюжет + Допы', compLabel: '100% Идеал' };
                }
            }

            return {
                ...entry,
                url: `https://howlongtobeat.com/?q=${encodeURIComponent(game.title || '')}`,
            };
        }

        formatHltbComparison(game, hltb) {
            if (!game || !hltb || hltb.isTool) return null;
            if (hltb.note) return hltb.note;
            const hours = Number(game.hours) || 0;
            if (hltb.type === 'multi' || hltb.type === 'endless') {
                return hours > 0
                    ? `Сессионная игра: наиграно уже ${hours >= 1000 ? hours.toLocaleString('ru-RU') : hours} ч.`
                    : 'Соревновательный мультиплеер или песочница без сюжетного финала.';
            }
            if (hltb.type === 'coop') {
                return hours > 0
                    ? `Кооператив: отыграно ${hours >= 1000 ? hours.toLocaleString('ru-RU') : hours} ч. с друзьями.`
                    : 'Кооперативная игра для совместных сессий.';
            }
            if (!hltb.main) return null;
            if (hours === 0) return `В бэклоге: кампания займёт примерно ~${hltb.main} ч.`;
            if (hours <= hltb.main * 0.85) return `Спидран-темп: ${hours} ч. против ~${hltb.main} ч. в среднем по HLTB.`;
            if (hours >= hltb.main * 1.6) return `Глубокое погружение: ${hours} ч. при средней длительности ~${hltb.main} ч.`;
            return `В темпе HLTB: ${hours} ч. (среднее время кампании ~${hltb.main} ч.).`;
        }

        _filterGamesByCategory(list, filter) {
            if (filter === 'perfect') return list.filter(g => g.perfect === true);
            if (filter === 'non-steam') return list.filter(g => g.platform && g.platform !== 'Steam');
            if (filter === 'hours') return list.filter(g => (g.hours || 0) >= 10 && !g._isTool);
            if (filter === 'reviewed') return list.filter(g => g.reviewed === true || (g.reviewText || '').trim().length > 0);
            if (filter === 'software') return list.filter(g => g._isTool);
            if (filter === 'games-only') return list.filter(g => !g._isTool);
            return list;
        }

        getGameGenres(filter = 'all') {
            const list = this._filterGamesByCategory(this.gamesMerged, filter);
            const counts = {};
            for (const g of list) {
                if (!Array.isArray(g.genres)) continue;
                for (const gn of g.genres) {
                    counts[gn] = (counts[gn] || 0) + 1;
                }
            }
            return Object.keys(counts)
                .sort((a, b) => (counts[b] - counts[a]) || a.localeCompare(b, 'ru'))
                .map(name => ({ name, count: counts[name] }));
        }

        queryGames({ filter = 'all', genres = new Set(), genreMode = 'and', search = '', sort = 'hours-desc' } = {}) {
            let items = [...this._filterGamesByCategory(this.gamesMerged, filter)];

            if (genres && genres.size > 0) {
                const sel = Array.from(genres);
                items = items.filter(g => {
                    if (!Array.isArray(g.genres) || g.genres.length === 0) return false;
                    return genreMode === 'and'
                        ? sel.every(gn => g.genres.includes(gn))
                        : sel.some(gn => g.genres.includes(gn));
                });
            }

            if (search) {
                const q = search.trim().toLowerCase();
                if (q) items = items.filter(g => g._search.includes(q));
            }

            if (sort === 'hours-desc') {
                items.sort((a, b) => (b.minutes ?? (b.hours || 0) * 60) - (a.minutes ?? (a.hours || 0) * 60));
            } else if (sort === 'perfect-first') {
                items.sort((a, b) => {
                    const p = (b.perfect ? 1 : 0) - (a.perfect ? 1 : 0);
                    if (p !== 0) return p;
                    const ap = (b.achPercent || 0) - (a.achPercent || 0);
                    if (ap !== 0) return ap;
                    return (b.minutes ?? (b.hours || 0) * 60) - (a.minutes ?? (a.hours || 0) * 60);
                });
            } else if (sort === 'hltb-asc' || sort === 'hltb-desc') {
                const asc = sort === 'hltb-asc';
                items.sort((a, b) => {
                    const ha = this.getHltb(a);
                    const hb = this.getHltb(b);
                    const val = (h) => {
                        if (!h || h.isTool) return asc ? 999999 : -999999;
                        if (typeof h.main === 'number') return h.main;
                        if (h.type === 'coop') return 777777;
                        if (h.type === 'multi' || h.type === 'endless') return 888888;
                        return asc ? 999 : -1;
                    };
                    const va = val(ha);
                    const vb = val(hb);
                    if (va !== vb) return asc ? va - vb : vb - va;
                    return (a.title || '').localeCompare(b.title || '', 'ru');
                });
            } else if (sort === 'title-asc') {
                items.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ru'));
            }

            return items;
        }

        getTopLegends(limit = 3) {
            return [...this.gamesMerged]
                .filter(g => !g._isTool)
                .sort((a, b) => (b.hours || 0) - (a.hours || 0))
                .slice(0, limit);
        }

        getTelemetry() {
            const loaded = this.telemetry;
            const totalMs = Math.round(loaded.reduce((s, r) => s + r.ms, 0) * 10) / 10;
            const allNames = this.manifest ? ['manifest', ...Object.keys(this.manifest.tables)] : ['manifest'];
            return {
                transportMode: this.transportMode,
                schemaVersion: this.manifest?.schemaVersion || '2.0',
                generatedAt: this.manifest?.generatedAt || '—',
                loadedCount: loaded.length,
                totalTables: allNames.length,
                totalMs,
                loaded,
                unloaded: allNames.filter(n => !this.rawTables.has(n)),
            };
        }
    }

    global.YurummiDB = new DatabaseEngine();
})(window);
