const tg = window.Telegram.WebApp;

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let favorites = [];
let map = null;
let currentMarkers = [];
let currentRoute = null;
let currentStep = 0;
let routeProgress = JSON.parse(localStorage.getItem('routeProgress')) || {};

// ==================== СИСТЕМА ИЗБРАННОГО ====================

function loadFavorites() {
    try {
        const saved = localStorage.getItem('grodnoFavorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites() {
    try {
        localStorage.setItem('grodnoFavorites', JSON.stringify(favorites));
    } catch (e) {
        console.log('Ошибка сохранения избранного');
    }
}

function isFavorite(attractionId) {
    return favorites.includes(attractionId);
}

function addToFavorites(attractionId) {
    if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        saveFavorites();
        tg.showAlert('✅ Добавлено в избранное!');
        
        // Обновляем если открыто избранное
        setTimeout(() => {
            if (document.getElementById('content').innerHTML.includes('Избранное')) {
                showFavorites();
            }
        }, 100);
    } else {
        tg.showAlert('⚠️ Уже в избранном!');
    }
}

function removeFromFavorites(attractionId) {
    favorites = favorites.filter(id => id !== attractionId);
    saveFavorites();
    tg.showAlert('❌ Удалено из избранного');
    
    // Обновляем страницу
    setTimeout(() => {
        showFavorites();
    }, 100);
}

function clearAllFavorites() {
    if (favorites.length === 0) {
        tg.showAlert('📭 Избранное пустое');
        return;
    }
    
    favorites = [];
    saveFavorites();
    tg.showAlert('🗑️ Все очищено!');
    showFavorites();
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.ready();
    
    // Загружаем избранное при старте
    favorites = loadFavorites();
    console.log('Приложение загружено. Избранных:', favorites.length);
});

