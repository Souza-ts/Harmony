// Inicialização principal
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar elementos DOM
    initializeDOM();
    
    // Inicializar autenticação
    initializeAuth();
    
    // Inicializar player
    initializePlayer();
    
    // Atualizar interface do usuário
    updateUserInterface();
});

function initializeDOM() {
    // Elementos de navegação
    pages = document.querySelectorAll('.page');
    navLinks = document.querySelectorAll('.nav-link');
    loginBtn = document.getElementById('login-btn');
    registerBtn = document.getElementById('register-btn');
    logoutBtn = document.getElementById('logout-btn');
    loggedOutDiv = document.getElementById('logged-out');
    loggedInDiv = document.getElementById('logged-in');
    userNameElement = document.getElementById('user-name');
    userAvatarElement = document.getElementById('user-avatar');
    loginForm = document.getElementById('login-form');
    registerForm = document.getElementById('register-form');
    registerLink = document.getElementById('register-link');
    loginLink = document.getElementById('login-link');
    
    // Elementos do player
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
    albumFallbackIcon = document.getElementById('album-fallback-icon');
    lyricsElement = document.getElementById('lyrics');
    musicListElement = document.getElementById('music-list');
}