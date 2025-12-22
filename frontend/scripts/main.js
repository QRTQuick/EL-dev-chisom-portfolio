// Portfolio Animation System
class PortfolioAnimations {
    constructor() {
        this.init();
        this.setupKeepAlive();
    }

    init() {
        this.setupNavigation();
        this.setupScrollAnimations();
        this.setupTypewriter();
        this.setupContactForm();
        this.setupScrollToTop();
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

        // Keep-alive ping function
        const keepAlive = async () => {
            try {
                // Show indicator animation
                indicator.style.animation = 'keepAlivePulse 3s ease-in-out';
                
                // Ping the current domain to keep it alive
                const response = await fetch(window.location.origin + '/favicon.ico', {
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                
                console.log('Keep-alive ping successful:', response.status);
                
                // Reset animation after completion
                setTimeout(() => {
                    indicator.style.animation = '';
                }, 3000);
                
            } catch (error) {
                console.log('Keep-alive ping failed (normal for static sites):', error.message);
                
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
            // Create a placeholder if image fails to load
            profileImg.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #16f2b3, #0dd8a0);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 4rem;
                color: #0f0f23;
                font-weight: bold;
            `;
            placeholder.textContent = 'CE';
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