function showAttractions() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2 data-i18n="categories">🎯 Категории достопримечательностей</h2>
            <p class="text-muted mb-3" data-i18n="chooseCategory">Выберите категорию для просмотра мест</p>
            
            <div class="filter-buttons mb-3">
                <button class="filter-btn active" onclick="filterAttractions('all')" data-i18n="allPlaces">Все</button>
                <button class="filter-btn" onclick="filterAttractions('architecture')">🏛️ <span data-i18n="architecture">Архитектура</span></button>
                <button class="filter-btn" onclick="filterAttractions('religion')">⛪ <span data-i18n="religion">Религия</span></button>
                <button class="filter-btn" onclick="filterAttractions('sights')">📸 <span data-i18n="sights">Достопримечательности</span></button>
                <button class="filter-btn" onclick="filterAttractions('parks')">🌳 <span data-i18n="parks">Парки</span></button>
                <button class="filter-btn" onclick="filterAttractions('entertainment')">🎪 <span data-i18n="entertainment">Развлечения</span></button>
            </div>
            
            <div id="attractions-list"></div>
        </div>
    `;
    
    applyTranslations();
    filterAttractions('all');
}

function filterAttractions(category) {
    const filtered = category === 'all' 
        ? attractions 
        : attractions.filter(item => item.category === category);
    
    const listDiv = document.getElementById('attractions-list');
    
    // Обновляем активные кнопки
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (filtered.length === 0) {
        listDiv.innerHTML = `
            <div class="alert alert-info text-center">
                <h5>😔 Ничего не найдено</h5>
                <p class="mb-0">В этой категории пока нет достопримечательностей</p>
            </div>
        `;
        return;
    }
    
    const categoryNames = {
        'architecture': '🏛️ Архитектура',
        'religion': '⛪ Религия', 
        'sights': '📸 Достопримечательности',
        'parks': '🌳 Парки',
        'entertainment': '🎪 Развлечения'
    };
    
    let html = '<div class="list-group">';
    
    filtered.forEach(item => {
        html += `
            <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${item.name} ${isFavorite(item.id) ? '⭐' : ''}</h5>
                    <span class="badge category-${item.category}">${categoryNames[item.category]}</span>
                </div>
                <p class="mb-1">${item.description}</p>
                <small>📍 ${item.address}</small>
            </div>
        `;
    });
    
    html += '</div>';
    listDiv.innerHTML = html;
}

function showAttractionDetail(id) {
    const item = attractions.find(attr => attr.id === id);
    const content = document.getElementById('content');
    
    const categoryNames = {
        'architecture': '🏛️ Архитектура',
        'religion': '⛪ Религия',
        'sights': '📸 Достопримечательности', 
        'parks': '🌳 Парки',
        'entertainment': '🎪 Развлечения'
    };
    
    let contactsHtml = '';
    
    if (item.phone) {
        contactsHtml += `<p><strong>📞 Телефон:</strong> ${item.phone}</p>`;
    }
    
    if (item.website) {
        contactsHtml += `
            <p>
                <strong>🌐 Сайт:</strong> 
                <a href="${item.website}" target="_blank" onclick="tg.openLink('${item.website}'); return false;">
                    ${item.website.replace('https://', '').replace('http://', '')}
                </a>
            </p>
        `;
    }
    
    const favoriteButton = isFavorite(item.id) 
        ? `<button class="btn btn-warning" onclick="removeFromFavorites(${item.id})">
               ❌ Удалить из избранного
           </button>`
        : `<button class="btn btn-outline-warning" onclick="addToFavorites(${item.id})">
               ⭐ Добавить в избранное
           </button>`;

    content.innerHTML = `
        <button class="back-btn" onclick="showAttractions()">← Назад к списку</button>
        <div class="card fade-in">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="card-title">${item.name}</h2>
                    <span class="badge category-${item.category}">${categoryNames[item.category]}</span>
                </div>
                
                <div class="info-card">
                    <p class="mb-1"><strong>📌 Адрес:</strong> ${item.address}</p>
                    <p class="mb-1"><strong>🕒 Время работы:</strong> ${item.workingHours}</p>
                    <p class="mb-0"><strong>💰 Стоимость:</strong> ${item.price}</p>
                </div>
                
                <p class="card-text">${item.fullDescription}</p>
                
                ${contactsHtml ? `
                    <div class="contacts-section mt-4">
                        <h5>📞 Контакты</h5>
                        <div class="contacts-card">
                            ${contactsHtml}
                        </div>
                    </div>
                ` : ''}
                
                <div class="d-grid gap-2 mt-4">
                    <button class="btn btn-success btn-lg" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ Построить маршрут
                    </button>
                    ${favoriteButton}
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

// ==================== ИНТЕРАКТИВНАЯ КАРТА ====================

function showMap() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2 data-i18n="interactiveMap">🗺️ Интерактивная карта Гродно</h2>
            <p class="text-muted mb-3" data-i18n="clickMarker">Нажмите на маркер для информации о достопримечательности</p>
            
            <div class="map-controls mb-3">
                <button class="map-btn active" onclick="filterMapMarkers('all')" data-i18n="allPlaces">Все места</button>
                <button class="map-btn" onclick="filterMapMarkers('architecture')">🏛️ <span data-i18n="architecture">Архитектура</span></button>
                <button class="map-btn" onclick="filterMapMarkers('religion')">⛪ <span data-i18n="religion">Религия</span></button>
                <button class="map-btn" onclick="filterMapMarkers('parks')">🌳 <span data-i18n="parks">Парки</span></button>
                <button class="map-btn" onclick="filterMapMarkers('entertainment')">🎪 <span data-i18n="entertainment">Развлечения</span></button>
            </div>
            
            <div id="map-container">
                <div id="map" style="height: 500px; border-radius: 15px; border: 3px solid #667eea; margin-bottom: 20px;"></div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <h5 data-i18n="mapLegend">📍 Легенда карты</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p><span style="color: #3498db;">●</span> <strong data-i18n="architecture">Архитектура</strong></p>
                            <p><span style="color: #9b59b6;">●</span> <strong data-i18n="religion">Религия</strong></p>
                        </div>
                        <div class="col-md-6">
                            <p><span style="color: #27ae60;">●</span> <strong data-i18n="parks">Парки</strong></p>
                            <p><span style="color: #f39c12;">●</span> <strong data-i18n="entertainment">Развлечения</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    applyTranslations();
    
    // Даем время на отрисовку DOM перед инициализацией карты
    setTimeout(initializeMap, 100);
}

