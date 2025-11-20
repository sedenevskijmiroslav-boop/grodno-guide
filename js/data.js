// Данные о достопримечательностях Гродно
const attractions = [
    {
        id: 1,
        name: "Старый замок",
        category: "architecture",
        description: "Историческая крепость на берегу Немана",
        fullDescription: "Старый замок в Гродно — памятник оборонного зодчества XI-XIX веков. Первые укрепления возникли здесь в XI веке. Замок был резиденцией великого князя Витовта, здесь жил Стефан Баторий.",
        address: "ул. Замковая, 22",
        coords: { lat: 53.677080, lng: 23.823231 },
        workingHours: "10:00 - 18:00 (вт-вс)",
        price: "7 BYN - взрослый, 4 BYN - школьники/студенты",
        phone: "+375 (152) 72-18-51",
        website: "https://grodno-museum.by/?ysclid=mi5sklf20140452655#"
    },
    {
        id: 2,
        name: "Фарный костел",
        category: "religion", 
        description: "Величественный католический собор в стиле барокко",
        fullDescription: "Фарный костел Святого Франциска Ксаверия — один из самых красивых храмов Беларуси. Построен в стиле барокко в XVII-XVIII веках.",
        address: "пл. Советская, 4",
        coords: { lat: 53.678118, lng: 23.831423 },
        workingHours: "07:00 - 20:00 ежедневно",
        price: "бесплатно",
        phone: "+375 (152) 74-28-23",
        website: "https://katedra-grodno.by/"
    },
    {
        id: 3,
        name: "Новый замок",
        category: "architecture",
        description: "Королевский дворец XVIII века",
        fullDescription: "Новый замок построен в 1737-1752 годах как летняя резиденция польских королей и великих князей литовских.",
        address: "ул. Замковая, 20",
        coords: { lat: 53.6761, lng: 23.8253 },
        workingHours: "10:00 - 18:00 (вт-вс)",
        price: "6 BYN - взрослый, 3 BYN - школьники/студенты",
        phone: "+375 (152) 72-18-51",
        website: "https://grodno-museum.by/?ysclid=mi5sklf20140452655#"
    },
    {
        id: 4,
        name: "Каложская церковь",
        category: "religion",
        description: "Уникальный памятник древнерусского зодчества XII века",
        fullDescription: "Одна из древнейших церквей на территории Беларуси, построена в 1180-х годах. Уникальность храма — в голосниках (глиняных сосудах) в стенах.",
        address: "ул. Каложская, 6",
        coords: { lat: 53.678414, lng: 23.818604 },
        workingHours: "09:00 - 18:00 ежедневно",
        price: "бесплатно",
        phone: "+375 (152) 77-12-25",
        website: "http://kalozha.by/"
    },
    {
        id: 5,
        name: "Советская площадь",
        category: "sights",
        description: "Главная площадь исторического центра",
        fullDescription: "Центральная площадь Гродно, бывшая Рыночная. Сохранила историческую планировку с XVI века.",
        address: "пл. Советская",
        coords: { lat: 53.677520, lng: 23.829443 },
        workingHours: "круглосуточно",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-sovetskaya-ploshad"
    },
    {
        id: 6,
        name: "Гродненский зоопарк",
        category: "entertainment",
        description: "Старейший зоопарк в Беларуси",
        fullDescription: "Основан в 1927 году Яном Кохановским. Здесь содержится около 3000 животных 317 видов.",
        address: "ул. Тимирязева, 11",
        coords: { lat: 53.688830, lng: 23.848559 },
        workingHours: "10:00 - 20:00 (летом), 10:00 - 17:00 (зимой)",
        price: "10 BYN - взрослый, 5 BYN - детский",
        phone: "+375 (152) 75-38-54",
        website: "https://www.grodnozoo.by/"
    },
    {
        id: 7,
        name: "Борисоглебская церковь",
        category: "religion",
        description: "Древний православный храм XII века",
        fullDescription: "Борисоглебская (Коложская) церковь — один из старейших храмов Беларуси, построена в XII веке. Входит в список Всемирного наследия ЮНЕСКО.",
        address: "ул. Каложская, 6",
        coords: { lat: 53.678414, lng: 23.818604 },
        workingHours: "09:00 - 18:00 ежедневно",
        price: "бесплатно",
        phone: "+375 (152) 77-12-25",
        website: "http://kalozha.by/"
    },
    {
        id: 8,
        name: "Дом-музей Элизы Ожешко",
        category: "sights",
        description: "Музей знаменитой белорусской писательницы",
        fullDescription: "Дом, где жила и работала Элиза Ожешко — выдающаяся белорусская писательница XIX века. Музей рассказывает о её жизни и творчестве.",
        address: "ул. Элизы Ожешко, 22",
        coords: { lat: 53.6795, lng: 23.8278 },
        workingHours: "10:00 - 17:00 (вт-вс)",
        price: "3 BYN - взрослый, 1.5 BYN - школьники",
        phone: "+375 (152) 72-18-51",
        website: "https://grodno-museum.by/"
    },
    {
        id: 9,
        name: "Музей истории религии",
        category: "religion",
        description: "Уникальный музей религиозных артефактов",
        fullDescription: "Музей истории религии в Гродно — единственный в Беларуси музей такого профиля. Собрана коллекция предметов христианства, иудаизма и других религий.",
        address: "ул. Замковая, 16",
        coords: { lat: 53.6765, lng: 23.8245 },
        workingHours: "10:00 - 18:00 (вт-вс)",
        price: "5 BYN - взрослый, 2.5 BYN - школьники",
        phone: "+375 (152) 72-18-51",
        website: "https://grodno-museum.by/"
    },
    {
        id: 10,
        name: "Парк Жилибера",
        category: "entertainment",
        description: "Романтический парк с озером и скульптурами",
        fullDescription: "Парк Жилибера — один из старейших парков Гродно, основан в XIX веке. Здесь находится озеро, скульптуры и уютные аллеи для прогулок.",
        address: "ул. Горького, 87",
        coords: { lat: 53.6842, lng: 23.8415 },
        workingHours: "круглосуточно",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-park-zhilibera"
    },
    {
        id: 11,
        name: "Ратуша",
        category: "architecture",
        description: "Историческое здание городской администрации",
        fullDescription: "Гродненская ратуша — памятник архитектуры XVII века. Здание неоднократно перестраивалось, но сохранило свой исторический облик.",
        address: "пл. Советская, 1",
        coords: { lat: 53.6778, lng: 23.8298 },
        workingHours: "внешний осмотр - круглосуточно",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-ratusha"
    },
    {
        id: 12,
        name: "Большая хоральная синагога",
        category: "religion",
        description: "Главная синагога еврейской общины Гродно",
        fullDescription: "Большая хоральная синагога — центр еврейской религиозной жизни в Гродно. Построена в XIX веке в мавританском стиле.",
        address: "ул. Большая Троицкая, 59а",
        coords: { lat: 53.6792, lng: 23.8335 },
        workingHours: "по договорённости",
        price: "бесплатно",
        phone: "+375 (152) 77-45-67",
        website: "https://www.jewishgrodo.by/"
    },
    {
        id: 13,
        name: "Музей природы",
        category: "entertainment",
        description: "Музей с коллекцией флоры и фауны региона",
        fullDescription: "Гродненский государственный музей природы знакомит посетителей с природой Гродненской области, её флорой и фауной.",
        address: "ул. Горького, 85",
        coords: { lat: 53.6840, lng: 23.8410 },
        workingHours: "10:00 - 17:00 (вт-вс)",
        price: "4 BYN - взрослый, 2 BYN - детский",
        phone: "+375 (152) 72-18-51",
        website: "https://grodno-museum.by/"
    },
    {
        id: 14,
        name: "Площадь Победы",
        category: "sights",
        description: "Мемориальная площадь с памятником",
        fullDescription: "Площадь Победы — центральная площадь Гродно, где установлен памятник советским воинам-освободителям.",
        address: "пл. Победы",
        coords: { lat: 53.6770, lng: 23.8290 },
        workingHours: "круглосуточно",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-ploshad-pobedy"
    },
    {
        id: 15,
        name: "Дворец Пусловских",
        category: "architecture",
        description: "Неоклассический дворец XIX века",
        fullDescription: "Дворец Пусловских — яркий пример неоклассической архитектуры. Построен в XIX веке для богатой семьи Пусловских.",
        address: "ул. Дзержинского, 19",
        coords: { lat: 53.6785, lng: 23.8265 },
        workingHours: "внешний осмотр - круглосуточно",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-dvorets-puslovskih"
    },
    {
        id: 16,
        name: "Коложский монастырь",
        category: "religion",
        description: "Мужской православный монастырь",
        fullDescription: "Коложский монастырь — один из древнейших монастырей Беларуси. Основан в XII веке, здесь находится Борисоглебская церковь.",
        address: "ул. Каложская, 6",
        coords: { lat: 53.6784, lng: 23.8186 },
        workingHours: "09:00 - 18:00 ежедневно",
        price: "бесплатно",
        phone: "+375 (152) 77-12-25",
        website: "http://kalozha.by/"
    },
    {
        id: 17,
        name: "Гродненская крепость",
        category: "architecture",
        description: "Военная крепость XIX века",
        fullDescription: "Гродненская крепость — комплекс фортификационных сооружений XIX века. Включает в себя несколько фортов и укреплений.",
        address: "ул. Гродненская Крепость",
        coords: { lat: 53.6850, lng: 23.8350 },
        workingHours: "круглосуточно",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-krepost"
    },
    {
        id: 18,
        name: "Музей истории Гродно",
        category: "sights",
        description: "Музей, рассказывающий об истории города",
        fullDescription: "Гродненский государственный историко-археологический музей знакомит с историей Гродно от древних времён до наших дней.",
        address: "ул. Замковая, 22",
        coords: { lat: 53.6771, lng: 23.8232 },
        workingHours: "10:00 - 18:00 (вт-вс)",
        price: "6 BYN - взрослый, 3 BYN - школьники",
        phone: "+375 (152) 72-18-51",
        website: "https://grodno-museum.by/"
    },
    {
        id: 19,
        name: "Парк имени Максима Горького",
        category: "entertainment",
        description: "Городской парк с аттракционами и кафе",
        fullDescription: "Парк имени Максима Горького — любимое место отдыха горожан. Здесь есть аттракционы, кафе, озеро и зоны для пикников.",
        address: "ул. Горького",
        coords: { lat: 53.6835, lng: 23.8405 },
        workingHours: "08:00 - 22:00",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-park-gorkogo"
    },
    {
        id: 20,
        name: "Фонтан на Советской площади",
        category: "sights",
        description: "Красивый фонтан в центре города",
        fullDescription: "Фонтан на Советской площади — украшение центральной площади Гродно. Особенно красив в вечернее время с подсветкой.",
        address: "пл. Советская",
        coords: { lat: 53.6775, lng: 23.8294 },
        workingHours: "круглосуточно",
        price: "бесплатно",
        website: "https://my-places.by/places/grodno-sovetskaya-ploshad"
    }
];

