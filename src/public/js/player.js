// Sistema do player de música
function initializePlayer() {
    audioPlayer = new Audio();
    
    // Configurar eventos do player
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', handleSongEnd);
    audioPlayer.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseIcon();
        startVinylAnimation();
    });
    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseIcon();
        stopVinylAnimation();
    });
    
    // Event listeners dos controles
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPreviousSong);
    nextBtn.addEventListener('click', playNextSong);
    
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        showNotification(isShuffle ? 'Embaralhar ativado' : 'Embaralhar desativado');
    });
    
    repeatBtn.addEventListener('click', () => {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
        showNotification(isRepeat ? 'Repetir ativado' : 'Repetir desativado');
    });
    
    // Barra de progresso
    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
        updateProgress();
    });
    
    // Auto-scroll
    autoScrollBtn.addEventListener('click', toggleAutoScroll);
    
    // Carregar primeira música
    loadSong(currentSongIndex);
    renderMusicGrid();
}

function loadSong(index) {
    if (index < 0 || index >= musicLibrary.length) return;
    
    currentSongIndex = index;
    const song = musicLibrary[index];
    
    // Atualizar informações da música
    currentSongTitle.textContent = song.title;
    currentSongArtist.textContent = song.artist;
    currentSongAlbum.textContent = song.album;
    
    // Atualizar capa do álbum
    currentAlbumArt.src = song.cover;
    currentAlbumArt.onerror = () => {
        currentAlbumArt.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%238B5CF6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="24">♪</text></svg>';
    };
    
    // Carregar áudio
    audioPlayer.src = song.file;
    
    // Carregar letras
    loadLyrics(song.lyrics);
    
    // Atualizar grid
    updateActiveCard();
    
    // Atualizar favorito
    updateFavoriteButton();
}

function loadLyrics(lyrics) {
    lyricsElement.innerHTML = '';
    
    lyrics.forEach((line, index) => {
        if (line.text.trim() === '') return;
        
        const lineElement = document.createElement('div');
        lineElement.className = 'lyrics-line';
        lineElement.textContent = line.text;
        lineElement.dataset.time = line.time;
        lineElement.dataset.index = index;
        lyricsElement.appendChild(lineElement);
    });
}

function updateProgress() {
    if (!audioPlayer.duration) return;
    
    const current = audioPlayer.currentTime;
    const duration = audioPlayer.duration;
    const percent = (current / duration) * 100;
    
    // Atualizar barra de progresso
    progress.style.width = `${percent}%`;
    
    // Atualizar tempo
    currentTimeElement.textContent = formatTime(current);
    songDurationElement.textContent = formatTime(duration);
    
    // Atualizar letras sincronizadas
    updateActiveLyric(current);
}

function updateDuration() {
    songDurationElement.textContent = formatTime(audioPlayer.duration);
}

function updateActiveLyric(currentTime) {
    const lines = document.querySelectorAll('.lyrics-line');
    let activeIndex = -1;
    
    // Encontrar linha ativa
    lines.forEach((line, index) => {
        const lineTime = parseInt(line.dataset.time);
        line.classList.remove('active');
        
        if (lineTime <= currentTime) {
            activeIndex = index;
        }
    });
    
    // Ativar linha
    if (activeIndex >= 0) {
        const activeLine = lines[activeIndex];
        activeLine.classList.add('active');
        
        // Auto-scroll
        if (autoScrollEnabled) {
            smoothScrollToLyric(activeLine, activeIndex);
        }
    }
}

function smoothScrollToLyric(lineElement, index) {
    const container = document.querySelector('.lyrics-container');
    const containerHeight = container.clientHeight;
    const lineTop = lineElement.offsetTop;
    const lineHeight = lineElement.offsetHeight;
    
    // Calcular posição ideal (linha no meio)
    const targetScroll = lineTop - (containerHeight / 2) + (lineHeight / 2);
    
    // Scroll suave
    container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
    });
}

function togglePlayPause() {
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
}

function playNextSong() {
    let nextIndex;
    
    if (isShuffle) {
        do {
            nextIndex = Math.floor(Math.random() * musicLibrary.length);
        } while (nextIndex === currentSongIndex && musicLibrary.length > 1);
    } else {
        nextIndex = (currentSongIndex + 1) % musicLibrary.length;
    }
    
    loadSong(nextIndex);
    if (isPlaying) audioPlayer.play();
}

function playPreviousSong() {
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
        return;
    }
    
    let prevIndex;
    
    if (isShuffle) {
        do {
            prevIndex = Math.floor(Math.random() * musicLibrary.length);
        } while (prevIndex === currentSongIndex && musicLibrary.length > 1);
    } else {
        prevIndex = (currentSongIndex - 1 + musicLibrary.length) % musicLibrary.length;
    }
    
    loadSong(prevIndex);
    if (isPlaying) audioPlayer.play();
}

