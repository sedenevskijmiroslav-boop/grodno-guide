// Telegram Web App
const tg = window.Telegram.WebApp;

// Глобальные переменные
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let visited = JSON.parse(localStorage.getItem('visited')) || [];
let reviews = JSON.parse(localStorage.getItem('reviews')) || {};
let map = null;
let currentCategory = 'all';
let currentMapCategory = 'all';
let currentSearch = '';
let showOnlyFavorites = false;
let currentLanguage = localStorage.getItem('language') || 'ru';
let currentView = 'home'; // home, attractions, map, routes, favorites, route-detail
let currentRouteId = null;
let currentAttractionId = null;

// Функция перевода
function t(key) {
    return translations[currentLanguage][key] || key;
}

// Функция для получения локализованного текста достопримечательности
function getAttractionText(attraction, field) {
    const attrData = translations[currentLanguage].attractionsData[attraction.id];
    if (attrData && attrData[field]) {
        return attrData[field];
    }
    return attraction[field];
}

// Функция для проверки соответствия поиска по обоим языкам
function matchSearch(item, search) {
    if (!search) return true;
    const searchLower = search.toLowerCase();

    // Проверяем русские поля
    const ruData = translations.ru.attractionsData[item.id];
    if (ruData) {
        if (ruData.name.toLowerCase().includes(searchLower)) return true;
        if (ruData.description.toLowerCase().includes(searchLower)) return true;
        if (ruData.address && ruData.address.toLowerCase().includes(searchLower)) return true;
    }

    // Проверяем английские поля
    const enData = translations.en.attractionsData[item.id];
    if (enData) {
        if (enData.name.toLowerCase().includes(searchLower)) return true;
        if (enData.description.toLowerCase().includes(searchLower)) return true;
        if (enData.address && enData.address.toLowerCase().includes(searchLower)) return true;
    }

    return false;
}


// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.ready();
    console.log('Application started!');
});

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

function showAttractions() {
    currentView = 'attractions';
    const content = document.getElementById('content');

    content.innerHTML = `
        <div class="page-transition">
        <div class="fade-in">
            <h2>${t('attractions')}</h2>
            <p class="text-muted mb-3">${t('choosePlace')}</p>

            <!-- Поиск -->
            <div class="mb-3">
                <div class="input-group">
                    <input type="text" id="attractions-search" class="form-control" placeholder="${t('searchPlaceholder')}" oninput="searchAttractions()">
                    <button class="btn btn-outline-secondary" id="clear-search-btn" onclick="clearSearch()" style="display: none;" title="${t('clearSearch')}">
                        ❌
                    </button>
                </div>
            </div>

            <!-- Фильтры по категориям -->
            <div class="mb-4">
                <div class="dropdown mb-2 d-block d-md-none">
                    <button class="btn btn-primary dropdown-toggle w-100" type="button" id="mobileCategoryDropdown" data-bs-toggle="dropdown">
                        ${getCategoryIcon(currentCategory)} ${currentCategory === 'all' ? t('allCategories') : getCategoryName(currentCategory)}
                    </button>
                    <ul class="dropdown-menu w-100">
                        <li><a class="dropdown-item ${currentCategory === 'all' ? 'active' : ''}" href="#" onclick="filterAttractions('all')">🌟 ${t('allCategories')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item ${currentCategory === 'architecture' ? 'active' : ''}" href="#" onclick="filterAttractions('architecture')">${t('architecture')}</a></li>
                        <li><a class="dropdown-item ${currentCategory === 'religion' ? 'active' : ''}" href="#" onclick="filterAttractions('religion')">${t('religion')}</a></li>
                        <li><a class="dropdown-item ${currentCategory === 'sights' ? 'active' : ''}" href="#" onclick="filterAttractions('sights')">${t('sights')}</a></li>
                        <li><a class="dropdown-item ${currentCategory === 'entertainment' ? 'active' : ''}" href="#" onclick="filterAttractions('entertainment')">${t('entertainment')}</a></li>
                    </ul>
                </div>

                <div class="btn-group w-100 d-none d-md-flex" role="group">
                    <button type="button" class="btn ${currentCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('all')">
                        🌟 ${t('allCategories')}
                    </button>
                    <button type="button" class="btn ${currentCategory === 'architecture' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('architecture')">
                        ${t('architecture')}
                    </button>
                    <button type="button" class="btn ${currentCategory === 'religion' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('religion')">
                        ${t('religion')}
                    </button>
                    <button type="button" class="btn ${currentCategory === 'sights' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('sights')">
                        ${t('sights')}
                    </button>
                    <button type="button" class="btn ${currentCategory === 'entertainment' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('entertainment')">
                        ${t('entertainment')}
                    </button>
                </div>

                <!-- Бейджи активных фильтров для мобильных -->
                <div class="d-flex flex-wrap gap-2 mt-2 d-block d-md-none">
                    <span class="badge bg-primary">${getCategoryIcon(currentCategory)} ${currentCategory === 'all' ? t('allCategories') : getCategoryName(currentCategory)}</span>
                </div>
            </div>

            <div class="list-group" id="attractions-list">
                ${renderAttractionsList(currentCategory)}
            </div>
        </div>
        </div>
    `;
}