// Маршруты
const routes = [
    {
        id: 1,
        name: "Исторический центр",
        duration: "3 часа",
        stops: [1, 3, 5, 2],
        description: "Классический маршрут по главным достопримечательностям",
        distance: "2.5 км"
    },
    {
        id: 2,
        name: "Религиозный тур",
        duration: "4 часа",
        stops: [2, 4, 7, 12, 16],
        description: "Знакомство с храмами Гродно",
        distance: "5 км"
    },
    {
        id: 3,
        name: "Архитектурный маршрут",
        duration: "2.5 часа",
        stops: [1, 3, 11, 15, 17],
        description: "Прогулка по архитектурным шедеврам города",
        distance: "4 км"
    },
    {
        id: 4,
        name: "Парковый отдых",
        duration: "3 часа",
        stops: [10, 13, 19],
        description: "Расслабленная прогулка по паркам и музеям природы",
        distance: "3.5 км"
    },
    {
        id: 5,
        name: "Семейный маршрут",
        duration: "4 часа",
        stops: [6, 8, 13, 19, 20],
        description: "Маршрут для всей семьи с зоопарком и парками",
        distance: "6 км"
    },
    {
        id: 6,
        name: "Музейный тур",
        duration: "5 часов",
        stops: [1, 8, 9, 13, 18],
        description: "Посещение музеев и исторических мест",
        distance: "4.5 км"
    }
];