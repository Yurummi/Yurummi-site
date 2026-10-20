'use strict';

// Category metadata
const CATEGORY_META = {
    anime:   { icon: '🎌', label: 'Аниме' },
    film:    { icon: '🎬', label: 'Фильм' },
    series:  { icon: '📺', label: 'Сериал' },
    cartoon: { icon: '🎨', label: 'Мультик' },
    manga:   { icon: '📖', label: 'Манга' },
    games:   { icon: '🎮', label: 'Игровая' },
};

const PAGE_SIZE = 48;
let allItems = [];
let activeTab = 'all';
let activeFilter = 'all';
let currentSearch = '';
let currentSort = 'rating-desc';
let selectedGenres = new Set();
let genreFilterMode = 'and'; // 'and' | 'or'
let genreSearchTerm = '';
let visibleCount = PAGE_SIZE;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // 100% autonomous: loaded directly from window.MEDIA_DATA (no fetch required!)
    if (window.MEDIA_DATA && Array.isArray(window.MEDIA_DATA.items)) {
        window.MEDIA_DATA.items.forEach(it => {
            if (it.poster) it.poster = it.poster.replace(/https?:\/\/shikimori\.(one|me)/g, 'https://shikimori.io');
        });
        allItems = window.MEDIA_DATA.items;
        renderDashboard(window.MEDIA_DATA.stats);
        renderGenreCloud();
        setupControls();
        setupGenreControls();
        setupModalEvents();
        setupHubZones();
        setupRandomizers();
        initWeeklyHighlight();
        render();
    } else {
        console.error('MEDIA_DATA not found');
        const grid = document.getElementById('media-grid');
        if (grid) {
            grid.innerHTML = '<div class="stats-empty"><span class="empty-icon">⚠️</span><p>Данные не загружены. Проверьте подключение media-data.js</p></div>';
        }
    }
});

// ── Dashboard ─────────────────────────────────────────────────────────────────
function renderDashboard(stats) {
    if (!stats) return;
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val !== undefined ? val : '—';
    };

    const gamesTotal = window.STEAM_GAMES ? window.STEAM_GAMES.length : (stats.games || 26);
    const watchedFilms = allItems.filter(i => i.category === 'film' && i.subcat !== 'marvel' && i.subcat !== 'dc' && (i.status === 'watched' || (i.rating !== null && i.rating !== undefined) || (i.review && i.review.trim().length > 0))).length;

    set('stat-total', stats.total);
    set('stat-watched', stats.watched);
    set('stat-masterpiece', stats.masterpiece);
    set('stat-watching', stats.watching);
    set('stat-planned', stats.planned);
    set('stat-anime', stats.anime);
    set('stat-films', watchedFilms || stats.films);
    set('stat-marvel', stats.marvel);
    set('stat-dc', stats.dc);
    set('stat-series', stats.series);
    set('stat-cartoons', stats.cartoons);
    set('stat-manga', stats.manga);
    set('stat-games', gamesTotal);

    const hzMedia = document.getElementById('hz-media-count');
    if (hzMedia && stats.total) hzMedia.textContent = stats.total;
    const hzGames = document.getElementById('hz-games-count');
    if (hzGames) hzGames.textContent = gamesTotal;
}

// ── Controls ──────────────────────────────────────────────────────────────────
function setupControls() {
    // Tab buttons (Categories)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const prevTab = activeTab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeTab = btn.dataset.tab;

            if (activeTab === 'games') {
                switchZone('games', true);
                return;
            } else {
                if (currentZone === 'games') {
                    switchZone('media', false);
                }
            }

            renderGenreCloud();
            visibleCount = PAGE_SIZE;

            // Auto switch sort order
            const sortEl = document.getElementById('sort-select');
            if (activeTab === 'marvel' || activeTab === 'dc') {
                currentSort = 'chrono';
                if (sortEl) sortEl.value = 'chrono';
            } else if ((prevTab === 'marvel' || prevTab === 'dc') && currentSort === 'chrono') {
                currentSort = 'rating-desc';
                if (sortEl) sortEl.value = 'rating-desc';
            }

            render();
        });
    });

    // Filter pills (Status / Tier)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.dataset.filter;
            visibleCount = PAGE_SIZE;
            render();
        });
    });

    // Search input
    const searchEl = document.getElementById('search-input');
    if (searchEl) {
        searchEl.addEventListener('input', () => {
            currentSearch = searchEl.value.trim().toLowerCase();
            visibleCount = PAGE_SIZE;
            render();
        });
    }

    // Sort select
    const sortEl = document.getElementById('sort-select');
    if (sortEl) {
        sortEl.addEventListener('change', () => {
            currentSort = sortEl.value;
            render();
        });
    }

    // Click on dashboard cards to quick-filter
    document.querySelectorAll('.dash-card[data-filter-target]').forEach(card => {
        card.addEventListener('click', () => {
            const target = card.dataset.filterTarget;
            const targetType = card.dataset.filterType;
            if (targetType === 'tab') {
                const btn = document.querySelector(`.tab-btn[data-tab="${target}"]`);
                if (btn) btn.click();
            } else if (targetType === 'filter') {
                const btn = document.querySelector(`.filter-btn[data-filter="${target}"]`);
                if (btn) btn.click();
            }
        });
    });
}

// ── Multi-Genre Cloud & Filter ──────────────────────────────────────────────
function renderGenreCloud() {
    const cloudEl = document.getElementById('genre-chips-cloud');
    if (!cloudEl) return;

    let tabItems = allItems;
    if (activeTab === 'marvel') {
        tabItems = allItems.filter(i => i.subcat === 'marvel');
    } else if (activeTab === 'dc') {
        tabItems = allItems.filter(i => i.subcat === 'dc');
    } else if (activeTab === 'hof') {
        tabItems = allItems.filter(i => (i.rating !== null && i.rating >= 100) || i.tier === 'masterpiece');
    } else if (activeTab === 'shelf') {
        tabItems = allItems.filter(i => i.category === 'film' && i.subcat !== 'marvel' && i.subcat !== 'dc' && i.status === 'planned' && i.rating === null);
    } else if (activeTab === 'film') {
        tabItems = allItems.filter(i => i.category === 'film' && i.subcat !== 'marvel' && i.subcat !== 'dc' && (i.status === 'watched' || (i.rating !== null && i.rating !== undefined) || (i.review && i.review.trim().length > 0)));
    } else if (activeTab !== 'all') {
        tabItems = allItems.filter(i => i.category === activeTab);
    }

    const counts = {};
    tabItems.forEach(item => {
        if (Array.isArray(item.genres)) {
            item.genres.forEach(g => {
                counts[g] = (counts[g] || 0) + 1;
            });
        }
    });

    const allGenres = Object.keys(counts).sort((a, b) => {
        const diff = counts[b] - counts[a];
        if (diff !== 0) return diff;
        return a.localeCompare(b, 'ru');
    });

    // Filter cloud by genreSearchTerm
    let visibleGenres = allGenres;
    if (genreSearchTerm) {
        visibleGenres = allGenres.filter(g => g.toLowerCase().includes(genreSearchTerm));
    }

    if (visibleGenres.length === 0) {
        cloudEl.innerHTML = `<div class="genre-search-empty" style="color:#888;font-size:12px;padding:6px 0;">Ничего не найдено по запросу «${escHtml(genreSearchTerm)}»</div>`;
    } else {
        cloudEl.innerHTML = visibleGenres.map(g => {
            const isSelected = selectedGenres.has(g);
            return `<button type="button" class="genre-chip ${isSelected ? 'active' : ''}" data-genre="${escHtml(g)}" title="${isSelected ? 'Снять выбор' : 'Выбрать жанр'}">${escHtml(g)} <span class="chip-count">${counts[g]}</span></button>`;
        }).join('');

        // Attach chip click listeners
        cloudEl.querySelectorAll('.genre-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                toggleGenre(chip.dataset.genre);
            });
        });
    }

    // Update selected count badge & reset button
    const countBadge = document.getElementById('genre-selected-count');
    const resetBtn = document.getElementById('genre-reset-btn');
    if (countBadge) {
        if (selectedGenres.size > 0) {
            let label = `${selectedGenres.size} выбрано`;
            if (selectedGenres.size === 1) label = '1 выбран';
            countBadge.textContent = label;
            countBadge.style.display = 'inline-flex';
        } else {
            countBadge.style.display = 'none';
        }
    }

    if (resetBtn) {
        resetBtn.style.display = selectedGenres.size > 0 ? 'inline-flex' : 'none';
    }

    // Update search clear button
    const clearBtn = document.getElementById('genre-search-clear');
    if (clearBtn) {
        clearBtn.style.display = genreSearchTerm.length > 0 ? 'inline-block' : 'none';
    }

    // Update mode buttons
    document.querySelectorAll('.genre-mode-btn').forEach(btn => {
        if (btn.dataset.mode === genreFilterMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function setupGenreControls() {
    const searchInput = document.getElementById('genre-search-input');
    const clearBtn = document.getElementById('genre-search-clear');
    const resetBtn = document.getElementById('genre-reset-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            genreSearchTerm = e.target.value.trim().toLowerCase();
            renderGenreCloud();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            genreSearchTerm = '';
            if (searchInput) searchInput.value = '';
            renderGenreCloud();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            selectedGenres.clear();
            visibleCount = PAGE_SIZE;
            renderGenreCloud();
            render();
        });
    }

    document.querySelectorAll('.genre-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            genreFilterMode = btn.dataset.mode || 'and';
            document.querySelectorAll('.genre-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            visibleCount = PAGE_SIZE;
            render();
        });
    });
}

function toggleGenre(g, forceAdd = false) {
    if (!g) return;
    if (forceAdd) {
        selectedGenres.add(g);
    } else {
        if (selectedGenres.has(g)) {
            selectedGenres.delete(g);
        } else {
            selectedGenres.add(g);
        }
    }
    visibleCount = PAGE_SIZE;
    renderGenreCloud();
    render();
}

