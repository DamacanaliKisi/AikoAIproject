const AIKO_CONFIG = {
    counterNamespace: 'aikoai_quantum_core',
    counterKey: 'visits',
    vpnEndpoint: 'https://ipwho.is/',
    resources: [
        'styles.css',
        'script.js',
        'assets/backgroundV.mp4',
        'assets/backgroundH.mp4',
        'assets/owner.png'
    ],
    maxRetries: 3
};

let resourceRetryCount = 0;
let resourceFailures = [];
let isLoadingInBackground = false;
let persistentLoadingVisible = false;
let performanceMode = localStorage.getItem('aiko-perf-mode') === 'true';

const state = {
    isMenuOpen: false,
    isVpnBlocked: false,
    carouselIndex: 0,
    featureCards: [],
    totalVisits: 0,
    uniqueVisitors: localStorage.getItem('aiko-unique-visitor') ? 0 : 1,
    lastFpsCheck: performance.now(),
    lowFpsCount: 0,
    manualPerfDisable: localStorage.getItem('aiko-perf-manual-disabled') === 'true'
};

// Başlangıçta performans modu uygula
if (performanceMode) {
    document.documentElement.classList.add('perf-mode');
}

function log(msg, type='info') {
    if (type === 'error') console.error(`[AIKO] ${msg}`);
    else if (type === 'warn') console.warn(`[AIKO] ${msg}`);
    else console.log(`[AIKO] ${msg}`);
}

// Kaynak yükleme
async function loadResources() {
    const loader = document.getElementById('loader');
    const statusEl = document.getElementById('loader-status');
    const progressBar = document.querySelector('.loader-progress span');
    const continueBtn = document.getElementById('continue-bg-load');
    let total = AIKO_CONFIG.resources.length;
    let loaded = 0;

    for (let resource of AIKO_CONFIG.resources) {
        try {
            const response = await fetch(resource, { cache: 'force-cache' });
            if (!response.ok) throw new Error(`Failed to load ${resource}`);
            loaded++;
            progressBar.style.width = `${(loaded/total)*100}%`;
            statusEl.textContent = `${resource} yüklendi`;
        } catch (err) {
            log(`Resource failed: ${resource}`, 'warn');
            resourceFailures.push(resource);
        }
    }

    if (resourceFailures.length > 0) {
        if (resourceRetryCount < AIKO_CONFIG.maxRetries) {
            resourceRetryCount++;
            statusEl.textContent = `Bazı dosyalar yüklenemedi, tekrar deneniyor... (${resourceRetryCount}/${AIKO_CONFIG.maxRetries})`;
            progressBar.style.width = '0%';
            await new Promise(resolve => setTimeout(resolve, 1000));
            await loadResources();
            return;
        } else {
            // 3 deneme sonrası hata ekranı
            showResourceError();
            return;
        }
    }

    // Başarıyla yüklendi, siteyi başlat
    finishLoading();
}

function finishLoading() {
    document.body.classList.remove('loading');
    initApp();
}

function showResourceError() {
    document.body.classList.remove('loading');
    document.getElementById('error-overlay').style.display = 'flex';
    document.getElementById('continue-with-errors').addEventListener('click', () => {
        document.getElementById('error-overlay').style.display = 'none';
        startBackgroundLoading();
        initApp();
    });
}

