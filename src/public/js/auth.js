// Sistema de autenticação
function initializeAuth() {
    // Elementos
    authModal = document.getElementById('auth-modal');
    const closeModal = document.getElementById('close-modal');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const exploreBtn = document.getElementById('explore-btn');
    
    // Botões de login/registro
    loginBtn.addEventListener('click', () => showAuthModal('login'));
    registerBtn.addEventListener('click', () => showAuthModal('register'));
    
    // Fechar modal
    closeModal.addEventListener('click', hideAuthModal);
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) hideAuthModal();
    });
    
    // Trocar entre tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchAuthTab(tabName);
        });
    });
    
    // Submit forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    
    // Botão explorar
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            showPage('library');
        });
    }
    
    // Navegação
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    });
    
    // Busca
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    // Carregar usuário salvo
    loadSavedUser();
}

function showAuthModal(tab = 'login') {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAuthTab(tab);
}

function hideAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
}

function switchAuthTab(tabName) {
    // Atualizar tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Mostrar form correspondente
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.toggle('active', form.id.includes(tabName));
    });
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Preencha todos os campos');
        return;
    }
    
    // Simular login
    currentUser = {
        name: email.split('@')[0],
        email: email,
        avatar: email[0].toUpperCase()
    };
    
    // Salvar usuário
    localStorage.setItem('harmony_user', JSON.stringify(currentUser));
    
    // Atualizar UI
    updateUserUI();
    hideAuthModal();
    showNotification(`Bem-vindo, ${currentUser.name}!`);
    
    // Limpar form
    e.target.reset();
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    if (!name || !email || !password || !confirm) {
        showNotification('Preencha todos os campos');
        return;
    }
    
    if (password !== confirm) {
        showNotification('As senhas não coincidem');
        return;
    }
    
    if (password.length < 6) {
        showNotification('A senha deve ter no mínimo 6 caracteres');
        return;
    }
    
    // Simular registro
    currentUser = {
        name: name,
        email: email,
        avatar: name[0].toUpperCase()
    };
    
    // Salvar usuário
    localStorage.setItem('harmony_user', JSON.stringify(currentUser));
    
    // Atualizar UI
    updateUserUI();
    hideAuthModal();
    showNotification(`Conta criada com sucesso, ${currentUser.name}!`);
    
    // Limpar form
    e.target.reset();
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('harmony_user');
    updateUserUI();
    showNotification('Até logo!');
}

function loadSavedUser() {
    const savedUser = localStorage.getItem('harmony_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
    }
}

function updateUserUI() {
    if (currentUser) {
        // Atualizar sidebar
        usernameElement.textContent = currentUser.name;
        document.querySelector('.btn-login').textContent = 'Sair';
        document.querySelector('.btn-login').onclick = handleLogout;
        
        // Atualizar header
        userActions.innerHTML = `
            <div class="user-menu">
                <span>Olá, ${currentUser.name}</span>
                <button class="btn btn-outline" id="logout-header">Sair</button>
            </div>
        `;
        
        document.getElementById('logout-header').addEventListener('click', handleLogout);
    } else {
        // Usuário convidado
        usernameElement.textContent = 'Convidado';
        document.querySelector('.btn-login').textContent = 'Entrar';
        document.querySelector('.btn-login').onclick = () => showAuthModal('login');
        
        userActions.innerHTML = `
            <button class="btn btn-primary" id="register-btn">Criar conta</button>
        `;
        
        document.getElementById('register-btn').addEventListener('click', () => showAuthModal('register'));
    }
}

function showPage(pageName) {
    // Esconder todas as páginas
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Mostrar página selecionada
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
        pageTitle.textContent = getPageTitle(pageName);
        
        // Carregar conteúdo específico da página
        switch(pageName) {
            case 'library':
                renderMusicLibrary();
                break;
            case 'favorites':
                renderFavorites();
                break;
        }
    }
}

function getPageTitle(pageName) {
    const titles = {
        'home': 'Início',
        'discover': 'Descobrir',
        'library': 'Biblioteca',
        'favorites': 'Favoritas',
        'about': 'Sobre'
    };
    return titles[pageName] || 'Harmony';
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.music-card');
    
    cards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const artist = card.querySelector('p').textContent.toLowerCase();
        const matches = title.includes(query) || artist.includes(query);
        card.style.display = matches ? 'block' : 'none';
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}