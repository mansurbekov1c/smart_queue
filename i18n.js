/*
  =====================================================
  TILLAR VA TARJIMALAR (i18n)

  Yangi til qo'shish uchun:
  1. I18N ga yangi kalit (masalan "de") qo'shing
  2. Barcha kalitlar uchun tarjima yozing
  3. setLang funksiyasi avtomatik ishlaydi
  =====================================================
*/

const I18N = {
  "uz-latn": {
    langName: "O'zbek (Lotin) ›",
    profLang: "🌐 Til",
    navHome: "Bosh sahifa",
    navSearch: "Izlash",
    navQueue: "Navbatim",
    navProfile: "Profil",
    splashBtnCustomer: '<i class="ph-fill ph-user"></i> Mijoz',
    splashBtnAdmin: '<i class="ph-fill ph-buildings"></i> Admin',
    btnDemo: '<i class="ph-fill ph-lightning"></i> Demo rejimida kirish',
    btnDemoText: "Demo rejimida kirish",
    langTitle: "Tilni tanlang",
    langCancel: "Bekor qilish",
    btnLogin: "Kirish",
    splashSub: "O'zbekiston uchun aqlli<br>navbat platformasi",
    roleLabel: "Rolni tanlang",
    loginTitle: "Xush kelibsiz!",
    loginSub: "Navbatni onlayn boshqaring",
    tabLogin: "Kirish",
    tabRegister: "Ro'yxatdan o'tish",
    labelPhone: "Telefon raqam",
    labelPass: "Parol",
    labelFirstname: "Ism",
    labelLastname: "Familiya",
    btnLoginSubmit: "Kirish →",
    btnRegisterSubmit: "Ro'yxatdan o'tish →",
    adminLoginTitle: "Admin paneli",
    adminLoginSub: "Markazingizni tanlang va kirish ma'lumotlarini kiriting",
    sectionPlace: "Markazni tanlang",
    selectedPlace: "Kirish uchun tanlangan markaz",
    labelLogin: "Login",
    btnAdminLogin: "Admin panelga kirish →",
    heroGreeting: "Assalomu alaykum,",
    heroNoQueue: "Hozirda faol navbat yo'q. Quyidan xizmat qidiring ↓",
    activeQueue: "Faol navbat",
    live: "Jonli",
    sectionCats: "Kategoriyalar",
    catAll: "Hammasi",
    catBarber: "Sartarosh",
    catClinic: "Klinika",
    catBank: "Bank",
    catCarwash: "Avtomoyka",
    catGov: "Davlat",
    sectionNearby: "Yaqin atrofda",
    btnAll: "Barchasi →",
    services: "Xizmatlar",
    searchPlaceholder: "Sartarosh, klinika, bank...",
    myQueue: "Mening navbatim",
    profile: "Profil",
    statTotal: "Jami navbat",
    statSaved: "Tejlgan vaqt",
    settings: "Sozlamalar",
    notifications: "Bildirishnomalar",
    enabled: "Yoqilgan",
    darkMode: "Tun/kun rejimi",
    paymentMethod: "To'lov usuli",
    configure: "Sozlash",
    logout: "Chiqish",
    adminCurLabel: "Hozirda xizmatda",
    adminCurName: "Hech kim",
    adminCurNext: "Navbat bo'sh",
    btnNext: "Keyingi",
    btnAdd: "+ Qo'shish",
    statToday: "Bugungi mijozlar",
    statWaiting: "Kutayotganlar",
    queue: "Navbat",
    btnClear: "Tozalash",
    hourlyAnalysis: "Soatlik tahlil",
    btnAdminLogout: "Admin paneldan chiqish",
    btnBack: "← Qaytish",
    dispLabel: "Hozirda xizmatda",
    dispName: "Kutilmoqda",
    dispPlace: "Navbat platformasi",
    dispNext: "Keyingi:",
    modalJoinTitle: "Navbatga qo'shilish",
    modalJoinSub: "Siz navbatga qo'shilmoqchisiz",
    yourNumber: "Sizning raqamingiz",
    free: "Bepul",
    estWait: "Taxminiy kutish:",
    btnConfirm: "Tasdiqlash",
    btnCancel: "Bekor qilish",
    modalAddTitle: "Yangi mijoz qo'shish",
    modalAddSub: "Offline (yurgan) mijozni navbatga qo'shing",
    labelName: "Ism (majburiy)",
    labelPhoneOpt: "Telefon (ixtiyoriy)",
    btnAddToQueue: "+ Navbatga qo'shish",
    modalDelayTitle: "Navbatni kechiktirish",
    modalDelaySub: "1 marta bepul, undan keyin har kechiktirishda 5,000 so'm to'lanadi. Maksimum 3 o'rin kechiktirishingiz mumkin.",
    slot: "o'rin",
    price: "5,000 so'm",
    btnJoinQueue: "Navbatga qo'shilish — bepul",
    queueLabel: "NAVBATDA",
    waitLabel: "KUTISH",
    currentLabel: "HOZIRGI",
    queueList: "Navbat ro'yxati",
    reviews: "Sharhlar",
    leaveReview: "Izoh qoldiring",
    reviewPlaceholder: "Xizmat haqida fikringizni yozing...",
    btnSubmitReview: "Izoh yuborish",
    btnGetQueue: "Navbat olish",
    viewMap: "Xaritada ko'rish →",
    mapOpening: "Xarita ochilmoqda...",
    adminDisplayBtn: "Ekran",
    adminLangBtn: "Til",
    /* Toast xabarlari */
    toastLoginWelcome: "✅ Xush kelibsiz!",
    toastRegisterNameRequired: "❌ Ism va familiyani kiriting",
    toastRegisterSuccess: "✅ Muvaffaqiyatli ro'yxatdan o'tdingiz!",
    toastDemoLogin: "⚡ Demo rejimida kirdingiz",
    toastLogout: "👋 Chiqildi",
    toastAdminSelectPlace: "❌ Avval markazni tanlang",
    toastAdminCredInvalid: "❌ Login yoki parol noto'g'ri",
    toastAdminLoginSuccess: "Xush kelibsiz!",
    toastAdminLogout: "Admin paneldan chiqildi",
    toastReviewRatingRequired: "❌ Avval yulduz bering",
    toastReviewTextRequired: "❌ Izoh matnini yozing",
    toastMustLogin: "❌ Avval kirishingiz kerak",
    toastReviewSubmitted: "✅ Izohingiz qabul qilindi!",
    toastPlaceClosed: "❌ Bu joy hozir yopiq",
    toastQueueAlreadyActive: "❌ Sizda allaqachon faol navbat bor",
    toastJoinQueueSuccess: "Navbatga qo'shildingiz! Raqamingiz",
    toastDelayFree: "Bepul kechiktirildi",
    toastDelayPaid: "5,000 so'm to'landi",
    toastLeaveQueue: "Navbatdan chiqildi",
    toastAdminNext: "Keyingi",
    toastAllServed: "✅ Barcha mijozlarga xizmat ko'rsatildi!",
    toastNameRequired: "❌ Ism kiriting",
    toastCustomerAdded: "navbatga qo'shildi",
    toastQueueCleared: "🔄 Navbat tozalandi",
    confirmClearQueue: "Bugungi navbatni tozalashni tasdiqlaysizmi?",
    /* Status / badge matnlari */
    adminNoOne: "Hech kim",
    adminQueueEnded: "Navbat tugadi",
    adminNextLabel: "Keyingi",
    emptyQueue: "Navbat bo'sh",
    statusCurrent: "Hozir",
    statusOnline: "Online",
    statusOffline: "Offline",
    statusOpen: "Ochiq",
    statusClosed: "Yopiq",
    statusBusy: "Juda band",
    statusModerate: "O'rtacha",
    statusQuiet: "Qulay",
    dateNow: "Hozir",
    waitApprox: "Taxminiy kutish",
    minutesFull: "daqiqa",
    minutesShort: "daq",
    waiting: "Kutilmoqda...",
    navPlatform: "Navbat platformasi",
    categoryBarber: "Sartaroshxona",
    categoryClinic: "Klinika",
    categoryBank: "Bank",
    categoryCarwash: "Avtomoyka",
    categoryGov: "Davlat muassasasi",
    themeDayMode: "Kun rejimi ›",
    themeNightMode: "Tun rejimi ›",
    themeSwitchToDay: "Kun rejimiga o'tish",
    themeSwitchToNight: "Tun rejimiga o'tish",
    themeTitle: "Kun/Tun rejimi",
    titleBack: "Orqaga",
    /* My Queue rendering */
    myQueueYour: "Sizning navbatingiz",
    myQueueStatus: "HOLATI",
    myQueueInQueue: "Navbatda",
    myQueueAhead: "OLDINGIZDA",
    myQueueWaitLabel: "KUTISH",
    myQueueDelay: "⏱ Kechiktirish",
    myQueueLeave: "Navbatdan chiqish",
    myQueueNoActive: "Faol navbat yo'q",
    myQueueFind: "Xizmat joyini toping va navbatga qo'shiling",
    myQueueSearchBtn: "Xizmat izlash →",
    liveBadge: "Jonli",
    yourNum: "NAVBAT",
    /* Detail render */
    detailYou: "Siz",
    detailDone: "Tugadi",
    detailEmptyReviews: "Hali sharhlar yo'q",
    detailReviewsMore: "ko'proq",
    detailRating: "Reyting",
    detailQueue: "Navbat",
    detailQueueCount: "odam",
    detailAddress: "Manzil",
    detailHours: "Ish vaqti",
    detailCategory: "Kategoriya",
    peopleWord: "kishi",
    /* Input placeholders */
    phonePlaceholder: "+998 90 123 45 67",
    passPlaceholder: "••••••••",
    firstNamePlaceholder: "Ali",
    lastNamePlaceholder: "Valiyev",
    minCharsPlaceholder: "Kamida 6 ta belgi",
    loginInputPlaceholder: "loginni kiriting",
    passInputPlaceholder: "parolni kiriting",
    walkinNamePlaceholder: "Mijoz ismi",
    walkinPhonePlaceholder: "+998 ...",
    appFooter: "Toshkent, O'zbekiston",
    emptyCategory: "Bu kategoriyada joy yo'q",
    emptyNoResults: "Natija topilmadi",
    emptySearchOther: "Boshqa so'z bilan qidiring",
    hourUnit: "soat",
    enabledArrow: "Yoqilgan ›"
  },
  "uz-cyrl": {
    langName: "Ўзбек (Кирилл) ›",
    profLang: "🌐 Тил",
    navHome: "Бош саҳифа",
    navSearch: "Излаш",
    navQueue: "Навбатим",
    navProfile: "Профил",
    splashBtnCustomer: '<i class="ph-fill ph-user"></i> Мижоз',
    splashBtnAdmin: '<i class="ph-fill ph-buildings"></i> Админ',
    btnDemo: '<i class="ph-fill ph-lightning"></i> Демо режимида кириш',
    btnDemoText: "Демо режимида кириш",
    langTitle: "Тилни танланг",
    langCancel: "Бекор қилиш",
    btnLogin: "Кириш",
    splashSub: "Ўзбекистон учун ақлли<br>навбат платформаси",
    roleLabel: "Ролни танланг",
    loginTitle: "Хуш келибсиз!",
    loginSub: "Навбатни онлайн бошқаринг",
    tabLogin: "Кириш",
    tabRegister: "Рўйхатдан ўтиш",
    labelPhone: "Телефон рақами",
    labelPass: "Парол",
    labelFirstname: "Исм",
    labelLastname: "Фамилия",
    btnLoginSubmit: "Кириш →",
    btnRegisterSubmit: "Рўйхатдан ўтиш →",
    adminLoginTitle: "Админ панели",
    adminLoginSub: "Марказингизни танланг ва кириш маълумотларини киритинг",
    sectionPlace: "Марказни танланг",
    selectedPlace: "Кириш учун танланган марказ",
    labelLogin: "Логин",
    btnAdminLogin: "Админ панелга кириш →",
    heroGreeting: "Ассалому алайкум,",
    heroNoQueue: "Ҳозирда фаол навбат йўқ. Қуйидан хизмат қидиринг ↓",
    activeQueue: "Фаол навбат",
    live: "Жонли",
    sectionCats: "Категориялар",
    catAll: "Ҳаммаси",
    catBarber: "Сартарош",
    catClinic: "Клиника",
    catBank: "Банк",
    catCarwash: "Автомойка",
    catGov: "Давлат",
    sectionNearby: "Яқин атрофда",
    btnAll: "Ҳаммаси →",
    services: "Хизматлар",
    searchPlaceholder: "Сартарош, клиника, банк...",
    myQueue: "Менинг навбатим",
    profile: "Профил",
    statTotal: "Жами навбат",
    statSaved: "Тежлаган вақт",
    settings: "Созламалар",
    notifications: "Билдиришномалар",
    enabled: "Ёқилган",
    darkMode: "Тун/кун режими",
    paymentMethod: "Тўлов усули",
    configure: "Созлаш",
    logout: "Чиқиш",
    adminCurLabel: "Ҳозирда хизматда",
    adminCurName: "Ҳеч ким",
    adminCurNext: "Навбат бўш",
    btnNext: "Кейинги",
    btnAdd: "+ Қўшиш",
    statToday: "Бугунги mijozлар",
    statWaiting: "Кутайотганлар",
    queue: "Навбат",
    btnClear: "Тозалаш",
    hourlyAnalysis: "Соатлик таҳлил",
    btnAdminLogout: "Админ панелдан чиқиш",
    btnBack: "← Қайтish",
    dispLabel: "Ҳозирда хизматда",
    dispName: "Кутмоқда",
    dispPlace: "Навбат платформаси",
    dispNext: "Кейинги:",
    modalJoinTitle: "Навбатга қўшилиш",
    modalJoinSub: "Сиз навбатга қўшилмоқчисиз",
    yourNumber: "Сизнинг рақамингиз",
    free: "Бепул",
    estWait: "Тахминий кутиш:",
    btnConfirm: "Тасдиқлаш",
    btnCancel: "Бекор қилиш",
    modalAddTitle: "Янги mijoz қўшиш",
    modalAddSub: "Offline (юрган) mijozни навбатга қўшинг",
    labelName: "Исм (мажбурий)",
    labelPhoneOpt: "Телефон (ихтиёрий)",
    btnAddToQueue: "+ Навбатга қўшиш",
    modalDelayTitle: "Навбатни кечиктириш",
    modalDelaySub: "1 мартa бепул, ундан кейин ҳар кечиктиришда 5,000 сўм тўланади. Максимум 3 орин кечиктиришингиз мумкин.",
    slot: "орин",
    price: "5,000 сўм",
    btnJoinQueue: "Навбатга қўшилиш — бепул",
    queueLabel: "НАВБАТДА",
    waitLabel: "КУТИШ",
    currentLabel: "ҲОЗИРГИ",
    queueList: "Навбат рўйхати",
    reviews: "Шарҳлар",
    leaveReview: "Изоҳ қолдириш",
    reviewPlaceholder: "Хизмат ҳақида фикрингизни ёзинг...",
    btnSubmitReview: "Изоҳ юбориш",
    btnGetQueue: "Навбат олиш",
    viewMap: "Харитада кўриш →",
    mapOpening: "Харита очилмоқда...",
    adminDisplayBtn: "Экран",
    adminLangBtn: "Тил",
    /* Toast хабарлари */
    toastLoginWelcome: "✅ Хуш келибсиз!",
    toastRegisterNameRequired: "❌ Исм ва фамилияни киритинг",
    toastRegisterSuccess: "✅ Муваффақиятли рўйхатдан ўтдингиз!",
    toastDemoLogin: "⚡ Демо режимида кирдингиз",
    toastLogout: "👋 Чиқилди",
    toastAdminSelectPlace: "❌ Аввал марказни танланг",
    toastAdminCredInvalid: "❌ Логин ёки парол нотўғри",
    toastAdminLoginSuccess: "Хуш келибсиз!",
    toastAdminLogout: "Админ панелдан чиқилди",
    toastReviewRatingRequired: "❌ Аввал юлдуз беринг",
    toastReviewTextRequired: "❌ Изоҳ матнини ёзинг",
    toastMustLogin: "❌ Аввал киришингиз керак",
    toastReviewSubmitted: "✅ Изоҳингиз қабул қилинди!",
    toastPlaceClosed: "❌ Бу жой ҳозир ёпиқ",
    toastQueueAlreadyActive: "❌ Сизда аллақачон фаол навбат бор",
    toastJoinQueueSuccess: "Навбатга қўшилдингиз! Рақамингиз",
    toastDelayFree: "Бепул кечиктирилди",
    toastDelayPaid: "5,000 сўм тўланди",
    toastLeaveQueue: "Навбатдан чиқилди",
    toastAdminNext: "Кейинги",
    toastAllServed: "✅ Барча мижозларга хизмат кўрсатилди!",
    toastNameRequired: "❌ Исм киритинг",
    toastCustomerAdded: "навбатга қўшилди",
    toastQueueCleared: "🔄 Навбат тозаланди",
    confirmClearQueue: "Бугунги навбатни тозалашни тасдиқлайсизми?",
    adminNoOne: "Ҳеч ким",
    adminQueueEnded: "Навбат тугади",
    adminNextLabel: "Кейинги",
    emptyQueue: "Навбат бўш",
    statusCurrent: "Ҳозир",
    statusOnline: "Онлайн",
    statusOffline: "Оффлайн",
    statusOpen: "Очиқ",
    statusClosed: "Ёпиқ",
    statusBusy: "Жуда банд",
    statusModerate: "Ўртача",
    statusQuiet: "Қулай",
    dateNow: "Ҳозир",
    waitApprox: "Тахминий кутиш",
    minutesFull: "дақиқа",
    minutesShort: "дақ",
    waiting: "Кутилмоқда...",
    navPlatform: "Навбат платформаси",
    categoryBarber: "Сартарошхона",
    categoryClinic: "Клиника",
    categoryBank: "Банк",
    categoryCarwash: "Автомойка",
    categoryGov: "Давлат муассасаси",
    themeDayMode: "Кун режими ›",
    themeNightMode: "Тун режими ›",
    themeSwitchToDay: "Кун режимига ўтиш",
    themeSwitchToNight: "Тун режимига ўтиш",
    themeTitle: "Кун/Тун режими",
    titleBack: "Орқага",
    myQueueYour: "Сизнинг навбатингиз",
    myQueueStatus: "ҲОЛАТИ",
    myQueueInQueue: "Навбатда",
    myQueueAhead: "ОЛДИНГИЗДА",
    myQueueWaitLabel: "КУТИШ",
    myQueueDelay: "⏱ Кечиктириш",
    myQueueLeave: "Навбатдан чиқиш",
    myQueueNoActive: "Фаол навбат йўқ",
    myQueueFind: "Хизмат жойини топинг ва навбатга қўшилинг",
    myQueueSearchBtn: "Хизмат излаш →",
    liveBadge: "Жонли",
    yourNum: "НАВБАТ",
    detailYou: "Сиз",
    detailDone: "Тугади",
    detailEmptyReviews: "Ҳали шарҳлар йўқ",
    detailReviewsMore: "кўпроқ",
    detailRating: "Рейтинг",
    detailQueue: "Навбат",
    detailQueueCount: "одам",
    detailAddress: "Манзил",
    detailHours: "Иш вақти",
    detailCategory: "Категория",
    peopleWord: "киши",
    phonePlaceholder: "+998 90 123 45 67",
    passPlaceholder: "••••••••",
    firstNamePlaceholder: "Али",
    lastNamePlaceholder: "Валиев",
    minCharsPlaceholder: "Камида 6 та белги",
    loginInputPlaceholder: "логинни киритинг",
    passInputPlaceholder: "паролни киритинг",
    walkinNamePlaceholder: "Мижоз исми",
    walkinPhonePlaceholder: "+998 ...",
    appFooter: "Тошкент, Ўзбекистон",
    emptyCategory: "Бу категорияда жой йўқ",
    emptyNoResults: "Натижа топилмади",
    emptySearchOther: "Бошқа сўз билан қидиринг",
    hourUnit: "соат",
    enabledArrow: "Ёқилган ›"
  },
  "ru": {
    langName: "Русский ›",
    profLang: "🌐 Язык",
    navHome: "Главная",
    navSearch: "Поиск",
    navQueue: "Моя очередь",
    navProfile: "Профиль",
    splashBtnCustomer: '<i class="ph-fill ph-user"></i> Клиент',
    splashBtnAdmin: '<i class="ph-fill ph-buildings"></i> Админ',
    btnDemo: '<i class="ph-fill ph-lightning"></i> Демо вход',
    btnDemoText: "Демо вход",
    langTitle: "Выберите язык",
    langCancel: "Отмена",
    btnLogin: "Войти",
    splashSub: "Умная платформа очереди<br>для Узбекистана",
    roleLabel: "Выберите роль",
    loginTitle: "Добро пожаловать!",
    loginSub: "Управляйте очередью онлайн",
    tabLogin: "Войти",
    tabRegister: "Регистрация",
    labelPhone: "Номер телефона",
    labelPass: "Пароль",
    labelFirstname: "Имя",
    labelLastname: "Фамилия",
    btnLoginSubmit: "Войти →",
    btnRegisterSubmit: "Регистрация →",
    adminLoginTitle: "Админ панель",
    adminLoginSub: "Выберите ваш центр и введите данные для входа",
    sectionPlace: "Выберите центр",
    selectedPlace: "Выбранный центр для входа",
    labelLogin: "Логин",
    btnAdminLogin: "Войти в админ панель →",
    heroGreeting: "Здравствуйте,",
    heroNoQueue: "В настоящее время нет активной очереди. Ищите услуги ниже ↓",
    activeQueue: "Активная очередь",
    live: "В прямом эфире",
    sectionCats: "Категории",
    catAll: "Все",
    catBarber: "Парикмахерская",
    catClinic: "Клиника",
    catBank: "Банк",
    catCarwash: "Автомойка",
    catGov: "Государство",
    sectionNearby: "Поблизости",
    btnAll: "Все →",
    services: "Услуги",
    searchPlaceholder: "Парикмахерская, клиника, банк...",
    myQueue: "Моя очередь",
    profile: "Профиль",
    statTotal: "Всего очередей",
    statSaved: "Сэкономлено времени",
    settings: "Настройки",
    notifications: "Уведомления",
    enabled: "Включено",
    darkMode: "Темный/светлый режим",
    paymentMethod: "Способ оплаты",
    configure: "Настроить",
    logout: "Выйти",
    adminCurLabel: "Сейчас на обслуживании",
    adminCurName: "Никто",
    adminCurNext: "Очередь пуста",
    btnNext: "Следующий",
    btnAdd: "+ Добавить",
    statToday: "Клиентов сегодня",
    statWaiting: "Ожидающих",
    queue: "Очередь",
    btnClear: "Очистить",
    hourlyAnalysis: "Почасовой анализ",
    btnAdminLogout: "Выйти из админ панели",
    btnBack: "← Назад",
    dispLabel: "Сейчас на обслуживании",
    dispName: "Ожидается",
    dispPlace: "Платформа очереди",
    dispNext: "Следующий:",
    modalJoinTitle: "Присоединиться к очереди",
    modalJoinSub: "Вы хотите присоединиться к очереди",
    yourNumber: "Ваш номер",
    free: "Бесплатно",
    estWait: "Ожидаемое ожидание:",
    btnConfirm: "Подтвердить",
    btnCancel: "Отмена",
    modalAddTitle: "Добавить нового клиента",
    modalAddSub: "Добавить офлайн клиента в очередь",
    labelName: "Имя (обязательно)",
    labelPhoneOpt: "Телефон (опционально)",
    btnAddToQueue: "+ Добавить в очередь",
    modalDelayTitle: "Отложить очередь",
    modalDelaySub: "1 раз бесплатно, затем 5,000 сум за каждое отложение. Максимум 3 места.",
    slot: "место",
    price: "5,000 сум",
    btnJoinQueue: "Присоединиться к очереди — бесплатно",
    queueLabel: "В ОЧЕРЕДИ",
    waitLabel: "ОЖИДАНИЕ",
    currentLabel: "ТЕКУЩИЙ",
    queueList: "Список очереди",
    reviews: "Отзывы",
    leaveReview: "Оставить отзыв",
    reviewPlaceholder: "Напишите ваше мнение об услуге...",
    btnSubmitReview: "Отправить отзыв",
    btnGetQueue: "Взять очередь",
    viewMap: "Посмотреть на карте →",
    mapOpening: "Карта открывается...",
    adminDisplayBtn: "Экран",
    adminLangBtn: "Язык",
    /* Toast сообщения */
    toastLoginWelcome: "✅ Добро пожаловать!",
    toastRegisterNameRequired: "❌ Введите имя и фамилию",
    toastRegisterSuccess: "✅ Вы успешно зарегистрировались!",
    toastDemoLogin: "⚡ Вы вошли в демо-режиме",
    toastLogout: "👋 Вы вышли",
    toastAdminSelectPlace: "❌ Сначала выберите центр",
    toastAdminCredInvalid: "❌ Неверный логин или пароль",
    toastAdminLoginSuccess: "Добро пожаловать!",
    toastAdminLogout: "Вы вышли из админ-панели",
    toastReviewRatingRequired: "❌ Сначала поставьте оценку",
    toastReviewTextRequired: "❌ Напишите текст отзыва",
    toastMustLogin: "❌ Сначала необходимо войти",
    toastReviewSubmitted: "✅ Ваш отзыв принят!",
    toastPlaceClosed: "❌ Это место сейчас закрыто",
    toastQueueAlreadyActive: "❌ У вас уже есть активная очередь",
    toastJoinQueueSuccess: "Вы встали в очередь! Ваш номер",
    toastDelayFree: "Отложено бесплатно",
    toastDelayPaid: "Оплачено 5,000 сум",
    toastLeaveQueue: "Вы вышли из очереди",
    toastAdminNext: "Следующий",
    toastAllServed: "✅ Все клиенты обслужены!",
    toastNameRequired: "❌ Введите имя",
    toastCustomerAdded: "добавлен в очередь",
    toastQueueCleared: "🔄 Очередь очищена",
    confirmClearQueue: "Подтвердить очистку сегодняшней очереди?",
    adminNoOne: "Никого",
    adminQueueEnded: "Очередь закончилась",
    adminNextLabel: "Следующий",
    emptyQueue: "Очередь пуста",
    statusCurrent: "Сейчас",
    statusOnline: "Онлайн",
    statusOffline: "Оффлайн",
    statusOpen: "Открыто",
    statusClosed: "Закрыто",
    statusBusy: "Очень занято",
    statusModerate: "Средне",
    statusQuiet: "Свободно",
    dateNow: "Сейчас",
    waitApprox: "Ожидание примерно",
    minutesFull: "минут",
    minutesShort: "мин",
    waiting: "Ожидание...",
    navPlatform: "Платформа очереди",
    categoryBarber: "Парикмахерская",
    categoryClinic: "Клиника",
    categoryBank: "Банк",
    categoryCarwash: "Автомойка",
    categoryGov: "Гос. учреждение",
    themeDayMode: "Светлая тема ›",
    themeNightMode: "Тёмная тема ›",
    themeSwitchToDay: "Переключить на светлую",
    themeSwitchToNight: "Переключить на тёмную",
    themeTitle: "Светлая/Тёмная тема",
    titleBack: "Назад",
    myQueueYour: "Ваша очередь",
    myQueueStatus: "СТАТУС",
    myQueueInQueue: "В очереди",
    myQueueAhead: "ВПЕРЕДИ ВАС",
    myQueueWaitLabel: "ОЖИДАНИЕ",
    myQueueDelay: "⏱ Отложить",
    myQueueLeave: "Выйти из очереди",
    myQueueNoActive: "Нет активной очереди",
    myQueueFind: "Найдите место и встаньте в очередь",
    myQueueSearchBtn: "Найти услугу →",
    liveBadge: "В эфире",
    yourNum: "НОМЕР",
    detailYou: "Вы",
    detailDone: "Готово",
    detailEmptyReviews: "Отзывов пока нет",
    detailReviewsMore: "ещё",
    detailRating: "Рейтинг",
    detailQueue: "Очередь",
    detailQueueCount: "чел.",
    detailAddress: "Адрес",
    detailHours: "Часы работы",
    detailCategory: "Категория",
    peopleWord: "человек",
    phonePlaceholder: "+998 90 123 45 67",
    passPlaceholder: "••••••••",
    firstNamePlaceholder: "Али",
    lastNamePlaceholder: "Валиев",
    minCharsPlaceholder: "Минимум 6 символов",
    loginInputPlaceholder: "введите логин",
    passInputPlaceholder: "введите пароль",
    walkinNamePlaceholder: "Имя клиента",
    walkinPhonePlaceholder: "+998 ...",
    appFooter: "Ташкент, Узбекистан",
    emptyCategory: "В этой категории нет мест",
    emptyNoResults: "Результаты не найдены",
    emptySearchOther: "Попробуйте другие слова",
    hourUnit: "ч",
    enabledArrow: "Включено ›"
  },
  "en": {
    langName: "English ›",
    profLang: "🌐 Language",
    navHome: "Home",
    navSearch: "Search",
    navQueue: "My Queue",
    navProfile: "Profile",
    splashBtnCustomer: '<i class="ph-fill ph-user"></i> Customer',
    splashBtnAdmin: '<i class="ph-fill ph-buildings"></i> Admin',
    btnDemo: '<i class="ph-fill ph-lightning"></i> Demo login',
    btnDemoText: "Demo login",
    langTitle: "Select language",
    langCancel: "Cancel",
    btnLogin: "Login",
    splashSub: "Smart queue platform<br>for Uzbekistan",
    roleLabel: "Select your role",
    loginTitle: "Welcome!",
    loginSub: "Manage your queue online",
    tabLogin: "Login",
    tabRegister: "Register",
    labelPhone: "Phone number",
    labelPass: "Password",
    labelFirstname: "First name",
    labelLastname: "Last name",
    btnLoginSubmit: "Login →",
    btnRegisterSubmit: "Register →",
    adminLoginTitle: "Admin panel",
    adminLoginSub: "Select your center and enter login details",
    sectionPlace: "Select center",
    selectedPlace: "Selected center for login",
    labelLogin: "Login",
    btnAdminLogin: "Login to admin panel →",
    heroGreeting: "Hello,",
    heroNoQueue: "No active queue right now. Search for services below ↓",
    activeQueue: "Active queue",
    live: "Live",
    sectionCats: "Categories",
    catAll: "All",
    catBarber: "Barber",
    catClinic: "Clinic",
    catBank: "Bank",
    catCarwash: "Car wash",
    catGov: "Government",
    sectionNearby: "Nearby",
    btnAll: "All →",
    services: "Services",
    searchPlaceholder: "Barber, clinic, bank...",
    myQueue: "My Queue",
    profile: "Profile",
    statTotal: "Total queues",
    statSaved: "Time saved",
    settings: "Settings",
    notifications: "Notifications",
    enabled: "Enabled",
    darkMode: "Dark/Light mode",
    paymentMethod: "Payment method",
    configure: "Configure",
    logout: "Logout",
    adminCurLabel: "Currently serving",
    adminCurName: "No one",
    adminCurNext: "Queue empty",
    btnNext: "Next",
    btnAdd: "+ Add",
    statToday: "Today's customers",
    statWaiting: "Waiting",
    queue: "Queue",
    btnClear: "Clear",
    hourlyAnalysis: "Hourly analysis",
    btnAdminLogout: "Logout from admin panel",
    btnBack: "← Back",
    dispLabel: "Currently serving",
    dispName: "Waiting",
    dispPlace: "Queue platform",
    dispNext: "Next:",
    modalJoinTitle: "Join queue",
    modalJoinSub: "You are about to join the queue",
    yourNumber: "Your number",
    free: "Free",
    estWait: "Estimated wait:",
    btnConfirm: "Confirm",
    btnCancel: "Cancel",
    modalAddTitle: "Add new customer",
    modalAddSub: "Add offline customer to queue",
    labelName: "Name (required)",
    labelPhoneOpt: "Phone (optional)",
    btnAddToQueue: "+ Add to queue",
    modalDelayTitle: "Delay queue",
    modalDelaySub: "1 time free, then 5,000 sum per delay. Maximum 3 spots.",
    slot: "spot",
    price: "5,000 sum",
    btnJoinQueue: "Join queue — free",
    queueLabel: "IN QUEUE",
    waitLabel: "WAIT",
    currentLabel: "CURRENT",
    queueList: "Queue list",
    reviews: "Reviews",
    leaveReview: "Leave a review",
    reviewPlaceholder: "Write your opinion about the service...",
    btnSubmitReview: "Submit review",
    btnGetQueue: "Get queue",
    viewMap: "View on map →",
    mapOpening: "Opening map...",
    adminDisplayBtn: "Screen",
    adminLangBtn: "Language",
    /* Toast messages */
    toastLoginWelcome: "✅ Welcome!",
    toastRegisterNameRequired: "❌ Enter first and last name",
    toastRegisterSuccess: "✅ Successfully registered!",
    toastDemoLogin: "⚡ Logged in as demo",
    toastLogout: "👋 Logged out",
    toastAdminSelectPlace: "❌ Select a center first",
    toastAdminCredInvalid: "❌ Invalid login or password",
    toastAdminLoginSuccess: "Welcome!",
    toastAdminLogout: "Logged out from admin panel",
    toastReviewRatingRequired: "❌ Please give a star rating first",
    toastReviewTextRequired: "❌ Write a review text",
    toastMustLogin: "❌ You must log in first",
    toastReviewSubmitted: "✅ Your review has been submitted!",
    toastPlaceClosed: "❌ This place is currently closed",
    toastQueueAlreadyActive: "❌ You already have an active queue",
    toastJoinQueueSuccess: "Joined queue! Your number",
    toastDelayFree: "Delayed for free",
    toastDelayPaid: "Paid 5,000 sum",
    toastLeaveQueue: "Left the queue",
    toastAdminNext: "Next",
    toastAllServed: "✅ All customers have been served!",
    toastNameRequired: "❌ Enter a name",
    toastCustomerAdded: "added to queue",
    toastQueueCleared: "🔄 Queue cleared",
    confirmClearQueue: "Confirm clearing today's queue?",
    adminNoOne: "No one",
    adminQueueEnded: "Queue ended",
    adminNextLabel: "Next",
    emptyQueue: "Queue empty",
    statusCurrent: "Now",
    statusOnline: "Online",
    statusOffline: "Offline",
    statusOpen: "Open",
    statusClosed: "Closed",
    statusBusy: "Very busy",
    statusModerate: "Moderate",
    statusQuiet: "Quiet",
    dateNow: "Now",
    waitApprox: "Estimated wait",
    minutesFull: "minutes",
    minutesShort: "min",
    waiting: "Waiting...",
    navPlatform: "Queue platform",
    categoryBarber: "Barber shop",
    categoryClinic: "Clinic",
    categoryBank: "Bank",
    categoryCarwash: "Car wash",
    categoryGov: "Government office",
    themeDayMode: "Day mode ›",
    themeNightMode: "Night mode ›",
    themeSwitchToDay: "Switch to day mode",
    themeSwitchToNight: "Switch to night mode",
    themeTitle: "Day/Night mode",
    titleBack: "Back",
    myQueueYour: "Your queue",
    myQueueStatus: "STATUS",
    myQueueInQueue: "In queue",
    myQueueAhead: "AHEAD OF YOU",
    myQueueWaitLabel: "WAIT",
    myQueueDelay: "⏱ Delay",
    myQueueLeave: "Leave queue",
    myQueueNoActive: "No active queue",
    myQueueFind: "Find a service and join a queue",
    myQueueSearchBtn: "Find service →",
    liveBadge: "Live",
    yourNum: "QUEUE",
    detailYou: "You",
    detailDone: "Done",
    detailEmptyReviews: "No reviews yet",
    detailReviewsMore: "more",
    detailRating: "Rating",
    detailQueue: "Queue",
    detailQueueCount: "people",
    detailAddress: "Address",
    detailHours: "Hours",
    detailCategory: "Category",
    peopleWord: "people",
    phonePlaceholder: "+998 90 123 45 67",
    passPlaceholder: "••••••••",
    firstNamePlaceholder: "Ali",
    lastNamePlaceholder: "Valiyev",
    minCharsPlaceholder: "At least 6 characters",
    loginInputPlaceholder: "enter login",
    passInputPlaceholder: "enter password",
    walkinNamePlaceholder: "Customer name",
    walkinPhonePlaceholder: "+998 ...",
    appFooter: "Tashkent, Uzbekistan",
    emptyCategory: "No places in this category",
    emptyNoResults: "No results found",
    emptySearchOther: "Try a different keyword",
    hourUnit: "h",
    enabledArrow: "Enabled ›"
  }
};

