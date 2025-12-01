// Funções do player de música
function initializePlayer() {
    audioPlayer = new Audio();
    
    // Event listeners dos controles
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNextSong);
    prevBtn.addEventListener('click', playPrevSong);
    
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.style.color = isShuffle ? 'var(--primary-color)' : 'white';
    });
    
    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        repeatBtn.style.color = isRepeat ? 'var(--primary-color)' : 'white';
    });
    
    // Barra de progresso
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        
        const song = musicLibrary[currentSongIndex];
        const newTime = Math.floor(percentage * song.duration);
        
        audioPlayer.currentTime = newTime;
        currentTime = newTime;
        updateProgress();
        updateActiveLyric(currentTime);
    });
    
    // Eventos do player de áudio
    audioPlayer.addEventListener('timeupdate', () => {
        currentTime = Math.floor(audioPlayer.currentTime);
        updateProgress();
        updateActiveLyric(currentTime);
    });
    
    audioPlayer.addEventListener('ended', () => {
        if (isRepeat) {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            playNextSong();
        }
    });
    
    // Inicializar
    loadSong(currentSongIndex);
    renderMusicList();
}

// Carregar música
function loadSong(index) {
    const song = musicLibrary[index];
    currentSongIndex = index;
    
    // Atualizar informações da música
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;
    currentSongAlbum.textContent = song.album;
    
    // Carregar capa da música
    loadAlbumArt(song.cover);
    
    // Configurar o player de áudio
    audioPlayer.src = song.file;
    audioPlayer.load();
    
    // Atualizar duração
    audioPlayer.addEventListener('loadedmetadata', () => {
        const duration = Math.floor(audioPlayer.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        songDurationElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });
    
    // Carregar letras
    loadLyrics(song.lyrics);
    
    // Atualizar lista de músicas
    updateActiveSongInList();
    
    // Resetar progresso
    currentTime = 0;
    progress.style.width = '0%';
    currentTimeElement.textContent = '00:00';
    
    // Se estava tocando, continuar tocando
    if (isPlaying) {
        playSong();
    }
}

// Carregar capa do álbum
function loadAlbumArt(coverUrl) {
    currentAlbumArt.src = coverUrl;
    currentAlbumArt.onload = () => {
        currentAlbumArt.style.display = 'block';
        albumFallbackIcon.style.display = 'none';
    };
    currentAlbumArt.onerror = () => {
        currentAlbumArt.style.display = 'none';
        albumFallbackIcon.style.display = 'block';
    };
}

// Carregar letras
function loadLyrics(lyrics) {
    lyricsElement.innerHTML = '';
    
    lyrics.forEach(line => {
        const lineElement = document.createElement('div');
        lineElement.className = 'line';
        lineElement.textContent = line.text;
        lineElement.dataset.time = line.time;
        lyricsElement.appendChild(lineElement);
    });
}

// Atualizar letra ativa
function updateActiveLyric(time) {
    const lines = document.querySelectorAll('.lyrics .line');
    let activeLineIndex = -1;
    
    lines.forEach((line, index) => {
        line.classList.remove('active');
        
        const lineTime = parseInt(line.dataset.time);
        if (lineTime <= time) {
            activeLineIndex = index;
        }
    });
    
    if (activeLineIndex >= 0) {
        lines[activeLineIndex].classList.add('active');
        
        // Scroll para a linha ativa
        if (activeLineIndex > 2) {
            const lyricsContainer = document.querySelector('.lyrics-container');
            const lineElement = lines[activeLineIndex];
            const lineTop = lineElement.offsetTop;
            lyricsContainer.scrollTop = lineTop - 100;
        }
    }
}

// Renderizar lista de músicas
function renderMusicList() {
    musicListElement.innerHTML = '';
    
    musicLibrary.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        if (index === currentSongIndex) {
            card.classList.add('active');
        }
        
        card.innerHTML = `
            <div class="album-art-small">
                <img src="${song.cover}" alt="Capa" class="album-art-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <i class="fas fa-music album-fallback-icon" style="display: none;"></i>
            </div>
            <h3>${song.title}</h3>
            <p>${song.artist} - ${song.album}</p>
            <p>${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}</p>
        `;
        
        card.addEventListener('click', () => {
            currentSongIndex = index;
            loadSong(currentSongIndex);
            if (isPlaying) {
                playSong();
            }
        });
        
        musicListElement.appendChild(card);
    });
}

// Atualizar música ativa na lista
function updateActiveSongInList() {
    const cards = document.querySelectorAll('.music-card');
    cards.forEach((card, index) => {
        if (index === currentSongIndex) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

// Funções de controle do player
function playSong() {
    isPlaying = true;
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
    audioPlayer.play();
}

function pauseSong() {
    isPlaying = false;
    playPauseIcon.classList.remove('fa-pause');
    playPauseIcon.classList.add('fa-play');
    audioPlayer.pause();
}

function togglePlayPause() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playNextSong() {
    if (isShuffle) {
        currentSongIndex = Math.floor(Math.random() * musicLibrary.length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % musicLibrary.length;
    }
    
    loadSong(currentSongIndex);
}

function playPrevSong() {
    if (audioPlayer.currentTime > 3) {
        // Se já passou 3 segundos, volta ao início da música atual
        audioPlayer.currentTime = 0;
        currentTime = 0;
        updateProgress();
    } else {
        // Senão, vai para a música anterior
        if (isShuffle) {
            currentSongIndex = Math.floor(Math.random() * musicLibrary.length);
        } else {
            currentSongIndex = (currentSongIndex - 1 + musicLibrary.length) % musicLibrary.length;
        }
        
        loadSong(currentSongIndex);
    }
}

// Atualizar barra de progresso
function updateProgress() {
    const song = musicLibrary[currentSongIndex];
    const progressPercent = (currentTime / song.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Atualizar tempo atual
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    currentTimeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}