// Telegram Web App
const tg = window.Telegram.WebApp;

// Глобальные переменные
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let map = null;
let currentCategory = 'all';
let currentMapCategory = 'all';
let currentSearch = '';
let showOnlyFavorites = false;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.ready();
    console.log('Приложение запущено!');
});

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

function showAttractions() {
    const content = document.getElementById('content');

    content.innerHTML = `
        <div class="fade-in">
            <h2>📍 Достопримечательности</h2>
            <p class="text-muted mb-3">Выберите место для подробной информации</p>

            <!-- Поиск -->
            <div class="mb-3">
                <input type="text" id="attractions-search" class="form-control" placeholder="🔍 Поиск по названию..." oninput="searchAttractions()">
            </div>

            <!-- Фильтры по категориям -->
            <div class="mb-4">
                <div class="dropdown mb-2 d-block d-md-none">
                    <button class="btn btn-primary dropdown-toggle w-100" type="button" id="mobileCategoryDropdown" data-bs-toggle="dropdown">
                        ${getCategoryIcon(currentCategory)} ${currentCategory === 'all' ? 'Все категории' : getCategoryName(currentCategory)}
                    </button>
                    <ul class="dropdown-menu w-100">
                        <li><a class="dropdown-item ${currentCategory === 'all' ? 'active' : ''}" href="#" onclick="filterAttractions('all')">🌟 Все категории</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item ${currentCategory === 'architecture' ? 'active' : ''}" href="#" onclick="filterAttractions('architecture')">🏛️ Архитектура</a></li>
                        <li><a class="dropdown-item ${currentCategory === 'religion' ? 'active' : ''}" href="#" onclick="filterAttractions('religion')">⛪ Религия</a></li>
                        <li><a class="dropdown-item ${currentCategory === 'sights' ? 'active' : ''}" href="#" onclick="filterAttractions('sights')">📸 Достопримечательности</a></li>
                        <li><a class="dropdown-item ${currentCategory === 'entertainment' ? 'active' : ''}" href="#" onclick="filterAttractions('entertainment')">🎪 Развлечения</a></li>
                    </ul>
                </div>

                <div class="btn-group w-100 d-none d-md-flex" role="group">
                    <button type="button" class="btn ${currentCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('all')">
                        🌟 Все
                    </button>
                    <button type="button" class="btn ${currentCategory === 'architecture' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('architecture')">
                        🏛️ Архитектура
                    </button>
                    <button type="button" class="btn ${currentCategory === 'religion' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('religion')">
                        ⛪ Религия
                    </button>
                    <button type="button" class="btn ${currentCategory === 'sights' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('sights')">
                        📸 Достопримечательности
                    </button>
                    <button type="button" class="btn ${currentCategory === 'entertainment' ? 'btn-primary' : 'btn-outline-primary'}"
                            onclick="filterAttractions('entertainment')">
                        🎪 Развлечения
                    </button>
                </div>

                <!-- Бейджи активных фильтров для мобильных -->
                <div class="d-flex flex-wrap gap-2 mt-2 d-block d-md-none">
                    <span class="badge bg-primary">${getCategoryIcon(currentCategory)} ${currentCategory === 'all' ? 'Все категории' : getCategoryName(currentCategory)}</span>
                </div>
            </div>

            <div class="list-group" id="attractions-list">
                ${renderAttractionsList(currentCategory)}
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
        dropdownBtn.innerHTML = `${getCategoryIcon(category)} ${category === 'all' ? 'Все категории' : getCategoryName(category)}`;
    }
}

function searchAttractions() {
    const searchInput = document.getElementById('attractions-search');
    if (searchInput) {
        currentSearch = searchInput.value.toLowerCase();
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
        filteredAttractions = filteredAttractions.filter(item =>
            item.name.toLowerCase().includes(currentSearch)
        );
    }

    if (filteredAttractions.length === 0) {
        return `
            <div class="text-center py-4">
                <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
                <h5>Ничего не найдено</h5>
                <p class="text-muted">Попробуйте изменить поиск или категорию</p>
                <button class="btn btn-outline-primary" onclick="filterAttractions('all'); document.getElementById('attractions-search').value=''; currentSearch='';">
                    Показать все достопримечательности
                </button>
            </div>
        `;
    }

    return filteredAttractions.map(item => `
        <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="mb-1 text-muted small">${item.description}</p>
                    <small class="text-muted">📍 ${item.address}</small>
                </div>
                <div class="text-end ms-2">
                    <span class="badge bg-primary mb-1">${getCategoryIcon(item.category)}</span>
                    <br>
                    <small class="text-muted d-none d-md-block">${getCategoryName(item.category)}</small>
                </div>
            </div>
        </div>
    `).join('');
}

function showAttractionDetail(id) {
    const item = attractions.find(attr => attr.id === id);
    const content = document.getElementById('content');
    
    const isFavorite = favorites.includes(id);
    
    let contactsHtml = '';
    if (item.phone) contactsHtml += `<p><strong>📞 Телефон:</strong> ${item.phone}</p>`;
    if (item.website) {
        contactsHtml += `<p><strong>🌐 Сайт:</strong> <a href="${item.website}" target="_blank">${item.website}</a></p>`;
    }
    
    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="showAttractions()">← Назад к списку</button>
        
        <div class="card fade-in">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="card-title h4">${item.name}</h2>
                    <span class="badge bg-primary">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</span>
                </div>
                
                <div class="info-card mb-3">
                    <p class="mb-2"><strong>📍 Адрес:</strong> ${item.address}</p>
                    <p class="mb-2"><strong>🕒 Время работы:</strong> ${item.workingHours}</p>
                    <p class="mb-0"><strong>💰 Стоимость:</strong> ${item.price}</p>
                </div>
                
                <p class="card-text">${item.fullDescription}</p>
                
                ${contactsHtml ? `
                    <div class="contacts-section mt-4">
                        <h5 class="mb-3">📞 Контакты</h5>
                        <div class="contacts-card">
                            ${contactsHtml}
                        </div>
                    </div>
                ` : ''}
                
                <div class="d-grid gap-2 mt-4">
                    <button class="btn btn-success btn-lg" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ Построить маршрут
                    </button>
                    
                    <button class="btn ${isFavorite ? 'btn-warning' : 'btn-outline-warning'}" 
                            onclick="${isFavorite ? `removeFromFavorites(${item.id})` : `addToFavorites(${item.id})`}">
                        ${isFavorite ? '❌ Удалить из избранного' : '⭐ Добавить в избранное'}
                    </button>
                    
                    ${item.website ? `
                        <button class="btn btn-info" onclick="tg.openLink('${item.website}')">
                            🌐 Открыть сайт
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// ==================== КАРТА С ФИЛЬТРАЦИЕЙ ====================

function showMap() {
    const content = document.getElementById('content');

    content.innerHTML = `
        <div class="fade-in">
            <h2>🗺️ Карта Гродно</h2>
            <p class="text-muted mb-3">Все достопримечательности на карте</p>

            <!-- Поиск и фильтры -->
            <div class="mb-3">
                <div class="row">
                    <div class="col-8">
                        <input type="text" id="map-search" class="form-control" placeholder="🔍 Поиск по названию..." oninput="searchMap()">
                    </div>
                    <div class="col-4">
                        <button class="btn ${showOnlyFavorites ? 'btn-warning' : 'btn-outline-warning'} w-100" onclick="toggleFavoritesFilter()">
                            ${showOnlyFavorites ? '⭐ Только избранное' : '⭐ Показать избранное'}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Фильтры для карты -->
            <div class="mb-4">
                <div class="dropdown mb-2 d-block d-md-none">
                    <button class="btn btn-success dropdown-toggle w-100" type="button" id="mobileMapCategoryDropdown" data-bs-toggle="dropdown">
                        ${getCategoryIcon(currentMapCategory)} ${currentMapCategory === 'all' ? 'Все на карте' : getCategoryName(currentMapCategory)}
                    </button>
                    <ul class="dropdown-menu w-100">
                        <li><a class="dropdown-item ${currentMapCategory === 'all' ? 'active' : ''}" href="#" onclick="filterMap('all')">🌟 Все на карте</a></li>
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
                        🌟 Все
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'architecture' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('architecture')">
                        🏛️ Архитектура
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'religion' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('religion')">
                        ⛪ Религия
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'sights' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('sights')">
                        📸 Достопримечательности
                    </button>
                    <button type="button" class="btn ${currentMapCategory === 'entertainment' ? 'btn-success' : 'btn-outline-success'} mb-1"
                            onclick="filterMap('entertainment')">
                        🎪 Развлечения
                    </button>
                </div>

                <!-- Бейджи активных фильтров для мобильных -->
                <div class="d-flex flex-wrap gap-2 mt-2 d-block d-md-none">
                    <span class="badge bg-success">${getCategoryIcon(currentMapCategory)} ${currentMapCategory === 'all' ? 'Все на карте' : getCategoryName(currentMapCategory)}</span>
                </div>
            </div>

            <div id="map" style="height: 400px;"></div>

            <div class="mt-3">
                <div class="list-group" id="map-attractions-list">
                    ${renderMapAttractionsList(currentMapCategory)}
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
        dropdownBtn.innerHTML = `${getCategoryIcon(category)} ${category === 'all' ? 'Все на карте' : getCategoryName(category)}`;
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
        button.innerHTML = showOnlyFavorites ? '⭐ Только избранное' : '⭐ Показать избранное';
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
        filteredAttractions = filteredAttractions.filter(item =>
            item.name.toLowerCase().includes(currentSearch)
        );
    }

    if (filteredAttractions.length === 0) {
        return `
            <div class="text-center py-4">
                <div style="font-size: 48px; margin-bottom: 10px;">🗺️</div>
                <h5>Ничего не найдено</h5>
                <p class="text-muted">Попробуйте изменить поиск или категорию</p>
                <button class="btn btn-outline-success" onclick="filterMap('all'); document.getElementById('map-search').value=''; currentSearch='';">
                    Показать все на карте
                </button>
            </div>
        `;
    }

    return filteredAttractions.map(item => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div class="flex-grow-1">
                    <strong class="d-block">${item.name}</strong>
                    <small class="text-muted d-block">📍 ${item.address}</small>
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
        console.log('Инициализация карты...');
        
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
            filteredPlaces = filteredPlaces.filter(place =>
                place.name.toLowerCase().includes(currentSearch)
            );
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
                        <h6 class="mb-1">${place.name}</h6>
                        <p class="mb-1"><strong>${getCategoryIcon(place.category)} ${getCategoryName(place.category)}</strong></p>
                        <p class="mb-1 small">${place.description}</p>
                        <p class="mb-2 small"><strong>📍 Адрес:</strong> ${place.address}</p>
                        <div class="d-grid gap-1">
                            <button onclick="openInMaps(${place.coords.lat}, ${place.coords.lng})"
                                    style="background: #28a745; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                🗺️ Маршрут
                            </button>
                            <button onclick="showAttractionDetail(${place.id})"
                                    style="background: #007bff; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                ℹ️ Подробнее
                            </button>
                            <button onclick="${isFavorite ? `removeFromFavorites(${place.id})` : `addToFavorites(${place.id})`}; this.closest('.leaflet-popup').remove();"
                                    style="background: ${isFavorite ? '#ffc107' : '#6f42c1'}; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                ${isFavorite ? '❌ Удалить из избранного' : '⭐ Добавить в избранное'}
                            </button>
                        </div>
                    </div>
                `);

            // Добавляем анимацию при наведении
            marker.on('mouseover', function() {
                this.openPopup();
            });
        });
        
        console.log('Карта успешно загружена!');
        
    } catch (error) {
        console.error('Ошибка загрузки карты:', error);
        document.getElementById('map').innerHTML = `
            <div class="alert alert-warning text-center p-4">
                <h5>🗺️ Карта временно недоступна</h5>
                <p>Используйте список ниже для навигации</p>
            </div>
        `;
    }
}

