// Biblioteca de Músicas Harmony
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.btn-filter');
    const sortSelect = document.getElementById('sortSelect');
    const selectAllCheckbox = document.getElementById('selectAll');
    const songsTableBody = document.getElementById('songsTableBody');
    const playlistsGrid = document.getElementById('playlistsGrid');
    const createPlaylistBtn = document.querySelector('.btn-create-playlist');
    const playSelectedBtn = document.getElementById('playSelected');
    const addToPlaylistBtn = document.getElementById('addToPlaylist');
    const downloadSelectedBtn = document.getElementById('downloadSelected');
    
    // Elementos de estatísticas
    const totalSongsEl = document.getElementById('totalSongs');
    const totalTimeEl = document.getElementById('totalTime');
    const favoriteSongsEl = document.getElementById('favoriteSongs');
    const totalPlaylistsEl = document.getElementById('totalPlaylists');
    
    // Modal elementos
    const createPlaylistModal = document.getElementById('createPlaylistModal');
    const modalCloseBtn = createPlaylistModal?.querySelector('.modal-close');
    const cancelPlaylistBtn = document.getElementById('cancelPlaylist');
    const savePlaylistBtn = document.getElementById('savePlaylist');
    
    // Dados da biblioteca (simulados)
    let libraryData = {
        songs: [
            {
                id: 1,
                title: "deja vu",
                artist: "Olivia Rodrigo",
                album: "Sour",
                duration: "3:51",
                cover: "src/assets/cover/Sour.jpg",
                added: "06/04/2021",
                favorite: true,
                file: "src/assets/music/deja vu.mp3"
            },
            {
                id: 2,
                title: "Happier Than Ever",
                artist: "Billie Eilish",
                album: "Happier Than Ever",
                duration: "4:58",
                cover: "src/assets/cover/Happier Than Ever.jpg",
                added: "30/07/2021",
                favorite: true,
                file: "src/assets/music/Happier Than Ever.mp3"
            },
            {
                id: 3,
                title: "yes, and?",
                artist: "Ariana Grande",
                album: "Eternal Sunshine",
                duration: "3:36",
                cover: "src/assets/cover/Eternal Sunshine.jpg",
                added: "12/01/2024",
                favorite: false,
                file: "src/assets/music/yes and.mp3"
            },
            {
                id: 4,
                title: "I Love You, I'm Sorry",
                artist: "Gracie Abrams",
                album: "The Secrets of Us",
                duration: "3:36",
                cover: "src/assets/cover/The Secret of Us.jpg",
                added: "11/10/2024",
                favorite: false,
                file: "src/assets/music/i love you.mp3"
            },
            {
                id: 5,
                title: "Juno",
                artist: "Sabrina Carpenter",
                album: "Short N' Sweet",
                duration: "3:43",
                cover: "src/assets/cover/Short N Sweet.jpg",
                added: "23/08/2024",
                favorite: true,
                file: "src/assets/music/Juno.mp3"
            },
            {
                id: 6,
                title: "Everything is romantic featuring caroline polachek",
                artist: "Charli xcx, Caroline Polachek",
                album: "Brat and It's Completely Different but Also Still Brat",
                duration: "3:24",
                cover: "src/assets/cover/Brat.jpg",
                added: "1/10/2024",
                favorite: false,
                file: "src/assets/music/Everything is romantic.mp3"
            }
        ],
        playlists: [
            {
                id: 1,
                name: "Favoritas",
                description: "Minhas músicas favoritas",
                songCount: 3,
                coverColor: "primary",
                isPublic: false
            },
            {
                id: 2,
                name: "Para Relaxar",
                description: "Músicas calmas para relaxar",
                songCount: 2,
                coverColor: "secondary",
                isPublic: true
            },
            {
                id: 3,
                name: "Energia Total",
                description: "Para malhar e se energizar",
                songCount: 1,
                coverColor: "success",
                isPublic: false
            }
        ]
    };
    
    // Estado da aplicação
    let currentFilter = 'all';
    let currentSort = 'title';
    let selectedSongs = new Set();
    
    // Inicialização
    function init() {
        renderSongs();
        renderPlaylists();
        updateStats();
        setupEventListeners();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Busca
        if (searchInput) {
            searchInput.addEventListener('input', debounce(handleSearch, 300));
        }
        
        // Filtros
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                setActiveFilter(filter);
            });
        });
        
        // Ordenação
        if (sortSelect) {
            sortSelect.addEventListener('change', function() {
                currentSort = this.value;
                renderSongs();
            });
        }
        
        // Selecionar todas as músicas
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.song-checkbox-input');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                    const songId = parseInt(checkbox.dataset.songId);
                    if (this.checked) {
                        selectedSongs.add(songId);
                    } else {
                        selectedSongs.delete(songId);
                    }
                });
                updateSelectionCount();
            });
        }
        
        // Botões de ação
        if (playSelectedBtn) {
            playSelectedBtn.addEventListener('click', playSelectedSongs);
        }
        
        if (addToPlaylistBtn) {
            addToPlaylistBtn.addEventListener('click', showAddToPlaylistModal);
        }
        
        if (downloadSelectedBtn) {
            downloadSelectedBtn.addEventListener('click', downloadSelectedSongs);
        }
        
        // Criar playlist
        if (createPlaylistBtn) {
            createPlaylistBtn.addEventListener('click', showCreatePlaylistModal);
        }
        
        // Modal de criação de playlist
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeCreatePlaylistModal);
        }
        
        if (cancelPlaylistBtn) {
            cancelPlaylistBtn.addEventListener('click', closeCreatePlaylistModal);
        }
        
        if (savePlaylistBtn) {
            savePlaylistBtn.addEventListener('click', saveNewPlaylist);
        }
        
        // Fechar modal ao clicar fora
        if (createPlaylistModal) {
            createPlaylistModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeCreatePlaylistModal();
                }
            });
        }
    }
    
    // Renderizar lista de músicas
    function renderSongs() {
        if (!songsTableBody) return;
        
        // Filtrar e ordenar músicas
        let filteredSongs = filterSongs(libraryData.songs, currentFilter);
        filteredSongs = sortSongs(filteredSongs, currentSort);
        
        // Limpar tabela
        songsTableBody.innerHTML = '';
        
        // Adicionar músicas à tabela
        filteredSongs.forEach(song => {
            const row = document.createElement('tr');
            
            // Calcular data formatada
            const addedDate = new Date(song.added);
            const formattedDate = addedDate.toLocaleDateString('pt-BR');
            
            row.innerHTML = `
                <td>
                    <div class="song-checkbox">
                        <input type="checkbox" class="song-checkbox-input" data-song-id="${song.id}" ${selectedSongs.has(song.id) ? 'checked' : ''}>
                    </div>
                </td>
                <td>
                    <div class="song-title-cell">
                        <img src="${song.cover}" alt="${song.title}" class="song-cover">
                        <div>
                            <div class="song-title">${song.title}</div>
                            ${song.favorite ? '<span class="song-favorite-badge"><i class="fas fa-heart"></i></span>' : ''}
                        </div>
                    </div>
                </td>
                <td>${song.artist}</td>
                <td>${song.album}</td>
                <td>${song.duration}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="song-actions">
                        <button class="btn-song-action btn-play" data-song-id="${song.id}" title="Reproduzir">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn-song-action btn-favorite ${song.favorite ? 'active' : ''}" data-song-id="${song.id}" title="${song.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn-song-action btn-more" data-song-id="${song.id}" title="Mais opções">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </td>
            `;
            
            songsTableBody.appendChild(row);
        });
        
        // Adicionar event listeners às ações das músicas
        addSongEventListeners();
    }
    
    // Renderizar playlists
    function renderPlaylists() {
        if (!playlistsGrid) return;
        
        playlistsGrid.innerHTML = '';
        
        libraryData.playlists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.dataset.playlistId = playlist.id;
            
            // Gerar cor de fundo baseada no coverColor
            let bgColor;
            switch(playlist.coverColor) {
                case 'primary': bgColor = 'var(--primary-color)'; break;
                case 'secondary': bgColor = 'var(--secondary-color)'; break;
                case 'success': bgColor = 'var(--success-color)'; break;
                default: bgColor = 'var(--primary-color)';
            }
            
            card.innerHTML = `
                <div class="playlist-cover" style="background: ${bgColor};">
                    <i class="fas fa-list-music"></i>
                </div>
                <div class="playlist-info">
                    <h3>${playlist.name}</h3>
                    <p>${playlist.description}</p>
                    <div class="playlist-stats">
                        <span>${playlist.songCount} músicas</span>
                        <span>${playlist.isPublic ? 'Pública' : 'Privada'}</span>
                    </div>
                </div>
            `;
            
            playlistsGrid.appendChild(card);
        });
        
        // Atualizar contador de playlists
        totalPlaylistsEl.textContent = libraryData.playlists.length;
    }
    
    // Adicionar event listeners às ações das músicas
    function addSongEventListeners() {
        // Play button
        document.querySelectorAll('.btn-play').forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = parseInt(this.dataset.songId);
                playSong(songId);
            });
        });
        
        // Favorite button
        document.querySelectorAll('.btn-favorite').forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = parseInt(this.dataset.songId);
                toggleFavorite(songId, this);
            });
        });
        
        // Checkbox selection
        document.querySelectorAll('.song-checkbox-input').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const songId = parseInt(this.dataset.songId);
                if (this.checked) {
                    selectedSongs.add(songId);
                } else {
                    selectedSongs.delete(songId);
                    selectAllCheckbox.checked = false;
                }
                updateSelectionCount();
            });
        });
    }
    
    // Filtrar músicas
    function filterSongs(songs, filter) {
        switch(filter) {
            case 'favorites':
                return songs.filter(song => song.favorite);
            case 'recent':
                // Ordenar por data de adição (mais recentes primeiro)
                return [...songs].sort((a, b) => new Date(b.added) - new Date(a.added));
            case 'playlists':
                // Em um sistema real, filtraria músicas que estão em playlists
                return songs.filter(song => song.id <= 3); // Simulação
            default:
                return songs;
        }
    }
    
    // Ordenar músicas
    function sortSongs(songs, sortBy) {
        const sortedSongs = [...songs];
        
        switch(sortBy) {
            case 'title':
                return sortedSongs.sort((a, b) => a.title.localeCompare(b.title));
            case 'artist':
                return sortedSongs.sort((a, b) => a.artist.localeCompare(b.artist));
            case 'album':
                return sortedSongs.sort((a, b) => a.album.localeCompare(b.album));
            case 'date':
                return sortedSongs.sort((a, b) => new Date(b.added) - new Date(a.added));
            case 'duration':
                return sortedSongs.sort((a, b) => {
                    const timeA = parseTime(a.duration);
                    const timeB = parseTime(b.duration);
                    return timeA - timeB;
                });
            default:
                return sortedSongs;
        }
    }
    
    // Converter tempo no formato MM:SS para segundos
    function parseTime(timeStr) {
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return minutes * 60 + seconds;
    }
    
    // Definir filtro ativo
    function setActiveFilter(filter) {
        currentFilter = filter;
        
        // Atualizar UI dos botões de filtro
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Renderizar músicas com o novo filtro
        renderSongs();
    }
    
    // Atualizar contagem de seleção
    function updateSelectionCount() {
        const selectedCount = selectedSongs.size;
        
        // Atualizar texto dos botões de ação
        if (playSelectedBtn) {
            playSelectedBtn.innerHTML = `<i class="fas fa-play"></i> Reproduzir ${selectedCount > 0 ? `(${selectedCount})` : ''}`;
            playSelectedBtn.disabled = selectedCount === 0;
        }
        
        if (addToPlaylistBtn) {
            addToPlaylistBtn.disabled = selectedCount === 0;
        }
        
        if (downloadSelectedBtn) {
            downloadSelectedBtn.disabled = selectedCount === 0;
        }
    }
    
    // Atualizar estatísticas
    function updateStats() {
        if (!totalSongsEl) return;
        
        totalSongsEl.textContent = libraryData.songs.length;
        
        // Calcular tempo total
        let totalSeconds = 0;
        libraryData.songs.forEach(song => {
            totalSeconds += parseTime(song.duration);
        });
        
        const totalHours = Math.floor(totalSeconds / 3600);
        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
        totalTimeEl.textContent = `${totalHours}h ${totalMinutes}m`;
        
        // Contar favoritas
        const favoriteCount = libraryData.songs.filter(song => song.favorite).length;
        favoriteSongsEl.textContent = favoriteCount;
    }
    
    // Manipular busca
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        
        if (searchTerm.length === 0) {
            renderSongs();
            return;
        }
        
        const filteredSongs = libraryData.songs.filter(song => 
            song.title.toLowerCase().includes(searchTerm) ||
            song.artist.toLowerCase().includes(searchTerm) ||
            song.album.toLowerCase().includes(searchTerm)
        );
        
        // Atualizar tabela com resultados da busca
        renderFilteredSongs(filteredSongs);
    }
    
    // Renderizar músicas filtradas
    function renderFilteredSongs(songs) {
        if (!songsTableBody) return;
        
        songsTableBody.innerHTML = '';
        
        songs.forEach(song => {
            const row = document.createElement('tr');
            
            const addedDate = new Date(song.added);
            const formattedDate = addedDate.toLocaleDateString('pt-BR');
            
            row.innerHTML = `
                <td>
                    <div class="song-checkbox">
                        <input type="checkbox" class="song-checkbox-input" data-song-id="${song.id}">
                    </div>
                </td>
                <td>
                    <div class="song-title-cell">
                        <img src="${song.cover}" alt="${song.title}" class="song-cover">
                        <div>
                            <div class="song-title">${song.title}</div>
                            ${song.favorite ? '<span class="song-favorite-badge"><i class="fas fa-heart"></i></span>' : ''}
                        </div>
                    </div>
                </td>
                <td>${song.artist}</td>
                <td>${song.album}</td>
                <td>${song.duration}</td>
                <td>${formattedDate}</td>
                <td>
                    <div class="song-actions">
                        <button class="btn-song-action btn-play" data-song-id="${song.id}">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn-song-action btn-favorite ${song.favorite ? 'active' : ''}" data-song-id="${song.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn-song-action btn-more" data-song-id="${song.id}">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                    </div>
                </td>
            `;
            
            songsTableBody.appendChild(row);
        });
        
        addSongEventListeners();
    }
    
    // Tocar música
    function playSong(songId) {
        const song = libraryData.songs.find(s => s.id === songId);
        if (!song) return;
        
        // Em um sistema real, redirecionaria para o player com a música selecionada
        // Para demonstração, apenas mostra uma mensagem
        showNotification(`Reproduzindo: ${song.title} - ${song.artist}`, 'info');
        
        // Simular redirecionamento para o player
        // window.location.href = `player.html?song=${songId}`;
    }
    
    // Tocar músicas selecionadas
    function playSelectedSongs() {
        if (selectedSongs.size === 0) return;
        
        // Em um sistema real, criaria uma playlist temporária com as músicas selecionadas
        const songCount = selectedSongs.size;
        showNotification(`Reproduzindo ${songCount} música(s) selecionada(s)`, 'info');
        
        // Redirecionar para o player
        // window.location.href = 'player.html';
    }
    
    // Alternar favorito
    function toggleFavorite(songId, button) {
        const songIndex = libraryData.songs.findIndex(s => s.id === songId);
        if (songIndex === -1) return;
        
        libraryData.songs[songIndex].favorite = !libraryData.songs[songIndex].favorite;
        
        // Atualizar UI
        button.classList.toggle('active');
        button.title = libraryData.songs[songIndex].favorite ? 
            'Remover dos favoritos' : 'Adicionar aos favoritos';
        
        // Atualizar estatísticas
        updateStats();
        
        // Mostrar notificação
        const song = libraryData.songs[songIndex];
        const message = song.favorite ? 
            `"${song.title}" adicionada aos favoritos` : 
            `"${song.title}" removida dos favoritos`;
        
        showNotification(message, 'success');
        
        // Atualizar localStorage (em um sistema real)
        saveLibraryData();
    }
    
    // Mostrar modal de criação de playlist
    function showCreatePlaylistModal() {
        if (!createPlaylistModal) return;
        
        createPlaylistModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Fechar modal de criação de playlist
    function closeCreatePlaylistModal() {
        if (!createPlaylistModal) return;
        
        createPlaylistModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Limpar formulário
        const form = document.getElementById('createPlaylistForm');
        if (form) form.reset();
    }
    
    // Mostrar modal para adicionar à playlist
    function showAddToPlaylistModal() {
        if (selectedSongs.size === 0) {
            showNotification('Selecione pelo menos uma música para adicionar à playlist', 'warning');
            return;
        }
        
        showCreatePlaylistModal();
        
        // Pre-selecionar a opção de adicionar músicas atuais
        const addCurrentSongsCheckbox = document.getElementById('addCurrentSongs');
        if (addCurrentSongsCheckbox) {
            addCurrentSongsCheckbox.checked = true;
        }
    }
    
    // Salvar nova playlist
    function saveNewPlaylist() {
        const playlistNameInput = document.getElementById('playlistName');
        const playlistDescriptionInput = document.getElementById('playlistDescription');
        const playlistVisibilitySelect = document.getElementById('playlistVisibility');
        const addCurrentSongsCheckbox = document.getElementById('addCurrentSongs');
        
        if (!playlistNameInput || !playlistNameInput.value.trim()) {
            showNotification('Por favor, digite um nome para a playlist', 'error');
            return;
        }
        
        // Criar nova playlist
        const newPlaylist = {
            id: libraryData.playlists.length + 1,
            name: playlistNameInput.value.trim(),
            description: playlistDescriptionInput ? playlistDescriptionInput.value.trim() : '',
            songCount: addCurrentSongsCheckbox && addCurrentSongsCheckbox.checked ? selectedSongs.size : 0,
            coverColor: ['primary', 'secondary', 'success'][Math.floor(Math.random() * 3)],
            isPublic: playlistVisibilitySelect ? playlistVisibilitySelect.value === 'public' : false
        };
        
        // Adicionar à lista de playlists
        libraryData.playlists.push(newPlaylist);
        
        // Atualizar UI
        renderPlaylists();
        
        // Fechar modal
        closeCreatePlaylistModal();
        
        // Mostrar notificação
        showNotification(`Playlist "${newPlaylist.name}" criada com sucesso!`, 'success');
        
        // Salvar dados (em um sistema real)
        saveLibraryData();
    }
    
    // Baixar músicas selecionadas
    function downloadSelectedSongs() {
        if (selectedSongs.size === 0) return;
        
        // Em um sistema real, iniciaria o download das músicas
        // Para demonstração, apenas mostra uma mensagem
        showNotification(`Iniciando download de ${selectedSongs.size} música(s) selecionada(s)`, 'info');
    }
    
    // Salvar dados da biblioteca (simulado)
    function saveLibraryData() {
        // Em um sistema real, faria uma requisição para salvar no servidor
        // Para demonstração, salva no localStorage
        try {
            localStorage.setItem('harmony_library', JSON.stringify(libraryData));
        } catch (e) {
            console.error('Erro ao salvar dados da biblioteca:', e);
        }
    }
    
    // Carregar dados da biblioteca (simulado)
    function loadLibraryData() {
        // Em um sistema real, carregaria do servidor
        // Para demonstração, tenta carregar do localStorage
        try {
            const savedData = localStorage.getItem('harmony_library');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Mesclar com dados padrão
                libraryData = { ...libraryData, ...parsedData };
            }
        } catch (e) {
            console.error('Erro ao carregar dados da biblioteca:', e);
        }
    }
    
    // Função debounce para otimizar busca
    function debounce(func, wait) {
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
    
    // Mostrar notificação
    function showNotification(message, type = 'info') {
        // Remover notificações anteriores
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Ícone baseado no tipo
        let icon;
        switch(type) {
            case 'success':
                icon = 'fas fa-check-circle';
                break;
            case 'error':
                icon = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                icon = 'fas fa-exclamation-triangle';
                break;
            default:
                icon = 'fas fa-info-circle';
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(notification);
        
        // Mostrar notificação com animação
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Fechar notificação após 5 segundos
        const autoClose = setTimeout(() => {
            closeNotification(notification);
        }, 5000);
        
        // Fechar ao clicar no botão
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoClose);
            closeNotification(notification);
        });
    }
    
    // Fechar notificação
    function closeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Inicializar a biblioteca
    loadLibraryData();
    init();
});