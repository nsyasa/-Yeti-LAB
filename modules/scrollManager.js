/**
 * Scroll Manager Module - Enhanced Smart Scroll
 * Handles scroll interactions, header visibility, and scroll-based UI updates.
 *
 * Features:
 * - Smart header/bottom nav hide/show on scroll direction
 * - Delta threshold to prevent jittery behavior
 * - Velocity detection for responsive feedback
 * - Mobile touch support with momentum scroll
 * - Performance optimized with requestAnimationFrame
 */

const ScrollManager = {
    // Configuration
    config: {
        // Minimum scroll delta (px) before triggering hide/show
        scrollDelta: 8,
        // Distance from top where header is always visible
        topThreshold: 80,
        // Velocity threshold for instant hide (faster = more sensitive)
        velocityThreshold: 15,
        // Delay before allowing another toggle (ms)
        toggleCooldown: 100,
    },

    // State tracking
    state: {
        lastScrollY: 0,
        lastScrollTime: Date.now(),
        ticking: false,
        isHidden: false,
        lastToggleTime: 0,
        // Accumulated scroll delta for smoother detection
        accumulatedDelta: 0,
        // Touch tracking for mobile
        touchStartY: 0,
        isTouching: false,
    },

    // DOM references (cached for performance)
    elements: {
        header: null,
        bottomNav: null,
    },

    /**
     * Initialize scroll listeners
     */
    init() {
        // Cache DOM elements
        this.elements.header = document.getElementById('main-header');
        this.elements.bottomNav = document.getElementById('mobile-bottom-nav');

        // Main scroll listener
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });

        // Touch events for mobile (better momentum detection)
        window.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });

        // Visibility change - show nav when returning to tab
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.show();
            }
        });

        // Resize handler - show nav on resize
        window.addEventListener(
            'resize',
            this.debounce(() => {
                if (window.scrollY < this.config.topThreshold) {
                    this.show();
                }
            }, 150)
        );

        // Initial state
        this.handleScroll();

        console.log('📜 ScrollManager initialized (Smart Scroll active)');
    },

    /**
     * Handle touch start (mobile)
     */
    handleTouchStart(e) {
        this.state.touchStartY = e.touches[0].clientY;
        this.state.isTouching = true;
    },

    /**
     * Handle touch end (mobile)
     */
    handleTouchEnd() {
        this.state.isTouching = false;
    },

    /**
     * Handle window scroll event with RequestAnimationFrame throttle
     */
    handleScroll() {
        if (!this.state.ticking) {
            window.requestAnimationFrame(() => {
                this.updateNavVisibility();
                this.state.ticking = false;
            });
            this.state.ticking = true;
        }
    },

    /**
     * Core logic for showing/hiding navigation
     */
    updateNavVisibility() {
        const currentScrollY = window.scrollY;
        const now = Date.now();
        const timeDelta = now - this.state.lastScrollTime;
        const scrollDelta = currentScrollY - this.state.lastScrollY;

        // Calculate velocity (pixels per ms)
        const velocity = timeDelta > 0 ? (Math.abs(scrollDelta) / timeDelta) * 16 : 0;

        // Update header backdrop based on scroll position
        this.updateHeaderBackdrop(currentScrollY);

        // At top of page - always show nav
        if (currentScrollY <= this.config.topThreshold) {
            this.show();
            this.resetState(currentScrollY, now);
            return;
        }

        // Check cooldown
        if (now - this.state.lastToggleTime < this.config.toggleCooldown) {
            this.state.lastScrollY = currentScrollY;
            return;
        }

        // Accumulate scroll delta
        if (Math.sign(scrollDelta) === Math.sign(this.state.accumulatedDelta)) {
            this.state.accumulatedDelta += scrollDelta;
        } else {
            // Direction changed - reset accumulator
            this.state.accumulatedDelta = scrollDelta;
        }

        const absAccumulatedDelta = Math.abs(this.state.accumulatedDelta);

        // Fast scroll - instant response
        if (velocity >= this.config.velocityThreshold) {
            if (scrollDelta > 0) {
                this.hide();
            } else {
                this.show();
            }
            this.state.lastToggleTime = now;
        }
        // Normal scroll - check delta threshold
        else if (absAccumulatedDelta >= this.config.scrollDelta) {
            if (this.state.accumulatedDelta > 0 && !this.state.isHidden) {
                // Scrolling DOWN - hide nav
                this.hide();
                this.state.lastToggleTime = now;
            } else if (this.state.accumulatedDelta < 0 && this.state.isHidden) {
                // Scrolling UP - show nav
                this.show();
                this.state.lastToggleTime = now;
            }
            // Reset accumulator after action
            this.state.accumulatedDelta = 0;
        }

        this.state.lastScrollY = currentScrollY;
        this.state.lastScrollTime = now;
    },

    /**
     * Update header backdrop effect
     */
    updateHeaderBackdrop(scrollY) {
        const header = this.elements.header;
        if (!header) return;

        if (scrollY <= 10) {
            // At very top - transparent header
            header.classList.remove('header-scrolled');
        } else {
            // Scrolled - add backdrop
            header.classList.add('header-scrolled');
        }
    },

    /**
     * Hide header and bottom nav
     */
    hide() {
        if (this.state.isHidden) return;

        this.elements.header?.classList.add('nav-hidden');
        this.elements.bottomNav?.classList.add('nav-hidden');
        this.state.isHidden = true;
    },

    /**
     * Show header and bottom nav
     */
    show() {
        if (!this.state.isHidden && window.scrollY > this.config.topThreshold) return;

        this.elements.header?.classList.remove('nav-hidden');
        this.elements.bottomNav?.classList.remove('nav-hidden');
        this.state.isHidden = false;
    },

    /**
     * Reset state tracking
     */
    resetState(scrollY, time) {
        this.state.lastScrollY = scrollY;
        this.state.lastScrollTime = time;
        this.state.accumulatedDelta = 0;
    },

    /**
     * Force show (useful for programmatic control)
     */
    forceShow() {
        this.show();
        this.state.lastToggleTime = 0;
    },

    /**
     * Debounce helper
     */
    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Check if nav is currently hidden
     */
    isNavHidden() {
        return this.state.isHidden;
    },
};

// Expose globally
if (typeof window !== 'undefined') {
    window.ScrollManager = ScrollManager;
}