// ==================== МАРШРУТЫ ====================

function showRoutes() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>🚶 Маршруты</h2>
            <p class="text-muted mb-4">Выберите маршрут для исследования города</p>
            
            <div class="row">
                ${routes.map(route => `
                    <div class="col-12 col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${route.name}</h5>
                                <p class="card-text">${route.description}</p>
                                <div class="route-meta">
                                    <small class="text-muted">
                                        ⏱️ ${route.duration} | 📏 ${route.distance}
                                    </small>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary w-100" onclick="startRoute(${route.id})">
                                    🚶 Начать маршрут
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
    const route = routes.find(r => r.id === routeId);
    const content = document.getElementById('content');

    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="showRoutes()">← Назад к маршрутам</button>

        <div class="card fade-in">
            <div class="card-body">
                <h2 class="card-title">${route.name}</h2>
                <p class="card-text">${route.description}</p>
                <div class="route-info mb-4">
                    <div class="row">
                        <div class="col-6">
                            <strong>⏱️ Длительность:</strong> ${route.duration}
                        </div>
                        <div class="col-6">
                            <strong>📏 Расстояние:</strong> ${route.distance}
                        </div>
                    </div>
                </div>

                <h5 class="mb-3">🚶 Остановки маршрута:</h5>
                <div class="list-group mb-4">
                    ${route.stops.map((stopId, index) => {
                        const place = attractions.find(a => a.id === stopId);
                        return `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${index + 1}. ${place.name}</strong>
                                    <br><small class="text-muted">${place.address}</small>
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
                        🗺️ Показать маршрут на карте
                    </button>
                    <button class="btn btn-primary" onclick="startRouteNavigation(${routeId})">
                        🚶 Начать навигацию
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== ИЗБРАННОЕ ====================

function showFavorites() {
    const content = document.getElementById('content');
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <div class="text-center py-5">
                <div style="font-size: 64px; margin-bottom: 20px;">⭐</div>
                <h3>Избранное пусто</h3>
                <p class="text-muted">Добавляйте места в избранное, нажимая на звездочку</p>
                <button class="btn btn-primary mt-3" onclick="showAttractions()">
                    📍 Смотреть достопримечательности
                </button>
            </div>
        `;
        return;
    }
    
    const favoriteItems = attractions.filter(item => favorites.includes(item.id));
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>⭐ Избранное</h2>
            <p class="text-muted mb-3">${favorites.length} ${getPluralForm(favorites.length, ['место', 'места', 'мест'])} в избранном</p>
            
            <div class="list-group">
                ${favoriteItems.map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                                <h5 class="mb-1">${item.name} ⭐</h5>
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
                    🗑️ Очистить все
                </button>
            </div>
        </div>
    `;
}

function addToFavorites(attractionId) {
    if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        tg.showAlert('✅ Добавлено в избранное!');
        
        // Если открыта страница избранного - обновляем
        if (document.getElementById('content').innerHTML.includes('Избранное')) {
            showFavorites();
        }
    }
}

function removeFromFavorites(attractionId) {
    favorites = favorites.filter(id => id !== attractionId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    tg.showAlert('❌ Удалено из избранного');
    showFavorites();
}

function clearAllFavorites() {
    if (favorites.length === 0) {
        tg.showAlert('📭 Избранное уже пустое');
        return;
    }
    
    favorites = [];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    tg.showAlert('🗑️ Все очищено!');
    showFavorites();
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
    const route = routes.find(r => r.id === routeId);
    const content = document.getElementById('content');

    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="startRoute(${routeId})">← Назад к маршруту</button>

        <div class="fade-in">
            <h2>🗺️ ${route.name} на карте</h2>
            <p class="text-muted mb-3">Маршрут с остановками</p>

            <div id="route-map" style="height: 500px;"></div>

            <div class="mt-3">
                <h5>🚶 Остановки:</h5>
                <div class="list-group">
                    ${route.stops.map((stopId, index) => {
                        const place = attractions.find(a => a.id === stopId);
                        return `
                            <div class="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${index + 1}. ${place.name}</strong>
                                    <br><small class="text-muted">${place.address}</small>
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

        const latlngs = [];
        route.stops.forEach((stopId, index) => {
            const place = attractions.find(a => a.id === stopId);
            latlngs.push([place.coords.lat, place.coords.lng]);

            const marker = L.marker([place.coords.lat, place.coords.lng])
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h6>${index + 1}. ${place.name}</h6>
                        <p class="mb-1 small">${place.description}</p>
                        <p class="mb-2 small"><strong>📍 Адрес:</strong> ${place.address}</p>
                        <div class="d-grid gap-1">
                            <button onclick="showAttractionDetail(${place.id})"
                                    style="background: #007bff; color: white; border: none; padding: 6px; border-radius: 4px; font-size: 12px;">
                                ℹ️ Подробнее
                            </button>
                        </div>
                    </div>
                `);
        });

        // Рисуем линию маршрута
        L.polyline(latlngs, {color: 'blue', weight: 3, opacity: 0.7}).addTo(map);

        // Подгоняем карту под маршрут
        map.fitBounds(latlngs);

    } catch (error) {
        console.error('Ошибка загрузки карты маршрута:', error);
        document.getElementById('route-map').innerHTML = `
            <div class="alert alert-warning text-center p-4">
                <h5>🗺️ Карта временно недоступна</h5>
            </div>
        `;
    }
}

function startRouteNavigation(routeId) {
    const route = routes.find(r => r.id === routeId);
    if (route.stops.length > 0) {
        const firstStop = attractions.find(a => a.id === route.stops[0]);
        tg.showAlert(`Начинаем маршрут "${route.name}" с первой остановки: ${firstStop.name}`);
        openInMaps(firstStop.coords.lat, firstStop.coords.lng);
    }
}