function handleSongEnd() {
    if (isRepeat) {
        audioPlayer.currentTime = 0;
        audioPlayer.play();
    } else {
        playNextSong();
    }
}

function toggleAutoScroll() {
    autoScrollEnabled = !autoScrollEnabled;
    autoScrollBtn.classList.toggle('active', autoScrollEnabled);
    autoScrollBtn.innerHTML = autoScrollEnabled ? 
        '<i class="fas fa-arrow-up"></i><span>Auto ON</span>' :
        '<i class="fas fa-arrow-down"></i><span>Auto OFF</span>';
    
    showNotification(autoScrollEnabled ? 'Auto-scroll ativado' : 'Auto-scroll desativado');
}

function updatePlayPauseIcon() {
    playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

function startVinylAnimation() {
    document.querySelector('.album-art-large').classList.add('playing');
}

function stopVinylAnimation() {
    document.querySelector('.album-art-large').classList.remove('playing');
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function renderMusicGrid() {
    musicGrid.innerHTML = '';
    
    musicLibrary.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = `music-card ${index === currentSongIndex ? 'active' : ''}`;
        card.dataset.index = index;
        
        card.innerHTML = `
            <button class="card-favorite ${song.favorite ? 'active' : ''}" data-id="${song.id}">
                <i class="fas fa-heart"></i>
            </button>
            <div class="card-cover">
                <img src="${song.cover}" alt="${song.album}">
                <button class="card-play-btn">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="card-content">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
                <div class="card-duration">
                    <i class="fas fa-clock"></i>
                    <span>${formatTime(song.duration)}</span>
                </div>
            </div>
        `;
        
        // Event listeners
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.card-favorite') && !e.target.closest('.card-play-btn')) {
                loadSong(index);
                if (isPlaying) audioPlayer.play();
            }
        });
        
        const playBtn = card.querySelector('.card-play-btn');
        playBtn.addEventListener('click', () => {
            loadSong(index);
            audioPlayer.play();
        });
        
        const favoriteBtn = card.querySelector('.card-favorite');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
        });
        
        musicGrid.appendChild(card);
    });
}

function updateActiveCard() {
    document.querySelectorAll('.music-card').forEach((card, index) => {
        card.classList.toggle('active', index === currentSongIndex);
    });
}

function updateFavoriteButton() {
    const song = musicLibrary[currentSongIndex];
    const favoriteBtn = document.querySelector(`.card-favorite[data-id="${song.id}"]`);
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active', song.favorite);
    }
}

function toggleFavorite(songId) {
    const song = musicLibrary.find(s => s.id === songId);
    if (!song) return;
    
    song.favorite = !song.favorite;
    
    // Atualizar localStorage
    if (song.favorite) {
        if (!favorites.includes(songId)) {
            favorites.push(songId);
        }
    } else {
        favorites = favorites.filter(id => id !== songId);
    }
    
    localStorage.setItem('harmony_favorites', JSON.stringify(favorites));
    
    // Atualizar UI
    updateFavoriteButton();
    showNotification(song.favorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    
    // Atualizar página de favoritos se estiver visível
    if (document.getElementById('favorites-page').classList.contains('active')) {
        renderFavorites();
    }
}

function renderMusicLibrary() {
    renderMusicGrid();
}

function renderFavorites() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('favorites-empty');
    
    const favoriteSongs = musicLibrary.filter(song => song.favorite);
    
    if (favoriteSongs.length === 0) {
        favoritesGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    favoritesGrid.style.display = 'grid';
    favoritesGrid.innerHTML = '';
    
    favoriteSongs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        
        card.innerHTML = `
            <button class="card-favorite active" data-id="${song.id}">
                <i class="fas fa-heart"></i>
            </button>
            <div class="card-cover">
                <img src="${song.cover}" alt="${song.album}">
                <button class="card-play-btn">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <div class="card-content">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
                <div class="card-duration">
                    <i class="fas fa-clock"></i>
                    <span>${formatTime(song.duration)}</span>
                </div>
            </div>
        `;
        
        // Event listeners
        card.addEventListener('click', () => {
            const songIndex = musicLibrary.findIndex(s => s.id === song.id);
            loadSong(songIndex);
            if (isPlaying) audioPlayer.play();
            showPage('home');
        });
        
        const favoriteBtn = card.querySelector('.card-favorite');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
        });
        
        favoritesGrid.appendChild(card);
    });
}