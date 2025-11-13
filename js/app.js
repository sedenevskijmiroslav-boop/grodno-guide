// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Система избранного
let favorites = JSON.parse(localStorage.getItem('grodnoFavorites')) || [];

// Сохранение избранного в localStorage
function saveFavorites() {
    localStorage.setItem('grodnoFavorites', JSON.stringify(favorites));
}

// Добавление в избранное
function addToFavorites(attractionId) {
    if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        saveFavorites();
        
        tg.showPopup({
            title: '✅ Добавлено в избранное',
            message: 'Место сохранено в вашем списке избранного',
            buttons: [{ type: 'ok' }]
        });
        
        // Если сейчас открыта страница избранного - обновляем ее
        if (document.getElementById('content').innerHTML.includes('⭐ Избранное')) {
            showFavorites();
        }
    } else {
        tg.showAlert('Это место уже в избранном!');
    }
}

// Удаление из избранного
function removeFromFavorites(attractionId) {
    favorites = favorites.filter(id => id !== attractionId);
    saveFavorites();
    
    tg.showPopup({
        title: '❌ Удалено из избранного',
        message: 'Место удалено из вашего списка',
        buttons: [{ type: 'ok' }]
    });
    
    // Обновляем страницу избранного
    showFavorites();
}

// Проверка, есть ли место в избранном
function isFavorite(attractionId) {
    return favorites.includes(attractionId);
}
// Когда страница загрузилась
document.addEventListener('DOMContentLoaded', function() {
    tg.expand(); // Растянуть на весь экран
    tg.ready(); // Сообщить Telegram, что приложение готово
    console.log('Telegram Mini App запущен!');
});

