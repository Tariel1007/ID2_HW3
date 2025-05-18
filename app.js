// State management
let currentPage = 1;
const recordsPerPage = 9;

// DOM Elements
const recordsGrid = document.getElementById('records-grid');
const pagination = document.getElementById('pagination');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');
const conditionFilter = document.getElementById('condition-filter');
const searchInput = document.getElementById('search-input');
const loadingIndicator = document.getElementById('loading');
const noResultsMessage = document.getElementById('no-results');
const resultsCount = document.getElementById('results-count');
const currentCount = document.getElementById('current-count');
const totalCount = document.getElementById('total-count');
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

// Event Listeners
categoryFilter.addEventListener('change', () => {
    currentPage = 1;
    renderRecords();
});

sortFilter.addEventListener('change', () => {
    currentPage = 1;
    renderRecords();
});

conditionFilter.addEventListener('change', () => {
    currentPage = 1;
    renderRecords();
});

searchInput.addEventListener('input', debounce(() => {
    currentPage = 1;
    renderRecords();
}, 300));

// Utility Functions
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

function formatPrice(price) {
    return price.toFixed(2);
}

// Filter and Sort Functions
function getFilteredRecords() {
    let filtered = [...records];
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const condition = conditionFilter.value;
    const sort = sortFilter.value;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(record => 
            record.title.toLowerCase().includes(searchTerm) ||
            record.artist.toLowerCase().includes(searchTerm)
        );
    }

    // Apply category filter
    if (category !== 'all') {
        filtered = filtered.filter(record => record.category === category);
    }

    // Apply condition filter
    if (condition !== 'all') {
        filtered = filtered.filter(record => record.condition === condition);
    }

    // Apply sorting
    switch (sort) {
        case 'price-asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'year-desc':
            filtered.sort((a, b) => b.year - a.year);
            break;
        case 'year-asc':
            filtered.sort((a, b) => a.year - b.year);
            break;
    }

    return filtered;
}

// Cart Functions
function addToCart(recordId) {
    const user = getCurrentUser();
    if (!user) {
        showNotification('Please sign in to add items to cart', 'error');
        return;
    }

    const record = records.find(r => r.id === recordId);
    if (!record) return;

    const cart = getUserCart();
    const existingItem = cart.find(item => item.id === recordId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: record.id,
            title: record.title,
            artist: record.artist,
            price: record.price,
            image: record.image,
            quantity: 1
        });
    }

    saveUserCart(cart);
    updateCartCount();
    showNotification('Added to cart!');
}

function updateCartCount() {
    const cart = getUserCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
}

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

// Record Card Creation
function createRecordCard(record) {
    return `
        <div class="record-card">
            <a href="record.html?id=${record.id}">
                <img src="${record.image}" alt="${record.title}" class="record-image">
            </a>
            <div class="record-info">
                <a href="record.html?id=${record.id}" class="record-title">${record.title}</a>
                <p class="record-artist">${record.artist}</p>
                <p class="record-price">$${formatPrice(record.price)}</p>
                <div class="record-actions">
                    <span class="record-category">${record.category}</span>
                    <button class="add-to-cart" onclick="addToCart('${record.id}')">
                        <i class="fas fa-cart-plus"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Rendering Functions
function renderRecords() {
    loadingIndicator.style.display = 'flex';
    noResultsMessage.style.display = 'none';
    recordsGrid.innerHTML = '';

    setTimeout(() => {
        const filteredRecords = getFilteredRecords();
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const currentRecords = filteredRecords.slice(startIndex, endIndex);

        // Update results count
        currentCount.textContent = currentRecords.length;
        totalCount.textContent = filteredRecords.length;

        if (filteredRecords.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            recordsGrid.innerHTML = currentRecords.map(createRecordCard).join('');
        }

        renderPagination(totalPages);
        loadingIndicator.style.display = 'none';
    }, 300);
}

function renderPagination(totalPages) {
    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-button';
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderRecords();
        }
    };
    pagination.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.onclick = () => {
                currentPage = i;
                renderRecords();
            };
            pagination.appendChild(pageButton);
        } else if (
            i === currentPage - 2 ||
            i === currentPage + 2
        ) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination-ellipsis';
            ellipsis.textContent = '...';
            pagination.appendChild(ellipsis);
        }
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-button';
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderRecords();
        }
    };
    pagination.appendChild(nextButton);
}

// Initialize
renderRecords();
updateCartCount(); 