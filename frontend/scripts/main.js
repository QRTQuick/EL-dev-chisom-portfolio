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
                if (navMenu && navMenu.classList.contains('active')) {
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
                // Send to backend API
                const response = await fetch('https://portfolio-backend-ux42.onrender.com/api/contact', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    // Show success message
                    submitBtn.textContent = 'Message Sent!';
                    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Show success notification
                    this.showNotification('Message sent successfully!', 'success');
                } else {
                    throw new Error('Failed to send message');
                }
                
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
                
                this.showNotification('Failed to send message. Please try again.', 'error');
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
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
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
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
            background: linear-gradient(135deg, #00FFFF, #40E0D0);
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

// ===== SNAKE GAME IMPLEMENTATION =====
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snake-game');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        this.snake = [
            {x: 10, y: 10}
        ];
        this.food = {};
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        
        // Make this instance globally available
        window.snakeGameInstance = this;
        
        this.init();
    }
    
    init() {
        this.updateScore();
        this.generateFood();
        this.setupControls();
        this.setupTouchControls();
        this.setupMobileResponsive();
        this.draw();
    }
    
    setupMobileResponsive() {
        // Adjust canvas size for mobile
        const updateCanvasSize = () => {
            const container = this.canvas.parentElement;
            const containerWidth = container.clientWidth;
            
            if (window.innerWidth <= 768) {
                const size = Math.min(containerWidth - 40, 350);
                this.canvas.width = size;
                this.canvas.height = size;
                this.tileCount = Math.floor(size / this.gridSize);
                
                // Show mobile controls
                const mobileControls = document.querySelector('.mobile-controls');
                if (mobileControls) {
                    mobileControls.style.display = 'block';
                }
            } else {
                this.canvas.width = 400;
                this.canvas.height = 400;
                this.tileCount = this.canvas.width / this.gridSize;
                
                // Hide mobile controls on desktop
                const mobileControls = document.querySelector('.mobile-controls');
                if (mobileControls) {
                    mobileControls.style.display = 'none';
                }
            }
            
            // Redraw after resize
            this.draw();
        };
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateCanvasSize, 100);
        });
    }
    
    setupControls() {
        const startBtn = document.getElementById('start-game');
        const pauseBtn = document.getElementById('pause-game');
        const resetBtn = document.getElementById('reset-game');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pauseGame());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGame());
        }
        
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            // Arrow keys
            if (e.key === 'ArrowUp' && this.dy !== 1) {
                this.dx = 0; this.dy = -1;
                e.preventDefault();
            } else if (e.key === 'ArrowDown' && this.dy !== -1) {
                this.dx = 0; this.dy = 1;
                e.preventDefault();
            } else if (e.key === 'ArrowLeft' && this.dx !== 1) {
                this.dx = -1; this.dy = 0;
                e.preventDefault();
            } else if (e.key === 'ArrowRight' && this.dx !== -1) {
                this.dx = 1; this.dy = 0;
                e.preventDefault();
            }
            
            // WASD keys
            if (e.key.toLowerCase() === 'w' && this.dy !== 1) {
                this.dx = 0; this.dy = -1;
                e.preventDefault();
            } else if (e.key.toLowerCase() === 's' && this.dy !== -1) {
                this.dx = 0; this.dy = 1;
                e.preventDefault();
            } else if (e.key.toLowerCase() === 'a' && this.dx !== 1) {
                this.dx = -1; this.dy = 0;
                e.preventDefault();
            } else if (e.key.toLowerCase() === 'd' && this.dx !== -1) {
                this.dx = 1; this.dy = 0;
                e.preventDefault();
            }
            
            // Space to pause/unpause
            if (e.key === ' ') {
                e.preventDefault();
                if (this.gameRunning) {
                    this.pauseGame();
                } else {
                    this.startGame();
                }
            }
        });
    }
    
    setupTouchControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            // Add visual feedback
            this.canvas.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.5)';
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            // Reset visual feedback
            this.canvas.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)';
            
            if (!this.gameRunning || this.gamePaused) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return; // Not a swipe, maybe a tap to start
            }
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0 && this.dx !== -1) {
                    this.dx = 1; this.dy = 0; // Right
                } else if (deltaX < 0 && this.dx !== 1) {
                    this.dx = -1; this.dy = 0; // Left
                }
            } else {
                // Vertical swipe
                if (deltaY > 0 && this.dy !== -1) {
                    this.dx = 0; this.dy = 1; // Down
                } else if (deltaY < 0 && this.dy !== 1) {
                    this.dx = 0; this.dy = -1; // Up
                }
            }
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }, { passive: false });
        
        // Prevent scrolling when touching the canvas
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    startGame() {
        if (this.gameRunning && !this.gamePaused) return;
        
        if (!this.gameRunning) {
            this.resetGame();
        }
        
        this.gameRunning = true;
        this.gamePaused = false;
        
        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1; // Start moving right
        }
        
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 200); // Reduced speed from 150ms to 200ms for slower movement
        
        this.updateButtons();
        this.hideGameOverlay();
    }
    
    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, 200); // Reduced speed from 150ms to 200ms for slower movement
        }
        
        this.updateButtons();
    }
    
    resetGame() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.gamePaused = false;
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateFood();
        this.updateScore();
        this.draw();
        this.updateButtons();
        this.showGameOverlay();
    }
    
    update() {
        if (this.gamePaused) return;
        
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.generateFood();
            
            // Haptic feedback for eating food
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 50]);
            }
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Clear canvas with sci-fi background
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#00FFFF';
                this.ctx.shadowColor = '#00FFFF';
                this.ctx.shadowBlur = 10;
            } else {
                // Body
                this.ctx.fillStyle = '#40E0D0';
                this.ctx.shadowBlur = 5;
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // Draw food
        this.ctx.fillStyle = '#FF4444';
        this.ctx.shadowColor = '#FF4444';
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Draw pause overlay
        if (this.gamePaused) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00FFFF';
            this.ctx.font = '24px Orbitron, monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    generateFood() {
        let foodPosition;
        do {
            foodPosition = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
        
        this.food = foodPosition;
    }
    
    updateScore() {
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('high-score');
        
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
    }
    
    updateButtons() {
        const startBtn = document.getElementById('start-game');
        const pauseBtn = document.getElementById('pause-game');
        
        if (startBtn) {
            if (this.gameRunning && !this.gamePaused) {
                startBtn.style.display = 'none';
            } else {
                startBtn.style.display = 'inline-flex';
                startBtn.innerHTML = this.gameRunning ? '<i class="fas fa-play"></i><span>Resume</span>' : '<i class="fas fa-play"></i><span>Start Game</span>';
            }
        }
        
        if (pauseBtn) {
            if (this.gameRunning) {
                pauseBtn.style.display = 'inline-flex';
                pauseBtn.innerHTML = this.gamePaused ? '<i class="fas fa-play"></i><span>Resume</span>' : '<i class="fas fa-pause"></i><span>Pause</span>';
            } else {
                pauseBtn.style.display = 'none';
            }
        }
    }
    
    showGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
    
    hideGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    gameOver() {
        clearInterval(this.gameLoop);
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Haptic feedback for game over
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        // Draw game over screen
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF4444';
        this.ctx.font = '28px Orbitron, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.fillStyle = '#00FFFF';
        this.ctx.font = '16px Orbitron, monospace';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        if (this.score === this.highScore && this.score > 0) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillText('NEW HIGH SCORE!', this.canvas.width / 2, this.canvas.height / 2 + 45);
        }
        
        this.updateButtons();
    }
}

