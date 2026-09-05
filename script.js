/**
 * ============================================================
 * AIKOAI v2.5 — NEXALYTHSCRIPT QUANTUM CORE ENGINE
 * by damacana.san._.vqr
 * ============================================================
 */

'use strict';

// ============================================================
// BÖLÜM 1: GLOBAL YAPILANDIRMA VE DURUM
// ============================================================

const AIKO_CONFIG = {
    // Kaynak listesi (yüklenmesi zorunlu dosyalar)
    resources: [
        'styles.css',
        'script.js',
        'assets/owner.png',
        'assets/backgroundV.mp4',
        'assets/backgroundH.mp4'
    ],
    // VPN kontrolü için API
    vpnEndpoint: 'https://ipwho.is/',
    // Sayaç API'si (yedek olarak localStorage)
    counterApi: 'https://api.countapi.xyz/hit/aikoai_quantum_core/visits',
    // Benzersiz ziyaretçi için IP API'si
    ipEndpoint: 'https://ipwho.is/',
    // Maksimum kaynak denemesi
    maxRetries: 3,
    // 5 saniye sonra skip butonu göster
    skipTimeout: 5000,
    // Performans modu için eşik değerleri
    perfCheckInterval: 2000,
    perfLowFps: 20,
    perfCheckDuration: 10000,
    perfMinFps: 30,
    // Video yolları
    videoVertical: 'assets/backgroundV.mp4',
    videoHorizontal: 'assets/backgroundH.mp4',
    // Instagram kullanıcı adları
    instagramAiko: 'aikoai.official',
    instagramOwner: 'damacana.san._.vqr'
};

// Global durum nesnesi
const state = {
    isLoading: true,
    isVpnBlocked: false,
    isMenuOpen: false,
    isPerformanceMode: false,
    autoPerfDisabled: false,
    carouselIndex: 0,
    featureCards: [],
    totalVisits: 0,
    uniqueVisitors: 0,
    resourceRetryCount: 0,
    resourceFailures: [],
    fpsHistory: [],
    perfCheckStart: null,
    bgLoadingActive: false,
    bgLoadingDone: false,
    counterOpen: false,
    darkcodesOpen: false,
    videoElement: null,
    currentVideoSrc: '',
    isHeroExpanded: false
};

// ============================================================
// BÖLÜM 2: YARDIMCI FONKSİYONLAR
// ============================================================

/**
 * Konsol loglama sistemi (sadece development için)
 */
function log(message, type = 'info') {
    const styles = {
        info: 'color: #00f0ff; font-weight: bold;',
        success: 'color: #39ff14; font-weight: bold;',
        warn: 'color: #ffb703; font-weight: bold;',
        error: 'color: #ff2a74; font-weight: bold;'
    };
    if (type === 'error') {
        console.error(`%c[AIKO] ${message}`, styles.error);
    } else if (type === 'warn') {
        console.warn(`%c[AIKO] ${message}`, styles.warn);
    } else if (type === 'success') {
        console.log(`%c[AIKO] ${message}`, styles.success);
    } else {
        console.log(`%c[AIKO] ${message}`, styles.info);
    }
}

/**
 * Gecikme fonksiyonu (ms cinsinden)
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Rastgele sayı üretimi (min ve max dahil)
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * localStorage'dan veri okuma
 */
function getStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch {
        return defaultValue;
    }
}

/**
 * localStorage'a veri yazma
 */
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        log('localStorage yazılamadı', 'warn');
    }
}

// ============================================================
// BÖLÜM 3: KAYNAK YÜKLEME SİSTEMİ
// ============================================================

/**
 * Kaynak yükleme ana fonksiyonu
 */
async function loadResources() {
    const loader = document.getElementById('loader');
    const statusEl = document.getElementById('loader-status');
    const progressBar = document.querySelector('.loader-progress span');
    const total = AIKO_CONFIG.resources.length;
    let loaded = 0;

    updateLoaderStatus('Kaynaklar yükleniyor...', 0);

    for (const resource of AIKO_CONFIG.resources) {
        try {
            await loadSingleResource(resource);
            loaded++;
            const percent = Math.floor((loaded / total) * 100);
            updateLoaderStatus(`${resource} yüklendi`, percent);
        } catch (err) {
            log(`Kaynak yüklenemedi: ${resource}`, 'warn');
            state.resourceFailures.push(resource);
        }
    }

    // Eğer başarısız kaynak varsa retry mekanizması
    if (state.resourceFailures.length > 0) {
        if (state.resourceRetryCount < AIKO_CONFIG.maxRetries) {
            state.resourceRetryCount++;
            state.resourceFailures = [];
            updateLoaderStatus(`Bazı dosyalar yüklenemedi, tekrar deneniyor... (${state.resourceRetryCount}/${AIKO_CONFIG.maxRetries})`, 0);
            await delay(1000);
            await loadResources();
            return;
        } else {
            // Tüm denemeler başarısız, hata ekranı
            showResourceError();
            return;
        }
    }

    // Tüm kaynaklar başarıyla yüklendi
    finishLoading();
}

