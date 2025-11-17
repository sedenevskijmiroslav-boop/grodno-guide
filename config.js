// ==================== КОНФИГУРАЦИЯ ТЕМ И ЯЗЫКОВ ====================

const themes = {
    default: {
        name: "Стандартная",
        primary: "#667eea",
        secondary: "#764ba2",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        cardBg: "#ffffff",
        textColor: "#2c3e50",
        textMuted: "#6c757d"
    },
    dark: {
        name: "Темная", 
        primary: "#4a5568",
        secondary: "#2d3748",
        background: "linear-gradient(135deg, #2d3748 0%, #4a5568 100%)",
        cardBg: "#2d3748",
        textColor: "#e2e8f0",
        textMuted: "#a0aec0"
    },
    green: {
        name: "Зеленая",
        primary: "#38a169", 
        secondary: "#2f855a",
        background: "linear-gradient(135deg, #38a169 0%, #2f855a 100%)",
        cardBg: "#ffffff",
        textColor: "#2d3748",
        textMuted: "#718096"
    },
    orange: {
        name: "Оранжевая",
        primary: "#ed8936",
        secondary: "#dd6b20",
        background: "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
        cardBg: "#ffffff", 
        textColor: "#2d3748",
        textMuted: "#718096"
    }
};

const translations = {
    ru: {
        // Общие
        welcome: "Добро пожаловать в Гродно!",
        chooseSection: "Выберите раздел для начала исследования города",
        
        // Кнопки главного меню
        attractions: "📍 Достопримечательности",
        map: "🗺️ Карта города", 
        routes: "🚶 Готовые маршруты",
        favorites: "⭐ Избранное",
        settings: "⚙️ Настройки",
        
        // Разделы
        categories: "🎯 Категории достопримечательностей",
        chooseCategory: "Выберите категорию для просмотра мест",
        allPlaces: "Все места",
        interactiveMap: "Интерактивная карта Гродно",
        clickMarker: "Нажмите на маркер для информации о достопримечательности",
        readyRoutes: "🚶 Готовые маршруты",
        chooseRoute: "Выберите маршрут для подробного просмотра или начала навигации",
        
        // Настройки
        settingsTitle: "⚙️ Настройки",
        language: "🌐 Язык",
        theme: "🎨 Тема оформления",
        selectLanguage: "Выберите язык",
        selectTheme: "Выберите тему оформления",
        
        // Статусы
        completed: "Завершен",
        inProgress: "В процессе",
        start: "Начать",
        details: "Подробнее",
        back: "Назад",
        navigate: "Маршрут",
        
        // Категории
        architecture: "Архитектура",
        religion: "Религия", 
        sights: "Достопримечательности",
        parks: "Парки",
        entertainment: "Развлечения",
        
        // Мета-информация
        duration: "Продолжительность",
        distance: "Расстояние", 
        difficulty: "Сложность",
        address: "Адрес",
        workingHours: "Время работы",
        price: "Стоимость",
        phone: "Телефон",
        website: "Сайт",
        contacts: "Контакты"
    },
    
    en: {
        // General
        welcome: "Welcome to Grodno!",
        chooseSection: "Choose a section to start exploring the city",
        
        // Main menu buttons
        attractions: "📍 Attractions",
        map: "🗺️ City Map",
        routes: "🚶 Ready Routes", 
        favorites: "⭐ Favorites",
        settings: "⚙️ Settings",
        
        // Sections
        categories: "🎯 Attraction Categories",
        chooseCategory: "Choose a category to view places",
        allPlaces: "All Places",
        interactiveMap: "Interactive Map of Grodno",
        clickMarker: "Click on a marker for attraction information",
        readyRoutes: "🚶 Ready Routes",
        chooseRoute: "Choose a route for detailed view or navigation",
        
        // Settings
        settingsTitle: "⚙️ Settings", 
        language: "🌐 Language",
        theme: "🎨 Theme",
        selectLanguage: "Select language",
        selectTheme: "Select theme",
        
        // Statuses
        completed: "Completed",
        inProgress: "In Progress", 
        start: "Start",
        details: "Details",
        back: "Back",
        navigate: "Navigate",
        
        // Categories
        architecture: "Architecture",
        religion: "Religion",
        sights: "Sights",
        parks: "Parks", 
        entertainment: "Entertainment",
        
        // Meta information
        duration: "Duration",
        distance: "Distance",
        difficulty: "Difficulty",
        address: "Address",
        workingHours: "Working Hours",
        price: "Price",
        phone: "Phone",
        website: "Website",
        contacts: "Contacts"
    }
};

// Текущие настройки
let currentTheme = localStorage.getItem('grodnoTheme') || 'default';
let currentLanguage = localStorage.getItem('grodnoLanguage') || 'ru';

// Функция применения темы
function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--background-gradient', theme.background);
    document.documentElement.style.setProperty('--card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--text-color', theme.textColor);
    document.documentElement.style.setProperty('--text-muted', theme.textMuted);
    
    currentTheme = themeName;
    localStorage.setItem('grodnoTheme', themeName);
}

// Функция смены языка
function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLanguage = lang;
    localStorage.setItem('grodnoLanguage', lang);
    applyTranslations();
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
    
    // Обновляем плейсхолдеры
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            element.setAttribute('placeholder', t[key]);
        }
    });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    applyTheme(currentTheme);
    setLanguage(currentLanguage);
});