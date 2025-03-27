// Auth related functionality
document.addEventListener('DOMContentLoaded', function() {
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    const logoutBtn = document.getElementById('logout-btn');
    const registerFormContainer = document.getElementById('register-form-container');
    
    // Check if user is already logged in
    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const user = await api.getCurrentUser();
                if (user) {
                    // User is authenticated, show main content
                    authContainer.style.display = 'none';
                    mainContainer.style.display = 'grid';
                    logoutBtn.style.display = 'block';
                    
                    // Update UI with user info
                    const avatar = document.querySelector('.avatar');
                    avatar.textContent = getInitials(user.full_name);
                    
                    // Load land records
                    initMap();
                    loadLandRecords();
                    return;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                // Clear invalid token
                localStorage.removeItem('token');
            }
        }
        
        // User is not authenticated, show login form
        authContainer.style.display = 'flex';
        mainContainer.style.display = 'none';
    };
    
    // Handle login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await api.login(username, password);
            localStorage.setItem('token', response.access_token);
            checkAuth();
        } catch (error) {
            alert(error.message || 'Login failed');
        }
    });
    
    // Handle register form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            full_name: document.getElementById('reg-full-name').value,
            password: document.getElementById('reg-password').value,
            aadhaar_number: document.getElementById('reg-aadhaar').value
        };
        
        try {
            await api.register(userData);
            alert('Registration successful! Please login.');
            // Show login form
            registerFormContainer.style.display = 'none';
            loginForm.style.display = 'block';
        } catch (error) {
            alert(error.message || 'Registration failed');
        }
    });
    
    // Toggle between login and register forms
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerFormContainer.style.display = 'block';
        loginForm.closest('.auth-form').style.display = 'none';
    });
    
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerFormContainer.style.display = 'none';
        loginForm.closest('.auth-form').style.display = 'block';
    });
    
    // Handle logout
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        checkAuth();
    });
    
    // Utility to get initials from name
    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('');
    }
    
    // Check authentication when page loads
    checkAuth();
});