/**
 * Harmony Player - Script Principal
 * Player de música profissional com sincronização de letras
 * Versão: 2.0.0
 */

// ==========================================================================
// CONSTANTES E CONFIGURAÇÕES
// ==========================================================================

const CONFIG = {
    APP_NAME: 'Harmony',
    VERSION: '2.0.0',
    DEFAULT_VOLUME: 80,
    DEFAULT_EQUALIZER: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    EQ_PRESETS: {
        flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        pop: [3, 2, 1, 0, -1, -1, 0, 1, 2, 3],
        rock: [5, 3, 1, 0, 1, 2, 3, 4, 4, 3],
        jazz: [2, 1, 0, -1, -2, -2, -1, 0, 1, 2],
        classical: [3, 2, 1, 0, 0, 0, 0, 1, 2, 3],
        bass: [6, 5, 4, 3, 2, 0, -2, -3, -4, -5],
        treble: [-5, -4, -3, -2, 0, 2, 3, 4, 5, 6],
        vocal: [0, 0, 1, 2, 3, 3, 2, 1, 0, 0]
    },
    VISUALIZER_MODES: ['wave', 'bars', 'circle', 'particles'],
    LYRIC_SYNC_TOLERANCE: 0.5, // segundos
    NOTIFICATION_TIMEOUT: 3000,
    COLOR_EXTRACTION_QUALITY: 10
};

// ==========================================================================
// ESTADO DA APLICAÇÃO
// ==========================================================================

const AppState = {
    // Player
    isPlaying: false,
    isShuffle: false,
    isRepeat: false,
    isMuted: false,
    volume: CONFIG.DEFAULT_VOLUME,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
    
    // Áudio
    audioContext: null,
    audioSource: null,
    audioAnalyser: null,
    gainNode: null,
    eqFilters: [],
    
    // Letras
    lyrics: [],
    currentLyricIndex: -1,
    isLyricsSynced: true,
    isKaraokeMode: false,
    
    // Fila
    queue: [],
    currentQueueIndex: 0,
    queueHistory: [],
    
    // Interface
    theme: 'dark',
    visualizerMode: 'wave',
    equalizerPreset: 'flat',
    extractedColors: {
        primary: '#8a2be2',
        secondary: '#00d4ff',
        accent: '#ff6b9d'
    },
    
    // Usuário
    isLoggedIn: false,
    user: null,
    preferences: {
        autoPlay: true,
        showNotifications: true,
        highQuality: true,
        crossfade: false,
        gaplessPlayback: true
    },
    
    // Sistema
    isInitialized: false,
    isOffline: false,
    audioBuffer: null
};

// ==========================================================================
// ELEMENTOS DOM
// ==========================================================================

const DOM = {
    // Player principal
    audioPlayer: document.getElementById('audio-player'),
    playBtn: document.getElementById('play-btn'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    shuffleBtn: document.getElementById('shuffle-btn'),
    repeatBtn: document.getElementById('repeat-btn'),
    muteBtn: document.getElementById('mute-btn'),
    
    // Controles de tempo
    currentTimeEl: document.getElementById('current-time'),
    totalTimeEl: document.getElementById('total-time'),
    progressBar: document.getElementById('progress-bar'),
    progressFill: document.getElementById('progress-fill'),
    progressHandle: document.getElementById('progress-handle'),
    
    // Volume
    volumeSlider: document.getElementById('volume-slider'),
    volumeFill: document.getElementById('volume-fill'),
    
    // Letras
    lyricsDisplay: document.getElementById('lyrics-display'),
    lyricsFullDisplay: document.getElementById('lyrics-full-display'),
    syncModeBtn: document.getElementById('sync-mode'),
    karaokeModeBtn: document.getElementById('karaoke-mode'),
    currentLyricEl: document.getElementById('current-lyric'),
    
    // Informações da música
    songTitle: document.getElementById('song-title'),
    songArtist: document.getElementById('song-artist'),
    albumArt: document.getElementById('album-art'),
    
    // Fila
    queueList: document.getElementById('queue-list'),
    clearQueueBtn: document.getElementById('clear-queue'),
    addMusicBtn: document.getElementById('add-music-btn'),
    
    // Interface
    themeToggle: document.getElementById('theme-toggle'),
    visualizerToggle: document.getElementById('visualizer-toggle'),
    equalizerBtn: document.getElementById('equalizer-btn'),
    qualityBtn: document.getElementById('quality-btn'),
    
    // Canvas
    waveformCanvas: document.getElementById('waveform-canvas'),
    visualizerCanvas: document.getElementById('visualizer-canvas'),
    
    // Modais
    equalizerModal: document.getElementById('equalizer-modal'),
    
    // Now Playing Bar
    nowPlayingTitle: document.getElementById('now-playing-title'),
    nowPlayingArtist: document.getElementById('now-playing-artist'),
    nowPlayingCover: document.querySelector('.now-playing-cover'),
    npPlayBtn: document.getElementById('np-play'),
    npProgressFill: document.getElementById('np-progress-fill'),
    npCurrentTime: document.getElementById('np-current-time'),
    npTotalTime: document.getElementById('np-total-time'),
    
    // Notificações
    notificationsContainer: document.getElementById('notifications-container'),
    
    // Preloader
    preloader: document.getElementById('preloader')
};

// ==========================================================================
// UTILITÁRIOS
// ==========================================================================

class Utils {
    // Formatação de tempo
    static formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Formatação de número
    static formatNumber(num) {
        return new Intl.NumberFormat('pt-BR').format(num);
    }
    
    // Debounce para otimização
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle para otimização
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Clamp de valores
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Linear interpolation
    static lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }
    
    // Extração de cores da imagem
    static extractColorsFromImage(imageElement, quality = CONFIG.COLOR_EXTRACTION_QUALITY) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = imageElement.naturalWidth;
            canvas.height = imageElement.naturalHeight;
            
            ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const pixelCount = canvas.width * canvas.height;
            
            // Amostrar pixels
            const colorMap = new Map();
            for (let i = 0; i < pixelCount; i += quality) {
                const r = pixels[i * 4];
                const g = pixels[i * 4 + 1];
                const b = pixels[i * 4 + 2];
                const key = `${r},${g},${b}`;
                
                colorMap.set(key, (colorMap.get(key) || 0) + 1);
            }
            
            // Encontrar cores dominantes
            const sortedColors = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
            
            if (sortedColors.length > 0) {
                const primaryColor = sortedColors[0][0].split(',').map(Number);
                const secondaryColor = sortedColors.length > 1 ? 
                    sortedColors[1][0].split(',').map(Number) : primaryColor;
                const accentColor = sortedColors.length > 2 ? 
                    sortedColors[2][0].split(',').map(Number) : secondaryColor;
                
                const toHex = (rgb) => `#${rgb.map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('')}`;
                
                resolve({
                    primary: toHex(primaryColor),
                    secondary: toHex(secondaryColor),
                    accent: toHex(accentColor)
                });
            } else {
                resolve(AppState.extractedColors);
            }
        });
    }
    
    // Geração de ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Armazenamento local com fallback
    static storage = {
        set(key, value) {
            try {
                localStorage.setItem(`harmony_${key}`, JSON.stringify(value));
            } catch (e) {
                console.warn('LocalStorage não disponível:', e);
            }
        },
        
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`harmony_${key}`);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.warn('LocalStorage não disponível:', e);
                return defaultValue;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(`harmony_${key}`);
            } catch (e) {
                console.warn('LocalStorage não disponível:', e);
            }
        }
    };
}

