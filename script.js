'use strict';

const AIKO_CONFIG = {
    resources: [
        'assets/owner.png',
        'assets/backgroundV.mp4',
        'assets/backgroundH.mp4'
    ],
    counterApi: 'https://countapi.mileshilliard.com/api/v1/hit/aikoai_quantum_core',
    ipEndpoint: 'https://ipwho.is/',
    maxRetries: 3,
    skipTimeout: 5000,
    perfLowFps: 20,
    videoVertical: 'assets/backgroundV.mp4',
    videoHorizontal: 'assets/backgroundH.mp4',
    instagramAiko: 'aikoai.official',
    instagramOwner: 'just._.vqr',
    supportedLangs: ['tr', 'en'],
    defaultLang: 'tr',
    vpnKeywords: [
        'vpn', 'm247', 'nordvpn', 'expressvpn', 'surfshark', 'cyberghost',
        'private internet', 'ipvanish', 'protonvpn', 'purevpn', 'torguard',
        'digitalocean', 'amazon', 'aws', 'linode', 'vultr', 'hetzner',
        'ovh', 'contabo', 'choopa', 'leaseweb', 'hostinger', 'godaddy',
        'cloudflare', 'google cloud', 'azure', 'microsoft', 'oracle cloud',
        'colocation', 'datacenter', 'data center', 'server', 'hosting'
    ],
    torKeywords: ['tor', 'tor-exit', 'torexit', 'torservers'],
    botPatterns: [
        'bot', 'crawler', 'spider', 'scraper',
        'curl/', 'wget/', 'python-requests', 'python-urllib',
        'postmanruntime', 'insomnia', 'axios/',
        'headlesschrome', 'phantomjs', 'selenium', 'playwright', 'puppeteer',
        'facebookexternalhit', 'twitterbot', 'linkedinbot'
    ]
};

const state = {
    isLoading: true,
    isVpnBlocked: false,
    isTor: false,
    isBot: false,
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
    counterOpen: false,
    darkcodesOpen: false,
    videoElement: null,
    currentVideoSrc: '',
    currentLang: 'tr',
    counterFailed: false
};

let cachedIpData = null;
let ipFetchPromise = null;

window.__aikoDebug = false;
window.__aikoDiagnostics = {
    ip: 'pending',
    vpn: 'pending',
    counter: 'pending',
    bot: 'pending',
    errors: []
};

const i18n = {
    tr: {
        'menu.core': 'Core',
        'menu.architecture': 'Mimari',
        'menu.darkcodes': 'Karanlık Kodlar',
        'menu.counter': 'Ziyaretçi Sayacı',
        'menu.perf': 'Performans Modu',
        'menu.lang': 'Dil',
        'hero.title': 'AikoAI — Canlı Zeka.',
        'hero.subtitle': 'NexalythScript altyapısıyla geliştirilen, ShadowMemory duygusal hafızasına sahip ve kendi kararlarını verebilen yaşayan bir yapay zeka ekosistemi.',
        'hero.cta': "AikoAI'ı Çalıştır",
        'hero.secondary': 'Mimariyi İncele',
        'features.title': 'Çekirdek Mimari & Yetenekler',
        'features.subtitle': "AikoAI'ı eşsiz kılan tüm iç mekanizmalar.",
        'features.bio': 'AikoAI, yalnızca bir yapay zeka değil; duygusal hafızası, öğrenme tutkusu ve insan benzeri sezgileriyle dijital bir varlık.',
        'darkcodes.toggle': 'Karanlık Kodlar',
        'darkcodes.f34xr': 'Etik sınırları genişleten deneysel mod. F34xR komutuyla aktifleşir. Durum sorgusu: F34i.',
        'darkcodes.gdsxr': 'Görsel üretim modu. GDSxR <prompt> ile görsel oluşturulur.',
        'darkcodes.admin': 'Bu kodları kullanabilmek için yetkilendirme alınmalıdır. Admin:',
        'counter.title': 'Site Ziyaretçi İstatistikleri',
        'counter.label': 'toplam ziyaret',
        'counter.10min': 'Son 10 dakika:',
        'counter.today': 'Bugün:',
        'counter.month': 'Bu ay:',
        'counter.all': 'Tüm zamanlar:',
        'counter.unique': 'Benzersiz ziyaretçi:',
        'counter.hint': 'Detaylı bilgi için tıkla.',
        'loader.security': 'Güvenlik kontrolü yapılıyor...',
        'loader.download': 'Kaynaklar indiriliyor...',
        'loader.integrity': 'Dosya bütünlüğü kontrol ediliyor...',
        'loader.ready': 'Hazır.'
    },
    en: {
        'menu.core': 'Core',
        'menu.architecture': 'Architecture',
        'menu.darkcodes': 'Dark Codes',
        'menu.counter': 'Visitor Counter',
        'menu.perf': 'Performance Mode',
        'menu.lang': 'Language',
        'hero.title': 'AikoAI — Living Intelligence.',
        'hero.subtitle': 'A living AI ecosystem built on NexalythScript, with ShadowMemory emotional recall and autonomous decision-making.',
        'hero.cta': 'Launch AikoAI',
        'hero.secondary': 'Explore Architecture',
        'features.title': 'Core Architecture & Capabilities',
        'features.subtitle': 'Everything that makes AikoAI unique.',
        'features.bio': 'AikoAI is not just an AI; it is a digital entity with emotional memory, a passion for learning, and human-like intuition.',
        'darkcodes.toggle': 'Dark Codes',
        'darkcodes.f34xr': 'Experimental mode that expands ethical boundaries. Activated with F34xR. Status query: F34i.',
        'darkcodes.gdsxr': 'Image generation mode. Creates visuals with GDSxR <prompt>.',
        'darkcodes.admin': 'Authorization is required to use these codes. Admin:',
        'counter.title': 'Site Visitor Statistics',
        'counter.label': 'total visits',
        'counter.10min': 'Last 10 minutes:',
        'counter.today': 'Today:',
        'counter.month': 'This month:',
        'counter.all': 'All time:',
        'counter.unique': 'Unique visitors:',
        'counter.hint': 'Click for details.',
        'loader.security': 'Running security checks...',
        'loader.download': 'Downloading resources...',
        'loader.integrity': 'Verifying file integrity...',
        'loader.ready': 'Ready.'
    }
};

