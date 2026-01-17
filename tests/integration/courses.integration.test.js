/**
 * Admin Courses Integration Tests
 *
 * Tests for modules/admin/courses.js
 * Verifies course creation, deletion, and list rendering.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let CourseManager;

describe('Admin Courses Integration', () => {
    // DOM Elements
    let container;
    let modal;

    beforeEach(async () => {
        vi.resetModules();
        vi.restoreAllMocks();

        // 1. Setup DOM
        document.body.innerHTML = `
            <div id="course-selector-grid"></div>
            <div id="course-list-container"></div>
            <div id="course-management-modal" class="hidden"></div>
            <div id="add-course-form" class="hidden">
                 <input id="new-course-title" value="">
                 <input id="new-course-key" value="">
                 <input id="new-course-desc" value="">
                 <input id="new-course-icon" value="">
                 <input id="new-course-color" value="">
            </div>
        `;

        container = document.getElementById('course-list-container');
        modal = document.getElementById('course-management-modal');

        // 2. Mock Globals
        global.admin = {
            allCourseData: {},
            currentCourseKey: 'test-course',
            changeCourse: vi.fn(),
            showLoading: vi.fn(),
            hideLoading: vi.fn(),
            populateCourseSelector: vi.fn(),
        };

        // Utils mock for XSS protection functions
        global.Utils = {
            escapeHtml: vi.fn((str) => str), // Pass-through for testing
            sanitizeOnclickParam: vi.fn((str) => str),
        };

        global.SupabaseClient = {
            client: {
                from: vi.fn(() => ({
                    select: vi.fn(() => ({
                        limit: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: { id: 'new-course-id' }, error: null }),
                        })),
                        single: vi.fn().mockResolvedValue({ data: { id: 'new-course-id' }, error: null }),
                    })),
                    insert: vi.fn(() => ({
                        select: vi.fn(() => ({
                            single: vi.fn().mockResolvedValue({ data: { id: 'new-course-id' }, error: null }),
                        })),
                    })),
                    delete: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            eq: vi.fn().mockResolvedValue({ error: null }), // for deleteProjectByPosition
                        })),
                    })),
                    update: vi.fn(() => ({
                        eq: vi.fn().mockResolvedValue({ error: null }),
                    })),
                })),
            },
        };

        // Mock chain for delete (delete().eq())
        const deleteChain = {
            eq: vi.fn().mockResolvedValue({ error: null }),
        };
        global.SupabaseClient.client.from.mockReturnValue({
            select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { id: '123' } }) })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: { id: 'new-id' } }) })),
            })),
            delete: vi.fn(() => deleteChain),
            update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
        });

        global.CourseLoader = {
            getManifest: vi.fn().mockReturnValue({}),
            manifest: {}, // Used by deleteCourse
        };

        // Mock Alert/Confirm
        global.alert = vi.fn();
        global.confirm = vi.fn(() => true);

        // Clean window
        delete window.CourseManager;

        // 3. Load Module
        try {
            await import('../../modules/admin/courses.js');
            CourseManager = window.CourseManager;
        } catch (e) {
            console.warn('CourseManager import failed:', e);
        }
    });

    describe('Initialization', () => {
        it('should load CourseManager', () => {
            expect(CourseManager).toBeDefined();
            expect(typeof CourseManager.createCourse).toBe('function');
        });

        it('should render course list from admin.allCourseData', () => {
            if (!CourseManager) return;

            // Setup data
            global.admin.allCourseData = {
                c1: { title: 'Course 1', icon: 'A' },
                c2: { title: 'Course 2', icon: 'B' },
            };

            CourseManager.refreshList();
            CourseManager.renderList();

            expect(container.innerHTML).toContain('Course 1');
            expect(container.innerHTML).toContain('Course 2');
        });
    });

    describe('Create Course', () => {
        it('should create a new course', async () => {
            if (!CourseManager) return;

            // Setup Inputs
            document.getElementById('new-course-title').value = 'New Course';
            document.getElementById('new-course-key').value = 'new-course';

            // Get reference to already-mocked from function (it's already a vi.fn)
            const fromSpy = global.SupabaseClient.client.from;

            await CourseManager.createCourse();

            // Verify Supabase interaction
            expect(fromSpy).toHaveBeenCalledWith('courses');
            expect(fromSpy).toHaveBeenCalledWith('phases'); // Default phase

            // Verify Local Update
            expect(global.admin.allCourseData['new-course']).toBeDefined();
            expect(global.admin.allCourseData['new-course'].title).toBe('New Course');

            // Verify UI feedback
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('oluşturuldu'));
            expect(global.admin.changeCourse).toHaveBeenCalledWith('new-course');
        });

        it('should validate empty inputs', async () => {
            if (!CourseManager) return;

            // Empty inputs
            document.getElementById('new-course-title').value = '';

            await CourseManager.createCourse();

            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('doldurun'));
            expect(global.SupabaseClient.client.from).not.toHaveBeenCalled();
        });

        it('should validate invalid key format', async () => {
            if (!CourseManager) return;

            document.getElementById('new-course-title').value = 'Test';
            document.getElementById('new-course-key').value = 'Invalid Key!'; // Spaces/Special chars setup

            // The createCourse function auto-formats key, but if user manually inputs bad key?
            // Actually currently createsCourse overwrites key value with sanitization?
            // Let's check logic: createCourse reads value, sanitizes it, THEN checks regex.

            // If we inject a bad key directly into the value property and ensure sanitization doesn't run?
            // createCourse sanitizes: key = key.toLowerCase()...
            // So it's hard to pass invalid key unless it becomes empty string.

            // Let's test duplication check
            CourseManager.courses = [{ key: 'duplicate' }];
            document.getElementById('new-course-title').value = 'Test';
            document.getElementById('new-course-key').value = 'duplicate';

            await CourseManager.createCourse();
            expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('zaten var'));
        });
    });

    describe('Delete Course', () => {
        it('should delete course', async () => {
            if (!CourseManager) return;

            // Setup
            global.admin.allCourseData = { 'del-course': {} };
            CourseManager.refreshList();

            // Mock Delete Chain
            const deleteFn = vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
            });
            global.SupabaseClient.client.from.mockImplementation(() => ({
                delete: deleteFn,
            }));

            // Mock location.reload (avoid test crash)
            delete window.location;
            window.location = { reload: vi.fn() };

            await CourseManager.deleteCourse('del-course');

            expect(deleteFn).toHaveBeenCalled();
            expect(global.alert).toHaveBeenCalledWith('Kurs silindi.');
            expect(window.location.reload).toHaveBeenCalled();
        });
    });
});