// ==========================================================================
// SISTEMA DE NOTIFICAÇÕES
// ==========================================================================

class NotificationSystem {
    static show(message, type = 'info', duration = CONFIG.NOTIFICATION_TIMEOUT) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas fa-${icons[type] || 'info-circle'}"></i>
            <div class="notification-content">
                <div class="notification-title">${CONFIG.APP_NAME}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        DOM.notificationsContainer.appendChild(notification);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Fechar ao clicar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.close(notification));
        
        // Fechar automaticamente
        if (duration > 0) {
            setTimeout(() => this.close(notification), duration);
        }
        
        return notification;
    }
    
    static close(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// ==========================================================================
// SISTEMA DE ÁUDIO
// ==========================================================================

class AudioSystem {
    static async initialize() {
        try {
            // Criar contexto de áudio
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            AppState.audioContext = new AudioContext();
            
            // Configurar nós de áudio
            AppState.gainNode = AppState.audioContext.createGain();
            AppState.audioAnalyser = AppState.audioContext.createAnalyser();
            
            // Configurar analyser
            AppState.audioAnalyser.fftSize = 2048;
            AppState.audioAnalyser.smoothingTimeConstant = 0.8;
            
            // Configurar equalizador
            this.setupEqualizer();
            
            // Conectar nós
            AppState.gainNode.connect(AppState.audioAnalyser);
            AppState.audioAnalyser.connect(AppState.audioContext.destination);
            
            // Configurar volume inicial
            AppState.gainNode.gain.value = AppState.volume / 100;
            
            console.log('✅ Sistema de áudio inicializado');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de áudio:', error);
            NotificationSystem.show('Erro no sistema de áudio', 'error');
            return false;
        }
    }
    
    static setupEqualizer() {
        // Frequências dos filtros (Hz)
        const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        
        // Criar filtros para cada banda
        AppState.eqFilters = frequencies.map(freq => {
            const filter = AppState.audioContext.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            
            // Conectar em série
            if (AppState.eqFilters.length > 0) {
                AppState.eqFilters[AppState.eqFilters.length - 1].connect(filter);
            }
            
            return filter;
        });
        
        // Conectar primeiro filtro ao gain node
        if (AppState.eqFilters.length > 0) {
            AppState.gainNode.connect(AppState.eqFilters[0]);
            // Conectar último filtro ao analyser
            AppState.eqFilters[AppState.eqFilters.length - 1].connect(AppState.audioAnalyser);
        }
    }
    
    static applyEqualizer(presetName) {
        const preset = CONFIG.EQ_PRESETS[presetName] || CONFIG.EQ_PRESETS.flat;
        
        AppState.eqFilters.forEach((filter, index) => {
            if (filter) {
                filter.gain.value = preset[index] || 0;
            }
        });
        
        AppState.equalizerPreset = presetName;
        Utils.storage.set('equalizerPreset', presetName);
    }
    
    static updateVisualizer() {
        if (!AppState.audioAnalyser || !DOM.waveformCanvas) return;
        
        const canvas = DOM.waveformCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Obter dados de áudio
        const bufferLength = AppState.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        AppState.audioAnalyser.getByteTimeDomainData(dataArray);
        
        // Limpar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Configurar estilo
        ctx.lineWidth = 2;
        ctx.strokeStyle = AppState.extractedColors.primary;
        ctx.beginPath();
        
        const sliceWidth = width * 1.0 / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Continuar animação
        if (AppState.isPlaying || AppState.audioContext.state === 'running') {
            requestAnimationFrame(() => this.updateVisualizer());
        }
    }
    
    static updateAdvancedVisualizer() {
        if (!AppState.audioAnalyser || !DOM.visualizerCanvas) return;
        
        const canvas = DOM.visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Obter dados de frequência
        const bufferLength = AppState.audioAnalyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        AppState.audioAnalyser.getByteFrequencyData(dataArray);
        
        // Limpar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Renderizar baseado no modo
        switch (AppState.visualizerMode) {
            case 'bars':
                this.renderBarsVisualizer(ctx, width, height, dataArray, bufferLength);
                break;
            case 'circle':
                this.renderCircleVisualizer(ctx, width, height, dataArray, bufferLength);
                break;
            case 'particles':
                this.renderParticlesVisualizer(ctx, width, height, dataArray, bufferLength);
                break;
            default: // wave
                this.renderWaveVisualizer(ctx, width, height, dataArray, bufferLength);
        }
        
        // Continuar animação
        if (AppState.isPlaying || AppState.audioContext.state === 'running') {
            requestAnimationFrame(() => this.updateAdvancedVisualizer());
        }
    }
    
    static renderBarsVisualizer(ctx, width, height, dataArray, bufferLength) {
        const barWidth = (width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;
        
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, AppState.extractedColors.primary);
        gradient.addColorStop(0.5, AppState.extractedColors.secondary);
        gradient.addColorStop(1, AppState.extractedColors.accent);
        
        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * 2;
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    static renderCircleVisualizer(ctx, width, height, dataArray, bufferLength) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.4;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const sliceAngle = (2 * Math.PI) / bufferLength;
        
        for (let i = 0; i < bufferLength; i++) {
            const angle = i * sliceAngle;
            const value = dataArray[i];
            const barLength = (value / 255) * radius * 0.8;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barLength);
            const y2 = centerY + Math.sin(angle) * (radius + barLength);
            
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            
            const hue = (i / bufferLength) * 360;
            ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 0.8)`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
    
    static renderParticlesVisualizer(ctx, width, height, dataArray, bufferLength) {
        // Implementação simplificada de partículas
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const index = Math.floor((i / particleCount) * bufferLength);
            const value = dataArray[index];
            
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = (value / 255) * 10 + 2;
            const speed = (value / 255) * 5 + 1;
            
            const hue = (value / 255) * 360;
            ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.7)`;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    static renderWaveVisualizer(ctx, width, height, dataArray, bufferLength) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = AppState.extractedColors.primary;
        ctx.beginPath();
        
        const sliceWidth = width * 1.0 / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * height / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        ctx.lineTo(width, height / 2);
        ctx.stroke();
    }
}

