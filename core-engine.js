/**
 * ==========================================================================
 * AIKOAI SYSTEMS CORE CORE-ENGINE v2.5 - SECURITY OVERRIDE EDITION
 * HIGH-PERFORMANCE QUANTUM NEURAL INTEGRATION & ACCESS CONTROL MOTOR
 * --------------------------------------------------------------------------
 * Developed for NexalythScript Compilation Environment
 * Project Status: Early Access v2.5 [Overclock Security Build]
 * Powered by AikoAI Labs © 2026
 * ==========================================================================
 */

(function () {
    'use strict';

    // ==========================================================================
    // GLOBAL SYSTEM CONFIGURATION & STATE MANAGEMENT
    // ==========================================================================
    const AIKO_CONFIG = {
        engineSignature: "NexalythScript-JS-Bridge-v2.5-Secure",
        verboseMode: true,
        performanceThreshold: 60, // Target FPS Frame Rate
        synapseDensity: 0.08, // Synapse node density factor
        heartBeatInterval: 1200, // Pulse frequency factor
        // Güvenilir, yüksek hızlı ve token gerektirmeyen harici VPN / Proxy Detektör API'si
        vpnCheckEndpoint: "https://ipapi.co/json/",
        // Ücretsiz, dinamik ve backend gerektirmeyen küresel bulut sayaç anahtarı
        counterEndpoint: "https://api.counterapi.dev/v1/aikoai_core_visits/global/increment",
        colorPalette: {
            neonPink: "rgb(255, 42, 116)",
            neonCyan: "rgb(0, 240, 255)",
            neonGreen: "rgb(57, 255, 20)",
            bgPure: "#050508",
            cardBg: "rgba(10, 11, 16, 0.6)"
        }
    };

    const AikoState = {
        isInitialized: false,
        isVpnBlocked: false,
        hardwareProfile: null,
        activeViewport: "hero",
        fps: 60,
        lastFrameTime: performance.now(),
        canvasRegistry: {},
        animationIds: {},
        detectedIp: "0.0.0.0",
        totalVisits: 0
    };

    // Logger Utility (Sistem Geliştirici Günlük Raporlama Sistemi)
    const AikoLog = {
        info: (msg) => { if (AIKO_CONFIG.verboseMode) console.log(`%c[AIKO INFO] ${msg}`, "color: #00f0ff; font-weight: bold;"); },
        success: (msg) => { if (AIKO_CONFIG.verboseMode) console.log(`%c[AIKO SUCCESS] ${msg}`, "color: #39ff14; font-weight: bold;"); },
        security: (msg) => { console.log(`%c[AIKO SECURITY] ${msg}`, "color: #ff2a74; font-weight: bold; text-shadow: 0 0 5px rgba(255,42,116,0.5);"); },
        warn: (msg) => { console.warn(`[AIKO WARNING] ${msg}`); },
        error: (msg) => { console.error(`[AIKO CRITICAL ERROR] ${msg}`); }
    };

    // ==========================================================================
    // HARDWARE DETECTOR & DEVICE ARCHITECTURE SPECIFICS
    // ==========================================================================
    class HardwareDetector {
        constructor() {
            this.statusTextElement = document.getElementById("device-status-text");
        }

        async analyzeSystem() {
            AikoLog.info("Hardware profiling initialization sequence started...");
            this.updateStatus("ANALYZING CPU CORE MATRIX...");
            
            const cores = navigator.hardwareConcurrency || 4;
            const memory = navigator.deviceMemory || 4;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Görsel kararlılık için kontrollü gecikme döngüsü
            await this.delay(300);
            
            this.updateStatus("MEASURING GPU SYNAPSE ACCELERATION...");
            const gpuVendor = this.getGPUVendor();
            
            await this.delay(200);
            
            AikoState.hardwareProfile = {
                cores: cores,
                ram: memory,
                mobile: isMobile,
                gpu: gpuVendor,
                screen: {
                    w: window.innerWidth,
                    h: window.innerHeight,
                    ratio: window.devicePixelRatio
                }
            };

            AikoLog.success(`Hardware profile locked: ${cores} Cores, ${memory}GB RAM, GPU: ${gpuVendor}`);
            this.updateStatus("HARDWARE DETECTED. READY FOR FIREWALL HANDSHAKE.");
        }

        getGPUVendor() {
            try {
                const canvas = document.createElement("canvas");
                const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
                if (!gl) return "Software Renderer (WebGL Unsupported)";
                const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
                if (!debugInfo) return "Generic WebGL Architecture";
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            } catch (e) {
                return "Unknown Rendering Pipeline";
            }
        }

        updateStatus(text) {
            if (this.statusTextElement) {
                this.statusTextElement.innerText = text;
            }
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    // ==========================================================================
    // 🛡️ QUANTUM FIREWALL MODULE: VPN & PROXY ENGINE DETECTOR
    // ==========================================================================
    class SecurityFirewall {
        constructor() {
            this.appStructure = document.getElementById("aiko-main-app-structure");
            this.vpnScreen = document.getElementById("vpn-override-screen");
            this.counterDisplay = document.getElementById("aiko-core-counter-value");
        }

        async verifyNetworkIntegrity() {
            AikoLog.info("Initiating firewall network integrity verification...");
            
            try {
                // IP ve Aygıt Ağ Sağlayıcı Verilerini Çekme Adımı
                const response = await fetch(AIKO_CONFIG.vpnCheckEndpoint);
                
                if (!response.ok) {
                    throw new Error("Network security descriptor handshake failed.");
                }

                const data = await response.json();
                AikoState.detectedIp = data.ip || "127.0.0.1";
                
                // Gelişmiş VPN / Proxy Kontrol Filtresi
                // ipapi.co altyapısındaki proxy, vpn, asn sahtekarlığı ve kurumsal veri merkezi bloklarını tarar
                // Ek olarak Opera Mobil'in gömülü VPN'i veya tarayıcı proxy barlarını yakalamak için ISP ve Org analizi yapar
                const isProxy = data.proxy === true;
                const isVpn = data.security && (data.security.vpn === true || data.security.proxy === true);
                const isDatacenter = data.org && (data.org.toLowerCase().includes("hosting") || data.org.toLowerCase().includes("vpn") || data.org.toLowerCase().includes("datacenter") || data.org.toLowerCase().includes("cloudflare"));
                
                // Test etmek istersen aşağıdaki satırın yorumunu kaldırıp simüle edebilirsin kk:
                // const simulateVpnTrigger = true; if(simulateVpnTrigger) { AikoState.isVpnBlocked = true; this.triggerVpnOverride(); return; }

                if (isProxy || isVpn || isDatacenter) {
                    AikoState.isVpnBlocked = true;
                    AikoLog.security(`ACCESS DENIED: VPN/Proxy connection signature detected from IP: ${AikoState.detectedIp}`);
                    this.triggerVpnOverride();
                } else {
                    AikoLog.success(`Network integrity verified cleanly. IP: ${AikoState.detectedIp} is clear.`);
                    // VPN Yoksa Sayacı Güvenle Ateşle!
                    await this.initializeCloudCounter();
                }

            } catch (error) {
                AikoLog.warn(`Firewall bypass warning: ${error.message}. Defaulting to secure state.`);
                // API hatası durumunda sayacı yerel veriyle besleyip sistemi çökertmiyoruz
                this.fallbackCounter();
            }
        }

        triggerVpnOverride() {
            // Sitenin ana iskeletini pürüzsüzce ortadan kaldır
            if (this.appStructure) {
                this.appStructure.style.display = "none";
            }
            
            // İstediğin o siberpunk titreyen neon uyarı ekranını devreye sok
            if (this.vpnScreen) {
                this.vpnScreen.style.display = "flex";
            }
            
            // Kalp çizim motorunu acil durum alarm frekansına geçir
            if (AikoState.canvasRegistry.cyberHeart) {
                AikoState.canvasRegistry.cyberHeart.switchToAlarmMode();
            }

            AikoLog.security("Quantum firewall restriction enforced. Main layout detached. Warnings visible.");
        }

        async initializeCloudCounter() {
            AikoLog.info("Connecting to secure multi-node cloud counter service...");
            
            try {
                // Güvenli CountAPI altyapısı üzerinden veriyi internetteki global odada 1 artırıp çekiyoruz
                const response = await fetch(AIKO_CONFIG.counterEndpoint);
                
                if (!response.ok) {
                    throw new Error("Cloud counter response stream corrupt.");
                }

                const data = await response.json();
                AikoState.totalVisits = data.value || 0;
                
                this.updateCounterUI(AikoState.totalVisits);
                AikoLog.success(`Global core storage sync complete. Total Core Visits: ${AikoState.totalVisits}`);

            } catch (error) {
                AikoLog.error(`Cloud counter synchronization failure: ${error.message}`);
                this.fallbackCounter();
            }
        }

        updateCounterUI(value) {
            if (this.counterDisplay) {
                // Sayıyı siberpunk HUD ekranına uygun olarak 5 haneli (00482 gibi) formatlama algoritması
                const formattedValue = String(value).padStart(5, '0');
                this.counterDisplay.innerText = formattedValue;
                
                // Parlama efektini tetiklemek için CSS klas kontrolü yap
                this.counterDisplay.classList.add("glow-active");
            }
        }

        fallbackCounter() {
            // Eğer internet koparsa veya API çökerse sayacı çirkin göstermemek için yerel bir baz değer basıyoruz
            if (this.counterDisplay) {
                this.counterDisplay.innerText = "00404";
                this.counterDisplay.style.color = AIKO_CONFIG.colorPalette.neonPink;
            }
        }
    }

    // ==========================================================================
    // CANVASES & ANIMATION ENGINES (MATEMATİKSEL SİNAPS AĞI)
    // ==========================================================================
    class SynapseWebEngine {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                AikoLog.error(`Synapse Web Canvas targeted ID '${canvasId}' could not be resolved.`);
                return;
            }
            this.ctx = this.canvas.getContext("2d");
            this.nodes = [];
            this.maxNodes = 0;
            this.connectionDistance = 120;
            this.mouse = { x: null, y: null, radius: 180 };

            this.init();
        }

        init() {
            this.resize();
            this.generateNodes();
            this.bindEvents();
            AikoLog.success("Synapse Network Canvas core pipeline initialized.");
        }

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            
            const area = this.canvas.width * this.canvas.height;
            this.maxNodes = Math.floor(area * AIKO_CONFIG.synapseDensity / 500);
            if (this.maxNodes > 150) this.maxNodes = 150; // Performans darboğaz tavanı
        }

        generateNodes() {
            this.nodes = [];
            for (let i = 0; i < this.maxNodes; i++) {
                this.nodes.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.8,
                    radius: Math.random() * 2 + 1,
                    pulseSeed: Math.random() * 100
                });
            }
        }

        bindEvents() {
            window.addEventListener("mousemove", (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            });

            window.addEventListener("mouseout", () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }

        update() {
            for (let i = 0; i < this.nodes.length; i++) {
                let node = this.nodes[i];
                node.x += node.vx;
                node.y += node.vy;
                node.pulseSeed += 0.02;

                if (node.x < 0 || node.x > this.canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > this.canvas.height) node.vy *= -1;

                if (this.mouse.x !== null && this.mouse.y !== null) {
                    let dx = node.x - this.mouse.x;
                    let dy = node.y - this.mouse.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < this.mouse.radius) {
                        let force = (this.mouse.radius - dist) / this.mouse.radius;
                        node.x += (dx / dist) * force * 2;
                        node.y += (dy / dist) * force * 2;
                    }
                }
            }
        }

        render() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Eğer VPN engeli varsa sinaps ağ hatlarını kırmızı güvenlik tonuna çek
            const currentLineColor = AikoState.isVpnBlocked ? "255, 42, 116" : "0, 240, 255";

            for (let i = 0; i < this.nodes.length; i++) {
                let n1 = this.nodes[i];
                
                this.ctx.beginPath();
                let pulseAlpha = 0.2 + Math.sin(n1.pulseSeed) * 0.1;
                this.ctx.fillStyle = `rgba(${currentLineColor}, ${pulseAlpha})`;
                this.ctx.arc(n1.x, n1.y, n1.radius, 0, Math.PI * 2);
                this.ctx.fill();

                for (let j = i + 1; j < this.nodes.length; j++) {
                    let n2 = this.nodes[j];
                    let dx = n1.x - n2.x;
                    let dy = n1.y - n2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < this.connectionDistance) {
                        let alpha = (this.connectionDistance - dist) / this.connectionDistance * 0.15;
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = `rgba(${currentLineColor}, ${alpha})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.moveTo(n1.x, n1.y);
                        this.ctx.lineTo(n2.x, n2.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
    }

    // ==========================================================================
    // NEXALYTH SİBER KALP VE KASA ÇİZİM MOTORU (SECURITY OPTIMIZED)
    // ==========================================================================
    class NexalythHeartEngine {
        constructor(canvasId) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) {
                AikoLog.warn(`Heart Engine Canvas ID '${canvasId}' not found. Skipping validation.`);
                return;
            }
            this.ctx = this.canvas.getContext("2d");
            this.angle = 0;
            this.particles = [];
            this.matrixGrid = [];
            this.isAlarmState = false;
            this.heartPulseFrequency = 2.5; // Normal atış hızı ritmi
            
            this.init();
        }

        init() {
            this.resize();
            this.generateMatrixGrid();
            AikoLog.success("Quantum Cybernetic Heart Engine booted smoothly.");
        }

        switchToAlarmMode() {
            this.isAlarmState = true;
            this.heartPulseFrequency = 5.0; // VPN yakalandığında kalbi panik hızına alıyoruz!
        }

        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width || 400;
            this.canvas.height = rect.height || 400;
        }

        generateMatrixGrid() {
            this.matrixGrid = [];
            for (let i = 0; i < 15; i++) {
                this.matrixGrid.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    speed: Math.random() * 1 + 0.5,
                    length: Math.random() * 40 + 20,
                    opacity: Math.random() * 0.3
                });
            }
        }

        drawHeartPath(t, scale) {
            // Kardiyot parametrik formülü dönüşüm algoritması
            let x = 16 * Math.pow(Math.sin(t), 3);
            let y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            return {
                x: x * scale + this.canvas.width / 2,
                y: -y * scale + this.canvas.height / 2
            };
        }

        update() {
            this.angle += 0.02;
            
            this.matrixGrid.forEach(line => {
                line.y += line.speed;
                if (line.y > this.canvas.height) {
                    line.y = -line.length;
                    line.x = Math.random() * this.canvas.width;
                }
            });

            // Mikro siber partiküllerin harita üretimi
            if (Math.random() < 0.2 && this.particles.length < 40) {
                let randomT = Math.random() * Math.PI * 2;
                let currentPulseScale = 6 + Math.sin(this.angle * this.heartPulseFrequency) * 0.4;
                let pos = this.drawHeartPath(randomT, currentPulseScale);
                this.particles.push({
                    x: pos.x,
                    y: pos.y,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    life: 1.0,
                    decay: Math.random() * 0.02 + 0.01,
                    size: Math.random() * 2 + 1
                });
            }

            for (let i = this.particles.length - 1; i >= 0; i--) {
                let p = this.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        render() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const activeCoreColor = this.isAlarmState ? "255, 42, 116" : "0, 240, 255";
            const activeHeartColor = AIKO_CONFIG.colorPalette.neonPink;

            // Arka Plan Matris Çizgilerinin Render Adımı
            this.ctx.lineWidth = 1;
            this.matrixGrid.forEach(line => {
                let gradient = this.ctx.createLinearGradient(line.x, line.y, line.x, line.y + line.length);
                gradient.addColorStop(0, `rgba(${activeCoreColor}, 0)`);
                gradient.addColorStop(0.5, `rgba(${activeCoreColor}, ${line.opacity})`);
                gradient.addColorStop(1, `rgba(${activeCoreColor}, 0)`);
                this.ctx.strokeStyle = gradient;
                this.ctx.beginPath();
                this.ctx.moveTo(line.x, line.y);
                this.ctx.lineTo(line.x, line.y + line.length);
                this.ctx.stroke();
            });

            let pulseFactor = Math.sin(this.angle * this.heartPulseFrequency);
            let targetScale = 6.5 + pulseFactor * 0.4;

            // Eğer VPN kısıtlaması yoksa normal kalbi çiz, varsa kalp yerine siber tarama yapısı bırak
            if (!AikoState.isVpnBlocked) {
                this.ctx.shadowBlur = 20 + pulseFactor * 8;
                this.ctx.shadowColor = activeHeartColor;

                this.ctx.beginPath();
                this.ctx.lineWidth = 3;
                this.ctx.strokeStyle = activeHeartColor;
                
                for (let t = 0; t <= Math.PI * 2; t += 0.02) {
                    let pos = this.drawHeartPath(t, targetScale);
                    if (t === 0) {
                        this.ctx.moveTo(pos.x, pos.y);
                    } else {
                        this.ctx.lineTo(pos.x, pos.y);
                    }
                }
                this.ctx.closePath();
                this.ctx.stroke();
            } else {
                // VPN Bloke Durumunda Kalp Kutusunda Kırmızı Dairesel Kuantum Radarı Çizilir (⚠️ Ekranı Uyumlu HUD)
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = AIKO_CONFIG.colorPalette.neonPink;
                this.ctx.strokeStyle = AIKO_CONFIG.colorPalette.neonPink;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 60 + pulseFactor * 5, 0, Math.PI * 2);
                this.ctx.stroke();
            }

            // Siberpunk HUD Deseni Çapraz Nişangah Çizimleri
            this.ctx.shadowBlur = 0;
            this.ctx.strokeStyle = `rgba(${activeCoreColor}, 0.15)`;
            this.ctx.lineWidth = 1;
            
            let cx = this.canvas.width / 2;
            let cy = this.canvas.height / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(cx - 30, cy); this.ctx.lineTo(cx + 30, cy);
            this.ctx.moveTo(cx, cy - 30); this.ctx.lineTo(cx, cy + 30);
            this.ctx.stroke();

            // Parıltı Partiküllerinin Ekrana Basılması (Her durumda çalışır, arkadaki akış bozulmaz!)
            this.particles.forEach(p => {
                this.ctx.fillStyle = `rgba(${activeCoreColor}, ${p.life})`;
                this.ctx.shadowBlur = 6;
                this.ctx.shadowColor = `rgba(${activeCoreColor}, 0.8)`;
                this.ctx.fillRect(p.x, p.y, p.size, p.size);
            });
            this.ctx.shadowBlur = 0;
        }
    }

    // ==========================================================================
    // VIEWPORT ACCENT TRACKER & LAYOUT DIZAYN OPTIMIZER
    // ==========================================================================
    class LayoutOptimizer {
        constructor() {
            this.navbar = document.querySelector(".aiko-navbar");
            this.heroSection = document.getElementById("hero");
        }

        syncViewportMetrics() {
            const realWindowHeight = window.innerHeight;
            
            if (this.heroSection) {
                if (realWindowHeight < 650) {
                    this.heroSection.style.paddingTop = "90px";
                    this.heroSection.style.paddingBottom = "30px";
                    AikoLog.info("Low viewport ceiling detected. Hero padding matrix normalized.");
                } else {
                    this.heroSection.style.paddingTop = "120px";
                    this.heroSection.style.paddingBottom = "60px";
                }
            }
        }

        bindNavigationSpy() {
            const sections = document.querySelectorAll(".cyber-section");
            const navItems = document.querySelectorAll(".nav-item");

            window.addEventListener("scroll", () => {
                if (AikoState.isVpnBlocked) return; // VPN kilitliyse kaydırma takibini dondur

                let currentActiveId = "hero";
                const scrollPos = window.scrollY + 150;

                sections.forEach(section => {
                    if (section.offsetTop <= scrollPos && (section.offsetTop + section.offsetHeight) > scrollPos) {
                        currentActiveId = section.getAttribute("id");
                    }
                });

                if (AikoState.activeViewport !== currentActiveId) {
                    AikoState.activeViewport = currentActiveId;
                    
                    navItems.forEach(item => {
                        item.classList.remove("active");
                        if (item.getAttribute("href") === `#${currentActiveId}`) {
                            item.classList.add("active");
                        }
                    });
                    AikoLog.info(`Active system sector shifted to: ${currentActiveId.toUpperCase()}`);
                }
            });
        }
    }

    // ==========================================================================
    // THE ULTIMATE ENGINE MAIN LOOP (RECURSIVE RENDERING PIPELINE)
    // ==========================================================================
    function runCoreSystemLoop() {
        const now = performance.now();
        const delta = now - AikoState.lastFrameTime;
        AikoState.fps = Math.round(1000 / delta);
        AikoState.lastFrameTime = now;

        if (AikoState.canvasRegistry.synapseWeb) {
            AikoState.canvasRegistry.synapseWeb.update();
            AikoState.canvasRegistry.synapseWeb.render();
        }

        if (AikoState.canvasRegistry.cyberHeart) {
            AikoState.canvasRegistry.cyberHeart.update();
            AikoState.canvasRegistry.cyberHeart.render();
        }

        AikoState.animationIds.mainLoop = requestAnimationFrame(runCoreSystemLoop);
    }

    // ==========================================================================
    // INITIALIZATION VECTOR (SİSTEM ATEŞLEME KERNEL TETİKLEYİCİSİ)
    // ==========================================================================
    async function initializeAikoCore() {
        AikoLog.info("AikoAI Embedded Kernel v2.5 bootloader engine active.");
        
        // 1. Donanım Analizini Başlat
        const detector = new HardwareDetector();
        await detector.analyzeSystem();

        // 2. DOM Nesnelerini ve Canvas Sürücülerini Derle
        AikoState.canvasRegistry.synapseWeb = new SynapseWebEngine("nexalyth-synapse-web");
        AikoState.canvasRegistry.cyberHeart = new NexalythHeartEngine("nexalyth-heart-canvas");

        // 3. Tasarım ve Mobil Arayüz Optimizasyon Ayarları
        const optimizer = new LayoutOptimizer();
        optimizer.syncViewportMetrics();
        optimizer.bindNavigationSpy();

        // 4. Pencere Boyut Değişim Event Kontrolü (Resize Watcher)
        let resizeDebounceTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeDebounceTimeout);
            resizeDebounceTimeout = setTimeout(() => {
                AikoLog.info("System resize trigger captured. Recalibrating spatial grid...");
                
                if (AikoState.canvasRegistry.synapseWeb) AikoState.canvasRegistry.synapseWeb.resize();
                if (AikoState.canvasRegistry.cyberHeart) AikoState.canvasRegistry.cyberHeart.resize();
                
                optimizer.syncViewportMetrics();
            }, 150);
        });

        // 5. 🛡️ GÜVENLİK DUVARI VE VPN / SAYAÇ BAĞLANTI KONTROLÜ
        const firewall = new SecurityFirewall();
        await firewall.verifyNetworkIntegrity();

        // 6. Yükleme Ekranını (Loader) Kapat ve Sistemi Canlandır
        setTimeout(() => {
            document.body.classList.remove("aiko-loading");
            AikoState.isInitialized = true;
            AikoLog.success("System loaded into hardware pipeline cleanly. Loader detached.");
            
            // Ana Motor Döngüsünü Sonsuz Kareye Ateşle!
            runCoreSystemLoop();
        }, 600);
    }

    // Sayfa DOM Yapısı Hazır Olduğunda Güvenli Tetikleme Yap
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeAikoCore);
    } else {
        initializeAikoCore();
    }

})();