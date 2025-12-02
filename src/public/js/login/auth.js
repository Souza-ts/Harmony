// Sistema de Autenticação Harmony - COMPLETO E FUNCIONAL
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js carregado');
    
    // Verificar página atual
    const isLoginPage = window.location.pathname.includes('login.html');
    const isSignupPage = window.location.pathname.includes('signup.html');
    
    // Inicializar funcionalidades baseado na página
    if (isLoginPage) {
        initLoginPage();
    } else if (isSignupPage) {
        initSignupPage();
    }
    
    // Verificar se usuário já está logado
    checkLoginStatus();
    
    // Inicializar notificações
    initNotificationSystem();
});

// Inicializar página de login
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    console.log('Inicializando página de login');
    
    // Configurar toggle de senha
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    }
    
    // Preencher credenciais de teste (apenas para desenvolvimento)
    document.getElementById('email').value = 'teste@harmony.com';
    document.getElementById('password').value = 'senha123';
    
    // Configurar submit do formulário
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulário de login enviado');
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;
        
        // Validação
        if (!validateEmail(email)) {
            showNotification('Por favor, insira um e-mail válido.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showNotification('A senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        // Processar login
        processLogin(email, password, remember);
    });
    
    // Configurar login social
    document.querySelectorAll('.btn-social').forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'GitHub';
            showNotification(`Login com ${provider} será implementado em breve.`, 'info');
        });
    });
}

// Inicializar página de cadastro
function initSignupPage() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    console.log('Inicializando página de cadastro');
    
    // Configurar toggles de senha
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target') || 'password';
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
    
    // Configurar força da senha
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
            checkPasswordMatch();
        });
    }
    
    // Configurar confirmação de senha
    const confirmInput = document.getElementById('confirmPassword');
    if (confirmInput) {
        confirmInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Configurar validação de nome de usuário
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.addEventListener('blur', function() {
            if (this.value.length > 0 && this.value.length < 3) {
                showNotification('Nome de usuário deve ter pelo menos 3 caracteres.', 'warning');
            }
        });
    }
    
    // Configurar data de nascimento (limitar a 18+ anos)
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
        birthDateInput.max = maxDate.toISOString().split('T')[0];
        
        // Definir data padrão para 18 anos atrás
        const defaultDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        birthDateInput.value = defaultDate.toISOString().split('T')[0];
    }
    
    // Configurar submit do formulário
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulário de cadastro enviado');
        
        // Coletar dados
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            birthDate: document.getElementById('birthDate').value,
            terms: document.getElementById('terms').checked,
            newsletter: document.getElementById('newsletter')?.checked || false
        };
        
        // Validar dados
        const validation = validateSignupForm(formData);
        if (!validation.isValid) {
            showNotification(validation.message, 'error');
            return;
        }
        
        // Processar cadastro
        processSignup(formData);
    });
}

// Validar formulário de cadastro
function validateSignupForm(formData) {
    // Verificar campos obrigatórios
    const requiredFields = ['firstName', 'lastName', 'email', 'username', 'password', 'confirmPassword', 'birthDate'];
    for (const field of requiredFields) {
        if (!formData[field] || formData[field].toString().trim() === '') {
            return {
                isValid: false,
                message: 'Por favor, preencha todos os campos obrigatórios.'
            };
        }
    }
    
    // Verificar termos
    if (!formData.terms) {
        return {
            isValid: false,
            message: 'Você deve aceitar os Termos de Serviço para continuar.'
        };
    }
    
    // Validar e-mail
    if (!validateEmail(formData.email)) {
        return {
            isValid: false,
            message: 'Por favor, insira um e-mail válido.'
        };
    }
    
    // Validar nome de usuário
    if (formData.username.length < 3) {
        return {
            isValid: false,
            message: 'Nome de usuário deve ter pelo menos 3 caracteres.'
        };
    }
    
    // Validar senha
    if (formData.password.length < 8) {
        return {
            isValid: false,
            message: 'A senha deve ter pelo menos 8 caracteres.'
        };
    }
    
    // Verificar se as senhas coincidem
    if (formData.password !== formData.confirmPassword) {
        return {
            isValid: false,
            message: 'As senhas não coincidem.'
        };
    }
    
    // Validar idade (pelo menos 13 anos)
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 13) {
        return {
            isValid: false,
            message: 'Você deve ter pelo menos 13 anos para criar uma conta.'
        };
    }
    
    return { isValid: true, message: 'Validação bem-sucedida.' };
}

// Atualizar força da senha
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    
    if (!strengthBar || !strengthValue) return;
    
    let strength = 0;
    
    // Critérios de força
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    strength = Math.min(strength, 100);
    
    // Atualizar barra visual
    strengthBar.style.width = `${strength}%`;
    
    // Atualizar texto e cor
    let color, text;
    if (strength < 40) {
        color = 'var(--danger-color)';
        text = 'Fraca';
    } else if (strength < 70) {
        color = 'var(--warning-color)';
        text = 'Média';
    } else if (strength < 90) {
        color = '#4CAF50';
        text = 'Forte';
    } else {
        color = 'var(--success-color)';
        text = 'Muito Forte';
    }
    
    strengthBar.style.backgroundColor = color;
    strengthValue.textContent = text;
    strengthValue.style.color = color;
}