function initializeMap() {
    try {
        console.log('🔄 Инициализация карты...');
        
        // Очищаем предыдущую карту
        if (map) {
            map.remove();
            map = null;
        }
        
        // Создаем карту
        map = L.map('map').setView([53.6780, 23.8293], 14);
        
        // Добавляем слой OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Добавляем маркеры
        addMarkersToMap('all');
        
        console.log('✅ Карта успешно загружена!');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки карты:', error);
        showMapFallback();
    }
}

function createCustomIcon(category, isFavorite = false) {
    const colors = {
        'architecture': '#3498db',
        'religion': '#9b59b6',
        'sights': '#e74c3c',
        'parks': '#27ae60',
        'entertainment': '#f39c12'
    };
    
    const icons = {
        'architecture': '🏛️',
        'religion': '⛪',
        'sights': '📸',
        'parks': '🌳',
        'entertainment': '🎪'
    };
    
    const color = colors[category] || '#95a5a6';
    const icon = icons[category] || '📍';
    const favoriteBadge = isFavorite ? '⭐' : '';
    
    return L.divIcon({
        className: `custom-marker ${category}`,
        html: `
            <div style="
                background-color: ${color};
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 3px 10px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 18px;
                cursor: pointer;
                position: relative;
            ">
                ${icon}
                ${favoriteBadge ? `
                    <div style="
                        position: absolute; 
                        top: -5px; 
                        right: -5px; 
                        font-size: 12px; 
                        background: gold; 
                        border-radius: 50%; 
                        width: 20px; 
                        height: 20px; 
                        display: flex; 
                        align-items: center; 
                        justify-content: center;
                    ">${favoriteBadge}</div>
                ` : ''}
            </div>
        `,
        iconSize: [45, 45],
        iconAnchor: [22, 22]
    });
}

