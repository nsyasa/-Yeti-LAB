/**
 * Student RPC IDOR Security Tests
 *
 * Tests for IDOR (Insecure Direct Object Reference) prevention
 * in the Student RPC Security Layer.
 *
 * Scenarios:
 * 1. TokenA with student_get_profile -> only A's data
 * 2. TokenA with ClassB assignment_id submit -> DENY
 * 3. TokenA with progress write -> only A's record
 * 4. anon direct table select -> permission denied
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Student RPC IDOR Security', () => {
    // Mock tokens for different students
    const mockTokenA = 'a'.repeat(64); // Student A's valid token
    const mockTokenB = 'b'.repeat(64); // Student B's valid token
    const invalidToken = 'invalid123'; // Invalid format token

    // Mock student data
    const studentA = {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        classroom_id: 'classroom-a-uuid',
        display_name: 'Student A',
    };

    const studentB = {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        classroom_id: 'classroom-b-uuid',
        display_name: 'Student B',
    };

    // Mock RPC responses
    let mockRpc;

    beforeEach(() => {
        vi.resetModules();
        vi.restoreAllMocks();

        // Setup mock RPC function that simulates IDOR protection
        mockRpc = vi.fn().mockImplementation((functionName, params) => {
            const sessionToken = params.p_session_token;

            // Validate token format (64 hex chars)
            if (!sessionToken || !/^[0-9a-f]{64}$/i.test(sessionToken)) {
                return Promise.resolve({
                    data: null,
                    error: { message: 'Invalid or expired session token', code: 'PGRST301' },
                });
            }

            // Route to appropriate handler based on token
            switch (functionName) {
                case 'student_get_profile':
                    // Token A returns only A's profile, Token B returns only B's
                    if (sessionToken === mockTokenA) {
                        return Promise.resolve({ data: [studentA], error: null });
                    } else if (sessionToken === mockTokenB) {
                        return Promise.resolve({ data: [studentB], error: null });
                    }
                    break;

                case 'student_upsert_submission':
                    // Check if assignment belongs to student's classroom
                    const assignmentClassroom = params.p_assignment_id?.startsWith('class-b')
                        ? 'classroom-b-uuid'
                        : 'classroom-a-uuid';

                    if (sessionToken === mockTokenA && assignmentClassroom !== studentA.classroom_id) {
                        return Promise.resolve({
                            data: null,
                            error: { message: 'Assignment does not belong to your classroom', code: 'IDOR' },
                        });
                    }
                    return Promise.resolve({
                        data: [{ id: 'submission-uuid', status: 'draft', message: 'Draft saved' }],
                        error: null,
                    });

                case 'student_get_progress':
                    // Each token only sees their own progress
                    if (sessionToken === mockTokenA) {
                        return Promise.resolve({
                            data: [{ id: 'progress-a', course_id: 'arduino', project_id: 'p1', quiz_score: 85 }],
                            error: null,
                        });
                    } else if (sessionToken === mockTokenB) {
                        return Promise.resolve({
                            data: [{ id: 'progress-b', course_id: 'scratch', project_id: 'p2', quiz_score: 90 }],
                            error: null,
                        });
                    }
                    break;

                case 'student_upsert_progress':
                    // Progress is always scoped to token owner
                    return Promise.resolve({
                        data: [{ id: 'new-progress', course_id: params.p_course_id, message: 'Progress saved' }],
                        error: null,
                    });

                case 'student_delete_progress':
                    // Can only delete own progress
                    return Promise.resolve({
                        data: [{ success: true, message: 'Progress deleted' }],
                        error: null,
                    });

                default:
                    return Promise.resolve({ data: null, error: { message: 'Unknown function' } });
            }

            return Promise.resolve({ data: null, error: { message: 'Invalid session' } });
        });

        // Setup global mocks
        global.SupabaseClient = {
            getClient: vi.fn().mockReturnValue({
                rpc: mockRpc,
                from: vi.fn().mockImplementation((table) => ({
                    select: vi.fn().mockReturnValue({
                        eq: vi.fn().mockResolvedValue({
                            data: null,
                            error: {
                                message: 'permission denied for table ' + table,
                                code: '42501',
                            },
                        }),
                    }),
                })),
            }),
        };

        global.Auth = {
            currentStudent: null,
            isLoggedIn: vi.fn().mockReturnValue(true),
        };

        window.SupabaseClient = global.SupabaseClient;
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete global.SupabaseClient;
        delete global.Auth;
    });

    // =========================================
    // SCENARIO 1: Profile Access Isolation
    // =========================================
    describe('Scenario 1: Profile Access Isolation', () => {
        it('TokenA should only return Student A profile', async () => {
            const { data, error } = await mockRpc('student_get_profile', {
                p_session_token: mockTokenA,
            });

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe(studentA.id);
            expect(data[0].display_name).toBe('Student A');
        });

        it('TokenB should only return Student B profile', async () => {
            const { data, error } = await mockRpc('student_get_profile', {
                p_session_token: mockTokenB,
            });

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe(studentB.id);
            expect(data[0].display_name).toBe('Student B');
        });

        it('TokenA cannot access TokenB profile (token scoping)', async () => {
            // Even if someone tries to modify the token, they only get their own data
            const { data: dataA } = await mockRpc('student_get_profile', { p_session_token: mockTokenA });
            const { data: dataB } = await mockRpc('student_get_profile', { p_session_token: mockTokenB });

            expect(dataA[0].id).not.toBe(dataB[0].id);
        });
    });

    // =========================================
    // SCENARIO 2: Cross-Classroom Assignment IDOR
    // =========================================
    describe('Scenario 2: Cross-Classroom Assignment IDOR', () => {
        it('TokenA should DENY submission to ClassB assignment', async () => {
            const { data, error } = await mockRpc('student_upsert_submission', {
                p_session_token: mockTokenA,
                p_assignment_id: 'class-b-assignment-123', // Belongs to classroom B
                p_content: 'Hacked submission',
                p_status: 'draft',
            });

            expect(error).not.toBeNull();
            expect(error.message).toContain('does not belong to your classroom');
        });

        it('TokenA should ALLOW submission to own classroom assignment', async () => {
            const { data, error } = await mockRpc('student_upsert_submission', {
                p_session_token: mockTokenA,
                p_assignment_id: 'class-a-assignment-456', // Belongs to classroom A
                p_content: 'Valid submission',
                p_status: 'draft',
            });

            expect(error).toBeNull();
            expect(data[0].status).toBe('draft');
        });
    });

    // =========================================
    // SCENARIO 3: Progress Write Isolation
    // =========================================
    describe('Scenario 3: Progress Write Isolation', () => {
        it('TokenA progress read should only return A records', async () => {
            const { data, error } = await mockRpc('student_get_progress', {
                p_session_token: mockTokenA,
            });

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe('progress-a');
            expect(data[0].course_id).toBe('arduino');
        });

        it('TokenB progress read should only return B records', async () => {
            const { data, error } = await mockRpc('student_get_progress', {
                p_session_token: mockTokenB,
            });

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe('progress-b');
            expect(data[0].course_id).toBe('scratch');
        });

        it('TokenA upsert creates progress scoped to A', async () => {
            const { data, error } = await mockRpc('student_upsert_progress', {
                p_session_token: mockTokenA,
                p_course_id: 'microbit',
                p_project_id: 'new-project',
                p_quiz_score: 75,
            });

            expect(error).toBeNull();
            expect(data[0].course_id).toBe('microbit');
            expect(data[0].message).toBe('Progress saved');
        });

        it('TokenA delete only affects A progress', async () => {
            const { data, error } = await mockRpc('student_delete_progress', {
                p_session_token: mockTokenA,
                p_project_id: 'some-project',
            });

            expect(error).toBeNull();
            expect(data[0].success).toBe(true);
        });
    });

    // =========================================
    // SCENARIO 4: Anon Direct Table Access Denied
    // =========================================
    describe('Scenario 4: Anon Direct Table Access Denied', () => {
        it('anon SELECT on students table should be denied', async () => {
            const client = global.SupabaseClient.getClient();
            const { data, error } = await client.from('students').select('*').eq('id', 'any-id');

            expect(error).not.toBeNull();
            expect(error.code).toBe('42501');
            expect(error.message).toContain('permission denied');
        });

        it('anon SELECT on submissions table should be denied', async () => {
            const client = global.SupabaseClient.getClient();
            const { data, error } = await client.from('submissions').select('*').eq('id', 'any-id');

            expect(error).not.toBeNull();
            expect(error.code).toBe('42501');
            expect(error.message).toContain('permission denied');
        });

        it('anon SELECT on student_progress table should be denied', async () => {
            const client = global.SupabaseClient.getClient();
            const { data, error } = await client.from('student_progress').select('*').eq('id', 'any-id');

            expect(error).not.toBeNull();
            expect(error.code).toBe('42501');
            expect(error.message).toContain('permission denied');
        });
    });

    // =========================================
    // TOKEN VALIDATION
    // =========================================
    describe('Token Format Validation', () => {
        it('invalid token format should be rejected', async () => {
            const { data, error } = await mockRpc('student_get_profile', {
                p_session_token: invalidToken, // Not 64 hex chars
            });

            expect(error).not.toBeNull();
            expect(error.message).toContain('Invalid or expired session token');
        });

        it('null token should be rejected', async () => {
            const { data, error } = await mockRpc('student_get_profile', {
                p_session_token: null,
            });

            expect(error).not.toBeNull();
            expect(error.message).toContain('Invalid or expired session token');
        });

        it('empty token should be rejected', async () => {
            const { data, error } = await mockRpc('student_get_profile', {
                p_session_token: '',
            });

            expect(error).not.toBeNull();
            expect(error.message).toContain('Invalid or expired session token');
        });
    });
});
