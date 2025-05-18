// Cart state management
let cart = [];

// DOM Elements
const cartContent = document.getElementById('cart-content');
const cartCount = document.querySelector('.cart-count');

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Get user's cart from localStorage
function getUserCart() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
    return userCarts[user.email] || [];
}

// Save user's cart to localStorage
function saveUserCart(cartItems) {
    const user = getCurrentUser();
    if (!user) return;
    
    const userCarts = JSON.parse(localStorage.getItem('userCarts')) || {};
    userCarts[user.email] = cartItems;
    localStorage.setItem('userCarts', JSON.stringify(userCarts));
}

// Update cart count in navbar
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// Format price
function formatPrice(price) {
    return price.toFixed(2);
}

// Update quantity
function updateQuantity(recordId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(recordId);
        return;
    }

    const item = cart.find(item => item.id === recordId);
    if (item) {
        item.quantity = newQuantity;
        saveUserCart(cart);
        renderCart();
    }
}

// Remove from cart
function removeFromCart(recordId) {
    cart = cart.filter(item => item.id !== recordId);
    saveUserCart(cart);
    renderCart();
}

// Calculate total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render cart
function renderCart() {
    const user = getCurrentUser();
    
    if (!user) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-user-lock"></i>
                <h2>Please Sign In</h2>
                <p>You need to be signed in to view your cart</p>
                <a href="index.html" class="continue-shopping">
                    <i class="fas fa-arrow-left"></i>
                    Back to Home
                </a>
            </div>
        `;
        return;
    }

    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Add some records to your cart to see them here</p>
                <a href="index.html" class="continue-shopping">
                    <i class="fas fa-arrow-left"></i>
                    Continue Shopping
                </a>
            </div>
        `;
        return;
    }

    const cartHTML = `
        <div class="cart-items">
            ${cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3 class="cart-item-title">${item.title}</h3>
                        <p class="cart-item-artist">${item.artist}</p>
                        <p class="cart-item-price">$${formatPrice(item.price)}</p>
                        <div class="cart-item-quantity">
                            <button class="quantity-button" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span class="quantity-number">${item.quantity}</span>
                            <button class="quantity-button" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal</span>
                <span>$${formatPrice(calculateTotal())}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>Free</span>
            </div>
            <div class="summary-row">
                <span>Total</span>
                <span>$${formatPrice(calculateTotal())}</span>
            </div>
            <button class="checkout-button" onclick="checkout()">
                Proceed to Checkout
            </button>
        </div>
    `;

    cartContent.innerHTML = cartHTML;
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Here you would typically integrate with a payment system
    showNotification('Thank you for your purchase!', 'success');
    cart = [];
    saveUserCart(cart);
    renderCart();
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

// Initialize cart
function initCart() {
    cart = getUserCart();
    renderCart();
    updateCartCount();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initCart); 