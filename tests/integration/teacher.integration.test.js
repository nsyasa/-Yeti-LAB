/**
 * Teacher Module Integration Tests
 *
 * Tests for modules/teacher-manager.js
 * Verifies dashboard loading, classroom creation, and student management.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let TeacherManager;

describe('Teacher Manager Integration', () => {
    beforeEach(async () => {
        // Reset modules and mocks
        vi.resetModules();
        vi.restoreAllMocks();

        // Setup DOM
        document.body.innerHTML = `
            <div id="loadingState"></div>
            <div id="sectionTitle"></div>
            <div id="statClassrooms"></div>
            <div id="statStudents"></div>
            <div id="statActiveToday"></div>
            <div id="user-name"></div>
            <div id="user-avatar"></div>
            <div id="createClassroomModal"></div>
            <form id="createClassroomForm"><button type="submit"></button></form>
            <input id="classroomName" />
            <input id="classroomDescription" />
            <div id="addStudentModal"></div>
            <form id="addStudentForm"><button type="submit"></button></form>
            <input id="newStudentClassroom" />
            <input id="studentName" />
            <input id="studentPassword" />
            <div id="classroomsList"></div>
            <div id="studentsList"></div>
            <select id="classroomFilter"><option value="all">Tüm</option></select>
        `;

        // Setup Globals
        global.Toast = {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn(),
            info: vi.fn(),
        };

        global.Auth = {
            currentUser: { id: 'teacher-123', email: 'teacher@test.com' },
            userRole: 'teacher',
            getDisplayName: vi.fn().mockReturnValue('Test Teacher'),
            getAvatarUrl: vi.fn().mockReturnValue(null),
            init: vi.fn().mockResolvedValue(true),
        };

        global.Router = {
            redirectTo: vi.fn(),
        };

        // ENHANCED SUPABASE MOCK
        const mockEq = vi.fn().mockResolvedValue({ data: [], error: null });
        const mockIn = vi.fn().mockResolvedValue({ data: [], error: null });
        const mockSingle = vi.fn().mockResolvedValue({ data: { id: 999, name: 'Mocked Single' }, error: null });
        const mockInsert = vi.fn().mockImplementation((data) => {
            return {
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: { ...data, id: Math.floor(Math.random() * 1000), code: '1234' },
                        error: null,
                    }),
                }),
            };
        });
        const mockSelect = vi.fn().mockReturnValue({
            eq: mockEq,
            in: mockIn,
            single: mockSingle,
        });

        global.SupabaseClient = {
            init: vi.fn(),
            getClient: vi.fn().mockReturnValue({
                from: vi.fn().mockImplementation((table) => {
                    return {
                        select: mockSelect,
                        insert: mockInsert,
                        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
                        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
                    };
                }),
            }),
            _mocks: { mockEq, mockIn, mockInsert },
        };

        global.TeacherAnalytics = {
            loadProjects: vi.fn().mockResolvedValue({}),
        };

        global.ThemeManager = {
            load: vi.fn(),
            init: vi.fn(), // Add init mock for test assertion
        };

        // DYNAMICALLY IMPORT MODULES
        // This ensures they are fresh and use the mocks we just set up
        const { ClassroomManager } = await import('../../modules/teacher/classrooms.js');
        const { StudentManager } = await import('../../modules/teacher/students.js');

        // EXPOSE REAL MANAGERS TO GLOBAL
        global.ClassroomManager = ClassroomManager;
        global.StudentManager = StudentManager;

        // Spy on init methods
        vi.spyOn(global.ClassroomManager, 'init');
        vi.spyOn(global.StudentManager, 'init');

        // Ensure window functionality
        window.location = { pathname: '/teacher.html' };
        window.ClassroomManager = ClassroomManager;
        window.StudentManager = StudentManager;
        window.SupabaseClient = global.SupabaseClient;
        window.Auth = global.Auth;
        window.Toast = global.Toast;

        // Load Main Module
        await import('../../modules/teacher-manager.js');
        TeacherManager = window.TeacherManager;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.Toast;
        delete global.Auth;
        delete global.Router;
        delete global.SupabaseClient;
        delete global.TeacherAnalytics;
        delete global.ClassroomManager;
        delete global.StudentManager;
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        it('should initialize successfully for teacher user', async () => {
            await TeacherManager.init();

            expect(global.SupabaseClient.init).toHaveBeenCalled();
            expect(global.Auth.init).toHaveBeenCalled();
            expect(global.ThemeManager.init).toHaveBeenCalled();
            expect(global.TeacherAnalytics.loadProjects).toHaveBeenCalled();
        });

        it('should redirect if user is not teacher', async () => {
            global.Auth.userRole = 'student';

            await TeacherManager.init();

            expect(global.Toast.error).toHaveBeenCalledWith(expect.stringContaining('sadece öğretmenler'));
            // Wait for timeout in implementation
            await new Promise((resolve) => setTimeout(resolve, 2100));
            expect(global.Router.redirectTo).toHaveBeenCalledWith('index.html');
        });
    });

    describe('Dashboard Data', () => {
        it('should load dashboard data correctly', async () => {
            const mockClassrooms = [{ id: 1, name: 'Class 1' }];
            const mockStudents = [{ id: 101, classroom_id: 1 }];

            // Retrieve mocks from setup
            const { mockEq, mockIn } = global.SupabaseClient._mocks;

            // Setup mocks for INIT call first
            // calls 1 & 2 are for init()'s loadDashboardData

            // We can just rely on init to do the work or call loadDashboardData again.
            // Let's reset mocks after init and call loadDashboardData again to be sure.

            // Init first (sets currentUser)
            await TeacherManager.init();

            // Reset and setup specific response for explicit call
            mockEq.mockClear();
            mockIn.mockClear();

            mockEq.mockResolvedValueOnce({ data: mockClassrooms, error: null });
            mockIn.mockResolvedValueOnce({ data: mockStudents, error: null });

            await TeacherManager.loadDashboardData();

            // Check Stats UI updates
            const statClassrooms = document.getElementById('statClassrooms');
            const statStudents = document.getElementById('statStudents');

            expect(statClassrooms.textContent).toBe('1');
            expect(statStudents.textContent).toBe('1');

            // Check Managers init
            expect(global.ClassroomManager.init).toHaveBeenCalled();
            expect(global.StudentManager.init).toHaveBeenCalled();
        });
    });

    // Helper to ensure currentUser is set for other tests
    const initTeacher = async () => {
        await TeacherManager.init();
    };

    describe('Classroom Creation', () => {
        it('should create classroom successfully', async () => {
            await initTeacher();

            // Setup Inputs
            const nameInput = document.getElementById('classroomName');
            nameInput.value = 'New Class';

            const event = {
                preventDefault: vi.fn(),
                target: { querySelector: vi.fn().mockReturnValue({}) }, // Mock submit button
            };

            await TeacherManager.createClassroom(event);

            // Verify Supabase was called instead of mocking the manager directly
            expect(global.SupabaseClient._mocks.mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Class',
                })
            );
            expect(global.Toast.success).toHaveBeenCalled();
        });

        it('should validate empty classroom name', async () => {
            await initTeacher();
            // Setup Inputs
            const nameInput = document.getElementById('classroomName');
            nameInput.value = '';

            const event = {
                preventDefault: vi.fn(),
                target: { querySelector: vi.fn().mockReturnValue({}) },
            };

            await TeacherManager.createClassroom(event);

            expect(global.SupabaseClient._mocks.mockInsert).not.toHaveBeenCalled();
            expect(global.Toast.error).toHaveBeenCalledWith('Sınıf adı gerekli');
        });
    });

    describe('Student Management', () => {
        it('should add student successfully', async () => {
            await initTeacher();
            // Setup Inputs
            const classroomInput = document.getElementById('newStudentClassroom');
            if (classroomInput) classroomInput.value = '1';

            document.getElementById('studentName').value = 'New Student';
            document.getElementById('studentPassword').value = '123456';

            // IMPORTANT: StudentManager requires `selectedAvatarEmoji` which is set via `selectAvatar` in the UI
            // but we can just let it default or mock the input if needed.
            // StudentManager.add expects params: (classroomId, displayName, password, avatarEmoji)

            const event = {
                preventDefault: vi.fn(),
                target: { querySelector: vi.fn().mockReturnValue({}) },
            };

            await TeacherManager.addStudent(event);

            // StudentManager calls supabase insert
            expect(global.SupabaseClient._mocks.mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    display_name: 'New Student',
                })
            );
            expect(global.Toast.success).toHaveBeenCalled();
        });
    });
});