function filterAttractions(category) {
    currentCategory = category;
    const attractionsList = document.getElementById('attractions-list');

    if (attractionsList) {
        attractionsList.innerHTML = renderAttractionsList(category);
    } else {
        // Если список не найден, перерисовываем весь контент
        showAttractions();
    }

    // Обновляем текст в dropdown на мобильных
    const dropdownBtn = document.getElementById('mobileCategoryDropdown');
    if (dropdownBtn) {
        dropdownBtn.innerHTML = `${getCategoryIcon(category)} ${category === 'all' ? t('allCategories') : getCategoryName(category)}`;
    }
}

function searchAttractions() {
    const searchInput = document.getElementById('attractions-search');
    const clearBtn = document.getElementById('clear-search-btn');
    if (searchInput) {
        currentSearch = searchInput.value.toLowerCase();

        // Показываем/скрываем кнопку очистки
        if (clearBtn) {
            clearBtn.style.display = currentSearch ? 'block' : 'none';
        }

        const attractionsList = document.getElementById('attractions-list');

        if (attractionsList) {
            attractionsList.innerHTML = renderAttractionsList(currentCategory);
        }
    }
}

function clearSearch() {
    const searchInput = document.getElementById('attractions-search');
    const clearBtn = document.getElementById('clear-search-btn');

    if (searchInput) {
        searchInput.value = '';
        currentSearch = '';
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        const attractionsList = document.getElementById('attractions-list');
        if (attractionsList) {
            attractionsList.innerHTML = renderAttractionsList(currentCategory);
        }
    }
}

