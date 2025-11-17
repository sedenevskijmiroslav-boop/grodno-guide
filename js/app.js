// ==================== ТЕЛЕГРАМ ИНИЦИАЛИЗАЦИЯ ====================
const tg = window.Telegram.WebApp;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Приложение инициализируется...');
    tg.expand();
    tg.ready();
    
    // Загружаем избранное
    favorites = loadFavorites();
    console.log('Загружено избранных:', favorites.length);
});

// ==================== СИСТЕМА ИЗБРАННОГО ====================
let favorites = [];

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
        console.log('Ошибка сохранения');
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
        updateUI();
    }
}

function removeFromFavorites(attractionId) {
    favorites = favorites.filter(id => id !== attractionId);
    saveFavorites();
    tg.showAlert('❌ Удалено из избранного');
    updateUI();
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

function updateUI() {
    // Обновляем UI если открыты избранное или достопримечательности
    const content = document.getElementById('content').innerHTML;
    if (content.includes('Избранное')) {
        showFavorites();
    } else if (content.includes('Достопримечательности')) {
        showAttractions();
    }
}

// ==================== ОСНОВНЫЕ ЭКРАНЫ ====================

function showAttractions() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <h2>📍 Достопримечательности</h2>
            <p class="text-muted mb-3">Выберите категорию для просмотра</p>
            
            <div class="row">
                <div class="col-6 mb-3">
                    <div class="category-card active" onclick="filterAttractions('all')">
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
    
    event.target.closest('.category-card').classList.add('active');
    
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

function showAttractionDetail(id) {
    const item = attractions.find(attr => attr.id === id);
    if (!item) return;
    
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
                
                <p class="card-text mt-3">${item.fullDescription}</p>
                
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

// ==================== КАРТА ====================

let map;
let currentMarkers = [];

function showMap() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>🗺️ Карта Гродно</h2>
            <p class="text-muted mb-3">Нажмите на маркер для информации</p>
            
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
                            <p><span style="color: #3498db;">●</span> <strong>Архитектура</strong></p>
                            <p><span style="color: #9b59b6;">●</span> <strong>Религия</strong></p>
                        </div>
                        <div class="col-md-6">
                            <p><span style="color: #27ae60;">●</span> <strong>Парки</strong></p>
                            <p><span style="color: #f39c12;">●</span> <strong>Развлечения</strong></p>
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
        
    } catch (error) {
        console.error('Ошибка карты:', error);
        showSimpleMap();
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
                ${favoriteBadge ? `<div style="position: absolute; top: -5px; right: -5px; font-size: 12px; background: gold; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">${favoriteBadge}</div>` : ''}
            </div>
        `,
        iconSize: [45, 45],
        iconAnchor: [22, 22]
    });
}

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
        
        // Добавляем всплывающее окно
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
                
                <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                    <button onclick="openInMaps(${attraction.coords.lat}, ${attraction.coords.lng})" 
                            style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        🗺️ Маршрут
                    </button>
                    <button onclick="showAttractionDetail(${attraction.id})" 
                            style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        ℹ️ Подробнее
                    </button>
                </div>
                
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button onclick="${isFav ? `removeFromFavorites(${attraction.id})` : `addToFavorites(${attraction.id})`}" 
                            style="background: ${isFav ? '#dc3545' : '#ffc107'}; color: ${isFav ? 'white' : 'black'}; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        ${isFav ? '❌ Удалить' : '⭐ В избранное'}
                    </button>
                    ${attraction.website ? `
                    <button onclick="tg.openLink('${attraction.website}')" 
                            style="background: #17a2b8; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                        🌐 Сайт
                    </button>
                    ` : ''}
                </div>
            </div>
        `);
        
        currentMarkers.push(marker);
    });
    
    // Подстраиваем вид если не все маркеры
    if (category !== 'all' && filteredAttractions.length > 0) {
        const group = new L.featureGroup(currentMarkers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

function filterMapMarkers(category) {
    // Обновляем активные кнопки
    document.querySelectorAll('.map-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Добавляем маркеры с фильтром
    addMarkersToMap(category);
}

function showSimpleMap() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>🗺️ Карта достопримечательностей Гродно</h2>
            
            <div class="alert alert-warning">
                <h5>⚠️ Интерактивная карта временно недоступна</h5>
                <p>Используйте список ниже для навигации</p>
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
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==================== МАРШРУТЫ ====================

function showRoutes() {
    const content = document.getElementById('content');
    let html = `
        <div class="fade-in">
            <h2>🚶 Готовые маршруты</h2>
            <p class="text-muted mb-4">Выберите маршрут для изучения</p>
            
            <div class="row">
    `;
    
    routes.forEach(route => {
        html += `
            <div class="col-md-6 mb-4">
                <div class="card route-card">
                    <div class="card-body">
                        <h5 class="card-title">${route.name}</h5>
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
                            <button class="btn btn-success btn-sm" onclick="startRoute(${route.id})">
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
}

function showRouteDetail(routeId) {
    const route = routes.find(r => r.id === routeId);
    
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
                <button class="btn btn-success btn-lg" onclick="startRoute(${route.id})">
                    🚶 Начать маршрут
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('content').innerHTML = html;
}

function startRoute(routeId) {
    const route = routes.find(r => r.id === routeId);
    tg.showAlert(`Начинаем маршрут: "${route.name}"`);
    
    // Показываем первую точку маршрута
    const firstAttractionId = route.stops[0];
    showAttractionDetail(firstAttractionId);
}

// ==================== ИЗБРАННОЕ ====================

function showFavorites() {
    const content = document.getElementById('content');
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <div class="fade-in">
                <h2>⭐ Избранное</h2>
                <div class="card text-center">
                    <div class="card-body py-5">
                        <div style="font-size: 48px; margin-bottom: 20px;">⭐</div>
                        <h4>Пока пусто</h4>
                        <p class="text-muted">Добавляйте места в избранное, нажимая на звездочку</p>
                        <button class="btn btn-primary" onclick="showAttractions()">
                            📍 Посмотреть достопримечательности
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="fade-in">
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
    
    html += '</div></div>';
    content.innerHTML = html;
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}

function showSettings() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <h2>⚙️ Настройки</h2>
            <div class="card">
                <div class="card-body">
                    <h5>О приложении</h5>
                    <p>Гид по Гродно - ваш персональный путеводитель по городу.</p>
                    
                    <h5 class="mt-4">Функции</h5>
                    <ul>
                        <li>📍 Достопримечательности с описанием</li>
                        <li>🗺️ Интерактивная карта</li>
                        <li>🚶 Готовые маршруты</li>
                        <li>⭐ Система избранного</li>
                    </ul>
                    
                    <div class="mt-4">
                        <button class="btn btn-outline-info me-2" onclick="tg.openLink('https://t.me/grodno_guide')">
                            📞 Поддержка
                        </button>
                        <button class="btn btn-outline-secondary" onclick="clearAllData()">
                            🗑️ Очистить все данные
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function clearAllData() {
    localStorage.clear();
    favorites = [];
    tg.showAlert('✅ Все данные очищены');
    showSettings();
}

// ==================== АНИМАЦИИ ====================

// Добавляем CSS анимации
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .list-group-item {
        transition: all 0.3s ease;
    }
    
    .list-group-item:hover {
        transform: translateX(5px);
    }
`;
document.head.appendChild(style);

console.log('App.js загружен успешно!');