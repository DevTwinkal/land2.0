// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Main application initializing...');
    
    // Initialize authentication
    initAuth();
    
    // Add global error handler for API and other async operations
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        if (event.reason.message) {
            showNotification('Error: ' + event.reason.message, 'error');
        } else {
            showNotification('An unexpected error occurred. Check console for details.', 'error');
        }
    });
    
    // Initialize global notification system
    initNotifications();
});

// Initialize authentication system
function initAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No authentication token found, showing login form');
        showLoginForm();
    } else {
        console.log('Authentication token found, checking validity');
        validateToken(token);
    }
}

// Validate the authentication token
async function validateToken(token) {
    try {
        // Show loading indicator
        showLoadingOverlay('Authenticating...');
        
        // Attempt to get current user with token
        const user = await api.getCurrentUser();
        if (user) {
            console.log('Token is valid, user is authenticated:', user);
            
            // Hide loading overlay
            hideLoadingOverlay();
            
            // Show dashboard
            showDashboard(user);
            
            // Update user profile in header
            updateUserProfile(user);
        } else {
            console.log('Token validation failed, no user returned');
            
            // Hide loading overlay
            hideLoadingOverlay();
            
            // Token is invalid, show login form
            showLoginForm();
        }
    } catch (error) {
        console.error('Token validation error:', error);
        
        // Hide loading overlay
        hideLoadingOverlay();
        
        // Show login form
        showLoginForm();
    }
}

// Show login form
function showLoginForm() {
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (authContainer && mainContainer) {
        authContainer.style.display = 'flex';
        mainContainer.style.display = 'none';
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
}

// Show dashboard
function showDashboard(user) {
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.getElementById('main-container');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (authContainer && mainContainer) {
        authContainer.style.display = 'none';
        mainContainer.style.display = 'grid';
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
    }
    
    // Initialize dashboard components
    initMap();
    setTimeout(() => {
        loadLandRecords();
    }, 100);
}

// Update user profile in header
function updateUserProfile(user) {
    const avatar = document.querySelector('.avatar');
    if (avatar && user.full_name) {
        const initials = user.full_name.split(' ').map(n => n[0]).join('');
        avatar.textContent = initials;
    }
}

// Loading overlay functions
function showLoadingOverlay(message = 'Loading...') {
    // Check if overlay already exists
    let overlay = document.getElementById('loading-overlay');
    
    if (!overlay) {
        // Create overlay
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        
        // Create spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        
        // Create message
        const messageElement = document.createElement('p');
        messageElement.className = 'loading-message';
        messageElement.textContent = message;
        
        // Add elements to overlay
        overlay.appendChild(spinner);
        overlay.appendChild(messageElement);
        
        // Add overlay to document
        document.body.appendChild(overlay);
    } else {
        // Update existing overlay message
        const messageElement = overlay.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
        
        // Make sure it's visible
        overlay.style.display = 'flex';
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        // Remove the overlay
        document.body.removeChild(overlay);
    }
}

// Notification system
function initNotifications() {
    // Check if notification container exists
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        // Create notification container
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        
        // Add to document
        document.body.appendChild(notificationContainer);
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    
    if (!container) return;
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = '📌';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    // Set content
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-message">${message}</div>
        <button class="notification-close">×</button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add close handler
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            container.removeChild(notification);
        });
    }
    
    // Auto close after duration
    setTimeout(() => {
        if (notification.parentElement === container) {
            container.removeChild(notification);
        }
    }, duration);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
}

// Export global utility functions
window.showNotification = showNotification;
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;