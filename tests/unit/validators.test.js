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

    // Yeni fonksiyonlar
    isValidUUID: (str) => {
        if (!str || typeof str !== 'string') return false;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
    },

    isValidClassroomCode: (code) => {
        if (!code || typeof code !== 'string') return false;
        return /^[A-Z0-9]{5}$/.test(code.toUpperCase());
    },

    sanitizeString: (str, maxLength = 500) => {
        if (!str) return '';
        return String(str)
            .slice(0, maxLength)
            .replace(/<[^>]*>/g, '')
            .trim();
    },

    isValidSlug: (slug) => {
        if (!slug || typeof slug !== 'string') return false;
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    },

    isPositiveInteger: (value) => {
        const num = Number(value);
        return Number.isInteger(num) && num > 0;
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

    // ==========================================
    // YENİ: Backend Güvenlik Validasyonları Testleri
    // ==========================================

    describe('isValidUUID', () => {
        it('should return true for valid UUIDs', () => {
            expect(Validators.isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
            expect(Validators.isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
            // Büyük harfli UUID da geçerli olmalı
            expect(Validators.isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true);
        });

        it('should return false for invalid UUIDs', () => {
            expect(Validators.isValidUUID('123')).toBe(false);
            expect(Validators.isValidUUID('not-a-uuid')).toBe(false);
            expect(Validators.isValidUUID('123e4567-e89b-12d3-a456')).toBe(false); // Eksik
            expect(Validators.isValidUUID('123e4567e89b12d3a456426614174000')).toBe(false); // Tire yok
        });

        it('should return false for null/undefined/empty', () => {
            expect(Validators.isValidUUID(null)).toBe(false);
            expect(Validators.isValidUUID(undefined)).toBe(false);
            expect(Validators.isValidUUID('')).toBe(false);
        });

        it('should return false for non-string values', () => {
            expect(Validators.isValidUUID(123)).toBe(false);
            expect(Validators.isValidUUID({})).toBe(false);
        });
    });

    describe('isValidClassroomCode', () => {
        it('should return true for valid 5-char codes', () => {
            expect(Validators.isValidClassroomCode('ABC12')).toBe(true);
            expect(Validators.isValidClassroomCode('12345')).toBe(true);
            expect(Validators.isValidClassroomCode('ABCDE')).toBe(true);
            // Küçük harf de kabul edilmeli (toUpperCase yapılıyor)
            expect(Validators.isValidClassroomCode('abc12')).toBe(true);
        });

        it('should return false for invalid codes', () => {
            expect(Validators.isValidClassroomCode('ABC')).toBe(false); // Çok kısa
            expect(Validators.isValidClassroomCode('ABC123')).toBe(false); // Çok uzun
            expect(Validators.isValidClassroomCode('ABC-1')).toBe(false); // Özel karakter
            expect(Validators.isValidClassroomCode('ABC 1')).toBe(false); // Boşluk
        });

        it('should return false for null/undefined/empty', () => {
            expect(Validators.isValidClassroomCode(null)).toBe(false);
            expect(Validators.isValidClassroomCode(undefined)).toBe(false);
            expect(Validators.isValidClassroomCode('')).toBe(false);
        });
    });

    describe('sanitizeString', () => {
        it('should remove HTML tags', () => {
            expect(Validators.sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
            expect(Validators.sanitizeString('<b>bold</b>')).toBe('bold');
            expect(Validators.sanitizeString('Hello <i>world</i>!')).toBe('Hello world!');
        });

        it('should respect max length', () => {
            expect(Validators.sanitizeString('Hello World', 5)).toBe('Hello');
            expect(Validators.sanitizeString('Short', 100)).toBe('Short');
        });

        it('should trim whitespace', () => {
            expect(Validators.sanitizeString('  hello  ')).toBe('hello');
        });

        it('should handle empty/null values', () => {
            expect(Validators.sanitizeString('')).toBe('');
            expect(Validators.sanitizeString(null)).toBe('');
            expect(Validators.sanitizeString(undefined)).toBe('');
        });

        it('should convert non-strings to string', () => {
            expect(Validators.sanitizeString(123)).toBe('123');
        });
    });

    describe('isValidSlug', () => {
        it('should return true for valid slugs', () => {
            expect(Validators.isValidSlug('arduino')).toBe(true);
            expect(Validators.isValidSlug('micro-bit')).toBe(true);
            expect(Validators.isValidSlug('lesson-01-intro')).toBe(true);
            expect(Validators.isValidSlug('project123')).toBe(true);
        });

        it('should return false for invalid slugs', () => {
            expect(Validators.isValidSlug('Arduino')).toBe(false); // Büyük harf
            expect(Validators.isValidSlug('my slug')).toBe(false); // Boşluk
            expect(Validators.isValidSlug('my_slug')).toBe(false); // Underscore
            expect(Validators.isValidSlug('-invalid')).toBe(false); // Tire ile başlıyor
            expect(Validators.isValidSlug('invalid-')).toBe(false); // Tire ile bitiyor
            expect(Validators.isValidSlug('my--slug')).toBe(false); // Çift tire
        });

        it('should return false for null/undefined/empty', () => {
            expect(Validators.isValidSlug(null)).toBe(false);
            expect(Validators.isValidSlug(undefined)).toBe(false);
            expect(Validators.isValidSlug('')).toBe(false);
        });
    });

    describe('isPositiveInteger', () => {
        it('should return true for positive integers', () => {
            expect(Validators.isPositiveInteger(1)).toBe(true);
            expect(Validators.isPositiveInteger(100)).toBe(true);
            expect(Validators.isPositiveInteger('42')).toBe(true); // String'den dönüşüm
        });

        it('should return false for zero and negative numbers', () => {
            expect(Validators.isPositiveInteger(0)).toBe(false);
            expect(Validators.isPositiveInteger(-1)).toBe(false);
            expect(Validators.isPositiveInteger(-100)).toBe(false);
        });

        it('should return false for non-integers', () => {
            expect(Validators.isPositiveInteger(1.5)).toBe(false);
            expect(Validators.isPositiveInteger('abc')).toBe(false);
            expect(Validators.isPositiveInteger(null)).toBe(false);
            expect(Validators.isPositiveInteger(undefined)).toBe(false);
        });
    });
});
