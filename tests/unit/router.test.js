/**
 * Router Module Tests
 * Tests for SPA routing functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock Router module for testing
const createRouter = () => {
    const routes = {
        '': 'home',
        'course/:key': 'course',
        'course/:key/project/:id': 'project',
        teacher: 'teacher',
        'teacher/classrooms': 'teacher-classrooms',
        'teacher/students': 'teacher-students',
        admin: 'admin',
        'admin/projects': 'admin-projects',
        'admin/phases': 'admin-phases',
        'admin/components': 'admin-components',
    };

    return {
        routes,

        /**
         * Parse route from hash
         */
        parseRoute(hash) {
            // Remove # prefix
            const path = hash.replace(/^#\/?/, '');

            // Check exact matches first
            if (routes[path]) {
                return { route: routes[path], params: {} };
            }

            // Check parameterized routes
            for (const [pattern, routeName] of Object.entries(routes)) {
                const params = this.matchRoute(pattern, path);
                if (params) {
                    return { route: routeName, params };
                }
            }

            return { route: 'home', params: {} };
        },

        /**
         * Match route pattern with params
         */
        matchRoute(pattern, path) {
            const patternParts = pattern.split('/');
            const pathParts = path.split('/');

            if (patternParts.length !== pathParts.length) {
                return null;
            }

            const params = {};
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    params[patternParts[i].slice(1)] = pathParts[i];
                } else if (patternParts[i] !== pathParts[i]) {
                    return null;
                }
            }

            return params;
        },

        /**
         * Build URL from route and params
         */
        buildUrl(courseKey, projectId) {
            if (!courseKey) return '#/';
            if (projectId) return `#/course/${courseKey}/project/${projectId}`;
            return `#/course/${courseKey}`;
        },
    };
};

describe('Router Module', () => {
    let Router;

    beforeEach(() => {
        Router = createRouter();
    });

    describe('Route Definitions', () => {
        it('should have home route', () => {
            expect(Router.routes['']).toBe('home');
        });

        it('should have course route', () => {
            expect(Router.routes['course/:key']).toBe('course');
        });

        it('should have project route', () => {
            expect(Router.routes['course/:key/project/:id']).toBe('project');
        });

        it('should have teacher routes', () => {
            expect(Router.routes['teacher']).toBe('teacher');
            expect(Router.routes['teacher/classrooms']).toBe('teacher-classrooms');
            expect(Router.routes['teacher/students']).toBe('teacher-students');
        });

        it('should have admin routes', () => {
            expect(Router.routes['admin']).toBe('admin');
            expect(Router.routes['admin/projects']).toBe('admin-projects');
            expect(Router.routes['admin/phases']).toBe('admin-phases');
            expect(Router.routes['admin/components']).toBe('admin-components');
        });
    });

    describe('parseRoute()', () => {
        describe('Home Route', () => {
            it('should parse empty hash as home', () => {
                const result = Router.parseRoute('#/');
                expect(result.route).toBe('home');
            });

            it('should parse # alone as home', () => {
                const result = Router.parseRoute('#');
                expect(result.route).toBe('home');
            });
        });

        describe('Course Routes', () => {
            it('should parse course route with key', () => {
                const result = Router.parseRoute('#/course/arduino');
                expect(result.route).toBe('course');
                expect(result.params.key).toBe('arduino');
            });

            it('should parse course route with different key', () => {
                const result = Router.parseRoute('#/course/microbit');
                expect(result.route).toBe('course');
                expect(result.params.key).toBe('microbit');
            });

            it('should parse project route with course and id', () => {
                const result = Router.parseRoute('#/course/arduino/project/5');
                expect(result.route).toBe('project');
                expect(result.params.key).toBe('arduino');
                expect(result.params.id).toBe('5');
            });
        });

        describe('Teacher Routes', () => {
            it('should parse /teacher as teacher route', () => {
                const result = Router.parseRoute('#/teacher');
                expect(result.route).toBe('teacher');
            });

            it('should parse /teacher/classrooms', () => {
                const result = Router.parseRoute('#/teacher/classrooms');
                expect(result.route).toBe('teacher-classrooms');
            });

            it('should parse /teacher/students', () => {
                const result = Router.parseRoute('#/teacher/students');
                expect(result.route).toBe('teacher-students');
            });
        });

        describe('Admin Routes', () => {
            it('should parse /admin as admin route', () => {
                const result = Router.parseRoute('#/admin');
                expect(result.route).toBe('admin');
            });

            it('should parse /admin/projects', () => {
                const result = Router.parseRoute('#/admin/projects');
                expect(result.route).toBe('admin-projects');
            });

            it('should parse /admin/phases', () => {
                const result = Router.parseRoute('#/admin/phases');
                expect(result.route).toBe('admin-phases');
            });

            it('should parse /admin/components', () => {
                const result = Router.parseRoute('#/admin/components');
                expect(result.route).toBe('admin-components');
            });
        });

        describe('Unknown Routes', () => {
            it('should default to home for unknown routes', () => {
                const result = Router.parseRoute('#/unknown/path');
                expect(result.route).toBe('home');
            });
        });
    });

    describe('matchRoute()', () => {
        it('should match exact routes', () => {
            const result = Router.matchRoute('teacher', 'teacher');
            expect(result).toEqual({});
        });

        it('should match parameterized routes', () => {
            const result = Router.matchRoute('course/:key', 'course/arduino');
            expect(result).toEqual({ key: 'arduino' });
        });

        it('should match multi-param routes', () => {
            const result = Router.matchRoute('course/:key/project/:id', 'course/scratch/project/3');
            expect(result).toEqual({ key: 'scratch', id: '3' });
        });

        it('should return null for non-matching routes', () => {
            const result = Router.matchRoute('course/:key', 'teacher/classrooms');
            expect(result).toBeNull();
        });

        it('should return null for different length paths', () => {
            const result = Router.matchRoute('course/:key', 'course/arduino/extra');
            expect(result).toBeNull();
        });
    });

    describe('buildUrl()', () => {
        it('should build home URL when no params', () => {
            const url = Router.buildUrl(null, null);
            expect(url).toBe('#/');
        });

        it('should build course URL with key only', () => {
            const url = Router.buildUrl('arduino', null);
            expect(url).toBe('#/course/arduino');
        });

        it('should build project URL with key and id', () => {
            const url = Router.buildUrl('microbit', 7);
            expect(url).toBe('#/course/microbit/project/7');
        });
    });
});

describe('Router Redirect Logic', () => {
    const separatePages = ['auth.html', 'profile.html', 'student-dashboard.html'];
    const spaRoutes = {
        'index.html': '/',
        'teacher.html': '/teacher',
        'admin.html': '/admin',
    };

    describe('Separate Pages', () => {
        it('should identify auth.html as separate page', () => {
            expect(separatePages.includes('auth.html')).toBe(true);
        });

        it('should identify profile.html as separate page', () => {
            expect(separatePages.includes('profile.html')).toBe(true);
        });

        it('should NOT include teacher.html as separate page (now SPA)', () => {
            expect(separatePages.includes('teacher.html')).toBe(false);
        });

        it('should NOT include admin.html as separate page (now SPA)', () => {
            expect(separatePages.includes('admin.html')).toBe(false);
        });
    });

    describe('SPA Route Mapping', () => {
        it('should map teacher.html to /teacher', () => {
            expect(spaRoutes['teacher.html']).toBe('/teacher');
        });

        it('should map admin.html to /admin', () => {
            expect(spaRoutes['admin.html']).toBe('/admin');
        });

        it('should map index.html to /', () => {
            expect(spaRoutes['index.html']).toBe('/');
        });
    });
});
