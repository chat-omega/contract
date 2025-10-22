// Authentication JavaScript

class AuthManager {
    constructor() {
        // Always use relative path to go through nginx proxy for proper CORS and routing
        this.apiUrl = '';
        this.init();
    }

    init() {
        // Check if user is already authenticated
        if (this.isAuthenticated() && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
            this.redirectToApp();
            return;
        }

        // Initialize page-specific functionality
        if (window.location.pathname.includes('login')) {
            this.initLoginPage();
        } else if (window.location.pathname.includes('register')) {
            this.initRegisterPage();
        }
    }

    // Token management
    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    getToken() {
        return localStorage.getItem('authToken');
    }

    removeToken() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    // User data management
    setUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Redirect functions
    redirectToApp() {
        window.location.href = '/';
    }

    redirectToLogin() {
        window.location.href = '/login.html';
    }

    // API calls
    async makeAuthRequest(endpoint, data) {
        try {
            console.log(`Making request to: ${this.apiUrl}${endpoint}`);
            console.log('Request data:', data);
            
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log(`Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
            console.log('Response URL:', response.url);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));
            
            // Get response text first to handle empty responses
            const responseText = await response.text();
            console.log(`Response text length: ${responseText.length}`);
            
            // Log first 200 characters for debugging
            console.log('Response preview:', responseText.substring(0, 200));
            
            let result;
            if (responseText.trim()) {
                try {
                    result = JSON.parse(responseText);
                    console.log('Successfully parsed JSON:', result);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.error('Full response text:', responseText);
                    
                    // Check if response looks like HTML
                    if (responseText.trim().toLowerCase().startsWith('<!doctype') || 
                        responseText.trim().toLowerCase().startsWith('<html')) {
                        throw new Error(`Received HTML instead of JSON. This usually means the API endpoint is not available or there's a routing issue. Response: ${responseText.substring(0, 100)}...`);
                    }
                    
                    throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
                }
            } else {
                console.warn('Empty response received');
                result = {};
            }
            
