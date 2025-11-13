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
    
    if (!item) return;
    
    const isFav = isFavorite(item.id);
    const favoriteButton = isFav 
        ? `<button class="btn btn-warning" onclick="removeFromFavorites(${item.id})">❌ Удалить из избранного</button>`
        : `<button class="btn btn-outline-warning" onclick="addToFavorites(${item.id})">⭐ Добавить в избранное</button>`;
    
    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="showAttractions()">← Назад к списку</button>
        <div class="card">
            <div class="card-body">
                <h3>${item.name}</h3>
                <p>${item.fullDescription}</p>
                <p><strong>📌 Адрес:</strong> ${item.address}</p>
                <p><strong>🕒 Время работы:</strong> ${item.workingHours}</p>
                <p><strong>💰 Стоимость:</strong> ${item.price}</p>
                
                <div class="d-grid gap-2 mt-3">
                    <button class="btn btn-success" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ Построить маршрут
                    </button>
                    ${favoriteButton}
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

function showMap() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>🗺️ Карта Гродно</h2>
        <div class="alert alert-info">
            <p>Здесь будет интерактивная карта с отметками достопримечательностей.</p>
        </div>
        <div class="list-group">
            ${attractions.map(item => `
                <div class="list-group-item">
                    <strong>${item.name}</strong><br>
                    <small>${item.address}</small>
                    <button class="btn btn-sm btn-outline-primary mt-1" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        Маршрут
                    </button>
                </div>
            `).join('')}
        </div>
    `;
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

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}

function startRoute(id) {
    const route = routes.find(r => r.id === id);
    tg.showAlert(`Начинаем маршрут: "${route.name}"`);
}