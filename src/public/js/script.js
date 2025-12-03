// Elementos DOM
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progress = document.getElementById('progress');
const progressBar = document.querySelector('.progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const volumeSlider = document.getElementById('volume-slider');
const lyricsDisplay = document.getElementById('lyrics-display');
const backgroundGradient = document.getElementById('background-gradient');
const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');
const loginForm = document.getElementById('login-form');
const currentYear = document.getElementById('current-year');

// Estado do player
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;
let currentLyricIndex = 0;

// Informações da música
const songInfo = {
    title: "Everything is romantic featuring caroline polachek",
    artist: "Charli xcx",
    duration: 324,
    coverColors: {
        primary: "#36e436ff", // Violeta para combinar com a vibe da música
        secondary: "#39c51dff" // Rosa profundo
    }
};

// Letras da música (formatadas corretamente)
const lyrics = [
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

// Inicialização
function init() {
    // Configurar ano atual no rodapé
    currentYear.textContent = new Date().getFullYear();
    
    // Carregar informações da música
    loadSongInfo();
    
    // Configurar eventos
    setupEventListeners();
    
    // Carregar letras
    loadLyrics();
    
    // Atualizar UI
    updatePlayerUI();
}

// Carregar informações da música
function loadSongInfo() {
    songTitle.textContent = songInfo.title;
    songArtist.textContent = songInfo.artist;
    
    // Quando os metadados do áudio carregarem
    audioPlayer.addEventListener('loadedmetadata', function() {
        songInfo.duration = audioPlayer.duration;
        updateTimeDisplay(0, songInfo.duration);
    });
    
    // Tentar extrair cores da capa (simulação)
    extractColorsFromCover();
}

// Extrair cores da capa do álbum (simulação)
function extractColorsFromCover() {
    // Em um caso real, você usaria uma biblioteca como Color Thief
    // Para demonstração, usaremos cores pré-definidas
    
    // Verificar se a imagem da capa existe
    albumArt.onload = function() {
        // Aqui normalmente analisaríamos as cores dominantes da imagem
        // Por enquanto, usaremos as cores pré-definidas
        updateBackgroundGradient(songInfo.coverColors.primary, songInfo.coverColors.secondary);
    };
    
    // Se a imagem não carregar, usar cores padrão
    albumArt.onerror = function() {
        console.log("Capa não encontrada, usando cores padrão");
        updateBackgroundGradient(songInfo.coverColors.primary, songInfo.coverColors.secondary);
    };
}

// Atualizar gradiente de fundo
function updateBackgroundGradient(color1, color2) {
    backgroundGradient.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
    
    // Atualizar variáveis CSS
    document.documentElement.style.setProperty('--primary-color', color1);
    document.documentElement.style.setProperty('--secondary-color', color2);
}

// Configurar eventos
function setupEventListeners() {
    // Controles de reprodução
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', playNext);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    
    // Barra de progresso
    progressBar.addEventListener('click', setProgress);
    
    // Volume
    volumeSlider.addEventListener('input', setVolume);
    
    // Eventos de áudio
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', onSongEnd);
    
    // Navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            switchPage(page);
        });
    });
    
    // Formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Alternar reprodução
function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

// Reproduzir música
function playSong() {
    isPlaying = true;
    audioPlayer.play();
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    playBtn.title = "Pausar";
}

// Pausar música
function pauseSong() {
    isPlaying = false;
    audioPlayer.pause();
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    playBtn.title = "Reproduzir";
}

// Música anterior
function playPrevious() {
    // Com apenas uma música, reinicia do início
    audioPlayer.currentTime = 0;
    if (!isPlaying) {
        playSong();
    }
}

// Próxima música
function playNext() {
    // Com apenas uma música, reinicia do início
    audioPlayer.currentTime = 0;
    if (!isPlaying) {
        playSong();
    }
}

// Alternar embaralhamento
function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.style.color = isShuffle ? 'var(--secondary-color)' : 'var(--text-color)';
    shuffleBtn.title = isShuffle ? "Desligar embaralhamento" : "Embaralhar";
}

// Alternar repetição
function toggleRepeat() {
    isRepeat = !isRepeat;
    repeatBtn.style.color = isRepeat ? 'var(--secondary-color)' : 'var(--text-color)';
    repeatBtn.title = isRepeat ? "Desligar repetição" : "Repetir";
}

