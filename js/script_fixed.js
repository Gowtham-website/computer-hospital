// JavaScript for Computer's Hospital Website
console.log('Script loaded successfully!');
console.log('Current page:', window.location.pathname);

const API_BASE_URL = 'https://gowtham1.pythonanywhere.com/api';

// API Helper Functions
async function fetchAPI(endpoint, options = {}) {
    console.log('Fetching API:', `${API_BASE_URL}${endpoint}`);
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        console.log('API Response status:', response.status);
        const data = await response.json();
        console.log('API Response data:', data);
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load dynamic content
async function loadSpareParts() {
    console.log('Loading spare parts...');
    try {
        const parts = await fetchAPI('/spare-parts');
        console.log('Spare parts loaded:', parts);
        if (window.location.pathname.includes('spare-parts.html')) {
            displaySpareParts(parts);
        }
    } catch (error) {
        console.error('Failed to load spare parts:', error);
    }
}

async function loadServices() {
    try {
        const services = await fetchAPI('/services');
        if (window.location.pathname.includes('services.html')) {
            displayServices(services);
        }
    } catch (error) {
        console.error('Failed to load services:', error);
    }
}

function displaySpareParts(parts) {
    const container = document.getElementById('spare-parts-container');
    if (!container) return;
    
    container.innerHTML = parts.map(part => `
        <div class="col-md-4 mb-4" data-category="${part.category.toLowerCase().replace(' ', '')}">
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

function displayServices(services) {
    const container = document.getElementById('services-container');
    if (!container) return;
    
    container.innerHTML = services.map(service => `
        <div class="col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${service.name}</h5>
                    <p class="card-text">${service.description}</p>
                    <p class="text-primary fw-bold">₹${service.price.toLocaleString()}</p>
                    <p class="text-muted">Duration: ${service.duration}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-calendar-check"></i> Book Service
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Star Rating System
function initializeStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingInput = document.getElementById('rating');
    
    if (!stars.length || !ratingInput) return;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            const rating = index + 1;
            ratingInput.value = rating;
            updateStarDisplay(rating);
        });
        
        star.addEventListener('mouseover', () => {
            updateStarDisplay(index + 1);
        });
    });
    
    const starRating = document.querySelector('.star-rating');
    if (starRating) {
        starRating.addEventListener('mouseleave', () => {
            updateStarDisplay(ratingInput.value || 0);
        });
    }
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star-rating .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Form Validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
        }
    });
    
    // Email validation
    const emailInputs = form.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.value && !emailRegex.test(input.value)) {
            input.classList.add('is-invalid');
            isValid = false;
        }
    });
    
    return isValid;
}

// Contact Form Submission
async function submitContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    const formData = new FormData(form);
    const data = {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('subject') || '',
        message: formData.get('message')
    };
    
    console.log('Submitting contact form data:', data);
    
    try {
        const response = await fetchAPI('/contact', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            alert(response.message);
            form.reset();
            form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
        } else {
            alert('Failed to submit form. Please try again.');
        }
    } catch (error) {
        alert('Error submitting form. Please try again.');
        console.error('Contact form error:', error);
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Feedback Form Submission
async function submitFeedbackForm(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    if (!validateForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    const rating = parseInt(formData.get('rating'));
    
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    
    const data = {
        name: formData.get('customerName'),
        email: formData.get('customerEmail'),
        rating: rating,
        message: formData.get('feedbackComments')
    };
    
    console.log('Submitting feedback form data:', data);
    
    try {
        const response = await fetchAPI('/feedback', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            alert(response.message);
            form.reset();
            const ratingInput = document.getElementById('rating');
            if (ratingInput) ratingInput.value = '';
            updateStarDisplay(0);
            form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
        } else {
            alert('Failed to submit feedback. Please try again.');
        }
    } catch (error) {
        alert('Error submitting feedback. Please try again.');
        console.error('Feedback form error:', error);
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Load approved feedback for display
async function loadApprovedFeedback() {
    try {
        const feedback = await fetchAPI('/feedback');
        displayFeedback(feedback);
    } catch (error) {
        console.error('Failed to load feedback:', error);
    }
}

function displayFeedback(feedbackList) {
    const container = document.getElementById('feedback-display');
    if (!container) return;
    
    if (feedbackList.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">No feedback available yet.</p></div>';
        return;
    }
    
    container.innerHTML = feedbackList.map(feedback => `
        <div class="col-md-6 mb-4">
            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h6 class="card-title">${feedback.name}</h6>
                        <div class="text-warning">
                            ${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}
                        </div>
                    </div>
                    <p class="card-text">${feedback.message}</p>
                    <small class="text-muted">${new Date(feedback.created_at).toLocaleDateString()}</small>
                </div>
            </div>
        </div>
    `).join('');
}

// Product filtering functionality
function filterProducts() {
    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const products = document.querySelectorAll('[data-category]');
    
    if (!searchInput || !categoryFilter || !products.length) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    products.forEach(product => {
        const productName = product.querySelector('.card-title').textContent.toLowerCase();
        const productCategory = product.getAttribute('data-category');
        
        const matchesSearch = productName.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
        
        if (matchesSearch && matchesCategory) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
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
                } else if (filterValue === 'graphics' && (productCategory === 'graphicscards' || productCategory === 'graphics cards')) {
                    product.style.display = 'block';
                } else if (filterValue === 'powersupply' && (productCategory === 'powersupply' || productCategory === 'power supply')) {
                    product.style.display = 'block';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize star rating if on feedback page
    if (document.querySelector('.star-rating')) {
        initializeStarRating();
    }
    
    // Set up form handlers
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
    
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', submitFeedbackForm);
    }
    
    // Set up product filtering
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (productSearch) {
        productSearch.addEventListener('input', filterProducts);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    // Load dynamic content based on current page
    if (window.location.pathname.includes('spare-parts.html')) {
        loadSpareParts();
    }
    
    if (window.location.pathname.includes('services.html')) {
        loadServices();
    }
    
    if (window.location.pathname.includes('feedback.html')) {
        loadApprovedFeedback();
    }
});