// ==========================================================================
// SISTEMA DE LETRAS
// ==========================================================================

class LyricsSystem {
    static lyrics = [
        { time: 0.31, text: "Fall" },
        { time: 3.47, text: "Fall in" },
        { time: 6.62, text: "Fall in love" },
        { time: 9.88, text: "Fall in love again" },
        { time: 13.13, text: "Fall in love again and again" },
        { time: 14.69, text: "Fall in love again and again" },
        { time: 16.12, text: "Fall in love again and again" },
        { time: 17.75, text: "Fall in love again and again" },
        { time: 19.33, text: "Fall in love again and again" },
        { time: 21.22, text: "Fall in love again and again" },
        { time: 22.67, text: "Fall in love again and again" },
        { time: 24.27, text: "Fall in love again and a" },
        { time: 25.86, text: "Fall in love again" },
        { time: 27.42, text: "Fall in love" },
        { time: 28.97, text: "Fall in" },
        { time: 30.52, text: "Fall" },
        { time: 32.39, text: "Walk to the studio soaking wet" },
        { time: 33.93, text: "ACAB tag on a bus stop sign" },
        { time: 35.43, text: "Everything is..." },
        { time: 38.67, text: "Catch a face in the windowpane" },
        { time: 40.29, text: "Oh what's up it's me that's mine" },
        { time: 42.00, text: "Everything is..." },
        { time: 45.22, text: "Sleepyhead cause all the fucking" },
        { time: 46.82, text: "Foxes kept me awake last night" },
        { time: 48.32, text: "Everything is..." },
        { time: 51.30, text: "Charli calls from a hotel bed" },
        { time: 53.10, text: "Hungover on Tokyo time" },
        { time: 54.77, text: "Everything is..." },
        { time: 58.47, text: "Hey girl what's up how you been?" },
        { time: 59.85, text: "I think I need your advice" },
        { time: 61.22, text: "(It's crazy I was just thinking of you, what's on your mind?)" },
        { time: 64.57, text: "I'm trying to shut off my brain" },
        { time: 66.02, text: "I'm thinking 'bout work all the time" },
        { time: 68.03, text: "(It's like you're living the dream but you're not living your life)" },
        { time: 70.85, text: "I knew that you would relate" },
        { time: 72.54, text: "I feel smothered by logistics" },
        { time: 74.12, text: "Need my fingerprints on everything" },
        { time: 75.75, text: "Trying to feed my relationship" },
        { time: 77.78, text: "Am I in a slump?" },
        { time: 78.94, text: "Am I paying back time?" },
        { time: 80.56, text: "Did I lose my perspective?" },
        { time: 81.95, text: "Everything's still romantic, right?" },
        { time: 83.50, text: "Late nights in black silk in east London" },
        { time: 85.43, text: "Church bells in the distance" },
        { time: 86.66, text: "Free bleeding in the autumn rain" },
        { time: 88.47, text: "Fall in love again and again" },
        { time: 89.95, text: "Late nights in black silk in east London" },
        { time: 92.07, text: "Church bells in the distance" },
        { time: 93.10, text: "Free bleeding in the autumn rain" },
        { time: 94.78, text: "Fall in love again and again" },
        { time: 96.34, text: "Fall" },
        { time: 99.31, text: "Fall in" },
        { time: 102.58, text: "Fall in love" },
        { time: 105.76, text: "Fall in love again" },
        { time: 109.13, text: "Fall in love again and again" },
        { time: 110.51, text: "Fall in love again and again" },
        { time: 112.16, text: "Fall in love again and again" },
        { time: 113.72, text: "Fall in love again and again" },
        { time: 115.37, text: "Fall in love again and again" },
        { time: 116.81, text: "Fall in love again and again" },
        { time: 118.46, text: "Fall in love again and again" },
        { time: 120.28, text: "Fall in love again and a" },
        { time: 121.90, text: "Everything is romantic" },
        { time: 128.27, text: "Fall in love again and again" },
        { time: 129.70, text: "Fall in love again and again" },
        { time: 131.44, text: "Fall in love again and again" },
        { time: 132.92, text: "Fall in love again and a" },
        { time: 134.72, text: "Everything is romantic" },
        { time: 141.09, text: "Fall in love again and again" },
        { time: 142.80, text: "Fall in love again and again" },
        { time: 144.35, text: "Fall in love again and again" },
        { time: 145.95, text: "Fall in love again and" },
        { time: 147.75, text: "Everything is..." },
        { time: 147.96, text: "Late nights in black silk in east London" },
        { time: 149.68, text: "Church bells in the distance" },
        { time: 150.82, text: "Free bleeding in the autumn rain" },
        { time: 152.22, text: "Fall in love again and again" },
        { time: 153.73, text: "Fall in love again and again" },
        { time: 155.38, text: "Fall in love again and again" },
        { time: 157.04, text: "Fall in love again and again" },
        { time: 158.60, text: "Fall in love again and a" },
        { time: 160.33, text: "Everything is" },
        { time: 161.03, text: "Late nights in black silk in east London" },
        { time: 162.29, text: "Church bells in the distance" },
        { time: 163.58, text: "Free bleeding in the autumn rain" },
        { time: 164.95, text: "Fall in love again and again" },
        { time: 166.49, text: "Late nights in black silk in east London" },
        { time: 168.64, text: "Church bells in the distance" },
        { time: 169.87, text: "Free bleeding in the autumn rain" },
        { time: 171.37, text: "Fall in" },
        { time: 173.15, text: "Silver scratchcard in the canal" },
        { time: 174.63, text: "Romantic like six pound wine" },
        { time: 179.66, text: "Dark in the park, Celtic graves" },
        { time: 181.05, text: "Girl throws up from the back of a lime" },
        { time: 186.01, text: "Headphones on, I hit play" },
        { time: 187.46, text: "All things change in the blink of an eye" },
        { time: 192.47, text: "Charli calls from a photo set" },
        { time: 193.92, text: "Living that life is romantic, right?" }
    ];
    