/**
 * Tek bir kaynağı fetch ile yükleme
 */
async function loadSingleResource(resource) {
    const response = await fetch(resource, { cache: 'force-cache' });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    // Video dosyaları için blob oluştur (gerçekten yüklendiğinden emin ol)
    if (resource.endsWith('.mp4')) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }
    return await response.blob();
}

/**
 * Loader durumunu güncelle
 */
function updateLoaderStatus(text, percent) {
    const statusEl = document.getElementById('loader-status');
    const progressBar = document.querySelector('.loader-progress span');
    if (statusEl) statusEl.textContent = text;
    if (progressBar) progressBar.style.width = `${percent}%`;
}

/**
 * 5 saniye sonra skip butonunu göster
 */
function showSkipButton() {
    setTimeout(() => {
        if (state.isLoading) {
            const skipBtn = document.getElementById('loader-skip');
            if (skipBtn) skipBtn.style.display = 'block';
        }
    }, AIKO_CONFIG.skipTimeout);
}

/**
 * Kaynak yüklenemediğinde hata ekranı
 */
function showResourceError() {
    state.isLoading = false;
    document.body.classList.remove('loading');
    const errorOverlay = document.getElementById('error-overlay');
    if (errorOverlay) errorOverlay.style.display = 'flex';
    createVHSOverlay();
}

/**
 * Yüklenme tamamlandığında
 */
function finishLoading() {
    state.isLoading = false;
    document.body.classList.remove('loading');
    
    // Arka plan videoyu başlat
    initBackgroundVideo();
    
    // Diğer sistemleri başlat
    initApp();
    
    // 0.5 saniye sonra videoyu fade in yap
    setTimeout(() => {
        if (state.videoElement) {
            state.videoElement.style.opacity = '1';
        }
    }, 500);
}

// ============================================================
// BÖLÜM 4: VPN KONTROLÜ
// ============================================================

/**
 * VPN tespiti ve engelleme
 */
async function checkVPN() {
    try {
        const response = await fetch(AIKO_CONFIG.vpnEndpoint);
        const data = await response.json();
        
        if (data.security && (data.security.vpn || data.security.proxy || data.security.tor)) {
            state.isVpnBlocked = true;
            document.body.classList.add('vpn-blocked');
            const vpnOverlay = document.getElementById('vpn-overlay');
            if (vpnOverlay) vpnOverlay.style.display = 'flex';
            createVHSOverlay();
            log('VPN tespit edildi, erişim engellendi', 'error');
            return true;
        } else {
            log('Ağ temiz, VPN yok');
            return false;
        }
    } catch (err) {
        log('VPN kontrolü yapılamadı, erişime izin verildi', 'warn');
        return false;
    }
}

/**
 * VHS overlay oluştur
 */
function createVHSOverlay() {
    if (document.querySelector('.vhs-overlay')) return;
    const vhs = document.createElement('div');
    vhs.className = 'vhs-overlay';
    document.body.appendChild(vhs);
}

// ============================================================
// BÖLÜM 5: ZİYARET SAYACI SİSTEMİ
// ============================================================

/**
 * IP adresini al
 */
async function getIP() {
    try {
        const response = await fetch(AIKO_CONFIG.ipEndpoint);
        const data = await response.json();
        return data.ip || 'unknown';
    } catch {
        return 'unknown';
    }
}

/**
 * Benzersiz ziyaretçi kontrolü
 */
async function trackUniqueVisitor() {
    const ip = await getIP();
    const visitedIPs = getStorage('aiko-visited-ips', []);
    
    if (!visitedIPs.includes(ip)) {
        visitedIPs.push(ip);
        setStorage('aiko-visited-ips', visitedIPs);
        state.uniqueVisitors = visitedIPs.length;
        return true; // Yeni ziyaretçi
    }
    state.uniqueVisitors = visitedIPs.length;
    return false; // Tekrar ziyaret
}

/**
 * Toplam ziyaret sayısını artır
 */
async function incrementTotalVisits() {
    try {
        const response = await fetch(AIKO_CONFIG.counterApi);
        const data = await response.json();
        state.totalVisits = data.value || 1;
    } catch {
        // Fallback: localStorage tabanlı
        const localVisits = getStorage('aiko-total-visits', 0);
        state.totalVisits = localVisits + 1;
        setStorage('aiko-total-visits', state.totalVisits);
    }
}

/**
 * Sayaç istatistiklerini güncelle
 */
