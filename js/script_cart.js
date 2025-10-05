// Enhanced script for spare parts with cart functionality
console.log('Loading enhanced spare parts script with cart...');

// API configuration
const API_BASE_URL = 'https://gowtham1.pythonanywhere.com/api';

// Cart management
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        this.services = JSON.parse(localStorage.getItem('cartServices')) || [];
        this.updateCartDisplay();
    }

    addProduct(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                ...product,
                quantity: quantity,
                type: 'product'
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification(`${product.name} added to cart!`);
    }

    addService(service, quantity = 1) {
        const existingService = this.services.find(item => item.id === service.id);
        
        if (existingService) {
            existingService.quantity += quantity;
        } else {
            this.services.push({
                ...service,
                quantity: quantity,
                type: 'service'
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        this.showCartNotification(`${service.name} service added to cart!`);
    }

    removeProduct(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
    }

    removeService(serviceId) {
        this.services = this.services.filter(service => service.id !== serviceId);
        this.saveCart();
        this.updateCartDisplay();
    }

    updateQuantity(id, quantity, type = 'product') {
        if (type === 'product') {
            const item = this.items.find(item => item.id === id);
            if (item) {
                item.quantity = Math.max(1, quantity);
            }
        } else {
            const service = this.services.find(service => service.id === id);
            if (service) {
                service.quantity = Math.max(1, quantity);
            }
        }
        this.saveCart();
        this.updateCartDisplay();
    }

    getTotalItems() {
        const productCount = this.items.reduce((total, item) => total + item.quantity, 0);
        const serviceCount = this.services.reduce((total, service) => total + service.quantity, 0);
        return productCount + serviceCount;
    }

    getTotalPrice() {
        const productTotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const serviceTotal = this.services.reduce((total, service) => total + (service.price * service.quantity), 0);
        return productTotal + serviceTotal;
    }

    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
        localStorage.setItem('cartServices', JSON.stringify(this.services));
    }

    clearCart() {
        this.items = [];
        this.services = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartBadge = document.querySelector('.cart-badge');
        const totalItems = this.getTotalItems();
        
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
    }

    showCartNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification alert alert-success';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        notification.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>${message}
            <button type="button" class="btn-close float-end" onclick="this.parentElement.remove()"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 3000);
    }

    generateCartMessage() {
        let message = "Hello! I would like to inquire about the following items:\n\n";
        
        if (this.items.length > 0) {
            message += "PRODUCTS:\n";
            this.items.forEach(item => {
                message += `• ${item.name} (Quantity: ${item.quantity}) - ₹${(item.price * item.quantity).toLocaleString()}\n`;
            });
            message += "\n";
        }
        
        if (this.services.length > 0) {
            message += "SERVICES:\n";
            this.services.forEach(service => {
                message += `• ${service.name} (Quantity: ${service.quantity}) - ₹${(service.price * service.quantity).toLocaleString()}\n`;
            });
            message += "\n";
        }
        
        message += `Total Amount: ₹${this.getTotalPrice().toLocaleString()}\n\n`;
        message += "Please provide more details about availability, delivery options, and final pricing. Thank you!";
        
        return message;
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Load spare parts from API
async function loadSparePartsFromAPI() {
    try {
        console.log('Fetching spare parts from API...');
        const response = await fetch(`${API_BASE_URL}/spare-parts`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const parts = await response.json();
        console.log(`Loaded ${parts.length} spare parts from API`);
        return parts;
    } catch (error) {
        console.error('Failed to load spare parts from API:', error);
        console.log('Using fallback sample data');
        return getSampleParts();
    }
}

// Load services from API
async function loadServicesFromAPI() {
    try {
        console.log('Fetching services from API...');
        const response = await fetch(`${API_BASE_URL}/services`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const services = await response.json();
        console.log(`Loaded ${services.length} services from API`);
        return services;
    } catch (error) {
        console.error('Failed to load services from API:', error);
        return [];
    }
}

// Fallback sample data (in case API is not available)
function getSampleParts() {
    return [
        // Processors
        {id: 1, name: 'Intel Core i7-12700K', category: 'Processors', price: 25000.00, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=300&h=300&fit=crop', description: 'High-performance 12th gen desktop processor', stock: 15},
        {id: 2, name: 'AMD Ryzen 7 5800X', category: 'Processors', price: 22000.00, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop', description: '8-core high-performance processor', stock: 12},
        {id: 3, name: 'Intel Core i5-12400F', category: 'Processors', price: 18000.00, image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=300&h=300&fit=crop', description: 'Budget-friendly gaming processor', stock: 20},
        
        // Graphics Cards
        {id: 4, name: 'NVIDIA RTX 4070', category: 'Graphics Cards', price: 45000.00, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop', description: 'High-end gaming graphics card', stock: 8},
        {id: 5, name: 'NVIDIA GTX 1660 Super', category: 'Graphics Cards', price: 25000.00, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop', description: 'Mid-range gaming graphics card', stock: 15},
        {id: 6, name: 'AMD RX 6600', category: 'Graphics Cards', price: 28000.00, image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=300&h=300&fit=crop', description: 'Excellent 1080p gaming card', stock: 10},
        
        // Memory
        {id: 7, name: 'Corsair 16GB DDR4 3200MHz', category: 'Memory', price: 6500.00, image: 'https://images.unsplash.com/photo-1562976540-8d3a732b3e93?w=300&h=300&fit=crop', description: 'High-speed gaming memory kit', stock: 25},
        {id: 8, name: 'G.Skill 32GB DDR4 3600MHz', category: 'Memory', price: 12000.00, image: 'https://images.unsplash.com/photo-1562976540-8d3a732b3e93?w=300&h=300&fit=crop', description: 'Premium high-capacity memory', stock: 18},
        {id: 9, name: 'Kingston 8GB DDR4 2666MHz', category: 'Memory', price: 3200.00, image: 'https://images.unsplash.com/photo-1562976540-8d3a732b3e93?w=300&h=300&fit=crop', description: 'Budget-friendly memory module', stock: 30},
        
        // Storage
        {id: 10, name: 'Samsung 1TB NVMe SSD', category: 'Storage', price: 8000.00, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop', description: 'Fast NVMe SSD storage drive', stock: 20},
        {id: 11, name: 'WD Blue 2TB HDD', category: 'Storage', price: 4500.00, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop', description: 'High-capacity traditional storage', stock: 25},
        {id: 12, name: 'Crucial 500GB SSD', category: 'Storage', price: 5500.00, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=300&h=300&fit=crop', description: 'Reliable SATA SSD storage', stock: 22},
        
        // Motherboards
        {id: 13, name: 'ASUS ROG B550-F', category: 'Motherboards', price: 15000.00, image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop', description: 'Gaming motherboard with WiFi', stock: 10},
        {id: 14, name: 'MSI B450 Pro Max', category: 'Motherboards', price: 8500.00, image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop', description: 'Budget-friendly AMD motherboard', stock: 15},
        {id: 15, name: 'Gigabyte Z690 AORUS', category: 'Motherboards', price: 22000.00, image: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=300&fit=crop', description: 'Premium Intel motherboard', stock: 8},
        
        // Power Supply
        {id: 16, name: 'Corsair 750W Gold', category: 'Power Supply', price: 8500.00, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', description: 'Fully modular 80+ Gold PSU', stock: 12},
        {id: 17, name: 'EVGA 650W Bronze', category: 'Power Supply', price: 6000.00, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', description: 'Reliable 80+ Bronze PSU', stock: 18},
        {id: 18, name: 'Seasonic 850W Platinum', category: 'Power Supply', price: 12000.00, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop', description: 'Premium 80+ Platinum PSU', stock: 6}
    ];
}

function displaySpareParts(parts) {
    const container = document.getElementById('spare-parts-container');
    if (!container) return;
    
    container.innerHTML = parts.map(part => `
        <div class="col-md-4 mb-4" data-category="${part.category.toLowerCase().replace(/\s+/g, '')}">
            <div class="card h-100">
                <img src="${part.image}" class="card-img-top" alt="${part.name}" style="height: 200px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${part.name}</h5>
                    <p class="card-text">${part.description}</p>
                    <p class="text-primary fw-bold">₹${part.price.toLocaleString()}</p>
                    <p class="text-muted">Stock: ${part.stock}</p>
                    <span class="badge bg-secondary">${part.category}</span>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm" onclick="cart.addProduct(${JSON.stringify(part).replace(/"/g, '&quot;')})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Initialize filtering after products are loaded
    initializeProductFilters();
}

// Button-based product filtering
function initializeProductFilters() {
    const filterButtons = document.querySelectorAll('[data-filter]');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            const products = document.querySelectorAll('[data-category]');
            
            products.forEach(product => {
                const productCategory = product.getAttribute('data-category').toLowerCase();
                
                if (filterValue === 'all') {
                    product.style.display = 'block';
                } else if (filterValue === 'processors' && productCategory === 'processors') {
                    product.style.display = 'block';
                } else if (filterValue === 'memory' && productCategory === 'memory') {
                    product.style.display = 'block';
                } else if (filterValue === 'storage' && productCategory === 'storage') {
                    product.style.display = 'block';
                } else if (filterValue === 'motherboard' && productCategory === 'motherboards') {
                    product.style.display = 'block';
                } else if (filterValue === 'graphics' && productCategory === 'graphicscards') {
                    product.style.display = 'block';
                } else if (filterValue === 'powersupply' && productCategory === 'powersupply') {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
}

// Add cart icon to navigation
function addCartIcon() {
    const navbar = document.querySelector('.navbar-nav');
    if (navbar && !document.querySelector('.cart-icon')) {
        const cartHtml = `
            <li class="nav-item position-relative">
                <a class="nav-link cart-icon" href="cart.html" title="Shopping Cart">
                    <i class="fas fa-shopping-cart"></i>
                    <span class="cart-badge badge bg-danger rounded-pill position-absolute" style="top: 0; right: 0; font-size: 0.7em; display: none;">0</span>
                </a>
            </li>
        `;
        navbar.insertAdjacentHTML('beforeend', cartHtml);
        cart.updateCartDisplay();
    }
}

// Add cart functionality to services page
function displayServices(services) {
    const container = document.getElementById('services-container');
    if (!container) return;
    
    // Add service selection section
    const serviceSelectionHtml = `
        <div class="row mb-5">
            <div class="col-12">
                <div class="card bg-light">
                    <div class="card-body">
                        <h5 class="card-title">
                            <i class="fas fa-plus-circle text-primary me-2"></i>
                            Add Services to Cart
                        </h5>
                        <p class="card-text">Select services you need and add them to your cart for inquiry.</p>
                        <div class="row" id="service-selection">
                            ${services.map(service => `
                                <div class="col-md-6 col-lg-4 mb-3">
                                    <div class="card h-100">
                                        <div class="card-body">
                                            <h6 class="card-title">${service.name}</h6>
                                            <p class="card-text small">${service.description}</p>
                                            <p class="text-primary fw-bold">₹${service.price.toLocaleString()}</p>
                                            <p class="text-muted small">Duration: ${service.duration}</p>
                                            <button class="btn btn-outline-primary btn-sm" onclick="cart.addService(${JSON.stringify(service).replace(/"/g, '&quot;')})">
                                                <i class="fas fa-plus"></i> Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', serviceSelectionHtml);
}

// Add CSS for cart animations
function addCartStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .cart-notification {
            animation: slideIn 0.3s ease-out;
        }
        
        .cart-icon {
            position: relative;
        }
        
        .cart-badge {
            min-width: 18px;
            height: 18px;
            font-size: 0.7em;
            line-height: 1;
            padding: 2px 4px;
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing enhanced script...');
    
    // Add cart styles
    addCartStyles();
    
    // Add cart icon to navigation
    addCartIcon();
    
    if (window.location.pathname.includes('spare-parts.html')) {
        console.log('Loading spare parts from API...');
        
        // Show loading indicator
        const container = document.getElementById('spare-parts-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading products...</p>
                </div>
            `;
        }
        
        try {
            const parts = await loadSparePartsFromAPI();
            displaySpareParts(parts);
        } catch (error) {
            console.error('Failed to initialize spare parts:', error);
            displaySpareParts(getSampleParts());
        }
    } else if (window.location.pathname.includes('services.html')) {
        console.log('Loading services for cart functionality...');
        try {
            const services = await loadServicesFromAPI();
            if (services.length > 0) {
                displayServices(services);
            }
        } catch (error) {
            console.error('Failed to load services:', error);
        }
    }
});