    static initialize() {
        AppState.lyrics = this.lyrics;
        this.renderLyrics();
        this.renderFullLyrics();
        this.updateStats();
    }
    
    static renderLyrics() {
        if (!DOM.lyricsDisplay) return;
        
        DOM.lyricsDisplay.innerHTML = '';
        
        AppState.lyrics.forEach((lyric, index) => {
            const lyricElement = document.createElement('div');
            lyricElement.className = 'lyric-line';
            lyricElement.textContent = lyric.text;
            lyricElement.dataset.index = index;
            lyricElement.dataset.time = lyric.time;
            
            // Clique para navegar no tempo
            lyricElement.addEventListener('click', () => {
                DOM.audioPlayer.currentTime = lyric.time;
                if (!AppState.isPlaying) {
                    PlayerSystem.play();
                }
            });
            
            DOM.lyricsDisplay.appendChild(lyricElement);
        });
    }
    
    static renderFullLyrics() {
        if (!DOM.lyricsFullDisplay) return;
        
        DOM.lyricsFullDisplay.innerHTML = '';
        
        AppState.lyrics.forEach((lyric, index) => {
            const lyricElement = document.createElement('div');
            lyricElement.className = 'lyric-line';
            lyricElement.textContent = lyric.text;
            lyricElement.dataset.index = index;
            lyricElement.dataset.time = lyric.time;
            
            // Clique para navegar no tempo
            lyricElement.addEventListener('click', () => {
                DOM.audioPlayer.currentTime = lyric.time;
                if (!AppState.isPlaying) {
                    PlayerSystem.play();
                }
            });
            
            DOM.lyricsFullDisplay.appendChild(lyricElement);
        });
    }
    
    static updateLyrics(currentTime) {
        if (!AppState.isLyricsSynced || AppState.lyrics.length === 0) return;
        
        // Encontrar linha atual baseada no tempo
        let newIndex = -1;
        
        for (let i = AppState.lyrics.length - 1; i >= 0; i--) {
            if (currentTime >= AppState.lyrics[i].time - CONFIG.LYRIC_SYNC_TOLERANCE) {
                newIndex = i;
                break;
            }
        }
        
        // Atualizar se necessário
        if (newIndex !== AppState.currentLyricIndex && newIndex >= 0) {
            // Remover classe ativa anterior
            const previousLine = document.querySelector('.lyric-line.active');
            if (previousLine) {
                previousLine.classList.remove('active');
            }
            
            // Adicionar classe ativa nova
            const currentLine = document.querySelector(`.lyric-line[data-index="${newIndex}"]`);
            if (currentLine) {
                currentLine.classList.add('active');
                
                // Scroll para a linha
                if (DOM.lyricsDisplay && DOM.lyricsDisplay.contains(currentLine)) {
                    currentLine.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                
                // Atualizar letra atual no player
                if (DOM.currentLyricEl) {
                    DOM.currentLyricEl.innerHTML = `<p>${AppState.lyrics[newIndex].text}</p>`;
                }
            }
            
            AppState.currentLyricIndex = newIndex;
        }
    }
    
    static updateStats() {
        const totalLines = AppState.lyrics.length;
        const totalWords = AppState.lyrics.reduce((count, lyric) => {
            return count + lyric.text.split(/\s+/).length;
        }, 0);
        
        const totalLinesEl = document.getElementById('total-lines');
        const totalWordsEl = document.getElementById('total-words');
        
        if (totalLinesEl) totalLinesEl.textContent = totalLines;
        if (totalWordsEl) totalWordsEl.textContent = totalWords;
    }
}

// ==========================================================================
// SISTEMA DO PLAYER
// ==========================================================================

class PlayerSystem {
    static async initialize() {
        try {
            // Configurar áudio
            await AudioSystem.initialize();
            
            // Configurar letras
            LyricsSystem.initialize();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Carregar estado salvo
            this.loadSavedState();
            
            // Configurar interface
            this.updateUI();
            
            // Iniciar visualizador
            this.startVisualizer();
            
            // Marcar como inicializado
            AppState.isInitialized = true;
            
            // Esconder preloader
            setTimeout(() => {
                DOM.preloader.classList.add('loaded');
                setTimeout(() => {
                    DOM.preloader.style.display = 'none';
                }, 500);
            }, 1000);
            
            NotificationSystem.show('Harmony Player inicializado', 'success');
            console.log('✅ Player inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar player:', error);
            NotificationSystem.show('Erro ao inicializar player', 'error');
        }
    }
    
