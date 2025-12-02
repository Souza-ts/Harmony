// Utilitários gerais para o projeto Harmony
document.addEventListener('DOMContentLoaded', function() {
    console.log('Utils.js carregado');
    
    // Inicializar funcionalidades comuns
    initHamburgerMenu();
    initThemeSystem();
    checkOnlineStatus();
    initSmoothScrolling();
    initFormValidation();
    
    // Verificar login status
    checkAuthStatus();
});

// Menu hamburguer responsivo
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Fechar menu ao clicar em um link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Sistema de tema
function initThemeSystem() {
    // Verificar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('harmony_theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    // Aplicar tema
    applyTheme(theme);
    
    // Configurar botões de tema
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const selectedTheme = this.dataset.theme;
            applyTheme(selectedTheme);
            localStorage.setItem('harmony_theme', selectedTheme);
            
            // Atualizar UI
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
        
        // Marcar opção ativa
        if (option.dataset.theme === theme) {
            option.classList.add('active');
        }
    });
}

// Aplicar tema
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'auto') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Verificar status de autenticação
function checkAuthStatus() {
    const user = localStorage.getItem('harmony_user');
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            updateAuthUI(userData);
        } catch (e) {
            console.error('Erro ao analisar dados do usuário:', e);
        }
    }
}

// Atualizar UI baseada no status de autenticação
function updateAuthUI(userData) {
    // Atualizar nome do usuário em elementos específicos
    const userElements = document.querySelectorAll('[data-user-name]');
    userElements.forEach(element => {
        if (element.dataset.userName === 'full') {
            element.textContent = `${userData.firstName} ${userData.lastName}`;
        } else if (element.dataset.userName === 'first') {
            element.textContent = userData.firstName;
        }
    });
    
    // Atualizar e-mail do usuário
    const emailElements = document.querySelectorAll('[data-user-email]');
    emailElements.forEach(element => {
        element.textContent = userData.email;
    });
}

// Verificar status de conexão
function checkOnlineStatus() {
    if (!navigator.onLine) {
        showNotification('Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
    }
    
    window.addEventListener('online', () => {
        showNotification('Conexão restaurada!', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('Você está offline.', 'warning');
    });
}

// Scroll suave para âncoras
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(href);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Validação de formulários
function initFormValidation() {
    // Adicionar validação personalizada a todos os formulários
    document.querySelectorAll('form').forEach(form => {
        form.setAttribute('novalidate', true);
        
        form.addEventListener('submit', function(e) {
            if (!this.checkValidity()) {
                e.preventDefault();
                highlightInvalidFields(this);
            }
        });
    });
    
    // Adicionar validação em tempo real
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Destacar campos inválidos
function highlightInvalidFields(form) {
    const invalidFields = form.querySelectorAll(':invalid');
    
    invalidFields.forEach(field => {
        field.style.borderColor = 'var(--danger-color)';
        field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
    });
}

// Validar campo individual
function validateField(field) {
    if (field.validity.valid) {
        field.style.borderColor = 'var(--success-color)';
        field.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
    } else {
        field.style.borderColor = 'var(--danger-color)';
        field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
    }
}

// Formatar tempo (segundos para MM:SS)
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Formatar tamanho de arquivo
function formatFileSize(bytes) {
    if (bytes === 0 || isNaN(bytes)) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debounce function para otimizar eventos
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

// Throttle function para limitar frequência de eventos
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Mostrar notificação (função reutilizável)
function showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Ícone baseado no tipo
    let icon;
    switch(type) {
        case 'success': icon = 'fas fa-check-circle'; break;
        case 'error': icon = 'fas fa-exclamation-circle'; break;
        case 'warning': icon = 'fas fa-exclamation-triangle'; break;
        default: icon = 'fas fa-info-circle';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Configurar auto-fechamento
    const autoClose = setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Configurar fechamento manual
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

// Carregar dados do localStorage com tratamento de erro
function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error(`Erro ao carregar ${key} do localStorage:`, e);
        return defaultValue;
    }
}

// Salvar dados no localStorage com tratamento de erro
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error(`Erro ao salvar ${key} no localStorage:`, e);
        return false;
    }
}

// Verificar se é dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Prevenir comportamento padrão de formulários
function preventFormDefaults() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (this.getAttribute('data-prevent-default') === 'true') {
                e.preventDefault();
            }
        });
    });
}

// Inicializar tooltips
function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
            
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });
}

// Adicionar estilos para tooltips
if (!document.querySelector('#tooltip-styles')) {
    const tooltipStyles = document.createElement('style');
    tooltipStyles.id = 'tooltip-styles';
    tooltipStyles.textContent = `
        .tooltip {
            position: fixed;
            background-color: var(--dark-color);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 0.85rem;
            z-index: 10001;
            pointer-events: none;
            white-space: nowrap;
        }
        
        .tooltip:after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: var(--dark-color) transparent transparent transparent;
        }
    `;
    document.head.appendChild(tooltipStyles);
}

// Inicializar tooltips após carregamento
setTimeout(initTooltips, 1000);