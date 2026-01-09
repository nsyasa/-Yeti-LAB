/**
 * Services Module Tests
 * Tests for the Services wrapper module
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the module (this will set window.Services)
import '../modules/core/services.js';

describe('Services Module', () => {
    describe('Services availability', () => {
        it('should be defined on window', () => {
            expect(window.Services).toBeDefined();
        });

        it('should have toast methods', () => {
            expect(window.Services.toast).toBeDefined();
            expect(typeof window.Services.toast.success).toBe('function');
            expect(typeof window.Services.toast.error).toBe('function');
            expect(typeof window.Services.toast.warning).toBe('function');
            expect(typeof window.Services.toast.info).toBe('function');
        });

        it('should have i18n methods', () => {
            expect(window.Services.i18n).toBeDefined();
            expect(typeof window.Services.i18n.t).toBe('function');
            expect(typeof window.Services.i18n.getCurrentLang).toBe('function');
        });

        it('should have router methods', () => {
            expect(window.Services.router).toBeDefined();
            expect(typeof window.Services.router.navigate).toBe('function');
            expect(typeof window.Services.router.redirectTo).toBe('function');
        });

        it('should have store methods', () => {
            expect(window.Services.store).toBeDefined();
            expect(typeof window.Services.store.getState).toBe('function');
            expect(typeof window.Services.store.setState).toBe('function');
        });

        it('should have theme methods', () => {
            expect(window.Services.theme).toBeDefined();
            expect(typeof window.Services.theme.getCurrent).toBe('function');
            expect(typeof window.Services.theme.toggle).toBe('function');
        });

        it('should have isAvailable check method', () => {
            expect(typeof window.Services.isAvailable).toBe('function');
        });
    });

    describe('Fallback behavior', () => {
        beforeEach(() => {
            // Clear any mocked globals
            window.Toast = undefined;
            window.I18n = undefined;
            window.Router = undefined;
        });

        afterEach(() => {
            // Restore
            vi.restoreAllMocks();
        });

        it('toast.success should fallback to console.log when Toast is undefined', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
            window.Services.toast.success('test message');
            expect(consoleSpy).toHaveBeenCalledWith('✓', 'test message');
        });

        it('toast.error should fallback to console.error when Toast is undefined', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            window.Services.toast.error('error message');
            expect(consoleSpy).toHaveBeenCalledWith('✗', 'error message');
        });

        it('i18n.t should return key when I18n is undefined', () => {
            const result = window.Services.i18n.t('some_key');
            expect(result).toBe('some_key');
        });

        it('i18n.getCurrentLang should return tr when I18n is undefined', () => {
            const result = window.Services.i18n.getCurrentLang();
            expect(result).toBe('tr');
        });

        it('isAvailable should return false for undefined services', () => {
            expect(window.Services.isAvailable('toast')).toBe(false);
            expect(window.Services.isAvailable('i18n')).toBe(false);
            expect(window.Services.isAvailable('router')).toBe(false);
        });
    });

    describe('When dependencies are available', () => {
        it('should call Toast.success when available', () => {
            const mockToast = { success: vi.fn() };
            window.Toast = mockToast;

            window.Services.toast.success('hello');
            expect(mockToast.success).toHaveBeenCalledWith('hello');

            window.Toast = undefined;
        });

        it('should call I18n.t when available', () => {
            const mockI18n = { t: vi.fn().mockReturnValue('translated') };
            window.I18n = mockI18n;

            const result = window.Services.i18n.t('key', { param: 1 });
            expect(mockI18n.t).toHaveBeenCalledWith('key', { param: 1 });
            expect(result).toBe('translated');

            window.I18n = undefined;
        });

        it('isAvailable should return true when service exists', () => {
            window.Toast = { success: () => {} };
            expect(window.Services.isAvailable('toast')).toBe(true);
            window.Toast = undefined;
        });
    });
});
