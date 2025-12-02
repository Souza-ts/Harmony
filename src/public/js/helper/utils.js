// Utilitários gerais para o projeto Harmony
document.addEventListener('DOMContentLoaded', function() {
    // Menu hamburguer para responsividade
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Alternar ícone do hamburguer
            const spans = hamburger.querySelectorAll('span');
            if (hamburger.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
                
                // Restaurar ícone do hamburguer
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
    
    // Verificar estado de login
    checkLoginStatus();
    
    // Configurações de tema
    initializeTheme();
    
    // Navegação entre seções na página de conta
    initializeAccountNavigation();
});

// Verificar status de login
function checkLoginStatus() {
    const userData = localStorage.getItem('harmony_user');
    const accountLinks = document.querySelectorAll('a[href="account.html"]');
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const signupLinks = document.querySelectorAll('a[href="signup.html"]');
    
    if (userData) {
        const user = JSON.parse(userData);
        
        // Atualizar links de conta se o usuário estiver logado
        accountLinks.forEach(link => {
            if (link.querySelector('.fa-user')) {
                link.innerHTML = `<i class="fas fa-user"></i> ${user.name || 'Minha Conta'}`;
            }
        });
        
        // Esconder links de login/cadastro em algumas páginas
        if (window.location.pathname.includes('account.html') || 
            window.location.pathname.includes('library.html') ||
            window.location.pathname.includes('player.html')) {
            
            loginLinks.forEach(link => link.style.display = 'none');
            signupLinks.forEach(link => link.style.display = 'none');
        }
    } else {
        // Se não estiver logado, redirecionar da página de conta
        if (window.location.pathname.includes('account.html')) {
            window.location.href = 'login.html';
        }
    }
}

// Inicializar configurações de tema
function initializeTheme() {
    // Verificar preferência salva
    const savedTheme = localStorage.getItem('harmony_theme') || 'light';
    
    // Aplicar tema
    applyTheme(savedTheme);
    
    // Configurar botões de tema se existirem
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('active');
        }
        
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('harmony_theme', theme);
            
            // Atualizar UI
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Aplicar tema
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'auto') {
        // Verificar preferência do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Inicializar navegação na página de conta
function initializeAccountNavigation() {
    if (!window.location.pathname.includes('account.html')) return;
    
    const navLinks = document.querySelectorAll('.account-nav a');
    const sections = document.querySelectorAll('.account-section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            
            // Atualizar links ativos
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar seção correspondente
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Verificar hash na URL
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.account-nav a[href="#${targetId}"]`);
        const targetSection = document.getElementById(targetId);
        
        if (targetLink && targetSection) {
            navLinks.forEach(l => l.classList.remove('active'));
            targetLink.classList.add('active');
            
            sections.forEach(section => section.classList.remove('active'));
            targetSection.classList.add('active');
        }
    }
}

// Formatar tempo (segundos para MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Formatar tamanho de arquivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Verificar conexão com a internet
function checkOnlineStatus() {
    if (!navigator.onLine) {
        showNotification('Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
    }
    
    window.addEventListener('online', () => {
        showNotification('Conexão restaurada.', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('Você está offline.', 'warning');
    });
}

// Inicializar verificação de conexão
checkOnlineStatus();

// Função para mostrar notificações (reutilizável)
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

// Adicionar CSS para notificações se não existir
if (!document.querySelector('#notification-styles')) {
    const notificationStyles = document.createElement('style');
    notificationStyles.id = 'notification-styles';
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            z-index: 10000;
            transform: translateX(150%);
            transition: transform 0.3s ease;
            max-width: 400px;
            border-left: 4px solid var(--primary-color);
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-success {
            border-left-color: var(--success-color);
        }
        
        .notification-error {
            border-left-color: var(--danger-color);
        }
        
        .notification-warning {
            border-left-color: var(--warning-color);
        }
        
        .notification-info {
            border-left-color: var(--primary-color);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
            flex: 1;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .notification-success .notification-content i {
            color: var(--success-color);
        }
        
        .notification-error .notification-content i {
            color: var(--danger-color);
        }
        
        .notification-warning .notification-content i {
            color: var(--warning-color);
        }
        
        .notification-info .notification-content i {
            color: var(--primary-color);
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: var(--gray-color);
            transition: var(--transition);
            line-height: 1;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-close:hover {
            color: var(--dark-color);
        }
        
        /* Tema escuro para notificações */
        body.dark-theme .notification {
            background-color: var(--dark-color);
            color: white;
        }
    `;
    document.head.appendChild(notificationStyles);
}

// Adicionar CSS para tema escuro se não existir
if (!document.querySelector('#dark-theme-styles')) {
    const darkThemeStyles = document.createElement('style');
    darkThemeStyles.id = 'dark-theme-styles';
    darkThemeStyles.textContent = `
        body.dark-theme {
            background-color: #1a1a2e;
            color: #e6e6e6;
        }
        
        body.dark-theme .main-header {
            background-color: #16213e;
        }
        
        body.dark-theme .feature-card,
        body.dark-theme .auth-card,
        body.dark-theme .account-sidebar,
        body.dark-theme .account-content,
        body.dark-theme .songs-table,
        body.dark-theme .stat-card,
        body.dark-theme .playlist-card,
        body.dark-theme .modal-content {
            background-color: #16213e;
            color: #e6e6e6;
        }
        
        body.dark-theme input,
        body.dark-theme select,
        body.dark-theme textarea {
            background-color: #0f3460;
            color: #e6e6e6;
            border-color: #1a1a2e;
        }
        
        body.dark-theme .input-with-icon input {
            background-color: #0f3460;
            color: #e6e6e6;
        }
        
        body.dark-theme .songs-table tbody tr:hover {
            background-color: #0f3460;
        }
        
        body.dark-theme .search-box input {
            background-color: #0f3460;
            color: #e6e6e6;
        }
        
        body.dark-theme .btn-filter {
            background-color: #0f3460;
            color: #e6e6e6;
        }
        
        body.dark-theme .btn-filter.active {
            background-color: var(--primary-color);
        }
    `;
    document.head.appendChild(darkThemeStyles);
}