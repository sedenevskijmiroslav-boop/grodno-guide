const tg = window.Telegram.WebApp;

// ==================== СИСТЕМА ИЗБРАННОГО ====================
let favorites = [];

// Загружаем избранное при запуске
function loadFavorites() {
    try {
        const saved = localStorage.getItem('grodnoFavorites');
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

// Сохраняем избранное
function saveFavorites() {
    try {
        localStorage.setItem('grodnoFavorites', JSON.stringify(favorites));
    } catch (e) {
        console.log('Ошибка сохранения');
    }
}

// Проверяем есть ли в избранном
function isFavorite(attractionId) {
    return favorites.includes(attractionId);
}

// Добавляем в избранное
function addToFavorites(attractionId) {
    console.log('Добавляем:', attractionId);
    
    if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        saveFavorites();
        tg.showAlert('✅ Добавлено в избранное!');
        
        // Обновляем если открыто избранное
        setTimeout(() => {
            if (document.getElementById('content').innerHTML.includes('⭐ Избранное')) {
                showFavorites();
            }
        }, 100);
    } else {
        tg.showAlert('⚠️ Уже в избранном!');
    }
}

// Удаляем из избранного
function removeFromFavorites(attractionId) {
    console.log('Удаляем:', attractionId);
    
    favorites = favorites.filter(id => id !== attractionId);
    saveFavorites();
    tg.showAlert('❌ Удалено из избранного');
    
    // Обновляем страницу
    setTimeout(() => {
        showFavorites();
    }, 100);
}

// Очищаем все избранное
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

// ==================== ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ ====================

function showCategories() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <h2>🎯 Категории достопримечательностей</h2>
            <p class="text-muted mb-3">Выберите категорию для просмотра мест</p>
            
            <div class="row">
                <div class="col-6 mb-3">
                    <div class="category-card" onclick="filterAttractions('all')">
                        <div class="category-icon">🏛️</div>
                        <div class="category-name">Все места</div>
                        <div class="category-count">${attractions.length}</div>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="category-card" onclick="filterAttractions('architecture')">
                        <div class="category-icon">🏛️</div>
                        <div class="category-name">Архитектура</div>
                        <div class="category-count">${attractions.filter(a => a.category === 'architecture').length}</div>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="category-card" onclick="filterAttractions('religion')">
                        <div class="category-icon">⛪</div>
                        <div class="category-name">Религия</div>
                        <div class="category-count">${attractions.filter(a => a.category === 'religion').length}</div>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="category-card" onclick="filterAttractions('sights')">
                        <div class="category-icon">📸</div>
                        <div class="category-name">Достопримечательности</div>
                        <div class="category-count">${attractions.filter(a => a.category === 'sights').length}</div>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="category-card" onclick="filterAttractions('parks')">
                        <div class="category-icon">🌳</div>
                        <div class="category-name">Парки</div>
                        <div class="category-count">${attractions.filter(a => a.category === 'parks').length}</div>
                    </div>
                </div>
                <div class="col-6 mb-3">
                    <div class="category-card" onclick="filterAttractions('entertainment')">
                        <div class="category-icon">🎪</div>
                        <div class="category-name">Развлечения</div>
                        <div class="category-count">${attractions.filter(a => a.category === 'entertainment').length}</div>
                    </div>
                </div>
            </div>
            
            <div id="attractions-list" class="mt-4"></div>
        </div>
    `;
    
    // Показываем все места по умолчанию
    filterAttractions('all');
}

function filterAttractions(category) {
    const filtered = category === 'all' 
        ? attractions 
        : attractions.filter(item => item.category === category);
    
    const listDiv = document.getElementById('attractions-list');
    
    // Обновляем активные карточки
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Находим и активируем нужную карточку
    const categoryCards = document.querySelectorAll('.category-card');
    const categoryIndex = ['all', 'architecture', 'religion', 'sights', 'parks', 'entertainment'].indexOf(category);
    if (categoryCards[categoryIndex]) {
        categoryCards[categoryIndex].classList.add('active');
    }
    
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
    
    let html = `
        <h4>${category === 'all' ? 'Все достопримечательности' : categoryNames[category]} 
            <span class="badge bg-primary">${filtered.length}</span>
        </h4>
        <div class="list-group">
    `;
    
    filtered.forEach(item => {
        html += `
            <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
                <div class="d-flex w-100 justify-content-between">
                    <div>
                        <h5 class="mb-1">${item.name} ${isFavorite(item.id) ? '⭐' : ''}</h5>
                        <p class="mb-1">${item.description}</p>
                        <small>📍 ${item.address}</small>
                    </div>
                    <span class="badge category-${item.category}">${categoryNames[item.category]}</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    listDiv.innerHTML = html;
}