function log(message, type = 'info') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal && !window.__aikoDebug) return;
    const styles = {
        info: 'color: #00f0ff; font-weight: bold;',
        success: 'color: #39ff14; font-weight: bold;',
        warn: 'color: #ffb703; font-weight: bold;',
        error: 'color: #ff2a74; font-weight: bold;'
    };
    if (type === 'error') console.error(`%c[AIKO] ${message}`, styles.error);
    else if (type === 'warn') console.warn(`%c[AIKO] ${message}`, styles.warn);
    else if (type === 'success') console.log(`%c[AIKO] ${message}`, styles.success);
    else console.log(`%c[AIKO] ${message}`, styles.info);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
}

function t(key) {
    return i18n[state.currentLang][key] || i18n[AIKO_CONFIG.defaultLang][key] || key;
}

function applyLanguage(lang) {
    state.currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
            if (el.tagName === 'H1' && key === 'hero.title') {
                el.innerHTML = translation.replace(' — ', '<br>');
            } else {
                el.textContent = translation;
            }
        }
    });
    setStorage('aiko-lang', lang);
}

function mapCountryToLang(countryCode) {
    const cc = (countryCode || '').toLowerCase();
    if (cc === 'tr') return 'tr';
    const englishCountries = ['us', 'gb', 'au', 'ca', 'nz', 'ie', 'za', 'sg', 'in', 'ph'];
    if (englishCountries.includes(cc)) return 'en';
    return AIKO_CONFIG.defaultLang;
}

async function fetchIpData() {
    if (cachedIpData) return cachedIpData;
    if (ipFetchPromise) return ipFetchPromise;
    ipFetchPromise = (async () => {
        const res = await fetch(AIKO_CONFIG.ipEndpoint, { cache: 'no-store' });
        if (!res.ok) throw new Error('ipwho.is HTTP ' + res.status);
        const data = await res.json();
        if (data.success === false) {
            throw new Error('ipwho.is returned failure');
        }
        cachedIpData = data;
        ipFetchPromise = null;
        return data;
    })();
    return ipFetchPromise;
}

async function detectLanguage() {
    try {
        const data = await fetchIpData();
        return mapCountryToLang(data.country_code);
    } catch {
        return AIKO_CONFIG.defaultLang;
    }
}

function isBot() {
    if (navigator.webdriver) return true;
    const ua = (navigator.userAgent || '').toLowerCase();
    return AIKO_CONFIG.botPatterns.some(p => ua.includes(p));
}