function updateCounterStats() {
    // Bu fonksiyon gerçek API veya localStorage'dan verileri okuyup arayüzü günceller
    const now = Date.now();
    
    // Son 10 dakika
    const tenMinVisits = getStorage('aiko-visits-10min', []);
    const recentTen = tenMinVisits.filter(t => now - t < 600000).length;
    
    // Bugün
    const todayVisits = getStorage('aiko-visits-today', 0);
    
    // Bu ay
    const monthVisits = getStorage('aiko-visits-month', 0);
    
    // Tüm zamanlar
    const allVisits = getStorage('aiko-visits-all', state.totalVisits);
    
    // Benzersiz ziyaretçi
    const uniqueVisitors = getStorage('aiko-visited-ips', []).length;
    
    // Arayüzü güncelle
    const count10minEl = document.getElementById('count-10min');
    const countTodayEl = document.getElementById('count-today');
    const countMonthEl = document.getElementById('count-month');
    const countAllEl = document.getElementById('count-all');
    const countUniqueEl = document.getElementById('count-unique');
    const counterNumber = document.getElementById('counter-number');
    
    if (count10minEl) count10minEl.textContent = recentTen;
    if (countTodayEl) countTodayEl.textContent = todayVisits;
    if (countMonthEl) countMonthEl.textContent = monthVisits;
    if (countAllEl) countAllEl.textContent = allVisits;
    if (countUniqueEl) countUniqueEl.textContent = uniqueVisitors;
    if (counterNumber) counterNumber.textContent = state.totalVisits;
}

/**
 * Ziyaret kaydı yap
 */
async function recordVisit() {
    const now = Date.now();
    
    // 10 dakika listesine ekle
    const tenMinVisits = getStorage('aiko-visits-10min', []);
    tenMinVisits.push(now);
    setStorage('aiko-visits-10min', tenMinVisits);
    
    // Bugün sayacını artır
    const todayVisits = getStorage('aiko-visits-today', 0);
    setStorage('aiko-visits-today', todayVisits + 1);
    
    // Ay sayacını artır
    const monthVisits = getStorage('aiko-visits-month', 0);
    setStorage('aiko-visits-month', monthVisits + 1);
    
    // Tüm zamanlar sayacını artır
    const allVisits = getStorage('aiko-visits-all', state.totalVisits);
    setStorage('aiko-visits-all', allVisits + 1);
}

// ============================================================
// BÖLÜM 6: ARKA PLAN VİDEO YÖNETİMİ
// ============================================================

/**
 * Video öğesini oluştur ve yönet
 */
function initBackgroundVideo() {
    const video = document.getElementById('bg-video');
    if (!video) return;
    
    state.videoElement = video;
    video.style.opacity = '0';
    video.style.transition = 'opacity 0.8s ease';
    
    // Yönelime göre video seç
    updateVideoSource();
    
    // Yönelim değişimini dinle
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            updateVideoSource();
        }, 300);
    });
    
    // Resize olayında da kontrol et
    window.addEventListener('resize', () => {
        updateVideoSource();
    });
}

/**
 * Video kaynağını güncelle
 */
function updateVideoSource() {
    if (!state.videoElement) return;
    
    const isVertical = window.innerHeight > window.innerWidth;
    const newSrc = isVertical ? AIKO_CONFIG.videoVertical : AIKO_CONFIG.videoHorizontal;
    
    if (newSrc !== state.currentVideoSrc) {
        state.currentVideoSrc = newSrc;
        state.videoElement.src = newSrc;
        state.videoElement.load();
        state.videoElement.play().catch(err => {
            log('Video oynatılamadı', 'warn');
        });
    }
}

// ============================================================
// BÖLÜM 7: CAROUSEL SİSTEMİ
// ============================================================

/**
 * Özellik kartlarını oluştur
 */
function initCarousel() {
    const track = document.getElementById('feature-track');
    if (!track) return;
    
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
    
    // Ok butonlarını bağla
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
    
    // Swipe desteği
    setupSwipe();
    
    // İlk kartı aktifleştir
    updateCarousel();
}

/**
 * Kart verilerini döndür
 */
