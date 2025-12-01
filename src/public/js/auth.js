// Funções de autenticação
function initializeAuth() {
    // Navegação entre páginas
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page === 'home') {
                showPage('home-page');
            } else if (page === 'about') {
                showPage('about-page');
            }
        });
    });

    // Sistema de login
    loginBtn.addEventListener('click', () => {
        showPage('login-page');
    });

    registerBtn.addEventListener('click', () => {
        showPage('register-page');
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('register-page');
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPage('login-page');
    });

    // Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulação de login
        if (email && password) {
            currentUser = {
                name: email.split('@')[0],
                email: email,
                avatar: email[0].toUpperCase()
            };
            
            updateUserInterface();
            showPage('home-page');
            
            // Limpar formulário
            loginForm.reset();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    // Registro
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        
        // Validação simples
        if (password !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        
        if (name && email && password) {
            currentUser = {
                name: name,
                email: email,
                avatar: name[0].toUpperCase()
            };
            
            updateUserInterface();
            showPage('home-page');
            
            // Limpar formulário
            registerForm.reset();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        updateUserInterface();
        showPage('home-page');
    });
}

function updateUserInterface() {
    if (currentUser) {
        loggedOutDiv.style.display = 'none';
        loggedInDiv.style.display = 'flex';
        userNameElement.textContent = currentUser.name;
        userAvatarElement.textContent = currentUser.avatar;
    } else {
        loggedOutDiv.style.display = 'block';
        loggedInDiv.style.display = 'none';
    }
}

// Funções de navegação
function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    
    // Ativar o link de navegação correspondente
    if (pageId === 'home-page') {
        document.querySelector('[data-page="home"]').classList.add('active');
    } else if (pageId === 'about-page') {
        document.querySelector('[data-page="about"]').classList.add('active');
    }
}