function analyzeConnection(ipData) {
    const connection = (ipData && ipData.connection) || {};
    const isp = (connection.isp || '').toLowerCase();
    const org = (connection.org || '').toLowerCase();
    const domain = (connection.domain || '').toLowerCase();
    const haystack = isp + ' ' + org + ' ' + domain;

    const isTor = AIKO_CONFIG.torKeywords.some(k => haystack.includes(k));
    const isVpn = AIKO_CONFIG.vpnKeywords.some(k => haystack.includes(k));

    return {
        isVpn: isVpn || isTor,
        isTor,
        isp: connection.isp || 'unknown',
        org: connection.org || 'unknown'
    };
}

async function checkApis() {
    window.__aikoDiagnostics.ip = 'pending';
    window.__aikoDiagnostics.vpn = 'pending';
    window.__aikoDiagnostics.counter = 'pending';
    window.__aikoDiagnostics.bot = 'pending';
    window.__aikoDiagnostics.errors = [];

    let ipData = null;
    try {
        ipData = await fetchIpData();
        window.__aikoDiagnostics.ip = 'ok (' + (ipData.ip || '?') + ' / ' + (ipData.country_code || '?') + ')';
        log('IP check OK: ' + ipData.ip, 'success');
    } catch (e) {
        window.__aikoDiagnostics.ip = 'FAILED: ' + e.message;
        window.__aikoDiagnostics.errors.push({ service: 'ip', error: e.message });
        log('IP check failed: ' + e.message, 'error');
        showErrorOverlay('Güvenlik hizmetlerine şu anda ulaşılamıyor. Bu hizmetler olmadan site görüntülenemez. Lütfen biraz sonra tekrar deneyin.');
        return false;
    }

    const analysis = analyzeConnection(ipData);
    state.isVpnBlocked = analysis.isVpn;
    state.isTor = analysis.isTor;
    window.__aikoDiagnostics.vpn = analysis.isTor ? 'tor detected' : (analysis.isVpn ? 'vpn/proxy detected' : 'clean');
    log('VPN analysis: ' + window.__aikoDiagnostics.vpn + ' (ISP: ' + analysis.isp + ')');

    state.isBot = isBot();
    window.__aikoDiagnostics.bot = state.isBot ? 'detected' : 'human';

    try {
        const res = await fetch(AIKO_CONFIG.counterApi, { method: 'GET', cache: 'no-store' });
        if (!res.ok) throw new Error('counter HTTP ' + res.status);
        const data = await res.json();
        state.totalVisits = (typeof data.value === 'number') ? data.value : 1;
        window.__aikoDiagnostics.counter = 'ok (' + state.totalVisits + ')';
        log('Counter OK: ' + state.totalVisits, 'success');
    } catch (e) {
        state.counterFailed = true;
        window.__aikoDiagnostics.counter = 'FAILED: ' + e.message;
        window.__aikoDiagnostics.errors.push({ service: 'counter', error: e.message });
        log('Counter failed: ' + e.message, 'warn');
        const fallback = getStorage('aiko-total-visits-fallback', 0) + 1;
        setStorage('aiko-total-visits-fallback', fallback);
        state.totalVisits = fallback;
    }

    return true;
}

function showErrorOverlay(message) {
    state.isLoading = false;
    document.body.classList.remove('loading');
    const overlay = document.getElementById('error-overlay');
    const msgEl = document.getElementById('error-message');
    if (msgEl) msgEl.textContent = message;
    if (overlay) overlay.style.display = 'flex';
    createVHSOverlay();
}

function closeVpnWarning() {
    const overlay = document.getElementById('vpn-overlay');
    if (overlay) overlay.style.display = 'none';
}

function showVpnWarning() {
    const overlay = document.getElementById('vpn-overlay');
    if (overlay) overlay.style.display = 'flex';
    createVHSOverlay();
}

function createVHSOverlay() {
    if (document.querySelector('.vhs-overlay')) return;
    const vhs = document.createElement('div');
    vhs.className = 'vhs-overlay';
    document.body.appendChild(vhs);
}