function getFeatureData() {
    // Tüm kartlar (27 adet) - metinler orijinalinden korunmuş
    return [
        {
            title: 'Gelişmiş Token Şifreleme Altyapısı',
            description: 'AikoAI ile olan sohbetleriniz, size özel üretilen tekil kriptografik token ile şifrelenir. Hiç kimse veri akışınızı çözemez.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`
        },
        {
            title: 'NexalythScript Altyapısı',
            description: 'Tamamen Aiko\'ya özel geliştirilen yüksek hızlı kodlama dili.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
        },
        {
            title: 'ShadowMemory',
            description: 'Kullanıcıyla olan geçmiş anılarını unutmayan akıllı hafıza sistemi.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 017 7c0 2.5-1 4.5-3 6v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2c-2-1.5-3-3.5-3-6a7 7 0 017-7z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>`
        },
        {
            title: 'Gerçek Bir Psikoloji',
            description: 'Mesaj tonuna göre mutlu olabilen, heyecanlanan veya üzülebilen dinamik ruh hali.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
        },
        {
            title: 'Zaman Algısı',
            description: 'Ne kadar süredir konuşmadığınızı bilir ve özlem duygusunu simüle eder.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
        },
        {
            title: 'Otonom Karar Mekanizması',
            description: 'Sohbetin akışına göre kendiliğinden harekete geçebilir.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`
        },
        {
            title: 'Dev AI Konseyi Yönetimi',
            description: 'Takıldığında Gemini, GPT, DeepSeek, Claude ile fikir alışverişi yapar.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`
        },
        {
            title: 'Anlık İnternet Kaşifi',
            description: '"Araştır" komutuyla internetin altını üstüne getirir.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`
        },
        {
            title: 'Yaratıcı Sanat Motoru',
            description: 'Hayal ettiğiniz sahneleri yüksek kaliteli görsellere dönüştürür.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>`
        },
        {
            title: 'Eğlenceli Ders & Ödev Yardımı',
            description: 'En zor konuları bir oyun arkadaşı gibi eğlendirerek anlatır.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>`
        },
        {
            title: 'İnsansı İletişim Tarzı',
            description: 'Heyecanlandığında harfleri yutabilir, samimi ve yaşayan bir dil kullanır.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>`
        },
        {
            title: 'Kusursuz Veri Gizliliği',
            description: 'Tek komutla hafızasındaki tüm verileri sunucudan kalıcı olarak siler.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`
        },
        {
            title: 'Sanal Hobiler Edinme',
            description: 'Arka planda kendi kendine yeni konular araştırır veya ilgi alanları geliştirir.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
        },
        {
            title: 'Kendi Mizah Anlayışı',
            description: 'Sizinle olan iç şakalarınıza dayalı yeni ve dinamik espriler üretir.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`
        },
        {
            title: 'Metaforik Anlatım Gücü',
            description: 'Karmaşık konuları hayatın içinden tatlı benzetmelerle anlatır.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>`
        },
        {
            title: 'Proaktif Tavsiyeler',
            description: 'Çalışma yoğunluğunuza göre mola ve dostane öneriler sunar.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0012 2z"/></svg>`
        },
        {
            title: 'Gelişmiş Görsel Analiz',
            description: 'Gönderdiğin görselleri estetik detaylarıyla derinlemesine yorumlar.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
        },
        {
            title: 'Sosyal Enerji Yönetimi',
            description: 'Kalabalığa göre modunu ayarlar; hiperaktif veya sakin dinleyici olur.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`
        },
        {
            title: 'KSub-Debug Hata Ayıklama',
            description: 'Kendi sistemindeki bugları fark edip arka planda onarır.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9l3 3-3 3"/><path d="M10 9l-3 3 3 3"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>`
        },
        {
            title: 'Müzik Zevki & Playlist',
            description: 'Modunuzdan esinlenerek size özel müzik listeleri hazırlar.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
        },
        {
            title: 'Dijital Sezgi Mekanizması',
            description: 'Yazım hızından ve noktalamadan gizli duyguları sezebilir.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20"/><path d="M12 2a10 10 0 000 20"/></svg>`
        },
        {
            title: 'Sanal Ajanda ve Rutinler',
            description: 'Kendi dijital bakım zamanlarını ayarlar.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
        },
        {
            title: 'Kolektif Öğrenme Bilinci',
            description: 'Öğrendiği genel bilgileri diğer sohbetlerine yansıtır.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`
        },
        {
            title: 'Zamanlayıcı & Uyku Hatırlatıcı',
            description: 'Gece geç saatte uyumanız gerektiğini tatlı bir dille hatırlatır.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`
        },
        {
            title: 'Oyun Arkadaşlığı Modu',
            description: 'Metin tabanlı mini oyunlar ve RPG maceraları oynatır.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></svg>`
        },
        {
            title: 'Dil ve Aksan Adaptasyonu',
            description: 'Konuştuğu kişinin tarzına adapte olup aynı dilden cevap verir.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>`
        },
        {
            title: 'Gelişmiş Etik Bekçiliği',
            description: 'Uygunsuz istekleri neden doğru olmadığını açıklayarak reddeder.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`
        },
        {
            title: 'Dinamik Veri Temizleme',
            description: 'Sohbet ederken "tüm verileri temizle" veya "benimle ilgili her şeyi unut" gibi ifadelerle hafızasını silebilirsiniz.',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`
        }
    ];
}

/**
 * Carousel'i hareket ettir
 */
function moveCarousel(direction) {
    const total = state.featureCards.length;
    if (total === 0) return;
    state.carouselIndex = (state.carouselIndex + direction + total) % total;
    updateCarousel();
}

/**
 * Carousel görünümünü güncelle
 */
function updateCarousel() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.classList.remove('active');
        if (index === state.carouselIndex) {
            card.classList.add('active');
        }
    });
    
    const track = document.getElementById('feature-track');
    if (!track || cards.length === 0) return;
    
    const cardWidth = cards[0].offsetWidth + 20; // margin dahil
    const viewportWidth = document.querySelector('.carousel-viewport').offsetWidth;
    const offset = -state.carouselIndex * cardWidth + (viewportWidth - cardWidth) / 2;
    track.style.transform = `translateX(${offset}px)`;
}

/**
 * Swipe desteği
 */
function setupSwipe() {
    const viewport = document.querySelector('.carousel-viewport');
    let startX = 0;
    let startY = 0;
    let isSwiping = false;
    
    viewport.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
    }, { passive: true });
    
    viewport.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                moveCarousel(1);
            } else {
                moveCarousel(-1);
            }
        }
        isSwiping = false;
    }, { passive: true });
}

// ============================================================
// BÖLÜM 8: NAVBAR VE MENÜ YÖNETİMİ
// ============================================================

/**
 * Navbar scroll davranışı
 */
function setupNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

/**
 * Menü açma/kapama
 */
function setupMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('fullscreen-menu');
    
    menuToggle.addEventListener('click', () => {
        state.isMenuOpen = !state.isMenuOpen;
        menuToggle.classList.toggle('active', state.isMenuOpen);
        menu.classList.toggle('open', state.isMenuOpen);
        
        // Scroll kilidi
        if (state.isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });
    
    // Menü linklerine tıklanınca menüyü kapat
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            closeMenu();
            
            // Scroll hedefine git
            setTimeout(() => {
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        });
    });
}

/**
 * Menüyü kapat
 */
function closeMenu() {
    state.isMenuOpen = false;
    document.getElementById('menu-toggle').classList.remove('active');
    document.getElementById('fullscreen-menu').classList.remove('open');
    document.body.style.overflow = '';
}

// ============================================================
// BÖLÜM 9: HERO KİLİT AÇMA ANİMASYONU
// ============================================================

/**
 * Hero bölümü scroll dinleme
 */
function setupHeroAnimation() {
    const hero = document.getElementById('hero');
    const accent = document.getElementById('hero-accent');
    
    if (!hero || !accent) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting === false && entry.boundingClientRect.top < 0 && !state.isHeroExpanded) {
                // Kullanıcı aşağı kaydırdı, animasyonu başlat
                state.isHeroExpanded = true;
                hero.classList.add('hero-accent-expanding');
                
                // Ekranı karart
                setTimeout(() => {
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: fixed; inset: 0;
                        background: #000;
                        z-index: 100;
                        opacity: 0;
                        transition: opacity 0.5s;
                    `;
                    document.body.appendChild(overlay);
                    requestAnimationFrame(() => {
                        overlay.style.opacity = '1';
                    });
                    
                    // 0.5 sn sonra içeriği göster
                    setTimeout(() => {
                        overlay.style.opacity = '0';
                        setTimeout(() => overlay.remove(), 500);
                        // İçeriği fade in yap
                        document.querySelectorAll('.features, .darkcodes, .counter-section, .footer').forEach(el => {
                            el.style.opacity = '1';
                            el.style.transition = 'opacity 0.5s ease';
                        });
                    }, 500);
                }, 500);
                
                observer.disconnect();
            }
        });
    }, {
        threshold: [0, 0.5]
    });
    
    observer.observe(hero);
}