// Definir volume
function setVolume() {
    const volume = volumeSlider.value / 100;
    audioPlayer.volume = volume;
    
    // Atualizar ícone do volume
    const volumeIcon = document.querySelector('.volume-control i');
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

// Atualizar barra de progresso
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    
    // Atualizar barra de progresso
    const progressPercent = (currentTime / duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Atualizar tempo
    updateTimeDisplay(currentTime, duration);
    
    // Atualizar letra sincronizada
    updateLyrics(currentTime);
}

// Definir progresso ao clicar na barra
function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    audioPlayer.currentTime = (clickX / width) * duration;
}

// Atualizar exibição do tempo
function updateTimeDisplay(currentTime, duration) {
    // Formatar tempo atual
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSeconds = Math.floor(currentTime % 60);
    currentTimeEl.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
    
    // Formatar duração total
    if (duration && !isNaN(duration)) {
        const totalMinutes = Math.floor(duration / 60);
        const totalSeconds = Math.floor(duration % 60);
        totalTimeEl.textContent = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
    }
}

// Carregar letras
function loadLyrics() {
    lyricsDisplay.innerHTML = '';
    
    lyrics.forEach((lyric, index) => {
        const lyricElement = document.createElement('div');
        lyricElement.className = 'lyric-line';
        lyricElement.textContent = lyric.text;
        lyricElement.setAttribute('data-time', lyric.time);
        lyricElement.setAttribute('data-index', index);
        
        // Adicionar evento de clique para pular para o tempo da letra
        lyricElement.addEventListener('click', () => {
            audioPlayer.currentTime = lyric.time;
            if (!isPlaying) {
                playSong();
            }
        });
        
        lyricsDisplay.appendChild(lyricElement);
    });
}

// Atualizar letras sincronizadas
function updateLyrics(currentTime) {
    // Encontrar a linha atual baseada no tempo
    let currentIndex = -1;
    
    for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].time) {
            currentIndex = i;
        } else {
            break;
        }
    }
    
    // Se não encontrou nenhuma linha (antes da primeira)
    if (currentIndex === -1) {
        currentIndex = 0;
    }
    
    // Se a linha mudou, atualizar a UI
    if (currentIndex !== currentLyricIndex) {
        // Remover classe ativa da linha anterior
        const previousLine = document.querySelector(`.lyric-line[data-index="${currentLyricIndex}"]`);
        if (previousLine) {
            previousLine.classList.remove('active');
        }
        
        // Adicionar classe ativa à nova linha
        const currentLine = document.querySelector(`.lyric-line[data-index="${currentIndex}"]`);
        if (currentLine) {
            currentLine.classList.add('active');
            
            // Rolar para a linha atual
            currentLine.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
        
        currentLyricIndex = currentIndex;
    }
}

// Quando a música terminar
function onSongEnd() {
    if (isRepeat) {
        // Repetir a mesma música
        audioPlayer.currentTime = 0;
        playSong();
    } else {
        // Parar a reprodução
        pauseSong();
        audioPlayer.currentTime = 0;
        updateProgress();
    }
}

// Alternar entre páginas
function switchPage(page) {
    // Atualizar navegação ativa
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Mostrar página selecionada
    pageSections.forEach(section => {
        if (section.id === `${page}-section`) {
            section.classList.add('active');
        } else {
            section.classList.remove('active');
        }
    });
    
    // Se estiver na página do player e a música estiver pausada, tocar
    if (page === 'player' && !isPlaying) {
        // Opcional: tocar automaticamente ao mudar para a página do player
        // playSong();
    }
}

// Manipular login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    // Validação simples
    if (username === 'demo' && password === 'demo123') {
        // Mostrar mensagem de sucesso
        showNotification('Login bem-sucedido! Bem-vindo ao LyricSync.', 'success');
        
        // Salvar no localStorage se "Lembrar de mim" estiver marcado
        if (rememberMe) {
            localStorage.setItem('lyricsync_user', username);
        }
        
        // Redirecionar para a página do player
        setTimeout(() => {
            switchPage('player');
        }, 1000);
    } else {
        showNotification('Usuário ou senha incorretos. Use: demo / demo123', 'error');
    }
}

// Mostrar notificação
function showNotification(message, type) {
    // Remover notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Atualizar UI do player
function updatePlayerUI() {
    // Atualizar botões de controle
    shuffleBtn.style.color = isShuffle ? 'var(--secondary-color)' : 'var(--text-color)';
    repeatBtn.style.color = isRepeat ? 'var(--secondary-color)' : 'var(--text-color)';
}

// Verificar se há usuário salvo
function checkSavedUser() {
    const savedUser = localStorage.getItem('lyricsync_user');
    if (savedUser) {
        document.getElementById('username').value = savedUser;
        document.getElementById('remember-me').checked = true;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    init();
    checkSavedUser();
});