// ==================== ИНТЕРАКТИВНАЯ КАРТА С ИКОНКАМИ ====================

let map; // Глобальная переменная для карты
let currentMarkers = []; // Массив текущих маркеров

function showMap() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>🗺️ Интерактивная карта Гродно</h2>
            <p class="text-muted mb-3">Нажмите на маркер для информации о достопримечательности</p>
            
            <div class="map-controls mb-3">
                <button class="map-btn active" onclick="filterMapMarkers('all')">Все места</button>
                <button class="map-btn" onclick="filterMapMarkers('architecture')">🏛️ Архитектура</button>
                <button class="map-btn" onclick="filterMapMarkers('religion')">⛪ Религия</button>
                <button class="map-btn" onclick="filterMapMarkers('sights')">📸 Достопримечательности</button>
                <button class="map-btn" onclick="filterMapMarkers('parks')">🌳 Парки</button>
                <button class="map-btn" onclick="filterMapMarkers('entertainment')">🎪 Развлечения</button>
            </div>
            
            <div id="map" style="height: 500px; border-radius: 15px; border: 3px solid #667eea; margin-bottom: 20px;"></div>
            
            <div class="card">
                <div class="card-body">
                    <h5>📍 Легенда карты</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p><span style="color: #3498db;">●</span> <strong>Архитектура</strong> - исторические здания</p>
                            <p><span style="color: #9b59b6;">●</span> <strong>Религия</strong> - храмы и церкви</p>
                        </div>
                        <div class="col-md-6">
                            <p><span style="color: #27ae60;">●</span> <strong>Парки</strong> - зоны отдыха</p>
                            <p><span style="color: #f39c12;">●</span> <strong>Развлечения</strong> - музеи, зоопарк</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Инициализируем карту
    setTimeout(initMap, 100);
}

function initMap() {
    try {
        console.log('Инициализация карты с иконками...');
        
        // Удаляем старую карту если есть
        if (map) {
            map.remove();
        }
        
        // Создаем новую карту
        map = L.map('map').setView([53.6780, 23.8293], 14);
        
        // Добавляем тайлы
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        
        // Добавляем все маркеры
        addMarkersToMap('all');
        
        console.log('Карта успешно загружена с иконками!');
        
    } catch (error) {
        console.error('Ошибка карты:', error);
        showSimpleMap();
    }
}

