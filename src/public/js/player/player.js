// Player de Música Harmony
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPause');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const shuffleBtn = document.getElementById('shuffle');
    const repeatBtn = document.getElementById('repeat');
    const progress = document.getElementById('progress');
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumePercent = document.getElementById('volumePercent');
    const volumeIcon = document.getElementById('volumeIcon');
    const trackTitle = document.getElementById('trackTitle');
    const trackArtist = document.getElementById('trackArtist');
    const trackAlbum = document.getElementById('trackAlbum');
    const albumCover = document.getElementById('albumCover');
    const playlistEl = document.getElementById('playlist');
    const lyricsContent = document.getElementById('lyricsContent');
    const noLyrics = document.getElementById('noLyrics');
    const syncToggle = document.getElementById('syncToggle');
    const fontSizeBtn = document.getElementById('fontSize');
    
    // Biblioteca de músicas (simulada)
    const musicLibrary = [
        {
            id: 1,
            title: "Lua de Cristal",
            artist: "Banda Harmony",
            album: "Noites Estelares",
            file: "music/song1.mp3",
            cover: "images/covers/cover1.jpg",
            duration: "3:45",
            lyrics: [
                {time: 0, text: "Sob a lua de cristal"},
                {time: 5, text: "Nosso amor se fez real"},
                {time: 10, text: "No silêncio da cidade"},
                {time: 15, text: "Encontro a tua verdade"},
                {time: 20, text: "E o tempo parou"},
                {time: 25, text: "Quando te encontrei"},
                {time: 30, text: "E o mundo girou"},
                {time: 35, text: "Mas só nós dois sabemos"}
            ]
        },
        {
            id: 2,
            title: "Vento Norte",
            artist: "Solo Acústico",
            album: "Caminhos",
            file: "music/song2.mp3",
            cover: "images/covers/cover2.jpg",
            duration: "4:20",
            lyrics: [
                {time: 0, text: "O vento norte sopra forte"},
                {time: 8, text: "Levando lembranças ao longe"},
                {time: 16, text: "Cada passo que eu dou"},
                {time: 24, text: "Me leva pra perto de você"},
                {time: 32, text: "No horizonte distante"},
                {time: 40, text: "Vejo nosso futuro brilhante"},
                {time: 48, text: "E sigo em frente sem temer"}
            ]
        },
        {
            id: 3,
            title: "Céu Aberto",
            artist: "DJ Harmony",
            album: "Eletrônico",
            file: "music/song3.mp3",
            cover: "images/covers/cover3.jpg",
            duration: "3:15",
            lyrics: []
        }
    ];
    
    // Estado do player
    let currentTrackIndex = 0;
    let isPlaying = false;
    let isShuffled = false;
    let isRepeating = false;
    let currentLyricIndex = 0;
    let fontSizeLevel = 1; // 1: normal, 2: médio, 3: grande
    
    // Inicialização
    function init() {
        loadTrack(currentTrackIndex);
        renderPlaylist();
        updatePlayerInfo();
        
        // Event Listeners
        playPauseBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevTrack);
        nextBtn.addEventListener('click', nextTrack);
        shuffleBtn.addEventListener('click', toggleShuffle);
        repeatBtn.addEventListener('click', toggleRepeat);
        
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('ended', nextTrack);
        audioPlayer.addEventListener('loadedmetadata', function() {
            totalTimeEl.textContent = formatTime(audioPlayer.duration);
        });
        
        progressBar.addEventListener('click', setProgress);
        
        volumeSlider.addEventListener('input', function() {
            const volume = this.value / 100;
            audioPlayer.volume = volume;
            volumePercent.textContent = `${this.value}%`;
            updateVolumeIcon(this.value);
        });
        
        syncToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.className = 'fas fa-sync';
                this.innerHTML = '<i class="fas fa-sync"></i> Sincronizado';
            } else {
                icon.className = 'fas fa-sync-alt';
                this.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizado';
            }
        });
        
        fontSizeBtn.addEventListener('click', function() {
            fontSizeLevel = (fontSizeLevel % 3) + 1;
            updateLyricsFontSize();
        });
    }
    
    // Carregar uma faixa
    function loadTrack(index) {
        const track = musicLibrary[index];
        
        // Atualizar elementos da UI
        trackTitle.textContent = track.title;
        trackArtist.textContent = track.artist;
        trackAlbum.textContent = track.album;
        albumCover.src = track.cover;
        albumCover.alt = `Capa do álbum: ${track.album}`;
        
        // Carregar áudio
        audioPlayer.src = track.file;
        
        // Atualizar informações da música
        document.getElementById('durationInfo').textContent = track.duration;
        
        // Carregar letras
        loadLyrics(track.lyrics);
        
        // Atualizar playlist ativa
        updateActivePlaylistItem();
    }
    
    // Renderizar playlist
    function renderPlaylist() {
        playlistEl.innerHTML = '';
        
        musicLibrary.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (index === currentTrackIndex) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <img src="${track.cover}" alt="${track.title}">
                <div class="track-details">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-duration">${track.duration}</div>
            `;
            
            item.addEventListener('click', () => {
                currentTrackIndex = index;
                loadTrack(currentTrackIndex);
                if (isPlaying) {
                    audioPlayer.play();
                }
            });
            
            playlistEl.appendChild(item);
        });
    }
    
    // Atualizar item ativo na playlist
    function updateActivePlaylistItem() {
        const items = document.querySelectorAll('.playlist-item');
        items.forEach((item, index) => {
            if (index === currentTrackIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
    
    // Carregar letras
    function loadLyrics(lyrics) {
        lyricsContent.innerHTML = '';
        
        if (lyrics.length === 0) {
            noLyrics.style.display = 'block';
            lyricsContent.style.display = 'none';
            return;
        }
        
        noLyrics.style.display = 'none';
        lyricsContent.style.display = 'block';
        
        lyrics.forEach((line, index) => {
            const lineEl = document.createElement('div');
            lineEl.className = 'lyrics-line';
            lineEl.dataset.time = line.time;
            lineEl.textContent = line.text;
            
            if (index === 0) {
                lineEl.classList.add('active');
            }
            
            lyricsContent.appendChild(lineEl);
        });
        
        currentLyricIndex = 0;
    }
    
    // Atualizar letras sincronizadas
    function updateLyrics() {
        if (!syncToggle.classList.contains('active')) return;
        
        const currentTime = audioPlayer.currentTime;
        const lines = document.querySelectorAll('.lyrics-line');
        
        // Encontrar a linha atual baseada no tempo
        let newIndex = 0;
        for (let i = lines.length - 1; i >= 0; i--) {
            const time = parseFloat(lines[i].dataset.time);
            if (currentTime >= time) {
                newIndex = i;
                break;
            }
        }
        
        // Atualizar se a linha mudou
        if (newIndex !== currentLyricIndex) {
            if (lines[currentLyricIndex]) {
                lines[currentLyricIndex].classList.remove('active');
            }
            if (lines[newIndex]) {
                lines[newIndex].classList.add('active');
                currentLyricIndex = newIndex;
                
                // Rolar para a linha ativa
                lines[newIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }
    
    // Atualizar tamanho da fonte das letras
    function updateLyricsFontSize() {
        const sizes = ['1.1rem', '1.3rem', '1.5rem'];
        lyricsContent.style.fontSize = sizes[fontSizeLevel - 1];
        
        // Atualizar texto do botão
        let sizeText = 'Aa';
        if (fontSizeLevel === 2) sizeText = 'AA';
        if (fontSizeLevel === 3) sizeText = 'AAA';
        fontSizeBtn.innerHTML = `<i class="fas fa-text-height"></i> ${sizeText}`;
    }
    
    // Atualizar ícone do volume
    function updateVolumeIcon(value) {
        if (value == 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }
    
    // Atualizar informações do player
    function updatePlayerInfo() {
        const track = musicLibrary[currentTrackIndex];
        const size = Math.floor(Math.random() * 5) + 5;
        document.getElementById('sizeInfo').textContent = `${size}.${Math.floor(Math.random() * 9)} MB`;
    }
    
    // Controlar reprodução
    function togglePlay() {
        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    }
    
    function playTrack() {
        audioPlayer.play();
        isPlaying = true;
        playIcon.className = 'fas fa-pause';
        playPauseBtn.setAttribute('title', 'Pausar');
    }
    
    function pauseTrack() {
        audioPlayer.pause();
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        playPauseBtn.setAttribute('title', 'Reproduzir');
    }
    
    // Faixa anterior
    function prevTrack() {
        currentTrackIndex--;
        if (currentTrackIndex < 0) {
            currentTrackIndex = musicLibrary.length - 1;
        }
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            audioPlayer.play();
        }
    }
    
    // Próxima faixa
    function nextTrack() {
        if (isShuffled) {
            currentTrackIndex = Math.floor(Math.random() * musicLibrary.length);
        } else {
            currentTrackIndex++;
            if (currentTrackIndex >= musicLibrary.length) {
                if (isRepeating) {
                    currentTrackIndex = 0;
                } else {
                    currentTrackIndex = 0;
                    pauseTrack();
                    return;
                }
            }
        }
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            audioPlayer.play();
        }
    }
    
    // Ativar/desativar embaralhamento
    function toggleShuffle() {
        isShuffled = !isShuffled;
        shuffleBtn.classList.toggle('active', isShuffled);
        shuffleBtn.setAttribute('title', isShuffled ? 'Desativar embaralhamento' : 'Ativar embaralhamento');
    }
    
    // Ativar/desativar repetição
    function toggleRepeat() {
        isRepeating = !isRepeating;
        repeatBtn.classList.toggle('active', isRepeating);
        repeatBtn.setAttribute('title', isRepeating ? 'Desativar repetição' : 'Ativar repetição');
    }
    
    // Atualizar barra de progresso
    function updateProgress() {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progress.style.width = `${progressPercent}%`;
            
            currentTimeEl.textContent = formatTime(currentTime);
            
            // Atualizar letras
            updateLyrics();
        }
    }
    
    // Definir progresso ao clicar na barra
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        
        if (duration) {
            audioPlayer.currentTime = (clickX / width) * duration;
        }
    }
    
    // Formatar tempo (segundos para MM:SS)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Inicializar o player
    init();
    
    // Adicionar funcionalidade para o menu hamburguer
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
});