// ── Filter & Sort ─────────────────────────────────────────────────────────────
function getFiltered() {
    let items = [...allItems];

    // Category / Tab filter
    if (activeTab === 'hof') {
        items = items.filter(i => (i.rating !== null && i.rating >= 100) || i.tier === 'masterpiece');
    } else if (activeTab === 'shelf') {
        // Полка «Хочу глянуть» (только фильмы в планах, без Marvel и DC)
        items = items.filter(i => i.category === 'film' && i.subcat !== 'marvel' && i.subcat !== 'dc' && i.status === 'planned' && i.rating === null);
    } else if (activeTab === 'film') {
        // Фильмы: только просмотренные / с оценкой / с отзывом (без Marvel и DC)
        items = items.filter(i => i.category === 'film' && i.subcat !== 'marvel' && i.subcat !== 'dc' && (i.status === 'watched' || (i.rating !== null && i.rating !== undefined) || (i.review && i.review.trim().length > 0)));
    } else if (activeTab === 'marvel') {
        items = items.filter(i => i.subcat === 'marvel');
    } else if (activeTab === 'dc') {
        items = items.filter(i => i.subcat === 'dc');
    } else if (activeTab !== 'all') {
        items = items.filter(i => i.category === activeTab);
    } else if (activeTab === 'all' && activeFilter !== 'planned') {
        // Во вкладке "Всё" скрываем гигантский бэклог из 316 фильмов с полки ожидания
        items = items.filter(i => !(i.category === 'film' && i.subcat !== 'marvel' && i.subcat !== 'dc' && i.status === 'planned' && i.rating === null && (!i.review || i.review.trim().length === 0)));
    }

    // Multi-Genre filter
    if (selectedGenres.size > 0) {
        const selList = Array.from(selectedGenres);
        items = items.filter(i => {
            if (!Array.isArray(i.genres) || i.genres.length === 0) return false;
            if (genreFilterMode === 'and') {
                return selList.every(g => i.genres.includes(g));
            } else {
                return selList.some(g => i.genres.includes(g));
            }
        });
    }

    // Status / Tier filter
    if (activeFilter === 'ongoing') {
        items = items.filter(i => i.status === 'watching' || (i.category === 'anime' && (i.status === 'watching' || (Array.isArray(i.genres) && i.genres.some(g => g.toLowerCase().includes('онгоинг'))))));
    } else if (activeFilter === 'masterpiece') {
        items = items.filter(i => i.tier === 'masterpiece' || (i.rating && i.rating >= 100));
    } else if (activeFilter === 'exceeded') {
        items = items.filter(i => i.rating && i.rating >= 20 && i.rating < 100);
    } else if (activeFilter === 'solid') {
        items = items.filter(i => i.rating === 10);
    } else if (activeFilter === 'reviews') {
        items = items.filter(i => i.review && i.review.trim().length > 0);
    } else if (activeFilter === 'watched') {
        items = items.filter(i => i.status === 'watched');
    } else if (activeFilter === 'watching') {
        items = items.filter(i => i.status === 'watching');
    } else if (activeFilter === 'planned') {
        items = items.filter(i => i.status === 'planned');
    }

    // Search query
    if (currentSearch) {
        items = items.filter(i => {
            const t = i.title.toLowerCase();
            const r = (i.review || '').toLowerCase();
            const d = (i.desc || '').toLowerCase();
            return t.includes(currentSearch) || r.includes(currentSearch) || d.includes(currentSearch);
        });
    }

    // Sort order
    if (currentSort === 'chrono') {
        items.sort((a, b) => {
            const ca = (a.chronoOrder !== null && a.chronoOrder !== undefined) ? a.chronoOrder : 9999;
            const cb = (b.chronoOrder !== null && b.chronoOrder !== undefined) ? b.chronoOrder : 9999;
            if (ca !== cb) return ca - cb;
            return a.title.localeCompare(b.title, 'ru');
        });
    } else if (currentSort === 'genre-asc') {
        items.sort((a, b) => {
            const ga = (Array.isArray(a.genres) && a.genres[0]) ? a.genres[0] : 'ЯЯЯ';
            const gb = (Array.isArray(b.genres) && b.genres[0]) ? b.genres[0] : 'ЯЯЯ';
            if (ga !== gb) return ga.localeCompare(gb, 'ru');
            return a.title.localeCompare(b.title, 'ru');
        });
    } else if (currentSort === 'rating-desc') {
        items.sort((a, b) => {
            const ra = a.rating !== null ? a.rating : -999;
            const rb = b.rating !== null ? b.rating : -999;
            if (rb !== ra) return rb - ra;
            return a.title.localeCompare(b.title, 'ru');
        });
    } else if (currentSort === 'rating-asc') {
        items.sort((a, b) => {
            const ra = a.rating !== null ? a.rating : 99999;
            const rb = b.rating !== null ? b.rating : 99999;
            if (ra !== rb) return ra - rb;
            return a.title.localeCompare(b.title, 'ru');
        });
    } else if (currentSort === 'title-asc') {
        items.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } else if (currentSort === 'title-desc') {
        items.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
    }

    return items;
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
    const grid = document.getElementById('media-grid');
    const countEl = document.getElementById('results-count');
    const paginationContainer = document.getElementById('pagination-container');
    if (!grid) return;

    const items = getFiltered();
    window.currentFilteredMediaItems = items;
    const total = items.length;

    if (countEl) {
        countEl.innerHTML = `Показано <b>${Math.min(visibleCount, total)}</b> из <b>${total}</b> тайтлов (нажмите на карточку для подробностей)`;
    }

    if (total === 0) {
        grid.innerHTML = `
            <div class="stats-empty" style="grid-column: 1 / -1">
                <span class="empty-icon">🔍</span>
                <p>Ничего не найдено по вашему запросу</p>
            </div>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const visibleItems = items.slice(0, visibleCount);
    grid.innerHTML = visibleItems.map((item, idx) => renderCard(item, idx)).join('');

    // Attach click listeners to cards
    grid.querySelectorAll('.media-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index, 10);
            if (!isNaN(index) && visibleItems[index]) {
                openModal(visibleItems[index]);
            }
        });
    });

    // Attach click listeners to card genre pills
    grid.querySelectorAll('.card-genre-pill[data-genre]').forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleGenre(pill.dataset.genre);
        });
    });

    // Pagination / "Load more" button
    if (paginationContainer) {
        if (visibleCount < total) {
            const remaining = total - visibleCount;
            paginationContainer.innerHTML = `
                <div class="load-more-box">
                    <button id="load-more-btn" class="btn-load-more">Показать ещё (${Math.min(PAGE_SIZE, remaining)})</button>
                    <button id="show-all-btn" class="btn-show-all">Показать все (${total})</button>
                </div>`;
            document.getElementById('load-more-btn')?.addEventListener('click', () => {
                visibleCount += PAGE_SIZE;
                render();
            });
            document.getElementById('show-all-btn')?.addEventListener('click', () => {
                visibleCount = total;
                render();
            });
        } else {
            paginationContainer.innerHTML = '';
        }
    }
}

// ── Franchise Helpers ──────────────────────────────────────────────────────────
function getSeasonOrderNum(title) {
    if (/\b0\b|фильм\s*0|нулевой/i.test(title)) return 0;
    // Specific franchise subtitles & story arcs
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

function getFranchiseInfo(item) {
    if (!item.franchise) return null;
    const all = (window.MEDIA_DATA?.items || []).filter(i => i.category === 'anime' && i.franchise === item.franchise);
    if (all.length <= 1) return null;

    const sorted = [...all].sort((a, b) => {
        const orderA = getSeasonOrderNum(a.title);
        const orderB = getSeasonOrderNum(b.title);
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title, 'ru');
    });

    const totalEps = sorted.reduce((sum, it) => sum + (it.episodes || 0), 0);
    const watchedEps = sorted.filter(it => it.status === 'watched').reduce((sum, it) => sum + (it.episodes || 0), 0);

    return {
        key: item.franchise,
        items: sorted,
        totalSeasons: sorted.length,
        totalEpisodes: totalEps,
        watchedEpisodes: watchedEps
    };
}

// ── Card HTML ─────────────────────────────────────────────────────────────────
function renderCard(item, idx) {
    const catMeta = CATEGORY_META[item.category] || { icon: '📄', label: item.category };
    const r = item.rating;

    // Rating Badge
    let ratingBadge = '';
    if (item.status === 'dropped') {
        ratingBadge = `<span class="badge-status badge-dropped">🛑 Брошено</span>`;
    } else if (item.status === 'watching') {
        ratingBadge = `<span class="badge-status badge-watching">▶️ Смотрю</span>`;
    } else if (item.status === 'planned') {
        const isUpcoming = Boolean(item.universeOrder && /\d{4}/.test(item.universeOrder));
        if (isUpcoming) {
            ratingBadge = `<span class="badge-status badge-upcoming">⏳ Скоро выйдет</span>`;
        } else {
            ratingBadge = `<span class="badge-status badge-planned">📋 В планах</span>`;
        }
    } else if (r !== null) {
        if (r >= 100) {
            ratingBadge = `
                <div class="badge-rating tier-masterpiece" title="Превзошло все ожидания! Шедевр">
                    <span class="br-icon">👑</span>
                    <span class="br-val">${r}</span>
                    <span class="br-tag">ШЕДЕВР</span>
                </div>`;
        } else if (r >= 20) {
            ratingBadge = `
                <div class="badge-rating tier-exceeded" title="Превзошло ожидания!">
                    <span class="br-icon">🚀</span>
                    <span class="br-val">${r}</span>
                    <span class="br-tag">ВЫШЕ ОЖИДАНИЙ</span>
                </div>`;
        } else if (r > 10) {
            ratingBadge = `
                <div class="badge-rating tier-great" title="Топ с плюсом">
                    <span class="br-icon">✨</span>
                    <span class="br-val">${r}</span>
                </div>`;
        } else if (r === 10) {
            ratingBadge = `
                <div class="badge-rating tier-solid" title="Выдало ровно то, что должно было">
                    <span class="br-icon">⭐</span>
                    <span class="br-val">10</span>
                    <span class="br-tag">БАЗА</span>
                </div>`;
        } else if (r >= 8) {
            ratingBadge = `
                <div class="badge-rating tier-good" title="Хорошо">
                    <span class="br-val">${r}</span>
                    <span class="br-denom">/10</span>
                </div>`;
        } else {
            ratingBadge = `
                <div class="badge-rating tier-mediocre" title="Проходняк / так себе">
                    <span class="br-val">${r}</span>
                    <span class="br-denom">/10</span>
                </div>`;
        }
    }

    // Subcategory (Marvel / DC / Chrono Order)
    let subcatBadge = '';
    if (item.universeOrder) {
        const isMarvel = item.subcat === 'marvel';
        const isDc = item.subcat === 'dc';
        const badgeClass = isMarvel ? 'subcat-marvel' : isDc ? 'subcat-dc' : '';
        subcatBadge = `<span class="badge-subcat ${badgeClass}" title="Хронология: ${escHtml(item.universeOrder)}">${escHtml(item.universeOrder)}</span>`;
    } else if (item.subcat === 'marvel') {
        subcatBadge = `<span class="badge-subcat subcat-marvel">MARVEL</span>`;
    } else if (item.subcat === 'dc') {
        subcatBadge = `<span class="badge-subcat subcat-dc">DC</span>`;
    }

    // Episodes Badge (Anime)
    let episodesBadge = '';
    if (item.category === 'anime' && (item.episodes || item.kind === 'movie')) {
        const frInfo = getFranchiseInfo(item);
        if (frInfo && frInfo.totalSeasons > 1) {
            episodesBadge = `
                <div class="card-episodes-badge has-franchise" title="В этом сезоне: ${item.episodes || '?'} сер. • Всего во франшизе: ${frInfo.totalEpisodes} сер. (${frInfo.totalSeasons} сезона)">
                    <span class="ep-icon">📺</span>
                    <span class="ep-cur">${item.episodes || '?'} сер.</span>
                    <span class="ep-total">/ ${frInfo.totalEpisodes}</span>
                </div>`;
        } else if (item.kind === 'movie' || (item.episodes === 1 && /фильм|movie/i.test(item.title))) {
            episodesBadge = `
                <div class="card-episodes-badge is-movie" title="Полнометражный фильм">
                    <span class="ep-icon">🎬</span>
                    <span class="ep-cur">Фильм</span>
                </div>`;
        } else if (item.episodes) {
            episodesBadge = `
                <div class="card-episodes-badge" title="Длительность: ${item.episodes} сер.">
                    <span class="ep-icon">📺</span>
                    <span class="ep-cur">${item.episodes} сер.</span>
                </div>`;
        }
    }

    // Fixed-size Cover Thumbnail
    let posterThumb = '';
    if (item.poster && item.poster.trim().length > 0) {
        const safePoster = item.poster.replace(/https?:\/\/shikimori\.(one|me)/g, 'https://shikimori.io');
        posterThumb = `
            <img class="card-thumb-img" src="${escHtml(safePoster)}" alt="${escHtml(item.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';">
            <div class="card-thumb-placeholder" style="display:none;">
                <span class="ctp-icon">${catMeta.icon}</span>
                <span class="ctp-label">${catMeta.label}</span>
            </div>`;
    } else {
        posterThumb = `
            <div class="card-thumb-placeholder">
                <span class="ctp-icon">${catMeta.icon}</span>
                <span class="ctp-label">${catMeta.label}</span>
            </div>`;
    }

    // Review snippet (compact 2 lines max)
    const reviewSnippet = item.review && item.review.trim().length > 0
        ? `<div class="card-review-snippet" title="${escHtml(item.review)}"><span class="crs-icon">💬</span> ${escHtml(item.review)}</div>`
        : '';

    // Genre mini chips (up to 2)
    let genreChips = '';
    if (Array.isArray(item.genres) && item.genres.length > 0) {
        const shown = item.genres.slice(0, 2);
        const extra = item.genres.length > 2 ? `<span class="card-genre-pill card-genre-more">+${item.genres.length - 2}</span>` : '';
        genreChips = `
            <div class="card-genres-wrap">
                ${shown.map(g => `<span class="card-genre-pill ${selectedGenres.has(g) ? 'active' : ''}" data-genre="${escHtml(g)}" title="Жанр: ${escHtml(g)} (нажмите для фильтрации)">${escHtml(g)}</span>`).join('')}
                ${extra}
            </div>`;
    }

    return `
    <div class="media-card ${item.tier === 'masterpiece' ? 'is-masterpiece' : ''}" data-index="${idx}">
        <div class="card-thumb-wrap">
            ${posterThumb}
        </div>
        <div class="card-content-wrap">
            ${episodesBadge}
            <div class="card-top-row">
                <div class="card-badges-row">
                    <span class="card-cat-pill">${catMeta.icon} ${catMeta.label}</span>
                    ${subcatBadge}
                </div>
                <div class="card-title" title="${escHtml(item.title)}">${escHtml(item.title)}</div>
            </div>
            ${reviewSnippet}
            <div class="card-bottom-row">
                ${ratingBadge}
                ${genreChips}
            </div>
        </div>
    </div>`;
}

// ── Modal Dialog ──────────────────────────────────────────────────────────────
function setupModalEvents() {
    const modal = document.getElementById('media-modal');
    const closeBtn = document.getElementById('modal-close-btn');

    if (!modal) return;

    // Close on click close button
    closeBtn?.addEventListener('click', closeModal);

    // Close on backdrop click (outside dialog)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

function openModal(item, isRandom = false) {
    const modal = document.getElementById('media-modal');
    if (!modal) return;

    // Random choice banner
    const detailsCol = modal.querySelector('.modal-details-col');
    let randBanner = document.getElementById('modal-random-banner');
    if (isRandom) {
        if (!randBanner) {
            randBanner = document.createElement('div');
            randBanner.id = 'modal-random-banner';
            randBanner.className = 'modal-random-banner';
            randBanner.innerHTML = '🎲 Случайный выбор («Мне повезёт!»)';
            if (detailsCol) {
                detailsCol.insertBefore(randBanner, detailsCol.firstChild);
            }
        } else {
            randBanner.style.display = 'inline-flex';
        }
    } else if (randBanner) {
        randBanner.style.display = 'none';
    }

    const catMeta = CATEGORY_META[item.category] || { icon: '📄', label: item.category };

    // Set texts
    document.getElementById('modal-title').textContent = item.title;
    document.getElementById('modal-cat-tag').textContent = `${catMeta.icon} ${catMeta.label}`;

    // Subcat tag
    const subcatEl = document.getElementById('modal-subcat-tag');
    if (item.subcat === 'marvel') {
        subcatEl.textContent = 'MARVEL';
        subcatEl.className = 'modal-tag subcat-marvel';
        subcatEl.style.display = 'inline-block';
    } else if (item.subcat === 'dc') {
        subcatEl.textContent = 'DC';
        subcatEl.className = 'modal-tag subcat-dc';
        subcatEl.style.display = 'inline-block';
    } else {
        subcatEl.style.display = 'none';
    }

    // Universe tag
    const universeEl = document.getElementById('modal-universe-tag');
    if (universeEl) {
        if (item.universeOrder) {
            universeEl.textContent = `⏳ ${item.universeOrder}`;
            universeEl.className = `modal-tag ${item.subcat === 'marvel' ? 'subcat-marvel' : 'subcat-dc'}`;
            universeEl.style.display = 'inline-block';
        } else {
            universeEl.style.display = 'none';
        }
    }

    // Status tag
    const statusEl = document.getElementById('modal-status-tag');
    const isUpcoming = Boolean(item.status === 'planned' && item.universeOrder && /\d{4}/.test(item.universeOrder));
    if (isUpcoming) {
        statusEl.textContent = '⏳ Скоро в кино';
        statusEl.className = 'modal-tag modal-tag-upcoming';
    } else if (item.status === 'watched') {
        statusEl.textContent = '✅ Просмотрено';
        statusEl.className = 'modal-tag modal-tag-watched';
    } else if (item.status === 'watching') {
        statusEl.textContent = '▶️ Смотрю';
        statusEl.className = 'modal-tag modal-tag-watching';
    } else if (item.status === 'planned') {
        statusEl.textContent = '📋 В планах';
        statusEl.className = 'modal-tag modal-tag-planned';
    } else if (item.status === 'dropped') {
        statusEl.textContent = '🛑 Брошено';
        statusEl.className = 'modal-tag modal-tag-dropped';
    }

    // Episodes tag in modal meta row
    const epTag = document.getElementById('modal-episodes-tag');
    if (epTag) {
        if (item.category === 'anime' && (item.episodes || item.kind === 'movie')) {
            if (item.kind === 'movie' || (item.episodes === 1 && /фильм|movie/i.test(item.title))) {
                epTag.textContent = '🎬 Фильм';
            } else {
                epTag.textContent = `📺 ${item.episodes} сер.`;
            }
            epTag.style.display = 'inline-block';
        } else {
            epTag.style.display = 'none';
        }
    }

    // Franchise & multi-season section in modal
    const frBlock = document.getElementById('modal-franchise-block');
    if (frBlock) {
        const frInfo = getFranchiseInfo(item);
        if (frInfo && frInfo.totalSeasons > 1) {
            const frTitleEl = document.getElementById('modal-franchise-title');
            if (frTitleEl) {
                const baseSeason = frInfo.items.find(s => getSeasonOrderNum(s.title) === 1) || frInfo.items[0];
                const cleanName = baseSeason.title.replace(/\s+(?:сезон|часть|\d+).*$/i, '').trim();
                frTitleEl.textContent = `Франшиза «${cleanName}»`;
            }

            const statsBadge = document.getElementById('modal-franchise-stats-badge');
            if (statsBadge) {
                const sCount = frInfo.totalSeasons;
                const sWord = (sCount % 10 === 1 && sCount % 100 !== 11) ? 'сезон' : ([2, 3, 4].includes(sCount % 10) && ![12, 13, 14].includes(sCount % 100)) ? 'сезона' : 'сезонов';
                statsBadge.innerHTML = `<b>${sCount}</b> ${sWord} • <b>${frInfo.totalEpisodes}</b> сер. всего <span class="mfh-sub">(просмотрено: ${frInfo.watchedEpisodes})</span>`;
            }

            const track = document.getElementById('modal-franchise-seasons-track');
            if (track) {
                track.innerHTML = frInfo.items.map(s => {
                    const isCurrent = (s === item || s.title === item.title);
                    const sR = s.rating;
                    let sBadge = '';
                    if (s.status === 'watching') {
                        sBadge = `<span class="fsc-badge badge-watching">▶️</span>`;
                    } else if (s.status === 'planned') {
                        sBadge = `<span class="fsc-badge badge-planned">📋</span>`;
                    } else if (sR !== null) {
                        if (sR >= 100) sBadge = `<span class="fsc-badge tier-masterpiece">👑 ${sR}</span>`;
                        else if (sR >= 20) sBadge = `<span class="fsc-badge tier-exceeded">🚀 ${sR}</span>`;
                        else if (sR > 10) sBadge = `<span class="fsc-badge tier-great">✨ ${sR}</span>`;
                        else if (sR === 10) sBadge = `<span class="fsc-badge tier-solid">⭐ 10</span>`;
                        else sBadge = `<span class="fsc-badge tier-good">${sR}/10</span>`;
                    }

                    const posterSrc = (s.poster || '').replace(/https?:\/\/shikimori\.(one|me)/g, 'https://shikimori.io');
                    return `
                        <div class="franchise-season-card ${isCurrent ? 'is-current' : ''}" data-season-title="${escHtml(s.title)}" title="${escHtml(s.title)} (${s.episodes || '?'} сер.)">
                            <div class="fsc-thumb-box">
                                ${posterSrc ? `<img src="${escHtml(posterSrc)}" alt="${escHtml(s.title)}" class="fsc-thumb-img" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\\'fsc-thumb-empty\\\'>🎌</div>';">` : `<div class="fsc-thumb-empty">🎌</div>`}
                            </div>
                            <div class="fsc-details">
                                <div class="fsc-title" title="${escHtml(s.title)}">${escHtml(s.title)}</div>
                                <div class="fsc-meta-row">
                                    <span class="fsc-eps">📺 ${s.episodes || '?'} сер.</span>
                                    ${sBadge}
                                    ${isCurrent ? `<span class="fsc-badge-current">⭐ Текущий</span>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');

                track.querySelectorAll('.franchise-season-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const sTitle = card.getAttribute('data-season-title');
                        const targetItem = frInfo.items.find(i => i.title === sTitle);
                        if (targetItem && targetItem !== item) {
                            openModal(targetItem);
                        }
                    });
                });
            }
            frBlock.style.display = 'block';
        } else {
            frBlock.style.display = 'none';
        }
    }

    // Genres in modal
    const genresRow = document.getElementById('modal-genres-row');
    if (genresRow) {
        if (Array.isArray(item.genres) && item.genres.length > 0) {
            genresRow.innerHTML = item.genres.map(g => {
                const isSel = selectedGenres.has(g);
                return `<span class="modal-genre-pill ${isSel ? 'active' : ''}" data-genre="${escHtml(g)}" title="Нажмите, чтобы отфильтровать по жанру">🎭 ${escHtml(g)}</span>`;
            }).join('');
            genresRow.style.display = 'flex';
            genresRow.querySelectorAll('.modal-genre-pill').forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const selectedG = pill.dataset.genre;
                    closeModal();
                    toggleGenre(selectedG, true);
                });
            });
        } else {
            genresRow.innerHTML = '';
            genresRow.style.display = 'none';
        }
    }

    // Rating in modal
    const ratingContainer = document.getElementById('modal-rating-badge-container');
    const r = item.rating;
    if (r !== null) {
        if (r >= 100) {
            ratingContainer.innerHTML = `<div class="badge-rating tier-masterpiece"><span class="br-icon">👑</span> <span class="br-val">${r}</span> <span class="br-tag">ШЕДЕВР</span></div>`;
        } else if (r >= 20) {
            ratingContainer.innerHTML = `<div class="badge-rating tier-exceeded"><span class="br-icon">🚀</span> <span class="br-val">${r}</span> <span class="br-tag">ВЫШЕ ОЖИДАНИЙ</span></div>`;
        } else if (r > 10) {
            ratingContainer.innerHTML = `<div class="badge-rating tier-great"><span class="br-icon">✨</span> <span class="br-val">${r}</span></div>`;
        } else if (r === 10) {
            ratingContainer.innerHTML = `<div class="badge-rating tier-solid"><span class="br-icon">⭐</span> <span class="br-val">10</span> <span class="br-tag">БАЗА</span></div>`;
        } else {
            ratingContainer.innerHTML = `<div class="badge-rating tier-good"><span class="br-val">${r}</span> <span class="br-denom">/10</span></div>`;
        }
        ratingContainer.style.display = 'block';
    } else {
        ratingContainer.innerHTML = '';
        ratingContainer.style.display = 'none';
    }

    // Review section
    const reviewBlock = document.getElementById('modal-review-block');
    const reviewText = document.getElementById('modal-review-text');
    if (item.review && item.review.trim()) {
        reviewText.textContent = item.review;
        reviewBlock.style.display = 'block';
    } else {
        reviewBlock.style.display = 'none';
    }

    // Poster image & fallback
    const posterImg = document.getElementById('modal-poster-img');
    const fallbackBox = document.getElementById('modal-poster-fallback');
    const fallbackIcon = document.getElementById('modal-fallback-icon');
    const descText = document.getElementById('modal-desc-text');

    fallbackIcon.textContent = catMeta.icon;

    if (item.poster && item.poster.trim().length > 0) {
        const safePoster = item.poster.replace(/https?:\/\/shikimori\.(one|me)/g, 'https://shikimori.io');
        posterImg.referrerPolicy = 'no-referrer';
        posterImg.src = safePoster;
        posterImg.style.display = 'block';
        fallbackBox.style.display = 'none';
        posterImg.onerror = function() {
            this.onerror = null;
            this.style.display = 'none';
            fallbackBox.style.display = 'flex';
        };
    } else {
        posterImg.src = '';
        posterImg.style.display = 'none';
        fallbackBox.style.display = 'flex';
    }

    // Description text
    if (item.desc && item.desc.trim().length > 0) {
        descText.textContent = item.desc;
    } else {
        descText.textContent = 'Описание пока не добавлено. Его можно вписать в js/media-data.js в поле "desc"!';
    }

    // Direct link or search link
    const extLink = document.getElementById('modal-external-link');
    if (item.url && item.url.trim().length > 0) {
        extLink.href = item.url;
        if (item.url.includes('shikimori.one')) {
            extLink.textContent = '🔗 Открыть на Shikimori (прямая страница)';
        } else if (item.url.includes('themoviedb.org')) {
            extLink.textContent = '🔗 Открыть на TMDb (прямая страница)';
        } else {
            extLink.textContent = '🔗 Открыть страницу тайтла (прямая ссылка)';
        }
    } else if (item.category === 'anime' || item.category === 'manga') {
        extLink.href = `https://shikimori.one/animes?search=${encodeURIComponent(item.title)}`;
        extLink.textContent = '🔎 Искать на Shikimori';
    } else {
        extLink.href = `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(item.title)}`;
        extLink.textContent = '🔎 Искать на Кинопоиске';
    }

    // Open modal
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('media-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ── Steam Games Hub & Room ───────────────────────────────────────────────────
let currentZone = 'media'; // 'media' | 'games'
let activeSteamFilter = 'all';
let currentSteamSearch = '';
let currentSteamSort = 'hours-desc';
let selectedSteamGenres = new Set();
let steamGenreFilterMode = 'and'; // 'and' | 'or'
let steamGenreSearchTerm = '';

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
    'Бесплатные': 'Бесплатная'
};

const STEAM_TAG_ENRICH = {
    // Хорроры и кооп
    739630:  ['Хоррор', 'Кооператив', 'Мистика', 'Инди'],             // Phasmophobia
    1929610: ['Хоррор', 'Кооператив', 'Мистика', 'Экшен'],            // Demonologist
    1966720: ['Хоррор', 'Кооператив', 'Выживание', 'Инди'],           // Lethal Company
    3241660: ['Хоррор', 'Кооператив', 'Экшен', 'Инди'],               // R.E.P.O.
    2881650: ['Хоррор', 'Кооператив', 'Юмор', 'Инди'],                // Content Warning
    1850740: ['Хоррор', 'Кооператив', 'Мистика'],                     // Ghost Watchers
    1274570: ['Хоррор', 'Кооператив', 'Выживание'],                   // DEVOUR
    1846380: ['Хоррор', 'Кооператив', 'Мистика'],                     // Fear Therapy
    1304930: ['Хоррор', 'Кооператив', 'Выживание', 'Экшен'],          // The Outlast Trials
    1695840: ['Хоррор', 'Кооператив', 'Мистика', 'Инди'],             // Fear Therapy
    1807080: ['Хоррор', 'Кооператив', 'Мистика', 'Инди'],             // Ghost Exile

    // Кооперативные и пати игры
    1172620: ['Кооператив', 'Пираты', 'Мультиплеер', 'Приключения'],  // Sea of Thieves
    1203220: ['Королевская битва', 'Кооператив', 'Экшен', 'Мультиплеер'], // NARAKA: BLADEPOINT
    444090:  ['Геройский шутер', 'Кооператив', 'Мультиплеер', 'Бесплатная'], // Paladins
    548430:  ['Кооператив', 'Шутер', 'Космос', 'Экшен'],              // Deep Rock Galactic
    1097150: ['Вечеринка', 'Кооператив', 'Мультиплеер', 'Платформер'],// Fall Guys
    3527290: ['Кооператив', 'Приключения', 'Выживание', 'Экшен'],     // PEAK
    1599600: ['Симулятор', 'Кооператив', 'Кулинария', 'Менеджмент'],  // PlateUp!
    448510:  ['Симулятор', 'Кооператив', 'Кулинария', 'Вечеринка'],   // Overcooked
    728880:  ['Симулятор', 'Кооператив', 'Кулинария', 'Вечеринка'],   // Overcooked! 2
    477160:  ['Головоломка', 'Кооператив', 'Физика', 'Юмор'],         // Human Fall Flat
    2567870: ['Кооператив', 'Платформер', 'Физика', 'Челлендж'],      // Chained Together
    1144200: ['Тактический шутер', 'Кооператив', 'Экшен', 'Реализм'], // Ready or Not
    1203620: ['Выживание', 'Кооператив', 'Крафт', 'RPG'],             // Enshrouded
    1621690: ['Песочница', 'Кооператив', 'Выживание', 'Пиксельная'],  // Core Keeper
    774801:  ['Рогалик', 'Кооператив', 'Шутер', 'Экшен'],             // Crab Champions
    1119730: ['Симулятор', 'Кооператив', 'Строительство', 'Открытый мир'], // Ranch Simulator
    2448970: ['Экшен-RPG', 'Подземелья', 'Кооператив', 'PvPvE'],      // Dungeonborne
    2139020: ['Кооператив', 'Рогалик', 'Экшен', 'Платформер'],        // What the Fog
    304930:  ['Выживание', 'Зомби', 'Кооператив', 'Песочница'],       // Unturned
    238370:  ['Экшен-RPG', 'Кооператив', 'Магия', 'Юмор'],            // Magicka 2
    582500:  ['Головоломка', 'Кооператив', 'Приключения'],            // We Were Here
    677160:  ['Головоломка', 'Кооператив', 'Приключения'],            // We Were Here Too
    865360:  ['Головоломка', 'Кооператив', 'Приключения'],            // We Were Here Together
    1301720: ['Головоломка', 'Кооператив', 'Квест'],                  // Escape Room
    1509960: ['Платформер', 'Кооператив', 'Головоломка'],             // PICO PARK
    674940:  ['Файтинг', 'Кооператив', 'Физика', 'Юмор'],             // Stick Fight
    341800:  ['Головоломка', 'Кооператив', 'Бомбы', 'Общение'],       // Keep Talking and Nobody Explodes
    1016920: ['Кооператив', 'Поезда', 'Пиксельная', 'Инди'],          // Unrailed!

    // Мультиплеер и пати-игры
    570:     ['MOBA', 'Стратегия', 'Мультиплеер', 'Киберспорт'],      // Dota 2
    730:     ['Шутер', 'Экшен', 'Мультиплеер', 'Киберспорт'],         // CS2
    1172470: ['Королевская битва', 'Шутер', 'Экшен', 'Мультиплеер'],  // Apex Legends
    252950:  ['Спорт', 'Мультиплеер', 'Гонки', 'Соревновательная'],   // Rocket League
    386180:  ['Гонки на выживание', 'Мультиплеер', 'Крафт', 'Экшен'], // Crossout
    1422450: ['Шутер от третьего лица', 'MOBA', 'Мультиплеер', 'Экшен'], // Deadlock
    1190340: ['Королевская битва', 'Шутер', 'Мультиплеер', 'Экшен'],  // SUPER PEOPLE
    1260320: ['Вечеринка', 'Мультиплеер', 'Физика', 'Юмор'],          // Party Animals
    880940:  ['Вечеринка', 'Мультиплеер', 'Мини-игры', 'Юмор'],       // Pummel Party
    3097560: ['Вечеринка', 'Мультиплеер', 'Психология', 'Карточная'], // Liar's Bar
    207140:  ['Платформер', 'Мультиплеер', 'Гонки', 'Вечеринка'],     // SpeedRunners
    431240:  ['Мини-гольф', 'Мультиплеер', 'Казуальная', 'Спорт'],   // Golf With Your Friends
    1088150: ['Рисование', 'Мультиплеер', 'Казуальная', 'Слова'],     // Scribble It!
    3553500: ['Викторина', 'Мультиплеер', 'Казуальная', 'Слова'],     // SIGame
    1170970: ['Стрим-игра', 'Казуальная', 'Мультиплеер', 'Симулятор'],// Marbles on Stream
    1455630: ['Настольная', 'Мультиплеер', 'Казуальная', 'Семья'],    // THE GAME OF LIFE 2
    945360:  ['Социальная дедукция', 'Мультиплеер', 'Пати-игра'],     // Among Us
    438100:  ['Социальная сеть', 'Песочница', 'VR', 'Мультиплеер'],   // VRChat

    // Гонки и симуляторы
    1551360: ['Гонки', 'Симулятор', 'Открытый мир', 'Мультиплеер'],   // Forza Horizon 5
    1465360: ['Симулятор', 'Гонки', 'Бездорожье', 'Кооператив'],      // SnowRunner
    1222680: ['Гонки', 'Аркада', 'Открытый мир', 'Тюнинг'],           // NFS Heat
    1846380: ['Гонки', 'Аркада', 'Стилизация', 'Мультиплеер'],        // NFS Unbound
    690790:  ['Гонки', 'Симулятор', 'Ралли', 'Реализм'],              // DiRT Rally 2.0
    11020:   ['Гонки', 'Аркада', 'Тайм-триал', 'Киберспорт'],         // TrackMania Nations Forever
    2225070: ['Гонки', 'Аркада', 'Тайм-триал', 'Мультиплеер'],        // Trackmania
    284160:  ['Физика', 'Симулятор', 'Гонки', 'Песочница'],           // BeamNG.drive

    // Сюжетные тайтлы
    1245620: ['Соулслайк', 'RPG', 'Экшен', 'Фэнтези'],                // ELDEN RING
    1086940: ['RPG', 'Пошаговая', 'Фэнтези', 'Приключения'],          // Baldur's Gate 3
    271590:  ['Открытый мир', 'Экшен', 'Мультиплеер', 'Криминал'],    // GTA V
    2138710: ['Боевые искусства', 'Экшен', 'Сюжет', 'Сложная'],       // Sifu
    322330:  ['Выживание', 'Кооператив', 'Инди', 'Крафт'],            // Don't Starve Together
    105600:  ['Песочница', 'Выживание', 'Приключения', 'Пиксельная'], // Terraria
    383870:  ['Сюжет', 'Приключения', 'Атмосфера', 'Инди'],           // Firewatch
    2527500: ['Хоррор', 'Психология', 'Аниме', 'Сюжет'],              // MiSide
    501300:  ['Сюжет', 'Приключения', 'Интерактивная история'],       // Edith Finch
    2533960: ['Строительство', 'Казуальные', 'Песочница', 'Инди'],    // SUMMERHOUSE
    2653790: ['Хоррор', 'Головоломка', 'Психология'],                 // The Exit 8
    1102130: ['Романтика', 'Сюжет', 'Казуальные', 'Инди'],            // Florence
    1222140: ['Интерактивное кино', 'Сюжет', 'Фантастика', 'Детектив'], // Detroit
    214490:  ['Хоррор', 'Выживание', 'Фантастика', 'Стелс'],          // Alien: Isolation
    1954200: ['Экшен', 'Приключения', 'Фэнтези', 'Красивая'],         // Kena
    1659420: ['Экшен', 'Приключения', 'Кинематографичная', 'Сюжет'],  // UNCHARTED
    1466640: ['Сюжет', 'Приключения', 'Инди', 'Выборы'],              // Road 96
    1092790: ['ККИ', 'Рогалик', 'Психология', 'Мистика'],             // Inscryption
    1281590: ['Интерактивное кино', 'Хоррор', 'Сюжет', 'Выживание'],  // House of Ashes
    1622910: ['Хоррор', 'Сюжет', 'Атмосфера', 'Инди'],                // Still Wakes the Deep
    433340:  ['Приключения', 'Исследования', 'Слаймы', 'Милая'],      // Slime Rancher
    413150:  ['Ферма', 'RPG', 'Пиксельная', 'Песочница']              // Stardew Valley
};

function normalizeSteamGamesGenres() {
    if (!window.STEAM_GAMES || !Array.isArray(window.STEAM_GAMES)) return;
    window.STEAM_GAMES.forEach(g => {
        const aid = Number(g.id);
        if (STEAM_TAG_ENRICH[aid]) {
            g.genres = [...STEAM_TAG_ENRICH[aid]];
        } else if (Array.isArray(g.genres)) {
            const clean = [];
            g.genres.forEach(item => {
                const mapped = STEAM_GENRE_MAP[item] || item;
                if (!clean.includes(mapped)) {
                    clean.push(mapped);
                }
            });
            g.genres = clean.length > 0 ? clean : ['Экшен', 'Приключения'];
        }
    });
}

function setupHubZones() {
    const cubeMedia = document.getElementById('cube-media');
    const cubeGames = document.getElementById('cube-games');
    const btnMedia = document.getElementById('btn-zone-media');
    const btnGames = document.getElementById('btn-zone-games');

    if (cubeMedia) {
        cubeMedia.addEventListener('click', () => {
            switchZone('media', true);
        });
        cubeMedia.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchZone('media', true);
            }
        });
    }

    if (cubeGames) {
        cubeGames.addEventListener('click', () => {
            switchZone('games', true);
        });
        cubeGames.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                switchZone('games', true);
            }
        });
    }

    if (btnMedia) {
        btnMedia.addEventListener('click', () => {
            switchZone('media', false);
        });
    }

    if (btnGames) {
        btnGames.addEventListener('click', () => {
            switchZone('games', false);
        });
    }

    normalizeSteamGamesGenres();
    setupSteamControls();
    setupSteamGenreControls();
    setupSteamModalEvents();
    renderSteamGenreCloud();
    renderSteamGames();
    initHubTickers();

    // ── Zone Persistence (URL Hash > LocalStorage > Default) ───────────────
    let initialZone = 'media';
    const hash = (window.location.hash || '').replace('#', '').toLowerCase();
    if (hash === 'games' || hash === 'steam') {
        initialZone = 'games';
    } else if (hash === 'media' || hash === 'anime' || hash === 'films') {
        initialZone = 'media';
    } else {
        try {
            const saved = localStorage.getItem('yurummi_stats_active_zone');
            if (saved === 'games' || saved === 'media') {
                initialZone = saved;
            }
        } catch (e) {}
    }

    if (initialZone === 'games') {
        switchZone('games', false, false);
    } else {
        switchZone('media', false, false);
    }

    // Remove zero-flicker preload class
    document.documentElement.classList.remove('init-zone-games');

    // Handle browser back / forward navigation
    window.addEventListener('hashchange', () => {
        const curHash = (window.location.hash || '').replace('#', '').toLowerCase();
        if ((curHash === 'games' || curHash === 'steam') && currentZone !== 'games') {
            switchZone('games', false, false);
        } else if ((curHash === 'media' || curHash === 'anime' || curHash === 'films') && currentZone !== 'media') {
            switchZone('media', false, false);
        }
    });
}

