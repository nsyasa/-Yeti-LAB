/**
 * Scroll Manager Module
 * Handles scroll interactions, header visibility, and scroll-based UI updates.
 */

const ScrollManager = {
    // State to track scroll position and animation frame
    state: {
        lastScrollY: 0,
        ticking: false,
    },

    /**
     * Initialize scroll listeners
     */
    init: () => {
        window.addEventListener('scroll', ScrollManager.handleScroll, { passive: true });
        // Initial check in case page is loaded scrolled
        ScrollManager.handleScroll();
    },

    /**
     * Handle window scroll event with RequestAnimationFrame throttle
     */
    handleScroll: () => {
        if (!ScrollManager.state.ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const header = document.getElementById('main-header');
                const bottomNav = document.getElementById('mobile-bottom-nav');
                const threshold = 50; // Minimum scroll amount before hiding

                // Only apply scroll behavior after scrolling past threshold
                if (currentScrollY > threshold) {
                    if (currentScrollY > ScrollManager.state.lastScrollY) {
                        // Scrolling DOWN - hide nav
                        header?.classList.add('nav-hidden');
                        bottomNav?.classList.add('nav-hidden');
                    } else {
                        // Scrolling UP - show nav
                        header?.classList.remove('nav-hidden');
                        bottomNav?.classList.remove('nav-hidden');
                    }
                } else {
                    // At top of page - always show nav
                    header?.classList.remove('nav-hidden');
                    bottomNav?.classList.remove('nav-hidden');

                    // Optional: Remove backdrop if at very top
                    if (currentScrollY <= 10) {
                        header?.classList.remove('shadow-md', 'backdrop-blur');
                        header?.classList.add('bg-transparent');
                    } else {
                        header?.classList.add('shadow-md', 'backdrop-blur');
                        header?.classList.remove('bg-transparent');
                    }
                }

                ScrollManager.state.lastScrollY = currentScrollY;
                ScrollManager.state.ticking = false;
            });
            ScrollManager.state.ticking = true;
        }
    },
};

// Expose globally
if (typeof window !== 'undefined') {
    window.ScrollManager = ScrollManager;
}
