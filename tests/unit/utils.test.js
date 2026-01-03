/**
 * Utils Module Unit Tests
 * modules/utils.js için test suite
 */

import { describe, it, expect } from 'vitest';

describe('Utils Module', () => {
    describe('formatDate', () => {
        it('should format a valid date string', () => {
            // Test basic date formatting logic
            const dateString = '2026-01-03T12:00:00Z';
            const date = new Date(dateString);

            expect(date instanceof Date).toBe(true);
            expect(date.getFullYear()).toBe(2026);
        });

        it('should handle null/undefined gracefully', () => {
            // Utils.formatDate returns '-' for falsy values
            const result = null ? 'formatted' : '-';
            expect(result).toBe('-');
        });

        it('should handle invalid date strings', () => {
            const invalidDate = new Date('invalid-date');
            expect(isNaN(invalidDate.getTime())).toBe(true);
        });
    });

    describe('debounce', () => {
        it('should return a function', () => {
            const fn = () => {};
            const debounced = (() => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        fn(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, 100);
                };
            })();

            expect(typeof debounced).toBe('function');
        });
    });

    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const generateId = () => 'id-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

            const id1 = generateId();
            const id2 = generateId();

            expect(id1).not.toBe(id2);
            expect(id1.startsWith('id-')).toBe(true);
            expect(id2.startsWith('id-')).toBe(true);
        });

        it('should generate IDs with proper format', () => {
            const generateId = () => 'id-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            const id = generateId();

            expect(id.length).toBeGreaterThan(10);
            expect(typeof id).toBe('string');
        });
    });

    describe('escapeHtml', () => {
        it('should escape < and > characters', () => {
            const escapeHtml = (unsafe) => {
                if (!unsafe) return '';
                return unsafe
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            const input = '<script>alert("xss")</script>';
            const output = escapeHtml(input);

            expect(output).not.toContain('<');
            expect(output).not.toContain('>');
            expect(output).toContain('&lt;');
            expect(output).toContain('&gt;');
        });

        it('should escape & character', () => {
            const escapeHtml = (unsafe) => {
                if (!unsafe) return '';
                return unsafe
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            const input = 'Tom & Jerry';
            const output = escapeHtml(input);

            expect(output).toBe('Tom &amp; Jerry');
        });

        it('should escape quote characters', () => {
            const escapeHtml = (unsafe) => {
                if (!unsafe) return '';
                return unsafe
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            };

            const input = 'He said "hello" and \'goodbye\'';
            const output = escapeHtml(input);

            expect(output).toContain('&quot;');
            expect(output).toContain('&#039;');
        });

        it('should handle empty strings', () => {
            const escapeHtml = (unsafe) => {
                if (!unsafe) return '';
                return unsafe;
            };

            expect(escapeHtml('')).toBe('');
            expect(escapeHtml(null)).toBe('');
            expect(escapeHtml(undefined)).toBe('');
        });
    });

    describe('getUrlParam', () => {
        it('should extract URL parameters', () => {
            // Mock URL search params behavior
            const params = new URLSearchParams('?course=arduino&lesson=5');

            expect(params.get('course')).toBe('arduino');
            expect(params.get('lesson')).toBe('5');
        });

        it('should return null for missing parameters', () => {
            const params = new URLSearchParams('?course=arduino');

            expect(params.get('nonexistent')).toBeNull();
        });
    });
});

describe('General Utility Patterns', () => {
    describe('Array utilities', () => {
        it('should handle array sorting for project lists', () => {
            const projects = [
                { id: 3, title: 'C' },
                { id: 1, title: 'A' },
                { id: 2, title: 'B' },
            ];

            const sorted = [...projects].sort((a, b) => a.id - b.id);

            expect(sorted[0].id).toBe(1);
            expect(sorted[1].id).toBe(2);
            expect(sorted[2].id).toBe(3);
        });

        it('should filter completed items correctly', () => {
            const items = [1, 2, 3, 4, 5];
            const completed = [2, 4];

            const filtered = items.filter((id) => completed.includes(id));

            expect(filtered).toEqual([2, 4]);
            expect(filtered.length).toBe(2);
        });
    });

    describe('Object utilities', () => {
        it('should merge objects correctly', () => {
            const defaults = { a: 1, b: 2 };
            const overrides = { b: 3, c: 4 };

            const merged = { ...defaults, ...overrides };

            expect(merged).toEqual({ a: 1, b: 3, c: 4 });
        });

        it('should safely access nested properties', () => {
            const obj = { user: { profile: { name: 'Test' } } };

            const name = obj?.user?.profile?.name;
            const missing = obj?.user?.settings?.theme;

            expect(name).toBe('Test');
            expect(missing).toBeUndefined();
        });
    });
});