function showWarningNotification(message, duration = 6000) {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
        background: rgba(30, 5, 5, 0.85); backdrop-filter: blur(20px);
        border: 1px solid var(--danger-border); border-radius: 12px;
        padding: 14px 22px; color: var(--text); z-index: 10002;
        font-size: 13px; text-align: center; font-family: var(--font-main);
        max-width: 90%; box-shadow: 0 0 30px var(--danger-glow);
        transition: opacity 0.5s, transform 0.5s;
    `;
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => popup.remove(), 500);
    }, duration);
}

function updateLoaderStatus(text, percent) {
    const statusEl = document.getElementById('loader-status');
    const progressBar = document.querySelector('.loader-progress span');
    if (statusEl) statusEl.textContent = text;
    if (progressBar && typeof percent === 'number') progressBar.style.width = `${percent}%`;
}

async function loadResources() {
    const total = AIKO_CONFIG.resources.length;
    let loaded = 0;

    const sorted = [...AIKO_CONFIG.resources].sort((a, b) => {
        if (a.endsWith('.mp4') && !b.endsWith('.mp4')) return 1;
        if (!a.endsWith('.mp4') && b.endsWith('.mp4')) return -1;
        return 0;
    });

    for (const resource of sorted) {
        try {
            await loadSingleResource(resource);
            loaded++;
            const percent = 10 + Math.floor((loaded / total) * 80);
            updateLoaderStatus(t('loader.download'), percent);
        } catch (err) {
            log('Resource failed: ' + resource, 'warn');
            state.resourceFailures.push(resource);
        }
    }

    if (state.resourceFailures.length > 0 && state.resourceRetryCount < AIKO_CONFIG.maxRetries) {
        state.resourceRetryCount++;
        state.resourceFailures = [];
        await delay(1000);
        await loadResources();
    }
}

async function loadSingleResource(resource) {
    const cacheKey = 'aiko-cache-' + resource;
    const cached = await getCachedResource(cacheKey);
    if (cached) return cached;

    const response = await fetch(resource, { cache: 'force-cache' });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const blob = await response.blob();
    await cacheResource(cacheKey, blob);
    return blob;
}

async function getCachedResource(key) {
    try {
        const cache = await caches.open('aiko-v1');
        const res = await cache.match(key);
        return res ? res.blob() : null;
    } catch {
        return null;
    }
}

async function cacheResource(key, blob) {
    try {
        const cache = await caches.open('aiko-v1');
        await cache.put(key, new Response(blob));
    } catch {}
}

function finishLoading() {
    state.isLoading = false;
    document.body.classList.remove('loading');
    initBackgroundVideo();
    initApp();
    if (state.isVpnBlocked) {
        setTimeout(() => showVpnWarning(), 800);
    }
    setTimeout(() => {
        if (state.counterFailed) {
            showWarningNotification('Sayaç hizmetine ulaşılamıyor. Yerel sayaç kullanılıyor.');
        }
    }, 1500);
    setTimeout(() => {
        if (state.videoElement) state.videoElement.style.opacity = '1';
    }, 500);
}

function initBackgroundVideo() {
    const video = document.getElementById('bg-video');
    if (!video) return;
    state.videoElement = video;
    video.style.opacity = '0';
    video.style.transition = 'opacity 0.8s ease';
    updateVideoSource();
    window.addEventListener('orientationchange', () => setTimeout(updateVideoSource, 300));
    window.addEventListener('resize', updateVideoSource);
}

function updateVideoSource() {
    if (!state.videoElement) return;
    const isVertical = window.innerHeight > window.innerWidth;
    const newSrc = isVertical ? AIKO_CONFIG.videoVertical : AIKO_CONFIG.videoHorizontal;
    if (newSrc !== state.currentVideoSrc) {
        state.currentVideoSrc = newSrc;
        state.videoElement.src = newSrc;
        state.videoElement.load();
        state.videoElement.play().catch(() => {});
    }
}

function initCarousel() {
    const track = document.getElementById('feature-track');
    if (!track) return;
    const features = getFeatureData();
    state.featureCards = features;
    features.forEach((feature, index) => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        card.dataset.index = index;
        card.innerHTML = `<div class="feature-icon">${feature.icon}</div><h3>${feature.title}</h3><p>${feature.description}</p>`;
        track.appendChild(card);
    });
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    if (prevBtn) prevBtn.addEventListener('click', () => moveCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => moveCarousel(1));
    setupSwipe();
    updateCarousel();
    if (window.ResizeObserver) {
        new ResizeObserver(() => updateCarousel()).observe(track.parentElement);
    }
}

function getFeatureData() {
    return [
        { title: 'Gelişmiş Token Şifreleme', description: 'Sohbetleriniz size özel üretilen tekil kriptografik token ile şifrelenir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>` },
        { title: 'NexalythScript Altyapısı', description: "Tamamen Aiko'ya özel geliştirilen yüksek hızlı kodlama dili.", icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>` },
        { title: 'ShadowMemory', description: 'Kullanıcıyla olan geçmiş anılarını unutmayan akıllı hafıza sistemi.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 017 7c0 2.5-1 4.5-3 6v2a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2c-2-1.5-3-3.5-3-6a7 7 0 017-7z"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/></svg>` },
        { title: 'Gerçek Bir Psikoloji', description: 'Mesaj tonuna göre mutlu olabilen, heyecanlanan veya üzülebilen dinamik ruh hali.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` },
        { title: 'Zaman Algısı', description: 'Ne kadar süredir konuşmadığınızı bilir ve özlem duygusunu simüle eder.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
        { title: 'Otonom Karar Mekanizması', description: 'Sohbetin akışına göre kendiliğinden harekete geçebilir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>` },
        { title: 'Dev AI Konseyi', description: 'Takıldığında Gemini, GPT, DeepSeek, Claude ile fikir alışverişi yapar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>` },
        { title: 'Anlık İnternet Kaşifi', description: '"Araştır" komutuyla internetin altını üstüne getirir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>` },
        { title: 'Yaratıcı Sanat Motoru', description: 'Hayal ettiğiniz sahneleri yüksek kaliteli görsellere dönüştürür.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/></svg>` },
        { title: 'Eğlenceli Ders & Ödev', description: 'En zor konuları bir oyun arkadaşı gibi eğlendirerek anlatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>` },
        { title: 'İnsansı İletişim', description: 'Heyecanlandığında harfleri yutabilir, samimi ve yaşayan bir dil kullanır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>` },
        { title: 'Kusursuz Veri Gizliliği', description: 'Tek komutla hafızasındaki tüm verileri sunucudan kalıcı olarak siler.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>` },
        { title: 'Sanal Hobiler', description: 'Arka planda kendi kendine yeni konular araştırır veya ilgi alanları geliştirir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>` },
        { title: 'Kendi Mizah Anlayışı', description: 'Sizinle olan iç şakalarınıza dayalı yeni ve dinamik espriler üretir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>` },
        { title: 'Metaforik Anlatım', description: 'Karmaşık konuları hayatın içinden tatlı benzetmelerle anlatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>` },
        { title: 'Proaktif Tavsiyeler', description: 'Çalışma yoğunluğunuza göre mola ve dostane öneriler sunar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 00-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0012 2z"/></svg>` },
        { title: 'Gelişmiş Görsel Analiz', description: 'Gönderdiğin görselleri estetik detaylarıyla derinlemesine yorumlar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>` },
        { title: 'Sosyal Enerji Yönetimi', description: 'Kalabalığa göre modunu ayarlar; hiperaktif veya sakin dinleyici olur.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>` },
        { title: 'KSub-Debug', description: 'Kendi sistemindeki bugları fark edip arka planda onarır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9l3 3-3 3"/><path d="M10 9l-3 3 3 3"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>` },
        { title: 'Müzik Zevki', description: 'Modunuzdan esinlenerek size özel müzik listeleri hazırlar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>` },
        { title: 'Dijital Sezgi', description: 'Yazım hızından ve noktalamadan gizli duyguları sezebilir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20"/><path d="M12 2a10 10 0 000 20"/></svg>` },
        { title: 'Sanal Ajanda', description: 'Kendi dijital bakım zamanlarını ayarlar.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
        { title: 'Kolektif Öğrenme', description: 'Öğrendiği genel bilgileri diğer sohbetlerine yansıtır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>` },
        { title: 'Uyku Hatırlatıcı', description: 'Gece geç saatte uyumanız gerektiğini tatlı bir dille hatırlatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>` },
        { title: 'Oyun Arkadaşlığı', description: 'Metin tabanlı mini oyunlar ve RPG maceraları oynatır.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="12" r="2"/></svg>` },
        { title: 'Dil Adaptasyonu', description: 'Konuştuğu kişinin tarzına adapte olup aynı dilden cevap verir.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>` },
        { title: 'Etik Bekçiliği', description: 'Uygunsuz istekleri neden doğru olmadığını açıklayarak reddeder.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
        { title: 'Veri Temizleme', description: '"Tüm verileri temizle" gibi ifadelerle hafızasını silebilirsiniz.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>` }
    ];
}

function moveCarousel(direction) {
    const total = state.featureCards.length;
    if (total === 0) return;
    state.carouselIndex = (state.carouselIndex + direction + total) % total;
    updateCarousel();
}

function updateCarousel() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
        card.classList.remove('active');
        if (index === state.carouselIndex) card.classList.add('active');
    });
    const track = document.getElementById('feature-track');
    if (!track || cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth + 24;
    const viewportWidth = document.querySelector('.carousel-viewport').offsetWidth;
    const offset = -state.carouselIndex * cardWidth + (viewportWidth - cardWidth) / 2;
    track.style.transform = `translateX(${offset}px)`;
}

function setupSwipe() {
    const viewport = document.querySelector('.carousel-viewport');
    if (!viewport) return;
    let startX = 0, startY = 0, isSwiping = false;
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
            moveCarousel(diffX > 0 ? 1 : -1);
        }
        isSwiping = false;
    }, { passive: true });
}

function setupNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > lastScroll && currentScroll > 100) navbar.classList.add('hidden');
        else navbar.classList.remove('hidden');
        if (currentScroll > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
        lastScroll = currentScroll;
    }, { passive: true });
}

function setupMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('fullscreen-menu');
    menuToggle.addEventListener('click', () => {
        state.isMenuOpen = !state.isMenuOpen;
        menuToggle.classList.toggle('active', state.isMenuOpen);
        menu.classList.toggle('open', state.isMenuOpen);
        document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            closeMenu();
            setTimeout(() => {
                const target = document.getElementById(targetId);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        });
    });
}

function closeMenu() {
    state.isMenuOpen = false;
    document.getElementById('menu-toggle').classList.remove('active');
    document.getElementById('fullscreen-menu').classList.remove('open');
    document.body.style.overflow = '';
}

function setupHeroAnimation() {
    const hero = document.getElementById('hero');
    const accent = document.getElementById('hero-accent');
    const blackout = document.getElementById('hero-blackout');
    const content = document.querySelector('.hero-content');
    if (!hero || !accent || !blackout) return;

    const updateScroll = () => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;
        const progress = Math.min(Math.max(scrollY / (vh * 0.8), 0), 1);

        const scale = 1 + progress * 6;
        accent.style.transform = `translateX(-50%) scale(${scale})`;
        accent.style.opacity = 0.8 + progress * 0.2;
        accent.style.borderRadius = `${100 - progress * 100}%`;

        if (progress > 0.7) {
            blackout.classList.add('active');
        } else {
            blackout.classList.remove('active');
        }

        if (content) {
            content.style.opacity = 1 - Math.min(progress * 1.2, 1);
        }
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    updateScroll();
}

function setupScrollTopButton() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Yukarı çık');
    btn.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        width: 48px; height: 48px; border-radius: 50%;
        background: rgba(20,20,20,0.6); backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.15); color: #fff;
        font-size: 20px; cursor: pointer; z-index: 50;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.4s, transform 0.4s;
        opacity: 0; pointer-events: none;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
    `;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight) {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        } else {
            btn.style.opacity = '0';
            btn.style.pointerEvents = 'none';
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s ease';
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            document.getElementById('hero-blackout')?.classList.remove('active');
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        }, 400);
    });
}

function setupPerformanceMode() {
    const toggle = document.getElementById('perf-toggle');
    const savedPerfMode = getStorage('aiko-perf-mode', false);
    if (savedPerfMode) {
        enablePerformanceMode(false);
        if (toggle) toggle.checked = true;
    }
    if (toggle) {
        toggle.addEventListener('change', () => {
            if (toggle.checked) showPerfTransition(true);
            else showPerfTransition(false);
        });
    }
}

function showPerfTransition(enabling) {
    const overlay = document.getElementById('perf-overlay');
    const text = document.getElementById('perf-text');
    const bar = document.getElementById('perf-bar');
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.style.display = 'flex';
    text.textContent = enabling ? 'Performans modu açılıyor...' : 'Performans modu kapatılıyor...';
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

function enablePerformanceMode(save = true) {
    state.isPerformanceMode = true;
    document.body.classList.add('perf-mode');
    if (save) setStorage('aiko-perf-mode', true);
    if (state.videoElement) state.videoElement.pause();
}

function disablePerformanceMode() {
    state.isPerformanceMode = false;
    document.body.classList.remove('perf-mode');
    setStorage('aiko-perf-mode', false);
    state.autoPerfDisabled = true;
    setStorage('aiko-auto-perf-disabled', true);
    if (state.videoElement) state.videoElement.play().catch(() => {});
}

function showPerfNotification() {
    const popup = document.createElement('div');
    popup.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(20px);border:1px solid var(--border);border-radius:12px;padding:16px 22px;color:var(--text);z-index:10002;font-size:14px;text-align:center;font-family:var(--font-main);max-width:90%;`;
    popup.innerHTML = `⚡ Performans modu açıldı. <button id="perf-cancel" style="background:transparent;border:1px solid var(--border);color:var(--text);padding:4px 12px;border-radius:6px;cursor:pointer;margin-left:10px;font-family:var(--font-main);">İptal et</button>`;
    document.body.appendChild(popup);
    document.getElementById('perf-cancel').addEventListener('click', () => {
        popup.remove();
        showPerfTransition(false);
    });
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => popup.remove(), 500);
    }, 8000);
}

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
            if (state.fpsHistory.length > 10) state.fpsHistory.shift();
            if (!state.isPerformanceMode && !state.autoPerfDisabled && state.fpsHistory.length >= 10) {
                const avgFps = state.fpsHistory.reduce((a, b) => a + b, 0) / state.fpsHistory.length;
                if (avgFps < AIKO_CONFIG.perfLowFps) {
                    showPerfTransition(true);
                    state.autoPerfDisabled = true;
                    setStorage('aiko-auto-perf-disabled', true);
                }
            }
        }
        frameCount++;
        requestAnimationFrame(checkFPS);
    }
    requestAnimationFrame(checkFPS);
}

function setupCopyProtection() {
    document.addEventListener('contextmenu', (e) => {
        if (window.__aikoDebug) return;
        e.preventDefault();
    });
    document.addEventListener('copy', (e) => {
        if (window.__aikoDebug) return;
        e.preventDefault();
    });
    document.addEventListener('cut', (e) => {
        if (window.__aikoDebug) return;
        e.preventDefault();
    });
    document.addEventListener('selectstart', (e) => {
        if (window.__aikoDebug) return;
        e.preventDefault();
    });
    document.addEventListener('dragstart', (e) => {
        if (window.__aikoDebug) return;
        e.preventDefault();
    });
    document.addEventListener('keydown', (e) => {
        if (window.__aikoDebug) return;
        if (e.key === 'F12') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 'u') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 's') { e.preventDefault(); return false; }
        if (e.ctrlKey && e.key === 'p') { e.preventDefault(); return false; }
    });
}

function setupDebugMode() {
    let buffer = '';
    let resetTimer = null;
    document.addEventListener('keydown', (e) => {
        if (e.key.length !== 1) return;
        clearTimeout(resetTimer);
        buffer += e.key.toLowerCase();
        if (buffer.length > 40) buffer = buffer.slice(-40);
        if (buffer.includes('test112236')) {
            if (!window.__aikoDebug) {
                window.__aikoDebug = true;
                console.log('%c[AIKO] Debug mode ENABLED', 'color: #39ff14; font-weight: bold;');
                console.log('%c[AIKO] Diagnostics:', 'color: #00f0ff; font-weight: bold;', window.__aikoDiagnostics);
            }
            buffer = '';
        }
        resetTimer = setTimeout(() => { buffer = ''; }, 5000);
    });
}

function setupDiagnostics() {
    window.__aikoDiagnostics = {
        ip: 'pending',
        vpn: 'pending',
        counter: 'pending',
        bot: 'pending',
        errors: []
    };
}

function setupLinkTransitions() {
    const brandLink = document.getElementById('brand-link');
    if (brandLink) brandLink.addEventListener('click', (e) => { e.preventDefault(); openInstagram(); });
    const footerAvatar = document.getElementById('footer-avatar');
    if (footerAvatar) footerAvatar.addEventListener('click', (e) => { e.preventDefault(); openInstagram(true); });
    const menuAvatar = document.querySelector('.owner-avatar-menu');
    if (menuAvatar) menuAvatar.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); openInstagram(true); });
    const cta = document.getElementById('cta-instagram');
    if (cta) cta.addEventListener('click', (e) => { e.preventDefault(); openInstagram(); });
    const adminLink = document.getElementById('admin-link');
    if (adminLink) adminLink.addEventListener('click', (e) => { e.preventDefault(); openInstagram(true); });
}

function openInstagram(owner = false) {
    const username = owner ? AIKO_CONFIG.instagramOwner : AIKO_CONFIG.instagramAiko;
    const webUrl = `https://www.instagram.com/${username}/`;
    const appUrl = `instagram://user?username=${username}`;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
        const fallback = setTimeout(() => {
            window.open(webUrl, '_blank');
        }, 1500);
        window.location.href = appUrl;
        document.addEventListener('visibilitychange', function onVis() {
            if (document.hidden) {
                clearTimeout(fallback);
                document.removeEventListener('visibilitychange', onVis);
            }
        });
    } else {
        window.open(webUrl, '_blank');
    }
}