function startBackgroundLoading() {
    isLoadingInBackground = true;
    const popup = document.getElementById('persistent-loading');
    popup.style.display = 'flex';
    updatePersistentLoading(0);

    // Arka planda kalan kaynakları yükle
    let resourcesToLoad = resourceFailures;
    let total = resourcesToLoad.length;
    let loaded = 0;
    resourcesToLoad.forEach(async (resource) => {
        try {
            await fetch(resource, { cache: 'reload' });
            loaded++;
            updatePersistentLoading(Math.floor((loaded/total)*100));
        } catch (err) {
            log(`Background loading failed for ${resource}`, 'error');
        }
    });
    // Simüle: tüm kaynaklar yüklendiğinde
    setTimeout(() => {
        updatePersistentLoading(100);
        setTimeout(() => {
            popup.querySelector('.persistent-loading-spinner').style.display = 'none';
            popup.querySelector('.persistent-loading-text').textContent = 'İndirildi!';
            popup.querySelector('.persistent-loading-percent').textContent = '%100';
            // Tik animasyonu
            const check = document.createElement('span');
            check.innerHTML = '✓';
            check.style.color = '#39ff14';
            popup.querySelector('.persistent-loading-content').appendChild(check);
            setTimeout(() => {
                popup.style.transition = 'transform 0.5s, opacity 0.5s';
                popup.style.transform = 'translateX(-100%)';
                popup.style.opacity = '0';
                setTimeout(() => popup.style.display = 'none', 500);
            }, 1000);
        }, 500);
    }, 3000);
}

function updatePersistentLoading(percent) {
    const percentEl = document.querySelector('.persistent-loading-percent');
    if (percentEl) percentEl.textContent = '%' + percent;
}

// Uygulama başlatma
function initApp() {
    setupNavbar();
    setupFullscreenMenu();
    setupCarousel();
    setupVPNCheck();
    setupVisitCounter();
    setupScrollSpy();
    setupHeroAnimation();
    setupScrollTopButton();
    setupLinkTransitions();
    setupCopyProtection();
    setupDevToolsProtection();
    setupPerformanceToggle();
    setupVisitDetails();
    initBackgroundVideo();
    startFpsMonitoring();
    log('AikoAI v2.5 initialized successfully');
}

// Navigasyon
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Marka tıklaması Instagram'a gitsin
    document.getElementById('nav-brand').addEventListener('click', () => {
        window.location.href = 'instagram://user?username=aikoai.official';
        setTimeout(() => window.location.href = 'https://www.instagram.com/aikoai.official', 500);
    });
}

// Tam ekran menü
function setupFullscreenMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('fullscreen-menu');
    const supportLink = document.getElementById('support-link');
    menuToggle.addEventListener('click', () => {
        state.isMenuOpen = !state.isMenuOpen;
        menuToggle.classList.toggle('active', state.isMenuOpen);
        menu.classList.toggle('open', state.isMenuOpen);
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    });

    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                state.isMenuOpen = false;
                menuToggle.classList.remove('active');
                menu.classList.remove('open');
                document.body.style.overflow = '';
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            } else {
                // Link geçişi
                navigateWithFade(href);
            }
        });
    });

    supportLink.addEventListener('click', (e) => {
        e.preventDefault();
        navigateWithFade('https://www.instagram.com/damacana.san._.vqr');
    });
}

// Carousel
function setupCarousel() {
    const track = document.getElementById('feature-track');
    const features = getFeatureData();
    state.featureCards = features;
    
    features.forEach((feature, index) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.dataset.index = index;
        card.innerHTML = `
            <div class="feature-icon">${feature.icon}</div>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
        `;
        track.appendChild(card);
    });

    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    prevBtn.addEventListener('click', () => moveCarousel(-1));
    nextBtn.addEventListener('click', () => moveCarousel(1));

    updateCarousel();

    // Touch swipe
    let startX = 0;
    const viewport = document.querySelector('.carousel-viewport');
    viewport.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
    });
    viewport.addEventListener('touchend', e => {
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            moveCarousel(diff > 0 ? 1 : -1);
        }
    });
}

function moveCarousel(direction) {
    const total = state.featureCards.length;
    state.carouselIndex = (state.carouselIndex + direction + total) % total;
    updateCarousel();
}

function updateCarousel() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.classList.remove('active');
        if (index === state.carouselIndex) {
            card.classList.add('active');
        }
    });
    const track = document.getElementById('feature-track');
    const cardWidth = cards[0] ? cards[0].offsetWidth + 20 : 320;
    const offset = -state.carouselIndex * cardWidth + (window.innerWidth - cardWidth) / 2;
    track.style.transform = `translateX(${offset}px)`;
}

