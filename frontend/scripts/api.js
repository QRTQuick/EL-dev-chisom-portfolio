// Portfolio API Configuration
const API_BASE_URL = 'https://backend-portfolio.onrender.com';

// API Helper Functions
class PortfolioAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get GitHub repositories
    async getGitHubRepos() {
        try {
            const response = await fetch(`${this.baseURL}/api/github/repos`);
            if (!response.ok) throw new Error('Failed to fetch repositories');
            return await response.json();
        } catch (error) {
            console.error('Error fetching GitHub repos:', error);
            return [];
        }
    }

    // Submit contact form
    async submitContact(formData) {
        try {
            const response = await fetch(`${this.baseURL}/api/contact/json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) throw new Error('Failed to submit contact form');
            return await response.json();
        } catch (error) {
            console.error('Error submitting contact form:', error);
            throw error;
        }
    }

    // Check API health
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }

    // Get API info
    async getAPIInfo() {
        try {
            const response = await fetch(`${this.baseURL}/`);
            if (!response.ok) throw new Error('Failed to fetch API info');
            return await response.json();
        } catch (error) {
            console.error('Error fetching API info:', error);
            return null;
        }
    }
}

// Create global API instance
const portfolioAPI = new PortfolioAPI();

// Example usage functions
async function loadGitHubRepos() {
    const repos = await portfolioAPI.getGitHubRepos();
    console.log('GitHub repositories:', repos);
    return repos;
}

async function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    try {
        const result = await portfolioAPI.submitContact(contactData);
        alert(result.message);
        event.target.reset();
    } catch (error) {
        alert('Failed to send message. Please try again.');
    }
}

// Initialize API connection on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isHealthy = await portfolioAPI.checkHealth();
    console.log('API Status:', isHealthy ? 'Healthy' : 'Unavailable');
    
    if (isHealthy) {
        const apiInfo = await portfolioAPI.getAPIInfo();
        console.log('API Info:', apiInfo);
    }
});