/* =====================================================
   TIL O'ZGARTIRISH MANTIQI
   =====================================================
   setLang(langCode) — ilovaning barcha UI matnlarini
   berilgan til kodiga qarab yangilaydi.

   Qo'llab-quvvatlanadigan til kodlari:
   "uz-latn" | "uz-cyrl" | "ru" | "en"
   ===================================================== */
function setLang(langCode) {
  STATE.lang = langCode;
  const t = I18N[langCode];

  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const setPlaceholder = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  };

  // Splash screen
  setText("ui-splash-sub", t.splashSub);
  setText("ui-splash-role-label", t.roleLabel);
  setHTML("ui-prof-lang", t.profLang);
  setHTML("lang-status-label", t.langName);

  // Nav label larini barcha ekranlarda yangilash
  document.querySelectorAll(".bottomnav .nav-tab:nth-child(1) .nav-label").forEach(el => el.textContent = t.navHome);
  document.querySelectorAll(".bottomnav .nav-tab:nth-child(2) .nav-label").forEach(el => el.textContent = t.navSearch);
  document.querySelectorAll(".bottomnav .nav-tab:nth-child(3) .nav-label").forEach(el => el.textContent = t.navQueue);
  document.querySelectorAll(".bottomnav .nav-tab:nth-child(4) .nav-label").forEach(el => el.textContent = t.navProfile);

  // Role buttons
  const pCust = document.querySelector("#role-toggle .role-btn:first-child");
  if (pCust) pCust.innerHTML = t.splashBtnCustomer;
  const pAdm = document.querySelector("#role-toggle .role-btn:last-child");
  if (pAdm) pAdm.innerHTML = t.splashBtnAdmin;

  // Splash tugmalari (ID orqali)
  setText("ui-btn-login", t.btnLogin);
  setText("ui-btn-demo-text", t.btnDemoText);

  // Profile ekran sozlamalar
  setText("ui-notifications", t.notifications);
  setText("ui-dark-mode", t.darkMode);
  setText("ui-payment-method", t.paymentMethod);
  setText("ui-configure", t.configure);

  // Login screen
  setText("ui-login-title", t.loginTitle);
  setText("ui-login-sub", t.loginSub);
  setText("ui-tab-login", t.tabLogin);
  setText("ui-tab-register", t.tabRegister);
  setText("ui-label-phone", t.labelPhone);
  setText("ui-label-pass", t.labelPass);
  setText("ui-label-firstname", t.labelFirstname);
  setText("ui-label-lastname", t.labelLastname);
  setText("ui-reg-label-phone", t.labelPhone);
  setText("ui-reg-label-pass", t.labelPass);
  setText("ui-btn-login", t.btnLoginSubmit);
  setText("ui-btn-register", t.btnRegisterSubmit);
  setText("login-screen-title", t.tabLogin);

  // Admin login screen
  setText("ui-admin-login-title", t.adminLoginTitle);
  setText("ui-admin-login-sub", t.adminLoginSub);
  setText("ui-section-place", t.sectionPlace);
  setText("ui-selected-place-label", t.selectedPlace);
  setText("ui-label-admin-login", t.labelLogin);
  setText("ui-label-admin-pass", t.labelPass);
  setText("ui-btn-admin-login", t.btnAdminLogin);

  // Home screen
  setText("ui-hero-greeting", t.heroGreeting);
  setText("ui-hero-no-queue", t.heroNoQueue);
  setText("ui-section-cats", t.sectionCats);
  setText("ui-section-nearby", t.sectionNearby);

  // Kategoriya chips
  const homeChips = document.querySelectorAll("#home-chips .chip");
  if (homeChips.length >= 6) {
    homeChips[0].textContent = t.catAll;
    homeChips[1].innerHTML = `<i class="ph-fill ph-scissors"></i> ${t.catBarber}`;
    homeChips[2].innerHTML = `<i class="ph-fill ph-hospital"></i> ${t.catClinic}`;
    homeChips[3].innerHTML = `<i class="ph-fill ph-bank"></i> ${t.catBank}`;
    homeChips[4].innerHTML = `<i class="ph-fill ph-car"></i> ${t.catCarwash}`;
    homeChips[5].innerHTML = `<i class="ph-fill ph-buildings"></i> ${t.catGov}`;
  }

  const marketChips = document.querySelectorAll("#market-chips .chip");
  if (marketChips.length >= 6) {
    marketChips[0].textContent = t.catAll;
    marketChips[1].innerHTML = `<i class="ph-fill ph-scissors"></i> ${t.catBarber}`;
    marketChips[2].innerHTML = `<i class="ph-fill ph-hospital"></i> ${t.catClinic}`;
    marketChips[3].innerHTML = `<i class="ph-fill ph-bank"></i> ${t.catBank}`;
    marketChips[4].innerHTML = `<i class="ph-fill ph-car"></i> ${t.catCarwash}`;
    marketChips[5].innerHTML = `<i class="ph-fill ph-buildings"></i> ${t.catGov}`;
  }

  // Market screen
  setText("ui-services", t.services);
  setPlaceholder("search-inp", t.searchPlaceholder);

  // Profile screen
  setText("ui-profile", t.profile);
  setText("ui-stat-total", t.statTotal);
  setText("ui-stat-saved", t.statSaved);
  setText("ui-settings", t.settings);
  setText("ui-logout", t.logout);

  // Admin panel
  setText("ui-admin-cur-label", t.adminCurLabel);
  setText("ui-admin-cur-name", t.adminCurName);
  setText("ui-admin-cur-next", t.adminCurNext);
  setText("ui-btn-next", t.btnNext);
  setText("ui-btn-add", t.btnAdd);
  setText("ui-stat-today", t.statToday);
  setText("ui-stat-waiting", t.statWaiting);
  setText("ui-queue", t.queue);
  setText("ui-btn-clear", t.btnClear);
  setText("ui-hourly-analysis", t.hourlyAnalysis);
  setText("ui-btn-admin-logout", t.btnAdminLogout);

  // Admin panel tugmalari (ID orqali)
  setText("ui-admin-display-btn", t.adminDisplayBtn);
  setText("ui-admin-lang-btn", t.adminLangBtn);

  // Display screen
  setText("ui-disp-label", t.dispLabel);
  setText("ui-disp-name", t.dispName);
  setText("ui-disp-place", t.dispPlace);
  setText("ui-disp-next", t.dispNext);
  setText("ui-btn-back", t.btnBack);

  // My queue screen
  setText("ui-myqueue", t.myQueue);

  // Modal tarjimalari
  setText("ui-lang-title", t.langTitle);
  setText("ui-lang-cancel", t.langCancel);
  setText("ui-modal-join-title", t.modalJoinTitle);
  setText("ui-modal-join-sub", t.modalJoinSub);
  setText("ui-your-number", t.yourNumber);
  setText("ui-free", t.free);
  setText("ui-est-wait", t.estWait);
  setText("ui-btn-confirm", t.btnConfirm);
  setText("ui-btn-cancel-join", t.btnCancel);
  setText("ui-modal-add-title", t.modalAddTitle);
  setText("ui-modal-add-sub", t.modalAddSub);
  setText("ui-label-name", t.labelName);
  setText("ui-label-phone-opt", t.labelPhoneOpt);
  setText("ui-btn-add-to-queue", t.btnAddToQueue);
  setText("ui-btn-cancel-add", t.btnCancel);
  setText("ui-modal-delay-title", t.modalDelayTitle);
  setText("ui-modal-delay-sub", t.modalDelaySub);
  setText("ui-slot", t.slot);
  setText("ui-price", t.price);
  setText("ui-btn-cancel-delay", t.btnCancel);

  // Delay modal slot/price class lari
  document.querySelectorAll(".delay-slot").forEach((el) => (el.textContent = t.slot));
  document.querySelectorAll(".delay-price").forEach((el) => (el.textContent = t.price));
  setText("ui-delay-free-1", t.free);

  // Detail screen
  setText("ui-btn-get-queue", t.btnGetQueue);
  setText("ui-live-queue-status", t.activeQueue + " " + t.live);
  setText("ui-live", t.live);
  setText("ui-queue-label", t.queueLabel);
  setText("ui-wait-label", t.waitLabel);
  setText("ui-current-label", t.currentLabel);
  setText("ui-queue-list", t.queueList);
  setText("ui-reviews", t.reviews);
  setText("ui-leave-review", t.leaveReview);
  setText("ui-btn-submit-review", t.btnSubmitReview);
  setText("ui-btn-join-queue", t.btnJoinQueue);
  setText("ui-view-map", t.viewMap);

  // Input placeholders (real IDs from index.html)
  setPlaceholder("inp-phone", t.phonePlaceholder);
  setPlaceholder("inp-pass", t.passPlaceholder);
  setPlaceholder("inp-firstname", t.firstNamePlaceholder);
  setPlaceholder("inp-lastname", t.lastNamePlaceholder);
  setPlaceholder("inp-regphone", t.phonePlaceholder);
  setPlaceholder("inp-regpass", t.minCharsPlaceholder);
  setPlaceholder("admin-login-inp", t.loginInputPlaceholder);
  setPlaceholder("admin-pass-inp", t.passInputPlaceholder);
  setPlaceholder("walkin-name", t.walkinNamePlaceholder);
  setPlaceholder("walkin-phone", t.walkinPhonePlaceholder);
  const reviewArea = document.getElementById("ui-review-placeholder");
  if (reviewArea) reviewArea.placeholder = t.reviewPlaceholder;

  // Title attributes
  const splashThemeBtn = document.getElementById("splash-theme-btn");
  if (splashThemeBtn) splashThemeBtn.title = t.themeTitle;

  // Footer / titles
  setText("ui-app-footer", t.appFooter);
  setText("ui-app-footer-2", t.appFooter);
  setText("ui-stat-saved-unit", t.hourUnit);
  setText("ui-enabled", t.enabledArrow);
  const homeBackBtn = document.getElementById("home-back-btn");
  if (homeBackBtn) homeBackBtn.title = t.titleBack;
  const themeTitleEl = document.getElementById("ui-theme-title");
  if (themeTitleEl) themeTitleEl.textContent = t.themeTitle;

  // Re-render dynamic lists so badges/labels update
  if (typeof renderHome === "function") try { renderHome(); } catch (e) {}
  if (typeof renderMarket === "function") try { renderMarket(); } catch (e) {}
  if (typeof renderMyQueue === "function") try { renderMyQueue(); } catch (e) {}
  if (typeof renderAdmin === "function" && STATE.adminPlace) try { renderAdmin(); } catch (e) {}
  if (typeof renderAdminPlaceList === "function") try { renderAdminPlaceList(); } catch (e) {}
  if (typeof updateThemeButtons === "function") try { updateThemeButtons(); } catch (e) {}
  if (typeof toggleTheme === "function") {
    const themeLabel = document.getElementById("theme-status-label");
    if (themeLabel) themeLabel.textContent = STATE.isDark ? t.themeNightMode : t.themeDayMode;
  }

  closeModal("modal-lang");

  const toastMsgs = {
    "uz-latn": "Til o'zgartirildi",
    "uz-cyrl": "Тил ўзгартирилди",
    "ru": "Язык изменен",
    "en": "Language changed",
  };
  showToast("✅ " + toastMsgs[langCode]);
}