    static setupEventListeners() {
        // Controles básicos
        DOM.playBtn.addEventListener('click', () => this.togglePlay());
        DOM.prevBtn.addEventListener('click', () => this.previous());
        DOM.nextBtn.addEventListener('click', () => this.next());
        DOM.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        DOM.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        DOM.muteBtn.addEventListener('click', () => this.toggleMute());
        
        // Now Playing controls
        DOM.npPlayBtn.addEventListener('click', () => this.togglePlay());
        
        // Controles de tempo
        DOM.progressBar.addEventListener('click', (e) => this.seek(e));
        DOM.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        DOM.audioPlayer.addEventListener('loadedmetadata', () => {
            AppState.duration = DOM.audioPlayer.duration;
            this.updateTimeDisplay();
        });
        DOM.audioPlayer.addEventListener('ended', () => this.onSongEnd());
        
        // Volume
        DOM.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Letras
        DOM.syncModeBtn.addEventListener('click', () => this.toggleLyricsSync());
        DOM.karaokeModeBtn.addEventListener('click', () => this.toggleKaraokeMode());
        
        // Interface
        DOM.themeToggle.addEventListener('click', () => this.toggleTheme());
        DOM.visualizerToggle.addEventListener('click', () => this.toggleVisualizer());
        DOM.equalizerBtn.addEventListener('click', () => this.showEqualizer());
        
        // Fila
        DOM.clearQueueBtn.addEventListener('click', () => this.clearQueue());
        DOM.addMusicBtn.addEventListener('click', () => this.addToQueue());
        
        // Modais
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideEqualizer());
        }
        
        // Navegação
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
        