            if (!response.ok) {
                console.error('HTTP error response:', response.status, response.statusText, result);
                throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return result;
        } catch (error) {
            console.error('Auth request error:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    // Login page initialization
    initLoginPage() {
        const loginForm = document.getElementById('login-form');
        const togglePassword = document.getElementById('toggle-password');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility('password', 'toggle-password'));
        }

        // Auto-focus username field
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.focus();
        }
    }

    // Register page initialization
    initRegisterPage() {
        const registerForm = document.getElementById('register-form');
        const togglePassword = document.getElementById('toggle-password');
        const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirm-password');
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility('password', 'toggle-password'));
        }

        if (toggleConfirmPassword) {
            toggleConfirmPassword.addEventListener('click', () => this.togglePasswordVisibility('confirm-password', 'toggle-confirm-password'));
        }

        // Real-time password confirmation validation
        if (confirmPasswordField) {
            confirmPasswordField.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }

        if (passwordField) {
            passwordField.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
    }

    // Password visibility toggle
    togglePasswordVisibility(fieldId, buttonId) {
        const field = document.getElementById(fieldId);
        const button = document.getElementById(buttonId);
        const icon = button.querySelector('.material-icons');
        
        if (field.type === 'password') {
            field.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            field.type = 'password';
            icon.textContent = 'visibility';
        }
    }

    // Password match validation
    validatePasswordMatch() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const confirmField = document.getElementById('confirm-password');
        
        if (confirmPassword && password !== confirmPassword) {
            confirmField.setCustomValidity('Passwords do not match');
        } else {
            confirmField.setCustomValidity('');
        }
    }

    // Show/hide messages
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
        }
    }

    hideMessages() {
        const errorDiv = document.getElementById('error-message');
        const successDiv = document.getElementById('success-message');
        
        if (errorDiv) errorDiv.style.display = 'none';
        if (successDiv) successDiv.style.display = 'none';
    }

    // Set loading state for buttons
    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        const btnText = button.querySelector('.btn-text');
        const btnSpinner = button.querySelector('.btn-spinner');
        
        if (loading) {
            button.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'block';
        } else {
            button.disabled = false;
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }

    // Handle login
    async handleLogin(event) {
        event.preventDefault();
        this.hideMessages();

        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const password = formData.get('password');

        if (!username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        this.setButtonLoading('login-btn', true);

        try {
            console.log('Starting login process for username:', username);
            
            // Try login with retry mechanism
            let result;
            let lastError;
            
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`Login attempt ${attempt}/3`);
                    result = await this.makeAuthRequest('/api/auth/login', {
                        username,
                        password
                    });
                    break; // Success, exit retry loop
                } catch (error) {
                    lastError = error;
                    console.warn(`Login attempt ${attempt} failed:`, error.message);
                    
                    if (attempt < 3) {
                        console.log(`Retrying in ${attempt * 1000}ms...`);
                        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
                    }
                }
            }
            
            if (!result) {
                throw lastError || new Error('Login failed after 3 attempts');
            }

            console.log('Login result:', result);

            if (result.success) {
                // Store authentication data
                this.setToken(result.tokens.accessToken);
                this.setUserData(result.user);

                console.log('Login successful, stored token and user data');
                
                // Show success message briefly
                this.showSuccess('Login successful! Redirecting...');
                
                // Redirect after a short delay
                setTimeout(() => {
                    this.redirectToApp();
                }, 1000);
            } else {
                console.error('Login failed - success flag false:', result);
                this.showError(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Login failed. Please try again.');
        } finally {
            this.setButtonLoading('login-btn', false);
        }
    }

    // Handle registration
    async handleRegister(event) {
        event.preventDefault();
        this.hideMessages();

        const formData = new FormData(event.target);
        const username = formData.get('username').trim();
        const email = formData.get('email').trim();
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm-password');
        const termsAccepted = formData.get('terms');

        // Client-side validation
        if (!username || username.length < 3) {
            this.showError('Username must be at least 3 characters');
            return;
        }

        if (!email || !email.includes('@')) {
            this.showError('Please enter a valid email address');
            return;
        }

        if (!password || password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (!termsAccepted) {
            this.showError('Please accept the terms and conditions');
            return;
        }

        this.setButtonLoading('register-btn', true);

        try {
            const result = await this.makeAuthRequest('/api/auth/register', {
                username,
                email,
                password
            });

            if (result.success) {
                // Store authentication data
                this.setToken(result.tokens.accessToken);
                this.setUserData(result.user);

                // Show success message
                this.showSuccess('Account created successfully! Redirecting...');
                
                // Redirect after a short delay
                setTimeout(() => {
                    this.redirectToApp();
                }, 1500);
            } else {
                this.showError(result.error || 'Registration failed');
            }
        } catch (error) {
            this.showError(error.message || 'Registration failed. Please try again.');
        } finally {
            this.setButtonLoading('register-btn', false);
        }
    }

    // Logout function (to be called from main app)
    async logout() {
        const token = this.getToken();
        
        if (token) {
            try {
                const response = await fetch(`${this.apiUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Handle response if needed, but don't fail logout on API errors
                if (response.ok) {
                    const responseText = await response.text();
                    if (responseText.trim()) {
                        try {
                            JSON.parse(responseText);
                        } catch (parseError) {
                            console.warn('Logout response parse error:', parseError);
                        }
                    }
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear local storage
        this.removeToken();
        
        // Redirect to login
        this.redirectToLogin();
    }

    // Check if user is authenticated (for main app)
    async checkAuth() {
        const token = this.getToken();
        
        if (!token) {
            return null;
        }

        try {
            const response = await fetch(`${this.apiUrl}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const responseText = await response.text();
                let result;
                
                if (responseText.trim()) {
                    try {
                        result = JSON.parse(responseText);
                    } catch (parseError) {
                        console.error('Auth check JSON parse error:', parseError);
                        console.error('Response text:', responseText);
                        this.removeToken();
                        return null;
                    }
                } else {
                    console.warn('Empty auth check response');
                    this.removeToken();
                    return null;
                }
                
                this.setUserData(result.user);
                return result.user;
            } else {
                // Token is invalid, remove it
                this.removeToken();
                return null;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.removeToken();
            return null;
        }
    }
}

// Global auth manager instance
window.authManager = new AuthManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}