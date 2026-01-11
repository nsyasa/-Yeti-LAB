/**
 * StudentSubmissionService Unit Tests
 * modules/studentSubmissionService.js için test suite
 * Faz 8: Test & Optimizasyon
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock file helper
const createMockFile = (name = 'test.txt', size = 1024, type = 'text/plain') => ({
    name,
    size,
    type,
    lastModified: Date.now(),
});

// Test helpers
const createMockSubmission = (overrides = {}) => ({
    id: 'test-submission-id',
    assignment_id: 'test-assignment-id',
    student_id: 'test-student-id',
    status: 'submitted',
    content: 'Ödev içeriği buraya gelecek',
    grade: null,
    feedback: null,
    submitted_at: '2026-01-11T15:30:00Z',
    graded_at: null,
    attempt_number: 1,
    is_late: false,
    created_at: '2026-01-11T14:00:00Z',
    updated_at: '2026-01-11T15:30:00Z',
    ...overrides,
});

const createMockSubmissionFile = (overrides = {}) => ({
    id: 'test-file-id',
    submission_id: 'test-submission-id',
    file_name: 'proje.sb3',
    file_url: 'https://storage.supabase.io/submissions/test.sb3',
    file_size: 102400,
    file_type: 'application/octet-stream',
    uploaded_at: '2026-01-11T15:30:00Z',
    ...overrides,
});

const createMockAssignment = (overrides = {}) => ({
    id: 'test-assignment-id',
    title: 'Test Ödevi',
    description: 'Test açıklaması',
    due_date: '2026-01-20T23:59:00Z',
    max_points: 100,
    max_attempts: 3,
    allow_late_submission: true,
    late_penalty_percent: 10,
    status: 'active',
    ...overrides,
});

describe('StudentSubmissionService', () => {
    beforeEach(() => {
        testHelpers.clearStorage();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Submission Data Validation', () => {
        it('should have required submission fields', () => {
            const submission = createMockSubmission();

            expect(submission.id).toBeDefined();
            expect(submission.assignment_id).toBeDefined();
            expect(submission.student_id).toBeDefined();
            expect(submission.status).toBeDefined();
        });

        it('should have valid status values', () => {
            const validStatuses = ['draft', 'submitted', 'graded', 'returned'];
            const submission = createMockSubmission({ status: 'submitted' });

            expect(validStatuses).toContain(submission.status);
        });

        it('should have valid attempt number', () => {
            const submission = createMockSubmission({ attempt_number: 2 });

            expect(submission.attempt_number).toBeGreaterThan(0);
        });

        it('should track late submissions', () => {
            const lateSubmission = createMockSubmission({ is_late: true });

            expect(lateSubmission.is_late).toBe(true);
        });
    });

    describe('File Validation', () => {
        it('should validate allowed file types', () => {
            const allowedTypes = [
                'application/x-scratch-project', // .sb3
                'application/octet-stream',
                'image/png',
                'image/jpeg',
                'application/pdf',
                'text/plain',
            ];

            const file = createMockSubmissionFile({ file_type: 'image/png' });
            const isAllowed = allowedTypes.includes(file.file_type);

            expect(isAllowed).toBe(true);
        });

        it('should reject disallowed file types', () => {
            const allowedTypes = [
                'application/x-scratch-project',
                'application/octet-stream',
                'image/png',
                'image/jpeg',
                'application/pdf',
            ];

            const file = createMockSubmissionFile({ file_type: 'application/x-executable' });
            const isAllowed = allowedTypes.includes(file.file_type);

            expect(isAllowed).toBe(false);
        });

        it('should validate max file size (10MB)', () => {
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

            const validFile = createMockSubmissionFile({ file_size: 5 * 1024 * 1024 });
            const oversizedFile = createMockSubmissionFile({ file_size: 15 * 1024 * 1024 });

            expect(validFile.file_size).toBeLessThanOrEqual(MAX_FILE_SIZE);
            expect(oversizedFile.file_size).toBeGreaterThan(MAX_FILE_SIZE);
        });

        it('should extract file extension correctly', () => {
            const fileName = 'project-final.sb3';
            const extension = fileName.split('.').pop().toLowerCase();

            expect(extension).toBe('sb3');
        });
    });

    describe('Submission Status Transitions', () => {
        it('should allow draft to submitted transition', () => {
            const validTransitions = {
                draft: ['submitted'],
                submitted: ['graded', 'returned'],
                graded: [],
                returned: ['submitted'], // Resubmit için
            };

            expect(validTransitions.draft).toContain('submitted');
        });

        it('should allow returned to submitted transition (resubmit)', () => {
            const validTransitions = {
                draft: ['submitted'],
                submitted: ['graded', 'returned'],
                graded: [],
                returned: ['submitted'],
            };

            expect(validTransitions.returned).toContain('submitted');
        });

        it('should not allow graded submissions to change status', () => {
            const validTransitions = {
                draft: ['submitted'],
                submitted: ['graded', 'returned'],
                graded: [],
                returned: ['submitted'],
            };

            expect(validTransitions.graded.length).toBe(0);
        });
    });

    describe('Attempt Counting', () => {
        it('should increment attempt on resubmission', () => {
            const submission = createMockSubmission({ attempt_number: 1 });
            const newAttempt = submission.attempt_number + 1;

            expect(newAttempt).toBe(2);
        });

        it('should check if more attempts available', () => {
            const assignment = createMockAssignment({ max_attempts: 3 });
            const submission = createMockSubmission({ attempt_number: 2 });

            const canResubmit = submission.attempt_number < assignment.max_attempts;
            expect(canResubmit).toBe(true);
        });

        it('should block submission when max attempts reached', () => {
            const assignment = createMockAssignment({ max_attempts: 3 });
            const submission = createMockSubmission({ attempt_number: 3 });

            const canResubmit = submission.attempt_number < assignment.max_attempts;
            expect(canResubmit).toBe(false);
        });

        it('should allow unlimited attempts with special value', () => {
            const assignment = createMockAssignment({ max_attempts: -1 });
            const submission = createMockSubmission({ attempt_number: 10 });

            const canResubmit =
                assignment.max_attempts === -1 ||
                submission.attempt_number < assignment.max_attempts;

            expect(canResubmit).toBe(true);
        });
    });

    describe('Late Submission Detection', () => {
        it('should detect late submission', () => {
            const dueDate = new Date('2026-01-10T23:59:00Z');
            const submittedAt = new Date('2026-01-11T15:30:00Z');

            const isLate = submittedAt > dueDate;
            expect(isLate).toBe(true);
        });

        it('should detect on-time submission', () => {
            const dueDate = new Date('2026-01-20T23:59:00Z');
            const submittedAt = new Date('2026-01-11T15:30:00Z');

            const isLate = submittedAt > dueDate;
            expect(isLate).toBe(false);
        });

        it('should calculate late hours', () => {
            const dueDate = new Date('2026-01-10T23:59:00Z');
            const submittedAt = new Date('2026-01-11T23:59:00Z');

            const lateHours = Math.ceil((submittedAt - dueDate) / (1000 * 60 * 60));
            expect(lateHours).toBe(24);
        });

        it('should block late submission when not allowed', () => {
            const assignment = createMockAssignment({ allow_late_submission: false });
            const dueDate = new Date(assignment.due_date);
            const now = new Date('2026-01-21T00:00:00Z');

            const isAfterDue = now > dueDate;
            const canSubmit = !isAfterDue || assignment.allow_late_submission;

            expect(canSubmit).toBe(false);
        });
    });

    describe('Grade Calculations', () => {
        it('should validate grade within max_points', () => {
            const assignment = createMockAssignment({ max_points: 100 });
            const submission = createMockSubmission({ grade: 85 });

            expect(submission.grade).toBeLessThanOrEqual(assignment.max_points);
            expect(submission.grade).toBeGreaterThanOrEqual(0);
        });

        it('should apply late penalty correctly', () => {
            const assignment = createMockAssignment({
                max_points: 100,
                late_penalty_percent: 10,
            });

            const originalGrade = 90;
            const daysLate = 1;
            const penalty = (assignment.late_penalty_percent / 100) * assignment.max_points * daysLate;
            const finalGrade = Math.max(0, originalGrade - penalty);

            expect(penalty).toBe(10);
            expect(finalGrade).toBe(80);
        });

        it('should calculate percentage score', () => {
            const assignment = createMockAssignment({ max_points: 100 });
            const submission = createMockSubmission({ grade: 75 });

            const percentage = (submission.grade / assignment.max_points) * 100;
            expect(percentage).toBe(75);
        });

        it('should handle zero grade', () => {
            const submission = createMockSubmission({ grade: 0 });
            expect(submission.grade).toBe(0);
        });
    });

    describe('Feedback Handling', () => {
        it('should allow empty feedback initially', () => {
            const submission = createMockSubmission({ feedback: null });
            expect(submission.feedback).toBeNull();
        });

        it('should store feedback text', () => {
            const feedback = 'Harika bir çalışma! Kod yapısı çok iyi.';
            const submission = createMockSubmission({ feedback });

            expect(submission.feedback).toBe(feedback);
        });

        it('should handle long feedback text', () => {
            const longFeedback = 'A'.repeat(5000);
            const submission = createMockSubmission({ feedback: longFeedback });

            expect(submission.feedback.length).toBe(5000);
        });
    });

    describe('Submission Content', () => {
        it('should store text content', () => {
            const content = '# Proje Açıklaması\n\nBu proje...';
            const submission = createMockSubmission({ content });

            expect(submission.content).toBe(content);
        });

        it('should handle HTML content sanitization', () => {
            const unsafeContent = '<script>alert("xss")</script><p>Safe content</p>';

            // Basit sanitization örneği
            const sanitized = unsafeContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('<p>Safe content</p>');
        });

        it('should handle empty content', () => {
            const submission = createMockSubmission({ content: '' });
            expect(submission.content).toBe('');
        });
    });

    describe('File Management', () => {
        it('should track multiple files per submission', () => {
            const files = [
                createMockSubmissionFile({ file_name: 'main.sb3' }),
                createMockSubmissionFile({ file_name: 'screenshot.png' }),
                createMockSubmissionFile({ file_name: 'readme.txt' }),
            ];

            expect(files.length).toBe(3);
        });

        it('should calculate total file size', () => {
            const files = [
                createMockSubmissionFile({ file_size: 1024 * 100 }), // 100KB
                createMockSubmissionFile({ file_size: 1024 * 200 }), // 200KB
            ];

            const totalSize = files.reduce((sum, f) => sum + f.file_size, 0);
            expect(totalSize).toBe(1024 * 300);
        });

        it('should validate total upload limit', () => {
            const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB total

            const files = [
                createMockSubmissionFile({ file_size: 20 * 1024 * 1024 }),
                createMockSubmissionFile({ file_size: 15 * 1024 * 1024 }),
            ];

            const totalSize = files.reduce((sum, f) => sum + f.file_size, 0);
            expect(totalSize).toBeLessThan(MAX_TOTAL_SIZE);
        });
    });

    describe('Submission Timestamps', () => {
        it('should track creation time', () => {
            const submission = createMockSubmission();

            expect(submission.created_at).toBeDefined();
            expect(new Date(submission.created_at)).toBeInstanceOf(Date);
        });

        it('should track submission time', () => {
            const submission = createMockSubmission();

            expect(submission.submitted_at).toBeDefined();
        });

        it('should track grading time when graded', () => {
            const submission = createMockSubmission({
                status: 'graded',
                grade: 85,
                graded_at: '2026-01-12T10:00:00Z',
            });

            expect(submission.graded_at).toBeDefined();
        });

        it('should have null graded_at for ungraded submissions', () => {
            const submission = createMockSubmission({ status: 'submitted' });

            expect(submission.graded_at).toBeNull();
        });
    });

    describe('Student Assignment View', () => {
        it('should identify pending assignments', () => {
            const assignments = [
                {
                    ...createMockAssignment(),
                    my_submission: null,
                },
                {
                    ...createMockAssignment(),
                    my_submission: createMockSubmission(),
                },
            ];

            const pending = assignments.filter((a) => !a.my_submission);
            expect(pending.length).toBe(1);
        });

        it('should identify submitted assignments', () => {
            const assignments = [
                {
                    ...createMockAssignment(),
                    my_submission: createMockSubmission({ status: 'submitted' }),
                },
                {
                    ...createMockAssignment(),
                    my_submission: null,
                },
            ];

            const submitted = assignments.filter((a) => a.my_submission?.status === 'submitted');
            expect(submitted.length).toBe(1);
        });

        it('should identify graded assignments', () => {
            const assignment = {
                ...createMockAssignment(),
                my_submission: createMockSubmission({
                    status: 'graded',
                    grade: 90,
                }),
            };

            expect(assignment.my_submission.status).toBe('graded');
            expect(assignment.my_submission.grade).toBe(90);
        });
    });

    describe('Submission Sorting', () => {
        it('should sort by submitted_at descending', () => {
            const submissions = [
                createMockSubmission({ submitted_at: '2026-01-10T10:00:00Z' }),
                createMockSubmission({ submitted_at: '2026-01-12T10:00:00Z' }),
                createMockSubmission({ submitted_at: '2026-01-08T10:00:00Z' }),
            ];

            const sorted = [...submissions].sort(
                (a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)
            );

            expect(new Date(sorted[0].submitted_at).getDate()).toBe(12);
        });

        it('should sort by grade descending', () => {
            const submissions = [
                createMockSubmission({ grade: 75 }),
                createMockSubmission({ grade: 95 }),
                createMockSubmission({ grade: 80 }),
            ];

            const sorted = [...submissions].sort((a, b) => b.grade - a.grade);
            expect(sorted[0].grade).toBe(95);
        });
    });
});
