// Simple script for spare parts display
console.log('Loading spare parts script...');

// API configuration
const API_BASE_URL = 'https://gowtham1.pythonanywhere.com/api';

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
        // Fallback to sample data if API is not available
        console.log('Using fallback sample data');
        return getSampleParts();
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
                    <button class="btn btn-primary btn-sm">
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing...');
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
            // Fallback to sample data
            displaySpareParts(getSampleParts());
        }
    }
});
