/*
  =====================================================
  JS TUZILMASI:
  1. ADMINS    — Admin login/parol ro'yxati (har markaz uchun)
  2. PLACES    — Barcha xizmat joylari (lokatsiya bilan)
  3. STATE     — Ilovaning joriy holati
  4. Funksiyalar:
     - Navigatsiya (showScreen, goBack)
     - Auth (doLogin, doRegister, doAdminLogin)
     - Render (renderHome, renderMarket, renderDetail...)
     - Admin (adminNext, addWalkIn, confirmReset)
     - Boshqalar (toggleTheme, showToast...)
  =====================================================
*/

/* =====================================================
   1. ADMIN LOGIN/PAROL RO'YXATI
   Har bir markaz uchun alohida login va parol
   
   Yangi admin qo'shish uchun quyidagicha yozing:
   {
     placeId: <xizmat joyi ID raqami>,
     login: 'admin5',
     parol: 'parol5'
   }
   ===================================================== */
const ADMINS = [
  { placeId: 1, login: "admin1", parol: "parol1" } /* Baraka Sartaroshxona */,
  { placeId: 2, login: "admin2", parol: "parol2" } /* Shifa Klinikasi */,
  { placeId: 3, login: "admin3", parol: "parol3" } /* Kapitalbank */,
  { placeId: 4, login: "admin4", parol: "parol4" } /* SpeedWash */,
  { placeId: 5, login: "admin5", parol: "parol5" } /* FUOAV */,
  { placeId: 6, login: "admin6", parol: "parol6" } /* Nur Sartaroshxona */,
];

/* =====================================================
   2. XIZMAT JOYLARI MA'LUMOTLARI (PLACES)
   
   Har bir joy ob'ekti quyidagi maydonlarga ega:
   - id         : Noyob raqam
   - name       : Joy nomi
   - cat        : Kategoriya (barber/clinic/bank/carwash/gov)
   - icon       : Emoji belgisi
   - location   : Lokatsiya ma'lumotlari (yangi!)
     - city     : Shahar
     - district : Tuman
     - address  : To'liq manzil
     - coords   : Kenglik va uzunlik (karta uchun)
   - rating     : Reyting (1-5)
   - reviewCount: Sharhlar soni
   - hours      : Ish vaqti
   - queueCount : Hozirgi navbat odamlari soni
   - waitMin    : O'rtacha kutish (daqiqa)
   - currentNum : Hozirgi xizmatdagi raqam
   - isOpen     : Ochiqmi/yopiqmi
   - isFeatured : Top (reklamali) joylarmi
   - queue      : Navbat ro'yxati (nom, tur, holat)
   - reviews    : Sharhlar ro'yxati
   - hourlyData : Soatlik band bo'lish tahlili
   ===================================================== */
