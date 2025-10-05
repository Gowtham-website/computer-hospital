// JavaScript for Computer's Hospital Website

const API_BASE_URL = 'https://gowtham1.pythonanywhere.com/api';

// API Helper Functions
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load dynamic content
async function loadSpareParts() {
    try {
        const parts = await fetchAPI('/spare-parts');
        displaySpareParts(parts);
    } catch (error) {
        console.error('Failed to load spare parts:', error);
    }
}

async function loadServices() {
    try {
        const services = await fetchAPI('/services');
        displayServices(services);
    } catch (error) {
        console.error('Failed to load services:', error);
    }
}

function displaySpareParts(parts) {
    const container = document.getElementById('spare-parts-container');
    if (!container) return;
    
    container.innerHTML = parts.map(part => `
        <div class="col-md-4 mb-4" data-category="${part.category}">
            <div class="card h-100">
                <img src="https://via.placeholder.com/300x200?text=${encodeURIComponent(part.name)}" class="card-img-top" alt="${part.name}">
                <div class="card-body">
                    <h5 class="card-title">${part.name}</h5>
                    <p class="card-text">${part.description}</p>
                    <p class="text-primary fw-bold">₹${part.price.toLocaleString()}</p>
                    <p class="text-muted">Stock: ${part.stock}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
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
    
    return isValid;
}

// Contact Form Submission
async function submitContactForm(event) {
    event.preventDefault();
    const form = event.target;
    
    if (!validateForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        service: formData.get('service'),
        message: formData.get('message')
    };
    
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
    }
}

// Feedback Form Submission
async function submitFeedbackForm(event) {
    event.preventDefault();
    const form = event.target;
    
    if (!validateForm(form)) {
        return;
    }
    
    const formData = new FormData(form);
    const rating = parseInt(formData.get('rating'));
    
    if (!rating) {
        alert('Please select a rating');
        return;
    }
    
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        rating: rating,
        message: formData.get('message')
    };
    
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
    }
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
    
    // Load dynamic content based on current page
    if (window.location.pathname.includes('spare-parts.html')) {
        loadSpareParts();
    }
    
    if (window.location.pathname.includes('services.html')) {
        loadServices();
    }
});
