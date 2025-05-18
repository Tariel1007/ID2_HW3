// Auth state management
let currentUser = null;

// DOM Elements
const authModal = document.getElementById('auth-modal');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authToggleText = document.getElementById('auth-toggle-text');
const authToggleLink = document.getElementById('auth-toggle-link');
const signinBtn = document.querySelector('.signin-btn');
const logoutBtn = document.querySelector('.logout');

// Auth mode state
let isLoginMode = true;

// Show modal
function showAuthModal() {
    authModal.classList.add('show');
}

// Hide modal
function hideAuthModal() {
    authModal.classList.remove('show');
    authForm.reset();
}

// Toggle between login and signup
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Sign In' : 'Create Account';
    authToggleText.textContent = isLoginMode ? "Don't have an account?" : 'Already have an account?';
    authToggleLink.textContent = isLoginMode ? 'Create Account' : 'Sign In';
    document.getElementById('auth-submit').textContent = isLoginMode ? 'Sign In' : 'Create Account';
}

// Update UI based on auth state
function updateAuthUI() {
    if (currentUser) {
        signinBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        signinBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// Get users from localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Handle form submission
function handleAuthSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const users = getUsers();

    try {
        if (isLoginMode) {
            // Sign In
            const user = users.find(u => u.email === email && u.password === password);
            if (!user) {
                throw new Error('Invalid email or password');
            }
            currentUser = { email: user.email };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            // Create Account
            if (users.find(u => u.email === email)) {
                throw new Error('Email already registered');
            }
            const newUser = { email, password };
            users.push(newUser);
            saveUsers(users);
            currentUser = { email };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }

        updateAuthUI();
        hideAuthModal();
        showNotification(isLoginMode ? 'Successfully signed in!' : 'Account created successfully!');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Handle logout
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showNotification('Successfully logged out!');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Check for existing session
function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        updateAuthUI();
    }
}

// Event Listeners
signinBtn.addEventListener('click', () => {
    isLoginMode = true;
    toggleAuthMode();
    showAuthModal();
});

logoutBtn.addEventListener('click', handleLogout);
authForm.addEventListener('submit', handleAuthSubmit);
authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthMode();
});

// Close modal when clicking outside
authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
        hideAuthModal();
    }
});

// Initialize auth state
checkAuth(); 