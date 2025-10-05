// Admin Panel JavaScript for Computer's Hospital

// Sample data storage (in real application, this would be connected to a database)
let adminData = {
    products: [
        { id: 1, name: 'Corsair Vengeance LPX 16GB DDR4', category: 'memory', price: 3500, stock: 15, status: 'active', image: 'ram-corsair.jpg' },
        { id: 2, name: 'Kingston HyperX Fury 8GB DDR4', category: 'memory', price: 1800, stock: 22, status: 'active', image: 'ram-kingston.jpg' },
        { id: 3, name: 'Samsung 970 EVO Plus 500GB NVMe SSD', category: 'storage', price: 4200, stock: 8, status: 'active', image: 'ssd-samsung.jpg' },
        { id: 4, name: 'Western Digital Blue 1TB SATA HDD', category: 'storage', price: 2800, stock: 12, status: 'active', image: 'hdd-wd.jpg' },
        { id: 5, name: 'ASUS Prime B450M-A/CSM', category: 'motherboard', price: 5500, stock: 5, status: 'low-stock', image: 'mb-asus.jpg' }
    ],
    services: [
        { id: 1, name: 'PC Repair & Maintenance', category: 'repair', basePrice: 500, duration: '2-3 hours', status: 'active' },
        { id: 2, name: 'Laptop Screen Replacement', category: 'laptop', basePrice: 800, duration: '1-2 days', status: 'active' },
        { id: 3, name: 'Virus Removal & Security', category: 'software', basePrice: 600, duration: '1-2 hours', status: 'active' },
        { id: 4, name: 'Data Recovery', category: 'recovery', basePrice: 1200, duration: '3-5 days', status: 'active' },
        { id: 5, name: 'Software Installation', category: 'software', basePrice: 400, duration: '1 hour', status: 'active' }
    ],
    requests: [
        { id: 1, customerName: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '9876543210', service: 'PC Repair', message: 'Computer not booting up', status: 'new', date: '2025-01-15', priority: 'high' },
        { id: 2, customerName: 'Priya Sharma', email: 'priya@email.com', phone: '9876543211', service: 'Laptop Screen', message: 'Laptop screen cracked', status: 'processing', date: '2025-01-14', priority: 'medium' },
        { id: 3, customerName: 'Amit Singh', email: 'amit@email.com', phone: '9876543212', service: 'Data Recovery', message: 'Hard drive crashed, need data recovery', status: 'completed', date: '2025-01-13', priority: 'high' },
        { id: 4, customerName: 'Sneha Patel', email: 'sneha@email.com', phone: '9876543213', service: 'Virus Removal', message: 'Computer running very slow', status: 'new', date: '2025-01-15', priority: 'low' }
    ],
    feedback: [
        { id: 1, customerName: 'Rohit Sharma', email: 'rohit@email.com', service: 'Laptop Repair', rating: 5, comments: 'Excellent service! Very professional team.', date: '2025-01-12', recommend: true },
        { id: 2, customerName: 'Anjali Gupta', email: 'anjali@email.com', service: 'Data Recovery', rating: 5, comments: 'Recovered all my important files. Great work!', date: '2025-01-10', recommend: true },
        { id: 3, customerName: 'Manish Shah', email: 'manish@email.com', service: 'Virus Removal', rating: 4, comments: 'Good service, completed quickly.', date: '2025-01-08', recommend: true },
        { id: 4, customerName: 'Kavya Reddy', email: 'kavya@email.com', service: 'PC Repair', rating: 5, comments: 'Fixed my computer perfectly. Highly recommended!', date: '2025-01-05', recommend: true }
    ]
};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    loadDashboard();
    setupEventListeners();
});

// Sidebar functionality
function initializeSidebar() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const mainContent = document.querySelector('.admin-main');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            // Check if we're on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('show');
                // Create/show mobile overlay
                let overlay = document.querySelector('.mobile-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.className = 'mobile-overlay';
                    document.body.appendChild(overlay);
                    
                    // Close sidebar when overlay is clicked
                    overlay.addEventListener('click', function() {
                        sidebar.classList.remove('show');
                        overlay.classList.remove('show');
                    });
                }
                overlay.classList.toggle('show');
            } else {
                // Desktop behavior
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            }
        });
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        const sidebar = document.querySelector('.admin-sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (window.innerWidth > 768) {
            // Remove mobile classes on desktop
            sidebar.classList.remove('show');
            if (overlay) {
                overlay.classList.remove('show');
            }
        }
    });

    // Handle sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close mobile sidebar if open
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.admin-sidebar');
                const overlay = document.querySelector('.mobile-overlay');
                sidebar.classList.remove('show');
                if (overlay) {
                    overlay.classList.remove('show');
                }
            }
            
            // Load corresponding content
            const page = this.getAttribute('data-page');
            if (page) {
                loadPage(page);
            }
        });
    });
}

// Load different pages
function loadPage(page) {
    const contentArea = document.getElementById('main-content');
    
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'services':
            loadServices();
            break;
        case 'requests':
            loadRequests();
            break;
        case 'feedback':
            loadFeedback();
            break;
        default:
            loadDashboard();
    }
}