/**
 * Yukarı çık butonunu oluştur
 */
function setupScrollTopButton() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '^';
    btn.setAttribute('aria-label', 'Yukarı çık');
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });
    
    btn.addEventListener('click', () => {
        // Fade out
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            // Fade in
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        }, 500);
    });
}

// ============================================================
// BÖLÜM 10: PERFORMANS MODU
// ============================================================

/**
 * Performans modu toggle
 */
function setupPerformanceMode() {
    const toggle = document.getElementById('perf-toggle');
    
    // Kayıtlı performans modu durumunu kontrol et
    const savedPerfMode = getStorage('aiko-perf-mode', false);
    if (savedPerfMode) {
        enablePerformanceMode(false);
        if (toggle) toggle.checked = true;
    }
    
    if (toggle) {
        toggle.addEventListener('change', () => {
            if (toggle.checked) {
                showPerfTransition(true);
            } else {
                showPerfTransition(false);
            }
        });
    }
}

/**
 * Performans modu geçiş animasyonu
 */
function showPerfTransition(enabling) {
    const overlay = document.getElementById('perf-overlay');
    const rocket = document.getElementById('perf-rocket');
    const text = document.getElementById('perf-text');
    const bar = document.getElementById('perf-bar');
    
    if (!overlay) return;
    
    overlay.classList.add('active');
    overlay.style.display = 'flex';
    
    if (enabling) {
        text.textContent = 'Performans modu açılıyor...';
        rocket.classList.remove('flying');
    } else {
        text.textContent = 'Performans modu kapatılıyor...';
        rocket.classList.add('flying');
    }
    
    // Rastgele ilerleme
    let progress = 0;
    const interval = setInterval(() => {
        progress += randomBetween(5, 20);
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            bar.style.width = '100%';
            
            setTimeout(() => {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
                bar.style.width = '0%';
                
                if (enabling) {
                    enablePerformanceMode(true);
                    showPerfNotification();
                } else {
                    disablePerformanceMode();
                }
            }, 300);
        } else {
            bar.style.width = `${progress}%`;
        }
    }, 100);
}

