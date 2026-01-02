import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load validators.js manually since it's not a module yet
const validatorsPath = path.resolve(__dirname, '../../modules/validators.js');
const validatorsScript = fs.readFileSync(validatorsPath, 'utf8');

describe('Validators Module', () => {
    beforeEach(() => {
        // Evaluate script in global scope
        eval(validatorsScript);
    });

    afterEach(() => {
        delete window.Validators;
    });

    describe('isEmpty', () => {
        it('should return true for null or undefined', () => {
            expect(window.Validators.isEmpty(null)).toBe(true);
            expect(window.Validators.isEmpty(undefined)).toBe(true);
        });

        it('should return true for empty string', () => {
            expect(window.Validators.isEmpty('')).toBe(true);
        });

        it('should return true for string with only whitespace', () => {
            expect(window.Validators.isEmpty('   ')).toBe(true);
        });

        it('should return false for non-empty string', () => {
            expect(window.Validators.isEmpty('hello')).toBe(false);
        });

        it('should return false for number 0', () => {
            // Note: Our implementation converts to string and trims. '0' is not empty.
            expect(window.Validators.isEmpty(0)).toBe(false);
        });
    });

    describe('minLength', () => {
        it('should return true if length is equal or greater', () => {
            expect(window.Validators.minLength('123456', 6)).toBe(true);
            expect(window.Validators.minLength('1234567', 6)).toBe(true);
        });

        it('should return false if length is less', () => {
            expect(window.Validators.minLength('12345', 6)).toBe(false);
        });

        it('should handle null/undefined gracefully', () => {
            expect(window.Validators.minLength(null, 6)).toBe(false);
            expect(window.Validators.minLength(undefined, 6)).toBe(false);
        });

        it('should trim whitespace before checking length', () => {
            // " 123 " trims to "123" (length 3)
            expect(window.Validators.minLength('  123  ', 3)).toBe(true);
            expect(window.Validators.minLength('  12  ', 3)).toBe(false);
        });
    });

    describe('passwordsMatch', () => {
        it('should return true if passwords match', () => {
            expect(window.Validators.passwordsMatch('secret', 'secret')).toBe(true);
        });

        it('should return false if passwords do not match', () => {
            expect(window.Validators.passwordsMatch('secret', 'other')).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should return true for valid email', () => {
            expect(window.Validators.isValidEmail('test@example.com')).toBe(true);
            expect(window.Validators.isValidEmail('user.name@sub.domain.co')).toBe(true);
        });

        it('should return false for invalid email', () => {
            expect(window.Validators.isValidEmail('invalid')).toBe(false);
            expect(window.Validators.isValidEmail('user@')).toBe(false);
            expect(window.Validators.isValidEmail('@domain.com')).toBe(false);
            expect(window.Validators.isValidEmail('user@domain')).toBe(false); // Simple regex usually requires dot
        });

        it('should return false for empty email', () => {
            expect(window.Validators.isValidEmail('')).toBe(false);
            expect(window.Validators.isValidEmail(null)).toBe(false);
        });
    });
});