function renderAttractionsList(category = 'all') {
    let filteredAttractions = category === 'all'
        ? attractions
        : attractions.filter(item => item.category === category);

    // Фильтр по поиску
    if (currentSearch) {
        filteredAttractions = filteredAttractions.filter(item => matchSearch(item, currentSearch));
    }

    if (filteredAttractions.length === 0) {
        return `
            <div class="text-center py-4">
                <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
                <h5>${t('nothingFound')}</h5>
                <p class="text-muted">${t('tryDifferentCategory')}</p>
                <button class="btn btn-outline-primary" onclick="filterAttractions('all'); document.getElementById('attractions-search').value=''; currentSearch='';">
                    ${t('showAllAttractions')}
                </button>
            </div>
        `;
    }

    return filteredAttractions.map((item, index) => `
        <div class="list-group-item list-group-item-action stagger-item" onclick="showAttractionDetail(${item.id})">
            <div class="d-flex align-items-start">
                ${item.image ? `<img src="${item.image}" class="me-3" alt="${getAttractionText(item, 'name')}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px;">` : ''}
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5 class="mb-1">${getAttractionText(item, 'name')}</h5>
                            <p class="mb-1 text-muted small">${getAttractionText(item, 'description')}</p>
                            <small class="text-muted">📍 ${getAttractionText(item, 'address')}</small>
                        </div>
                        <div class="text-end ms-2">
                            <span class="badge bg-primary mb-1">${getCategoryIcon(item.category)}</span>
                            <br>
                            <small class="text-muted d-none d-md-block">${getCategoryName(item.category)}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function showAttractionDetail(id) {
    currentView = 'attraction-detail';
    currentAttractionId = id;
    const item = attractions.find(attr => attr.id === id);
    const content = document.getElementById('content');

    const isFavorite = favorites.includes(id);

    let contactsHtml = '';
    if (item.phone) contactsHtml += `<p><strong>📞 ${t('phone')}:</strong> ${item.phone}</p>`;
    if (item.website) {
        contactsHtml += `<p><strong>🌐 ${t('website')}:</strong> <a href="${item.website}" target="_blank">${item.website}</a></p>`;
    }

    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="showAttractions()">${t('backToList')}</button>

        <div class="card fade-in">
            <div class="card-body">
                ${item.image ? `<img src="${item.image}" class="card-img-top mb-3" alt="${getAttractionText(item, 'name')}" style="max-height: 300px; object-fit: cover; border-radius: 8px;">` : ''}
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="card-title h4">${getAttractionText(item, 'name')}</h2>
                    <span class="badge bg-primary">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</span>
                </div>

                <div class="info-card mb-3">
                    <p class="mb-2"><strong>📍 ${t('address')}:</strong> ${getAttractionText(item, 'address')}</p>
                    <p class="mb-2"><strong>🕒 ${t('workingHours')}:</strong> ${getAttractionText(item, 'workingHours')}</p>
                    <p class="mb-0"><strong>💰 ${t('price')}:</strong> ${getAttractionText(item, 'price')}</p>
                </div>

                <p class="card-text">${getAttractionText(item, 'fullDescription')}</p>

                ${contactsHtml ? `
                    <div class="contacts-section mt-4">
                        <h5 class="mb-3">${t('contacts')}</h5>
                        <div class="contacts-card">
                            ${contactsHtml}
                        </div>
                    </div>
                ` : ''}

                <div class="d-grid gap-2 mt-4">
                    <button class="btn btn-success btn-lg" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ ${t('buildRoute')}
                    </button>

                    <button class="btn ${isFavorite ? 'btn-warning' : 'btn-outline-warning'} favorite-btn"
                            onclick="${isFavorite ? `removeFromFavorites(${item.id})` : `addToFavorites(${item.id})`}">
                        ${isFavorite ? '❌ ' + t('removeFromFavorites') : '⭐ ' + t('addToFavorites')}
                    </button>

                    <button class="btn ${visited.includes(item.id) ? 'btn-success' : 'btn-outline-success'}" onclick="${visited.includes(item.id) ? '' : `markAsVisited(${item.id})`}" ${visited.includes(item.id) ? 'disabled' : ''}>
                        ✅ ${visited.includes(item.id) ? t('visited') : t('markAsVisited')}
                    </button>

                    ${item.website ? `
                        <button class="btn btn-info" onclick="tg.openLink('${item.website}')">
                            🌐 ${t('openSite')}
                        </button>
                    ` : ''}
                </div>

                <div class="mt-4">
                    <h6>${t('review')}:</h6>
                    ${reviews[item.id] ? `
                        <div class="review-card mb-3">
                            <p class="mb-0">${typeof reviews[item.id] === 'string' ? reviews[item.id] : reviews[item.id].text}</p>
                        </div>
                    ` : ''}
                    <textarea id="review-${item.id}" class="form-control mb-2" rows="3" placeholder="${t('review')}...">${typeof reviews[item.id] === 'string' ? reviews[item.id] : reviews[item.id]?.text || ''}</textarea>
                    <button class="btn btn-primary btn-sm" onclick="saveReview(${item.id})">
                        💬 ${t('saveReview')}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== КАРТА С ФИЛЬТРАЦИЕЙ ====================

function showMap() {
    currentView = 'map';
    const content = document.getElementById('content');

    content.innerHTML = `
        <div class="page-transition">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2>${t('cityMap')}</h2>
                    <p class="text-muted mb-0">${t('allAttractionsOnMap')}</p>
                </div>
                <button class="btn btn-outline-secondary" onclick="changeLanguage()">
                    ${currentLanguage === 'ru' ? '🇺🇸 EN' : '🇷🇺 RU'}
                </button>
            </div>

            <!-- Поиск и фильтры -->
            <div class="mb-3">
                <div class="row">
                    <div class="col-8">
                        <input type="text" id="map-search" class="form-control" placeholder="${t('searchPlaceholder')}" oninput="searchMap()">
                    </div>
                    <div class="col-4">
                        <button class="btn ${showOnlyFavorites ? 'btn-warning' : 'btn-outline-warning'} w-100" onclick="toggleFavoritesFilter()">
                            ${showOnlyFavorites ? t('onlyFavorites') : t('showFavorites')}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Фильтры для карты -->
            <div class="mb-4">
                <div class="dropdown mb-2 d-block d-md-none">
                    <button class="btn btn-success dropdown-toggle w-100" type="button" id="mobileMapCategoryDropdown" data-bs-toggle="dropdown">
                        ${getCategoryIcon(currentMapCategory)} ${currentMapCategory === 'all' ? t('allOnMap') : getCategoryName(currentMapCategory)}
                    </button>
                    <ul class="dropdown-menu w-100">
                        <li><a class="dropdown-item ${currentMapCategory === 'all' ? 'active' : ''}" href="#" onclick="filterMap('all')">🌟 ${t('allOnMap')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item ${currentMapCategory === 'architecture' ? 'active' : ''}" href="#" onclick="filterMap('architecture')">🏛️ Архитектура</a></li>
                        <li><a class="dropdown-item ${currentMapCategory === 'religion' ? 'active' : ''}" href="#" onclick="filterMap('religion')">⛪ Религия</a></li>
                        <li><a class="dropdown-item ${currentMapCategory === 'sights' ? 'active' : ''}" href="#" onclick="filterMap('sights')">📸 Достопримечательности</a></li>
                        <li><a class="dropdown-item ${currentMapCategory === 'entertainment' ? 'active' : ''}" href="#" onclick="filterMap('entertainment')">🎪 Развлечения</a></li>
                    </ul>
                </div>

                <div class="btn-group w-100 d-none d-md-flex flex-wrap" role="group">
                    <button type="button" class="btn ${currentMapCategory === 'all' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('all')">
                        🌟 ${t('allCategories')}
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'architecture' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('architecture')">
                        ${t('architecture')}
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'religion' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('religion')">
                        ${t('religion')}
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'sights' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('sights')">
                        ${t('sights')}
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'entertainment' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('entertainment')">
                        ${t('entertainment')}
                    </button>
                </div>

                <!-- Бейджи активных фильтров для мобильных -->
                <div class="d-flex flex-wrap gap-2 mt-2 d-block d-md-none">
                    <span class="badge bg-success">${getCategoryIcon(currentMapCategory)} ${currentMapCategory === 'all' ? t('allOnMap') : getCategoryName(currentMapCategory)}</span>
                </div>
            </div>

            <div id="map" style="height: 400px;"></div>

            <div class="mt-3">
                <div class="list-group" id="map-attractions-list">
                    ${renderMapAttractionsList(currentMapCategory)}
                </div>
            </div>
        </div>
        </div>
    `;

    // Инициализируем карту
    setTimeout(() => initMap(currentMapCategory), 100);
}

function filterMap(category) {
    currentMapCategory = category;

    // Обновляем список достопримечательностей под картой
    const mapAttractionsList = document.getElementById('map-attractions-list');
    if (mapAttractionsList) {
        mapAttractionsList.innerHTML = renderMapAttractionsList(category);
    }

    // Обновляем текст в dropdown на мобильных
    const dropdownBtn = document.getElementById('mobileMapCategoryDropdown');
    if (dropdownBtn) {
        dropdownBtn.innerHTML = `${getCategoryIcon(category)} ${category === 'all' ? t('allOnMap') : getCategoryName(category)}`;
    }

    // Перерисовываем карту с новыми маркерами
    if (map) {
        map.remove();
        map = null;
    }

    setTimeout(() => initMap(category), 50);
}

function searchMap() {
    const searchInput = document.getElementById('map-search');
    if (searchInput) {
        currentSearch = searchInput.value.toLowerCase();

        // Обновляем список
        const mapAttractionsList = document.getElementById('map-attractions-list');
        if (mapAttractionsList) {
            mapAttractionsList.innerHTML = renderMapAttractionsList(currentMapCategory);
        }

        // Перерисовываем карту
        if (map) {
            map.remove();
            map = null;
        }

        setTimeout(() => initMap(currentMapCategory), 50);
    }
}

function toggleFavoritesFilter() {
    showOnlyFavorites = !showOnlyFavorites;

    // Обновляем кнопку
    const button = document.querySelector('button[onclick="toggleFavoritesFilter()"]');
    if (button) {
        button.className = `btn ${showOnlyFavorites ? 'btn-warning' : 'btn-outline-warning'} w-100`;
        button.innerHTML = showOnlyFavorites ? t('onlyFavorites') : t('showFavorites');
    }

    // Обновляем список
    const mapAttractionsList = document.getElementById('map-attractions-list');
    if (mapAttractionsList) {
        mapAttractionsList.innerHTML = renderMapAttractionsList(currentMapCategory);
    }

    // Перерисовываем карту
    if (map) {
        map.remove();
        map = null;
    }

    setTimeout(() => initMap(currentMapCategory), 50);
}

function renderMapAttractionsList(category = 'all') {
    let filteredAttractions = category === 'all'
        ? attractions
        : attractions.filter(item => item.category === category);

    // Фильтр по избранному
    if (showOnlyFavorites) {
        filteredAttractions = filteredAttractions.filter(item => favorites.includes(item.id));
    }

    // Фильтр по поиску
    if (currentSearch) {
        filteredAttractions = filteredAttractions.filter(item => matchSearch(item, currentSearch));
    }

    if (filteredAttractions.length === 0) {
        return `
            <div class="text-center py-4">
                <div style="font-size: 48px; margin-bottom: 10px;">🗺️</div>
                <h5>${t('nothingFound')}</h5>
                <p class="text-muted">${t('tryDifferentCategory')}</p>
                <button class="btn btn-outline-success" onclick="filterMap('all'); document.getElementById('map-search').value=''; currentSearch='';">
                    ${t('showAllOnMap')}
                </button>
            </div>
        `;
    }

    return filteredAttractions.map((item, index) => `
        <div class="list-group-item stagger-item">
            <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                    <strong class="d-block">${getAttractionText(item, 'name')}</strong>
                    <small class="text-muted d-block">📍 ${getAttractionText(item, 'address')}</small>
                    <span class="badge bg-success small">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</span>
                </div>
                <div class="d-flex flex-column gap-1 ms-2">
                    <button class="btn btn-sm btn-outline-primary"
                            onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️
                    </button>
                    <button class="btn btn-sm btn-outline-info"
                            onclick="showAttractionDetail(${item.id})">
                        ℹ️
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function initMap(category = 'all') {
    try {
        console.log('Initializing map...');
        
        // Создаем карту
        map = L.map('map').setView([53.6780, 23.8293], 14);
        
        // Добавляем слой OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Фильтруем места по категории, избранному и поиску
        let filteredPlaces = category === 'all'
            ? attractions
            : attractions.filter(place => place.category === category);

        if (showOnlyFavorites) {
            filteredPlaces = filteredPlaces.filter(place => favorites.includes(place.id));
        }

        if (currentSearch) {
            filteredPlaces = filteredPlaces.filter(place => matchSearch(place, currentSearch));
        }
        
        // Добавляем маркеры
        filteredPlaces.forEach(place => {
            const isFavorite = favorites.includes(place.id);
            const iconHtml = getMarkerIcon(place.category, isFavorite);

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            const marker = L.marker([place.coords.lat, place.coords.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        ${place.image ? `<img src="${place.image}" alt="${getAttractionText(place, 'name')}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
                        <h6 class="mb-1">${getAttractionText(place, 'name')}</h6>
                        <p class="mb-1"><strong>${getCategoryIcon(place.category)} ${getCategoryName(place.category)}</strong></p>
                        <p class="mb-1 small">${getAttractionText(place, 'description')}</p>
                        <p class="mb-2 small"><strong>📍 ${t('address')}:</strong> ${getAttractionText(place, 'address')}</p>
                        <div class="d-grid gap-1">
                            <button onclick="openInMaps(${place.coords.lat}, ${place.coords.lng})"
                                    style="background: #28a745; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                🗺️ ${t('route')}
                            </button>
                            <button onclick="showAttractionDetail(${place.id})"
                                    style="background: #007bff; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                ℹ️ ${t('details')}
                            </button>
                            <button onclick="${isFavorite ? `removeFromFavorites(${place.id})` : `addToFavorites(${place.id})`}; this.closest('.leaflet-popup').remove();"
                                    style="background: ${isFavorite ? '#ffc107' : '#6f42c1'}; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                ${isFavorite ? '❌ ' + t('removeFromFavorites') : '⭐ ' + t('addToFavorites')}
                            </button>
                        </div>
                    </div>
                `);

            // Добавляем анимацию при наведении
            marker.on('mouseover', function() {
                this.openPopup();
            });
        });
        
        console.log('Map loaded successfully!');
        
    } catch (error) {
        console.error('Error loading map:', error);
        document.getElementById('map').innerHTML = `
            <div class="alert alert-warning text-center p-4">
                <h5>🗺️ ${t('mapTemporarilyUnavailable')}</h5>
                <p>${t('useListBelow')}</p>
            </div>
        `;
    }
}

// ==================== МАРШРУТЫ ====================

function showRoutes() {
    currentView = 'routes';
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>${t('routes')}</h2>
            <p class="text-muted mb-4">${t('chooseRoute')}</p>
            
            <div class="row">
                ${routes.map(route => `
                    <div class="col-12 col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${t(route.nameKey)}</h5>
                                <p class="card-text">${t(route.descriptionKey)}</p>
                                <div class="route-meta">
                                    <small class="text-muted">
                                        ⏱️ ${route.duration} | 📏 ${route.distance}
                                    </small>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary w-100" onclick="startRoute(${route.id})">
                                    🚶 ${t('startRoute')}
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function startRoute(routeId) {
    currentView = 'route-detail';
    currentRouteId = routeId;
    const route = routes.find(r => r.id === routeId);
    const content = document.getElementById('content');

    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="showRoutes()">${t('backToRoutes')}</button>

        <div class="card fade-in">
            <div class="card-body">
                <h2 class="card-title">${t(route.nameKey)}</h2>
                <p class="card-text">${t(route.descriptionKey)}</p>
                <div class="route-info mb-4">
                    <div class="row">
                        <div class="col-6">
                            <strong>⏱️ ${t('duration')}:</strong> ${route.duration}
                        </div>
                        <div class="col-6">
                            <strong>📏 ${t('distance')}:</strong> ${route.distance}
                        </div>
                    </div>
                </div>

                <h5 class="mb-3">🚶 ${t('stops')}:</h5>
                <div class="list-group mb-4">
                    ${route.stops.map((stopId, index) => {
                        const place = attractions.find(a => a.id === stopId);
                        return `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${index + 1}. ${getAttractionText(place, 'name')}</strong>
                                    <br><small class="text-muted">${getAttractionText(place, 'address')}</small>
                                </div>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-info" onclick="showAttractionDetail(${place.id})">
                                        ℹ️
                                    </button>
                                    <button class="btn btn-sm btn-outline-primary" onclick="openInMaps(${place.coords.lat}, ${place.coords.lng})">
                                        🗺️
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="d-grid gap-2">
                    <button class="btn btn-success btn-lg" onclick="showRouteOnMap(${routeId})">
                        🗺️ ${t('showRouteOnMap')}
                    </button>
                    <button class="btn btn-primary" onclick="startRouteNavigation(${routeId})">
                        🚶 ${t('startNavigation')}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== ИЗБРАННОЕ ====================

function showFavorites() {
    currentView = 'favorites';
    const content = document.getElementById('content');
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <div class="text-center py-5">
                <div style="font-size: 64px; margin-bottom: 20px;">⭐</div>
                <h3>${t('emptyFavorites')}</h3>
                <p class="text-muted">${t('addToFavoritesHint')}</p>
                <button class="btn btn-primary mt-3" onclick="showAttractions()">
                    📍 ${t('exploreAttractions')}
                </button>
            </div>
        `;
        return;
    }
    
    const favoriteItems = attractions.filter(item => favorites.includes(item.id));
    
    content.innerHTML = `
        <div class="fade-in">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2>${t('favorites')}</h2>
                    <p class="text-muted mb-0">${favorites.length} ${t('placesInFavorites')}</p>
                </div>
                <button class="btn btn-outline-secondary" onclick="changeLanguage()">
                    ${currentLanguage === 'ru' ? '🇺🇸 EN' : '🇷🇺 RU'}
                </button>
            </div>
            
            <div class="list-group">
                ${favoriteItems.map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                                <h5 class="mb-1">${getAttractionText(item, 'name')} ⭐</h5>
                                <p class="mb-1 text-muted small">${item.description}</p>
                                <small class="text-muted">📍 ${item.address}</small>
                                <br>
                                <span class="badge bg-primary">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</span>
                            </div>
                            <button class="btn btn-outline-danger btn-sm ms-2" 
                                    onclick="event.stopPropagation(); removeFromFavorites(${item.id})">
                                ❌
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-3 text-center">
                <button class="btn btn-outline-secondary" onclick="clearAllFavorites()">
                    🗑️ ${t('clearAll')}
                </button>
            </div>
        </div>
    `;
}

function addToFavorites(attractionId) {
    if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        tg.showAlert('✅ ' + t('addToFavorites') + '!');
        
        // Если открыта страница избранного - обновляем
        if (document.getElementById('content').innerHTML.includes('Избранное')) {
            showFavorites();
        }
    }
}

function removeFromFavorites(attractionId) {
    favorites = favorites.filter(id => id !== attractionId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    tg.showAlert('❌ ' + t('removeFromFavorites'));
    showFavorites();
}

function clearAllFavorites() {
    if (favorites.length === 0) {
        tg.showAlert('📭 ' + t('emptyFavorites'));
        return;
    }

    if (confirm(t('confirmClearFavorites'))) {
        favorites = [];
        localStorage.setItem('favorites', JSON.stringify(favorites));
        tg.showAlert(t('favoritesCleared'));
        showFavorites();
    }
}

// ==================== ОТЗЫВЫ ====================

function showReviews() {
    currentView = 'reviews';
    const content = document.getElementById('content');

    // Получаем все отзывы
    const reviewEntries = Object.entries(reviews);

    if (reviewEntries.length === 0) {
        content.innerHTML = `
            <div class="page-transition">
                <div class="text-center py-5">
                    <div style="font-size: 64px; margin-bottom: 20px;">💬</div>
                    <h3>${t('noReviewsYet')}</h3>
                    <p class="text-muted">${t('addFirstReview')}</p>
                    <button class="btn btn-primary mt-3" onclick="showAttractions()">
                        📍 ${t('exploreAttractions')}
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Сортируем отзывы по дате (новые сверху)
    const sortedReviews = reviewEntries
        .map(([attractionId, reviewData]) => {
            const attraction = attractions.find(a => a.id == attractionId);
            // Поддержка старого формата (строка) и нового (объект)
            const reviewObj = typeof reviewData === 'string' ? { text: reviewData, author: 'Anonymous', timestamp: null } : reviewData;
            return {
                id: attractionId,
                attraction: attraction,
                review: reviewObj,
                name: getAttractionText(attraction, 'name')
            };
        })
        .sort((a, b) => {
            if (a.review.timestamp && b.review.timestamp) {
                return new Date(b.review.timestamp) - new Date(a.review.timestamp);
            }
            return a.name.localeCompare(b.name);
        });

    content.innerHTML = `
        <div class="page-transition">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h2>${t('allReviews')}</h2>
                    <p class="text-muted mb-0">${reviewEntries.length} ${t('reviewsCount')}</p>
                </div>
                <button class="btn btn-outline-secondary" onclick="changeLanguage()">
                    ${currentLanguage === 'ru' ? '🇺🇸 EN' : '🇷🇺 RU'}
                </button>
            </div>

            <div class="list-group">
                ${sortedReviews.map((item, index) => `
                    <div class="list-group-item stagger-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h5 class="mb-2">${item.name}</h5>
                                <p class="mb-2 text-muted small">${getAttractionText(item.attraction, 'address')}</p>
                                <div class="review-card">
                                    <p class="mb-0">${item.review.text}</p>
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline-info ms-2" onclick="showAttractionDetail(${item.id})">
                                ℹ️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==================== ЛИЧНЫЙ КАБИНЕТ ====================

function showProfile() {
    currentView = 'profile';
    const content = document.getElementById('content');

    if (visited.length === 0) {
        content.innerHTML = `
            <div class="text-center py-5">
                <div style="font-size: 64px; margin-bottom: 20px;">👤</div>
                <h3>${t('profile')}</h3>
                <p class="text-muted">${t('noVisitedPlaces')}</p>
                <button class="btn btn-primary mt-3" onclick="showAttractions()">
                    ${t('exploreAttractions')}
                </button>
            </div>
        `;
        return;
    }

    const visitedItems = attractions.filter(item => visited.includes(item.id));

    content.innerHTML = `
        <div class="fade-in">
            <h2>${t('profile')}</h2>
            <p class="text-muted mb-3">${visited.length} ${t('visitedPlaces')}</p>

            <div class="list-group">
                ${visitedItems.map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                                <h5 class="mb-1">${getAttractionText(item, 'name')} ✅</h5>
                                <p class="mb-1 text-muted small">${getAttractionText(item, 'description')}</p>
                                <small class="text-muted">${getAttractionText(item, 'address')}</small>
                                <br>
                                <span class="badge bg-success">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</span>
                            </div>
                            <div class="text-end ms-2">
                                ${reviews[item.id] ? `
                                    <div class="mt-2">
                                        <small class="text-muted">${t('review')}:</small>
                                        <div class="review-card">
                                            <p class="mb-0 small">${typeof reviews[item.id] === 'string' ? reviews[item.id] : reviews[item.id].text}</p>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="mt-3 text-center">
                <button class="btn btn-outline-danger" onclick="clearAllVisited()">
                    🗑️ ${t('clearAllVisited')}
                </button>
            </div>
        </div>
    `;
}

function markAsVisited(attractionId) {
    if (!visited.includes(attractionId)) {
        visited.push(attractionId);
        localStorage.setItem('visited', JSON.stringify(visited));
        tg.showAlert('✅ ' + t('markedAsVisitedMessage'));
        showAttractionDetail(currentAttractionId);
    }
}

function saveReview(attractionId) {
    const reviewText = document.getElementById(`review-${attractionId}`).value.trim();
    if (reviewText) {
        // Получаем информацию о пользователе
        const user = tg.initDataUnsafe?.user;
        const authorName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || `User ${user.id}` : 'Anonymous';

        // Создаем объект отзыва
        const reviewData = {
            text: reviewText,
            author: authorName,
            timestamp: new Date().toISOString(),
            userId: user?.id || null
        };

        reviews[attractionId] = reviewData;
        localStorage.setItem('reviews', JSON.stringify(reviews));
        tg.showAlert('💬 ' + t('reviewSaved'));

        // Обновляем отображение отзыва в текущем виде
        if (currentView === 'attraction-detail' && currentAttractionId == attractionId) {
            showAttractionDetail(attractionId);
        }
    }
}

function clearAllVisited() {
    if (visited.length === 0) {
        tg.showAlert('📭 ' + t('noVisitedPlaces'));
        return;
    }

    if (confirm(t('confirmClearVisited'))) {
        visited = [];
        reviews = {};
        localStorage.setItem('visited', JSON.stringify(visited));
        localStorage.setItem('reviews', JSON.stringify(reviews));
        tg.showAlert(t('visitedCleared'));
        showProfile();
    }
}

// ==================== СЛУЧАЙНАЯ ДОСТОПРИМЕЧАТЕЛЬНОСТЬ ====================

function showRandomAttraction() {
    if (attractions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * attractions.length);
    const randomAttraction = attractions[randomIndex];
    showAttractionDetail(randomAttraction.id);
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function getCategoryIcon(category) {
    const icons = {
        'architecture': '🏛️',
        'religion': '⛪',
        'sights': '📸',
        'entertainment': '🎪'
    };
    return icons[category] || '📍';
}

function getCategoryName(category) {
    const names = {
        'architecture': 'Архитектура',
        'religion': 'Религия',
        'sights': 'Достопримечательности',
        'entertainment': 'Развлечения'
    };
    return names[category] || 'Другое';
}

function getPluralForm(number, forms) {
    const cases = [2, 0, 1, 1, 1, 2];
    return forms[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
}

function getMarkerIcon(category, isFavorite) {
    const icons = {
        'architecture': '🏛️',
        'religion': '⛪',
        'sights': '📸',
        'entertainment': '🎪'
    };
    const baseIcon = icons[category] || '📍';
    const favoriteStar = isFavorite ? '⭐' : '';
    return `<div style="font-size: 24px; text-align: center;">${baseIcon}${favoriteStar}</div>`;
}

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}

function showRouteOnMap(routeId) {
    currentView = 'route-map';
    currentRouteId = routeId;
    const route = routes.find(r => r.id === routeId);
    const content = document.getElementById('content');

    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="startRoute(${routeId})">${t('back')} ${t('routeName')}</button>

        <div class="fade-in">
            <h2>🗺️ ${t(route.nameKey)} ${t('routeOnMap')}</h2>
            <p class="text-muted mb-3">${t('routeInfo')}</p>

            <div id="route-map" style="height: 500px;"></div>

            <div class="mt-3">
                <h5>🚶 ${t('routeStops')}:</h5>
                <div class="list-group">
                    ${route.stops.map((stopId, index) => {
                        const place = attractions.find(a => a.id === stopId);
                        return `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${index + 1}. ${getAttractionText(place, 'name')}</strong>
                                    <br><small class="text-muted">${getAttractionText(place, 'address')}</small>
                                </div>
                                <button class="btn btn-sm btn-outline-info" onclick="showAttractionDetail(${place.id})">
                                    ℹ️
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    setTimeout(() => initRouteMap(route), 100);
}

function initRouteMap(route) {
    try {
        const map = L.map('route-map').setView([53.6780, 23.8293], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const waypoints = [];
        route.stops.forEach((stopId, index) => {
            const place = attractions.find(a => a.id === stopId);
            waypoints.push(L.latLng(place.coords.lat, place.coords.lng));

            const isFavorite = favorites.includes(place.id);
            const iconHtml = getMarkerIcon(place.category, isFavorite);

            const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });

            const marker = L.marker([place.coords.lat, place.coords.lng], { icon: customIcon })
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        ${place.image ? `<img src="${place.image}" alt="${getAttractionText(place, 'name')}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
                        <h6>${index + 1}. ${getAttractionText(place, 'name')}</h6>
                        <p class="mb-1 small">${getAttractionText(place, 'description')}</p>
                        <p class="mb-2 small"><strong>📍 ${t('address')}:</strong> ${getAttractionText(place, 'address')}</p>
                        <div class="d-grid gap-1">
                            <button onclick="showAttractionDetail(${place.id})"
                                    style="background: #007bff; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                ℹ️ ${t('details')}
                            </button>
                        </div>
                    </div>
                `);
        });

        // Строим маршрут с routing
        if (waypoints.length > 1) {
            L.Routing.control({
                waypoints: waypoints,
                routeWhileDragging: false,
                createMarker: () => null, // Не создавать дополнительные маркеры
                lineOptions: {
                    styles: [{ color: 'blue', weight: 4, opacity: 0.7 }]
                },
                router: L.Routing.osrmv1({
                    serviceUrl: 'https://router.project-osrm.org/route/v1',
                    profile: 'foot' // Пешеходный режим
                }),
                addWaypoints: false,
                draggableWaypoints: false
            }).addTo(map);
        }

        // Подгоняем карту под маршрут
        if (waypoints.length > 0) {
            const bounds = L.latLngBounds(waypoints);
            map.fitBounds(bounds, { padding: [20, 20] });
        }

    } catch (error) {
        console.error('Error loading route map:', error);
        document.getElementById('route-map').innerHTML = `
            <div class="alert alert-warning text-center p-4">
                <h5>🗺️ ${t('mapTemporarilyUnavailable')}</h5>
            </div>
        `;
    }
}

function startRouteNavigation(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (route.stops.length > 0) {
        const firstStop = attractions.find(a => a.id === route.stops[0]);
        tg.showAlert(`${t('startRoute')} "${t(route.nameKey)}" ${t('routeName')}: ${getAttractionText(firstStop, 'name')}`);
        openInMaps(firstStop.coords.lat, firstStop.coords.lng);
    }
}

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');

    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        themeToggle.innerHTML = translations[currentLanguage].darkTheme;
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeToggle.innerHTML = translations[currentLanguage].lightTheme;
        localStorage.setItem('theme', 'light');
    }
}

function changeLanguage() {
    const langToggle = document.getElementById('lang-toggle');

    if (currentLanguage === 'ru') {
        currentLanguage = 'en';
        langToggle.innerHTML = '🇺🇸 EN';
    } else {
        currentLanguage = 'ru';
        langToggle.innerHTML = '🇷🇺 RU';
    }

    localStorage.setItem('language', currentLanguage);
    updateLanguage();
    refreshCurrentView();
}

function refreshCurrentView() {
    switch (currentView) {
        case 'home':
            // Уже обновлено в updateLanguage
            break;
        case 'attractions':
            showAttractions();
            break;
        case 'map':
            showMap();
            break;
        case 'routes':
            showRoutes();
            break;
        case 'favorites':
            showFavorites();
            break;
        case 'reviews':
            showReviews();
            break;
        case 'profile':
            showProfile();
            break;
        case 'route-detail':
            if (currentRouteId) startRoute(currentRouteId);
            break;
        case 'attraction-detail':
            if (currentAttractionId) showAttractionDetail(currentAttractionId);
            break;
        case 'route-map':
            if (currentRouteId) showRouteOnMap(currentRouteId);
            break;
    }
}

function updateLanguage() {
    const t = translations[currentLanguage];

    // Обновляем заголовки
    document.getElementById('welcome-title').textContent = t.welcomeTitle;
    document.getElementById('welcome-subtitle').textContent = t.welcomeSubtitle;

    // Обновляем кнопки навигации
    document.getElementById('btn-attractions').textContent = t.attractions;
    document.getElementById('btn-map').textContent = t.map;
    document.getElementById('btn-routes').textContent = t.routes;
    document.getElementById('btn-random').textContent = t.randomAttraction;
    document.getElementById('btn-reviews').textContent = t.reviews;
    document.getElementById('btn-favorites').textContent = t.favorites;
    document.getElementById('btn-profile').textContent = t.profile;

    // Обновляем кнопки темы и языка
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        themeToggle.innerHTML = t.lightTheme;
    } else {
        themeToggle.innerHTML = t.darkTheme;
    }
}

// Загрузка настроек при запуске
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language') || 'ru';
    const themeToggle = document.getElementById('theme-toggle');
    const langToggle = document.getElementById('lang-toggle');

    currentLanguage = savedLanguage;

    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggle.innerHTML = translations[currentLanguage].lightTheme;
    } else {
        themeToggle.innerHTML = translations[currentLanguage].darkTheme;
    }

    if (currentLanguage === 'en') {
        langToggle.innerHTML = '🇺🇸 EN';
    } else {
        langToggle.innerHTML = '🇷🇺 RU';
    }

    updateLanguage();
});