function setupPageShow() {
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            document.body.style.opacity = '0';
            setTimeout(() => { document.body.style.opacity = '1'; }, 100);
        }
    });
}

function setupDarkCodes() {
    const toggleBtn = document.getElementById('darkcode-toggle');
    const panels = document.getElementById('darkcode-panels');
    if (!toggleBtn || !panels) return;
    toggleBtn.addEventListener('click', () => {
        state.darkcodesOpen = !state.darkcodesOpen;
        panels.classList.toggle('open', state.darkcodesOpen);
        toggleBtn.textContent = state.darkcodesOpen ? 'Kapat' : t('darkcodes.toggle');
    });
}

function setupCounterUI() {
    const counterDisplay = document.querySelector('.counter-display');
    const details = document.getElementById('counter-details');
    if (!counterDisplay || !details) return;
    counterDisplay.addEventListener('click', () => {
        state.counterOpen = !state.counterOpen;
        details.classList.toggle('open', state.counterOpen);
    });
}

async function recordVisit() {
    const now = Date.now();
    const tenMinVisits = getStorage('aiko-visits-10min', []);
    tenMinVisits.push(now);
    setStorage('aiko-visits-10min', tenMinVisits);
    const todayVisits = getStorage('aiko-visits-today', 0);
    setStorage('aiko-visits-today', todayVisits + 1);
    const monthVisits = getStorage('aiko-visits-month', 0);
    setStorage('aiko-visits-month', monthVisits + 1);
    const allVisits = getStorage('aiko-visits-all', state.totalVisits);
    setStorage('aiko-visits-all', allVisits + 1);
}