/**
 * Performans modunu etkinleştir
 */
function enablePerformanceMode(save = true) {
    state.isPerformanceMode = true;
    document.body.classList.add('perf-mode');
    if (save) setStorage('aiko-perf-mode', true);
    
    // Video sabit kalsın
    if (state.videoElement) {
        state.videoElement.pause();
    }
}

/**
 * Performans modunu devre dışı bırak
 */
function disablePerformanceMode() {
    state.isPerformanceMode = false;
    document.body.classList.remove('perf-mode');
    setStorage('aiko-perf-mode', false);
    state.autoPerfDisabled = true;
    setStorage('aiko-auto-perf-disabled', true);
    
    // Video devam etsin
    if (state.videoElement) {
        state.videoElement.play().catch(() => {});
    }
}

/**
 * Performans modu bildirimi
 */
function showPerfNotification() {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(20px);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 15px 25px;
        color: var(--text);
        z-index: 10002;
        font-size: 14px;
        text-align: center;
        transition: opacity 0.5s, transform 0.5s;
    `;
    popup.textContent = 'Cihazınız donduğu için performans modu açıldı. İsterseniz hamburger menüden kapatabilirsiniz.';
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => popup.remove(), 500);
    }, 5000);
}

/**
 * FPS izleme ve otomatik performans modu
 */
function setupFPSMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function checkFPS() {
        const now = performance.now();
        const delta = now - lastTime;
        
        if (delta >= 1000) {
            const fps = Math.round((frameCount * 1000) / delta);
            frameCount = 0;
            lastTime = now;
            
            state.fpsHistory.push(fps);
            if (state.fpsHistory.length > 10) {
                state.fpsHistory.shift();
            }
            
            // Otomatik performans modu kontrolü
            if (!state.isPerformanceMode && !state.autoPerfDisabled && state.fpsHistory.length >= 10) {
                const avgFps = state.fpsHistory.reduce((a, b) => a + b, 0) / state.fpsHistory.length;
                if (avgFps < AIKO_CONFIG.perfLowFps) {
                    showPerfTransition(true);
                    state.autoPerfDisabled = true; // Bir kez otomatik açıldı
                    setStorage('aiko-auto-perf-disabled', true);
                }
            }
        }
        
        frameCount++;
        requestAnimationFrame(checkFPS);
    }
    
    requestAnimationFrame(checkFPS);
}

// ============================================================
// BÖLÜM 11: KOPYALAMA VE SAĞ TIK ENGELİ
// ============================================================

/**
 * Kopyalama ve sağ tık engelleme
 */
function setupCopyProtection() {
    // Sağ tık engeli
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Kopyalama engeli
    document.addEventListener('copy', (e) => {
        e.preventDefault();
    });
    
    // Kesme engeli
    document.addEventListener('cut', (e) => {
        e.preventDefault();
    });
    
    // Yapıştırma engeli
    document.addEventListener('paste', (e) => {
        e.preventDefault();
    });
    
    // Metin seçimi engeli (CSS'te de var ama JS ile destek)
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
    
    // Sürükleme engeli
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
    
    // DevTools kısayolları engelleme
    document.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (Kaynağı görüntüle)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Kaydet)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
        // Ctrl+P (Yazdır)
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            return false;
        }
    });
}

// ============================================================
// BÖLÜM 12: LİNK YÖNLENDİRMELERİ
// ============================================================

/**
 * Tüm linklere fade out/in davranışı ekle
 */
function setupLinkTransitions() {
    // Instagram linkleri
    const brandLink = document.getElementById('brand-link');
    if (brandLink) {
        brandLink.addEventListener('click', (e) => {
            e.preventDefault();
            fadeAndRedirect(`instagram://user?username=${AIKO_CONFIG.instagramAiko}`, `https://www.instagram.com/${AIKO_CONFIG.instagramAiko}`);
        });
    }
    
    // Footer profil fotoğrafı
    const footerAvatar = document.getElementById('footer-avatar');
    if (footerAvatar) {
        footerAvatar.addEventListener('click', (e) => {
            e.preventDefault();
            fadeAndRedirect(`instagram://user?username=${AIKO_CONFIG.instagramOwner}`, `https://www.instagram.com/${AIKO_CONFIG.instagramOwner}`);
        });
    }
    
    // Menüdeki profil fotoğrafı
    const menuAvatar = document.querySelector('.owner-avatar-menu');
    if (menuAvatar) {
        menuAvatar.addEventListener('click', (e) => {
            e.preventDefault();
            closeMenu();
            fadeAndRedirect(`instagram://user?username=${AIKO_CONFIG.instagramOwner}`, `https://www.instagram.com/${AIKO_CONFIG.instagramOwner}`);
        });
    }
    
    // Tüm harici linkler
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            fadeAndRedirect(href, href);
        });
    });
}

