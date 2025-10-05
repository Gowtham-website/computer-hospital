// Admin Panel JavaScript for Computer's Hospital

// Auto-detect API base URL
const API_BASE_URL = 'https://gowtham1.pythonanywhere.com/api'
let authToken = localStorage.getItem('adminToken');

function updateDashboardStats(stats) {
    const elements = {
        'totalProducts': stats.total_parts,
        'totalServices': stats.total_services,
        'pendingRequests': stats.pending_requests,
        'totalFeedback': stats.pending_feedback
    };
    
    for (const [id, value] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || '0';
        }
    }
}

// API Helper Functions
async function fetchAPI(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('Fetching:', url);
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
            console.log('Using auth token:', authToken.substring(0, 20) + '...');
        }
        
        const response = await fetch(url, {
            headers,
            ...options
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.status === 401) {
            // Token expired or invalid
            console.warn('Authentication failed, redirecting to login');
            localStorage.removeItem('adminToken');
            authToken = null;
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
            return;
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Admin Login
async function adminLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        submitBtn.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
            localStorage.setItem('adminToken', data.token);
            authToken = data.token;
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Check authentication
function checkAuth() {
    console.log('Checking authentication, token:', authToken ? 'Present' : 'Missing');
    if (!authToken && !window.location.pathname.includes('login.html')) {
        console.log('No token found, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

// Dashboard Functions
async function loadDashboardStats() {
    try {
        const stats = await fetchAPI('/admin/stats');
        updateDashboardStats(stats);
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

// Load recent activity for dashboard
async function loadRecentActivity() {
    try {
        console.log('Loading recent activity...');
        
        // Get recent contact requests and feedback
        const [requests, feedback] = await Promise.all([
            fetchAPI('/admin/contact-requests').catch(() => []),
            fetchAPI('/admin/feedback').catch(() => [])
        ]);
        
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;
        
        // Combine and sort by date
        const allActivity = [
            ...requests.slice(0, 3).map(req => ({
                type: 'request',
                title: `New contact request from ${req.name}`,
                description: req.message.substring(0, 100) + '...',
                time: req.created_at || 'Recently',
                icon: 'fa-envelope',
                color: 'text-primary'
            })),
            ...feedback.slice(0, 3).map(fb => ({
                type: 'feedback',
                title: `New feedback from ${fb.name}`,
                description: `Rating: ${fb.rating}/5 - ${fb.message.substring(0, 80)}...`,
                time: fb.created_at || 'Recently',
                icon: 'fa-star',
                color: 'text-warning'
            }))
        ];
        
        if (allActivity.length === 0) {
            recentActivity.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-info-circle fa-2x mb-3"></i>
                    <p>No recent activity to display</p>
                </div>
            `;
            return;
        }
        
        recentActivity.innerHTML = `
            <div class="list-group list-group-flush">
                ${allActivity.slice(0, 5).map(activity => `
                    <div class="list-group-item">
                        <div class="d-flex align-items-start">
                            <i class="fas ${activity.icon} ${activity.color} me-3 mt-1"></i>
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${activity.title}</h6>
                                <p class="mb-1 text-muted small">${activity.description}</p>
                                <small class="text-muted">${activity.time}</small>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="text-center mt-3">
                <a href="#" onclick="showSection('requests')" class="btn btn-sm btn-outline-primary me-2">View All Requests</a>
                <a href="#" onclick="showSection('feedback')" class="btn btn-sm btn-outline-warning">View All Feedback</a>
            </div>
        `;
        
    } catch (error) {
        console.error('Failed to load recent activity:', error);
        const recentActivity = document.getElementById('recentActivity');
        if (recentActivity) {
            recentActivity.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p>Failed to load recent activity</p>
                </div>
            `;
        }
    }
}

// Spare Parts Management
async function loadSpareParts() {
    try {
        console.log('Loading spare parts...');
        
        // Wait a moment to ensure the DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const parts = await fetchAPI('/spare-parts');
        console.log('Received parts data:', parts);
        
        if (Array.isArray(parts) && parts.length > 0) {
            displayPartsTable(parts);
        } else if (Array.isArray(parts) && parts.length === 0) {
            const tbody = document.getElementById('parts-table-body');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
            }
        } else {
            console.error('Expected array but received:', typeof parts, parts);
            const tbody = document.getElementById('parts-table-body');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error: Invalid data format</td></tr>';
            }
        }
    } catch (error) {
        console.error('Failed to load spare parts:', error);
        const tbody = document.getElementById('parts-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load products. Please check your connection and try again.</td></tr>';
        }
    }
}

function displayPartsTable(parts) {
    const tbody = document.getElementById('parts-table-body');
    if (!tbody) {
        console.error('parts-table-body element not found');
        console.log('Available tbody elements:', document.querySelectorAll('tbody'));
        return;
    }
    
    console.log('Displaying parts table with', parts.length, 'items');
    
    if (parts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
        return;
    }
    
    tbody.innerHTML = parts.map(part => `
        <tr>
            <td>${part.id}</td>
            <td>${part.name}</td>
            <td>${part.category}</td>
            <td>₹${part.price ? part.price.toLocaleString() : 'N/A'}</td>
            <td>${part.stock || 0}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editPart(${part.id})" title="Edit Product">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deletePart(${part.id})" title="Delete Product">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function addPart(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const partData = {
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        image: formData.get('image') || 'placeholder.jpg',
        description: formData.get('description'),
        stock: parseInt(formData.get('stock'))
    };
    
    try {
        const response = await fetchAPI('/admin/spare-parts', {
            method: 'POST',
            body: JSON.stringify(partData)
        });
        
        if (response.success) {
            alert('Part added successfully!');
            form.reset();
            closeModal('addPartModal');
            loadSpareParts();
        }
    } catch (error) {
        console.error('Error adding part:', error);
        alert('Failed to add part');
    }
}

async function deletePart(partId) {
    if (!confirm('Are you sure you want to delete this part?')) return;
    
    try {
        const response = await fetchAPI(`/admin/spare-parts/${partId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('Part deleted successfully!');
            loadSpareParts();
        }
    } catch (error) {
        console.error('Error deleting part:', error);
        alert('Failed to delete part');
    }
}

// Edit part function
async function editPart(partId) {
    try {
        // Get current part data
        const parts = await fetchAPI('/spare-parts');
        const part = parts.find(p => p.id === partId);
        
        if (!part) {
            alert('Product not found!');
            return;
        }
        
        // Create edit modal
        const modalHtml = `
            <div class="modal fade" id="editProductModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Product</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editProductForm">
                                <input type="hidden" id="editProductId" value="${part.id}">
                                <div class="mb-3">
                                    <label for="editProductName" class="form-label">Product Name</label>
                                    <input type="text" class="form-control" id="editProductName" value="${part.name}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editProductCategory" class="form-label">Category</label>
                                    <select class="form-select" id="editProductCategory" required>
                                        <option value="Processors" ${part.category === 'Processors' ? 'selected' : ''}>Processors</option>
                                        <option value="Graphics Cards" ${part.category === 'Graphics Cards' ? 'selected' : ''}>Graphics Cards</option>
                                        <option value="Memory" ${part.category === 'Memory' ? 'selected' : ''}>Memory</option>
                                        <option value="Storage" ${part.category === 'Storage' ? 'selected' : ''}>Storage</option>
                                        <option value="Motherboards" ${part.category === 'Motherboards' ? 'selected' : ''}>Motherboards</option>
                                        <option value="Power Supply" ${part.category === 'Power Supply' ? 'selected' : ''}>Power Supply</option>
                                    </select>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editProductPrice" class="form-label">Price (₹)</label>
                                            <input type="number" class="form-control" id="editProductPrice" value="${part.price}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editProductStock" class="form-label">Stock</label>
                                            <input type="number" class="form-control" id="editProductStock" value="${part.stock}" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="editProductDescription" class="form-label">Description</label>
                                    <textarea class="form-control" id="editProductDescription" rows="3">${part.description}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="editProductImage" class="form-label">Image URL</label>
                                    <input type="url" class="form-control" id="editProductImage" value="${part.image}">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="saveEditedProduct()">Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editProductModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading product for edit:', error);
        alert('Failed to load product data');
    }
}

// Save edited product
async function saveEditedProduct() {
    // Prevent multiple submissions
    const saveButton = document.querySelector('#editProductModal button[onclick="saveEditedProduct()"]');
    if (saveButton.disabled) return;
    
    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    
    try {
        const productId = document.getElementById('editProductId').value;
        const productData = {
            name: document.getElementById('editProductName').value,
            category: document.getElementById('editProductCategory').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            stock: parseInt(document.getElementById('editProductStock').value),
            description: document.getElementById('editProductDescription').value,
            image: document.getElementById('editProductImage').value
        };
        
        const response = await fetchAPI(`/admin/spare-parts/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
        
        if (response.success) {
            console.log('Product updated successfully, staying on products page');
            alert('Product updated successfully!');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
            modal.hide();
            
            // Reload products
            console.log('Reloading products data...');
            loadSpareParts();
        } else {
            alert('Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product');
    } finally {
        // Re-enable button
        saveButton.disabled = false;
        saveButton.textContent = 'Save Changes';
    }
}

// Services Management
async function loadServices() {
    try {
        const services = await fetchAPI('/services');
        displayServicesTable(services);
    } catch (error) {
        console.error('Failed to load services:', error);
    }
}

function displayServicesTable(services) {
    const tbody = document.getElementById('services-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = services.map(service => `
        <tr>
            <td>${service.id}</td>
            <td>${service.name}</td>
            <td>₹${service.price.toLocaleString()}</td>
            <td>${service.duration}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editService(${service.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function addService(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const serviceData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        duration: formData.get('duration')
    };
    
    try {
        const response = await fetchAPI('/admin/services', {
            method: 'POST',
            body: JSON.stringify(serviceData)
        });
        
        if (response.success) {
            alert('Service added successfully!');
            form.reset();
            closeModal('addServiceModal');
            loadServices();
        }
    } catch (error) {
        console.error('Error adding service:', error);
        alert('Failed to add service');
    }
}

async function deleteService(serviceId) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
        const response = await fetchAPI(`/admin/services/${serviceId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('Service deleted successfully!');
            loadServices();
        }
    } catch (error) {
        console.error('Error deleting service:', error);
        alert('Failed to delete service');
    }
}

async function editService(serviceId) {
    console.log('editService called with ID:', serviceId);
    try {
        console.log('Fetching service data...');
        const service = await fetchAPI(`/admin/services/${serviceId}`);
        console.log('Service data received:', service);
        
        const modalHtml = `
            <div class="modal fade" id="editServiceModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Service</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editServiceForm">
                                <input type="hidden" id="editServiceId" value="${service.id}">
                                <div class="mb-3">
                                    <label for="editServiceName" class="form-label">Service Name *</label>
                                    <input type="text" class="form-control" id="editServiceName" value="${service.name}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editServiceDescription" class="form-label">Description *</label>
                                    <textarea class="form-control" id="editServiceDescription" rows="3" required>${service.description}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="editServicePrice" class="form-label">Price (₹) *</label>
                                    <input type="number" class="form-control" id="editServicePrice" step="0.01" value="${service.price}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editServiceDuration" class="form-label">Duration *</label>
                                    <input type="text" class="form-control" id="editServiceDuration" value="${service.duration}" placeholder="e.g., 2-3 hours" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="updateService()">
                                <i class="fas fa-save me-1"></i>Update Service
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editServiceModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editServiceModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading service:', error);
        alert('Error loading service details');
    }
}

async function updateService() {
    // Prevent multiple submissions
    const updateButton = document.querySelector('#editServiceModal button[onclick="updateService()"]');
    if (updateButton.disabled) return;
    
    updateButton.disabled = true;
    updateButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
    
    try {
        const serviceId = document.getElementById('editServiceId').value;
        const formData = {
            name: document.getElementById('editServiceName').value,
            description: document.getElementById('editServiceDescription').value,
            price: parseFloat(document.getElementById('editServicePrice').value),
            duration: document.getElementById('editServiceDuration').value
        };
        
        // Validate required fields
        if (!formData.name || !formData.description || !formData.price || !formData.duration) {
            alert('Please fill in all required fields');
            updateButton.disabled = false;
            updateButton.innerHTML = '<i class="fas fa-save me-1"></i>Update Service';
            return;
        }
        
        const response = await fetchAPI(`/admin/services/${serviceId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        if (response.success) {
            alert('Service updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('editServiceModal')).hide();
            loadServices(); // Reload the services list
        } else {
            alert('Error updating service: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating service:', error);
        alert('Error updating service');
    } finally {
        // Re-enable button
        updateButton.disabled = false;
        updateButton.innerHTML = '<i class="fas fa-save me-1"></i>Update Service';
    }
}

// Contact Requests Management
async function loadContactRequests() {
    try {
        const requests = await fetchAPI('/admin/contact-requests');
        displayRequestsTable(requests);
    } catch (error) {
        console.error('Failed to load contact requests:', error);
    }
}

function displayRequestsTable(requests) {
    const tbody = document.getElementById('requests-table-body');
    if (!tbody) return;
    
    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">No requests found</td></tr>';
        return;
    }
    
    tbody.innerHTML = requests.map(request => `
        <tr>
            <td>${request.id}</td>
            <td>${request.name}</td>
            <td>${request.email}</td>
            <td>${request.phone || 'N/A'}</td>
            <td>${request.service || 'General'}</td>
            <td><span class="badge bg-${getStatusColor(request.status)}">${request.status}</span></td>
            <td>${new Date(request.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="viewRequest(${request.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <select class="form-select form-select-sm d-inline-block me-1" style="width: auto;" onchange="updateRequestStatus(${request.id}, this.value)">
                    <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="in-progress" ${request.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
                <button class="btn btn-sm btn-danger" onclick="deleteRequest(${request.id})" title="Delete Request">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateRequestStatus(requestId, status) {
    try {
        const response = await fetchAPI(`/admin/contact-requests/${requestId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        if (response.success) {
            loadContactRequests();
        }
    } catch (error) {
        console.error('Error updating request status:', error);
        alert('Failed to update status');
    }
}

async function viewRequest(requestId) {
    try {
        // Fetch full request details
        const request = await fetchAPI(`/admin/contact-requests/${requestId}`);
        
        // Populate modal with request data
        document.getElementById('requestModalId').textContent = request.id;
        document.getElementById('requestModalDate').textContent = new Date(request.created_at).toLocaleString();
        document.getElementById('requestModalName').textContent = request.name;
        document.getElementById('requestModalEmail').textContent = request.email;
        document.getElementById('requestModalPhone').textContent = request.phone || 'Not provided';
        document.getElementById('requestModalService').textContent = request.service || 'General Inquiry';
        document.getElementById('requestModalMessage').textContent = request.message;
        document.getElementById('requestModalNotes').value = request.admin_notes || '';
        document.getElementById('requestModalPriority').value = request.priority || 'medium';
        
        // Set status badge
        const statusBadge = document.getElementById('requestModalStatus');
        statusBadge.textContent = request.status;
        statusBadge.className = `badge bg-${getStatusColor(request.status)}`;
        
        // Store request ID for modal functions
        document.getElementById('viewRequestModal').setAttribute('data-request-id', requestId);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('viewRequestModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading request details:', error);
        alert('Failed to load request details');
    }
}

// Feedback Management
async function loadFeedback() {
    try {
        const feedback = await fetchAPI('/admin/feedback');
        displayFeedbackTable(feedback);
    } catch (error) {
        console.error('Failed to load feedback:', error);
    }
}

function displayFeedbackTable(feedback) {
    const tbody = document.getElementById('feedback-table-body');
    if (!tbody) return;
    
    if (feedback.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No feedback found</td></tr>';
        return;
    }
    
    tbody.innerHTML = feedback.map(fb => `
        <tr>
            <td>${fb.id}</td>
            <td>${fb.name}</td>
            <td>${fb.email}</td>
            <td>
                <div class="text-warning">
                    ${'★'.repeat(fb.rating)}${'☆'.repeat(5 - fb.rating)}
                </div>
            </td>
            <td><span class="badge bg-${getStatusColor(fb.status)}">${fb.status}</span></td>
            <td>${new Date(fb.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-info me-1" onclick="viewFeedback(${fb.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <select class="form-select form-select-sm d-inline-block me-1" style="width: auto;" onchange="updateFeedbackStatus(${fb.id}, this.value)">
                    <option value="pending" ${fb.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="approved" ${fb.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="rejected" ${fb.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
                <button class="btn btn-sm btn-danger" onclick="deleteFeedback(${fb.id})" title="Delete Feedback">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function updateFeedbackStatus(feedbackId, status) {
    try {
        const response = await fetchAPI(`/admin/feedback/${feedbackId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        
        if (response.success) {
            loadFeedback();
        }
    } catch (error) {
        console.error('Error updating feedback status:', error);
        alert('Failed to update status');
    }
}

async function viewFeedback(feedbackId) {
    try {
        // Fetch full feedback details
        const feedback = await fetchAPI(`/admin/feedback/${feedbackId}`);
        
        // Populate modal with feedback data
        document.getElementById('feedbackModalId').textContent = feedback.id;
        document.getElementById('feedbackModalDate').textContent = new Date(feedback.created_at).toLocaleString();
        document.getElementById('feedbackModalName').textContent = feedback.name;
        document.getElementById('feedbackModalEmail').textContent = feedback.email;
        document.getElementById('feedbackModalService').textContent = feedback.service_type || 'Not specified';
        document.getElementById('feedbackModalServiceDate').textContent = feedback.service_date ? 
            new Date(feedback.service_date).toLocaleDateString() : 'Not specified';
        document.getElementById('feedbackModalMessage').textContent = feedback.message;
        document.getElementById('feedbackModalNotes').value = feedback.admin_notes || '';
        
        // Set rating display
        const rating = feedback.rating || 0;
        document.getElementById('feedbackModalRating').textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        document.getElementById('feedbackModalRatingText').textContent = `${rating}/5 stars`;
        
        // Set detailed ratings if available
        document.getElementById('feedbackModalQuality').textContent = 
            feedback.quality_rating ? `${feedback.quality_rating}/5` : 'Not rated';
        document.getElementById('feedbackModalSpeed').textContent = 
            feedback.speed_rating ? `${feedback.speed_rating}/5` : 'Not rated';
        document.getElementById('feedbackModalPrice').textContent = 
            feedback.price_rating ? `${feedback.price_rating}/5` : 'Not rated';
        
        // Set extended feedback if available
        document.getElementById('feedbackModalPositive').textContent = 
            feedback.positive_aspects || 'Not provided';
        document.getElementById('feedbackModalImprovements').textContent = 
            feedback.improvements || 'Not provided';
        
        // Set recommendation status
        const recommendBadge = document.getElementById('feedbackModalRecommend');
        if (feedback.recommend === 'yes') {
            recommendBadge.textContent = 'Yes';
            recommendBadge.className = 'badge bg-success';
        } else if (feedback.recommend === 'no') {
            recommendBadge.textContent = 'No';
            recommendBadge.className = 'badge bg-danger';
        } else if (feedback.recommend === 'maybe') {
            recommendBadge.textContent = 'Maybe';
            recommendBadge.className = 'badge bg-warning';
        } else {
            recommendBadge.textContent = 'Not specified';
            recommendBadge.className = 'badge bg-secondary';
        }
        
        // Set testimonial permission
        document.getElementById('feedbackModalTestimonial').textContent = 
            feedback.allow_testimonial ? 'Yes' : 'No';
        
        // Set status badge
        const statusBadge = document.getElementById('feedbackModalStatus');
        statusBadge.textContent = feedback.status;
        statusBadge.className = `badge bg-${getStatusColor(feedback.status)}`;
        
        // Store feedback ID for modal functions
        document.getElementById('viewFeedbackModal').setAttribute('data-feedback-id', feedbackId);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('viewFeedbackModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading feedback details:', error);
        alert('Failed to load feedback details');
    }
}

// Utility Functions
function getStatusColor(status) {
    switch (status) {
        case 'pending': return 'warning';
        case 'approved': return 'success';
        case 'completed': return 'success';
        case 'in-progress': return 'info';
        case 'rejected': return 'danger';
        default: return 'secondary';
    }
}

function showSection(sectionName) {
    // Update sidebar active state
    const menuItems = document.querySelectorAll('.sidebar-menu a');
    menuItems.forEach(item => item.classList.remove('active'));
    
    const activeItem = document.querySelector(`[data-page="${sectionName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle && activeItem) {
        pageTitle.textContent = activeItem.textContent.trim();
    }
    
    // Load content for the section
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    switch (sectionName) {
        case 'dashboard':
            loadDashboardContent();
            break;
        case 'products':
            loadProductsContent();
            break;
        case 'services':
            loadServicesContent();
            break;
        case 'requests':
            loadRequestsContent();
            break;
        case 'feedback':
            loadFeedbackContent();
            break;
        case 'team':
            loadTeamContent();
            break;
        default:
            mainContent.innerHTML = '<div class="alert alert-info">Select a section from the sidebar to view content.</div>';
    }
}

// Content loading functions for different sections
function loadDashboardContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="card bg-primary text-white clickable-card" onclick="showSection('products')" style="cursor: pointer;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h5 class="card-title">Total Products</h5>
                                <h2 id="totalProducts">-</h2>
                            </div>
                            <i class="fas fa-box fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-success text-white clickable-card" onclick="showSection('services')" style="cursor: pointer;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h5 class="card-title">Total Services</h5>
                                <h2 id="totalServices">-</h2>
                            </div>
                            <i class="fas fa-tools fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-warning text-white clickable-card" onclick="showSection('requests')" style="cursor: pointer;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h5 class="card-title">Pending Requests</h5>
                                <h2 id="pendingRequests">-</h2>
                            </div>
                            <i class="fas fa-envelope fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-4">
                <div class="card bg-info text-white clickable-card" onclick="showSection('feedback')" style="cursor: pointer;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h5 class="card-title">Total Feedback</h5>
                                <h2 id="totalFeedback">-</h2>
                            </div>
                            <i class="fas fa-star fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            .clickable-card {
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .clickable-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
            }
        </style>
        
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h5>Recent Activity</h5>
                    </div>
                    <div class="card-body">
                        <div id="recentActivity">Loading...</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    loadDashboardStats();
    loadRecentActivity();
}

function loadProductsContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>Product Management</h5>
                <div>
                    <button class="btn btn-warning me-2" onclick="testAddProductModal()">
                        <i class="fas fa-test me-1"></i>Test Modal
                    </button>
                    <button class="btn btn-primary" onclick="console.log('Button clicked!'); showAddProductModal();">
                        <i class="fas fa-plus me-1"></i>Add Product
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="parts-table-body">
                            <tr><td colspan="6" class="text-center">Loading products...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Add a small delay to ensure DOM is ready, then load data
    setTimeout(() => {
        loadSpareParts();
    }, 200);
}

function loadServicesContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>Service Management</h5>
                <button class="btn btn-primary" onclick="showAddServiceModal()">
                    <i class="fas fa-plus me-1"></i>Add Service
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Duration</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="services-table-body">
                            <tr><td colspan="6" class="text-center">Loading services...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    loadServices();
}

function loadRequestsContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5>Customer Requests</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="requests-table-body">
                            <tr><td colspan="8" class="text-center">Loading requests...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    loadContactRequests();
}

function loadFeedbackContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5>Customer Feedback</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Rating</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="feedback-table-body">
                            <tr><td colspan="7" class="text-center">Loading feedback...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    loadFeedback();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    }
}

// Test function to verify modal works
function testAddProductModal() {
    console.log('Test function called');
    alert('Test function works!');
    showAddProductModal();
}

// Show add product modal
function showAddProductModal() {
    console.log('showAddProductModal called');
    const modalHtml = `
        <div class="modal fade" id="addProductModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Product</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addProductForm">
                            <div class="mb-3">
                                <label for="addProductName" class="form-label">Product Name</label>
                                <input type="text" class="form-control" name="name" id="addProductName" required>
                            </div>
                            <div class="mb-3">
                                <label for="addProductCategory" class="form-label">Category</label>
                                <select class="form-select" name="category" id="addProductCategory" required>
                                    <option value="">Select Category</option>
                                    <option value="Processors">Processors</option>
                                    <option value="Graphics Cards">Graphics Cards</option>
                                    <option value="Memory">Memory</option>
                                    <option value="Storage">Storage</option>
                                    <option value="Motherboards">Motherboards</option>
                                    <option value="Power Supply">Power Supply</option>
                                </select>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="addProductPrice" class="form-label">Price (₹)</label>
                                        <input type="number" class="form-control" name="price" id="addProductPrice" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="addProductStock" class="form-label">Stock</label>
                                        <input type="number" class="form-control" name="stock" id="addProductStock" required>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="addProductDescription" class="form-label">Description</label>
                                <textarea class="form-control" name="description" id="addProductDescription" rows="3"></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="addProductImage" class="form-label">Image URL</label>
                                <input type="url" class="form-control" name="image" id="addProductImage">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitAddProduct()">Add Product</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('Removing existing modal if any');
    // Remove existing modal if any
    const existingModal = document.getElementById('addProductModal');
    if (existingModal) existingModal.remove();
    
    console.log('Adding modal to page');
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    console.log('Showing modal');
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
    modal.show();
    console.log('Modal should be visible now');
}

// Submit add product form
async function submitAddProduct() {
    console.log('submitAddProduct called');
    
    // Prevent multiple submissions
    const addButton = document.querySelector('#addProductModal button[onclick="submitAddProduct()"]');
    if (addButton.disabled) return;
    
    addButton.disabled = true;
    addButton.textContent = 'Adding...';
    
    try {
        const formData = {
            name: document.getElementById('addProductName').value,
            category: document.getElementById('addProductCategory').value,
            price: parseFloat(document.getElementById('addProductPrice').value),
            stock: parseInt(document.getElementById('addProductStock').value),
            description: document.getElementById('addProductDescription').value,
            image: document.getElementById('addProductImage').value || 'https://via.placeholder.com/300x300'
        };
        
        console.log('Form data:', formData);
        
        // Validate required fields
        if (!formData.name || !formData.category || !formData.price || !formData.stock) {
            console.log('Validation failed');
            alert('Please fill in all required fields');
            return;
        }
        
        console.log('Validation passed, sending request...');
        const response = await fetchAPI('/admin/spare-parts', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        console.log('Response received:', response);
        
        if (response.success) {
            console.log('Product added successfully, staying on products page');
            alert('Product added successfully!');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
            modal.hide();
            
            // Stay on products page and reload data
            console.log('Reloading products data...');
            loadSpareParts();
        } else {
            console.log('Add product failed');
            alert('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Failed to add product');
    } finally {
        // Re-enable button
        addButton.disabled = false;
        addButton.textContent = 'Add Product';
    }
}

// Show add service modal
function showAddServiceModal() {
    const modalHtml = `
        <div class="modal fade" id="addServiceModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add New Service</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="addServiceForm">
                            <div class="mb-3">
                                <label for="addServiceName" class="form-label">Service Name</label>
                                <input type="text" class="form-control" name="name" id="addServiceName" required>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="addServicePrice" class="form-label">Price (₹)</label>
                                        <input type="number" class="form-control" name="price" id="addServicePrice" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="addServiceDuration" class="form-label">Duration</label>
                                        <input type="text" class="form-control" name="duration" id="addServiceDuration" placeholder="e.g., 2-3 hours">
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label for="addServiceDescription" class="form-label">Description</label>
                                <textarea class="form-control" name="description" id="addServiceDescription" rows="3" required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitAddService()">Add Service</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addServiceModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addServiceModal'));
    modal.show();
}

// Submit add service form
async function submitAddService() {
    // Prevent multiple submissions
    const addButton = document.querySelector('#addServiceModal button[onclick="submitAddService()"]');
    if (addButton.disabled) return;
    
    addButton.disabled = true;
    addButton.textContent = 'Adding...';
    
    try {
        const formData = {
            name: document.getElementById('addServiceName').value,
            price: parseFloat(document.getElementById('addServicePrice').value),
            duration: document.getElementById('addServiceDuration').value,
            description: document.getElementById('addServiceDescription').value
        };
        
        // Validate required fields
        if (!formData.name || !formData.price || !formData.description) {
            alert('Please fill in all required fields');
            return;
        }
        
        const response = await fetchAPI('/admin/services', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (response.success) {
            console.log('Service added successfully, staying on services page');
            alert('Service added successfully!');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addServiceModal'));
            modal.hide();
            
            // Stay on services page and reload data
            console.log('Reloading services data...');
            loadServices();
        } else {
            alert('Failed to add service');
        }
    } catch (error) {
        console.error('Error adding service:', error);
        alert('Failed to add service');
    } finally {
        // Re-enable button
        addButton.disabled = false;
        addButton.textContent = 'Add Service';
    }
}

// Team Management Functions
function loadTeamContent() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5>Meet Our Expert Team Managements</h5>
                <button class="btn btn-primary" onclick="showAddTeamModal()">
                    <i class="fas fa-plus me-1"></i>Add Team Member
                </button>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Team</th>
                                <th>Position</th>
                                <th>Area of Expertise</th>
                                <th>Role</th>
                                <th>Website Display</th>
                                <th>Experience</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="team-table-body">
                            <tr><td colspan="10" class="text-center">Loading team members...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // Add a small delay to ensure DOM is ready, then load data
    setTimeout(() => {
        loadTeamMembers();
    }, 200);
}

async function loadTeamMembers() {
    try {
        console.log('Loading team members...');
        
        const members = await fetchAPI('/admin/team');
        console.log('Team members loaded:', members);
        
        const tableBody = document.getElementById('team-table-body');
        if (!tableBody) {
            console.error('Team table body not found');
            return;
        }
        
        if (members.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10" class="text-center">No team members found</td></tr>';
            return;
        }
        
        // Group members by team
        const teamGroups = {};
        members.forEach(member => {
            const teamName = member.team_name || 'Unassigned';
            if (!teamGroups[teamName]) {
                teamGroups[teamName] = [];
            }
            teamGroups[teamName].push(member);
        });
        
        let tableHTML = '';
        
        Object.keys(teamGroups).sort().forEach(teamName => {
            const teamMembers = teamGroups[teamName];
            
            // Add team header row
            tableHTML += `
                <tr class="table-secondary">
                    <td colspan="10" class="fw-bold">
                        <i class="fas fa-users me-2"></i>${teamName}
                        <span class="badge bg-info ms-2">${teamMembers.length} member${teamMembers.length !== 1 ? 's' : ''}</span>
                    </td>
                </tr>
            `;
            
            // Add team members
            teamMembers.forEach(member => {
                tableHTML += `
                    <tr ${member.is_team_lead ? 'class="table-warning"' : ''}>
                        <td>${member.id}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <img src="${member.image || 'https://via.placeholder.com/40x40'}" alt="${member.name}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
                                <div>
                                    <strong>${member.name}</strong>
                                    ${member.email ? `<br><small class="text-muted">${member.email}</small>` : ''}
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge bg-secondary">${member.team_name || 'Unassigned'}</span>
                        </td>
                        <td>
                            <span class="badge bg-primary">${member.position}</span>
                        </td>
                        <td>
                            <span class="text-info">${member.expertise}</span>
                        </td>
                        <td>
                            ${member.is_team_lead ? '<span class="badge bg-warning text-dark"><i class="fas fa-crown me-1"></i>Team Lead</span>' : '<span class="badge bg-light text-dark">Member</span>'}
                        </td>
                        <td>
                            ${member.display_on_website ? '<span class="badge bg-success"><i class="fas fa-eye me-1"></i>Public</span>' : '<span class="badge bg-secondary"><i class="fas fa-eye-slash me-1"></i>Admin Only</span>'}
                        </td>
                        <td>
                            <strong>${member.experience_years}</strong> years
                        </td>
                        <td>
                            <span class="badge ${member.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                ${member.status}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editTeamMember(${member.id})" title="Edit Member">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteTeamMember(${member.id})" title="Delete Member">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        });
        
        tableBody.innerHTML = tableHTML;
    } catch (error) {
        console.error('Error loading team members:', error);
        const tableBody = document.getElementById('team-table-body');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading team members</td></tr>';
        }
    }
}

function showAddTeamModal() {
    console.log('showAddTeamModal called');
    
    // Remove existing modal if any
    const existingModal = document.getElementById('addTeamModal');
    console.log('Existing modal:', existingModal);
    
    if (existingModal && existingModal.getAttribute('data-dynamic') === 'true') {
        existingModal.remove();
    }
    
    // Use the static modal that's already in the HTML
    const staticModal = document.getElementById('addTeamModal');
    console.log('Static modal found:', staticModal);
    
    if (staticModal) {
        // Clear the form first
        console.log('Clearing form...');
        try {
            clearTeamForm();
            console.log('Form cleared successfully');
        } catch (error) {
            console.error('Error clearing form:', error);
        }
        
        console.log('Creating Bootstrap modal...');
        try {
            const modal = new bootstrap.Modal(staticModal);
            console.log('Bootstrap modal created:', modal);
            console.log('Showing modal...');
            modal.show();
            console.log('Modal show() called');
        } catch (error) {
            console.error('Error creating or showing modal:', error);
            alert('Error opening modal: ' + error.message);
        }
    } else {
        console.error('Static modal not found');
        alert('Modal not found. Please refresh the page.');
    }
}

function clearTeamForm() {
    // Clear all form fields
    document.getElementById('teamMemberName').value = '';
    document.getElementById('teamMemberTeam').value = '';
    document.getElementById('teamMemberPosition').value = '';
    document.getElementById('teamMemberExperience').value = '';
    document.getElementById('teamMemberExpertise').value = '';
    document.getElementById('teamMemberBio').value = '';
    document.getElementById('isTeamLead').checked = false;
    
    // Focus on the name field
    document.getElementById('teamMemberName').focus();
}

function saveTeamMember() {
    // Get form data
    const name = document.getElementById('teamMemberName').value.trim();
    const team = document.getElementById('teamMemberTeam').value;
    const position = document.getElementById('teamMemberPosition').value.trim();
    const experience = document.getElementById('teamMemberExperience').value.trim();
    const expertise = document.getElementById('teamMemberExpertise').value.trim();
    const bio = document.getElementById('teamMemberBio').value.trim();
    const isLead = document.getElementById('isTeamLead').checked;

    // Validate required fields
    if (!name || !team || !position || !experience || !expertise) {
        alert('Please fill in all required fields.');
        return;
    }

    // Create team member data
    const teamMemberData = {
        name: name,
        team_name: team,
        position: position,
        experience: experience,
        expertise: expertise,
        bio: bio,
        is_lead: isLead
    };

    // Send to API
    fetchAPI('/admin/team', {
        method: 'POST',
        body: JSON.stringify(teamMemberData)
    })
    .then(response => {
        if (response.success) {
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTeamModal'));
            modal.hide();
            
            // Clear form
            clearTeamForm();
            
            // Refresh team list if we're on the team page
            if (document.querySelector('[data-page="team"]').classList.contains('active')) {
                loadTeamContent();
            }
            
            showAlert('Team member added successfully!', 'success');
        } else {
            alert('Failed to add team member: ' + (response.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error adding team member:', error);
        alert('Failed to add team member. Please try again.');
    });
}

async function submitAddTeam() {
    console.log('submitAddTeam called');
    
    // Prevent multiple submissions
    const addButton = document.querySelector('#addTeamModal button[onclick="submitAddTeam()"]');
    if (addButton.disabled) return;
    
    addButton.disabled = true;
    addButton.textContent = 'Adding...';
    
    try {
        const formData = {
            name: document.getElementById('addTeamName').value,
            position: document.getElementById('addTeamPosition').value,
            team_name: document.getElementById('addTeamName2').value,
            expertise: document.getElementById('addTeamExpertise').value,
            experience_years: parseInt(document.getElementById('addTeamExperience').value) || 0,
            email: document.getElementById('addTeamEmail').value,
            bio: document.getElementById('addTeamBio').value,
            image: document.getElementById('addTeamImage').value,
            status: document.getElementById('addTeamStatus').value,
            is_team_lead: document.getElementById('addIsTeamLead').checked,
            display_on_website: document.getElementById('addDisplayOnWebsite').checked
        };
        
        console.log('Team form data:', formData);
        
        // Validate required fields
        if (!formData.name || !formData.position || !formData.expertise || !formData.team_name) {
            console.log('Validation failed');
            alert('Please fill in all required fields (Name, Position, Team, Expertise)');
            addButton.disabled = false;
            addButton.textContent = 'Add Team Member';
            return;
        }
        
        console.log('Validation passed, sending request...');
        const response = await fetchAPI('/admin/team', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        console.log('Response received:', response);
        
        if (response.success) {
            console.log('Team member added successfully');
            alert('Team member added successfully!');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addTeamModal'));
            modal.hide();
            
            // Reload team members
            console.log('Reloading team data...');
            loadTeamMembers();
        } else {
            console.log('Add team member failed');
            alert('Failed to add team member');
        }
    } catch (error) {
        console.error('Error adding team member:', error);
        alert('Failed to add team member');
    } finally {
        // Re-enable button
        addButton.disabled = false;
        addButton.textContent = 'Add Team Member';
    }
}

async function deleteTeamMember(memberId) {
    if (!confirm('Are you sure you want to delete this team member?')) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/admin/team/${memberId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('Team member deleted successfully!');
            loadTeamMembers();
        } else {
            alert('Failed to delete team member');
        }
    } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Failed to delete team member');
    }
}

// Test function to verify team modal works
function testAddTeamModal() {
    console.log('Test team function called');
    alert('Test team function works!');
    showAddTeamModal();
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel initializing...');
    console.log('Current page:', window.location.pathname);
    console.log('Stored token:', authToken ? 'Present' : 'Missing');
    
    // Make functions globally available for onclick handlers
    window.showAddProductModal = showAddProductModal;
    window.submitAddProduct = submitAddProduct;
    window.showAddServiceModal = showAddServiceModal;
    window.submitAddService = submitAddService;
    window.editService = editService;
    window.updateService = updateService;
    window.testAddProductModal = testAddProductModal;
    window.showSection = showSection;
    window.showAddTeamModal = showAddTeamModal;
    window.submitAddTeam = submitAddTeam;
    window.clearTeamForm = clearTeamForm;
    window.editTeamMember = editTeamMember;
    window.submitEditTeam = submitEditTeam;
    window.deleteTeamMember = deleteTeamMember;
    window.testAddTeamModal = testAddTeamModal;
    console.log('Global functions set up');
    
    // Check if on login page
    if (window.location.pathname.includes('login.html')) {
        console.log('On login page, setting up login form');
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', adminLogin);
        }
        return;
    }
    
    // Check authentication for admin pages
    if (!checkAuth()) {
        return;
    }
    
    console.log('Authentication passed, initializing admin dashboard');
    
    // Check if there's a current active section, otherwise default to dashboard
    const currentActiveItem = document.querySelector('.sidebar-menu a.active');
    const currentSection = currentActiveItem ? currentActiveItem.getAttribute('data-page') : 'dashboard';
    
    console.log('Current section:', currentSection);
    
    // Initialize the current section (or dashboard if none)
    showSection(currentSection);
    
    // Set up navigation handlers
    const navLinks = document.querySelectorAll('[data-page]');
    console.log('Found navigation links:', navLinks.length);
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            console.log('Navigation clicked:', page);
            showSection(page);
        });
    });
    
    // Set up sidebar toggle with mobile support
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('adminSidebar');
            const mainContent = document.querySelector('.admin-main');
            
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
                if (mainContent) {
                    mainContent.classList.toggle('expanded');
                }
            }
        });
    }

    // Handle window resize for mobile/desktop transitions
    window.addEventListener('resize', function() {
        const sidebar = document.getElementById('adminSidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (window.innerWidth > 768) {
            // Remove mobile classes on desktop
            if (sidebar) sidebar.classList.remove('show');
            if (overlay) overlay.classList.remove('show');
        }
    });

    // Handle sidebar navigation links for mobile
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Close mobile sidebar if open
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('adminSidebar');
                const overlay = document.querySelector('.mobile-overlay');
                if (sidebar) sidebar.classList.remove('show');
                if (overlay) overlay.classList.remove('show');
            }
        });
    });
    
    // Set up form handlers
    const addPartForm = document.getElementById('addPartForm');
    if (addPartForm) {
        addPartForm.addEventListener('submit', addPart);
    }
    
    const addServiceForm = document.getElementById('addServiceForm');
    if (addServiceForm) {
        addServiceForm.addEventListener('submit', addService);
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    console.log('Admin panel initialization complete');
});

// Manage Teams function
function manageTeams() {
    const modalHtml = `
        <div class="modal fade" id="manageTeamsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Manage Teams</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Current teams: Hardware Specialists, Software Experts, Data Recovery Team, Network Solutions, Customer Support
                        </div>
                        <p>Team management features will be expanded here to create new teams, modify existing teams, and manage team hierarchies.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('manageTeamsModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('manageTeamsModal'));
    modal.show();
}

// Edit team member function
async function editTeamMember(memberId) {
    console.log('editTeamMember called with ID:', memberId);
    try {
        console.log('Fetching team member data...');
        const member = await fetchAPI(`/admin/team/${memberId}`);
        console.log('Team member data received:', member);
        
        const modalHtml = `
            <div class="modal fade" id="editTeamModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Team Member</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editTeamForm">
                                <input type="hidden" id="editMemberId" value="${member.id}">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editTeamName" class="form-label">Full Name *</label>
                                            <input type="text" class="form-control" id="editTeamName" value="${member.name}" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editTeamPosition" class="form-label">Job Position *</label>
                                            <input type="text" class="form-control" id="editTeamPosition" value="${member.position}" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editTeamName2" class="form-label">Team *</label>
                                            <select class="form-control" id="editTeamName2" required>
                                                <option value="">Select Team</option>
                                                <option value="Hardware Team" ${member.team_name === 'Hardware Team' ? 'selected' : ''}>Hardware Team</option>
                                                <option value="Software Team" ${member.team_name === 'Software Team' ? 'selected' : ''}>Software Team</option>
                                                <option value="Data Recovery Team" ${member.team_name === 'Data Recovery Team' ? 'selected' : ''}>Data Recovery Team</option>
                                                <option value="Network Team" ${member.team_name === 'Network Team' ? 'selected' : ''}>Network Team</option>
                                                <option value="Customer Support Team" ${member.team_name === 'Customer Support Team' ? 'selected' : ''}>Customer Support Team</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editTeamExpertise" class="form-label">Area of Expertise *</label>
                                            <input type="text" class="form-control" id="editTeamExpertise" value="${member.expertise}" required>
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editTeamExperience" class="form-label">Experience (Years)</label>
                                            <input type="number" class="form-control" id="editTeamExperience" value="${member.experience_years}" min="0">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label for="editTeamEmail" class="form-label">Email</label>
                                            <input type="email" class="form-control" id="editTeamEmail" value="${member.email || ''}">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="editIsTeamLead" ${member.is_team_lead ? 'checked' : ''}>
                                                <label class="form-check-label" for="editIsTeamLead">
                                                    <strong>Is Team Lead</strong>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="editDisplayOnWebsite" ${member.display_on_website ? 'checked' : ''}>
                                                <label class="form-check-label" for="editDisplayOnWebsite">
                                                    Display on Website
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label for="editTeamStatus" class="form-label">Status</label>
                                            <select class="form-select" id="editTeamStatus">
                                                <option value="active" ${member.status === 'active' ? 'selected' : ''}>Active</option>
                                                <option value="inactive" ${member.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label for="editTeamBio" class="form-label">Bio/Description</label>
                                    <textarea class="form-control" id="editTeamBio" rows="3">${member.bio || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="editTeamImage" class="form-label">Profile Image URL</label>
                                    <input type="url" class="form-control" id="editTeamImage" value="${member.image || ''}">
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" onclick="submitEditTeam()">Update Team Member</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('editTeamModal');
        if (existingModal) existingModal.remove();
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editTeamModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error loading team member:', error);
        alert('Error loading team member details');
    }
}

// Submit edit team member
async function submitEditTeam() {
    // Prevent multiple submissions
    const updateButton = document.querySelector('#editTeamModal button[onclick="submitEditTeam()"]');
    if (updateButton.disabled) return;
    
    updateButton.disabled = true;
    updateButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
    
    try {
        const memberId = document.getElementById('editMemberId').value;
        const formData = {
            name: document.getElementById('editTeamName').value,
            position: document.getElementById('editTeamPosition').value,
            team_name: document.getElementById('editTeamName2').value,
            expertise: document.getElementById('editTeamExpertise').value,
            experience_years: parseInt(document.getElementById('editTeamExperience').value) || 0,
            email: document.getElementById('editTeamEmail').value,
            bio: document.getElementById('editTeamBio').value,
            image: document.getElementById('editTeamImage').value,
            status: document.getElementById('editTeamStatus').value,
            is_team_lead: document.getElementById('editIsTeamLead').checked,
            display_on_website: document.getElementById('editDisplayOnWebsite').checked
        };
        
        // Validate required fields
        if (!formData.name || !formData.position || !formData.expertise || !formData.team_name) {
            alert('Please fill in all required fields (Name, Position, Team, Expertise)');
            updateButton.disabled = false;
            updateButton.innerHTML = '<i class="fas fa-save me-1"></i>Update Member';
            return;
        }
        
        const response = await fetchAPI(`/admin/team/${memberId}`, {
            method: 'PUT',
            body: JSON.stringify(formData)
        });
        
        if (response.success) {
            alert('Team member updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('editTeamModal')).hide();
            loadTeamMembers(); // Reload the team list
        } else {
            alert('Error updating team member: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating team member:', error);
        alert('Error updating team member');
    } finally {
        // Re-enable button
        updateButton.disabled = false;
        updateButton.innerHTML = '<i class="fas fa-save me-1"></i>Update Member';
    }
}

// Delete team member function
async function deleteTeamMember(memberId) {
    if (!confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/admin/team/${memberId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('Team member deleted successfully!');
            loadTeamMembers(); // Reload the team list
        } else {
            alert('Error deleting team member: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Error deleting team member');
    }
}

// Delete request function
async function deleteRequest(requestId) {
    if (!confirm('Are you sure you want to delete this request? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/admin/contact-requests/${requestId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('Request deleted successfully!');
            loadContactRequests(); // Reload the requests table
        } else {
            alert('Failed to delete request');
        }
    } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request');
    }
}

// Delete feedback function
async function deleteFeedback(feedbackId) {
    if (!confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/admin/feedback/${feedbackId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('Feedback deleted successfully!');
            loadFeedback(); // Reload the feedback table
        } else {
            alert('Failed to delete feedback');
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Failed to delete feedback');
    }
}

// Modal helper functions for requests and feedback

// Request modal functions
async function updateRequestFromModal() {
    const requestId = document.getElementById('viewRequestModal').getAttribute('data-request-id');
    const notes = document.getElementById('requestModalNotes').value;
    const priority = document.getElementById('requestModalPriority').value;
    
    try {
        const response = await fetchAPI(`/admin/contact-requests/${requestId}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                admin_notes: notes,
                priority: priority
            })
        });
        
        if (response.success) {
            // Close modal and refresh table
            bootstrap.Modal.getInstance(document.getElementById('viewRequestModal')).hide();
            loadContactRequests();
            showAlert('Request updated successfully!', 'success');
        }
    } catch (error) {
        console.error('Error updating request:', error);
        alert('Failed to update request');
    }
}

async function markRequestComplete() {
    const requestId = document.getElementById('viewRequestModal').getAttribute('data-request-id');
    
    try {
        const response = await fetchAPI(`/admin/contact-requests/${requestId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'completed' })
        });
        
        if (response.success) {
            // Close modal and refresh table
            bootstrap.Modal.getInstance(document.getElementById('viewRequestModal')).hide();
            loadContactRequests();
            showAlert('Request marked as complete!', 'success');
        }
    } catch (error) {
        console.error('Error updating request status:', error);
        alert('Failed to update request status');
    }
}

// Feedback modal functions
async function approveFeedback() {
    const feedbackId = document.getElementById('viewFeedbackModal').getAttribute('data-feedback-id');
    
    try {
        const response = await fetchAPI(`/admin/feedback/${feedbackId}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'approved' })
        });
        
        if (response.success) {
            // Close modal and refresh table
            bootstrap.Modal.getInstance(document.getElementById('viewFeedbackModal')).hide();
            loadFeedback();
            showAlert('Feedback approved!', 'success');
        }
    } catch (error) {
        console.error('Error approving feedback:', error);
        alert('Failed to approve feedback');
    }
}

async function rejectFeedback() {
    const feedbackId = document.getElementById('viewFeedbackModal').getAttribute('data-feedback-id');
    
    if (confirm('Are you sure you want to reject this feedback?')) {
        try {
            const response = await fetchAPI(`/admin/feedback/${feedbackId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'rejected' })
            });
            
            if (response.success) {
                // Close modal and refresh table
                bootstrap.Modal.getInstance(document.getElementById('viewFeedbackModal')).hide();
                loadFeedback();
                showAlert('Feedback rejected!', 'warning');
            }
        } catch (error) {
            console.error('Error rejecting feedback:', error);
            alert('Failed to reject feedback');
        }
    }
}

async function updateFeedbackFromModal() {
    const feedbackId = document.getElementById('viewFeedbackModal').getAttribute('data-feedback-id');
    const notes = document.getElementById('feedbackModalNotes').value;
    
    try {
        const response = await fetchAPI(`/admin/feedback/${feedbackId}`, {
            method: 'PUT',
            body: JSON.stringify({ admin_notes: notes })
        });
        
        if (response.success) {
            // Close modal and refresh table
            bootstrap.Modal.getInstance(document.getElementById('viewFeedbackModal')).hide();
            loadFeedback();
            showAlert('Feedback notes updated!', 'success');
        }
    } catch (error) {
        console.error('Error updating feedback:', error);
        alert('Failed to update feedback notes');
    }
}

// Additional global function assignments for functions defined outside the main DOMContentLoaded block
window.editService = editService;
window.updateService = updateService;
window.editTeamMember = editTeamMember;
window.submitEditTeam = submitEditTeam;
window.manageTeams = manageTeams;
window.clearTeamForm = clearTeamForm;
window.saveTeamMember = saveTeamMember;
window.showAddTeamModal = showAddTeamModal;

// Modal helper functions
window.updateRequestFromModal = updateRequestFromModal;
window.markRequestComplete = markRequestComplete;
window.approveFeedback = approveFeedback;
window.rejectFeedback = rejectFeedback;
window.updateFeedbackFromModal = updateFeedbackFromModal;

