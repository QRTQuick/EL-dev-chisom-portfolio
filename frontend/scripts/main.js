// Portfolio Animation System
class PortfolioAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollAnimations();
        this.setupTypewriter();
        this.setupParticles();
        this.setupSkillAnimations();
        this.setupProjectsLoader();
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
        window.a