// Load dashboard
function loadDashboard() {
    const contentArea = document.getElementById('main-content');
    const totalProducts = adminData.products.length;
    const totalServices = adminData.services.length;
    const newRequests = adminData.requests.filter(r => r.status === 'new').length;
    const avgRating = (adminData.feedback.reduce((sum, f) => sum + f.rating, 0) / adminData.feedback.length).toFixed(1);
    
    contentArea.innerHTML = `
        <div class="row mb-4">
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="stats-card text-center">
                    <div class="icon text-primary">
                        <i class="fas fa-box"></i>
                    </div>
                    <h3>${totalProducts}</h3>
                    <p>Total Products</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="stats-card text-center">
                    <div class="icon text-success">
                        <i class="fas fa-tools"></i>
                    </div>
                    <h3>${totalServices}</h3>
                    <p>Services Offered</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="stats-card text-center">
                    <div class="icon text-warning">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h3>${newRequests}</h3>
                    <p>New Requests</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-4">
                <div class="stats-card text-center">
                    <div class="icon text-info">
                        <i class="fas fa-star"></i>
                    </div>
                    <h3>${avgRating}</h3>
                    <p>Average Rating</p>
                </div>
            </div>
        </div>
        
        <div class="row">
            <div class="col-lg-6 mb-4">
                <div class="admin-table">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Recent Requests</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${adminData.requests.slice(0, 5).map(request => `
                                        <tr>
                                            <td>${request.customerName}</td>
                                            <td>${request.service}</td>
                                            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                                            <td>${request.date}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-lg-6 mb-4">
                <div class="admin-table">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">Recent Feedback</h5>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Rating</th>
                                        <th>Service</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${adminData.feedback.slice(0, 5).map(feedback => `
                                        <tr>
                                            <td>${feedback.customerName}</td>
                                            <td>
                                                <div class="text-warning">
                                                    ${'★'.repeat(feedback.rating)}${'☆'.repeat(5-feedback.rating)}
                                                </div>
                                            </td>
                                            <td>${feedback.service}</td>
                                            <td>${feedback.date}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load products management
function loadProducts() {
    const contentArea = document.getElementById('main-content');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Product Management</h2>
            <button class="btn btn-admin-primary" onclick="showAddProductModal()">
                <i class="fas fa-plus me-2"></i>Add Product
            </button>
        </div>
        
        <div class="search-filter-bar">
            <div class="row">
                <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="Search products..." id="productSearch">
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="categoryFilter">
                        <option value="">All Categories</option>
                        <option value="memory">Memory</option>
                        <option value="storage">Storage</option>
                        <option value="motherboard">Motherboard</option>
                        <option value="graphics">Graphics</option>
                        <option value="accessories">Accessories</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select class="form-select" id="statusFilter">
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="low-stock">Low Stock</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="admin-table">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody">
                        ${renderProductsTable()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    setupProductFilters();
}

// Render products table
function renderProductsTable(filteredProducts = adminData.products) {
    return filteredProducts.map(product => `
        <tr>
            <td>${product.id}</td>
            <td><img src="https://via.placeholder.com/50x50/007bff/ffffff?text=IMG" class="image-preview" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td><span class="badge bg-secondary">${product.category}</span></td>
            <td>₹${product.price}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge status-${product.status.replace('-', '')}">${product.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load services management
function loadServices() {
    const contentArea = document.getElementById('main-content');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Service Management</h2>
            <button class="btn btn-admin-primary" onclick="showAddServiceModal()">
                <i class="fas fa-plus me-2"></i>Add Service
            </button>
        </div>
        
        <div class="admin-table">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service Name</th>
                            <th>Category</th>
                            <th>Base Price</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${adminData.services.map(service => `
                            <tr>
                                <td>${service.id}</td>
                                <td>${service.name}</td>
                                <td><span class="badge bg-info">${service.category}</span></td>
                                <td>₹${service.basePrice}</td>
                                <td>${service.duration}</td>
                                <td><span class="status-badge status-${service.status}">${service.status}</span></td>
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn btn-sm btn-outline-primary" onclick="editService(${service.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger" onclick="deleteService(${service.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Load customer requests
function loadRequests() {
    const contentArea = document.getElementById('main-content');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Customer Requests</h2>
            <div>
                <select class="form-select d-inline-block w-auto" id="requestStatusFilter">
                    <option value="">All Status</option>
                    <option value="new">New</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
        </div>
        
        <div class="admin-table">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Contact</th>
                            <th>Service</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="requestsTableBody">
                        ${renderRequestsTable()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    setupRequestFilters();
}

// Render requests table
function renderRequestsTable(filteredRequests = adminData.requests) {
    return filteredRequests.map(request => `
        <tr>
            <td>${request.id}</td>
            <td>
                <div>
                    <strong>${request.customerName}</strong><br>
                    <small class="text-muted">${request.email}</small>
                </div>
            </td>
            <td>${request.phone}</td>
            <td>${request.service}</td>
            <td><i class="fas fa-circle priority-${request.priority}"></i> ${request.priority}</td>
            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
            <td>${request.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="viewRequest(${request.id})" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="updateRequestStatus(${request.id})" title="Update Status">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Load feedback management
function loadFeedback() {
    const contentArea = document.getElementById('main-content');
    
    contentArea.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Customer Feedback</h2>
            <div>
                <select class="form-select d-inline-block w-auto" id="ratingFilter">
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>
        </div>
        
        <div class="admin-table">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Rating</th>
                            <th>Comments</th>
                            <th>Recommend</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="feedbackTableBody">
                        ${renderFeedbackTable()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    setupFeedbackFilters();
}

// Render feedback table
function renderFeedbackTable(filteredFeedback = adminData.feedback) {
    return filteredFeedback.map(feedback => `
        <tr>
            <td>${feedback.id}</td>
            <td>
                <div>
                    <strong>${feedback.customerName}</strong><br>
                    <small class="text-muted">${feedback.email}</small>
                </div>
            </td>
            <td>${feedback.service}</td>
            <td>
                <div class="text-warning">
                    ${'★'.repeat(feedback.rating)}${'☆'.repeat(5-feedback.rating)}
                </div>
            </td>
            <td>
                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${feedback.comments}
                </div>
            </td>
            <td>
                ${feedback.recommend ? 
                    '<span class="badge bg-success">Yes</span>' : 
                    '<span class="badge bg-secondary">No</span>'
                }
            </td>
            <td>${feedback.date}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-info" onclick="viewFeedback(${feedback.id})" title="View Full">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-primary" onclick="replyToFeedback(${feedback.id})" title="Reply">
                        <i class="fas fa-reply"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add any global event listeners here
}

// Filter functions
function setupProductFilters() {
    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryValue = categoryFilter.value;
        const statusValue = statusFilter.value;
        
        const filtered = adminData.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryValue || product.category === categoryValue;
            const matchesStatus = !statusValue || product.status === statusValue;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        document.getElementById('productsTableBody').innerHTML = renderProductsTable(filtered);
    }
    
    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    statusFilter.addEventListener('change', filterProducts);
}

function setupRequestFilters() {
    const statusFilter = document.getElementById('requestStatusFilter');
    
    statusFilter.addEventListener('change', function() {
        const statusValue = this.value;
        const filtered = statusValue ? 
            adminData.requests.filter(request => request.status === statusValue) : 
            adminData.requests;
        
        document.getElementById('requestsTableBody').innerHTML = renderRequestsTable(filtered);
    });
}

function setupFeedbackFilters() {
    const ratingFilter = document.getElementById('ratingFilter');
    
    ratingFilter.addEventListener('change', function() {
        const ratingValue = this.value;
        const filtered = ratingValue ? 
            adminData.feedback.filter(feedback => feedback.rating == ratingValue) : 
            adminData.feedback;
        
        document.getElementById('feedbackTableBody').innerHTML = renderFeedbackTable(filtered);
    });
}

// Modal and action functions (to be implemented)
function showAddProductModal() {
    alert('Add Product Modal - To be implemented with full form');
}

function editProduct(id) {
    alert(`Edit Product ${id} - To be implemented`);
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        adminData.products = adminData.products.filter(p => p.id !== id);
        loadProducts();
    }
}

function showAddServiceModal() {
    alert('Add Service Modal - To be implemented with full form');
}

function editService(id) {
    alert(`Edit Service ${id} - To be implemented`);
}

function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        adminData.services = adminData.services.filter(s => s.id !== id);
        loadServices();
    }
}

function viewRequest(id) {
    const request = adminData.requests.find(r => r.id === id);
    alert(`Request Details:\n\nCustomer: ${request.customerName}\nEmail: ${request.email}\nPhone: ${request.phone}\nService: ${request.service}\nMessage: ${request.message}\nStatus: ${request.status}\nPriority: ${request.priority}\nDate: ${request.date}`);
}

function updateRequestStatus(id) {
    const newStatus = prompt('Enter new status (new, processing, completed, cancelled):');
    if (newStatus && ['new', 'processing', 'completed', 'cancelled'].includes(newStatus)) {
        const request = adminData.requests.find(r => r.id === id);
        request.status = newStatus;
        loadRequests();
    }
}

function viewFeedback(id) {
    const feedback = adminData.feedback.find(f => f.id === id);
    alert(`Feedback Details:\n\nCustomer: ${feedback.customerName}\nEmail: ${feedback.email}\nService: ${feedback.service}\nRating: ${feedback.rating}/5 stars\nComments: ${feedback.comments}\nRecommends: ${feedback.recommend ? 'Yes' : 'No'}\nDate: ${feedback.date}`);
}

function replyToFeedback(id) {
    const reply = prompt('Enter your reply to this feedback:');
    if (reply) {
        alert('Reply sent successfully! (In real application, this would send an email)');
    }
}
