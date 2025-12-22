// Portfolio Animation System with Authentication
class PortfolioAnimations {
    constructor() {
        this.init();
        this.setupKeepAlive();
        this.setupAuthentication();
        this.backendUrl = 'https://portfolio-backend-ux42.onrender.com';
        this.token = localStorage.getItem('auth_token');
        this.checkAuthStatus();
    }

    init() {
        this.setupNavigation();
        this.setupScrollAnimations();
        this.setupTypewriter();
        this.setupContactForm();
        this.setupScrollToTop();
    }

    // Authentication System
    setupAuthentication() {
        const authLink = document.getElementById('auth-link');
        const authModal = document.getElementById('auth-modal');
        const authClose = document.querySelector('.auth-close');
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');
        const loginForm = document.getElementById('login-form-element');
        const registerForm = document.getElementById('register-form-element');
        const logoutBtn = document.getElementById('logout-btn');

        // Open modal
        authLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.token) {
                this.showUserDashboard();
            } else {
                this.showLoginForm();
            }
            authModal.style.display = 'block';
        });

        // Close modal
        authClose.addEventListener('click', () => {
            authModal.style.display = 'none';
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
            }
        });

        // Switch between login and register
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Handle login form
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(e.target);
        });

        // Handle register form
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister(e.target);
        });

        // Handle logout
        logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // Dashboard actions
        document.getElementById('view-analytics').addEventListener('click', () => {
            this.viewAnalytics();
        });

        document.getElementById('view-messages').addEventListener('click', () => {
            this.viewMessages();
        });
    }

    showLoginForm() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('user-dashboard').style.display = 'none';
    }

    showRegisterForm() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
        document.getElementById('user-dashboard').style.display = 'none';
    }

    showUserDashboard() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('user-dashboard').style.display = 'block';
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch(`${this.backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                this.token = result.access_token;
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_data', JSON.stringify(result.user));
                
                this.updateAuthUI(result.user);
                this.showUserDashboard();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification(result.detail || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    async handleRegister(form) {
        const formData = new FormData(form);
        const registerData = {
            email: formData.get('email'),
            password: formData.get('password'),
            full_name: formData.get('full_name')
        };

        try {
            const response = await fetch(`${this.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            });

            const result = await response.json();

            if (response.ok) {
                this.token = result.access_token;
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_data', JSON.stringify(result.user));
                
                this.updateAuthUI(result.user);
                this.showUserDashboard();
                this.showNotification('Registration successful!', 'success');
            } else {
                this.showNotification(result.detail || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        }
    }

    handleLogout() {
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        this.updateAuthUI(null);
        document.getElementById('auth-modal').style.display = 'none';
        this.showNotification('Logged out successfully!', 'success');
    }

    checkAuthStatus() {
        const userData = localStorage.getItem('user_data');
        if (this.token && userData) {
            try {
                const user = JSON.parse(userData);
                this.updateAuthUI(user);
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.handleLogout();
            }
        }
    }

    updateAuthUI(user) {
        const authLink = document.getElementById('auth-link');
        
        if (user) {
            authLink.textContent = user.full_name || user.email;
            document.getElementById('user-name').textContent = user.full_name;
            document.getElementById('user-email').textContent = user.email;
        } else {
            authLink.textContent = 'Login';
        }
    }

    async viewAnalytics() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.backendUrl}/api/analytics/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                this.showNotification('Analytics data loaded!', 'success');
                console.log('Analytics:', result);
            } else {
                this.showNotification('Failed to load analytics', 'error');
            }
        } catch (error) {
            console.error('Analytics error:', error);
            this.showNotification('Network error', 'error');
        }
    }

    async viewMessages() {
        if (!this.token) return;

        try {
            const response = await fetch(`${this.backendUrl}/api/contact/messages`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                this.showNotification('Messages loaded!', 'success');
                console.log('Messages:', result);
            } else {
                this.showNotification('Failed to load messages', 'error');
            }
        } catch (error) {
            console.error('Messages error:', error);
            this.showNotification('Network error', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            ${type === 'success' ? 'background: linear-gradient(135deg, #10b981, #059669);' : ''}
            ${type === 'error' ? 'background: linear-gradient(135deg, #ef4444, #dc2626);' : ''}
            ${type === 'info' ? 'background: linear-gradient(135deg, #3b82f6, #1d4ed8);' : ''}
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Hide notification
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Navigation animations
    setupNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                if (navMenu.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });

            // Close menu on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                // Close mobile menu after clicking
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Update active link on scroll
        window.addEventListener('scroll', () => {
            let current = '';
            const sections = document.querySelectorAll('section');
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Scroll animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all sections and cards
        const elementsToAnimate = document.querySelectorAll('section, .project-card, .skill-category, .timeline-item');
        elementsToAnimate.forEach(el => observer.observe(el));
    }

    // Typewriter effect for hero section
    setupTypewriter() {
        const typewriterElement = document.querySelector('.hero-subtitle');
        if (!typewriterElement) return;

        const texts = [
            'Senior Software Engineer',
            'Full-Stack Developer',
            'System Programmer',
            'IoT Solutions Expert'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        }

        // Start typewriter effect after a delay
        setTimeout(type, 1000);
    }

    // Contact form handling
    setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                // Simulate form submission (replace with actual endpoint)
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Show success message
                submitBtn.textContent = 'Message Sent!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                
                // Reset form
                contactForm.reset();
                
                // Reset button after delay
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
                
            } catch (error) {
                console.error('Error sending message:', error);
                submitBtn.textContent = 'Error - Try Again';
                submitBtn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }
        });
    }

    // Scroll to top functionality
    setupScrollToTop() {
        // Create scroll to top button
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #16f2b3, #0dd8a0);
            color: #0f0f23;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            font-size: 1.2rem;
        `;
        
        document.body.appendChild(scrollBtn);

        // Show/hide scroll button
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        });

        // Scroll to top on click
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Keep-alive functionality to prevent server sleep
    setupKeepAlive() {
        // Create keep-alive indicator
        const indicator = document.createElement('div');
        indicator.className = 'keep-alive-indicator';
        document.body.appendChild(indicator);

        // Backend URL
        const BACKEND_URL = 'https://portfolio-backend-ux42.onrender.com';

        // Keep-alive ping function
        const keepAlive = async () => {
            try {
                // Show indicator animation
                indicator.style.animation = 'keepAlivePulse 3s ease-in-out';
                
                // Ping the backend to keep it alive
                const response = await fetch(`${BACKEND_URL}/ping`, {
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                
                console.log('Keep-alive ping successful:', response.status);
                
                // Reset animation after completion
                setTimeout(() => {
                    indicator.style.animation = '';
                }, 3000);
                
            } catch (error) {
                console.log('Keep-alive ping failed:', error.message);
                
                // Still show the animation to indicate the system is working
                setTimeout(() => {
                    indicator.style.animation = '';
                }, 3000);
            }
        };

        // Initial ping after 5 seconds
        setTimeout(keepAlive, 5000);
        
        // Ping every 3 minutes (180000ms) to keep server awake
        setInterval(keepAlive, 180000);

        // Also ping on user interaction to show activity
        let interactionTimeout;
        const onUserInteraction = () => {
            clearTimeout(interactionTimeout);
            interactionTimeout = setTimeout(keepAlive, 1000);
        };

        // Listen for user interactions
        ['click', 'scroll', 'keypress', 'mousemove'].forEach(event => {
            document.addEventListener(event, onUserInteraction, { passive: true });
        });

        console.log('Keep-alive system initialized - pinging every 3 minutes');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioAnimations();
});

// Handle profile image error
document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
        profileImg.addEventListener('error', () => {
            // Create a fallback SVG if the main SVG fails to load
            profileImg.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #FF4444, #FFD700, #000000);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                color: white;
                font-weight: bold;
                text-align: center;
                border-radius: 50%;
                position: relative;
            `;
            placeholder.innerHTML = `
                <div style="text-align: center; line-height: 1.2;">
                    <div style="font-size: 1.5rem;">CE</div>
                    <div style="font-size: 0.8rem; margin-top: 5px;">Problem Solver</div>
                </div>
            `;
            profileImg.parentNode.appendChild(placeholder);
        });
    }
});

// Performance optimization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register service worker for caching (optional)
        console.log('Service Worker support detected');
    });
}

// Preload critical resources
document.addEventListener('DOMContentLoaded', () => {
    // Preload GitHub API for faster project loading
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = '//api.github.com';
    document.head.appendChild(link);
});