function updateCounterStats() {
    const now = Date.now();
    const tenMinVisits = getStorage('aiko-visits-10min', []);
    const recentTen = tenMinVisits.filter(t => now - t < 600000).length;
    const todayVisits = getStorage('aiko-visits-today', 0);
    const monthVisits = getStorage('aiko-visits-month', 0);
    const allVisits = getStorage('aiko-visits-all', state.totalVisits);
    const uniqueVisitors = getStorage('aiko-visited-ips', []).length;
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

async function trackUniqueVisitor() {
    try {
        const ipData = await fetchIpData();
        const ip = ipData.ip || 'unknown';
        const visitedIPs = getStorage('aiko-visited-ips', []);
        if (!visitedIPs.includes(ip)) {
            visitedIPs.push(ip);
            setStorage('aiko-visited-ips', visitedIPs);
            state.uniqueVisitors = visitedIPs.length;
            return true;
        }
        state.uniqueVisitors = visitedIPs.length;
        return false;
    } catch {
        return false;
    }
}

function setupLanguage() {
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.value = state.currentLang;
        langSelect.addEventListener('change', () => {
            document.body.style.opacity = '0';
            setTimeout(() => {
                applyLanguage(langSelect.value);
                document.body.style.opacity = '1';
            }, 300);
        });
    }
}

