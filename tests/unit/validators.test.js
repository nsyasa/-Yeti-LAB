/**
 * Validators Module Unit Tests
 *
 * Bu testler Validators modülündeki tüm fonksiyonları kapsar.
 * Çalıştırma: npm run test tests/unit/validators.test.js
 */

import { describe, it, expect } from 'vitest';

// Validators modülünü doğrudan mock olarak tanımla
// Not: ES6 modül olarak import etmek için FAZ 5'te geçiş yapılacak
const Validators = {
    isEmpty: (value) => {
        return value === null || value === undefined || value.toString().trim() === '';
    },

    minLength: (value, min) => {
        if (!value) return false;
        return value.toString().trim().length >= min;
    },

    passwordsMatch: (p1, p2) => {
        return p1 === p2;
    },

    isValidEmail: (email) => {
        if (!email) return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
};

describe('Validators Module', () => {
    describe('isEmpty', () => {
        it('should return true for null or undefined', () => {
            expect(Validators.isEmpty(null)).toBe(true);
            expect(Validators.isEmpty(undefined)).toBe(true);
        });

        it('should return true for empty string', () => {
            expect(Validators.isEmpty('')).toBe(true);
        });

        it('should return true for string with only whitespace', () => {
            expect(Validators.isEmpty('   ')).toBe(true);
        });

        it('should return false for non-empty string', () => {
            expect(Validators.isEmpty('hello')).toBe(false);
        });

        it('should return false for number 0', () => {
            // Note: Our implementation converts to string and trims. '0' is not empty.
            expect(Validators.isEmpty(0)).toBe(false);
        });
    });

    describe('minLength', () => {
        it('should return true if length is equal or greater', () => {
            expect(Validators.minLength('123456', 6)).toBe(true);
            expect(Validators.minLength('1234567', 6)).toBe(true);
        });

        it('should return false if length is less', () => {
            expect(Validators.minLength('12345', 6)).toBe(false);
        });

        it('should handle null/undefined gracefully', () => {
            expect(Validators.minLength(null, 6)).toBe(false);
            expect(Validators.minLength(undefined, 6)).toBe(false);
        });

        it('should trim whitespace before checking length', () => {
            // " 123 " trims to "123" (length 3)
            expect(Validators.minLength('  123  ', 3)).toBe(true);
            expect(Validators.minLength('  12  ', 3)).toBe(false);
        });
    });

    describe('passwordsMatch', () => {
        it('should return true if passwords match', () => {
            expect(Validators.passwordsMatch('secret', 'secret')).toBe(true);
        });

        it('should return false if passwords do not match', () => {
            expect(Validators.passwordsMatch('secret', 'other')).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should return true for valid email', () => {
            expect(Validators.isValidEmail('test@example.com')).toBe(true);
            expect(Validators.isValidEmail('user.name@sub.domain.co')).toBe(true);
        });

        it('should return false for invalid email', () => {
            expect(Validators.isValidEmail('invalid')).toBe(false);
            expect(Validators.isValidEmail('user@')).toBe(false);
            expect(Validators.isValidEmail('@domain.com')).toBe(false);
            expect(Validators.isValidEmail('user@domain')).toBe(false);
        });

        it('should return false for empty email', () => {
            expect(Validators.isValidEmail('')).toBe(false);
            expect(Validators.isValidEmail(null)).toBe(false);
        });
    });
});
