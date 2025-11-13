const tg = window.Telegram.WebApp;

// ==================== СИСТЕМА ИЗБРАННОГО ====================
let favorites = JSON.parse(localStorage.getItem('grodnoFavorites')) || [];

function saveFavorites() {
    localStorage.setItem('grodnoFavorites', JSON.stringify(favorites));
}

function addToFavorites(attractionId) {
    if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        saveFavorites();
        tg.showAlert('✅ Добавлено в избранное!');
        
        // Обновляем страницу если открыто избранное
        if (document.getElementById('content').innerHTML.includes('⭐ Избранное')) {
            showFavorites();
        }
    } else {
        tg.showAlert('⚠️ Это место уже в избранном!');
    }
}

function removeFromFavorites(attractionId) {
    favorites = favorites.filter(id => id !== attractionId);
    saveFavorites();
    tg.showAlert('❌ Удалено из избранного');
    
    // Обновляем страницу избранного
    if (document.getElementById('content').innerHTML.includes('⭐ Избранное')) {
        showFavorites();
    }
}

function isFavorite(attractionId) {
    return favorites.includes(attractionId);
}

function clearAllFavorites() {
    if (favorites.length === 0) {
        tg.showAlert('📭 Избранное уже пустое');
        return;
    }
    
    favorites = [];
    saveFavorites();
    tg.showAlert('🗑️ Все места удалены из избранного');
    showFavorites();
}
document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.ready();
    console.log('Приложение запущено!');
});

function showAttractions() {
    const content = document.getElementById('content');
    let html = '<h2>🏛️ Достопримечательности</h2><div class="list-group">';
    
    attractions.forEach(item => {
        html += `
            <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
                <h5>${item.name}</h5>
                <p class="mb-1">${item.description}</p>
                <small>${item.address}</small>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

function showAttractionDetail(id) {
    const item = attractions.find(attr => attr.id === id);
    const content = document.getElementById('content');
    
    // Определяем кнопку избранного
    const favoriteButton = isFavorite(item.id) 
        ? `<button class="btn btn-warning" onclick="removeFromFavorites(${item.id})">
               ❌ Удалить из избранного
           </button>`
        : `<button class="btn btn-outline-warning" onclick="addToFavorites(${item.id})">
               ⭐ Добавить в избранное
           </button>`;
    
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

function showMap() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>🗺️ Карта Гродно</h2>
        <div class="alert alert-info">
            <p>Здесь будет интерактивная карта с отметками достопримечательностей.</p>
            <p>Для реализации используйте Leaflet.js или Google Maps API.</p>
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
            <span class="text-muted">${favorites.length} мест в избранном</span>
            <button class="btn btn-outline-danger btn-sm" onclick="clearAllFavorites()">
                🗑️ Очистить все
            </button>
        </div>
        <div class="list-group">
    `;
    
    // Получаем избранные достопримечательности
    const favoriteAttractions = attractions.filter(attr => favorites.includes(attr.id));
    
    favoriteAttractions.forEach(item => {
        html += `
            <div class="list-group-item list-group-item-action">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                        <h5 class="mb-1">${item.name} ${isFavorite(item.id) ? '⭐' : ''}</h5>
                        <p class="mb-1">${item.description}</p>
                        <small>📍 ${item.address}</small>
                    </div>
                    <button class="btn btn-outline-danger btn-sm ms-3" 
                            onclick="removeFromFavorites(${item.id})" 
                            title="Удалить из избранного">
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

function addToFavorites(id) {
    tg.showAlert('Место добавлено в избранное!');
}

function startRoute(id) {
    const route = routes.find(r => r.id === id);
    tg.showAlert(`Начинаем маршрут: "${route.name}"`);
}