// Показываем достопримечательности
function showAttractions() {
    const content = document.getElementById('content');
    let html = '<h2>🏛️ Достопримечательности</h2><div class="list-group">';
    
    attractions.forEach(item => {
        html += `
            <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
                <div class="d-flex w-100 justify-content-between">
                    <h5 class="mb-1">${item.name}</h5>
                    <small>📍</small>
                </div>
                <p class="mb-1">${item.description}</p>
                <small>${item.address}</small>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Показываем детальную информацию о месте
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
        contactsHtml += `<p><strong>🌐 Сайт:</strong> <a href="${item.website}" target="_blank">${item.website}</a></p>`;
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
                
                ${contactsHtml}
                
                <div class="d-grid gap-2 mt-4">
                    <button class="btn btn-success btn-lg" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ Построить маршрут
                    </button>
                    ${favoriteButton}
                </div>
            </div>
        </div>
    `;
}

// Глобальные переменные для карты
let map;
let markers = [];

function showMap() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>🗺️ Интерактивная карта Гродно</h2>
            <p class="text-muted mb-3">Нажмите на маркер для информации о достопримечательности</p>
            
            <div class="map-controls">
                <button class="map-btn active" onclick="filterMapMarkers('all')">Все места</button>
                <button class="map-btn" onclick="filterMapMarkers('architecture')">🏛️ Архитектура</button>
                <button class="map-btn" onclick="filterMapMarkers('religion')">⛪ Религия</button>
                <button class="map-btn" onclick="filterMapMarkers('parks')">🌳 Парки</button>
                <button class="map-btn" onclick="filterMapMarkers('entertainment')">🎪 Развлечения</button>
            </div>
            
            <div id="map"></div>
            
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
    initializeMap();
}

// Инициализация карты
function initializeMap() {
    // Удаляем старую карту если есть
    if (map) {
        map.remove();
    }
    
    // Создаем новую карту
    map = L.map('map').setView([53.6780, 23.8293], 14);
    
    // Добавляем слой OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);
    
    // Добавляем все маркеры
    addMarkersToMap('all');
}

// Функция для создания кастомных иконок
function createCustomIcon(category) {
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
    
    return L.divIcon({
        className: `custom-marker ${category}`,
        html: `
            <div style="
                background-color: ${colors[category] || '#95a5a6'};
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
                cursor: pointer;
            ">${icons[category] || '📍'}</div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    });
}

// Добавление маркеров на карту
function addMarkersToMap(filter = 'all') {
    // Очищаем старые маркеры
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Фильтруем достопримечательности
    const filteredAttractions = filter === 'all' 
        ? attractions 
        : attractions.filter(attr => attr.category === filter);
    
    // Добавляем маркеры
    filteredAttractions.forEach(attraction => {
        const customIcon = createCustomIcon(attraction.category);
        
        const marker = L.marker(
            [attraction.coords.lat, attraction.coords.lng],
            { icon: customIcon }
        ).addTo(map);
        
        // Добавляем всплывающее окно
       // В функции addMarkersToMap, в bindPopup обновите кнопки:
marker.bindPopup(`
    <div style="min-width: 250px; font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: #2c3e50; border-bottom: 2px solid #667eea; padding-bottom: 5px;">
            ${attraction.name}
        </h4>
        <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
            ${attraction.description}
        </p>
        <p style="margin: 0 0 6px 0; font-size: 13px;">
            <strong>📍 Адрес:</strong> ${attraction.address}
        </p>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <button onclick="openMapInMaps(${attraction.coords.lat}, ${attraction.coords.lng})" 
                    style="background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                🗺️ Маршрут
            </button>
            <button onclick="showAttractionFromMap(${attraction.id})" 
                    style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                ℹ️ Подробнее
            </button>
        </div>
        <div style="display: flex; gap: 8px;">
            <button onclick="${isFavorite(attraction.id) ? `removeFromFavorites(${attraction.id})` : `addToFavorites(${attraction.id})`}" 
                    style="background: ${isFavorite(attraction.id) ? '#dc3545' : '#ffc107'}; color: ${isFavorite(attraction.id) ? 'white' : 'black'}; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; flex: 1;">
                ${isFavorite(attraction.id) ? '❌ Удалить' : '⭐ В избранное'}
            </button>
        </div>
    </div>
`);
        
        markers.push(marker);
    });
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
    
    // Если не "все", подстраиваем зону видимости
    if (category !== 'all') {
        const filteredAttractions = attractions.filter(attr => attr.category === category);
        if (filteredAttractions.length > 0) {
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }
}

// Функция открытия в картах (для попапа)
function openMapInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}

// Функция показа деталей из карты
function showAttractionFromMap(attractionId) {
    showAttractionDetail(attractionId);
}

// Показываем маршруты
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

// Показываем избранное
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
                        <p class="text-muted">Добавляйте места в избранное, нажимая на звездочку в карточке достопримечательности</p>
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
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2>⭐ Избранное</h2>
                <span class="badge bg-warning">${favorites.length} мест</span>
            </div>
            
            <div class="alert alert-info">
                <strong>💡 Совет:</strong> Нажмите на место для просмотра details или ❌ для удаления из избранного
            </div>
            
            <div class="list-group">
    `;
    
    // Получаем избранные достопримечательности
    const favoriteAttractions = attractions.filter(attr => favorites.includes(attr.id));
    
    favoriteAttractions.forEach(item => {
        const categoryNames = {
            'architecture': '🏛️ Архитектура',
            'religion': '⛪ Религия',
            'sights': '📸 Достопримечательности', 
            'parks': '🌳 Парки',
            'entertainment': '🎪 Развлечения'
        };
        
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                        <div class="d-flex w-100 justify-content-between">
                            <h5 class="mb-1">${item.name}</h5>
                            <span class="badge category-${item.category}">${categoryNames[item.category]}</span>
                        </div>
                        <p class="mb-1">${item.description}</p>
                        <small>📍 ${item.address}</small>
                    </div>
                    <button class="btn btn-outline-danger btn-sm ms-3" onclick="removeFromFavorites(${item.id})" title="Удалить из избранного">
                        ❌
                    </button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            
            <div class="mt-3">
                <button class="btn btn-outline-secondary" onclick="clearAllFavorites()">
                    🗑️ Очистить все избранное
                </button>
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// Функция очистки всего избранного
function clearAllFavorites() {
    tg.showPopup({
        title: 'Очистка избранного',
        message: `Вы уверены, что хотите удалить все ${favorites.length} мест из избранного?`,
        buttons: [
            { 
                type: 'ok', 
                text: 'Да, очистить',
                id: 'clear'
            },
            { 
                type: 'cancel', 
                text: 'Отмена',
                id: 'cancel'
            }
        ]
    });
    
    // Обработчик результата попапа
    tg.onEvent('popupClosed', (event) => {
        if (event.button_id === 'clear') {
            favorites = [];
            saveFavorites();
            tg.showAlert('Все места удалены из избранного!');
            showFavorites();
        }
    });
}

// Открыть в картах
function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}

// Добавить в избранное
function addToFavorites(id) {
    tg.showPopup({
        title: 'Успешно!',
        message: 'Место добавлено в избранное',
        buttons: [{ type: 'ok' }]
    });
}

// Начать маршрут
function startRoute(id) {
    const route = routes.find(r => r.id === id);
    tg.showAlert(`Начинаем маршрут: "${route.name}"`);
}
// Добавьте эти функции в конец файла app.js

// Показываем фильтры по категориям
function showCategories() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>🎯 Категории достопримечательностей</h2>
        <div class="filter-buttons">
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

// Фильтрация достопримечательностей
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
    <div class="list-group-item list-group-item-action fade-in" onclick="showAttractionDetail(${item.id})">
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

// Обновим функцию showAttractions чтобы использовала категории
function showAttractions() {
    showCategories();
}