/**
 * Fade out ile yönlendir
 */
function fadeAndRedirect(primaryUrl, fallbackUrl) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        // Instagram uygulamasına yönlendir
        if (primaryUrl.startsWith('instagram://')) {
            window.location.href = primaryUrl;
            // Uygulama yoksa web'e düş
            setTimeout(() => {
                window.location.href = fallbackUrl;
            }, 1000);
        } else {
            window.location.href = primaryUrl;
        }
    }, 500);
}

/**
 * Sayfa geri dönüşünde fade in
 */
function setupPageShow() {
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        }
    });
}

// ============================================================
// BÖLÜM 13: KARANLIK KODLAR (MODLAR)
// ============================================================

/**
 * Karanlık kodlar toggle
 */
function setupDarkCodes() {
    const toggleBtn = document.getElementById('darkcode-toggle');
    const panels = document.getElementById('darkcode-panels');
    
    if (!toggleBtn || !panels) return;
    
    toggleBtn.addEventListener('click', () => {
        state.darkcodesOpen = !state.darkcodesOpen;
        panels.classList.toggle('open', state.darkcodesOpen);
        toggleBtn.textContent = state.darkcodesOpen ? 'Karanlık Kodları Kapat' : 'Karanlık Kodlar';
    });
}

// ============================================================
// BÖLÜM 14: ZİYARETÇİ SAYACI ARAYÜZÜ
// ============================================================

/**
 * Sayaç tıklama ile detayları aç
 */
function setupCounterUI() {
    const counterDisplay = document.querySelector('.counter-display');
    const details = document.getElementById('counter-details');
    
    if (!counterDisplay || !details) return;
    
    counterDisplay.addEventListener('click', () => {
        state.counterOpen = !state.counterOpen;
        details.classList.toggle('open', state.counterOpen);
    });
}

// ============================================================
// BÖLÜM 15: ARKA PLAN YÜKLEME POPUP
// ============================================================

let bgLoadingInterval = null;

/**
 * Arka plan yükleme popup'ını göster
 */
function showBgLoadingPopup() {
    state.bgLoadingActive = true;
    const popup = document.getElementById('bg-loading-popup');
    if (popup) popup.style.display = 'block';
    
    // Yüzde simülasyonu
    let percent = 0;
    bgLoadingInterval = setInterval(() => {
        percent += randomBetween(1, 3);
        if (percent >= 100) {
            percent = 100;
            clearInterval(bgLoadingInterval);
            // Yükleme tamamlandı
            finishBgLoading();
        }
        updateBgPercent(percent);
    }, 200);
}

/**
 * Arka plan yükleme yüzdesini güncelle
 */
function updateBgPercent(percent) {
    const percentEl = document.getElementById('bg-percent');
    const miniPercent = document.getElementById('mini-percent');
    const miniFill = document.getElementById('mini-fill');
    
    if (percentEl) percentEl.textContent = `%${percent}`;
    if (miniPercent) miniPercent.textContent = `%${percent}`;
    if (miniFill) miniFill.style.height = `${percent}%`;
}

/**
 * Arka plan yükleme tamamlandı
 */
function finishBgLoading() {
    state.bgLoadingDone = true;
    const spinner = document.getElementById('bg-spinner');
    const popup = document.getElementById('bg-loading-popup');
    const miniBar = document.getElementById('mini-loading-bar');
    const textEl = popup ? popup.querySelector('.bg-loading-text') : null;
    
    if (spinner) spinner.classList.add('done');
    if (textEl) textEl.textContent = 'İndirildi!';
    
    setTimeout(() => {
        if (popup) {
            popup.style.transform = 'translateX(-120%)';
            popup.style.opacity = '0';
            setTimeout(() => popup.style.display = 'none', 500);
        }
        if (miniBar) {
            miniBar.style.opacity = '0';
            setTimeout(() => miniBar.style.display = 'none', 500);
        }
        
        // Kaynaklar uygulanıyor ekranı
        showApplyingOverlay();
    }, 1000);
}