// Initialize Snake Game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the page to fully load
    setTimeout(() => {
        new SnakeGame();
        new MobileGameControls();
    }, 1000);
});

// ===== MOBILE GAME CONTROLS IMPLEMENTATION =====
class MobileGameControls {
    constructor() {
        this.currentMode = 'swipe';
        this.dragStartPos = { x: 0, y: 0 };
        this.isDragging = false;
        this.snakeGame = null;
        
        this.init();
    }
    
    init() {
        this.setupModeButtons();
        this.setupSwipeControls();
        this.setupDragControls();
        this.setupButtonControls();
        
        // Find the snake game instance
        setTimeout(() => {
            this.findSnakeGame();
        }, 500);
    }
    
    findSnakeGame() {
        // Try to find the snake game instance from the global scope or create a reference
        const canvas = document.getElementById('snake-game');
        if (canvas && window.snakeGameInstance) {
            this.snakeGame = window.snakeGameInstance;
        }
    }
    
    setupModeButtons() {
        const swipeBtn = document.getElementById('swipe-mode');
        const dragBtn = document.getElementById('drag-mode');
        const buttonBtn = document.getElementById('button-mode');
        
        if (swipeBtn) {
            swipeBtn.addEventListener('click', () => this.switchMode('swipe'));
        }
        if (dragBtn) {
            dragBtn.addEventListener('click', () => this.switchMode('drag'));
        }
        if (buttonBtn) {
            buttonBtn.addEventListener('click', () => this.switchMode('button'));
        }
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${mode}-mode`).classList.add('active');
        
        // Update control areas
        document.querySelectorAll('.control-area').forEach(area => {
            area.classList.remove('active');
        });
        document.getElementById(`${mode}-control`).classList.add('active');
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    setupSwipeControls() {
        const swipeZone = document.querySelector('.swipe-zone');
        if (!swipeZone) return;
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        swipeZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            
            // Visual feedback
            swipeZone.style.background = 'rgba(0, 255, 255, 0.1)';
        }, { passive: false });
        
        swipeZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            touchEndX = e.touches[0].clientX;
            touchEndY = e.touches[0].clientY;
        }, { passive: false });
        
        swipeZone.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            // Reset visual feedback
            swipeZone.style.background = 'rgba(0, 255, 255, 0.05)';
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) < minSwipeDistance && Math.abs(deltaY) < minSwipeDistance) {
                return; // Not a swipe
            }
            
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    this.sendDirection('right');
                } else {
                    this.sendDirection('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    this.sendDirection('down');
                } else {
                    this.sendDirection('up');
                }
            }
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }, { passive: false });
    }
    
    setupDragControls() {
        const dragSnake = document.getElementById('drag-snake');
        if (!dragSnake) return;
        
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;
        
        dragSnake.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            
            dragSnake.style.transform = 'scale(1.1)';
            dragSnake.style.filter = 'brightness(1.2)';
        }, { passive: false });
        
        dragSnake.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            
            // Visual feedback - move the snake slightly
            dragSnake.style.transform = `scale(1.1) translate(${deltaX * 0.1}px, ${deltaY * 0.1}px)`;
        }, { passive: false });
        
        dragSnake.addEventListener('touchend', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            
            this.isDragging = false;
            
            // Reset visual state
            dragSnake.style.transform = 'scale(1)';
            dragSnake.style.filter = 'brightness(1)';
            
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const minDragDistance = 20;
            
            if (Math.abs(deltaX) < minDragDistance && Math.abs(deltaY) < minDragDistance) {
                return; // Not a significant drag
            }
            
            // Determine drag direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal drag
                if (deltaX > 0) {
                    this.sendDirection('right');
                } else {
                    this.sendDirection('left');
                }
            } else {
                // Vertical drag
                if (deltaY > 0) {
                    this.sendDirection('down');
                } else {
                    this.sendDirection('up');
                }
            }
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(40);
            }
        }, { passive: false });
    }
    
    setupButtonControls() {
        const upBtn = document.getElementById('control-up');
        const downBtn = document.getElementById('control-down');
        const leftBtn = document.getElementById('control-left');
        const rightBtn = document.getElementById('control-right');
        
        if (upBtn) {
            upBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.sendDirection('up');
                this.animateButton(upBtn);
            }, { passive: false });
        }
        
        if (downBtn) {
            downBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.sendDirection('down');
                this.animateButton(downBtn);
            }, { passive: false });
        }
        
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.sendDirection('left');
                this.animateButton(leftBtn);
            }, { passive: false });
        }
        
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.sendDirection('right');
                this.animateButton(rightBtn);
            }, { passive: false });
        }
        
        // Also add click events for desktop testing
        [upBtn, downBtn, leftBtn, rightBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    const direction = btn.id.replace('control-', '');
                    this.sendDirection(direction);
                    this.animateButton(btn);
                });
            }
        });
    }
    
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        button.style.background = 'rgba(0, 255, 255, 0.3)';
        button.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
        
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.background = 'rgba(0, 255, 255, 0.1)';
            button.style.boxShadow = 'none';
        }, 150);
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(25);
        }
    }
    
    sendDirection(direction) {
        // Try to send direction to snake game
        const canvas = document.getElementById('snake-game');
        if (!canvas) return;
        
        // Create a custom keyboard event to simulate key press
        const keyMap = {
            'up': 'ArrowUp',
            'down': 'ArrowDown',
            'left': 'ArrowLeft',
            'right': 'ArrowRight'
        };
        
        const keyEvent = new KeyboardEvent('keydown', {
            key: keyMap[direction],
            code: keyMap[direction],
            bubbles: true
        });
        
        document.dispatchEvent(keyEvent);
        
        // Also try to directly control the snake game if we have a reference
        if (this.snakeGame && this.snakeGame.gameRunning && !this.snakeGame.gamePaused) {
            switch(direction) {
                case 'up':
                    if (this.snakeGame.dy !== 1) {
                        this.snakeGame.dx = 0;
                        this.snakeGame.dy = -1;
                    }
                    break;
                case 'down':
                    if (this.snakeGame.dy !== -1) {
                        this.snakeGame.dx = 0;
                        this.snakeGame.dy = 1;
                    }
                    break;
                case 'left':
                    if (this.snakeGame.dx !== 1) {
                        this.snakeGame.dx = -1;
                        this.snakeGame.dy = 0;
                    }
                    break;
                case 'right':
                    if (this.snakeGame.dx !== -1) {
                        this.snakeGame.dx = 1;
                        this.snakeGame.dy = 0;
                    }
                    break;
            }
        }
        
        console.log(`Mobile control: ${direction}`);
    }
}