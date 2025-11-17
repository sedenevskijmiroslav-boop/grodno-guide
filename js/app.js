// Telegram Web App
const tg = window.Telegram.WebApp;

// Глобальные переменные
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let map = null;
let currentMarkers = [];

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    tg.expand();
    tg.ready();
    console.log('Приложение запущено! Язык:', currentLanguage);
});

// ==================== ОСНОВНЫЕ ФУНКЦИИ ====================

function showAttractions() {
    const content = document.getElementById('content');
    const t = translations[currentLanguage];
    
    content.innerHTML = `
        <div class="fade-in">
            <h2 data-i18n="attractionsTitle">📍 ${t.attractionsTitle}</h2>
            <p class="text-muted mb-3" data-i18n="chooseAttraction">${t.chooseAttraction}</p>
            
            <div class="list-group">
                ${attractions.map(item => `
                    <div class="list-group-item list-group-item-action" onclick="showAttractionDetail(${item.id})">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="mb-1">${item.name}</h5>
                                <p class="mb-1">${item.description}</p>
                                <small class="text-muted">📍 ${item.address}</small>
                            </div>
                            <span class="badge bg-primary">${getCategoryIcon(item.category)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    applyTranslations();
}

function showAttractionDetail(id) {
    const item = attractions.find(attr => attr.id === id);
    const content = document.getElementById('content');
    const t = translations[currentLanguage];
    
    const isFavorite = favorites.includes(id);
    
    let contactsHtml = '';
    if (item.phone) {
        contactsHtml += `<p><strong>📞 ${t.phone}:</strong> ${item.phone}</p>`;
    }
    if (item.website) {
        contactsHtml += `<p><strong>🌐 ${t.website}:</strong> <a href="${item.website}" target="_blank" onclick="tg.openLink('${item.website}'); return false;">${item.website}</a></p>`;
    }
    
    content.innerHTML = `
        <button class="btn btn-secondary mb-3" onclick="showAttractions()" data-i18n="back">← ${t.back}</button>
        
        <div class="card fade-in">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h2 class="card-title">${item.name}</h2>
                    <span class="badge bg-primary">${getCategoryIcon(item.category)}</span>
                </div>
                
                <div class="info-card mb-3">
                    <p class="mb-1"><strong>📍 ${t.address}:</strong> ${item.address}</p>
                    <p class="mb-1"><strong>🕒 ${t.workingHours}:</strong> ${item.workingHours}</p>
                    <p class="mb-0"><strong>💰 ${t.price}:</strong> ${item.price}</p>
                </div>
                
                <p class="card-text">${item.fullDescription}</p>
                
                ${contactsHtml ? `
                    <div class="contacts-section mt-3">
                        <h5>📞 ${t.contacts}</h5>
                        <div class="contacts-card">
                            ${contactsHtml}
                        </div>
                    </div>
                ` : ''}
                
                <div class="d-grid gap-2 mt-4">
                    <button class="btn btn-success btn-lg" onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                        🗺️ ${t.navigate}
                    </button>
                    
                    <button class="btn ${isFavorite ? 'btn-warning' : 'btn-outline-warning'}" 
                            onclick="${isFavorite ? `removeFromFavorites(${item.id})` : `addToFavorites(${item.id})`}">
                        ${isFavorite ? `❌ ${t.removeFromFavorites}` : `⭐ ${t.addToFavorites}`}
                    </button>
                    
                    ${item.website ? `
                        <button class="btn btn-info" onclick="tg.openLink('${item.website}')">
                            🌐 ${t.openWebsite}
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    applyTranslations();
}

// ==================== КАРТА ====================

function showMap() {
    const content = document.getElementById('content');
    const t = translations[currentLanguage];
    
    content.innerHTML = `
        <div class="fade-in">
            <h2 data-i18n="mapTitle">🗺️ ${t.mapTitle}</h2>
            <p class="text-muted mb-3" data-i18n="mapDescription">${t.mapDescription}</p>
            
            <div id="map"></div>
            
            <div class="mt-3">
                <div class="list-group">
                    ${attractions.map(item => `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${item.name}</strong>
                                    <br><small class="text-muted">📍 ${item.address}</small>
                                </div>
                                <button class="btn btn-sm btn-outline-primary" 
                                        onclick="openInMaps(${item.coords.lat}, ${item.coords.lng})">
                                    🗺️ ${t.navigate}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    applyTranslations();
    setTimeout(initMap, 100);
}

function initMap() {
    try {
        console.log('Инициализация карты...');
        
        // Очищаем предыдущую карту
        if (map) {
            map.remove();
            map = null;
        }
        
        // Создаем карту
        map = L.map('map').setView([53.6780, 23.8293], 14);
        
        // Добавляем слой OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Очищаем старые маркеры
        currentMarkers.forEach(marker => {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        });
        currentMarkers = [];
        
        // Добавляем маркеры
        attractions.forEach(place => {
            const marker = L.marker([place.coords.lat, place.coords.lng])
                .addTo(map)
                .bindPopup(`
                    <div style="min-width: 250px;">
                        <h5>${place.name}</h5>
                        <p>${place.description}</p>
                        <p><strong>📍 ${translations[currentLanguage].address}:</strong> ${place.address}</p>
                        <div class="d-grid gap-2">
                            <button onclick="openInMaps(${place.coords.lat}, ${place.coords.lng})" 
                                    style="background: #28a745; color: white; border: none; padding: 8px; border-radius: 5px;">
                                🗺️ ${translations[currentLanguage].navigate}
                            </button>
                            <button onclick="showAttractionDetail(${place.id})" 
                                    style="background: #007bff; color: white; border: none; padding: 8px; border-radius: 5px;">
                                ℹ️ ${translations[currentLanguage].details}
                            </button>
                        </div>
                    </div>
                `);
            
            currentMarkers.push(marker);
        });
        
        console.log('Карта успешно загружена!');
        
    } catch (error) {
        console.error('Ошибка загрузки карты:', error);
        document.getElementById('map').innerHTML = `
            <div class="alert alert-warning text-center p-4">
                <h5>🗺️ ${currentLanguage === 'ru' ? 'Карта временно недоступна' : 'Map temporarily unavailable'}</h5>
                <p>${currentLanguage === 'ru' ? 'Используйте список ниже для навигации' : 'Use the list below for navigation'}</p>
            </div>
        `;
    }
}

// ==================== МАРШРУТЫ ====================

function showRoutes() {
    const content = document.getElementById('content');
    const t = translations[currentLanguage];
    
    content.innerHTML = `
        <div class="fade-in">
            <h2 data-i18n="routesTitle">🚶 ${t.routesTitle}</h2>
            <p class="text-muted mb-4" data-i18n="chooseRoute">${t.chooseRoute}</p>
            
            <div class="row">
                ${routes.map(route => `
                    <div class="col-md-6 mb-4">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">${route.name}</h5>
                                <p class="card-text">${route.description}</p>
                                <div class="route-meta">
                                    <small class="text-muted">
                                        ⏱️ ${t.duration}: ${route.duration} | 📏 ${t.distance}: ${route.distance}
                                    </small>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary w-100" onclick="startRoute(${route.id})">
                                    🚶 ${t.startRoute}
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    applyTranslations();
}

function startRoute(routeId) {
    const route = routes.find(r => r.id === routeId);
    const t = translations[currentLanguage];
    tg.showAlert(`${t.startRoute}: "${route.name}"`);
}

// ==================== ИЗБРАННОЕ ====================

function showFavorites() {
    const content = document.getElementById('content');
    const t = translations[currentLanguage];
    
    if (favorites.length === 0) {
        content.innerHTML = `
            <div class="text-center py-5">
                <div style="font-size: 64px; margin-bottom: 20px;">⭐</div>
                <h3 data-i18n="favoritesEmpty">${t.favoritesEmpty}</h3>
                <p class="text-muted" data-i18n="favoritesEmptyText">${t.favoritesEmptyText}</p>
                <button class="btn btn-primary mt-3" onclick="showAttractions()" data-i18n="attractions">
                    📍 ${t.attractions}
                </button>
            </div>
        `;
        applyTranslations();
        return;
    }
    
    const favoriteItems = attractions.filter(item => favorites.includes(item.id));
    
    content.innerHTML = `
        <div class="fade-in">
            <h2 data-i18n="favoritesTitle">⭐ ${t.favoritesTitle}</h2>
            <p class="text-muted mb-3">${favorites.length} ${t.placesInFavorites}</p>
            
            <div class="list-group">
                ${favoriteItems.map(item => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1" onclick="showAttractionDetail(${item.id})" style="cursor: pointer;">
                                <h5 class="mb-1">${item.name} ⭐</h5>
                                <p class="mb-1">${item.description}</p>
                                <small class="text-muted">📍 ${item.address}</small>
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
                <button class="btn btn-outline-secondary" onclick="clearAllFavorites()" data-i18n="clearAll">
                    🗑️ ${t.clearAll}
                </button>
            </div>
        </div>
    `;
    
    applyTranslations();
}

function addToFavorites(attractionId) {
    if (!favorites.includes(attractionId)) {
        favorites.push(attractionId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        const t = translations[currentLanguage];
        tg.showAlert(`✅ ${t.addToFavorites}`);
        
        // Если открыта страница избранного - обновляем
        if (document.getElementById('content').innerHTML.includes('Избранное') || 
            document.getElementById('content').innerHTML.includes('Favorites')) {
            showFavorites();
        }
    }
}

function removeFromFavorites(attractionId) {
    favorites = favorites.filter(id => id !== attractionId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    const t = translations[currentLanguage];
    tg.showAlert(`❌ ${t.removeFromFavorites}`);
    showFavorites();
}

function clearAllFavorites() {
    if (favorites.length === 0) {
        const t = translations[currentLanguage];
        tg.showAlert(`📭 ${t.favoritesEmpty}`);
        return;
    }
    
    favorites = [];
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    const t = translations[currentLanguage];
    tg.showAlert(`🗑️ ${t.clearAll}`);
    showFavorites();
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function getCategoryIcon(category) {
    const icons = {
        'architecture': '🏛️',
        'religion': '⛪',
        'sights': '📸',
        'entertainment': '🎪',
        'parks': '🌳'
    };
    return icons[category] || '📍';
}

function openInMaps(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`;
    tg.openLink(url);
}