/**
 * Router Module Integration Tests
 *
 * Bu testler GERÇEK Router modülünü ve tarayıcı entegrasyonunu test eder.
 * JSDOM üzerinde hashchange ve navigation olaylarını simüle eder.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Router Integration', () => {
    let Router;
    let mockStore;

    beforeEach(async () => {
        // Mock Store (Router, Store.emit kullanıyor)
        mockStore = {
            emit: vi.fn(),
            on: vi.fn(),
            off: vi.fn(),
        };
        window.Store = mockStore;

        // Reset Modules & Window
        vi.resetModules();
        delete window.Router;
        window.location.hash = '';

        // Mock Performance API explicitly
        window.Performance = {
            mark: vi.fn(),
            measure: vi.fn(),
        };
        // Also mock lowercase performance just in case
        window.performance = window.Performance;

        try {
            await import('../../modules/router.js');
            Router = window.Router;
        } catch (e) {
            console.warn('Router module import failed:', e.message);
            Router = null;
        }
    });

    afterEach(() => {
        window.location.hash = '';
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize successfully', () => {
            expect(Router).toBeDefined();
            expect(window.Router).toBe(Router);
        });

        it('should set up hashchange listener on init', () => {
            if (!Router) return;

            const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            Router.init();

            expect(addEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
        });

        it('should handle initial route on init', () => {
            if (!Router) return;

            window.location.hash = '#/course/arduino';

            Router.init(); // Should parse hash immediately

            expect(Router.currentRoute).toBeDefined();
            // currentRoute format: { route: 'course', params: { key: 'arduino' }, path: 'course/arduino' }
            expect(Router.currentRoute.route).toBe('course');
            expect(Router.currentRoute.params.key).toBe('arduino');
        });
    });

    describe('Parsing & Matching', () => {
        it('should parse simple hash', () => {
            if (!Router) return;

            window.location.hash = '#/admin';
            const { path, segments } = Router.parseHash();

            expect(path).toBe('admin');
            expect(segments).toEqual(['admin']);
        });

        it('should parse nested hash', () => {
            if (!Router) return;

            window.location.hash = '#/course/arduino/project/123';
            const { path, segments } = Router.parseHash();

            expect(path).toBe('course/arduino/project/123');
            expect(segments).toEqual(['course', 'arduino', 'project', '123']);
        });

        it('should match home route', () => {
            if (!Router) return;

            const { route, params } = Router.matchRoute('');
            expect(route).toBe('home');
            expect(params).toEqual({});
        });

        it('should match static route', () => {
            if (!Router) return;

            const { route, params } = Router.matchRoute('admin/projects');
            expect(route).toBe('admin-projects');
            expect(params).toEqual({});
        });

        it('should match dynamic route with params', () => {
            if (!Router) return;

            const { route, params } = Router.matchRoute('course/arduino');
            expect(route).toBe('course');
            expect(params).toEqual({ key: 'arduino' });
        });

        it('should match complex dynamic route', () => {
            if (!Router) return;

            const { route, params } = Router.matchRoute('course/microbit/project/5');
            expect(route).toBe('project');
            expect(params).toEqual({ key: 'microbit', id: '5' });
        });

        it('should fallback to home for unknown route', () => {
            if (!Router) return;

            const { route } = Router.matchRoute('unknown/path/here');
            expect(route).toBe('home');
        });
    });

    describe('Navigation', () => {
        it('should update hash on navigate', () => {
            if (!Router) return;

            Router.navigate('/admin');
            expect(window.location.hash).toBe('#/admin');
        });

        it('should handle paths without leading slash', () => {
            if (!Router) return;

            Router.navigate('course/arduino');
            expect(window.location.hash).toBe('#/course/arduino');
        });
    });

    describe('Event Handling', () => {
        it('should update currentRoute and emit event on hashchange', async () => {
            if (!Router) return;

            Router.init();

            // Simulate hashchange
            window.location.hash = '#/teacher';
            window.dispatchEvent(new HashChangeEvent('hashchange'));

            // Wait for event loop
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(Router.currentRoute).toBeDefined();
            expect(Router.currentRoute.route).toBe('teacher');
            expect(mockStore.emit).toHaveBeenCalledWith('route:change', Router.currentRoute);
        });
    });

    describe('Legacy Support', () => {
        // JSDOM has read-only window.location limitations, so we mock URLSearchParams logic
        it('should detect legacy query params', () => {
            if (!Router) return;

            // Mock window.location.search
            const originalSearch = window.location.search;
            Object.defineProperty(window, 'location', {
                value: {
                    ...window.location,
                    search: '?course=arduino&project=10',
                    pathname: '/',
                    hash: '',
                },
                writable: true,
            });

            // Mock replacement methods
            Router.navigate = vi.fn();
            window.history.replaceState = vi.fn();

            const result = Router.checkLegacyParams();

            expect(result).toBe(true);
            expect(Router.navigate).toHaveBeenCalledWith('/course/arduino/project/10');
        });
    });

    describe('Redirect Logic (redirectTo)', () => {
        it('should navigate via hash for SPA routes', () => {
            if (!Router) return;

            Router.navigate = vi.fn(); // Mock navigate to intercept

            // Test case: Navigate to admin.html inside SPA
            Router.redirectTo('admin.html');

            expect(Router.navigate).toHaveBeenCalledWith('/admin');
        });
    });
});