        // Formulários
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Auth tabs
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = tab.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });
        
        // Toggle password visibility
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = toggle.parentElement.querySelector('input');
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                toggle.innerHTML = type === 'password' ? 
                    '<i class="fas fa-eye"></i>' : 
                    '<i class="fas fa-eye-slash"></i>';
            });
        });
        
        // Window events
        window.addEventListener('resize', Utils.debounce(() => this.onResize(), 250));
        window.addEventListener('online', () => this.onNetworkStatusChange(true));
        window.addEventListener('offline', () => this.onNetworkStatusChange(false));
    }
    
    static loadSavedState() {
        // Carregar preferências
        const savedTheme = Utils.storage.get('theme', 'dark');
        this.setTheme(savedTheme);
        
        const savedVolume = Utils.storage.get('volume', CONFIG.DEFAULT_VOLUME);
        this.setVolume(savedVolume, false);
        
        const savedEQ = Utils.storage.get('equalizerPreset', 'flat');
        AudioSystem.applyEqualizer(savedEQ);
        
        const savedPreferences = Utils.storage.get('preferences', AppState.preferences);
        AppState.preferences = { ...AppState.preferences, ...savedPreferences };
    }
    
    static updateUI() {
        // Atualizar botões de controle
        DOM.playBtn.innerHTML = AppState.isPlaying ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
        
        DOM.npPlayBtn.innerHTML = AppState.isPlaying ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
        
        // Atualizar estados dos botões
        DOM.shuffleBtn.classList.toggle('active', AppState.isShuffle);
        DOM.repeatBtn.classList.toggle('active', AppState.isRepeat);
        DOM.muteBtn.classList.toggle('active', AppState.isMuted);
        
        // Atualizar ícones
        DOM.muteBtn.innerHTML = AppState.isMuted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            AppState.volume === 0 ? 
                '<i class="fas fa-volume-mute"></i>' : 
                AppState.volume < 50 ? 
                    '<i class="fas fa-volume-down"></i>' : 
                    '<i class="fas fa-volume-up"></i>';
        
        // Atualizar letras
        DOM.syncModeBtn.classList.toggle('active', AppState.isLyricsSynced);
        DOM.karaokeModeBtn.classList.toggle('active', AppState.isKaraokeMode);
        
        // Atualizar tema
        DOM.themeToggle.innerHTML = AppState.theme === 'dark' ? 
            '<i class="fas fa-sun"></i>' : 
            '<i class="fas fa-moon"></i>';
    }
    
    static updateProgress() {
        const currentTime = DOM.audioPlayer.currentTime;
        AppState.currentTime = currentTime;
        
        // Atualizar displays de tempo
        DOM.currentTimeEl.textContent = Utils.formatTime(currentTime);
        DOM.npCurrentTime.textContent = Utils.formatTime(currentTime);
        
        // Atualizar barras de progresso
        const progressPercent = (currentTime / AppState.duration) * 100;
        DOM.progressFill.style.width = `${progressPercent}%`;
        DOM.npProgressFill.style.width = `${progressPercent}%`;
        
        // Atualizar posição do handle
        const progressRect = DOM.progressBar.getBoundingClientRect();
        const handlePosition = (progressPercent / 100) * progressRect.width;
        DOM.progressHandle.style.left = `${handlePosition}px`;
        
        // Atualizar letras
        LyricsSystem.updateLyrics(currentTime);
    }
    
    static updateTimeDisplay() {
        DOM.totalTimeEl.textContent = Utils.formatTime(AppState.duration);
        DOM.npTotalTime.textContent = Utils.formatTime(AppState.duration);
    }
    
    static togglePlay() {
        if (AppState.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    static async play() {
        try {
            // Retomar contexto de áudio se suspenso
            if (AppState.audioContext.state === 'suspended') {
                await AppState.audioContext.resume();
            }
            
            // Conectar fonte de áudio se necessário
            if (!AppState.audioSource) {
                AppState.audioSource = AppState.audioContext.createMediaElementSource(DOM.audioPlayer);
                AppState.audioSource.connect(AppState.gainNode);
            }
            
            // Reproduzir
            await DOM.audioPlayer.play();
            AppState.isPlaying = true;
            this.updateUI();
            
            // Iniciar visualizador
            this.startVisualizer();
            
        } catch (error) {
            console.error('❌ Erro ao reproduzir:', error);
            NotificationSystem.show('Erro ao reproduzir áudio', 'error');
        }
    }
    
    static pause() {
        DOM.audioPlayer.pause();
        AppState.isPlaying = false;
        this.updateUI();
    }
    
    static previous() {
        if (AppState.currentTime > 3) {
            // Se já passou mais de 3 segundos, voltar ao início
            DOM.audioPlayer.currentTime = 0;
        } else if (AppState.queue.length > 0) {
            // Ir para música anterior na fila
            AppState.currentQueueIndex = Math.max(0, AppState.currentQueueIndex - 1);
            this.loadQueueItem(AppState.currentQueueIndex);
        }
    }
    
    static next() {
        if (AppState.queue.length > 0) {
            // Ir para próxima música na fila
            AppState.currentQueueIndex = Math.min(
                AppState.queue.length - 1, 
                AppState.currentQueueIndex + 1
            );
            this.loadQueueItem(AppState.currentQueueIndex);
        } else if (AppState.isRepeat) {
            // Repetir a mesma música
            DOM.audioPlayer.currentTime = 0;
            this.play();
        }
    }
    
    static toggleShuffle() {
        AppState.isShuffle = !AppState.isShuffle;
        Utils.storage.set('isShuffle', AppState.isShuffle);
        this.updateUI();
        
        NotificationSystem.show(
            AppState.isShuffle ? 'Modo embaralhado ativado' : 'Modo embaralhado desativado',
            'info'
        );
    }
    
    static toggleRepeat() {
        AppState.isRepeat = !AppState.isRepeat;
        Utils.storage.set('isRepeat', AppState.isRepeat);
        this.updateUI();
        
        NotificationSystem.show(
            AppState.isRepeat ? 'Modo repetir ativado' : 'Modo repetir desativado',
            'info'
        );
    }
    
    static toggleMute() {
        AppState.isMuted = !AppState.isMuted;
        
        if (AppState.isMuted) {
            AppState.gainNode.gain.value = 0;
        } else {
            AppState.gainNode.gain.value = AppState.volume / 100;
        }
        
        Utils.storage.set('isMuted', AppState.isMuted);
        this.updateUI();
    }
    
    static setVolume(value, showNotification = true) {
        const volume = Utils.clamp(parseInt(value), 0, 100);
        AppState.volume = volume;
        
        if (!AppState.isMuted) {
            AppState.gainNode.gain.value = volume / 100;
        }
        
        // Atualizar interface
        DOM.volumeFill.style.width = `${volume}%`;
        DOM.volumeSlider.value = volume;
        
        // Salvar preferência
        Utils.storage.set('volume', volume);
        
        // Atualizar UI
        this.updateUI();
        
        // Notificação opcional
        if (showNotification && volume % 25 === 0) {
            NotificationSystem.show(`Volume: ${volume}%`, 'info', 1000);
        }
    }
    
    static seek(event) {
        const rect = DOM.progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const time = percent * AppState.duration;
        
        DOM.audioPlayer.currentTime = time;
        
        if (!AppState.isPlaying) {
            this.play();
        }
    }
    
    static onSongEnd() {
        if (AppState.isRepeat) {
            DOM.audioPlayer.currentTime = 0;
            this.play();
        } else if (AppState.queue.length > 0) {
            this.next();
        } else {
            AppState.isPlaying = false;
            this.updateUI();
        }
    }
    
    static toggleLyricsSync() {
        AppState.isLyricsSynced = !AppState.isLyricsSynced;
        Utils.storage.set('isLyricsSynced', AppState.isLyricsSynced);
        this.updateUI();
        
        NotificationSystem.show(
            AppState.isLyricsSynced ? 'Letras sincronizadas ativadas' : 'Letras sincronizadas desativadas',
            'info'
        );
    }
    
    static toggleKaraokeMode() {
        AppState.isKaraokeMode = !AppState.isKaraokeMode;
        
        if (DOM.lyricsDisplay) {
            DOM.lyricsDisplay.classList.toggle('karaoke-mode', AppState.isKaraokeMode);
        }
        
        Utils.storage.set('isKaraokeMode', AppState.isKaraokeMode);
        this.updateUI();
        
        NotificationSystem.show(
            AppState.isKaraokeMode ? 'Modo karaokê ativado' : 'Modo karaokê desativado',
            'info'
        );
    }
    
    static toggleTheme() {
        const newTheme = AppState.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    static setTheme(theme) {
        AppState.theme = theme;
        document.documentElement.className = `${theme}-theme`;
        Utils.storage.set('theme', theme);
        this.updateUI();
        
        NotificationSystem.show(
            `Tema ${theme === 'dark' ? 'escuro' : 'claro'} ativado`,
            'info'
        );
    }
    
    static toggleVisualizer() {
        const currentIndex = CONFIG.VISUALIZER_MODES.indexOf(AppState.visualizerMode);
        const nextIndex = (currentIndex + 1) % CONFIG.VISUALIZER_MODES.length;
        
        AppState.visualizerMode = CONFIG.VISUALIZER_MODES[nextIndex];
        Utils.storage.set('visualizerMode', AppState.visualizerMode);
        
        NotificationSystem.show(
            `Visualizador: ${AppState.visualizerMode}`,
            'info'
        );
    }
    
    static startVisualizer() {
        if (DOM.waveformCanvas) {
            AudioSystem.updateVisualizer();
        }
        
        if (DOM.visualizerCanvas) {
            AudioSystem.updateAdvancedVisualizer();
        }
    }
    
    static showEqualizer() {
        if (DOM.equalizerModal) {
            DOM.equalizerModal.classList.add('active');
            this.renderEqualizerSliders();
        }
    }
    
    static hideEqualizer() {
        if (DOM.equalizerModal) {
            DOM.equalizerModal.classList.remove('active');
        }
    }
    
    static renderEqualizerSliders() {
        const container = document.getElementById('equalizer-sliders');
        if (!container) return;
        
        container.innerHTML = '';
        
        const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        const preset = CONFIG.EQ_PRESETS[AppState.equalizerPreset] || CONFIG.EQ_PRESETS.flat;
        
        frequencies.forEach((freq, index) => {
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'equalizer-slider';
            
            const label = document.createElement('label');
            label.textContent = freq >= 1000 ? `${freq/1000}K` : freq.toString();
            
            const input = document.createElement('input');
            input.type = 'range';
            input.min = '-12';
            input.max = '12';
            input.step = '1';
            input.value = preset[index] || 0;
            input.dataset.index = index;
            
            input.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                const index = parseInt(e.target.dataset.index);
                
                if (AppState.eqFilters[index]) {
                    AppState.eqFilters[index].gain.value = value;
                }
            });
            
            sliderGroup.appendChild(label);
            sliderGroup.appendChild(input);
            container.appendChild(sliderGroup);
        });
        
        // Configurar presets
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.preset === AppState.equalizerPreset);
            
            btn.addEventListener('click', () => {
                AudioSystem.applyEqualizer(btn.dataset.preset);
                this.renderEqualizerSliders();
                
                NotificationSystem.show(
                    `Equalizador: ${btn.dataset.preset}`,
                    'success'
                );
            });
        });
    }
    
    static clearQueue() {
        if (AppState.queue.length === 0) return;
        
        AppState.queue = [];
        AppState.currentQueueIndex = 0;
        this.renderQueue();
        
        NotificationSystem.show('Fila limpa', 'success');
    }
    
    static addToQueue() {
        // Em uma implementação real, isso abriria um seletor de arquivos
        NotificationSystem.show('Funcionalidade em desenvolvimento', 'info');
    }
    
    static loadQueueItem(index) {
        if (index >= 0 && index < AppState.queue.length) {
            const item = AppState.queue[index];
            // Carregar música...
            NotificationSystem.show(`Carregando: ${item.title}`, 'info');
        }
    }
    
    static renderQueue() {
        if (!DOM.queueList) return;
        
        DOM.queueList.innerHTML = '';
        
        AppState.queue.forEach((item, index) => {
            const queueItem = document.createElement('div');
            queueItem.className = `queue-item ${index === AppState.currentQueueIndex ? 'active' : ''}`;
            queueItem.innerHTML = `
                <div class="queue-item-info">
                    <span class="queue-item-title">${item.title}</span>
                    <span class="queue-item-artist">${item.artist}</span>
                </div>
                <span class="queue-item-duration">${Utils.formatTime(item.duration)}</span>
            `;
            
            queueItem.addEventListener('click', () => {
                AppState.currentQueueIndex = index;
                this.loadQueueItem(index);
                this.renderQueue();
            });
            
            DOM.queueList.appendChild(queueItem);
        });
        
        // Se não houver itens, mostrar mensagem
        if (AppState.queue.length === 0) {
            DOM.queueList.innerHTML = `
                <div class="queue-empty">
                    <i class="fas fa-music"></i>
                    <p>Nenhuma música na fila</p>
                    <p class="queue-empty-hint">Adicione músicas para começar</p>
                </div>
            `;
        }
    }
    
    static navigateTo(page) {
        // Atualizar navegação
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Mostrar página
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => {
            p.classList.toggle('active', p.id === `${page}-page`);
        });
    }
    
    static async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Validação básica
        if (!email || !password) {
            NotificationSystem.show('Preencha todos os campos', 'error');
            return;
        }
        
        // Simulação de login
        if (email === 'demo@harmony.com' && password === 'Harmony2024!') {
            AppState.isLoggedIn = true;
            AppState.user = {
                name: 'Demo User',
                email: email,
                avatar: null
            };
            
            Utils.storage.set('user', AppState.user);
            
            NotificationSystem.show('Login realizado com sucesso!', 'success');
            
            // Navegar para o player
            setTimeout(() => {
                this.navigateTo('player');
                this.updateUserMenu();
            }, 1000);
        } else {
            NotificationSystem.show('Credenciais inválidas', 'error');
        }
    }
    
    static handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        // Validação
        if (!name || !email || !password || !confirm) {
            NotificationSystem.show('Preencha todos os campos', 'error');
            return;
        }
        
        if (password !== confirm) {
            NotificationSystem.show('As senhas não coincidem', 'error');
            return;
        }
        
        if (password.length < 8) {
            NotificationSystem.show('A senha deve ter pelo menos 8 caracteres', 'error');
            return;
        }
        
        // Simulação de registro
        AppState.isLoggedIn = true;
        AppState.user = {
            name: name,
            email: email,
            avatar: null
        };
        
        Utils.storage.set('user', AppState.user);
        
        NotificationSystem.show('Conta criada com sucesso!', 'success');
        
        // Navegar para o player
        setTimeout(() => {
            this.navigateTo('player');
            this.updateUserMenu();
        }, 1000);
    }
    
    static switchAuthTab(tabName) {
        // Atualizar tabs
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Mostrar formulário correto
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.classList.toggle('active', form.dataset.form === tabName);
        });
    }
    
    static updateUserMenu() {
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userName = document.querySelector('.user-name');
        const userStatus = document.querySelector('.user-status');
        
        if (AppState.isLoggedIn && AppState.user) {
            if (userMenuBtn) {
                userMenuBtn.innerHTML = '<i class="fas fa-user-check"></i>';
            }
            if (userName) {
                userName.textContent = AppState.user.name;
            }
            if (userStatus) {
                userStatus.textContent = 'Conectado';
            }
        } else {
            if (userMenuBtn) {
                userMenuBtn.innerHTML = '<i class="fas fa-user"></i>';
            }
            if (userName) {
                userName.textContent = 'Convidado';
            }
            if (userStatus) {
                userStatus.textContent = 'Não logado';
            }
        }
    }
    
    static onResize() {
        // Redimensionar canvas
        if (DOM.waveformCanvas) {
            DOM.waveformCanvas.width = DOM.waveformCanvas.parentElement.clientWidth;
            DOM.waveformCanvas.height = DOM.waveformCanvas.parentElement.clientHeight;
        }
        
        if (DOM.visualizerCanvas) {
            DOM.visualizerCanvas.width = DOM.visualizerCanvas.parentElement.clientWidth;
            DOM.visualizerCanvas.height = DOM.visualizerCanvas.parentElement.clientHeight;
        }
    }
    
    static onNetworkStatusChange(isOnline) {
        AppState.isOffline = !isOnline;
        
        NotificationSystem.show(
            isOnline ? 'Conexão restaurada' : 'Você está offline',
            isOnline ? 'success' : 'warning'
        );
    }
    
    static extractAlbumColors() {
        if (!DOM.albumArt || DOM.albumArt.complete === false) return;
        
        Utils.extractColorsFromImage(DOM.albumArt)
            .then(colors => {
                AppState.extractedColors = colors;
                
                // Aplicar cores à interface
                this.applyExtractedColors(colors);
                
                NotificationSystem.show('Cores extraídas da capa', 'success');
            })
            .catch(error => {
                console.error('Erro ao extrair cores:', error);
            });
    }
    
    static applyExtractedColors(colors) {
        // Aplicar gradiente dinâmico
        const gradientEl = document.getElementById('dynamic-gradient');
        if (gradientEl) {
            gradientEl.style.background = `
                linear-gradient(135deg, 
                    ${colors.primary}20 0%, 
                    ${colors.secondary}20 50%, 
                    ${colors.accent}10 100%
                )
            `;
        }
        
        // Atualizar variáveis CSS
        document.documentElement.style.setProperty('--color-primary', colors.primary);
        document.documentElement.style.setProperty('--color-secondary', colors.secondary);
        document.documentElement.style.setProperty('--color-accent', colors.accent);
    }
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Inicializando Harmony Player...');
    
    // Extrair cores da capa quando carregada
    if (DOM.albumArt) {
        if (DOM.albumArt.complete) {
            PlayerSystem.extractAlbumColors();
        } else {
            DOM.albumArt.addEventListener('load', () => {
                PlayerSystem.extractAlbumColors();
            });
        }
    }
    
    // Inicializar player
    await PlayerSystem.initialize();
    
    // Configurar redimensionamento inicial
    PlayerSystem.onResize();
    
    // Configurar menu do usuário
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', () => {
            userDropdown.classList.toggle('show');
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Configurar logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            AppState.isLoggedIn = false;
            AppState.user = null;
            Utils.storage.remove('user');
            PlayerSystem.updateUserMenu();
            NotificationSystem.show('Logout realizado', 'info');
        });
    }
    
    // Configurar visualizador
    const visualizerModeSelect = document.getElementById('visualizer-mode');
    if (visualizerModeSelect) {
        visualizerModeSelect.value = AppState.visualizerMode;
        visualizerModeSelect.addEventListener('change', (e) => {
            AppState.visualizerMode = e.target.value;
            Utils.storage.set('visualizerMode', AppState.visualizerMode);
        });
    }
    
    console.log('🎵 Harmony Player pronto!');
});

// Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('❌ Falha ao registrar Service Worker:', error);
            });
    });
}

// Manipulador de erros global
window.addEventListener('error', (e) => {
    console.error('Erro global:', e.error);
    NotificationSystem.show(`Erro: ${e.message}`, 'error');
});

// ==========================================================================
// EXPORTAÇÕES (para desenvolvimento)
// ==========================================================================

// Expor para console (apenas desenvolvimento)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.Harmony = {
        Player: PlayerSystem,
        Audio: AudioSystem,
        Lyrics: LyricsSystem,
        Utils: Utils,
        State: AppState,
        Config: CONFIG
    };
    
    console.log('🔧 Harmony Player exposto no console como window.Harmony');
}