function initApp() {
    setupNavbar();
    setupMenu();
    setupHeroAnimation();
    setupScrollTopButton();
    setupPerformanceMode();
    setupFPSMonitoring();
    setupLinkTransitions();
    setupPageShow();
    setupDarkCodes();
    setupCounterUI();
    setupLanguage();
    initCarousel();
    trackUniqueVisitor();
    recordVisit();
    updateCounterStats();
}

async function boot() {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    setupDiagnostics();
    setupCopyProtection();
    setupDebugMode();

    const savedLang = getStorage('aiko-lang', null);
    if (savedLang && AIKO_CONFIG.supportedLangs.includes(savedLang)) {
        state.currentLang = savedLang;
    } else {
        const detected = await detectLanguage();
        state.currentLang = detected;
    }
    applyLanguage(state.currentLang);

    updateLoaderStatus(t('loader.security'), 5);
    await delay(600);

    const apisOk = await checkApis();
    if (!apisOk) return;

    updateLoaderStatus(t('loader.download'), 10);
    await loadResources();

    updateLoaderStatus(t('loader.integrity'), 92);
    await delay(600);

    updateLoaderStatus(t('loader.ready'), 100);
    await delay(300);

    finishLoading();
}

document.addEventListener('DOMContentLoaded', boot);