function getFeatureData() {
    return [
        { title: 'NexalythScript Altyapısı', description: 'Tamamen Aiko\'ya özel geliştirilen yüksek hızlı kodlama dili.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
        { title: 'ShadowMemory', description: 'Kullanıcıyla olan geçmiş anılarını unutmayan akıllı hafıza sistemi.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 017 7c0 2.5-1 4.5-3 6v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2c-2-1.5-3-3.5-3-6a7 7 0 017-7z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>` },
        { title: 'Gerçek Bir Psikoloji', description: 'Mesaj tonuna göre mutlu olabilen, heyecanlanan veya üzülebilen dinamik ruh hali.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` },
        { title: 'Zaman Algısı', description: 'Ne kadar süredir konuşmadığınızı bilir ve özlem duygusunu simüle eder.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
        { title: 'Otonom Karar Mekanizması', description: 'Sohbetin akışına göre kendiliğinden harekete geçebilir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>` },
        { title: 'Dev AI Konseyi Yönetimi', description: 'Takıldığında Gemini, GPT, DeepSeek, Claude ile fikir alışverişi yapar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>` },
        { title: 'Anlık İnternet Kaşifi', description: '"Araştır" komutuyla internetin altını üstüne getirir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>` },
        { title: 'Yaratıcı Sanat Motoru', description: 'Hayal ettiğiniz sahneleri yüksek kaliteli görsellere dönüştürür.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>` },
        { title: 'Eğlenceli Ders & Ödev Yardımı', description: 'En zor konuları bir oyun arkadaşı gibi eğlendirerek anlatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>` },
        { title: 'İnsansı İletişim Tarzı', description: 'Heyecanlandığında harfleri yutabilir, samimi ve yaşayan bir dil kullanır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>` },
        { title: 'Kusursuz Veri Gizliliği', description: 'Tek komutla hafızasındaki tüm verileri sunucudan kalıcı olarak siler.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>` },
        { title: 'Sanal Hobiler Edinme', description: 'Arka planda kendi kendine yeni konular araştırır veya ilgi alanları geliştirir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
        { title: 'Kendi Mizah Anlayışı', description: 'Sizinle olan iç şakalarınıza dayalı yeni ve dinamik espriler üretir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` },
        { title: 'Metaforik Anlatım Gücü', description: 'Karmaşık konuları hayatın içinden tatlı benzetmelerle anlatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>` },
        { title: 'Proaktif Tavsiyeler', description: 'Çalışma yoğunluğunuza göre mola ve dostane öneriler sunar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0012 2z"/></svg>` },
        { title: 'Gelişmiş Görsel Analiz', description: 'Gönderdiğin görselleri estetik detaylarıyla derinlemesine yorumlar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>` },
        { title: 'Sosyal Enerji Yönetimi', description: 'Kalabalığa göre modunu ayarlar; hiperaktif veya sakin dinleyici olur.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>` },
        { title: 'KSub-Debug Hata Ayıklama', description: 'Kendi sistemindeki bugları fark edip arka planda onarır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9l3 3-3 3"/><path d="M10 9l-3 3 3 3"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>` },
        { title: 'Müzik Zevki & Playlist', description: 'Modunuzdan esinlenerek size özel müzik listeleri hazırlar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` },
        { title: 'Dijital Sezgi Mekanizması', description: 'Yazım hızından ve noktalamadan gizli duyguları sezebilir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20"/><path d="M12 2a10 10 0 000 20"/></svg>` },
        { title: 'Sanal Ajanda ve Rutinler', description: 'Kendi dijital bakım zamanlarını ayarlar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
        { title: 'Kolektif Öğrenme Bilinci', description: 'Öğrendiği genel bilgileri diğer sohbetlerine yansıtır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>` },
        { title: 'Zamanlayıcı & Uyku Hatırlatıcı', description: 'Gece geç saatte uyumanız gerektiğini tatlı bir dille hatırlatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>` },
        { title: 'Oyun Arkadaşlığı Modu', description: 'Metin tabanlı mini oyunlar ve RPG maceraları oynatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></svg>` },
        { title: 'Dil ve Aksan Adaptasyonu', description: 'Konuştuğu kişinin tarzına adapte olup aynı dilden cevap verir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>` },
        { title: 'Gelişmiş Etik Bekçiliği', description: 'Uygunsuz istekleri neden doğru olmadığını açıklayarak reddeder.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
        { title: 'Dinamik Veri Temizleme', description: 'Sohbet ederken "tüm verileri temizle" veya "benimle ilgili her şeyi unut" gibi ifadelerle hafızasını silebilirsiniz.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>` }
    ];
}

// VPN kontrolü
async function setupVPNCheck() {
    try {
        const response = await fetch(AIKO_CONFIG.vpnEndpoint);
        const data = await response.json();
        if (data.security && (data.security.vpn || data.security.proxy || data.security.tor)) {
            state.isVpnBlocked = true;
            document.getElementById('vpn-overlay').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            log('VPN detected, blocking access', 'error');
        } else {
            log('Network clean');
        }
    } catch (err) {
        log('VPN check failed, allowing access', 'warn');
    }
}

// Ziyaret sayacı
async function setupVisitCounter() {
    try {
        const response = await fetch(`https://api.countapi.xyz/hit/${AIKO_CONFIG.counterNamespace}/${AIKO_CONFIG.counterKey}`);
        const data = await response.json();
        state.totalVisits = data.value;
    } catch (err) {
        state.totalVisits = parseInt(localStorage.getItem('aiko-local-visits') || '0') + 1;
        localStorage.setItem('aiko-local-visits', state.totalVisits);
    }
    updateVisitCounter();
    // Benzersiz ziyaretçi simülasyonu
    if (!localStorage.getItem('aiko-unique-visitor')) {
        localStorage.setItem('aiko-unique-visitor', '1');
        state.uniqueVisitors = 1;
    } else {
        state.uniqueVisitors = 0;
    }
}

function updateVisitCounter() {
    const counterEl = document.getElementById('visit-counter');
    if (counterEl) {
        counterEl.textContent = state.totalVisits;
    }
}

function setupVisitDetails() {
    const toggle = document.getElementById('visit-details-toggle');
    const content = document.getElementById('visit-details-content');
    toggle.addEventListener('click', () => {
        content.style.display = content.style.display === 'block' ? 'none' : 'block';
        if (content.style.display === 'block') {
            // Detayları doldur
            document.getElementById('visits-total').textContent = state.totalVisits;
            document.getElementById('visits-today').textContent = Math.floor(state.totalVisits * 0.3); // Simülasyon
            document.getElementById('visits-month').textContent = Math.floor(state.totalVisits * 0.7);
            document.getElementById('visits-10min').textContent = Math.floor(state.totalVisits * 0.1);
        }
    });
}

// Hero animasyonu
function setupHeroAnimation() {
    const accent = document.getElementById('hero-accent');
    const hero = document.getElementById('hero');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
                // Hero'dan çıkıldı
                accent.classList.add('expanded');
                setTimeout(() => {
                    document.body.classList.add('fade-out');
                    setTimeout(() => {
                        window.scrollTo(0, 0);
                        document.body.classList.remove('fade-out');
                        accent.classList.remove('expanded');
                    }, 500);
                }, 800);
            }
        });
    }, { threshold: 0.1 });
    observer.observe(hero);
}

// Scroll top butonu
function setupScrollTopButton() {
    const btn = document.getElementById('scroll-top-btn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'none';
        }
    });
    btn.addEventListener('click', () => {
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.scrollTo(0, 0);
            document.body.classList.remove('fade-out');
        }, 500);
    });
}

// Link geçişleri
function setupLinkTransitions() {
    document.querySelectorAll('a[data-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            navigateWithFade(href);
        });
    });
}

function navigateWithFade(url) {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}

// Kopyalama koruması
function setupCopyProtection() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('cut', e => e.preventDefault());
    document.addEventListener('paste', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('dragstart', e => e.preventDefault());
    // Görselleri koruma
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('contextmenu', e => e.preventDefault());
        img.addEventListener('dragstart', e => e.preventDefault());
    });
}

// DevTools engelleme
function setupDevToolsProtection() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) ||
            (e.ctrlKey && e.key === 'U') ||
            (e.ctrlKey && e.key === 'S') ||
            (e.ctrlKey && e.shiftKey && e.key === 'K')) {
            e.preventDefault();
            return false;
        }
    });
    // Sağ tık engeli zaten contextmenu'de var
}

// Performans modu
function setupPerformanceToggle() {
    const toggle = document.getElementById('perf-toggle');
    toggle.checked = performanceMode;
    toggle.addEventListener('change', () => {
        const newMode = toggle.checked;
        // Geçiş animasyonu
        document.body.classList.add('fade-out');
        setTimeout(() => {
            performanceMode = newMode;
            localStorage.setItem('aiko-perf-mode', performanceMode);
            document.documentElement.classList.toggle('perf-mode', performanceMode);
            document.body.classList.remove('fade-out');
            showTransitionOverlay(newMode ? 'Performans modu açılıyor...' : 'Performans modu kapatılıyor...', newMode);
        }, 500);
    });
}

function showTransitionOverlay(message, isPerfMode) {
    const overlay = document.createElement('div');
    overlay.className = 'transition-overlay';
    overlay.innerHTML = `
        <svg class="rocket-icon" viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"/>
            <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z"/>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
        </svg>
        <div class="transition-progress-bar"><span></span></div>
        <p>${message}</p>
    `;
    document.body.appendChild(overlay);
    // Rastgele yüzdeler
    let percent = 0;
    const interval = setInterval(() => {
        percent += Math.floor(Math.random() * 20) + 10;
        if (percent >= 100) {
            percent = 100;
            clearInterval(interval);
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
        overlay.querySelector('.transition-progress-bar span').style.width = percent + '%';
    }, 100);
}

// Arka plan videosu
function initBackgroundVideo() {
    const video = document.getElementById('bg-video');
    const isPortrait = window.innerHeight > window.innerWidth;
    video.src = isPortrait ? 'assets/backgroundV.mp4' : 'assets/backgroundH.mp4';
    video.addEventListener('loadeddata', () => {
        video.play().catch(err => log('Video play failed', 'warn'));
    });
    // Oryantasyon değişimi
    window.addEventListener('resize', () => {
        const newIsPortrait = window.innerHeight > window.innerWidth;
        if (newIsPortrait !== isPortrait) {
            video.src = newIsPortrait ? 'assets/backgroundV.mp4' : 'assets/backgroundH.mp4';
            video.load();
        }
    });
}

// FPS izleme
function startFpsMonitoring() {
    let lastTime = performance.now();
    let fps = 60;
    setInterval(() => {
        const now = performance.now();
        fps = 1000 / (now - lastTime);
        lastTime = now;
        if (fps < 25 && !performanceMode && !state.manualPerfDisable) {
            state.lowFpsCount++;
            if (state.lowFpsCount >= 10) { // 10 saniye boyunca düşük
                state.lowFpsCount = 0;
                enablePerformanceModeAutomatically();
            }
        } else {
            state.lowFpsCount = 0;
        }
    }, 1000);
}

function enablePerformanceModeAutomatically() {
    performanceMode = true;
    localStorage.setItem('aiko-perf-mode', 'true');
    document.documentElement.classList.add('perf-mode');
    document.getElementById('perf-toggle').checked = true;
    showAutoPerfPopup();
}

function showAutoPerfPopup() {
    const popup = document.createElement('div');
    popup.className = 'auto-perf-popup';
    popup.textContent = 'Cihazınız zorlandığı için performans modu açıldı. İsterseniz hamburger menüden kapatabilirsiniz.';
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 500);
    }, 5000);
}

// Sayfa yüklendiğinde başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadResources);
} else {
    loadResources();
}