const PLACES = [
  {
    id: 1,
    name: "Baraka Sartaroshxona",
    cat: "barber",
    icon: `<i class="ph-fill ph-scissors"></i>`,
    location: {
      city: "Toshkent",
      district: "Chilonzor tumani",
      address: "Bunyodkor ko'chasi, 14-uy, 1-qavat",
      coords: { lat: 41.2646, lng: 69.2163 },
    },
    rating: 4.8,
    reviewCount: 124,
    hours: "9:00 – 21:00",
    queueCount: 8,
    waitMin: 16,
    currentNum: 3,
    isOpen: true,
    isFeatured: true,
    queue: [
      {
        num: 1,
        name: "Jasur Abdullayev",
        type: "online",
        done: true,
        current: false,
      },
      {
        num: 2,
        name: "Malika Rahimova",
        type: "offline",
        done: true,
        current: false,
      },
      {
        num: 3,
        name: "Sardor Toshmatov",
        type: "online",
        done: false,
        current: true,
      },
      {
        num: 4,
        name: "Dilnoza Yusupova",
        type: "offline",
        done: false,
        current: false,
      },
      {
        num: 5,
        name: "Bobur Nazarov",
        type: "online",
        done: false,
        current: false,
      },
      {
        num: 6,
        name: "Zulfiya Mirzayeva",
        type: "online",
        done: false,
        current: false,
      },
      {
        num: 7,
        name: "Hamza Qodirov",
        type: "offline",
        done: false,
        current: false,
      },
      {
        num: 8,
        name: "Nargiza Hasanova",
        type: "online",
        done: false,
        current: false,
      },
    ],
    reviews: [
      {
        name: "Alisher B.",
        date: "2 kun oldin",
        rating: 5,
        text: "Juda tez va sifatli xizmat! Navbat kuzatish ilovasi juda qulay, qayta kelaman.",
      },
      {
        name: "Dilorom X.",
        date: "1 hafta oldin",
        rating: 4,
        text: "Yaxshi joylashgan, ustalar professional. Gohida kichik kechikish bo'ladi.",
      },
      {
        name: "Sardor T.",
        date: "2 hafta oldin",
        rating: 5,
        text: "Chilonzordagi eng yaxshi sartarosh! Navbat tizimi hayotimni osonlashtirdi.",
      },
    ],
    hourlyData: [1, 3, 6, 10, 14, 12, 11, 18, 15, 9, 5, 2],
  },
  {
    id: 2,
    name: "Shifa Klinikasi",
    cat: "clinic",
    icon: `<i class="ph-fill ph-hospital"></i>`,
    location: {
      city: "Toshkent",
      district: "Yunusobod tumani",
      address: "Amir Temur ko'chasi, 87-uy, 2-qavat",
      coords: { lat: 41.3456, lng: 69.3021 },
    },
    rating: 4.6,
    reviewCount: 89,
    hours: "8:00 – 20:00",
    queueCount: 12,
    waitMin: 25,
    currentNum: 7,
    isOpen: true,
    isFeatured: false,
    queue: [
      {
        num: 7,
        name: "Hamza Qodirov",
        type: "online",
        done: false,
        current: true,
      },
      {
        num: 8,
        name: "Nargiza H.",
        type: "offline",
        done: false,
        current: false,
      },
      {
        num: 9,
        name: "Botir Karimov",
        type: "online",
        done: false,
        current: false,
      },
      {
        num: 10,
        name: "Gavhar Sobirov",
        type: "online",
        done: false,
        current: false,
      },
    ],
    reviews: [
      {
        name: "Kamola M.",
        date: "3 kun oldin",
        rating: 5,
        text: "Shifokorlar juda professional va e'tiborli. Navbat tizimi zo'r ishlaydi.",
      },
      {
        name: "Farhodjon T.",
        date: "1 hafta oldin",
        rating: 4,
        text: "Oldin soatlab kutardik, endi ilovadan navbat olamiz. Juda qulay!",
      },
    ],
    hourlyData: [3, 8, 12, 15, 18, 16, 14, 20, 17, 12, 8, 4],
  },
  {
    id: 3,
    name: "Kapitalbank — Chilonzor",
    cat: "bank",
    icon: `<i class="ph-fill ph-bank"></i>`,
    location: {
      city: "Toshkent",
      district: "Chilonzor tumani",
      address: "Chilonzor ko'chasi, 1-uy (metro yonida)",
      coords: { lat: 41.2589, lng: 69.1989 },
    },
    rating: 4.3,
    reviewCount: 201,
    hours: "9:00 – 18:00",
    queueCount: 5,
    waitMin: 10,
    currentNum: 14,
    isOpen: true,
    isFeatured: false,
    queue: [
      {
        num: 14,
        name: "Rustam Aliyev",
        type: "online",
        done: false,
        current: true,
      },
      {
        num: 15,
        name: "Muhabbat X.",
        type: "offline",
        done: false,
        current: false,
      },
      {
        num: 16,
        name: "Akbar Sobirov",
        type: "online",
        done: false,
        current: false,
      },
    ],
    reviews: [
      {
        name: "Otabek N.",
        date: "1 kun oldin",
        rating: 4,
        text: "Tez xizmat, navbat ilovasi qulay. Bank uchun ajoyib yechim.",
      },
      {
        name: "Lola K.",
        date: "5 kun oldin",
        rating: 3,
        text: "Ba'zi muammolar bor lekin umuman yaxshi.",
      },
    ],
    hourlyData: [0, 2, 5, 8, 12, 10, 9, 14, 11, 7, 3, 0],
  },
  {
    id: 4,
    name: "SpeedWash Avtomoyka",
    cat: "carwash",
    icon: `<i class="ph-fill ph-car"></i>`,
    location: {
      city: "Toshkent",
      district: "Sergeli tumani",
      address: "Sergeli ko'chasi, 45-uy (katta yo'l bo'yida)",
      coords: { lat: 41.2104, lng: 69.2456 },
    },
    rating: 4.7,
    reviewCount: 67,
    hours: "8:00 – 22:00",
    queueCount: 3,
    waitMin: 9,
    currentNum: 11,
    isOpen: true,
    isFeatured: false,
    queue: [
      {
        num: 11,
        name: "Sanjar Pulatov",
        type: "online",
        done: false,
        current: true,
      },
      {
        num: 12,
        name: "Laylo Hasanova",
        type: "offline",
        done: false,
        current: false,
      },
      {
        num: 13,
        name: "Behruz Qodirov",
        type: "online",
        done: false,
        current: false,
      },
    ],
    reviews: [
      {
        name: "Timur V.",
        date: "5 kun oldin",
        rating: 5,
        text: "Juda tez va sifatli! Mashina brilliantdek yaltiradi.",
      },
      {
        name: "Aziza R.",
        date: "1 hafta oldin",
        rating: 5,
        text: "Navbat olish juda oson, kutish ham qisqa.",
      },
    ],
    hourlyData: [0, 1, 3, 6, 8, 10, 12, 15, 13, 10, 7, 3],
  },
  {
    id: 5,
    name: "FUOAV — Pasport bo'limi",
    cat: "gov",
    icon: `<i class="ph-fill ph-bank"></i>`,
    location: {
      city: "Toshkent",
      district: "Mirzo Ulug'bek tumani",
      address: "Ko'k-Saroy ko'chasi, 7-uy (tumansheriklik binosi)",
      coords: { lat: 41.3112, lng: 69.3289 },
    },
    rating: 3.9,
    reviewCount: 312,
    hours: "9:00 – 17:00",
    queueCount: 20,
    waitMin: 45,
    currentNum: 88,
    isOpen: true,
    isFeatured: false,
    queue: [
      {
        num: 88,
        name: "Gavhar Sobirov",
        type: "online",
        done: false,
        current: true,
      },
      {
        num: 89,
        name: "Aziz Rahimov",
        type: "offline",
        done: false,
        current: false,
      },
      {
        num: 90,
        name: "Dilshod Nazarov",
        type: "online",
        done: false,
        current: false,
      },
    ],
    reviews: [
      {
        name: "Doniyor B.",
        date: "3 kun oldin",
        rating: 3,
        text: "Ko'p odam bo'ladi, lekin navbat tizimi yaxshi yordam beradi. Oldindan navbat olib keling!",
      },
      {
        name: "Maftuna O.",
        date: "1 hafta oldin",
        rating: 4,
        text: "Ilova orqali navbat olgandan so'ng juda qulay bo'ldi.",
      },
    ],
    hourlyData: [0, 4, 10, 18, 22, 20, 18, 25, 20, 14, 8, 2],
  },
  {
    id: 6,
    name: "Nur Sartaroshxona",
    cat: "barber",
    icon: `<i class="ph-fill ph-scissors"></i>`,
    location: {
      city: "Toshkent",
      district: "Mirzo Ulug'bek tumani",
      address: "Durmon yo'li ko'chasi, 23-uy, 1-qavat",
      coords: { lat: 41.3234, lng: 69.3156 },
    },
    rating: 4.5,
    reviewCount: 45,
    hours: "9:00 – 20:00",
    queueCount: 2,
    waitMin: 4,
    currentNum: 5,
    isOpen: false /* Bugun yopiq */,
    isFeatured: false,
    queue: [],
    reviews: [
      {
        name: "Jasur K.",
        date: "2 kun oldin",
        rating: 5,
        text: "Yaxshi sartarosh, narxlar qulay.",
      },
    ],
    hourlyData: [0, 2, 4, 7, 9, 8, 7, 11, 9, 6, 3, 0],
  },
];