function initHubTickers() {
    const trackMedia = document.getElementById('ticker-track-media');
    const trackGames = document.getElementById('ticker-track-games');

    // 1. Каждый раз запускаем ленты со случайной точки (random start offset)
    if (trackMedia) {
        const randMedia = (Math.random() * 38).toFixed(2);
        trackMedia.style.animationDelay = `-${randMedia}s`;
    }
    if (trackGames) {
        const randGames = (Math.random() * 38).toFixed(2);
        trackGames.style.animationDelay = `-${randGames}s`;
    }

    // 2. Наполнение динамическими постерами кино и аниме (с шедеврами и высокими оценками)
    if (trackMedia && window.MEDIA_DATA && Array.isArray(window.MEDIA_DATA.items)) {
        const featured = window.MEDIA_DATA.items.filter(it => 
            it.poster && 
            !it.poster.includes('placeholder') && 
            (it.rating >= 10 || it.status === 'watched' || it.status === 'watching')
        );

        const mediaSelection = featured.slice(0, 16);
        if (mediaSelection.length >= 8) {
            // Удваиваем список для бесшовной плавной бесконечной прокрутки
            const fullMediaList = [...mediaSelection, ...mediaSelection];
            trackMedia.innerHTML = fullMediaList.map((item, idx) => {
                const ratingBadge = item.rating 
                    ? `<span class="ticker-rating-pill">${item.rating >= 100 ? '👑 ' : ''}${item.rating}</span>` 
                    : '';
                return `
                    <div class="ticker-card mosaic-card" 
                         style="background-image: url('${escHtml(item.poster)}');" 
                         title="${escHtml(item.title)}" 
                         data-idx="${idx % mediaSelection.length}"
                         tabindex="0"
                         role="button">
                        ${ratingBadge}
                    </div>
                `;
            }).join('');

            // При клике на карточку в ленте открываем подробную модалку тайтла
            trackMedia.querySelectorAll('.ticker-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const idx = parseInt(card.dataset.idx, 10);
                    const item = mediaSelection[idx];
                    if (item) openModal(item);
                });
            });
        }
    }

    // 3. Наполнение динамическими обложками игр из библиотеки Steam
    if (trackGames && window.STEAM_GAMES && Array.isArray(window.STEAM_GAMES)) {
        const gamesSelection = window.STEAM_GAMES.filter(g => g.cover).slice(0, 16);
        if (gamesSelection.length >= 8) {
            // Удваиваем список для бесшовной плавной бесконечной прокрутки
            const fullGamesList = [...gamesSelection, ...gamesSelection];
            trackGames.innerHTML = fullGamesList.map(g => {
                let badge = '';
                if (g.perfect) {
                    badge = `<span class="ticker-hours-pill">🏆 100%</span>`;
                } else if (g.hours > 0) {
                    const hStr = g.hours >= 1000 ? Math.round(g.hours / 1000) + 'k ч' : g.hours + ' ч';
                    badge = `<span class="ticker-hours-pill">🔥 ${hStr}</span>`;
                }
                return `
                    <div class="ticker-card mosaic-card" 
                         style="background-image: url('${escHtml(g.cover)}');" 
                         title="${escHtml(g.title)}" 
                         data-app-id="${g.id}"
                         tabindex="0"
                         role="button">
                        ${badge}
                    </div>
                `;
            }).join('');

            // При клике на игру в ленте открываем её модалку
            trackGames.querySelectorAll('.ticker-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const appId = parseInt(card.dataset.appId, 10);
                    const game = (window.STEAM_GAMES || []).find(g => Number(g.id) === appId);
                    if (game) {
                        openSteamModal(game);
                    } else {
                        switchZone('games', true);
                    }
                });
            });
        }
    }
}

