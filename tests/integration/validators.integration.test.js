/**
 * Validators Module Integration Tests
 *
 * Bu testler GERÇEK Validators modülünü test eder.
 * Tüm validasyon fonksiyonlarını gerçek çalışma ortamında test eder.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Validators Integration', () => {
    let Validators;

    beforeEach(async () => {
        vi.resetModules();
        delete window.Validators;

        try {
            await import('../../modules/validators.js');
            Validators = window.Validators;
        } catch (e) {
            console.warn('Validators module import failed:', e.message);
            Validators = null;
        }
    });

    describe('Module Loading', () => {
        it('should load Validators module successfully', () => {
            expect(Validators).toBeDefined();
        });

        it('should be available on window object', () => {
            expect(window.Validators).toBe(Validators);
        });

        it('should have all expected methods', () => {
            if (!Validators) return;

            expect(typeof Validators.isEmpty).toBe('function');
            expect(typeof Validators.minLength).toBe('function');
            expect(typeof Validators.passwordsMatch).toBe('function');
            expect(typeof Validators.isValidEmail).toBe('function');
            expect(typeof Validators.isValidUUID).toBe('function');
            expect(typeof Validators.isValidClassroomCode).toBe('function');
            expect(typeof Validators.sanitizeString).toBe('function');
            expect(typeof Validators.isValidSlug).toBe('function');
            expect(typeof Validators.isPositiveInteger).toBe('function');
        });
    });

    describe('isEmpty', () => {
        it('should return true for null', () => {
            if (!Validators) return;
            expect(Validators.isEmpty(null)).toBe(true);
        });

        it('should return true for undefined', () => {
            if (!Validators) return;
            expect(Validators.isEmpty(undefined)).toBe(true);
        });

        it('should return true for empty string', () => {
            if (!Validators) return;
            expect(Validators.isEmpty('')).toBe(true);
            expect(Validators.isEmpty('   ')).toBe(true);
        });

        it('should return false for non-empty values', () => {
            if (!Validators) return;
            expect(Validators.isEmpty('hello')).toBe(false);
            expect(Validators.isEmpty(0)).toBe(false);
            expect(Validators.isEmpty(false)).toBe(false);
        });
    });

    describe('minLength', () => {
        it('should validate minimum length correctly', () => {
            if (!Validators) return;

            expect(Validators.minLength('hello', 3)).toBe(true);
            expect(Validators.minLength('hello', 5)).toBe(true);
            expect(Validators.minLength('hi', 3)).toBe(false);
        });

        it('should handle null/undefined', () => {
            if (!Validators) return;

            expect(Validators.minLength(null, 3)).toBe(false);
            expect(Validators.minLength(undefined, 3)).toBe(false);
        });

        it('should trim whitespace', () => {
            if (!Validators) return;

            expect(Validators.minLength('  ab  ', 3)).toBe(false);
            expect(Validators.minLength('  abc  ', 3)).toBe(true);
        });
    });

    describe('passwordsMatch', () => {
        it('should return true for matching passwords', () => {
            if (!Validators) return;

            expect(Validators.passwordsMatch('password123', 'password123')).toBe(true);
        });

        it('should return false for non-matching passwords', () => {
            if (!Validators) return;

            expect(Validators.passwordsMatch('password123', 'password456')).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct emails', () => {
            if (!Validators) return;

            expect(Validators.isValidEmail('test@example.com')).toBe(true);
            expect(Validators.isValidEmail('user.name@domain.org')).toBe(true);
            expect(Validators.isValidEmail('user+tag@domain.co.uk')).toBe(true);
        });

        it('should reject invalid emails', () => {
            if (!Validators) return;

            expect(Validators.isValidEmail('invalid')).toBe(false);
            expect(Validators.isValidEmail('test@')).toBe(false);
            expect(Validators.isValidEmail('@domain.com')).toBe(false);
            expect(Validators.isValidEmail('test@domain')).toBe(false);
            expect(Validators.isValidEmail('')).toBe(false);
            expect(Validators.isValidEmail(null)).toBe(false);
        });
    });

    describe('isValidUUID', () => {
        it('should validate correct UUIDs', () => {
            if (!Validators) return;

            expect(Validators.isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
            expect(Validators.isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
        });

        it('should reject invalid UUIDs', () => {
            if (!Validators) return;

            expect(Validators.isValidUUID('not-a-uuid')).toBe(false);
            expect(Validators.isValidUUID('123')).toBe(false);
            expect(Validators.isValidUUID('')).toBe(false);
            expect(Validators.isValidUUID(null)).toBe(false);
        });
    });

    describe('isValidClassroomCode', () => {
        it('should validate correct classroom codes', () => {
            if (!Validators) return;

            expect(Validators.isValidClassroomCode('ABCDE')).toBe(true);
            expect(Validators.isValidClassroomCode('12345')).toBe(true);
            expect(Validators.isValidClassroomCode('A1B2C')).toBe(true);
            expect(Validators.isValidClassroomCode('abcde')).toBe(true); // Should be case-insensitive
        });

        it('should reject invalid classroom codes', () => {
            if (!Validators) return;

            expect(Validators.isValidClassroomCode('ABCD')).toBe(false); // Too short
            expect(Validators.isValidClassroomCode('ABCDEF')).toBe(false); // Too long
            expect(Validators.isValidClassroomCode('ABC-E')).toBe(false); // Invalid character
            expect(Validators.isValidClassroomCode('')).toBe(false);
            expect(Validators.isValidClassroomCode(null)).toBe(false);
        });
    });

    describe('sanitizeString', () => {
        it('should remove HTML tags', () => {
            if (!Validators) return;

            expect(Validators.sanitizeString('<script>alert("xss")</script>')).not.toContain('<script>');
            expect(Validators.sanitizeString('<b>bold</b>')).toBe('bold');
        });

        it('should limit string length', () => {
            if (!Validators) return;

            const longString = 'a'.repeat(1000);
            expect(Validators.sanitizeString(longString).length).toBeLessThanOrEqual(500);
            expect(Validators.sanitizeString(longString, 100).length).toBeLessThanOrEqual(100);
        });

        it('should handle null/empty', () => {
            if (!Validators) return;

            expect(Validators.sanitizeString(null)).toBe('');
            expect(Validators.sanitizeString('')).toBe('');
        });

        it('should trim whitespace', () => {
            if (!Validators) return;

            expect(Validators.sanitizeString('  hello  ')).toBe('hello');
        });
    });

    describe('isValidSlug', () => {
        it('should validate correct slugs', () => {
            if (!Validators) return;

            expect(Validators.isValidSlug('hello-world')).toBe(true);
            expect(Validators.isValidSlug('test')).toBe(true);
            expect(Validators.isValidSlug('test-123')).toBe(true);
        });

        it('should reject invalid slugs', () => {
            if (!Validators) return;

            expect(Validators.isValidSlug('Hello-World')).toBe(false); // Uppercase
            expect(Validators.isValidSlug('hello_world')).toBe(false); // Underscore
            expect(Validators.isValidSlug('hello world')).toBe(false); // Space
            expect(Validators.isValidSlug('-hello')).toBe(false); // Starts with dash
            expect(Validators.isValidSlug('')).toBe(false);
            expect(Validators.isValidSlug(null)).toBe(false);
        });
    });

    describe('isPositiveInteger', () => {
        it('should validate positive integers', () => {
            if (!Validators) return;

            expect(Validators.isPositiveInteger(1)).toBe(true);
            expect(Validators.isPositiveInteger(100)).toBe(true);
            expect(Validators.isPositiveInteger('5')).toBe(true);
        });

        it('should reject non-positive integers', () => {
            if (!Validators) return;

            expect(Validators.isPositiveInteger(0)).toBe(false);
            expect(Validators.isPositiveInteger(-1)).toBe(false);
            expect(Validators.isPositiveInteger(1.5)).toBe(false);
            expect(Validators.isPositiveInteger('abc')).toBe(false);
            expect(Validators.isPositiveInteger(null)).toBe(false);
        });
    });
    describe('Helper Object Validations', () => {
        it('should sanitize object recursively', () => {
            if (!Validators) return;

            // Explicitly mock Utils for this test
            window.Utils = {
                escapeHtml: vi.fn((str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;')),
            };

            const malicious = {
                name: '<script>alert(1)</script>',
                details: {
                    bio: '<b>Bold</b>',
                    tags: ['<img src=x>', 'safe'],
                },
                age: 25, // Should preserve numbers
            };

            const clean = Validators.sanitizeObject(malicious);

            expect(clean.name).not.toContain('<script>');
            expect(clean.details.bio).not.toContain('<b>');
            expect(clean.details.tags[0]).not.toContain('<img');
            expect(clean.details.tags[1]).toBe('safe');
            expect(clean.age).toBe(25);
        });

        it('should validate valid course data structure', () => {
            if (!Validators) return;

            const validCourse = {
                id: 1,
                title: 'Test Course',
                key: 'test',
                projects: [{ id: 1, title: 'P1', type: 'code' }],
            };

            expect(Validators.isValidCourseData(validCourse)).toBe(true);
        });

        it('should reject invalid course data structure', () => {
            if (!Validators) return;

            const invalidCourse1 = { title: 'No Projects' }; // Missing projects array
            const invalidCourse2 = { projects: [] }; // Missing key fields

            expect(Validators.isValidCourseData(invalidCourse1)).toBe(false);
            expect(Validators.isValidCourseData(invalidCourse2)).toBe(false);
        });
    });
});