/* =====================================================
   3. TILLAR VA TARJIMALAR — i18n.js ga ko'chirildi
   I18N obyekti va setLang() funksiyasi i18n.js da
   ===================================================== */

/* =====================================================
   3.1 ILOVA HOLATI (Application State)
   ===================================================== */
const STATE = {
  role: "customer" /* 'customer' yoki 'admin' */,
  user: null /* Kirgan foydalanuvchi ma'lumotlari */,
  adminPlace: null /* Admin boshqarayotgan joy */,
  adminQueue: [] /* Admin navbat ro'yxati */,
  adminNextNum: 1 /* Keyingi offline raqam */,
  currentPlace: null /* Hozir ko'rilayotgan joy */,
  myQueue: null /* Mijozning faol navbati */,
  delaysUsed: 0 /* Necha marta kechiktirgan */,
  selectedRating: 0 /* Yulduz baholash */,
  screenHistory: ["screen-splash"] /* Navigatsiya tarixi */,
  isDark: false /* Tun rejimimi */,
  homeFilter: "all" /* Bosh sahifa filtri */,
  marketFilter: "all" /* Bozor sahifa filtri */,
  selectedAdminPlaceId: null /* Admin login: tanlangan joy ID */,
  lang: "uz-latn" /* Tanlangan til */
};

/* Tarjima helperi — I18N[STATE.lang] dan kalit bo'yicha matn oladi */
function t(key, fallback) {
  const dict = (typeof I18N !== "undefined" && I18N[STATE.lang]) || {};
  return dict[key] !== undefined ? dict[key] : (fallback !== undefined ? fallback : key);
}

/* =====================================================
   4. NAVIGATSIYA FUNKSIYALARI
   ===================================================== */

/* Ekranni ko'rsatish va tarix saqlash */
function showScreen(id) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach((s) => s.classList.remove("active"));

  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add("active");

  /* Tarixga qo'shish (agar takrorlanmasa) */
  if (STATE.screenHistory[STATE.screenHistory.length - 1] !== id) {
    STATE.screenHistory.push(id);
  }

  /* Har ekran uchun render */
  if (id === "screen-home") renderHome();
  if (id === "screen-market") renderMarket();
  if (id === "screen-myqueue") renderMyQueue();
  if (id === "screen-admin") renderAdmin();
  if (id === "screen-display") updateDisplay();
  if (id === "screen-admin-login") renderAdminPlaceList();

  updateThemeButtons();
}

/* Orqaga qaytish */
function goBack() {
  if (STATE.screenHistory.length > 1) {
    STATE.screenHistory.pop();
    const prev = STATE.screenHistory[STATE.screenHistory.length - 1];
    /* showScreen orqali chaqiramiz — nav va render avtomatik yangilanadi */
    STATE.screenHistory.pop(); /* showScreen qayta push qilmasligi uchun */
    showScreen(prev);
  } else {
    showScreen("screen-splash");
  }
}

/* =====================================================
   5. AUTH FUNKSIYALARI (Kirish va Ro'yxat)
   ===================================================== */