function switchZone(zone, scrollToSection = false, updateHistory = true) {
    currentZone = zone;

    // Persist active zone in localStorage
    try {
        localStorage.setItem('yurummi_stats_active_zone', zone);
    } catch (e) {}

    // Update URL hash for direct links and reload persistence
    if (updateHistory && window.history && window.history.replaceState) {
        const newHash = zone === 'games' ? '#games' : '#media';
        if (window.location.hash !== newHash) {
            window.history.replaceState(null, '', newHash);
        }
    }

    const secMedia = document.getElementById('section-media');
    const secGames = document.getElementById('section-games');
    const btnMedia = document.getElementById('btn-zone-media');
    const btnGames = document.getElementById('btn-zone-games');
    const cubeMedia = document.getElementById('cube-media');
    const cubeGames = document.getElementById('cube-games');

    if (zone === 'games') {
        if (secMedia) secMedia.style.display = 'none';
        if (secGames) secGames.style.display = 'block';

        if (btnMedia) btnMedia.classList.remove('active');
        if (btnGames) btnGames.classList.add('active');

        if (cubeMedia) cubeMedia.classList.remove('active');
        if (cubeGames) cubeGames.classList.add('active');

        // Sync tab buttons
        document.querySelectorAll('.tab-btn').forEach(b => {
            if (b.dataset.tab === 'games') b.classList.add('active');
            else b.classList.remove('active');
        });

        renderSteamGenreCloud();
        renderSteamGames();

        if (scrollToSection && secGames) {
            secGames.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    } else {
        if (secMedia) secMedia.style.display = 'block';
        if (secGames) secGames.style.display = 'none';

        if (btnMedia) btnMedia.classList.add('active');
        if (btnGames) btnGames.classList.remove('active');

        if (cubeMedia) cubeMedia.classList.add('active');
        if (cubeGames) cubeGames.classList.remove('active');

        // Restore active tab if it was 'games'
        if (activeTab === 'games') {
            const allBtn = document.querySelector('.tab-btn[data-tab="all"]');
            if (allBtn) {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                allBtn.classList.add('active');
                activeTab = 'all';
            }
        }

        render();

        if (scrollToSection && secMedia) {
            secMedia.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function setupSteamControls() {
    // Steam Filter buttons
    document.querySelectorAll('[data-steam-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-steam-filter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeSteamFilter = btn.dataset.steamFilter;
            renderSteamGenreCloud();
            renderSteamGames();
        });
    });

    // Steam Search input
    const searchInput = document.getElementById('steam-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSteamSearch = searchInput.value.trim().toLowerCase();
            renderSteamGames();
        });
    }

    // Steam Sort select
    const sortSelect = document.getElementById('steam-sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSteamSort = sortSelect.value;
            renderSteamGames();
        });
    }
}

