/**
 * Configuration file for Computer's Hospital Website
 * This file contains all configurable settings for the application
 */

// API Configuration
const API_CONFIG = {
    // Backend server configuration
    // BASE_URL: 'http://127.0.0.1:5000',
    BASE_URL: 'https://gowtham1.pythonanywhere.com',
    
    // API Endpoints
    ENDPOINTS: {
        SPARE_PARTS: '/api/spare-parts',
        SERVICES: '/api/services',
        CONTACT: '/api/contact',
        FEEDBACK: '/api/feedback',
        ADMIN_LOGIN: '/api/admin/login',
        TEAM_LEADS: '/api/team-leads'
    },
    
    // Request timeout (in milliseconds)
    TIMEOUT: 10000,
    
    // Default headers for API requests
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json'
    }
};

// Helper function to build complete API URLs
function buildApiUrl(endpoint) {
    return API_CONFIG.BASE_URL + endpoint;
}

// Helper function to make API requests with default configuration
async function makeApiRequest(endpoint, options = {}) {
    const url = buildApiUrl(endpoint);
    const defaultOptions = {
        headers: API_CONFIG.DEFAULT_HEADERS,
        ...options
    };
    
    return fetch(url, defaultOptions);
}

// Export configuration for use in other files
window.API_CONFIG = API_CONFIG;
window.buildApiUrl = buildApiUrl;
window.makeApiRequest = makeApiRequest;

// Development/Production environment detection
const ENVIRONMENT = {
    isDevelopment: () => window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: () => !ENVIRONMENT.isDevelopment()
};

window.ENVIRONMENT = ENVIRONMENT;

// Console log for debugging (only in development)
if (ENVIRONMENT.isDevelopment()) {
    console.log('API Configuration loaded:', API_CONFIG);
    console.log('Available endpoints:', Object.keys(API_CONFIG.ENDPOINTS));
}