/* Rol tanlash: 'customer' yoki 'admin' */
function selectRole(role, btn) {
  STATE.role = role;
  document
    .querySelectorAll(".role-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

/* Kirish sahifasiga o'tish */
function goToLogin() {
  if (STATE.role === "admin") {
    showScreen("screen-admin-login");
  } else {
    showScreen("screen-login");
  }
}

/* Auth tablarni almashtirish */
function switchAuthTab(tab) {
  document.querySelectorAll(".auth-tab").forEach((t, i) => {
    t.classList.toggle(
      "active",
      (tab === "login" && i === 0) || (tab === "register" && i === 1),
    );
  });
  document.getElementById("form-login").style.display =
    tab === "login" ? "block" : "none";
  document.getElementById("form-register").style.display =
    tab === "register" ? "block" : "none";
}

/* Mijoz kirishi */
function doLogin() {
  const phone =
    document.getElementById("inp-phone").value || "+998 90 123 45 67";
  STATE.user = { first: "Ali", last: "Valiyev", phone, isAdmin: false };
  updateUserUI();
  showScreen("screen-home");
  showToast(t("toastLoginWelcome"));
}

/* Mijoz ro'yxatdan o'tishi */
function doRegister() {
  const first = document.getElementById("inp-firstname").value.trim();
  const last = document.getElementById("inp-lastname").value.trim();
  const phone = document.getElementById("inp-regphone").value.trim();

  if (!first || !last) {
    showToast(t("toastRegisterNameRequired"));
    return;
  }

  STATE.user = {
    first,
    last,
    phone: phone || "+998 90 123 45 67",
    isAdmin: false,
  };
  updateUserUI();
  showScreen("screen-home");
  showToast(t("toastRegisterSuccess"));
}

/* Demo kirish — rol bo'yicha */
function demoLogin() {
  if (STATE.role === "admin") {
    /* Admin demo: birinchi markazni avtomatik tanlaydi */
    loginAsAdmin(1);
  } else {
    STATE.user = {
      first: "Ali",
      last: "Valiyev",
      phone: "+998 90 123 45 67",
      isAdmin: false,
    };
    STATE.myQueue = null;
    updateUserUI();
    showScreen("screen-home");
    showToast(t("toastDemoLogin"));
  }
}

/* Foydalanuvchi interfeysini yangilash */
function updateUserUI() {
  if (!STATE.user) return;
  const full = `${STATE.user.first} ${STATE.user.last}`;
  const initials = (STATE.user.first[0] || "") + (STATE.user.last[0] || "");

  const heroUser = document.getElementById("hero-username");
  if (heroUser) heroUser.textContent = full + " 👋";

  const profName = document.getElementById("profile-fullname");
  if (profName) profName.textContent = full;

  const profPhone = document.getElementById("profile-phone-show");
  if (profPhone) profPhone.textContent = STATE.user.phone;

  const profAvatar = document.getElementById("profile-avatar");
  if (profAvatar) profAvatar.textContent = initials.toUpperCase();

  /* Faol navbat ko'rsatish */
  if (STATE.myQueue) {
    const activeCard = document.getElementById("hero-active-queue");
    const noQueue = document.getElementById("hero-no-queue");
    if (activeCard) {
      activeCard.style.display = "block";
    }
    if (noQueue) {
      noQueue.style.display = "none";
    }
    const qPlace = document.getElementById("hero-q-place");
    const qNum = document.getElementById("hero-q-num");
    const qWait = document.getElementById("hero-q-wait");
    if (qPlace) qPlace.textContent = STATE.myQueue.placeName;
    if (qNum) qNum.textContent = STATE.myQueue.num;
    if (qWait) qWait.textContent = `~${STATE.myQueue.waitMin} ${t("minutesFull")}`;
  }
}

/* Chiqish */
function logoutUser() {
  STATE.user = null;
  STATE.myQueue = null;
  showScreen("screen-splash");
  showToast(t("toastLogout"));
}

/* =====================================================
   6. ADMIN AUTH FUNKSIYALARI
   ===================================================== */

/* Admin login sahifasida markaz ro'yxatini render qilish */
function renderAdminPlaceList() {
  const container = document.getElementById("admin-place-list");
  if (!container) return;

  container.innerHTML = PLACES.map(
    (p) => `
    <div class="admin-card" id="admin-place-card-${p.id}"
         onclick="selectAdminPlace(${p.id})">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:28px">${p.icon}</span>
        <div>
          <p class="admin-card-name">${p.name}</p>
          <p class="admin-card-addr"><i class="ph-fill ph-map-pin"></i> ${p.location.district}, ${p.location.city}</p>
          <p class="admin-card-addr" style="margin-top:2px">${t("labelLogin")}: <strong>admin${p.id}</strong> / ${t("labelPass")}: <strong>parol${p.id}</strong></p>
        </div>
      </div>
    </div>
  `,
  ).join("");
}

/* Markaz tanlaganda */
function selectAdminPlace(placeId) {
  STATE.selectedAdminPlaceId = placeId;

  /* Barcha kartalardan 'selected' klassini olib tashlash */
  document
    .querySelectorAll(".admin-card")
    .forEach((c) => c.classList.remove("selected"));
  const selected = document.getElementById(`admin-place-card-${placeId}`);
  if (selected) selected.classList.add("selected");

  /* Login ma'lumotlari formani ko'rsatish */
  const form = document.getElementById("admin-creds-form");
  if (form) {
    form.style.display = "block";
    document.getElementById("selected-place-name").textContent =
      PLACES.find((p) => p.id === placeId)?.name || "—";
    document.getElementById("admin-login-inp").value = "";
    document.getElementById("admin-pass-inp").value = "";
    
    // Formaga scroll qilish
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/* Admin login tekshiruvi */
function doAdminLogin() {
  const placeId = STATE.selectedAdminPlaceId;
  if (!placeId) {
    showToast(t("toastAdminSelectPlace"));
    return;
  }

  const loginVal = document.getElementById("admin-login-inp").value.trim();
  const passVal = document.getElementById("admin-pass-inp").value.trim();

  /* ADMINS ro'yxatida tekshirish */
  const cred = ADMINS.find(
    (a) => a.placeId === placeId && a.login === loginVal && a.parol === passVal,
  );

  if (!cred) {
    showToast(t("toastAdminCredInvalid"));
    return;
  }

  loginAsAdmin(placeId);
}

/* Admin sifatida kirish */
function loginAsAdmin(placeId) {
  const place = PLACES.find((p) => p.id === placeId);
  if (!place) return;

  STATE.adminPlace = place;
  /* Admin uchun navbat nusxasi (o'zgartirish uchun) */
  STATE.adminQueue = place.queue.map((q) => ({ ...q }));
  
  // Hozirgi xizmatdagi mijozni to'g'ri aniqlash
  // Avval barcha current flaglarni olib tashlaymiz
  STATE.adminQueue.forEach(q => q.current = false);
  
  // currentNum ga mos keladigan mijozni current: true qilamiz
  const currentPerson = STATE.adminQueue.find(q => q.num === place.currentNum && !q.done);
  if (currentPerson) {
    currentPerson.current = true;
  }
  
  const qNums = place.queue.map((q) => q.num);
  STATE.adminNextNum = (qNums.length > 0 ? Math.max(...qNums) : 0) + 1;

  document.getElementById("admin-panel-title").textContent = place.name;

  showScreen("screen-admin");
  showToast(`<i class="ph-bold ph-check"></i> ${place.name} — ${t("toastAdminLoginSuccess")}`);
}

/* Admin paneldan chiqish */
function adminLogout() {
  STATE.adminPlace = null;
  STATE.adminQueue = [];
  showScreen("screen-splash");
  showToast(t("toastAdminLogout"));
}

/* =====================================================
   7. JOY KARTASINI RENDER QILISH
   ===================================================== */
function renderPlaceCard(place, onclick) {
  const busy =
    place.queueCount > 10
      ? "badge-red"
      : place.queueCount > 5
        ? "badge-amber"
        : "badge-green";
  const busyText =
    place.queueCount > 10
      ? t("statusBusy")
      : place.queueCount > 5
        ? t("statusModerate")
        : t("statusQuiet");

  return `
    <div class="place-card" onclick="${onclick}">
      <div class="place-thumb cat-${place.cat}">
        <span>${place.icon}</span>
        ${place.isFeatured ? `<span class="badge badge-amber place-thumb-badge"><i class="ph-fill ph-star"></i> Top</span>` : ""}
        ${!place.isOpen ? `<span class="badge badge-red place-thumb-badge">${t("statusClosed")}</span>` : ""}
      </div>
      <div class="place-info">
        <p class="place-name">${place.name}</p>
        <p class="place-addr"><i class="ph-fill ph-map-pin"></i> ${place.location.district}, ${place.location.city}</p>
        <div class="place-meta">
          <span><i class="ph-fill ph-star"></i> ${place.rating}</span>
          <span>(${place.reviewCount} ${t("reviews").toLowerCase()})</span>
          ${
            place.isOpen
              ? `<span class="badge ${busy}">${busyText} · ${place.queueCount} ${t("peopleWord")}</span>`
              : `<span class="badge badge-gray">${t("statusClosed")}</span>`
          }
        </div>
      </div>
    </div>
  `;
}

/* =====================================================
   8. BOSH SAHIFA RENDER
   ===================================================== */
function renderHome() {
  updateUserUI();
  let filtered =
    STATE.homeFilter === "all"
      ? PLACES.slice(0, 4)
      : PLACES.filter((p) => p.cat === STATE.homeFilter).slice(0, 4);

  const container = document.getElementById("home-places-list");
  if (container) {
    container.innerHTML = filtered.length
      ? filtered.map((p) => renderPlaceCard(p, `openPlace(${p.id})`)).join("")
      : `<div class="empty-state"><div class="empty-icon"><i class="ph-fill ph-magnifying-glass"></i></div><div class="empty-title">${t("emptyCategory", "Bu kategoriyada joy yo'q")}</div></div>`;
  }
}

function filterHome(cat, el) {
  STATE.homeFilter = cat;
  document
    .querySelectorAll("#home-chips .chip")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  renderHome();
}

/* =====================================================
   9. BOZOR SAHIFASI RENDER
   ===================================================== */
function renderMarket() {
  const query = document.getElementById("search-inp")?.value || "";
  searchAndRenderMarket(query);
}

function filterMarket(cat, el) {
  STATE.marketFilter = cat;
  document
    .querySelectorAll("#market-chips .chip")
    .forEach((c) => c.classList.remove("active"));
  el.classList.add("active");
  renderMarket();
}

function searchAndRenderMarket(query) {
  let filtered = PLACES;
  if (STATE.marketFilter !== "all") {
    filtered = filtered.filter((p) => p.cat === STATE.marketFilter);
  }
  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.location.district.toLowerCase().includes(q) ||
        p.location.address.toLowerCase().includes(q),
    );
  }

  const container = document.getElementById("market-places-list");
  if (container) {
    container.innerHTML = filtered.length
      ? filtered.map((p) => renderPlaceCard(p, `openPlace(${p.id})`)).join("")
      : `<div class="empty-state"><div class="empty-icon"><i class="ph-fill ph-magnifying-glass"></i></div><div class="empty-title">${t("emptyNoResults", "Natija topilmadi")}</div><div class="empty-sub">${t("emptySearchOther", "Boshqa so'z bilan qidiring")}</div></div>`;
  }
}

/* =====================================================
   10. JOY BATAFSIL SAHIFA
   ===================================================== */
function openPlace(id) {
  const place = PLACES.find((p) => p.id === id);
  if (!place) return;
  STATE.currentPlace = place;
  STATE.selectedRating = 0;

  /* Ma'lumotlarni to'ldirish */
  document.getElementById("detail-topbar-title").textContent = place.name;
  document.getElementById("detail-name").textContent = place.name;
  document.getElementById("detail-category").textContent =
    `${place.icon} ${catName(place.cat)}`;
  document.getElementById("detail-rating").textContent =
    `<i class="ph-fill ph-star"></i> ${place.rating} (${place.reviewCount} ${t("reviews").toLowerCase()})`;
  document.getElementById("detail-hours").textContent = `<i class="ph-fill ph-clock"></i> ${place.hours}`;

  /* Holat nishoni */
  const badge = document.getElementById("detail-status-badge");
  badge.innerHTML = place.isOpen
    ? `<span class="badge badge-green">${t("statusOpen")}</span>`
    : `<span class="badge badge-red">${t("statusClosed")}</span>`;

  /* Rasm */
  const thumb = document.getElementById("detail-thumb");
  thumb.className = `place-thumb cat-${place.cat}`;
  thumb.style.height = "160px";
  thumb.style.borderRadius = "var(--r)";
  thumb.style.marginBottom = "14px";
  thumb.innerHTML = `<span style="font-size:68px">${place.icon}</span>`;

  /* Lokatsiya */
  document.getElementById("detail-loc-district").textContent =
    `${place.location.district}, ${place.location.city}`;
  document.getElementById("detail-loc-addr").textContent =
    place.location.address;

  /* Navbat holati */
  document.getElementById("detail-queue-badge").className =
    "badge " + (place.isOpen ? "badge-green" : "badge-red");
  document.getElementById("detail-queue-badge").textContent = place.isOpen
    ? t("statusOpen")
    : t("statusClosed");
  document.getElementById("detail-q-count").textContent = place.queueCount;
  document.getElementById("detail-q-wait").textContent = `${place.waitMin}${t("minutesShort")}`;
  document.getElementById("detail-q-current").textContent =
    `#${place.currentNum}`;

  /* Navbat ro'yxati */
  const qList = document.getElementById("detail-queue-list");
  if (place.queue.length === 0) {
    qList.innerHTML =
      `<p style="font-size:14px;color:var(--c-text3);text-align:center;padding:12px">${t("emptyQueue")}</p>`;
  } else {
    qList.innerHTML = place.queue
      .slice(0, 8)
      .map((q) => {
        let cls = "q-num";
        if (q.current) cls += " is-current";
        else if (q.done) cls += " is-done";
        /* Mijozning o'zimi? */
        const isMe =
          STATE.myQueue &&
          STATE.myQueue.placeId === id &&
          STATE.myQueue.num === q.num;
        if (isMe) cls = "q-num is-mine";

        return `
        <div class="q-row">
          <div class="${cls}">#${q.num}</div>
          <div class="q-name">${q.name}${isMe ? ` <span style="color:var(--c-info);font-size:11px;font-weight:700">(${t("detailYou")})</span>` : ""}</div>
          <div>
            ${q.current ? `<span class="badge badge-green">${t("statusCurrent")}</span>` : ""}
            ${q.done ? `<span style="font-size:12px;color:var(--c-text3)">✓</span>` : ""}
            ${!q.current && !q.done ? `<span class="badge ${q.type === "online" ? "badge-blue" : "badge-gray"}">${q.type === "online" ? t("statusOnline") : t("statusOffline")}</span>` : ""}
          </div>
        </div>
      `;
      })
      .join("");
  }

  /* Sharhlar ro'yxati */
  const rList = document.getElementById("detail-reviews-list");
  rList.innerHTML = place.reviews
    .map(
      (r) => `
    <div style="padding:12px 0;border-bottom:0.5px solid var(--c-border)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div class="avatar" style="width:32px;height:32px;font-size:11px">${r.name[0]}</div>
        <div>
          <p style="font-size:14px;font-weight:700">${r.name}</p>
          <p style="font-size:11px;color:var(--c-text3)">${r.date} · ${`<i class="ph-fill ph-star"></i>`.repeat(r.rating)}</p>
        </div>
      </div>
      <p style="font-size:14px;color:var(--c-text2);line-height:1.5">${escHtml(r.text)}</p>
    </div>
  `,
    )
    .join("");

  /* Yulduz inputni reset qilish */
  updateStarUI(0);

  showScreen("screen-detail");
}

/* Kategoriya nomini olish */
function catName(cat) {
  const map = {
    barber: "categoryBarber",
    clinic: "categoryClinic",
    bank: "categoryBank",
    carwash: "categoryCarwash",
    gov: "categoryGov",
  };
  return map[cat] ? t(map[cat]) : cat;
}

/* =====================================================
   11. YULDUZ BAHOLASH (Star Rating)
   ===================================================== */
function setRating(n) {
  STATE.selectedRating = n;
  updateStarUI(n);
}

function updateStarUI(n) {
  document.querySelectorAll("#star-input .star-btn").forEach((btn, i) => {
    btn.classList.toggle("active", i < n);
  });
}

/* Izoh yuborish */
function submitReview() {
  if (!STATE.selectedRating) {
    showToast(t("toastReviewRatingRequired"));
    return;
  }
  const text = document.getElementById("review-text-inp").value.trim();
  if (!text) {
    showToast(t("toastReviewTextRequired"));
    return;
  }
  if (!STATE.user) {
    showToast(t("toastMustLogin"));
    return;
  }

  /* Yangi izohni joyning sharhlar ro'yxatiga qo'shish */
  if (STATE.currentPlace) {
    STATE.currentPlace.reviews.unshift({
      name: `${STATE.user.first} ${STATE.user.last[0]}.`,
      date: t("dateNow"),
      rating: STATE.selectedRating,
      text: text,
    });
    STATE.currentPlace.reviewCount++;
  }

  document.getElementById("review-text-inp").value = "";
  setRating(0);
  showToast(t("toastReviewSubmitted"));
  openPlace(STATE.currentPlace.id); /* sahifani yangilash */
}

/* =====================================================
   12. NAVBATGA QO'SHILISH
   ===================================================== */
function openJoinModal() {
  if (!STATE.currentPlace) return;
  if (!STATE.user) {
    showToast(t("toastMustLogin"));
    showScreen("screen-login");
    return;
  }
  if (!STATE.currentPlace.isOpen) {
    showToast(t("toastPlaceClosed"));
    return;
  }
  if (STATE.myQueue) {
    showToast(t("toastQueueAlreadyActive"));
    return;
  }

  const p = STATE.currentPlace;
  const num = p.queueCount + 1;

  document.getElementById("modal-join-title").textContent = p.name;
  document.getElementById("modal-join-sub").textContent =
    `${p.location.district} · ~${p.waitMin + 2} ${t("minutesFull")} ${t("waiting").replace("...", "").toLowerCase()}`;
  document.getElementById("modal-join-num").textContent = `#${num}`;
  document.getElementById("modal-join-wait").textContent =
    `${t("waitApprox")}: ~${(p.queueCount + 1) * 2} ${t("minutesFull")}`;

  openModal("modal-join");
}

function confirmJoin() {
  const p = STATE.currentPlace;
  const num = p.queueCount + 1;

  STATE.myQueue = {
    placeId: p.id,
    placeName: p.name,
    num,
    position: num - p.currentNum,
    waitMin: (num - p.currentNum) * 2,
  };

  p.queueCount++;
  p.queue.push({
    num,
    name: `${STATE.user.first} ${STATE.user.last}`,
    type: "online",
    done: false,
    current: false,
  });

  updateUserUI();
  closeModal("modal-join");
  showToast(`<i class="ph-bold ph-check"></i> ${t("toastJoinQueueSuccess")}: #${num}`);
  setTimeout(() => showScreen("screen-myqueue"), 500);
}

/* =====================================================
   13. MENING NAVBATIM RENDER
   ===================================================== */
function renderMyQueue() {
  const container = document.getElementById("myqueue-content");
  if (!container) return;

  if (!STATE.myQueue) {
    container.innerHTML = `
      <div class="empty-state" style="padding-top:80px">
        <div class="empty-icon"><i class="ph-fill ph-clipboard-text"></i></div>
        <div class="empty-title">${t("myQueueNoActive")}</div>
        <div class="empty-sub">${t("myQueueFind")}</div>
        <br>
        <button class="btn btn-primary" style="width:auto;margin:0 auto;padding:12px 32px"
                onclick="showScreen('screen-market')">
          ${t("myQueueSearchBtn")}
        </button>
      </div>
    `;
    return;
  }

  const q = STATE.myQueue;
  const place = PLACES.find((p) => p.id === q.placeId);

  container.innerHTML = `
    <!-- Navbat raqami banneri -->
    <div style="background:var(--c-info-bg);border-radius:var(--r);padding:20px;margin-bottom:12px;border:1px solid rgba(37,99,235,0.2)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:12px;font-weight:700;color:var(--c-info);text-transform:uppercase;letter-spacing:0.5px">
          <i class="ph-fill ph-map-pin"></i> ${t("myQueueYour")}
        </span>
        <span style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--c-info)">
          <span class="live-dot" style="background:var(--c-info)"></span> ${t("liveBadge")}
        </span>
      </div>
      <div style="display:flex;align-items:baseline;gap:14px">
        <span style="font-family:var(--mono);font-size:56px;font-weight:700;color:var(--c-info);line-height:1;letter-spacing:-2px">
          #${q.num}
        </span>
        <div>
          <p style="font-size:15px;font-weight:700;color:var(--c-info)">${q.placeName}</p>
          <p style="font-size:13px;color:var(--c-text2)">~${q.waitMin} ${t("minutesFull")}</p>
        </div>
      </div>
    </div>

    <!-- Holat kartasi -->
    <div class="card" style="margin-bottom:12px">
      <div style="display:flex;gap:0">
        <div style="flex:1;text-align:center">
          <p style="font-size:11px;color:var(--c-text2);margin-bottom:4px;font-weight:600">${t("myQueueStatus")}</p>
          <p style="font-size:13px;font-weight:700;color:var(--c-accent)">${t("myQueueInQueue")}</p>
        </div>
        <div style="flex:1;text-align:center;border-left:0.5px solid var(--c-border);border-right:0.5px solid var(--c-border)">
          <p style="font-size:11px;color:var(--c-text2);margin-bottom:4px;font-weight:600">${t("myQueueAhead")}</p>
          <p style="font-family:var(--mono);font-size:22px;font-weight:700">${Math.max(0, q.position)}</p>
        </div>
        <div style="flex:1;text-align:center">
          <p style="font-size:11px;color:var(--c-text2);margin-bottom:4px;font-weight:600">${t("myQueueWaitLabel")}</p>
          <p style="font-family:var(--mono);font-size:22px;font-weight:700">${q.waitMin} ${t("minutesShort")}</p>
        </div>
      </div>
    </div>

    <!-- Amallar tugmalari -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
      <button class="btn btn-secondary" style="padding:12px;font-size:13px" onclick="openModal('modal-delay')">
        ${t("myQueueDelay")}
      </button>
      <button class="btn btn-danger" style="padding:12px;font-size:13px" onclick="leaveQueue()">
        <i class="ph-bold ph-sign-out"></i> ${t("myQueueLeave")}
      </button>
    </div>

    <!-- Joy haqida -->
    ${
      place
        ? `
      <div class="card card-hover" onclick="openPlace(${place.id})" style="margin-bottom:0">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:36px">${place.icon}</span>
          <div style="flex:1">
            <p style="font-weight:700;font-size:15px">${place.name}</p>
            <p style="font-size:12px;color:var(--c-text2)"><i class="ph-fill ph-map-pin"></i> ${place.location.district}</p>
            <p style="font-size:12px;color:var(--c-text2)"><i class="ph-fill ph-clock"></i> ${place.hours}</p>
          </div>
          <span style="font-size:20px;color:var(--c-text3)">›</span>
        </div>
      </div>
    `
        : ""
    }
  `;
}

/* Navbatni kechiktirish */
function doDelay(positions) {
  if (!STATE.myQueue) return;
  const isFree = STATE.delaysUsed === 0;
  const cost = isFree ? 0 : 5000;

  STATE.myQueue.num += positions;
  STATE.myQueue.position += positions;
  STATE.myQueue.waitMin += positions * 2;
  STATE.delaysUsed++;

  closeModal("modal-delay");
  updateUserUI();
  renderMyQueue();

  showToast(
    isFree
      ? `<i class="ph-bold ph-check"></i> ${t("toastDelayFree")} (+${positions} ${t("slot")})`
      : `<i class="ph-fill ph-credit-card"></i> ${t("toastDelayPaid")} (+${positions} ${t("slot")})`,
  );
}

/* Navbatdan chiqish */
function leaveQueue() {
  STATE.myQueue = null;
  STATE.delaysUsed = 0;

  const activeCard = document.getElementById("hero-active-queue");
  const noQueue = document.getElementById("hero-no-queue");
  if (activeCard) activeCard.style.display = "none";
  if (noQueue) noQueue.style.display = "block";

  renderMyQueue();
  showToast(t("toastLeaveQueue"));
}

/* =====================================================
   14. ADMIN PANEL FUNKSIYALARI
   ===================================================== */

/* Admin navbat ro'yxatini render qilish */
function renderAdmin() {
  if (!STATE.adminPlace) return;

  /* Joriy xizmatdagi kishi */
  const current = STATE.adminQueue.find((q) => q.current);
  const next = STATE.adminQueue.filter((q) => !q.done && !q.current)[0];
  const waiting = STATE.adminQueue.filter((q) => !q.done);

  const curNumEl = document.getElementById("admin-cur-num");
  const curNameEl = document.getElementById("admin-cur-name");
  const curNextEl = document.getElementById("admin-cur-next");

  if (curNumEl) curNumEl.textContent = current ? `#${current.num}` : "#—";
  if (curNameEl) curNameEl.textContent = current ? current.name : t("adminNoOne");
  if (curNextEl)
    curNextEl.textContent = next
      ? `${t("adminNextLabel")}: ${next.name} (#${next.num})`
      : t("adminQueueEnded");

  /* Statistika */
  const todayEl = document.getElementById("adm-stat-today");
  const waitingEl = document.getElementById("adm-stat-waiting");
  const countEl = document.getElementById("adm-q-count");
  if (todayEl) todayEl.textContent = STATE.adminQueue.length + 10;
  if (waitingEl) waitingEl.textContent = waiting.length;
  if (countEl) countEl.textContent = waiting.length;

  /* Navbat ro'yxati */
  const listEl = document.getElementById("admin-queue-list");
  if (listEl) {
    if (waiting.length === 0) {
      listEl.innerHTML =
        `<p style="text-align:center;color:var(--c-text3);padding:16px;font-size:14px">${t("emptyQueue")}</p>`;
    } else {
      listEl.innerHTML = waiting
        .map(
          (q) => `
        <div class="q-row">
          <div class="q-num ${q.current ? "is-current" : ""}">#${q.num}</div>
          <div class="q-name">${q.name}</div>
          <span class="badge ${q.type === "online" ? "badge-blue" : "badge-gray"}">
            ${q.type === "online" ? t("statusOnline") : t("statusOffline")}
          </span>
          ${q.current ? `<span class="badge badge-green">${t("statusCurrent")}</span>` : ""}
        </div>
      `,
        )
        .join("");
    }
  }

  /* Grafik */
  renderAdminChart();
  updateDisplay();
}

/* "Keyingi" tugmasi bosilganda */
function adminNext() {
  const curIdx = STATE.adminQueue.findIndex((q) => q.current);
  const nextIdx = STATE.adminQueue.findIndex((q) => !q.done && !q.current);

  if (curIdx >= 0) STATE.adminQueue[curIdx].done = true;

  if (nextIdx >= 0) {
    STATE.adminQueue[nextIdx].current = true;
    if (STATE.adminPlace) STATE.adminPlace.currentNum = STATE.adminQueue[nextIdx].num;
    showToast(`<i class="ph-bold ph-play"></i> ${t("toastAdminNext")}: ${STATE.adminQueue[nextIdx].name}`);
  } else {
    showToast(t("toastAllServed"));
  }

  if (STATE.adminPlace) STATE.adminPlace.queue = STATE.adminQueue.map((q) => ({ ...q }));

  renderAdmin();
}

/* Offline mijoz qo'shish modali */
function openAddModal() {
  openModal("modal-add");
  setTimeout(() => {
    const inp = document.getElementById("walkin-name");
    if (inp) inp.focus();
  }, 300);
}

/* Offline mijozni navbatga qo'shish */
function addWalkIn() {
  const name = document.getElementById("walkin-name")?.value.trim();
  if (!name) {
    showToast(t("toastNameRequired"));
    return;
  }

  const newEntry = {
    num: STATE.adminNextNum,
    name,
    type: "offline",
    done: false,
    current: false,
  };

  /* Agar hozirgi kishi yo'q bo'lsa — yangi kiruvchi hozirgi bo'ladi */
  const hasCurrent = STATE.adminQueue.some((q) => q.current && !q.done);
  if (!hasCurrent) newEntry.current = true;

  STATE.adminQueue.push(newEntry);
  STATE.adminNextNum++;

  /* Input tozalash */
  const nameInp = document.getElementById("walkin-name");
  const phoneInp = document.getElementById("walkin-phone");
  if (nameInp) nameInp.value = "";
  if (phoneInp) phoneInp.value = "";

  closeModal("modal-add");
  renderAdmin();
  showToast(`<i class="ph-bold ph-check"></i> ${name} ${t("toastCustomerAdded")} (#${STATE.adminNextNum - 1})`);
}

/* Navbatni tozalash */
function confirmReset() {
  if (confirm(t("confirmClearQueue"))) {
    STATE.adminQueue = [];
    STATE.adminNextNum = 1;
    renderAdmin();
    showToast(t("toastQueueCleared"));
  }
}

/* =====================================================
   15. SOATLIK TAHLIL GRAFIGI
   ===================================================== */
function renderAdminChart() {
  const data = STATE.adminPlace?.hourlyData || [
    0, 2, 4, 6, 8, 7, 6, 9, 8, 5, 3, 1,
  ];
  const hours = [
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
  ];
  const max = Math.max(...data) || 1;
  const nowH = new Date().getHours() - 8;

  const barsEl = document.getElementById("adm-chart-bars");
  const labelsEl = document.getElementById("adm-chart-labels");

  if (barsEl) {
    barsEl.innerHTML = data
      .map((v, i) => {
        const h = Math.max(4, Math.round((v / max) * 80));
        const cls = i === nowH ? "is-now" : v === max ? "is-peak" : "";
        return `
        <div class="chart-bar-col">
          <div class="chart-bar ${cls}" style="height:${h}px" title="${hours[i]}:00 — ${v} ${t("peopleWord")}"></div>
        </div>
      `;
      })
      .join("");
  }

  if (labelsEl) {
    labelsEl.innerHTML = hours
      .map(
        (h, i) => `
      <span class="chart-bar-col chart-bar-label" style="color:${i === nowH ? "var(--c-amber)" : "var(--c-text3)"}">${h}</span>
    `,
      )
      .join("");
  }
}

/* =====================================================
   16. DISPLEJ REJIMI (Katta ekran)
   ===================================================== */
function updateDisplay() {
  const current = STATE.adminQueue.find((q) => q.current);
  const next = STATE.adminQueue.filter((q) => !q.done && !q.current)[0];

  const numEl = document.getElementById("disp-num");
  const nameEl = document.getElementById("disp-name");
  const placeEl = document.getElementById("disp-place");
  const nextEl = document.getElementById("disp-next");

  if (numEl) numEl.textContent = current ? current.num : "—";
  if (nameEl) nameEl.textContent = current ? current.name : t("waiting");
  if (placeEl)
    placeEl.textContent = STATE.adminPlace?.name || t("navPlatform");
  if (nextEl)
    nextEl.textContent = next
      ? `${t("adminNextLabel")}: ${next.name} (#${next.num})`
      : t("adminQueueEnded");
}

/* =====================================================
   17. MODAL BOSHQARUVI
   ===================================================== */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

/* Modal tashqarisiga bosilganda yopish */
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", function (e) {
    if (e.target === this) {
      this.classList.add("hidden");
    }
  });
});