// ── Steam Multi-Genre Cloud & Filter ──────────────────────────────────────────
function renderSteamGenreCloud() {
    const cloudEl = document.getElementById('steam-genre-chips-cloud');
    if (!cloudEl) return;

    let games = window.STEAM_GAMES || [];
    if (activeSteamFilter === 'perfect') {
        games = games.filter(g => g.perfect === true);
    } else if (activeSteamFilter === 'hours') {
        games = games.filter(g => g.hours >= 10);
    } else if (activeSteamFilter === 'reviewed') {
        games = games.filter(g => g.reviewed === true);
    } else if (activeSteamFilter === 'non-steam') {
        games = games.filter(g => g.platform && g.platform !== 'Steam');
    }

    const counts = {};
    games.forEach(g => {
        if (Array.isArray(g.genres)) {
            g.genres.forEach(gn => {
                counts[gn] = (counts[gn] || 0) + 1;
            });
        }
    });

    const allGenres = Object.keys(counts).sort((a, b) => {
        const diff = counts[b] - counts[a];
        if (diff !== 0) return diff;
        return a.localeCompare(b, 'ru');
    });

    let visibleGenres = allGenres;
    if (steamGenreSearchTerm) {
        visibleGenres = allGenres.filter(gn => gn.toLowerCase().includes(steamGenreSearchTerm));
    }

    if (visibleGenres.length === 0) {
        cloudEl.innerHTML = `<div class="genre-search-empty" style="color:#888;font-size:12px;padding:6px 0;">Ничего не найдено по запросу «${escHtml(steamGenreSearchTerm)}»</div>`;
    } else {
        cloudEl.innerHTML = visibleGenres.map(gn => {
            const isSelected = selectedSteamGenres.has(gn);
            return `<button type="button" class="genre-chip steam-genre-chip ${isSelected ? 'active' : ''}" data-steam-genre="${escHtml(gn)}" title="${isSelected ? 'Снять выбор' : 'Выбрать жанр'}">${escHtml(gn)} <span class="chip-count">${counts[gn]}</span></button>`;
        }).join('');

        cloudEl.querySelectorAll('.steam-genre-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                toggleSteamGenre(chip.dataset.steamGenre);
            });
        });
    }

    // Badge & reset button
    const countBadge = document.getElementById('steam-genre-selected-count');
    const resetBtn = document.getElementById('steam-genre-reset-btn');
    if (countBadge) {
        if (selectedSteamGenres.size > 0) {
            let label = `${selectedSteamGenres.size} выбрано`;
            if (selectedSteamGenres.size === 1) label = '1 выбран';
            countBadge.textContent = label;
            countBadge.style.display = 'inline-flex';
        } else {
            countBadge.style.display = 'none';
        }
    }

    if (resetBtn) {
        resetBtn.style.display = selectedSteamGenres.size > 0 ? 'inline-flex' : 'none';
    }

    // Search clear button
    const clearBtn = document.getElementById('steam-genre-search-clear');
    if (clearBtn) {
        clearBtn.style.display = steamGenreSearchTerm.length > 0 ? 'inline-block' : 'none';
    }

    // Mode buttons
    document.querySelectorAll('.steam-genre-mode-btn').forEach(btn => {
        if (btn.dataset.steamMode === steamGenreFilterMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function toggleSteamGenre(genre) {
    if (!genre) return;
    if (selectedSteamGenres.has(genre)) {
        selectedSteamGenres.delete(genre);
    } else {
        selectedSteamGenres.add(genre);
    }
    renderSteamGenreCloud();
    renderSteamGames();
}

function setupSteamGenreControls() {
    const searchInput = document.getElementById('steam-genre-search-input');
    const clearBtn = document.getElementById('steam-genre-search-clear');
    const resetBtn = document.getElementById('steam-genre-reset-btn');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            steamGenreSearchTerm = e.target.value.trim().toLowerCase();
            renderSteamGenreCloud();
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            steamGenreSearchTerm = '';
            if (searchInput) searchInput.value = '';
            renderSteamGenreCloud();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            selectedSteamGenres.clear();
            renderSteamGenreCloud();
            renderSteamGames();
        });
    }

    document.querySelectorAll('.steam-genre-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            steamGenreFilterMode = btn.dataset.steamMode || 'and';
            document.querySelectorAll('.steam-genre-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderSteamGames();
        });
    });
}

