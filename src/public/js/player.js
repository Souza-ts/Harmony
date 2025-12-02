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
    
    // Criar indicador de scroll
    createScrollIndicator();
    
    // Atualizar grid
    updateActiveCard();
    
    // Atualizar favorito
    updateFavoriteButton();
}

function loadLyrics(lyrics) {
    const container = document.getElementById('lyrics');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!lyrics || lyrics.length === 0) {
        container.innerHTML = `
            <div class="lyrics-placeholder">
                <i class="fas fa-music"></i>
                <p>Nenhuma letra disponível para esta música</p>
            </div>
        `;
        return;
    }
    
    // Filtrar linhas vazias
    const filteredLyrics = lyrics.filter(line => line.text && line.text.trim() !== '');
    
    if (filteredLyrics.length === 0) {
        container.innerHTML = `
            <div class="lyrics-placeholder">
                <i class="fas fa-music"></i>
                <p>Nenhuma letra disponível para esta música</p>
            </div>
        `;
        return;
    }
    
    filteredLyrics.forEach((line, index) => {
        const lineElement = document.createElement('div');
        lineElement.className = 'lyrics-line';
        lineElement.textContent = line.text;
        lineElement.dataset.time = line.time;
        lineElement.dataset.index = index;
        
        // Click para ir para o tempo da música
        lineElement.addEventListener('click', () => {
            if (audioPlayer) {
                audioPlayer.currentTime = line.time;
                audioPlayer.play();
            }
        });
        
        container.appendChild(lineElement);
    });
    
    // Resetar última linha ativa
    lastActiveLineIndex = -1;
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
    const container = document.querySelector('.lyrics-container');
    
    let activeIndex = -1;

    lines.forEach((line, index) => {
        const lineTime = parseFloat(line.dataset.time); // CORRETO
        
        // Pega a última linha cujo tempo já passou
        if (currentTime >= lineTime) {
            activeIndex = index;
        }
    });

    if (activeIndex !== -1) {
        const activeLine = lines[activeIndex];

        if (activeIndex !== lastActiveLineIndex) {
            // Atualiza visualmente
            lines.forEach(l => l.classList.remove('active'));
            activeLine.classList.add('active');

            // Scroll
            if (autoScrollEnabled && container) {
                smoothScrollToLyric(activeLine, activeIndex);
            }

            lastActiveLineIndex = activeIndex;
        }
    }
}
<<<<<<< HEAD
}

=======
>>>>>>> 8678338 (kauzx00 helped me fix the letters.)
function smoothScrollToLyric(lineElement, index) {
    const container = document.querySelector('.lyrics-container');
    if (!container || !lineElement) return;
    
    const containerHeight = container.clientHeight;
    const lineTop = lineElement.offsetTop;
    const lineHeight = lineElement.offsetHeight;
    const containerScroll = container.scrollTop;
    
    // Verificar se a linha está visível
    const lineBottom = lineTop + lineHeight;
    const viewportTop = containerScroll;
    const viewportBottom = containerScroll + containerHeight;
    
    // Se a linha não está visível ou está muito no topo/baixo
    if (lineTop < viewportTop || lineBottom > viewportBottom - lineHeight * 2) {
        // Calcular posição ideal (linha no meio da viewport)
        const targetScroll = lineTop - (containerHeight / 2) + (lineHeight / 2);
        
        // Limitar scroll
        const maxScroll = container.scrollHeight - containerHeight;
        const finalScroll = Math.max(0, Math.min(targetScroll, maxScroll));
        
        // Scroll suave com easing
        container.scrollTo({
            top: finalScroll,
            behavior: 'smooth'
        });
    }
}

function createScrollIndicator() {
    const lyricsSection = document.querySelector('.lyrics-section');
    if (!lyricsSection) return;
    
    // Remover indicador existente
    const existingIndicator = lyricsSection.querySelector('.scroll-indicator');
    if (existingIndicator) existingIndicator.remove();
    
    scrollIndicator = document.createElement('div');
    scrollIndicator.className = `scroll-indicator ${autoScrollEnabled ? 'active' : ''}`;
    scrollIndicator.innerHTML = `
        <i class="fas fa-${autoScrollEnabled ? 'arrow-up' : 'arrow-down'}"></i>
        <span>${autoScrollEnabled ? 'Auto ON' : 'Auto OFF'}</span>
    `;
    
    scrollIndicator.addEventListener('click', toggleAutoScroll);
    lyricsSection.appendChild(scrollIndicator);
}

function toggleAutoScroll() {
    autoScrollEnabled = !autoScrollEnabled;
    
    if (scrollIndicator) {
        scrollIndicator.classList.toggle('active', autoScrollEnabled);
        scrollIndicator.innerHTML = `
            <i class="fas fa-${autoScrollEnabled ? 'arrow-up' : 'arrow-down'}"></i>
            <span>${autoScrollEnabled ? 'Auto ON' : 'Auto OFF'}</span>
        `;
    }
    
    showNotification(
        autoScrollEnabled ? 
        'Auto-scroll ativado: as letras seguirão a música automaticamente' :
        'Auto-scroll desativado: use o scroll manual para navegar pelas letras'
    );
    
    // Salvar preferência
    localStorage.setItem('harmony_autoscroll', autoScrollEnabled);
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

// Função de teste para debug
function testAutoScroll() {
    console.log('=== TESTE AUTO-SCROLL ===');
    console.log('Auto-scroll habilitado:', autoScrollEnabled);
    console.log('Total de linhas de letra:', document.querySelectorAll('.lyrics-line').length);
    console.log('Última linha ativa:', lastActiveLineIndex);
    
    // Testar scroll manual
    const container = document.querySelector('.lyrics-container');
    if (container) {
        console.log('Container height:', container.clientHeight);
        console.log('Scroll height:', container.scrollHeight);
        console.log('Scroll top:', container.scrollTop);
    }
}

// Expor para debugging no console
window.testAutoScroll = testAutoScroll;
