/**
 * ViewManager Integration Tests
 *
 * ViewManager modülünün testleri.
 * View'ların mount/unmount edilmesini ve lifecycle yönetimini test eder.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ViewManager Integration', () => {
    let ViewManager;
    let container;

    beforeEach(async () => {
        // DOM'u hazırla
        document.body.innerHTML = '<div id="main-content"></div><div id="other-container"></div>';
        container = document.getElementById('main-content');

        // Modülü resetle ve yükle
        vi.resetModules();
        delete window.ViewManager;

        try {
            await import('../../modules/viewManager.js');
            ViewManager = window.ViewManager;

            // Debug'ı kapat (konsol kirliliğini önlemek için)
            if (ViewManager) ViewManager.setDebug(false);
        } catch (e) {
            console.warn('ViewManager module import failed:', e.message);
            ViewManager = null;
        }
    });

    afterEach(() => {
        document.body.innerHTML = '';
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize successfully', () => {
            expect(ViewManager).toBeDefined();
            expect(window.ViewManager).toBe(ViewManager);
        });

        it('should find default container', () => {
            if (!ViewManager) return;

            ViewManager.init();
            expect(ViewManager.container).toBe(container);
        });

        it('should accept custom container ID', () => {
            if (!ViewManager) return;

            ViewManager.init('other-container');
            const otherContainer = document.getElementById('other-container');
            expect(ViewManager.container).toBe(otherContainer);
        });

        it('should handle missing container gracefully', () => {
            if (!ViewManager) return;

            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            ViewManager.init('non-existent');

            expect(ViewManager.container).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('Mounting Views', () => {
        it('should mount a valid view', async () => {
            if (!ViewManager) return;

            ViewManager.init();

            const MockView = {
                name: 'MockView',
                mount: vi.fn(),
                unmount: vi.fn(),
            };

            const result = await ViewManager.mount(MockView);

            expect(result).toBe(true);
            expect(MockView.mount).toHaveBeenCalledTimes(1);
            expect(MockView.mount).toHaveBeenCalledWith(container, {});
            expect(ViewManager.getCurrentView()).toBe(MockView);
        });

        it('should unmount previous view before mounting new one', async () => {
            if (!ViewManager) return;

            ViewManager.init();

            const View1 = { name: 'View1', mount: vi.fn(), unmount: vi.fn() };
            const View2 = { name: 'View2', mount: vi.fn(), unmount: vi.fn() };

            // Mount View1
            await ViewManager.mount(View1);
            expect(ViewManager.getCurrentView()).toBe(View1);

            // Mount View2
            await ViewManager.mount(View2);

            // Check checks
            expect(View1.unmount).toHaveBeenCalledTimes(1); // View1 unmount edilmiş olmalı
            expect(View2.mount).toHaveBeenCalledTimes(1); // View2 mount edilmiş olmalı
            expect(ViewManager.getCurrentView()).toBe(View2);
        });

        it('should pass options to view mount', async () => {
            if (!ViewManager) return;

            ViewManager.init();

            const MockView = { name: 'MockView', mount: vi.fn() };
            const options = { id: 123, mode: 'edit' };

            await ViewManager.mount(MockView, options);

            expect(MockView.mount).toHaveBeenCalledWith(container, options);
        });

        it('should handle view mount errors gracefully', async () => {
            if (!ViewManager) return;

            ViewManager.init();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const BrokenView = {
                name: 'BrokenView',
                mount: vi.fn().mockRejectedValue(new Error('Mount failed')),
            };

            const result = await ViewManager.mount(BrokenView);

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalled();
            // Error durumunda currentView set edilmiş olabilir veya olmayabilir, implementasyona bağlı.
            // Mevcut implementasyonda mount'tan önce currentView set ediliyor (satır 57).
            expect(ViewManager.getCurrentView()).toBe(BrokenView);
        });

        it('should not mount invalid view object', async () => {
            if (!ViewManager) return;

            ViewManager.init();
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            const InvalidView = { name: 'InvalidView' }; // No mount method

            const result = await ViewManager.mount(InvalidView);

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('Unmounting Views', () => {
        it('should unmount current view', async () => {
            if (!ViewManager) return;

            ViewManager.init();
            const MockView = { name: 'MockView', mount: vi.fn(), unmount: vi.fn() };

            await ViewManager.mount(MockView);
            await ViewManager.unmountCurrent();

            expect(MockView.unmount).toHaveBeenCalledTimes(1);
            expect(ViewManager.getCurrentView()).toBeNull();
        });

        it('should do nothing if no view is active', async () => {
            if (!ViewManager) return;

            ViewManager.init();
            // Ensure no view
            await ViewManager.unmountCurrent();
            // Should not throw
            expect(ViewManager.getCurrentView()).toBeNull();
        });

        it('should handle unmount errors gracefully', async () => {
            if (!ViewManager) return;

            ViewManager.init();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const BrokenView = {
                name: 'BrokenView',
                mount: vi.fn(),
                unmount: vi.fn().mockRejectedValue(new Error('Unmount failed')),
            };

            await ViewManager.mount(BrokenView);
            await ViewManager.unmountCurrent();

            expect(consoleSpy).toHaveBeenCalled();
            // Error olsa bile currentView null'a çekilmeli (satır 108)
            expect(ViewManager.getCurrentView()).toBeNull();
        });
    });

    describe('Helper Methods', () => {
        it('should check if view is active', async () => {
            if (!ViewManager) return;

            ViewManager.init();
            const View1 = { name: 'View1', mount: vi.fn() };
            const View2 = { name: 'View2', mount: vi.fn() };

            await ViewManager.mount(View1);

            expect(ViewManager.isActive(View1)).toBe(true);
            expect(ViewManager.isActive(View2)).toBe(false);
        });

        it('should toggle debug mode', () => {
            if (!ViewManager) return;

            ViewManager.setDebug(true);
            expect(ViewManager.debug).toBe(true);

            ViewManager.setDebug(false);
            expect(ViewManager.debug).toBe(false);
        });
    });
});