// ── Render Steam Games Grid ──────────────────────────────────────────────────
function renderSteamGames() {
    const grid = document.getElementById('steam-grid');
    const countEl = document.getElementById('steam-results-count');
    const hzCountEl = document.getElementById('hz-games-count');
    if (!grid) return;

    let games = window.STEAM_GAMES || [];
    if (hzCountEl) hzCountEl.textContent = games.length;

    // Status Filter
    if (activeSteamFilter === 'perfect') {
        games = games.filter(g => g.perfect === true);
    } else if (activeSteamFilter === 'hours') {
        games = games.filter(g => g.hours >= 10);
    } else if (activeSteamFilter === 'reviewed') {
        games = games.filter(g => g.reviewed === true);
    } else if (activeSteamFilter === 'non-steam') {
        games = games.filter(g => g.platform && g.platform !== 'Steam');
    }

    // Multi-Genre Filter
    if (selectedSteamGenres.size > 0) {
        const selList = Array.from(selectedSteamGenres);
        games = games.filter(g => {
            if (!Array.isArray(g.genres) || g.genres.length === 0) return false;
            if (steamGenreFilterMode === 'and') {
                return selList.every(gn => g.genres.includes(gn));
            } else {
                return selList.some(gn => g.genres.includes(gn));
            }
        });
    }

    // Search Filter
    if (currentSteamSearch) {
        games = games.filter(g => {
            const t = (g.title || '').toLowerCase();
            const d = (g.desc || '').toLowerCase();
            const r = (g.reviewText || '').toLowerCase();
            const gn = Array.isArray(g.genres) ? g.genres.join(' ').toLowerCase() : '';
            return t.includes(currentSteamSearch) || d.includes(currentSteamSearch) || r.includes(currentSteamSearch) || gn.includes(currentSteamSearch);
        });
    }

    // Sort
    if (currentSteamSort === 'hours-desc') {
        games = [...games].sort((a, b) => (b.minutes ?? (b.hours || 0) * 60) - (a.minutes ?? (a.hours || 0) * 60));
    } else if (currentSteamSort === 'perfect-first') {
        games = [...games].sort((a, b) => {
            const pDiff = (b.perfect ? 1 : 0) - (a.perfect ? 1 : 0);
            if (pDiff !== 0) return pDiff;
            const aPct = a.achPercent || 0;
            const bPct = b.achPercent || 0;
            if (bPct !== aPct) return bPct - aPct;
            return (b.minutes ?? (b.hours || 0) * 60) - (a.minutes ?? (a.hours || 0) * 60);
        });
    } else if (currentSteamSort === 'hltb-asc') {
        games = [...games].sort((a, b) => {
            const hA = window.getHltbData ? window.getHltbData(a) : null;
            const hB = window.getHltbData ? window.getHltbData(b) : null;
            const getVal = (h) => {
                if (!h || h.isTool) return 999999;
                if (typeof h.main === 'number') return h.main;
                if (h.type === 'coop') return 777777;
                if (h.type === 'multi' || h.type === 'endless') return 888888;
                return 999;
            };
            const valA = getVal(hA);
            const valB = getVal(hB);
            if (valA !== valB) return valA - valB;
            return (a.title || '').localeCompare(b.title || '');
        });
    } else if (currentSteamSort === 'hltb-desc') {
        games = [...games].sort((a, b) => {
            const hA = window.getHltbData ? window.getHltbData(a) : null;
            const hB = window.getHltbData ? window.getHltbData(b) : null;
            const getVal = (h) => {
                if (!h || h.isTool) return -999999;
                if (typeof h.main === 'number') return h.main;
                if (h.type === 'coop') return 777777;
                if (h.type === 'multi' || h.type === 'endless') return 888888;
                return -1;
            };
            const valA = getVal(hA);
            const valB = getVal(hB);
            if (valA !== valB) return valB - valA;
            return (a.title || '').localeCompare(b.title || '');
        });
    } else if (currentSteamSort === 'title-asc') {
        games = [...games].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    window.currentFilteredSteamGames = games;

    if (countEl) {
        countEl.textContent = `Показано игр: ${games.length} из ${(window.STEAM_GAMES || []).length}`;
    }

    if (games.length === 0) {
        grid.innerHTML = '<div class="stats-empty" style="grid-column: 1 / -1;"><span class="empty-icon">🎮</span><p>По вашему запросу игры не найдены</p></div>';
        return;
    }

    grid.innerHTML = games.map(g => {
        let hoursFmt;
        if (g.hoursDisplay) {
            hoursFmt = g.hoursDisplay;
        } else if (g.minutes > 0 && g.minutes < 120) {
            hoursFmt = `${g.minutes} мин. (${String(g.hours).replace('.', ',')} ч.)`;
        } else if (g.hours >= 1000) {
            hoursFmt = g.hours.toLocaleString('ru-RU') + ' ч.';
        } else {
            hoursFmt = String(g.hours).replace('.', ',') + ' ч.';
        }

        const isMassive = g.hours >= 500;
        const genresHtml = Array.isArray(g.genres) 
            ? g.genres.slice(0, 3).map(gn => {
                const isActive = selectedSteamGenres.has(gn);
                return `<span class="sc-genre-tag ${isActive ? 'active' : ''}" data-genre="${escHtml(gn)}" title="Фильтровать по жанру: ${escHtml(gn)}">${escHtml(gn)}</span>`;
            }).join('') 
            : '';

        const perfectBadge = g.perfect 
            ? `<span class="sc-perfect-badge">🏆 100% (${escHtml(g.achievements || 'Идеальная')})</span>` 
            : (g.achTotal > 0 ? `<span class="sc-ach-badge">🏅 ${escHtml(g.achievements)}</span>` : '');

        const isNonSteam = g.platform && g.platform !== 'Steam';
        let platformTagHtml = '';
        if (isNonSteam) {
            let pClass = 'platform-other';
            if (g.platform === 'Epic Games') pClass = 'platform-epic';
            else if (g.platform === 'PC / Лаунчер' || (g.platform && g.platform.includes('Minecraft')) || g.id === 9900001) pClass = 'platform-mc';
            else if (g.platform === 'GBA / Марафон') pClass = 'platform-retro';
            else if (g.platform === 'Фан-игра') pClass = 'platform-fan';
            else if (g.platform && (g.platform.includes('FNaF') || g.platform.includes('Вне Steam'))) pClass = 'platform-fnaf';

            platformTagHtml = `<span class="sc-platform-tag ${pClass}">${escHtml(g.platformBadge || g.platform)}</span>`;
        }

        const hltb = window.getHltbData ? window.getHltbData(g) : null;
        let hltbTagHtml = '';
        if (hltb && !hltb.isTool && hltb.label) {
            const isEndless = hltb.type === 'multi' || hltb.type === 'endless';
            const isCoop = hltb.type === 'coop';
            const tagClass = isEndless ? 'hltb-endless' : (isCoop ? 'hltb-coop' : '');
            const tagIcon = isCoop ? '👥' : (isEndless ? '∞' : '⏱️');
            const cleanLabel = hltb.label.replace(/^[\p{Emoji}\u2000-\u3300]\s*/u, '');
            const tooltipTitle = isCoop ? 'Кооперативная игра' : `Длительность по HowLongToBeat: ${escHtml(cleanLabel)}`;
            hltbTagHtml = `<span class="sc-hltb-tag ${tagClass}" title="${tooltipTitle}">${tagIcon} ${escHtml(cleanLabel)}</span>`;
        }

        let achSlotHtml = '';
        if (g.achTotal > 0) {
            achSlotHtml = `
                <div class="sc-ach-slot">
                    <div class="sc-ach-bar-wrap">
                        <div class="sc-ach-bar-top">
                            <span class="sc-ach-label">${g.perfect ? '🏆 ИДЕАЛЬНАЯ ИГРА' : 'ДОСТИЖЕНИЯ'}</span>
                            <span class="sc-ach-val">${g.achUnlocked}/${g.achTotal} (${g.achPercent || 0}%)</span>
                        </div>
                        <div class="sc-ach-track">
                            <div class="sc-ach-fill ${g.perfect ? 'fill-perfect' : ''}" style="width: ${g.achPercent || 0}%"></div>
                        </div>
                    </div>
                </div>
            `;
        } else if (g.achievements) {
            achSlotHtml = `
                <div class="sc-ach-slot">
                    <div class="sc-ach-bar-wrap">
                        <div class="sc-ach-bar-top">
                            <span class="sc-ach-label">${g.perfect ? '🏆 ПРОЙДЕНО / СТАТУС' : 'СТАТУС / ИЗДАНИЕ'}</span>
                        </div>
                        <div class="sc-custom-status-text" title="${escHtml(g.achievements)}">✨ ${escHtml(g.achievements)}</div>
                    </div>
                </div>
            `;
        } else {
            achSlotHtml = `
                <div class="sc-ach-slot sc-ach-slot-empty">
                    <div class="sc-ach-no-data">
                        <span class="sand-icon">🎮</span>
                        <span class="sand-text">${isNonSteam ? 'Вне Steam' : 'Без ачивок Steam'}</span>
                    </div>
                </div>
            `;
        }

        const reviewPillHtml = g.reviewText 
            ? `
                <div class="sc-review-pill" title="Нажмите, чтобы прочитать отзыв Yurummi">
                    <span class="srp-icon">💬</span>
                    <span class="srp-text">Есть отзыв Yurummi</span>
                    <span class="srp-arrow">→</span>
                </div>
            `
            : `
                <div class="sc-review-pill sc-review-pill-empty" title="Нажмите, чтобы открыть подробности">
                    <span class="srp-icon">📖</span>
                    <span class="srp-text">Подробнее об игре</span>
                    <span class="srp-arrow">→</span>
                </div>
            `;

        const coverSrc = g.header || g.cover;
        const storeLabel = isNonSteam 
            ? (g.platform === 'Epic Games' ? 'В Epic Games ↗' : (g.platform === 'PC / Лаунчер' ? 'Сайт игры ↗' : (g.platform === 'Фан-игра' ? 'Game Jolt ↗' : 'Подробнее ↗'))) 
            : 'В Steam ↗';
        const appIdLabel = isNonSteam ? escHtml(g.platformBadge || g.platform || 'Вне Steam') : `Steam App #${g.id}`;

        return `
            <div class="steam-card ${g.perfect ? 'steam-card-perfect' : ''}" data-app-id="${g.id}" role="button" tabindex="0">
                <div class="sc-cover-wrap">
                    <img class="sc-cover-img" src="${escHtml(coverSrc)}" alt="${escHtml(g.title)}" loading="lazy" onerror="this.src='${escHtml(g.cover)}'">
                    <div class="sc-overlay-badges">
                        <span class="sc-hours-badge ${isMassive ? 'badge-massive' : ''}">🔥 ${hoursFmt}</span>
                        ${perfectBadge}
                    </div>
                    ${platformTagHtml}
                    ${hltbTagHtml}
                </div>
                <div class="sc-content">
                    <h3 class="sc-title" title="${escHtml(g.title)}">${escHtml(g.title)}</h3>
                    <div class="sc-genres">${genresHtml}</div>
                    ${achSlotHtml}
                    <div class="sc-desc">${escHtml(g.desc || '')}</div>
                    ${reviewPillHtml}
                    <div class="sc-footer">
                        <span class="sc-app-id">${appIdLabel}</span>
                        <a href="${escHtml(g.url)}" target="_blank" rel="noopener" class="btn-steam-store ${isNonSteam ? 'btn-custom-store' : ''}" title="${isNonSteam ? 'Открыть страницу игры' : 'Открыть в магазине Steam'}">${storeLabel}</a>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach click listeners to cards
    grid.querySelectorAll('.steam-card').forEach(card => {
        card.addEventListener('click', () => {
            const appId = parseInt(card.dataset.appId, 10);
            const game = (window.STEAM_GAMES || []).find(g => Number(g.id) === appId);
            if (game) openSteamModal(game);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const appId = parseInt(card.dataset.appId, 10);
                const game = (window.STEAM_GAMES || []).find(g => Number(g.id) === appId);
                if (game) openSteamModal(game);
            }
        });
    });

    // Attach click listeners to card genre tags
    grid.querySelectorAll('.sc-genre-tag[data-genre]').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSteamGenre(tag.dataset.genre);
        });
    });

    // Stop propagation on store link so modal doesn't open simultaneously
    grid.querySelectorAll('.btn-steam-store').forEach(link => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

// ── Steam Game Modal Dialog ──────────────────────────────────────────────────
function setupSteamModalEvents() {
    const modal = document.getElementById('steam-game-modal');
    const closeBtn = document.getElementById('steam-modal-close-btn');
    if (!modal) return;

    closeBtn?.addEventListener('click', closeSteamModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSteamModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeSteamModal();
        }
    });
}

function openSteamModal(game, isRandom = false) {
    const modal = document.getElementById('steam-game-modal');
    if (!modal || !game) return;

    // Random choice banner
    const steamBody = modal.querySelector('.steam-modal-body');
    let randBanner = document.getElementById('steam-modal-random-banner');
    if (isRandom) {
        if (!randBanner) {
            randBanner = document.createElement('div');
            randBanner.id = 'steam-modal-random-banner';
            randBanner.className = 'modal-random-banner';
            randBanner.innerHTML = '🎲 Случайный выбор игры («Мне повезёт!»)';
            if (steamBody) {
                steamBody.insertBefore(randBanner, steamBody.firstChild);
            }
        } else {
            randBanner.style.display = 'inline-flex';
        }
    } else if (randBanner) {
        randBanner.style.display = 'none';
    }

    let hoursFmt;
    if (game.hoursDisplay) {
        hoursFmt = game.hoursDisplay;
    } else if (game.minutes > 0 && game.minutes < 120) {
        hoursFmt = `${game.minutes} мин. (${String(game.hours).replace('.', ',')} ч.)`;
    } else if (game.hours >= 1000) {
        hoursFmt = game.hours.toLocaleString('ru-RU') + ' ч.';
    } else {
        hoursFmt = String(game.hours).replace('.', ',') + ' ч.';
    }

    // Set banner
    const bannerEl = document.getElementById('steam-modal-banner');
    const bgUrl = game.header || game.cover || '';
    if (bannerEl) {
        bannerEl.style.backgroundImage = `url('${bgUrl}')`;
    }

    // Cover image
    const coverEl = document.getElementById('steam-modal-cover');
    if (coverEl) {
        coverEl.src = game.cover || game.header || '';
        coverEl.alt = game.title || '';
    }

    // Title & app id
    const titleEl = document.getElementById('steam-modal-title');
    if (titleEl) titleEl.textContent = game.title;

    const isNonSteam = game.platform && game.platform !== 'Steam';
    const appidEl = document.getElementById('steam-modal-appid-badge');
    if (appidEl) {
        appidEl.textContent = isNonSteam 
            ? (game.platformBadge || game.platform || 'Вне Steam') 
            : `Steam App #${game.id}`;
    }

    // Playtime badge
    const hoursEl = document.getElementById('steam-modal-hours-badge');
    if (hoursEl) hoursEl.textContent = `🔥 ${hoursFmt}`;

    // HLTB top badge
    const hltb = window.getHltbData ? window.getHltbData(game) : null;
    const hltbBadgeEl = document.getElementById('steam-modal-hltb-badge');
    if (hltbBadgeEl) {
        if (hltb && !hltb.isTool && hltb.label) {
            hltbBadgeEl.style.display = 'inline-block';
            const cleanLabel = hltb.label.replace(/^[\p{Emoji}\u2000-\u3300]\s*/u, '');
            const icon = hltb.type === 'coop' ? '👥' : (hltb.type === 'multi' || hltb.type === 'endless' ? '∞' : '⏱️');
            hltbBadgeEl.textContent = `${icon} ${cleanLabel}`;
            if (hltb.type === 'multi' || hltb.type === 'endless') {
                hltbBadgeEl.classList.add('badge-hltb-endless');
                hltbBadgeEl.classList.remove('badge-hltb-coop');
            } else if (hltb.type === 'coop') {
                hltbBadgeEl.classList.add('badge-hltb-coop');
                hltbBadgeEl.classList.remove('badge-hltb-endless');
            } else {
                hltbBadgeEl.classList.remove('badge-hltb-endless');
                hltbBadgeEl.classList.remove('badge-hltb-coop');
            }
        } else {
            hltbBadgeEl.style.display = 'none';
        }
    }

    // Perfect badge
    const perfectEl = document.getElementById('steam-modal-perfect-badge');
    if (perfectEl) {
        if (game.perfect) {
            perfectEl.style.display = 'inline-block';
            perfectEl.textContent = `🏆 100% Идеальная (${game.achievements || 'Все ачивки'})`;
        } else {
            perfectEl.style.display = 'none';
        }
    }

    // Genres row
    const genresEl = document.getElementById('steam-modal-genres');
    if (genresEl) {
        if (Array.isArray(game.genres) && game.genres.length > 0) {
            genresEl.innerHTML = game.genres.map(gn => 
                `<span class="sc-genre-tag" data-genre="${escHtml(gn)}" title="Фильтровать по жанру ${escHtml(gn)}">${escHtml(gn)}</span>`
            ).join('');
            genresEl.querySelectorAll('.sc-genre-tag').forEach(tag => {
                tag.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeSteamModal();
                    toggleSteamGenre(tag.dataset.genre);
                });
            });
            genresEl.style.display = 'flex';
        } else {
            genresEl.style.display = 'none';
        }
    }

    // Achievements section
    const achBlock = document.getElementById('steam-modal-ach-block');
    const achCounts = document.getElementById('steam-modal-ach-counts');
    const achBar = document.getElementById('steam-modal-ach-bar');
    if (achBlock) {
        if (game.achTotal > 0) {
            achBlock.style.display = 'block';
            if (achCounts) {
                achCounts.textContent = `${game.achUnlocked} / ${game.achTotal} (${game.achPercent || 0}%)`;
            }
            if (achBar) {
                achBar.style.width = `${game.achPercent || 0}%`;
                if (game.perfect) {
                    achBar.style.background = 'linear-gradient(90deg, #ffd700, #ff9900)';
                } else {
                    achBar.style.background = 'linear-gradient(90deg, #00f2fe, #4facfe)';
                }
            }
        } else if (game.achievements) {
            achBlock.style.display = 'block';
            if (achCounts) {
                achCounts.textContent = game.achievements;
            }
            if (achBar) {
                achBar.style.width = game.perfect ? '100%' : '60%';
                achBar.style.background = game.perfect 
                    ? 'linear-gradient(90deg, #ffd700, #ff9900)' 
                    : 'linear-gradient(90deg, #a855f7, #ec4899)';
            }
        } else {
            achBlock.style.display = 'none';
        }
    }

    // Review section
    const revBlock = document.getElementById('steam-modal-review-block');
    const revText = document.getElementById('steam-modal-review-text');
    if (revBlock) {
        if (game.reviewText && game.reviewText.trim().length > 0) {
            revBlock.style.display = 'block';
            if (revText) revText.textContent = `«${game.reviewText}»`;
        } else {
            revBlock.style.display = 'none';
        }
    }

    // HowLongToBeat section
    const hltbBlock = document.getElementById('steam-modal-hltb-block');
    const hltbCardsEl = document.getElementById('steam-modal-hltb-cards');
    const hltbLinkEl = document.getElementById('steam-modal-hltb-link');
    const hltbCompEl = document.getElementById('steam-modal-hltb-compare');

    if (hltbBlock) {
        if (hltb && !hltb.isTool && hltb.label) {
            hltbBlock.style.display = 'block';
            if (hltbLinkEl) {
                hltbLinkEl.href = hltb.url || `https://howlongtobeat.com/?q=${encodeURIComponent(game.title || '')}`;
            }

            if (hltbCardsEl) {
                if (hltb.type === 'multi' || hltb.type === 'endless') {
                    const typeLabel = hltb.type === 'multi' ? 'Мультиплеер / Сессионная' : 'Песочница / Выживание';
                    hltbCardsEl.innerHTML = `
                        <div class="sm-hltb-col col-full">
                            <span class="sm-hltb-val">∞</span>
                            <span class="sm-hltb-label">${typeLabel}</span>
                            <span class="sm-hltb-sub">Фиксированного сюжетного финала нет — игра рассчитана на бесконечные часы геймплея.</span>
                        </div>
                    `;
                } else if (hltb.type === 'coop') {
                    if (hltb.main || hltb.extra) {
                        const mainFmt = hltb.main ? `~${hltb.main} ч.` : '—';
                        const extraFmt = hltb.extra ? `~${hltb.extra} ч.` : '—';
                        const compFmt = hltb.complete ? `~${hltb.complete} ч.` : '—';

                        const mainLabel = hltb.mainLabel || 'Кооператив';
                        const extraLabel = hltb.extraLabel || 'PvPvE / Сезоны';
                        const compLabel = hltb.compLabel || '100% Финал';

                        const addIcon = (lbl, defaultIcon) => {
                            if (/^[\p{Emoji}\u2000-\u3300]/u.test(lbl)) return lbl;
                            return `${defaultIcon} ${lbl}`;
                        };

                        hltbCardsEl.innerHTML = `
                            <div class="sm-hltb-col">
                                <span class="sm-hltb-val">${mainFmt}</span>
                                <span class="sm-hltb-label">${escHtml(addIcon(mainLabel, '👥'))}</span>
                            </div>
                            <div class="sm-hltb-col">
                                <span class="sm-hltb-val">${extraFmt}</span>
                                <span class="sm-hltb-label">${escHtml(addIcon(extraLabel, '⚔️'))}</span>
                            </div>
                            <div class="sm-hltb-col">
                                <span class="sm-hltb-val">${compFmt}</span>
                                <span class="sm-hltb-label">${escHtml(addIcon(compLabel, '🏆'))}</span>
                            </div>
                        `;
                    } else {
                        hltbCardsEl.innerHTML = `
                            <div class="sm-hltb-col col-full sm-hltb-coop-card">
                                <span class="sm-hltb-val">👥</span>
                                <span class="sm-hltb-label">Кооперативная игра</span>
                                <span class="sm-hltb-sub">Совместное прохождение с друзьями. Фиксированного времени сюжетной кампании нет — всё зависит от совместных сессий и забегов.</span>
                            </div>
                        `;
                    }
                } else {
                    const mainFmt = hltb.main ? `~${hltb.main} ч.` : '—';
                    const extraFmt = hltb.extra ? `~${hltb.extra} ч.` : '—';
                    const compFmt = hltb.complete ? `~${hltb.complete} ч.` : '—';

                    const mainLabel = hltb.mainLabel || (hltb.type === 'racing' ? 'Карьера / Треки' : 'Кампания / Сюжет');
                    const extraLabel = hltb.extraLabel || (hltb.type === 'racing' ? 'Все чемпионаты' : 'Сюжет + Допы');
                    const compLabel = hltb.compLabel || (hltb.type === 'racing' ? '100% Золотые медали' : '100% Идеал');

                    const addIcon = (lbl, defaultIcon) => {
                        if (/^[\p{Emoji}\u2000-\u3300]/u.test(lbl)) return lbl;
                        return `${defaultIcon} ${lbl}`;
                    };

                    const mainIcon = hltb.type === 'racing' ? '🏎️' : '🎯';

                    hltbCardsEl.innerHTML = `
                        <div class="sm-hltb-col">
                            <span class="sm-hltb-val">${mainFmt}</span>
                            <span class="sm-hltb-label">${escHtml(addIcon(mainLabel, mainIcon))}</span>
                        </div>
                        <div class="sm-hltb-col">
                            <span class="sm-hltb-val">${extraFmt}</span>
                            <span class="sm-hltb-label">${escHtml(addIcon(extraLabel, '🌟'))}</span>
                        </div>
                        <div class="sm-hltb-col">
                            <span class="sm-hltb-val">${compFmt}</span>
                            <span class="sm-hltb-label">${escHtml(addIcon(compLabel, '🏆'))}</span>
                        </div>
                    `;
                }
            }

            if (hltbCompEl) {
                const compText = window.formatHltbComparison ? window.formatHltbComparison(game, hltb) : null;
                if (compText) {
                    hltbCompEl.style.display = 'flex';
                    hltbCompEl.innerHTML = `<span class="sm-comp-icon">⚡</span> <span class="sm-comp-text">${escHtml(compText)}</span>`;
                } else {
                    hltbCompEl.style.display = 'none';
                }
            }
        } else {
            hltbBlock.style.display = 'none';
        }
    }

    // Description section
    const descBlock = document.getElementById('steam-modal-desc-block');
    const descText = document.getElementById('steam-modal-desc-text');
    if (descBlock) {
        if (game.desc && game.desc.trim().length > 0) {
            descBlock.style.display = 'block';
            if (descText) descText.textContent = game.desc;
        } else {
            descBlock.style.display = 'none';
        }
    }

    // Store link CTA
    const storeLink = document.getElementById('steam-modal-store-link');
    if (storeLink) {
        storeLink.href = game.url || `https://store.steampowered.com/app/${game.id}`;
        if (isNonSteam) {
            if (game.platform === 'Epic Games') {
                storeLink.textContent = 'Открыть в Epic Games Store ↗';
            } else if (game.platform === 'PC / Лаунчер' || game.id === 9900001) {
                storeLink.textContent = 'Официальный сайт Minecraft ↗';
            } else if (game.platform === 'Фан-игра') {
                storeLink.textContent = 'Страница игры на Game Jolt ↗';
            } else {
                storeLink.textContent = 'Страница игры / Вики ↗';
            }
        } else {
            storeLink.textContent = 'Открыть страницу игры в Steam ↗';
        }
    }

    // Open modal
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeSteamModal() {
    const modal = document.getElementById('steam-game-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// ── Рандомайзеры («Мне повезёт!» 🎲) ─────────────────────────────────────────
function setupRandomizers() {
    // 1. Рандомайзер медиатеки (кино, аниме, сериалы)
    const btnRandMedia = document.getElementById('btn-random-media');
    if (btnRandMedia) {
        btnRandMedia.addEventListener('click', () => {
            const pool = window.currentFilteredMediaItems && window.currentFilteredMediaItems.length > 0
                ? window.currentFilteredMediaItems
                : getFiltered();

            if (!pool || pool.length === 0) {
                alert('В текущей выборке нет тайтлов для случайного выбора. Попробуйте сбросить фильтры!');
                return;
            }

            const randIndex = Math.floor(Math.random() * pool.length);
            const randItem = pool[randIndex];
            if (randItem) {
                openModal(randItem, true);
            }
        });
    }

    // 2. Рандомайзер библиотеки Steam игр
    const btnRandSteam = document.getElementById('btn-random-steam');
    if (btnRandSteam) {
        btnRandSteam.addEventListener('click', () => {
            const pool = window.currentFilteredSteamGames && window.currentFilteredSteamGames.length > 0
                ? window.currentFilteredSteamGames
                : (window.STEAM_GAMES || []);

            if (!pool || pool.length === 0) {
                alert('В текущей выборке нет игр для случайного выбора. Попробуйте сбросить фильтры!');
                return;
            }

            const randIndex = Math.floor(Math.random() * pool.length);
            const randGame = pool[randIndex];
            if (randGame) {
                openSteamModal(randGame, true);
            }
        });
    }
}

// ── Рекомендация недели от Yurummi ────────────────────────────────────────────
function initWeeklyHighlight() {
    const card = document.getElementById('weekly-highlight-card');
    if (!card) return;

    // Ищем рекомендацию тайтла (Вайолет Эвергарден. Фильм)
    const highlightItem = allItems.find(i => i.title && (i.title.toLowerCase().includes('вайолет эвергарден') || i.title.toLowerCase().includes('эвергарден')))
        || allItems.find(i => i.rating >= 100)
        || allItems[0];

    if (!highlightItem) return;

    const openBtn = document.getElementById('btn-whc-open');
    const posterImg = document.getElementById('whc-poster-img');
    const titleEl = document.getElementById('whc-title');
    const ratingEl = document.getElementById('whc-rating-pill');
    const catEl = document.getElementById('whc-meta-cat');
    const yearEl = document.getElementById('whc-meta-year');
    const statusEl = document.getElementById('whc-meta-status');
    const genresEl = document.getElementById('whc-genres');
    const quoteEl = document.getElementById('whc-quote');

    const defaultVioletPoster = 'https://shikimori.one/system/animes/original/37987.jpg?1711979789';

    if (posterImg) {
        const posterUrl = highlightItem.poster || defaultVioletPoster;
        posterImg.src = posterUrl;
        posterImg.alt = highlightItem.title || 'Вайолет Эвергарден. Фильм';
        posterImg.onerror = () => {
            posterImg.src = defaultVioletPoster;
        };
        posterImg.style.cursor = 'pointer';
    }

    if (titleEl) titleEl.textContent = highlightItem.title || 'Вайолет Эвергарден. Фильм';
    if (ratingEl) ratingEl.textContent = `👑 ${highlightItem.rating || 100}`;
    if (catEl) catEl.textContent = '🎌 Аниме';
    if (yearEl) yearEl.textContent = '2020';
    if (statusEl) statusEl.textContent = '✅ Просмотрено';

    if (genresEl && Array.isArray(highlightItem.genres) && highlightItem.genres.length > 0) {
        genresEl.innerHTML = highlightItem.genres.map(g => `<span class="whc-genre-tag">${escHtml(g)}</span>`).join('');
    }

    if (quoteEl) {
        quoteEl.textContent = (highlightItem.review && highlightItem.review.trim().length > 0)
            ? `«${highlightItem.review}»`
            : '«Невероятно трогательная и глубокая история. Потрясающая визуальная работа студии Kyoto Animation, одна из лучших эмоциональных драм, заслужившая оценку 100 баллов!»';
    }

    const handleOpen = () => {
        openModal(highlightItem);
    };

    if (openBtn) {
        openBtn.addEventListener('click', handleOpen);
    }

    if (posterImg) {
        posterImg.addEventListener('click', handleOpen);
    }
}
