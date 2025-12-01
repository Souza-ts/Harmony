// Inicialização principal da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos DOM
    initializeDOM();
    
    // Esconder loading
    setTimeout(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
        setTimeout(() => {
            document.getElementById('loading-overlay').style.display = 'none';
        }, 500);
    }, 1500);
    
    // Inicializar sistemas
    initializeAuth();
    initializePlayer();
    
    // Carregar favoritos
    musicLibrary.forEach(song => {
        song.favorite = favorites.includes(song.id);
    });
    
    // Configurar view controls
    const viewControls = document.querySelectorAll('.view-btn');
    viewControls.forEach(btn => {
        btn.addEventListener('click', () => {
            viewControls.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const view = btn.dataset.view;
            document.querySelector('.music-grid').style.gridTemplateColumns = 
                view === 'list' ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))';
        });
    });
    
    // Configurar font size button
    const fontSizeBtn = document.getElementById('font-size-btn');
    let fontSizeIndex = 0;
    const fontSizes = ['1rem', '1.125rem', '1.25rem', '1.375rem'];
    
    if (fontSizeBtn) {
        fontSizeBtn.addEventListener('click', () => {
            fontSizeIndex = (fontSizeIndex + 1) % fontSizes.length;
            lyricsElement.style.fontSize = fontSizes[fontSizeIndex];
            showNotification(`Tamanho da fonte: ${fontSizeIndex + 1}/4`);
        });
    }
});

function initializeDOM() {
    // Navegação
    pages = document.querySelectorAll('.page');
    navLinks = document.querySelectorAll('.nav-link');
    
    // Player elements
    playPauseBtn = document.getElementById('play-pause-btn');
    playPauseIcon = document.getElementById('play-pause-icon');
    prevBtn = document.getElementById('prev-btn');
    nextBtn = document.getElementById('next-btn');
    shuffleBtn = document.getElementById('shuffle-btn');
    repeatBtn = document.getElementById('repeat-btn');
    progressBar = document.getElementById('progress-bar');
    progress = document.getElementById('progress');
    currentTimeElement = document.getElementById('current-time');
    songDurationElement = document.getElementById('song-duration');
    currentSongTitle = document.getElementById('current-song-title');
    currentSongArtist = document.getElementById('current-song-artist');
    currentSongAlbum = document.getElementById('current-song-album');
    currentAlbumArt = document.getElementById('current-album-art');
    
    // Lyrics
    lyricsElement = document.getElementById('lyrics');
    autoScrollBtn = document.getElementById('auto-scroll-btn');
    
    // Music grid
    musicGrid = document.getElementById('music-grid');
    
    // Auth elements
    loginBtn = document.getElementById('login-btn');
    registerBtn = document.getElementById('register-btn');
    searchInput = document.getElementById('search-input');
    pageTitle = document.getElementById('page-title');
    usernameElement = document.getElementById('username');
    userActions = document.getElementById('user-actions');
}

// Função auxiliar para mostrar notificações
window.showNotification = function(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `floating-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animação
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Adicionar CSS para notificações flutuantes
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .floating-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
    
    .floating-notification.show {
        transform: translateX(0);
    }
    
    .floating-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .floating-notification.error {
        background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
    }
`;
document.head.appendChild(notificationStyle);

// Adicionar funcionalidade de teclas de atalho
document.addEventListener('keydown', (e) => {
    // Evitar atalhos em inputs
    if (e.target.tagName === 'INPUT') return;
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlayPause();
            break;
        case 'ArrowLeft':
            if (e.ctrlKey) playPreviousSong();
            break;
        case 'ArrowRight':
            if (e.ctrlKey) playNextSong();
            break;
        case 'KeyM':
            if (e.ctrlKey) {
                e.preventDefault();
                audioPlayer.muted = !audioPlayer.muted;
                showNotification(audioPlayer.muted ? 'Mudo' : 'Som ativado');
            }
            break;
    }
});

// Configurar service worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// Configurar instalação PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar botão de instalação
    const installBtn = document.createElement('button');
    installBtn.className = 'install-btn';
    installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
    installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            showNotification('Harmony instalado com sucesso!');
        }
        
        deferredPrompt = null;
        installBtn.remove();
    });
    
    document.body.appendChild(installBtn);
});

// Detectar conexão
window.addEventListener('online', () => {
    showNotification('Conexão restaurada', 'success');
});

window.addEventListener('offline', () => {
    showNotification('Você está offline', 'error');
});