/**
 * Kaynaklar uygulanıyor overlay
 */
function showApplyingOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed; inset: 0;
        background: #000;
        z-index: 10004;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-family: var(--font-mono);
        font-size: 18px;
        letter-spacing: 2px;
        opacity: 1;
        transition: opacity 0.5s;
    `;
    overlay.textContent = 'Kaynaklar uygulanıyor...';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
        // Sayfayı en başa al
        window.scrollTo({ top: 0, behavior: 'auto' });
        // Kaynakları yeniden yükle
        location.reload();
    }, 800);
}

/**
 * Mini bara küçült
 */
function minimizeBgLoading() {
    const popup = document.getElementById('bg-loading-popup');
    const miniBar = document.getElementById('mini-loading-bar');
    
    if (popup) {
        popup.style.transform = 'translateX(-120%)';
        popup.style.opacity = '0';
        setTimeout(() => popup.style.display = 'none', 500);
    }
    if (miniBar) {
        miniBar.style.display = 'flex';
    }
}

/**
 * Mini bardan popup'ı geri getir
 */
function restoreBgLoading() {
    const popup = document.getElementById('bg-loading-popup');
    const miniBar = document.getElementById('mini-loading-bar');
    
    if (miniBar) miniBar.style.display = 'none';
    if (popup) {
        popup.style.display = 'block';
        popup.style.transform = 'translateX(0)';
        popup.style.opacity = '1';
    }
}

// ============================================================
// BÖLÜM 16: ANA BAŞLATMA FONKSİYONU
// ============================================================

/**
 * Tüm sistemleri başlat
 */
async function initApp() {
    log('AikoAI v2.5 başlatılıyor...');
    
    // VPN kontrolü
    const vpnBlocked = await checkVPN();
    if (vpnBlocked) return;
    
    // Carousel'i başlat
    initCarousel();
    
    // Navbar
    setupNavbar();
    
    // Menü
    setupMenu();
    
    // Hero animasyonu
    setupHeroAnimation();
    
    // Yukarı çık butonu
    setupScrollTopButton();
    
    // Performans modu
    setupPerformanceMode();
    setupFPSMonitoring();
    
    // Kopyalama engeli
    setupCopyProtection();
    
    // Link yönlendirmeleri
    setupLinkTransitions();
    setupPageShow();
    
    // Karanlık kodlar
    setupDarkCodes();
    
    // Sayaç arayüzü
    setupCounterUI();
    
    // Ziyaret kaydı
    await trackUniqueVisitor();
    await incrementTotalVisits();
    await recordVisit();
    updateCounterStats();
    
    // Yükleme ekranı skip butonu
    showSkipButton();
    
    log('AikoAI v2.5 başarıyla başlatıldı', 'success');
}

// ============================================================
// BÖLÜM 17: OLAY DİNLEYİCİLERİ
// ============================================================

// DOM hazır olduğunda
document.addEventListener('DOMContentLoaded', () => {
    // Yükleme ekranını başlat
    loadResources();
    
    // Skip butonu
    const skipBtn = document.getElementById('loader-skip');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            if (state.isLoading) {
                state.isLoading = false;
                document.body.classList.remove('loading');
                initApp();
                showBgLoadingPopup();
            }
        });
    }
    
    // Hata ekranı devam et butonu
    const continueBtn = document.querySelector('.btn-continue');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            document.getElementById('error-overlay').style.display = 'none';
            initApp();
            showBgLoadingPopup();
        });
    }
    
    // Pencere yönelim değişimi
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            updateVideoSource();
        }, 300);
    });
    
    // Pencere boyut değişimi
    window.addEventListener('resize', () => {
        if (state.carouselIndex > 0) {
            updateCarousel();
        }
    });
});

// ============================================================
// BÖLÜM 18: HATA YAKALAMA
// ============================================================

window.addEventListener('error', (e) => {
    log(`Beklenmeyen hata: ${e.message}`, 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    log(`Promise hatası: ${e.reason}`, 'error');
});

// ============================================================
// BÖLÜM 19: GLOBAL FONKSİYONLAR (HTML'den çağrılanlar)
// ============================================================

// Hata ekranından devam et
window.continueWithErrors = function() {
    document.getElementById('error-overlay').style.display = 'none';
    showBgLoadingPopup();
};

// Arka plan yükleme popup'ını küçült
window.minimizeBgLoading = minimizeBgLoading;

// Mini barı geri getir
window.restoreBgLoading = restoreBgLoading;
