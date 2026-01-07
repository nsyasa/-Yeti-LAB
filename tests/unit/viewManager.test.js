/**
 * ViewManager Unit Tests
 *
 * Tests for the SPA view lifecycle management module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ViewManager', () => {
    let ViewManager;
    let mockContainer;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '<div id="main-content"></div>';
        mockContainer = document.getElementById('main-content');

        // Create fresh ViewManager instance
        ViewManager = {
            currentView: null,
            currentViewName: null,
            container: null,
            debug: false,

            init(containerId = 'main-content') {
                this.container = document.getElementById(containerId) || document.querySelector('main');
                if (!this.container) {
                    console.warn('[ViewManager] Container not found:', containerId);
                }
            },

            async mount(View, options = {}) {
                if (!View) {
                    console.error('[ViewManager] No view provided to mount');
                    return false;
                }

                // Unmount previous view
                await this.unmountCurrent();

                // Store reference
                this.currentView = View;
                this.currentViewName = View.name || 'UnnamedView';

                // Get container from options or use default
                const container = options.container || this.container;

                // Mount new view
                if (typeof View.mount === 'function') {
                    try {
                        const result = await View.mount(container, options);
                        return result !== false;
                    } catch (error) {
                        console.error('[ViewManager] Mount error:', error);
                        return false;
                    }
                }

                return true;
            },

            async unmountCurrent() {
                if (!this.currentView) return;

                const viewName = this.currentViewName || 'previous view';

                if (typeof this.currentView.unmount === 'function') {
                    try {
                        await this.currentView.unmount();
                    } catch (error) {
                        console.error('[ViewManager] Unmount error:', error);
                    }
                }

                this.currentView = null;
                this.currentViewName = null;
            },

            getCurrentView() {
                return this.currentView;
            },

            isActive(View) {
                return this.currentView === View;
            },
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('init()', () => {
        it('should initialize with main-content container by default', () => {
            ViewManager.init();
            expect(ViewManager.container).toBe(mockContainer);
        });

        it('should initialize with custom container id', () => {
            document.body.innerHTML = '<div id="custom-container"></div>';
            ViewManager.init('custom-container');
            expect(ViewManager.container).toBe(document.getElementById('custom-container'));
        });

        it('should handle missing container gracefully', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            document.body.innerHTML = '';
            ViewManager.init('non-existent');
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('mount()', () => {
        it('should mount a view with mount method', async () => {
            ViewManager.init();

            const mockView = {
                name: 'TestView',
                mount: vi.fn().mockResolvedValue(true),
            };

            const result = await ViewManager.mount(mockView, {});
            expect(result).toBe(true);
            expect(mockView.mount).toHaveBeenCalledWith(mockContainer, {});
            expect(ViewManager.currentView).toBe(mockView);
            expect(ViewManager.currentViewName).toBe('TestView');
        });

        it('should pass options to view mount', async () => {
            ViewManager.init();

            const mockView = {
                name: 'TestView',
                mount: vi.fn().mockResolvedValue(true),
            };

            const options = { route: 'admin', container: mockContainer };
            await ViewManager.mount(mockView, options);
            expect(mockView.mount).toHaveBeenCalledWith(mockContainer, options);
        });

        it('should unmount previous view before mounting new one', async () => {
            ViewManager.init();

            const oldView = {
                name: 'OldView',
                mount: vi.fn().mockResolvedValue(true),
                unmount: vi.fn(),
            };

            const newView = {
                name: 'NewView',
                mount: vi.fn().mockResolvedValue(true),
            };

            // Mount first view
            await ViewManager.mount(oldView);
            expect(ViewManager.currentView).toBe(oldView);

            // Mount second view
            await ViewManager.mount(newView);

            // Old view should be unmounted
            expect(oldView.unmount).toHaveBeenCalled();
            // New view should be current
            expect(ViewManager.currentView).toBe(newView);
        });

        it('should return false when no view provided', async () => {
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = await ViewManager.mount(null);
            expect(result).toBe(false);
            errorSpy.mockRestore();
        });

        it('should handle mount errors gracefully', async () => {
            ViewManager.init();
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const errorView = {
                name: 'ErrorView',
                mount: vi.fn().mockRejectedValue(new Error('Mount failed')),
            };

            const result = await ViewManager.mount(errorView);
            expect(result).toBe(false);
            expect(errorSpy).toHaveBeenCalled();
            errorSpy.mockRestore();
        });

        it('should handle view without mount method', async () => {
            ViewManager.init();

            const simpleView = {
                name: 'SimpleView',
            };

            const result = await ViewManager.mount(simpleView);
            expect(result).toBe(true);
            expect(ViewManager.currentView).toBe(simpleView);
        });
    });

    describe('unmountCurrent()', () => {
        it('should unmount current view', async () => {
            ViewManager.init();

            const mockView = {
                name: 'TestView',
                mount: vi.fn().mockResolvedValue(true),
                unmount: vi.fn(),
            };

            await ViewManager.mount(mockView);
            await ViewManager.unmountCurrent();

            expect(mockView.unmount).toHaveBeenCalled();
            expect(ViewManager.currentView).toBeNull();
            expect(ViewManager.currentViewName).toBeNull();
        });

        it('should do nothing when no view is mounted', async () => {
            ViewManager.init();
            // Should not throw
            await ViewManager.unmountCurrent();
            expect(ViewManager.currentView).toBeNull();
        });

        it('should handle unmount errors gracefully', async () => {
            ViewManager.init();
            const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const errorView = {
                name: 'ErrorView',
                mount: vi.fn().mockResolvedValue(true),
                unmount: vi.fn().mockRejectedValue(new Error('Unmount failed')),
            };

            await ViewManager.mount(errorView);
            await ViewManager.unmountCurrent();

            expect(errorSpy).toHaveBeenCalled();
            expect(ViewManager.currentView).toBeNull();
            errorSpy.mockRestore();
        });
    });

    describe('getCurrentView()', () => {
        it('should return current view', async () => {
            ViewManager.init();

            const mockView = {
                name: 'TestView',
                mount: vi.fn().mockResolvedValue(true),
            };

            await ViewManager.mount(mockView);
            expect(ViewManager.getCurrentView()).toBe(mockView);
        });

        it('should return null when no view mounted', () => {
            ViewManager.init();
            expect(ViewManager.getCurrentView()).toBeNull();
        });
    });

    describe('isActive()', () => {
        it('should return true for active view', async () => {
            ViewManager.init();

            const mockView = {
                name: 'TestView',
                mount: vi.fn().mockResolvedValue(true),
            };

            await ViewManager.mount(mockView);
            expect(ViewManager.isActive(mockView)).toBe(true);
        });

        it('should return false for inactive view', async () => {
            ViewManager.init();

            const view1 = { name: 'View1', mount: vi.fn().mockResolvedValue(true) };
            const view2 = { name: 'View2', mount: vi.fn().mockResolvedValue(true) };

            await ViewManager.mount(view1);
            expect(ViewManager.isActive(view2)).toBe(false);
        });

        it('should return false when no view mounted', () => {
            ViewManager.init();
            const mockView = { name: 'TestView' };
            expect(ViewManager.isActive(mockView)).toBe(false);
        });
    });

    describe('View Lifecycle Flow', () => {
        it('should maintain correct lifecycle: init -> mount -> unmount -> mount new', async () => {
            // 1. Init
            ViewManager.init();
            expect(ViewManager.container).toBeTruthy();
            expect(ViewManager.currentView).toBeNull();

            // 2. Mount first view
            const adminView = {
                name: 'AdminView',
                mount: vi.fn().mockResolvedValue(true),
                unmount: vi.fn(),
            };

            await ViewManager.mount(adminView);
            expect(ViewManager.currentView).toBe(adminView);
            expect(adminView.mount).toHaveBeenCalledTimes(1);

            // 3. Mount second view (should unmount first)
            const teacherView = {
                name: 'TeacherView',
                mount: vi.fn().mockResolvedValue(true),
                unmount: vi.fn(),
            };

            await ViewManager.mount(teacherView);
            expect(adminView.unmount).toHaveBeenCalledTimes(1);
            expect(ViewManager.currentView).toBe(teacherView);
            expect(teacherView.mount).toHaveBeenCalledTimes(1);

            // 4. Manual unmount
            await ViewManager.unmountCurrent();
            expect(teacherView.unmount).toHaveBeenCalledTimes(1);
            expect(ViewManager.currentView).toBeNull();
        });

        it('should handle rapid view switching', async () => {
            ViewManager.init();

            const views = [
                { name: 'View1', mount: vi.fn().mockResolvedValue(true), unmount: vi.fn() },
                { name: 'View2', mount: vi.fn().mockResolvedValue(true), unmount: vi.fn() },
                { name: 'View3', mount: vi.fn().mockResolvedValue(true), unmount: vi.fn() },
            ];

            // Rapid switching
            for (const view of views) {
                await ViewManager.mount(view);
            }

            // First two views should be unmounted
            expect(views[0].unmount).toHaveBeenCalled();
            expect(views[1].unmount).toHaveBeenCalled();
            // Last view should be current
            expect(ViewManager.currentView).toBe(views[2]);
        });
    });
});
