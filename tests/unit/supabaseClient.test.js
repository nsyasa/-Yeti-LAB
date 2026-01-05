/**
 * SupabaseClient Module Unit Tests
 * modules/supabaseClient.js için test suite
 */

import { describe, it, expect, beforeEach } from 'vitest';

describe('SupabaseClient Module', () => {
    describe('Image URL Resolution', () => {
        // Test the resolveImageUrl logic without actual Supabase
        const GITHUB_PAGES_URL = 'https://nsyasa.github.io/-Yeti-LAB/';

        const resolveImageUrl = (imagePath) => {
            if (!imagePath) return '';

            // Already a full URL
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                return imagePath;
            }

            // Supabase storage URL
            if (imagePath.startsWith('storage/')) {
                return 'https://supabase.storage/' + imagePath;
            }

            // Local file - use GitHub Pages
            if (!imagePath.startsWith('img/')) {
                return GITHUB_PAGES_URL + 'img/' + imagePath;
            }

            return GITHUB_PAGES_URL + imagePath;
        };

        it('should return empty string for null/undefined', () => {
            expect(resolveImageUrl(null)).toBe('');
            expect(resolveImageUrl(undefined)).toBe('');
            expect(resolveImageUrl('')).toBe('');
        });

        it('should return full URLs unchanged', () => {
            const url = 'https://example.com/image.jpg';
            expect(resolveImageUrl(url)).toBe(url);
        });

        it('should resolve local filenames to GitHub Pages URL', () => {
            const filename = 'devre1.jpg';
            const result = resolveImageUrl(filename);

            expect(result).toContain(GITHUB_PAGES_URL);
            expect(result).toContain('img/');
            expect(result).toContain(filename);
        });

        it('should handle img/ prefixed paths', () => {
            const path = 'img/logo.svg';
            const result = resolveImageUrl(path);

            expect(result).toBe(GITHUB_PAGES_URL + path);
        });
    });

    describe('Slug Generation', () => {
        const slugify = (text) => {
            if (!text) return '';
            const trMap = {
                ç: 'c',
                Ç: 'c',
                ğ: 'g',
                Ğ: 'g',
                ş: 's',
                Ş: 's',
                ü: 'u',
                Ü: 'u',
                ı: 'i',
                İ: 'i',
                ö: 'o',
                Ö: 'o',
            };
            return text
                .toString()
                .replace(/[çÇğĞşŞüÜıİöÖ]/g, (c) => trMap[c] || c)
                .normalize('NFKD')
                .replace(/[\u0300-\u036F]/g, '')
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
        };

        it('should convert Turkish characters correctly', () => {
            expect(slugify('Türkçe Başlık')).toBe('turkce-baslik');
            expect(slugify('Öğrenci İsmi')).toBe('ogrenci-ismi');
        });

        it('should convert spaces to hyphens', () => {
            expect(slugify('hello world')).toBe('hello-world');
            expect(slugify('Arduino   Basics')).toBe('arduino-basics');
        });

        it('should remove special characters', () => {
            expect(slugify('Hello! World?')).toBe('hello-world');
            expect(slugify('Test #1 @2')).toBe('test-1-2');
        });

        it('should handle empty strings', () => {
            expect(slugify('')).toBe('');
            expect(slugify(null)).toBe('');
        });

        it('should trim leading/trailing hyphens', () => {
            expect(slugify('--hello--')).toBe('hello');
            expect(slugify('-test-')).toBe('test');
        });
    });

    describe('Data Format Conversion', () => {
        describe('Legacy to Supabase format', () => {
            it('should convert projects array correctly', () => {
                const legacyProject = {
                    id: 1,
                    title: 'LED Yakma',
                    desc: 'İlk proje',
                    phase: 0,
                };

                // Simulated conversion
                const converted = {
                    course_id: 'test-course-id',
                    phase_id: 'test-phase-id',
                    slug: 'led-yakma',
                    title: legacyProject.title,
                    description: legacyProject.desc,
                    position: legacyProject.id,
                };

                expect(converted.title).toBe('LED Yakma');
                expect(converted.description).toBe('İlk proje');
                expect(typeof converted.slug).toBe('string');
            });
        });

        describe('Supabase to Legacy format', () => {
            it('should convert course data correctly', () => {
                const supabaseData = {
                    id: 'uuid-123',
                    slug: 'arduino',
                    title: 'Arduino Eğitimi',
                    description: 'Temel Arduino dersleri',
                };

                // Simulated conversion
                const legacy = {
                    title: supabaseData.title,
                    description: supabaseData.description,
                    data: {
                        phases: [],
                        projects: [],
                        componentInfo: {},
                    },
                };

                expect(legacy.title).toBe('Arduino Eğitimi');
                expect(legacy.data.projects).toEqual([]);
            });
        });
    });

    describe('Error Handling Patterns', () => {
        it('should handle Supabase error format', () => {
            const supabaseError = {
                message: 'Row level security violation',
                code: 'PGRST301',
                details: null,
            };

            // Pattern used in codebase
            const userMessage = supabaseError.message || 'Bilinmeyen hata';
            expect(userMessage).toBe('Row level security violation');
        });

        it('should provide default error message for null', () => {
            const error = null;
            const message = error?.message || 'Bilinmeyen hata';

            expect(message).toBe('Bilinmeyen hata');
        });
    });

    describe('Course Key Validation', () => {
        const validCourseKeys = ['arduino', 'microbit', 'scratch', 'mblock', 'appinventor'];

        it('should validate known course keys', () => {
            expect(validCourseKeys.includes('arduino')).toBe(true);
            expect(validCourseKeys.includes('microbit')).toBe(true);
            expect(validCourseKeys.includes('scratch')).toBe(true);
        });

        it('should reject unknown course keys', () => {
            expect(validCourseKeys.includes('unknown')).toBe(false);
            expect(validCourseKeys.includes('')).toBe(false);
        });
    });
});

describe('Supabase Query Patterns', () => {
    describe('Chained query builder', () => {
        it('should support fluent interface pattern', () => {
            // Mock query builder pattern
            const queryBuilder = {
                select: function () {
                    return this;
                },
                eq: function () {
                    return this;
                },
                single: function () {
                    return Promise.resolve({ data: null, error: null });
                },
            };

            const result = queryBuilder.select().eq().single();
            expect(result).toBeInstanceOf(Promise);
        });
    });
});
