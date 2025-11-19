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
        stops: [2, 4],
        description: "Знакомство с храмами Гродно",
        distance: "3 км"
    }
];