/* =====================================================
   18. BILDIRISHNOMA TOAST
   ===================================================== */

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let toastTimer = null;

function showToast(msg) {
  const el = document.getElementById("toast-msg");
  if (!el) return;

  el.innerHTML = msg;
  el.classList.add("show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3000);
}

/* =====================================================
   19. TUN/KUN REJIMI (Dark/Light Mode)
   ===================================================== */
function toggleTheme() {
  STATE.isDark = !STATE.isDark;
  document.documentElement.dataset.theme = STATE.isDark ? "dark" : "";
  document.body.dataset.theme = STATE.isDark ? "dark" : "";
  updateThemeButtons();

  /* Profil sahifasidagi matnni yangilash */
  const label = document.getElementById("theme-status-label");
  if (label) {
    label.textContent = STATE.isDark ? t("themeNightMode") : t("themeDayMode");
  }
}

/* Barcha tema tugmalarini yangilash */
function updateThemeButtons() {
  const icon = STATE.isDark ? `<i class="ph-fill ph-sun"></i>` : `<i class="ph-fill ph-moon"></i>`;
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.innerHTML = icon;
    btn.title = STATE.isDark ? t("themeSwitchToDay") : t("themeSwitchToNight");
  });
}

/* =====================================================
   20. ILOVANI ISHGA TUSHIRISH
   ===================================================== */
function init() {
  updateThemeButtons();
  renderHome();
  renderMarket();
}

/* Ilova tayyor bo'lgandan so'ng init() ni chaqirish */
document.addEventListener("DOMContentLoaded", init);
