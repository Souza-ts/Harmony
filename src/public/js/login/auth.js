// Sistema de Autenticação Harmony
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de login ou cadastro
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    // Toggle visibilidade da senha
    togglePasswordBtns.forEach(btn => {
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
    
    // Validação de força da senha (cadastro)
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthValue = document.getElementById('strengthValue');
    const passwordMatchIcon = document.getElementById('passwordMatchIcon');
    const passwordMatchText = document.getElementById('passwordMatchText');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            checkPasswordMatch();
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    }
    
    // Verificar força da senha
    function checkPasswordStrength(password) {
        let strength = 0;
        const strengthBarElem = document.querySelector('.strength-bar');
        
        // Verificar comprimento
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 15;
        
        // Verificar complexidade
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[a-z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;
        
        // Limitar a 100%
        strength = Math.min(strength, 100);
        
        // Atualizar barra de força
        strengthBarElem.style.setProperty('--strength-width', `${strength}%`);
        
        // Atualizar cor e texto
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
        
        strengthBarElem.style.setProperty('--strength-color', color);
        strengthBarElem.querySelector('::after').style.backgroundColor = color;
        strengthValue.textContent = text;
        strengthValue.style.color = color;
    }
    
    // Verificar se as senhas coincidem
    function checkPasswordMatch() {
        if (!passwordInput || !confirmPasswordInput) return;
        
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword === '') {
            passwordMatchText.textContent = '';
            passwordMatchIcon.classList.add('hidden');
            return;
        }
        
        if (password === confirmPassword) {
            passwordMatchText.textContent = 'As senhas coincidem';
            passwordMatchText.style.color = 'var(--success-color)';
            passwordMatchIcon.classList.remove('hidden');
        } else {
            passwordMatchText.textContent = 'As senhas não coincidem';
            passwordMatchText.style.color = 'var(--danger-color)';
            passwordMatchIcon.classList.add('hidden');
        }
    }
    
    // Validação do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Validação básica
            if (!email || !password) {
                showNotification('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            // Simular autenticação (em um projeto real, faria uma requisição ao servidor)
            simulateLogin(email, password, remember);
        });
    }
    
    // Validação do formulário de cadastro
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter valores do formulário
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const birthDate = document.getElementById('birthDate').value;
            const terms = document.getElementById('terms').checked;
            
            // Validações
            if (!firstName || !lastName || !email || !username || !password || !confirmPassword || !birthDate) {
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            if (!terms) {
                showNotification('Você deve aceitar os Termos de Serviço para continuar.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('As senhas não coincidem.', 'error');
                return;
            }
            
            if (password.length < 8) {
                showNotification('A senha deve ter pelo menos 8 caracteres.', 'error');
                return;
            }
            
            // Calcular idade a partir da data de nascimento
            const birthDateObj = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birthDateObj.getFullYear();
            const monthDiff = today.getMonth() - birthDateObj.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
                age--;
            }
            
            if (age < 13) {
                showNotification('Você deve ter pelo menos 13 anos para criar uma conta.', 'error');
                return;
            }
            
            // Simular cadastro bem-sucedido
            simulateSignup({
                firstName,
                lastName,
                email,
                username,
                password,
                birthDate
            });
        });
    }
    
    // Login social
    const googleLoginBtn = document.querySelector('.btn-social.google');
    const githubLoginBtn = document.querySelector('.btn-social.github');
    
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            showNotification('Login com Google não está disponível na versão de demonstração.', 'info');
        });
    }
    
    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', function() {
            showNotification('Login com GitHub não está disponível na versão de demonstração.', 'info');
        });
    }
    
    // Simular processo de login
    function simulateLogin(email, password, remember) {
        // Mostrar indicador de carregamento
        const submitBtn = loginForm.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        submitBtn.disabled = true;
        
        // Simular atraso de rede
        setTimeout(() => {
            // Verificar credenciais de teste
            if (email === 'teste@harmony.com' && password === 'senha123') {
                // Salvar informações do usuário (em localStorage para demonstração)
                const userData = {
                    email: email,
                    name: 'Usuário Teste',
                    username: 'teste',
                    loggedIn: true,
                    remember: remember
                };
                
                localStorage.setItem('harmony_user', JSON.stringify(userData));
                
                showNotification('Login realizado com sucesso! Redirecionando...', 'success');
                
                // Redirecionar após 1,5 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showNotification('E-mail ou senha incorretos. Use teste@harmony.com / senha123 para demo.', 'error');
                
                // Restaurar botão
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 1500);
    }
    
    // Simular processo de cadastro
    function simulateSignup(userData) {
        // Mostrar indicador de carregamento
        const submitBtn = signupForm.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
        submitBtn.disabled = true;
        
        // Simular atraso de rede
        setTimeout(() => {
            // Salvar informações do usuário (em localStorage para demonstração)
            const userToSave = {
                email: userData.email,
                name: `${userData.firstName} ${userData.lastName}`,
                username: userData.username,
                loggedIn: true
            };
            
            localStorage.setItem('harmony_user', JSON.stringify(userToSave));
            
            showNotification('Conta criada com sucesso! Redirecionando...', 'success');
            
            // Redirecionar após 1,5 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }, 2000);
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
    
    // Inicializar verificação de força da senha se estiver na página de cadastro
    if (passwordInput && passwordInput.value) {
        checkPasswordStrength(passwordInput.value);
    }
    
    // Adicionar CSS para notificações dinamicamente
    const notificationStyles = document.createElement('style');
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
    `;
    document.head.appendChild(notificationStyles);
});