// Функция создания кастомных иконок
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
    
    // Если в избранном, добавляем звезду
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
                ${favoriteBadge ? `<div style="position: absolute; top: -5px; right: -5px; font-size: 12px; background: gold; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">${favoriteBadge}</div>` : ''}
            </div>
        `,
        iconSize: [45, 45],
        iconAnchor: [22, 22]
    });
}

// Добавление маркеров на карту с фильтрацией
function addMarkersToMap(category = 'all') {
    // Очищаем старые маркеры
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
    
    // Фильтруем достопримечательности
    const filteredAttractions = category === 'all' 
        ? attractions 
        : attractions.filter(item => item.category === category);
    
    // Добавляем маркеры
    filteredAttractions.forEach(attraction => {
        const isFav = isFavorite(attraction.id);
        const customIcon = createCustomIcon(attraction.category, isFav);
        
        const marker = L.marker(
            [attraction.coords.lat, attraction.coords.lng],
            { icon: customIcon }
        ).addTo(map);
        
        // Добавляем всплывающее окно с избранным
        marker.bindPopup(`
            <div style="min-width: 280px; font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 8px 0; color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 5px;">
                    ${attraction.name} ${isFav ? '⭐' : ''}
                </h4>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                    ${attraction.description}
                </p>
                <p style="margin: 0 0 6px 0; font-size: 13px;">
                    <strong>📍 Адрес:</strong> ${attraction.address}
                </p>
                ${attraction.website ? `
                <p style="margin: 0 0 6px 0; font-size: 13px;">
                    <strong>🌐 Сайт:</strong> 
                    <a href="${attraction.website}" target="_blank" style="color: #667eea; text-decoration: none;">
                        ${attraction.website.replace('https://', '').replace('http://', '').split('/')[0]}
                    </a>
                </p>
                ` : ''}
                
                <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                    <button onclick="openMapInMaps(${attraction.coords.lat}, ${attraction.coords.lng})" 
                            style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        🗺️ Маршрут
                    </button>
                    <button onclick="showAttractionFromMap(${attraction.id})" 
                            style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        ℹ️ Подробнее
                    </button>
                </div>
                
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="${isFav ? `removeFromFavoritesFromMap(${attraction.id})` : `addToFavoritesFromMap(${attraction.id})`}" 
                            style="background: ${isFav ? '#dc3545' : '#ffc107'}; color: ${isFav ? 'white' : 'black'}; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        ${isFav ? '❌ Удалить' : '⭐ В избранное'}
                    </button>
                    ${attraction.website ? `
                    <button onclick="openMapWebsite('${attraction.website}')" 
                            style="background: #17a2b8; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        🌐 Сайт
                    </button>
                    ` : ''}
                </div>
            </div>
        `);
        
        currentMarkers.push(marker);
    });
    
    // Если не все маркеры, подстраиваем вид
    if (category !== 'all' && filteredAttractions.length > 0) {
        const group = new L.featureGroup(currentMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Фильтрация маркеров на карте
function filterMapMarkers(category) {
    // Обновляем активные кнопки
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Добавляем маркеры с фильтром
    addMarkersToMap(category);
}

// Функции для работы с картой
function openMapInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}

function openMapWebsite(url) {
    tg.openLink(url);
}

function showAttractionFromMap(attractionId) {
    showAttractionDetail(attractionId);
}

// Функции избранного для карты
function addToFavoritesFromMap(attractionId) {
    addToFavorites(attractionId);
    // Обновляем маркер на карте
    setTimeout(() => {
        const currentCategory = document.querySelector('.map-btn.active').textContent;
        const categoryMap = {
            'Все места': 'all',
            '🏛️ Архитектура': 'architecture',
            '⛪ Религия': 'religion',
            '📸 Достопримечательности': 'sights',
            '🌳 Парки': 'parks',
            '🎪 Развлечения': 'entertainment'
        };
        addMarkersToMap(categoryMap[currentCategory] || 'all');
    }, 100);
}

function removeFromFavoritesFromMap(attractionId) {
    removeFromFavorites(attractionId);
    // Обновляем маркер на карте
    setTimeout(() => {
        const currentCategory = document.querySelector('.map-btn.active').textContent;
        const categoryMap = {
            'Все места': 'all',
            '🏛️ Архитектура': 'architecture',
            '⛪ Религия': 'religion',
            '📸 Достопримечательности': 'sights',
            '🌳 Парки': 'parks',
            '🎪 Развлечения': 'entertainment'
        };
        addMarkersToMap(categoryMap[currentCategory] || 'all');
    }, 100);
}

// Резервная версия карты
function showSimpleMap() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>🗺️ Карта достопримечательностей Гродно</h2>
            
            <div class="alert alert-warning">
                <h5>⚠️ Интерактивная карта временно недоступна</h5>
                <p>Используйте список ниже для навигации по достопримечательностям</p>
            </div>

            <div class="list-group">
                ${attractions.map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-1">${item.name} ${isFavorite(item.id) ? '⭐' : ''}</h5>
                                <p class="mb-1">${item.description}</p>
                                <small>📍 ${item.address}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-success me-1" 
                                        onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                                    🗺️
                                </button>
                                <button class="btn btn-sm btn-primary" 
                                        onclick="showAttractionDetail(${item.id})">
                                    ℹ️
                                </button>
                                <button class="btn btn-sm ${isFavorite(item.id) ? 'btn-warning' : 'btn-outline-warning'}" 
                                        onclick="${isFavorite(item.id) ? `removeFromFavorites(${item.id})` : `addToFavorites(${item.id})`}">
                                    ${isFavorite(item.id) ? '❌' : '⭐'}
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.ready();
    
    // Загружаем избранное при старте
    favorites = loadFavorites();
    console.log('Загружено избранных:', favorites.length);
});

function showAttractions() {
    showCategories();
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
    
    // Телефон
    if (item.phone) {
        contactsHtml += `<p><strong>📞 Телефон:</strong> ${item.phone}</p>`;
    }
    
    // Сайт (теперь всегда показываем если есть)
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
    
    // Определяем кнопку избранного
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

// ==================== ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ ====================

function showCategories() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>🎯 Категории достопримечательностей</h2>
        <div class="filter-buttons mb-3">
            <button class="filter-btn active" onclick="filterAttractions('all')">Все</button>
            <button class="filter-btn" onclick="filterAttractions('architecture')">🏛️ Архитектура</button>
            <button class="filter-btn" onclick="filterAttractions('religion')">⛪ Религия</button>
            <button class="filter-btn" onclick="filterAttractions('sights')">📸 Достопримечательности</button>
            <button class="filter-btn" onclick="filterAttractions('parks')">🌳 Парки</button>
            <button class="filter-btn" onclick="filterAttractions('entertainment')">🎪 Развлечения</button>
        </div>
        <div id="attractions-list"></div>
    `;
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
    
    let html = '<div class="list-group">';
    filtered.forEach(item => {
        const categoryNames = {
            'architecture': '🏛️ Архитектура',
            'religion': '⛪ Религия', 
            'sights': '📸 Достопримечательности',
            'parks': '🌳 Парки',
            'entertainment': '🎪 Развлечения'
        };
        
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



function showRoutes() {
    const content = document.getElementById('content');
    let html = '<h2>🚶 Готовые маршруты</h2>';
    
    routes.forEach(route => {
        html += `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${route.name}</h5>
                    <p class="card-text">${route.description}</p>
                    <p><strong>⏱️ Продолжительность:</strong> ${route.duration}</p>
                    <p><strong>Остановки:</strong> ${route.stops.join(' → ')}</p>
                    <button class="btn btn-primary" onclick="startRoute(${route.id})">
                        Начать маршрут
                    </button>
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
}

function showFavorites() {
    const content = document.getElementById('content');
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <h2>⭐ Избранное</h2>
            <div class="card text-center">
                <div class="card-body py-5">
                    <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
                    <h4>Пока пусто</h4>
                    <p class="text-muted">Добавляйте места в избранное, нажимая на звездочку в карточке достопримечательности</p>
                    <button class="btn btn-primary" onclick="showAttractions()">
                        📍 Посмотреть достопримечательности
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <h2>⭐ Избранное</h2>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-muted">${favorites.length} ${favorites.length === 1 ? 'место' : 'мест'} в избранном</span>
            <button class="btn btn-outline-danger btn-sm" onclick="clearAllFavorites()">
                🗑️ Очистить все
            </button>
        </div>
        <div class="list-group">
    `;
    
    // Получаем избранные места
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
}

// ==================== УЛУЧШЕННЫЕ МАРШРУТЫ ====================

let currentRoute = null;
let currentStep = 0;
let routeProgress = JSON.parse(localStorage.getItem('routeProgress')) || {};

function showRoutes() {
    const content = document.getElementById('content');
    
    let html = `
        <div class="fade-in">
            <h2>🚶 Готовые маршруты</h2>
            <p class="text-muted mb-4">Выберите маршрут для подробного просмотра или начала навигации</p>
            
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
                            <button class="btn btn-info btn-sm" onclick="showRouteOnMap(${route.id})">
                                🗺️ На карте
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
}

// Детальная страница маршрута
function showRouteDetail(routeId) {
    const route = routes.find(r => r.id === routeId);
    const routeAttractions = route.stops.map(id => attractions.find(a => a.id === id));
    
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
                        ${routeProgress[route.id] === 'completed' ? '<span class="badge bg-success">✅ Завершен</span>' : ''}
                        ${routeProgress[route.id] === 'in-progress' ? '<span class="badge bg-warning">🚶 В процессе</span>' : ''}
                    </div>
                </div>
            </div>
            
            <h4>📍 Остановки маршрута:</h4>
    `;
    
    route.points.forEach((point, index) => {
        const attraction = attractions.find(a => a.id === point.id);
        html += `
            <div class="route-step-card">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <h5>${attraction.name}</h5>
                    <p class="text-muted">${point.description}</p>
                    <div class="step-meta">
                        <span class="time-badge">⏱️ ${point.time} мин</span>
                        <span class="address">📍 ${attraction.address}</span>
                    </div>
                    <div class="step-actions mt-2">
                        <button class="btn btn-outline-primary btn-sm" onclick="showAttractionDetail(${attraction.id})">
                            ℹ️ Подробнее
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="openInMaps(${attraction.coords.lat}, ${attraction.coords.lng})">
                            🗺️ Маршрут
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
            <div class="d-grid gap-2 mt-4">
                <button class="btn btn-success btn-lg" onclick="startGuidedRoute(${route.id})">
                    🚶 Начать guided-тур
                </button>
                <button class="btn btn-outline-info" onclick="showRouteOnMap(${route.id})">
                    🗺️ Посмотреть на карте
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = html;
}

// Показ маршрута на карте
function showRouteOnMap(routeId) {
    const route = routes.find(r => r.id === routeId);
    const routeAttractions = route.stops.map(id => attractions.find(a => a.id === id));
    
    // Создаем массив координат для линии маршрута
    const routeCoordinates = routeAttractions.map(attr => [attr.coords.lat, attr.coords.lng]);
    
    let html = `
        <button class="back-btn" onclick="showRouteDetail(${route.id})">← Назад к маршруту</button>
        <div class="fade-in">
            <h2>🗺️ Маршрут: ${route.name}</h2>
            <div id="route-map" style="height: 500px; border-radius: 15px; border: 3px solid #667eea; margin-bottom: 20px;"></div>
            
            <div class="card">
                <div class="card-body">
                    <h5>📍 Точки маршрута:</h5>
                    <div class="list-group">
                        ${routeAttractions.map((attr, index) => `
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>${index + 1}. ${attr.name}</strong>
                                        <br><small>📍 ${attr.address}</small>
                                    </div>
                                    <button class="btn btn-sm btn-outline-primary" onclick="openInMaps(${attr.coords.lat}, ${attr.coords.lng})">
                                        🗺️
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = html;
    
    // Инициализируем карту маршрута
    setTimeout(() => initRouteMap(routeId, routeCoordinates, routeAttractions), 100);
}

// Инициализация карты маршрута
function initRouteMap(routeId, coordinates, attractions) {
    try {
        const map = L.map('route-map').setView([53.6780, 23.8293], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        
        // Добавляем линию маршрута
        const routeLine = L.polyline(coordinates, {
            color: '#667eea',
            weight: 6,
            opacity: 0.7,
            smoothFactor: 1
        }).addTo(map);
        
        // Добавляем маркеры с номерами
        attractions.forEach((attr, index) => {
            const isCurrent = routeProgress[routeId] === 'in-progress' && index === currentStep;
            
            L.marker([attr.coords.lat, attr.coords.lng])
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h5>${index + 1}. ${attr.name}</h5>
                        <p>${attr.description}</p>
                        ${isCurrent ? '<div class="text-success">🚶 Текущая остановка</div>' : ''}
                        <button onclick="openInMaps(${attr.coords.lat}, ${attr.coords.lng})" 
                                style="background: #28a745; color: white; border: none; padding: 8px; border-radius: 5px; width: 100%; margin-top: 5px;">
                            🗺️ Маршрут
                        </button>
                    </div>
                `)
                .openPopup();
        });
        
        // Подстраиваем карту под маршрут
        map.fitBounds(routeLine.getBounds());
        
    } catch (error) {
        console.error('Ошибка карты маршрута:', error);
    }
}

// Guided-тур с пошаговой навигацией
function startGuidedRoute(routeId) {
    currentRoute = routes.find(r => r.id === routeId);
    currentStep = 0;
    
    // Сохраняем прогресс
    routeProgress[routeId] = 'in-progress';
    localStorage.setItem('routeProgress', JSON.stringify(routeProgress));
    
    showRouteStep();
}

function showRouteStep() {
    if (currentStep >= currentRoute.stops.length) {
        // Маршрут завершен
        routeProgress[currentRoute.id] = 'completed';
        localStorage.setItem('routeProgress', JSON.stringify(routeProgress));
        
        tg.showAlert('🎉 Поздравляем! Вы завершили маршрут!');
        showRoutes();
        return;
    }
    
    const attractionId = currentRoute.stops[currentStep];
    const attraction = attractions.find(a => a.id === attractionId);
    const pointInfo = currentRoute.points.find(p => p.id === attractionId);
    
    const isLastStep = currentStep === currentRoute.stops.length - 1;
    
    tg.showPopup({
        title: `🚶 ${currentRoute.name} (Шаг ${currentStep + 1}/${currentRoute.stops.length})`,
        message: `📍 ${attraction.name}\n\n${pointInfo.description}\n\n⏱️ Время на осмотр: ${pointInfo.time} минут`,
        buttons: [
            { 
                text: '🗺️ Построить маршрут', 
                id: 'navigate',
                type: 'default'
            },
            { 
                text: isLastStep ? '✅ Завершить' : '➡️ Следующая точка', 
                id: 'next',
                type: isLastStep ? 'destructive' : 'ok'
            },
            {
                text: 'ℹ️ Подробнее о месте',
                id: 'details',
                type: 'default'
            }
        ]
    });
    
    // Обработчик кнопок
    const popupHandler = (event) => {
        if (event.button_id === 'navigate') {
            openInMaps(attraction.coords.lat, attraction.coords.lng);
        } else if (event.button_id === 'next') {
            currentStep++;
            showRouteStep();
        } else if (event.button_id === 'details') {
            showAttractionDetail(attractionId);
        }
        tg.offEvent('popupClosed', popupHandler);
    };
    
    tg.onEvent('popupClosed', popupHandler);
}

// Старт маршрута (простая версия)
function startRoute(routeId) {
    const route = routes.find(r => r.id === routeId);
    
    tg.showPopup({
        title: 'Выберите режим',
        message: `Маршрут: ${route.name}\n\nВыберите способ навигации:`,
        buttons: [
            { text: '🚶 Guided-тур', id: 'guided' },
            { text: '🗺️ Показать на карте', id: 'map' },
            { text: '📋 Детали маршрута', id: 'details' }
        ]
    });
    
    tg.onEvent('popupClosed', (event) => {
        if (event.button_id === 'guided') {
            startGuidedRoute(routeId);
        } else if (event.button_id === 'map') {
            showRouteOnMap(routeId);
        } else if (event.button_id === 'details') {
            showRouteDetail(routeId);
        }
    });
}

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}

function startRoute(id) {
    const route = routes.find(r => r.id === id);
    tg.showAlert(`Начинаем маршрут: "${route.name}"`);
}