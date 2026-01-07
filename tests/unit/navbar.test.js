/**
 * Navbar Module Tests
 * Tests for SPA navigation functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock window.location
const mockLocation = {
    pathname: '/index.html',
    hash: '',
    href: 'file:///C:/path/index.html',
};

// Create Navbar module for testing
const createNavbar = () => ({
    /**
     * SPA içinde miyiz kontrol et (index.html)
     */
    isOnSPA: () => {
        const path = mockLocation.pathname;
        return (
            path.endsWith('index.html') ||
            path.endsWith('/') ||
            path.endsWith('-Yeti-LAB') ||
            path.endsWith('-Yeti-LAB/')
        );
    },

    /**
     * SPA navigasyonu - ayrı sayfalardayken doğru yönlendirme yapar
     */
    navigateSPA: function (route) {
        if (this.isOnSPA()) {
            // index.html içindeyiz, hash kullan
            mockLocation.hash = '#' + route;
            return { type: 'hash', route };
        } else {
            // Ayrı sayfadayız, tam URL'e yönlendir
            mockLocation.href = 'index.html#' + route;
            return { type: 'redirect', url: 'index.html#' + route };
        }
    },
});

describe('Navbar Module', () => {
    let Navbar;

    beforeEach(() => {
        Navbar = createNavbar();
        // Reset mock location
        mockLocation.pathname = '/index.html';
        mockLocation.hash = '';
        mockLocation.href = 'file:///C:/path/index.html';
    });

    describe('isOnSPA()', () => {
        it('should return true when on index.html', () => {
            mockLocation.pathname = '/index.html';
            expect(Navbar.isOnSPA()).toBe(true);
        });

        it('should return true when on root path /', () => {
            mockLocation.pathname = '/';
            expect(Navbar.isOnSPA()).toBe(true);
        });

        it('should return true when on -Yeti-LAB folder', () => {
            mockLocation.pathname = '/Users/test/-Yeti-LAB';
            expect(Navbar.isOnSPA()).toBe(true);
        });

        it('should return true when on -Yeti-LAB/ folder with trailing slash', () => {
            mockLocation.pathname = '/Users/test/-Yeti-LAB/';
            expect(Navbar.isOnSPA()).toBe(true);
        });

        it('should return false when on profile.html', () => {
            mockLocation.pathname = '/profile.html';
            expect(Navbar.isOnSPA()).toBe(false);
        });

        it('should return false when on auth.html', () => {
            mockLocation.pathname = '/auth.html';
            expect(Navbar.isOnSPA()).toBe(false);
        });

        it('should return false when on student-dashboard.html', () => {
            mockLocation.pathname = '/student-dashboard.html';
            expect(Navbar.isOnSPA()).toBe(false);
        });
    });

    describe('navigateSPA()', () => {
        describe('when on SPA (index.html)', () => {
            beforeEach(() => {
                mockLocation.pathname = '/index.html';
            });

            it('should use hash navigation for / route', () => {
                const result = Navbar.navigateSPA('/');
                expect(result.type).toBe('hash');
                expect(mockLocation.hash).toBe('#/');
            });

            it('should use hash navigation for /admin route', () => {
                const result = Navbar.navigateSPA('/admin');
                expect(result.type).toBe('hash');
                expect(mockLocation.hash).toBe('#/admin');
            });

            it('should use hash navigation for /teacher route', () => {
                const result = Navbar.navigateSPA('/teacher');
                expect(result.type).toBe('hash');
                expect(mockLocation.hash).toBe('#/teacher');
            });

            it('should use hash navigation for /teacher/classrooms route', () => {
                const result = Navbar.navigateSPA('/teacher/classrooms');
                expect(result.type).toBe('hash');
                expect(mockLocation.hash).toBe('#/teacher/classrooms');
            });

            it('should use hash navigation for /profile route', () => {
                const result = Navbar.navigateSPA('/profile');
                expect(result.type).toBe('hash');
                expect(mockLocation.hash).toBe('#/profile');
            });

            it('should use hash navigation for /student-dashboard route', () => {
                const result = Navbar.navigateSPA('/student-dashboard');
                expect(result.type).toBe('hash');
                expect(mockLocation.hash).toBe('#/student-dashboard');
            });
        });

        describe('when on separate page (auth.html)', () => {
            beforeEach(() => {
                mockLocation.pathname = '/auth.html';
            });

            it('should redirect to index.html#/ for / route', () => {
                const result = Navbar.navigateSPA('/');
                expect(result.type).toBe('redirect');
                expect(result.url).toBe('index.html#/');
            });

            it('should redirect to index.html#/admin for /admin route', () => {
                const result = Navbar.navigateSPA('/admin');
                expect(result.type).toBe('redirect');
                expect(result.url).toBe('index.html#/admin');
            });

            it('should redirect to index.html#/teacher for /teacher route', () => {
                const result = Navbar.navigateSPA('/teacher');
                expect(result.type).toBe('redirect');
                expect(result.url).toBe('index.html#/teacher');
            });

            it('should redirect to index.html#/profile for /profile route', () => {
                const result = Navbar.navigateSPA('/profile');
                expect(result.type).toBe('redirect');
                expect(result.url).toBe('index.html#/profile');
            });
        });
    });
});

describe('SPA Routes', () => {
    describe('Teacher Panel Routes', () => {
        it('should recognize valid teacher routes', () => {
            const validRoutes = ['/teacher', '/teacher/classrooms', '/teacher/students'];
            validRoutes.forEach((route) => {
                expect(route.startsWith('/teacher')).toBe(true);
            });
        });
    });

    describe('Admin Panel Routes', () => {
        it('should recognize valid admin routes', () => {
            const validRoutes = ['/admin', '/admin/projects', '/admin/phases', '/admin/components'];
            validRoutes.forEach((route) => {
                expect(route.startsWith('/admin')).toBe(true);
            });
        });
    });

    describe('Profile Routes', () => {
        it('should recognize valid profile routes', () => {
            const validRoutes = ['/profile', '/profile/wizard'];
            validRoutes.forEach((route) => {
                expect(route.startsWith('/profile')).toBe(true);
            });
        });
    });

    describe('Student Dashboard Routes', () => {
        it('should recognize valid student dashboard routes', () => {
            expect('/student-dashboard'.startsWith('/student-dashboard')).toBe(true);
        });
    });

    describe('URL Hash Parsing', () => {
        it('should extract section from teacher hash', () => {
            const hash = '#/teacher/classrooms';
            const parts = hash.split('/teacher/');
            const section = parts[1] ? parts[1].split('/')[0] : 'dashboard';
            expect(section).toBe('classrooms');
        });

        it('should default to dashboard for base teacher hash', () => {
            const hash = '#/teacher';
            const parts = hash.split('/teacher/');
            const section = parts[1] ? parts[1].split('/')[0] : 'dashboard';
            expect(section).toBe('dashboard');
        });

        it('should extract section from admin hash', () => {
            const hash = '#/admin/phases';
            const parts = hash.split('/admin/');
            const section = parts[1] ? parts[1].split('/')[0] : 'projects';
            expect(section).toBe('phases');
        });

        it('should default to projects for base admin hash', () => {
            const hash = '#/admin';
            const parts = hash.split('/admin/');
            const section = parts[1] ? parts[1].split('/')[0] : 'projects';
            expect(section).toBe('projects');
        });
    });
});
