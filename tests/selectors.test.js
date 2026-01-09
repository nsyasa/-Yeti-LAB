/**
 * Selectors Module Tests
 * Tests for the DOM selectors and CSS classes constants
 */
import { describe, it, expect } from 'vitest';

// Import the module (this will set window.SELECTORS etc.)
import '../constants/selectors.js';

describe('Selectors Module', () => {
    describe('SELECTORS object', () => {
        it('should be defined on window', () => {
            expect(window.SELECTORS).toBeDefined();
        });

        it('should have view selectors', () => {
            expect(window.SELECTORS.COURSE_SELECTION).toBe('course-selection-view');
            expect(window.SELECTORS.DASHBOARD).toBe('dashboard-view');
            expect(window.SELECTORS.PROJECT).toBe('project-view');
        });

        it('should have SPA container selectors', () => {
            expect(window.SELECTORS.ADMIN_CONTAINER).toBe('admin-view-container');
            expect(window.SELECTORS.TEACHER_CONTAINER).toBe('teacher-view-container');
            expect(window.SELECTORS.PROFILE_CONTAINER).toBe('profile-view-container');
        });

        it('should have header and footer selectors', () => {
            expect(window.SELECTORS.HEADER).toBe('main-header');
            expect(window.SELECTORS.FOOTER).toBe('main-footer');
        });

        it('should have sidebar selectors', () => {
            expect(window.SELECTORS.SIDEBAR).toBe('lesson-sidebar');
            expect(window.SELECTORS.SIDEBAR_CONTENT).toBe('sidebar-content');
        });
    });

    describe('CSS_CLASSES object', () => {
        it('should be defined on window', () => {
            expect(window.CSS_CLASSES).toBeDefined();
        });

        it('should have visibility classes', () => {
            expect(window.CSS_CLASSES.HIDDEN).toBe('hidden');
            expect(window.CSS_CLASSES.VISIBLE).toBe('visible');
        });

        it('should have state classes', () => {
            expect(window.CSS_CLASSES.LOADING).toBe('is-loading');
            expect(window.CSS_CLASSES.ACTIVE).toBe('active');
            expect(window.CSS_CLASSES.OPEN).toBe('open');
        });

        it('should have theme classes', () => {
            expect(window.CSS_CLASSES.THEME_BG).toBe('bg-theme');
            expect(window.CSS_CLASSES.THEME_TEXT).toBe('text-theme');
        });

        it('should have animation classes', () => {
            expect(window.CSS_CLASSES.FADE_IN).toBe('fade-in');
            expect(window.CSS_CLASSES.ANIMATE_BOUNCE).toBe('animate-bounce');
        });
    });

    describe('STORAGE_KEYS object', () => {
        it('should be defined on window', () => {
            expect(window.STORAGE_KEYS).toBeDefined();
        });

        it('should have autosave key', () => {
            expect(window.STORAGE_KEYS.AUTOSAVE).toBe('mucit_atolyesi_autosave');
        });

        it('should have progress key', () => {
            expect(window.STORAGE_KEYS.PROGRESS).toBe('yetilab_progress');
        });

        it('should have theme key', () => {
            expect(window.STORAGE_KEYS.THEME).toBe('yetilab_theme');
        });
    });

    describe('TABLES object', () => {
        it('should be defined on window', () => {
            expect(window.TABLES).toBeDefined();
        });

        it('should have course-related tables', () => {
            expect(window.TABLES.COURSES).toBe('courses');
            expect(window.TABLES.PHASES).toBe('phases');
            expect(window.TABLES.PROJECTS).toBe('projects');
            expect(window.TABLES.COMPONENTS).toBe('course_components');
        });

        it('should have user-related tables', () => {
            expect(window.TABLES.USERS).toBe('users');
            expect(window.TABLES.CONTENT_ADMINS).toBe('content_admins');
            expect(window.TABLES.TEACHERS).toBe('teachers');
            expect(window.TABLES.STUDENTS).toBe('students');
        });
    });
});
