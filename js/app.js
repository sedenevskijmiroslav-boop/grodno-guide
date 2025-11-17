const tg = window.Telegram.WebApp;

// Глобальные переменные
let favorites = JSON.parse(localStorage.getItem('grodnoFavorites')) || [];
let map = null;

// ==================== БАЗОВЫЕ ФУНКЦИИ ====================

document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.ready();
    console.log('Mini App запущен');
});

function showAttractions() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <h2>🎯 Достопримечательности</h2>
            <div class="list-group">
                ${attractions.map(item => `
                    <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
                        <h5>${item.name}</h5>
                        <p class="mb-1">${item.description}</p>
                        <small>📍 ${item.address}</small>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showAttractionDetail(id) {
    const item = attractions.find(attr => attr.id === id);
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="showAttractions()">← Назад</button>
        <div class="card">
            <div class="card-body">
                <h2>${item.name}</h2>
                <p><strong>📍 Адрес:</strong> ${item.address}</p>
                <p><strong>🕒 Время работы:</strong> ${item.workingHours}</p>
                <p><strong>💰 Стоимость:</strong> ${item.price}</p>
                <p>${item.fullDescription}</p>
                <div class="d-grid gap-2">
                    <button class="btn btn-success" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ Построить маршрут
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ==================== ПРОСТАЯ КАРТА ====================

function showMap() {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="fade-in">
            <h2>🗺️ Карта Гродно</h2>
            <p class="text-muted mb-3">Загрузка карты...</p>
            
            <div id="map" style="height: 500px; border-radius: 15px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; border: 2px dashed #dee2e6;">
                <div class="text-center">
                    <div style="font-size: 48px;">🗺️</div>
                    <p>Загрузка карты...</p>
                    <button class="btn btn-primary btn-sm" onclick="loadMap()">Обновить</button>
                </div>
            </div>
            
            <div class="mt-3">
                <div class="list-group">
                    ${attractions.map(item => `
                        <div class="list-group-item">
                            <strong>${item.name}</strong> - ${item.address}
                            <button class="btn btn-sm btn-outline-primary float-end" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                                🗺️ Маршрут
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Загружаем карту с задержкой
    setTimeout(loadMap, 500);
}

function loadMap() {
    console.log('🔄 Загрузка карты...');
    
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Элемент карты не найден');
        return;
    }
    
    try {
        // Очищаем предыдущую карту
        if (map) {
            map.remove();
            map = null;
        }
        
        // Создаем карту
        map = L.map('map').setView([53.6780, 23.8293], 14);
        console.log('✅ Карта создана');
        
        // Добавляем тайлы
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
        console.log('✅ Тайлы добавлены');
        
        // Добавляем маркеры
        attractions.forEach(place => {
            L.marker([place.coords.lat, place.coords.lng])
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 200px;">
                        <h5>${place.name}</h5>
                        <p>${place.description}</p>
                        <button onclick="openInMaps(${place.coords.lat}, ${place.coords.lng})" 
                                style="background: #28a745; color: white; border: none; padding: 8px; border-radius: 5px; width: 100%;">
                            🗺️ Маршрут
                        </button>
                        <button onclick="showAttractionDetail(${place.id})" 
                                style="background: #007bff; color: white; border: none; padding: 8px; border-radius: 5px; width: 100%; margin-top: 5px;">
                            ℹ️ Подробнее
                        </button>
                    </div>
                `);
        });
        
        console.log('✅ Маркеры добавлены');
        
        // Обновляем статус
        mapElement.style.background = 'none';
        mapElement.style.border = '3px solid #667eea';
        
    } catch (error) {
        console.error('❌ Ошибка загрузки карты:', error);
        mapElement.innerHTML = `
            <div class="alert alert-danger text-center">
                <h5>Ошибка загрузки карты</h5>
                <p>${error.message}</p>
                <button class="btn btn-primary mt-2" onclick="loadMap()">Попробовать снова</button>
            </div>
        `;
    }
}

// ==================== ОСТАЛЬНЫЕ РАЗДЕЛЫ ====================

function showRoutes() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <h2>🚶 Маршруты</h2>
            <div class="list-group">
                ${routes.map(route => `
                    <div class="list-group-item">
                        <h5>${route.name}</h5>
                        <p>${route.description}</p>
                        <small>⏱️ ${route.duration} | 📏 ${route.distance}</small>
                        <button class="btn btn-sm btn-primary float-end" onclick="tg.showAlert('Начинаем маршрут: ${route.name}')">
                            Начать
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function showFavorites() {
    const content = document.getElementById('content');
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <div class="text-center py-5">
                <h2>⭐ Избранное</h2>
                <p class="text-muted">Пока пусто</p>
            </div>
        `;
        return;
    }
    
    content.innerHTML = `
        <h2>⭐ Избранное</h2>
        <div class="list-group">
            ${attractions.filter(item => favorites.includes(item.id)).map(item => `
                <div class="list-group-item">
                    <h5>${item.name}</h5>
                    <p>${item.description}</p>
                    <small>📍 ${item.address}</small>
                </div>
            `).join('')}
        </div>
    `;
}

function showSettings() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="fade-in">
            <h2>⚙️ Настройки</h2>
            <div class="card">
                <div class="card-body">
                    <h5>🌐 Язык</h5>
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary" onclick="tg.showAlert('Язык изменен на Русский')">
                            🇷🇺 Русский
                        </button>
                        <button class="btn btn-outline-primary" onclick="tg.showAlert('Language changed to English')">
                            🇺🇸 English
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}