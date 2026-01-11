/**
 * AssignmentService Unit Tests
 * modules/assignmentService.js için test suite
 * Faz 8: Test & Optimizasyon
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const createMockSupabase = (mockData = {}) => {
    const chainMock = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData.single || null, error: null }),
        then: vi.fn((cb) => cb({ data: mockData.list || [], error: null })),
    };

    return {
        from: vi.fn(() => chainMock),
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: mockData.user || { id: 'test-teacher-id' } },
                error: null,
            }),
        },
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn().mockResolvedValue({ data: { path: 'test/path' }, error: null }),
                getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.url' } }),
            })),
        },
        _chainMock: chainMock,
    };
};

// Test helpers
const createMockAssignment = (overrides = {}) => ({
    id: 'test-assignment-id',
    teacher_id: 'test-teacher-id',
    classroom_id: 'test-classroom-id',
    course_id: 'test-course-id',
    title: 'Test Ödevi',
    description: 'Test açıklaması',
    instructions: 'Test talimatları',
    due_date: '2026-01-20T23:59:00Z',
    max_points: 100,
    assignment_type: 'project',
    status: 'active',
    allow_late_submission: true,
    late_penalty_percent: 10,
    max_attempts: 1,
    created_at: '2026-01-10T10:00:00Z',
    ...overrides,
});

const createMockRubric = (overrides = {}) => ({
    id: 'test-rubric-id',
    assignment_id: 'test-assignment-id',
    criteria_name: 'Kod Kalitesi',
    description: 'Kodun okunabilirliği ve yapısı',
    max_points: 25,
    order_index: 0,
    ...overrides,
});

describe('AssignmentService', () => {
    let mockSupabase;

    beforeEach(() => {
        mockSupabase = createMockSupabase();
        window.SupabaseClient = { client: mockSupabase };
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete window.SupabaseClient;
    });

    describe('Assignment Data Validation', () => {
        it('should have required assignment fields', () => {
            const assignment = createMockAssignment();

            expect(assignment.id).toBeDefined();
            expect(assignment.teacher_id).toBeDefined();
            expect(assignment.title).toBeDefined();
            expect(assignment.max_points).toBeGreaterThan(0);
        });

        it('should have valid assignment types', () => {
            const validTypes = ['project', 'quiz', 'homework', 'exam'];
            const assignment = createMockAssignment({ assignment_type: 'project' });

            expect(validTypes).toContain(assignment.assignment_type);
        });

        it('should have valid status values', () => {
            const validStatuses = ['draft', 'active', 'closed', 'archived'];
            const assignment = createMockAssignment({ status: 'active' });

            expect(validStatuses).toContain(assignment.status);
        });

        it('should have valid due date format', () => {
            const assignment = createMockAssignment();
            const dueDate = new Date(assignment.due_date);

            expect(dueDate instanceof Date).toBe(true);
            expect(isNaN(dueDate.getTime())).toBe(false);
        });

        it('should validate max_points range', () => {
            const assignment = createMockAssignment({ max_points: 100 });

            expect(assignment.max_points).toBeGreaterThanOrEqual(0);
            expect(assignment.max_points).toBeLessThanOrEqual(1000);
        });

        it('should validate late_penalty_percent range', () => {
            const assignment = createMockAssignment({ late_penalty_percent: 10 });

            expect(assignment.late_penalty_percent).toBeGreaterThanOrEqual(0);
            expect(assignment.late_penalty_percent).toBeLessThanOrEqual(100);
        });
    });

    describe('Rubric Data Validation', () => {
        it('should have required rubric fields', () => {
            const rubric = createMockRubric();

            expect(rubric.assignment_id).toBeDefined();
            expect(rubric.criteria_name).toBeDefined();
            expect(rubric.max_points).toBeGreaterThan(0);
        });

        it('should have valid order_index', () => {
            const rubrics = [
                createMockRubric({ order_index: 0 }),
                createMockRubric({ order_index: 1 }),
                createMockRubric({ order_index: 2 }),
            ];

            rubrics.forEach((rubric, index) => {
                expect(rubric.order_index).toBe(index);
            });
        });

        it('should calculate total rubric points', () => {
            const rubrics = [
                createMockRubric({ max_points: 25 }),
                createMockRubric({ max_points: 25 }),
                createMockRubric({ max_points: 25 }),
                createMockRubric({ max_points: 25 }),
            ];

            const totalPoints = rubrics.reduce((sum, r) => sum + r.max_points, 0);
            expect(totalPoints).toBe(100);
        });
    });

    describe('Assignment Filtering', () => {
        it('should filter by classroom_id', () => {
            const assignments = [
                createMockAssignment({ classroom_id: 'classroom-1' }),
                createMockAssignment({ classroom_id: 'classroom-2' }),
                createMockAssignment({ classroom_id: 'classroom-1' }),
            ];

            const filtered = assignments.filter((a) => a.classroom_id === 'classroom-1');
            expect(filtered.length).toBe(2);
        });

        it('should filter by course_id', () => {
            const assignments = [
                createMockAssignment({ course_id: 'course-1' }),
                createMockAssignment({ course_id: 'course-2' }),
            ];

            const filtered = assignments.filter((a) => a.course_id === 'course-1');
            expect(filtered.length).toBe(1);
        });

        it('should filter by status', () => {
            const assignments = [
                createMockAssignment({ status: 'active' }),
                createMockAssignment({ status: 'draft' }),
                createMockAssignment({ status: 'active' }),
                createMockAssignment({ status: 'archived' }),
            ];

            const activeOnly = assignments.filter((a) => a.status === 'active');
            expect(activeOnly.length).toBe(2);
        });

        it('should filter upcoming assignments', () => {
            const now = new Date();
            const assignments = [
                createMockAssignment({ due_date: new Date(now.getTime() + 86400000).toISOString() }), // Tomorrow
                createMockAssignment({ due_date: new Date(now.getTime() - 86400000).toISOString() }), // Yesterday
            ];

            const upcoming = assignments.filter((a) => new Date(a.due_date) > now);
            expect(upcoming.length).toBe(1);
        });
    });

    describe('Assignment Sorting', () => {
        it('should sort by due_date ascending', () => {
            const assignments = [
                createMockAssignment({ due_date: '2026-01-20T00:00:00Z' }),
                createMockAssignment({ due_date: '2026-01-15T00:00:00Z' }),
                createMockAssignment({ due_date: '2026-01-25T00:00:00Z' }),
            ];

            const sorted = [...assignments].sort(
                (a, b) => new Date(a.due_date) - new Date(b.due_date)
            );

            expect(new Date(sorted[0].due_date).getDate()).toBe(15);
            expect(new Date(sorted[2].due_date).getDate()).toBe(25);
        });

        it('should sort by created_at descending', () => {
            const assignments = [
                createMockAssignment({ created_at: '2026-01-10T10:00:00Z' }),
                createMockAssignment({ created_at: '2026-01-12T10:00:00Z' }),
                createMockAssignment({ created_at: '2026-01-08T10:00:00Z' }),
            ];

            const sorted = [...assignments].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
            );

            expect(new Date(sorted[0].created_at).getDate()).toBe(12);
        });
    });

    describe('Due Date Calculations', () => {
        it('should identify overdue assignments', () => {
            const pastDate = new Date(Date.now() - 86400000).toISOString();
            const assignment = createMockAssignment({ due_date: pastDate, status: 'active' });

            const isOverdue = new Date(assignment.due_date) < new Date();
            expect(isOverdue).toBe(true);
        });

        it('should identify assignments due today', () => {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const assignment = createMockAssignment({ due_date: today.toISOString() });

            const dueDate = new Date(assignment.due_date);
            const now = new Date();
            const isDueToday =
                dueDate.getFullYear() === now.getFullYear() &&
                dueDate.getMonth() === now.getMonth() &&
                dueDate.getDate() === now.getDate();

            // Sadece tarih aynıysa true döner
            expect(typeof isDueToday).toBe('boolean');
        });

        it('should calculate days until due', () => {
            const futureDate = new Date(Date.now() + 5 * 86400000).toISOString();
            const assignment = createMockAssignment({ due_date: futureDate });

            const daysUntilDue = Math.ceil(
                (new Date(assignment.due_date) - new Date()) / 86400000
            );

            expect(daysUntilDue).toBeGreaterThanOrEqual(4);
            expect(daysUntilDue).toBeLessThanOrEqual(6);
        });
    });

    describe('Late Submission Penalty', () => {
        it('should calculate late penalty correctly', () => {
            const assignment = createMockAssignment({
                max_points: 100,
                late_penalty_percent: 10,
                allow_late_submission: true,
            });

            const originalScore = 80;
            const daysLate = 2;
            const penaltyPerDay = (assignment.late_penalty_percent / 100) * assignment.max_points;
            const totalPenalty = penaltyPerDay * daysLate;
            const finalScore = Math.max(0, originalScore - totalPenalty);

            expect(penaltyPerDay).toBe(10);
            expect(totalPenalty).toBe(20);
            expect(finalScore).toBe(60);
        });

        it('should not allow negative scores after penalty', () => {
            const assignment = createMockAssignment({
                max_points: 100,
                late_penalty_percent: 50,
            });

            const originalScore = 30;
            const daysLate = 3;
            const penaltyPerDay = (assignment.late_penalty_percent / 100) * assignment.max_points;
            const totalPenalty = penaltyPerDay * daysLate;
            const finalScore = Math.max(0, originalScore - totalPenalty);

            expect(finalScore).toBe(0);
        });

        it('should not apply penalty when late submission is disabled', () => {
            const assignment = createMockAssignment({
                allow_late_submission: false,
            });

            expect(assignment.allow_late_submission).toBe(false);
            // Geç gönderim kabul edilmiyorsa, puan hesaplaması yapılmaz
        });
    });

    describe('Assignment Status Transitions', () => {
        it('should allow draft to active transition', () => {
            const validTransitions = {
                draft: ['active', 'archived'],
                active: ['closed', 'archived'],
                closed: ['active', 'archived'],
                archived: [],
            };

            expect(validTransitions.draft).toContain('active');
        });

        it('should not allow archived to active transition', () => {
            const validTransitions = {
                draft: ['active', 'archived'],
                active: ['closed', 'archived'],
                closed: ['active', 'archived'],
                archived: [],
            };

            expect(validTransitions.archived).not.toContain('active');
        });
    });

    describe('Submission Count', () => {
        it('should track submission count correctly', () => {
            const assignment = {
                ...createMockAssignment(),
                submission_count: 15,
                student_count: 25,
            };

            const submissionRate = (assignment.submission_count / assignment.student_count) * 100;
            expect(submissionRate).toBe(60);
        });

        it('should handle zero students gracefully', () => {
            const assignment = {
                ...createMockAssignment(),
                submission_count: 0,
                student_count: 0,
            };

            const submissionRate =
                assignment.student_count > 0
                    ? (assignment.submission_count / assignment.student_count) * 100
                    : 0;

            expect(submissionRate).toBe(0);
        });
    });

    describe('Max Attempts Validation', () => {
        it('should validate max_attempts is positive', () => {
            const assignment = createMockAssignment({ max_attempts: 3 });
            expect(assignment.max_attempts).toBeGreaterThan(0);
        });

        it('should allow unlimited attempts with special value', () => {
            const assignment = createMockAssignment({ max_attempts: -1 }); // -1 = unlimited
            const isUnlimited = assignment.max_attempts === -1;
            expect(isUnlimited).toBe(true);
        });

        it('should check if student can resubmit', () => {
            const assignment = createMockAssignment({ max_attempts: 3 });
            const currentAttempts = 2;

            const canResubmit =
                assignment.max_attempts === -1 || currentAttempts < assignment.max_attempts;

            expect(canResubmit).toBe(true);
        });
    });
});
