// ==================== СИСТЕМА ЯЗЫКОВ ====================

const translations = {
    ru: {
        // Главная страница
        welcome: "Добро пожаловать в Гродно!",
        chooseSection: "Выберите раздел для начала исследования города",
        attractions: "📍 Достопримечательности",
        map: "🗺️ Карта города",
        routes: "🚶 Готовые маршруты", 
        favorites: "⭐ Избранное",
        settings: "⚙️ Настройки",
        
        // Достопримечательности
        categories: "🎯 Категории достопримечательностей",
        chooseCategory: "Выберите категорию для просмотра мест",
        allPlaces: "Все места",
        architecture: "Архитектура",
        religion: "Религия",
        sights: "Достопримечательности",
        parks: "Парки",
        entertainment: "Развлечения",
        
        // Карта
        interactiveMap: "Интерактивная карта Гродно",
        clickMarker: "Нажмите на маркер для информации о достопримечательности",
        mapLegend: "📍 Легенда карты",
        
        // Маршруты
        readyRoutes: "Готовые маршруты",
        chooseRoute: "Выберите маршрут для подробного просмотра",
        duration: "Продолжительность",
        distance: "Расстояние",
        difficulty: "Сложность",
        startRoute: "Начать маршрут",
        showOnMap: "На карте",
        
        // Избранное
        favoritesEmpty: "Пока пусто",
        favoritesEmptyText: "Добавляйте места в избранное, нажимая на звездочку",
        clearAll: "Очистить все",
        
        // Настройки
        settingsTitle: "Настройки",
        language: "Язык",
        selectLanguage: "Выберите язык",
        back: "Назад",
        
        // Общие
        address: "Адрес",
        workingHours: "Время работы", 
        price: "Стоимость",
        phone: "Телефон",
        website: "Сайт",
        contacts: "Контакты",
        navigate: "Маршрут",
        details: "Подробнее"
    },
    
    en: {
        // Main page
        welcome: "Welcome to Grodno!",
        chooseSection: "Choose a section to start exploring the city",
        attractions: "📍 Attractions",
        map: "🗺️ City Map",
        routes: "🚶 Ready Routes",
        favorites: "⭐ Favorites", 
        settings: "⚙️ Settings",
        
        // Attractions
        categories: "🎯 Attraction Categories",
        chooseCategory: "Choose a category to view places",
        allPlaces: "All Places",
        architecture: "Architecture",
        religion: "Religion",
        sights: "Sights",
        parks: "Parks",
        entertainment: "Entertainment",
        
        // Map
        interactiveMap: "Interactive Map of Grodno",
        clickMarker: "Click on a marker for attraction information",
        mapLegend: "📍 Map Legend",
        
        // Routes
        readyRoutes: "Ready Routes",
        chooseRoute: "Choose a route for detailed view",
        duration: "Duration",
        distance: "Distance", 
        difficulty: "Difficulty",
        startRoute: "Start Route",
        showOnMap: "On Map",
        
        // Favorites
        favoritesEmpty: "Empty for now",
        favoritesEmptyText: "Add places to favorites by clicking the star",
        clearAll: "Clear All",
        
        // Settings
        settingsTitle: "Settings",
        language: "Language",
        selectLanguage: "Select language",
        back: "Back",
        
        // General
        address: "Address",
        workingHours: "Working Hours",
        price: "Price",
        phone: "Phone",
        website: "Website",
        contacts: "Contacts",
        navigate: "Navigate",
        details: "Details"
    }
};

// Текущий язык
let currentLanguage = localStorage.getItem('grodnoLanguage') || 'ru';

// Функция смены языка
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('grodnoLanguage', lang);
        applyTranslations();
        return true;
    }
    return false;
}

// Применение переводов
function applyTranslations() {
    const t = translations[currentLanguage];
    
    // Обновляем элементы с data-i18n атрибутом
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    applyTranslations();
});