function addMarkersToMap(category = 'all') {
    if (!map) {
        console.error('Карта не инициализирована');
        return;
    }
    
    // Очищаем старые маркеры
    currentMarkers.forEach(marker => {
        if (map.hasLayer(marker)) {
            map.removeLayer(marker);
        }
    });
    currentMarkers = [];
    
    // Фильтруем достопримечательности
    const filteredAttractions = category === 'all' 
        ? attractions 
        : attractions.filter(item => item.category === category);
    
    console.log(`📍 Добавляем ${filteredAttractions.length} маркеров`);
    
    // Добавляем маркеры
    filteredAttractions.forEach(attraction => {
        try {
            const isFav = isFavorite(attraction.id);
            const customIcon = createCustomIcon(attraction.category, isFav);
            
            const marker = L.marker(
                [attraction.coords.lat, attraction.coords.lng],
                { icon: customIcon }
            ).addTo(map);
            
            const t = translations[currentLanguage];
            
            marker.bindPopup(`
                <div style="min-width: 280px; font-family: Arial, sans-serif;">
                    <h4 style="margin: 0 0 8px 0; color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 5px;">
                        ${attraction.name} ${isFav ? '⭐' : ''}
                    </h4>
                    <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                        ${attraction.description}
                    </p>
                    <p style="margin: 0 0 6px 0; font-size: 13px;">
                        <strong>📍 ${t.address}:</strong> ${attraction.address}
                    </p>
                    ${attraction.website ? `
                    <p style="margin: 0 0 6px 0; font-size: 13px;">
                        <strong>🌐 ${t.website}:</strong> 
                        <a href="${attraction.website}" target="_blank" style="color: #667eea; text-decoration: none;">
                            ${attraction.website.replace('https://', '').replace('http://', '').split('/')[0]}
                        </a>
                    </p>
                    ` : ''}
                    
                    <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                        <button onclick="openInMaps(${attraction.coords.lat}, ${attraction.coords.lng})" 
                                style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                            🗺️ ${t.navigate}
                        </button>
                        <button onclick="showAttractionDetail(${attraction.id})" 
                                style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                            ℹ️ ${t.details}
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="${isFav ? `removeFromFavorites(${attraction.id})` : `addToFavorites(${attraction.id})`}" 
                                style="background: ${isFav ? '#dc3545' : '#ffc107'}; color: ${isFav ? 'white' : 'black'}; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                            ${isFav ? '❌ ' + (currentLanguage === 'en' ? 'Remove' : 'Удалить') : '⭐ ' + (currentLanguage === 'en' ? 'Favorite' : 'В избранное')}
                        </button>
                        ${attraction.website ? `
                        <button onclick="tg.openLink('${attraction.website}')" 
                                style="background: #17a2b8; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                            🌐 ${t.website}
                        </button>
                        ` : ''}
                    </div>
                </div>
            `);
            
            currentMarkers.push(marker);
            
        } catch (error) {
            console.error('Ошибка при добавлении маркера:', error);
        }
    });
    
    // Подстраиваем вид если не все маркеры
    if (category !== 'all' && filteredAttractions.length > 0) {
        const group = L.featureGroup(currentMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function filterMapMarkers(category) {
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    addMarkersToMap(category);
}

function showMapFallback() {
    document.getElementById('map-container').innerHTML = `
        <div class="alert alert-warning text-center p-4">
            <h5>🗺️ Карта временно недоступна</h5>
            <p>Попробуйте обновить страницу или проверьте подключение к интернету</p>
            <div class="mt-3">
                <button class="btn btn-primary me-2" onclick="showMap()">🔄 Обновить карту</button>
                <button class="btn btn-outline-secondary" onclick="showAttractions()">📋 Список мест</button>
            </div>
        </div>
    `;
}

// ==================== ИЗБРАННОЕ ====================

function showFavorites() {
    const content = document.getElementById('content');
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <h2 data-i18n="favorites">⭐ Избранное</h2>
            <div class="card text-center">
                <div class="card-body py-5">
                    <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
                    <h4 data-i18n="favoritesEmpty">Пока пусто</h4>
                    <p class="text-muted" data-i18n="favoritesEmptyText">Добавляйте места в избранное, нажимая на звездочку</p>
                    <button class="btn btn-primary" onclick="showAttractions()" data-i18n="attractions">
                        📍 Посмотреть достопримечательности
                    </button>
                </div>
            </div>
        `;
        applyTranslations();
        return;
    }
    
    let html = `
        <h2 data-i18n="favorites">⭐ Избранное</h2>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted">${favorites.length} ${favorites.length === 1 ? 'место' : 'мест'} в избранном</span>
            <button class="btn btn-outline-danger btn-sm" onclick="clearAllFavorites()" data-i18n="clearAll">
                🗑️ Очистить все
            </button>
        </div>
        <div class="list-group">
    `;
    
    const favoriteAttractions = attractions.filter(attr => favorites.includes(attr.id));
    
    favoriteAttractions.forEach(item => {
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                        <h5 class="mb-1">${item.name} ⭐</h5>
                        <p class="mb-1">${item.description}</p>
                        <small>📍 ${item.address}</small>
                    </div>
                    <button class="btn btn-outline-danger btn-sm ms-2" 
                            onclick="event.stopPropagation(); removeFromFavorites(${item.id})">
                        ❌
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
    applyTranslations();
}

// ==================== МАРШРУТЫ ====================

function showRoutes() {
    const content = document.getElementById('content');
    
    let html = `
        <div class="fade-in">
            <h2 data-i18n="readyRoutes">🚶 Готовые маршруты</h2>
            <p class="text-muted mb-4" data-i18n="chooseRoute">Выберите маршрут для подробного просмотра или начала навигации</p>
            
            <div class="row">
    `;
    
    routes.forEach(route => {
        const completed = routeProgress[route.id] === 'completed';
        const inProgress = routeProgress[route.id] === 'in-progress';
        
        html += `
            <div class="col-md-6 mb-4">
                <div class="card route-card ${completed ? 'completed' : ''} ${inProgress ? 'in-progress' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title">${route.name}</h5>
                            ${completed ? '<span class="badge bg-success">✅ Завершен</span>' : ''}
                            ${inProgress ? '<span class="badge bg-warning">🚶 В процессе</span>' : ''}
                        </div>
                        <p class="card-text">${route.description}</p>
                        <div class="route-meta">
                            <small class="text-muted">
                                ⏱️ ${route.duration} | 📏 ${route.distance} | 🚶 ${route.difficulty}
                            </small>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-outline-primary btn-sm me-2" onclick="showRouteDetail(${route.id})">
                                ℹ️ Подробнее
                            </button>
                            <button class="btn btn-success btn-sm me-2" onclick="startRoute(${route.id})">
                                🚶 Начать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    applyTranslations();
}

function showRouteDetail(routeId) {
    const route = routes.find(r => r.id === routeId);
    const content = document.getElementById('content');
    
    let html = `
        <button class="back-btn" onclick="showRoutes()">← Назад к маршрутам</button>
        <div class="fade-in">
            <div class="card mb-4">
                <div class="card-body">
                    <h2>${route.name}</h2>
                    <p class="lead">${route.description}</p>
                    <div class="route-header-info">
                        <span class="badge bg-primary">⏱️ ${route.duration}</span>
                        <span class="badge bg-secondary">📏 ${route.distance}</span>
                        <span class="badge bg-info">🚶 ${route.difficulty}</span>
                    </div>
                </div>
            </div>
            
            <h4>📍 Остановки маршрута:</h4>
    `;
    
    route.stops.forEach((stopId, index) => {
        const attraction = attractions.find(a => a.id === stopId);
        html += `
            <div class="card mb-2">
                <div class="card-body">
                    <h5>${index + 1}. ${attraction.name}</h5>
                    <p class="mb-1">${attraction.description}</p>
                    <small>📍 ${attraction.address}</small>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="showAttractionDetail(${attraction.id})">
                            ℹ️ Подробнее
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="openInMaps(${attraction.coords.lat}, ${attraction.coords.lng})">
                            🗺️ Маршрут
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            <div class="d-grid gap-2 mt-4">
                <button class="btn btn-success btn-lg" onclick="startRoute(${route.id})">
                    🚶 Начать маршрут
                </button>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

function startRoute(routeId) {
    const route = routes.find(r => r.id === routeId);
    tg.showAlert(`Начинаем маршрут: "${route.name}"`);
}

// ==================== НАСТРОЙКИ ====================

function showSettings() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2 data-i18n="settingsTitle">⚙️ Настройки</h2>
            
            <div class="card">
                <div class="card-body">
                    <h5 data-i18n="language">🌐 Язык / Language</h5>
                    <p class="text-muted" data-i18n="selectLanguage">Выберите язык / Select language</p>
                    
                    <div class="language-buttons">
                        <button class="lang-btn ${currentLanguage === 'ru' ? 'active' : ''}" 
                                onclick="changeLanguage('ru')">
                            🇷🇺 Русский (Russian)
                        </button>
                        <button class="lang-btn ${currentLanguage === 'en' ? 'active' : ''}" 
                                onclick="changeLanguage('en')">
                            🇺🇸 English (Английский)
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 text-center">
                <button class="btn btn-outline-secondary" onclick="goToMainMenu()" data-i18n="back">
                    ← Назад
                </button>
            </div>
        </div>
    `;
    
    applyTranslations();
}

function changeLanguage(lang) {
    if (setLanguage(lang)) {
        showSettings();
        tg.showAlert(lang === 'ru' ? '🌐 Язык изменен на Русский' : '🌐 Language changed to English');
    }
}

function goToMainMenu() {
    const content = document.getElementById('content');
    content.innerHTML = '';
    applyTranslations();
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}