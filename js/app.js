// Telegram Web App
const tg = window.Telegram.WebApp;

// Глобальные переменные
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let map = null;
let currentCategory = 'all';
let currentMapCategory = 'all';

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
            
            <!-- Фильтры по категориям -->
            <div class="mb-4">
                <div class="btn-group w-100" role="group">
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
}

function renderAttractionsList(category = 'all') {
    const filteredAttractions = category === 'all' 
        ? attractions 
        : attractions.filter(item => item.category === category);
    
    if (filteredAttractions.length === 0) {
        return `
            <div class="text-center py-4">
                <p class="text-muted">Нет достопримечательностей в этой категории</p>
            </div>
        `;
    }
    
    return filteredAttractions.map(item => `
        <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="mb-1">${item.description}</p>
                    <small class="text-muted">📍 ${item.address}</small>
                </div>
                <span class="badge bg-primary">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</span>
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
        <button class="btn btn-secondary mb-3" onclick="showAttractions()">← Назад</button>
        
        <div class="card fade-in">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="card-title">${item.name}</h2>
                    <span class="badge bg-primary">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</span>
                </div>
                
                <div class="info-card mb-3">
                    <p class="mb-1"><strong>📍 Адрес:</strong> ${item.address}</p>
                    <p class="mb-1"><strong>🕒 Время работы:</strong> ${item.workingHours}</p>
                    <p class="mb-0"><strong>💰 Стоимость:</strong> ${item.price}</p>
                </div>
                
                <p class="card-text">${item.fullDescription}</p>
                
                ${contactsHtml ? `
                    <div class="contacts-section mt-3">
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
            
            <!-- Фильтры для карты -->
            <div class="mb-4">
                <div class="btn-group w-100 flex-wrap" role="group">
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
            </div>
            
            <div id="map"></div>
            
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
    
    // Перерисовываем карту с новыми маркерами
    if (map) {
        map.remove();
        map = null;
    }
    
    setTimeout(() => initMap(category), 50);
}

function renderMapAttractionsList(category = 'all') {
    const filteredAttractions = category === 'all' 
        ? attractions 
        : attractions.filter(item => item.category === category);
    
    if (filteredAttractions.length === 0) {
        return `
            <div class="text-center py-4">
                <p class="text-muted">Нет достопримечательностей в этой категории</p>
            </div>
        `;
    }
    
    return filteredAttractions.map(item => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${item.name}</strong>
                    <br><small class="text-muted">📍 ${item.address}</small>
                    <br><small class="badge bg-primary">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary" 
                            onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ Маршрут
                    </button>
                    <button class="btn btn-sm btn-outline-info ms-1" 
                            onclick="showAttractionDetail(${item.id})">
                        ℹ️ Подробнее
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
        
        // Фильтруем места по категории
        const filteredPlaces = category === 'all' 
            ? attractions 
            : attractions.filter(place => place.category === category);
        
        // Добавляем маркеры
        filteredPlaces.forEach(place => {
            const marker = L.marker([place.coords.lat, place.coords.lng])
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 250px;">
                        <h5>${place.name}</h5>
                        <p><strong>${getCategoryIcon(place.category)} ${getCategoryName(place.category)}</strong></p>
                        <p>${place.description}</p>
                        <p><strong>📍 Адрес:</strong> ${place.address}</p>
                        <div class="d-grid gap-2">
                            <button onclick="openInMaps(${place.coords.lat}, ${place.coords.lng})" 
                                    style="background: #28a745; color: white; border: none; padding: 8px; border-radius: 5px;">
                                🗺️ Маршрут
                            </button>
                            <button onclick="showAttractionDetail(${place.id})" 
                                    style="background: #007bff; color: white; border: none; padding: 8px; border-radius: 5px;">
                                ℹ️ Подробнее
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
                    <div class="col-md-6 mb-4">
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
    tg.showAlert(`Начинаем маршрут: "${route.name}"`);
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
            <p class="text-muted mb-3">${favorites.length} мест в избранном</p>
            
            <div class="list-group">
                ${favoriteItems.map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                                <h5 class="mb-1">${item.name} ⭐</h5>
                                <p class="mb-1">${item.description}</p>
                                <small class="text-muted">📍 ${item.address}</small>
                                <br><small class="badge bg-primary">${getCategoryIcon(item.category)} ${getCategoryName(item.category)}</small>
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

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}