// Verificar se as senhas coincidem
function checkPasswordMatch() {
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const matchIcon = document.getElementById('passwordMatchIcon');
    const matchText = document.getElementById('passwordMatchText');
    
    if (!matchIcon || !matchText) return;
    
    if (confirmPassword === '') {
        matchText.textContent = '';
        matchIcon.className = 'fas fa-check';
        matchIcon.classList.remove('visible');
        return;
    }
    
    if (password === confirmPassword) {
        matchText.textContent = 'As senhas coincidem';
        matchText.style.color = 'var(--success-color)';
        matchIcon.className = 'fas fa-check';
        matchIcon.style.color = 'var(--success-color)';
        matchIcon.classList.add('visible');
    } else {
        matchText.textContent = 'As senhas não coincidem';
        matchText.style.color = 'var(--danger-color)';
        matchIcon.className = 'fas fa-times';
        matchIcon.style.color = 'var(--danger-color)';
        matchIcon.classList.add('visible');
    }
}

// Validar e-mail
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Processar login
function processLogin(email, password, remember) {
    const submitBtn = document.querySelector('#loginForm .btn-primary');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar estado de carregamento
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    submitBtn.disabled = true;
    
    // Simular delay de rede
    setTimeout(() => {
        // Credenciais de teste (em produção, seria uma requisição AJAX)
        if (email === 'teste@harmony.com' && password === 'senha123') {
            // Criar objeto de usuário
            const user = {
                id: 1,
                firstName: 'Usuário',
                lastName: 'Teste',
                email: email,
                username: 'teste',
                avatar: null,
                plan: 'free',
                createdAt: new Date().toISOString(),
                settings: {
                    theme: 'light',
                    notifications: true,
                    autoplay: true
                }
            };
            
            // Salvar no localStorage
            localStorage.setItem('harmony_user', JSON.stringify(user));
            
            // Salvar token de sessão
            localStorage.setItem('harmony_token', 'demo_token_' + Date.now());
            
            // Configurar lembrar-me
            if (remember) {
                localStorage.setItem('harmony_remember', 'true');
            }
            
            showNotification('Login realizado com sucesso!', 'success');
            
            // Redirecionar após 1 segundo
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            showNotification('E-mail ou senha incorretos. Use: teste@harmony.com / senha123', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }, 1500);
}

// Processar cadastro
function processSignup(formData) {
    const submitBtn = document.querySelector('#signupForm .btn-primary');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar estado de carregamento
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
    submitBtn.disabled = true;
    
    // Simular delay de rede
    setTimeout(() => {
        // Criar objeto de usuário
        const user = {
            id: Date.now(),
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            username: formData.username,
            birthDate: formData.birthDate,
            avatar: null,
            plan: 'free',
            newsletter: formData.newsletter,
            createdAt: new Date().toISOString(),
            settings: {
                theme: 'light',
                notifications: true,
                autoplay: true
            }
        };
        
        // Verificar se já existe usuário com este e-mail
        const existingUsers = JSON.parse(localStorage.getItem('harmony_users') || '[]');
        const userExists = existingUsers.some(u => u.email === user.email);
        
        if (userExists) {
            showNotification('Este e-mail já está cadastrado.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Adicionar novo usuário à lista
        existingUsers.push(user);
        localStorage.setItem('harmony_users', JSON.stringify(existingUsers));
        
        // Fazer login automático
        localStorage.setItem('harmony_user', JSON.stringify(user));
        localStorage.setItem('harmony_token', 'demo_token_' + Date.now());
        
        showNotification('Conta criada com sucesso!', 'success');
        
        // Redirecionar após 1 segundo
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    }, 2000);
}

// Verificar status de login
function checkLoginStatus() {
    const user = localStorage.getItem('harmony_user');
    const token = localStorage.getItem('harmony_token');
    
    if (user && token) {
        // Usuário está logado
        const userData = JSON.parse(user);
        
        // Atualizar UI se estiver em páginas protegidas
        updateUIForLoggedInUser(userData);
        
        // Redirecionar de login/cadastro se já estiver logado
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('signup.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } else {
        // Usuário não está logado
        // Redirecionar de páginas protegidas se não estiver logado
        if (window.location.pathname.includes('account.html')) {
            window.location.href = '../../../../index.html';
        }
    }
}

// Atualizar UI para usuário logado
function updateUIForLoggedInUser(userData) {
    // Atualizar links de conta
    const accountLinks = document.querySelectorAll('a[href="account.html"]');
    accountLinks.forEach(link => {
        if (link.querySelector('.fa-user')) {
            link.innerHTML = `<i class="fas fa-user"></i> ${userData.firstName}`;
        }
    });
    
    // Esconder links de login/cadastro
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const signupLinks = document.querySelectorAll('a[href="signup.html"]');
    
    loginLinks.forEach(link => link.style.display = 'none');
    signupLinks.forEach(link => link.style.display = 'none');
}

// Inicializar sistema de notificações
function initNotificationSystem() {
    // CSS para notificações já está no style.css
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Criar notificação
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
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Configurar auto-fechamento
    const autoClose = setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Configurar fechamento manual
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(autoClose);
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
}