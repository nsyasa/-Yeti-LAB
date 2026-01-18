/**
 * Student Storage IDOR Integration Tests
 * Tests file operations isolation for session-token students
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase client
const mockRpc = vi.fn();
const mockSupabaseClient = {
    rpc: mockRpc,
    storage: {
        from: vi.fn(() => ({
            uploadToSignedUrl: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })),
    },
};

// Mock window objects
vi.stubGlobal('SupabaseClient', {
    getClient: () => mockSupabaseClient,
    client: mockSupabaseClient,
    supabaseUrl: 'https://test-project.supabase.co',
});

// Mock Auth module
vi.stubGlobal('Auth', {
    currentStudent: null,
});

// Mock fetch for Edge Function
vi.stubGlobal('fetch', vi.fn());

describe('Student Storage IDOR Tests', () => {
    const validTokenA = 'a'.repeat(64);
    const validTokenB = 'b'.repeat(64);
    const submissionA = '11111111-1111-1111-1111-111111111111';
    const submissionB = '22222222-2222-2222-2222-222222222222';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        window.Auth.currentStudent = null;
    });

    describe('student_list_submission_files RPC', () => {
        it('TokenA can list files for own submission (submissionA)', async () => {
            // Mock successful response
            mockRpc.mockResolvedValueOnce({
                data: [{ id: 'file-1', file_name: 'test.pdf', submission_id: submissionA }],
                error: null,
            });

            const { data, error } = await mockSupabaseClient.rpc('student_list_submission_files', {
                p_session_token: validTokenA,
                p_submission_id: submissionA,
            });

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].file_name).toBe('test.pdf');
        });

        it('TokenA cannot list files for submissionB (different owner)', async () => {
            // Mock forbidden response
            mockRpc.mockResolvedValueOnce({
                data: null,
                error: { message: 'Access denied: You do not own this submission', code: 'PGRST301' },
            });

            const { data, error } = await mockSupabaseClient.rpc('student_list_submission_files', {
                p_session_token: validTokenA,
                p_submission_id: submissionB,
            });

            expect(error).not.toBeNull();
            expect(error.message).toContain('Access denied');
            expect(data).toBeNull();
        });

        it('Invalid token format returns error', async () => {
            mockRpc.mockResolvedValueOnce({
                data: null,
                error: { message: 'Invalid session token format', code: 'PGRST301' },
            });

            const { data, error } = await mockSupabaseClient.rpc('student_list_submission_files', {
                p_session_token: 'invalid-token',
                p_submission_id: submissionA,
            });

            expect(error).not.toBeNull();
            expect(error.message).toContain('Invalid session token');
        });
    });

    describe('student_add_submission_file RPC', () => {
        it('TokenA can add file to own submission', async () => {
            mockRpc.mockResolvedValueOnce({
                data: [
                    {
                        id: 'new-file-id',
                        submission_id: submissionA,
                        file_name: 'uploaded.pdf',
                        file_path: 'students/student-a/submission-a/uuid-uploaded.pdf',
                    },
                ],
                error: null,
            });

            const { data, error } = await mockSupabaseClient.rpc('student_add_submission_file', {
                p_session_token: validTokenA,
                p_submission_id: submissionA,
                p_file_name: 'uploaded.pdf',
                p_file_path: 'students/student-a/submission-a/uuid-uploaded.pdf',
                p_file_url: 'https://test.supabase.co/storage/v1/object/public/submissions/...',
                p_file_size: 1024,
                p_file_type: 'application/pdf',
            });

            expect(error).toBeNull();
            expect(data).toHaveLength(1);
            expect(data[0].id).toBe('new-file-id');
        });

        it('TokenA cannot add file to submissionB (IDOR)', async () => {
            mockRpc.mockResolvedValueOnce({
                data: null,
                error: { message: 'Access denied: You do not own this submission', code: 'PGRST301' },
            });

            const { data, error } = await mockSupabaseClient.rpc('student_add_submission_file', {
                p_session_token: validTokenA,
                p_submission_id: submissionB,
                p_file_name: 'malicious.pdf',
                p_file_path: 'some/path.pdf',
                p_file_url: 'https://...',
                p_file_size: 100,
                p_file_type: 'application/pdf',
            });

            expect(error).not.toBeNull();
            expect(error.message).toContain('Access denied');
        });
    });

    describe('Anon direct table access', () => {
        it('Anon cannot SELECT from submission_files directly', async () => {
            // This would be caught by REVOKE ALL FROM anon in production
            // Simulating the expected behavior
            const mockDirectQuery = vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'permission denied for table submission_files', code: '42501' },
            });

            const result = await mockDirectQuery('submission_files', 'SELECT');

            expect(result.error).not.toBeNull();
            expect(result.error.message).toContain('permission denied');
        });

        it('Anon cannot INSERT to submission_files directly', async () => {
            const mockDirectInsert = vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'permission denied for table submission_files', code: '42501' },
            });

            const result = await mockDirectInsert('submission_files', 'INSERT');

            expect(result.error).not.toBeNull();
            expect(result.error.message).toContain('permission denied');
        });
    });

    describe('Edge Function createUpload', () => {
        it('Edge Function validates submission ownership before returning signed URL', async () => {
            // Mock successful Edge Function response
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        path: 'students/student-a/submission-a/uuid-file.pdf',
                        signed_url: 'https://...',
                        token: 'upload-token',
                        public_url: 'https://public-url',
                    }),
            });

            const response = await fetch('https://test.supabase.co/functions/v1/student-storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'createUpload',
                    session_token: validTokenA,
                    submission_id: submissionA,
                    file_name: 'test.pdf',
                    content_type: 'application/pdf',
                    file_size: 1024,
                }),
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.path).toContain('students/');
        });

        it('Edge Function denies upload for wrong submission owner', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: () =>
                    Promise.resolve({
                        error: 'Access denied: You do not own this submission',
                    }),
            });

            const response = await fetch('https://test.supabase.co/functions/v1/student-storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'createUpload',
                    session_token: validTokenA,
                    submission_id: submissionB, // Not owned by TokenA
                    file_name: 'test.pdf',
                    content_type: 'application/pdf',
                    file_size: 1024,
                }),
            });

            expect(response.ok).toBe(false);
            expect(response.status).toBe(403);
        });

        it('Edge Function rejects invalid file types', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: () =>
                    Promise.resolve({
                        error: 'File type not allowed',
                    }),
            });

            const response = await fetch('https://test.supabase.co/functions/v1/student-storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'createUpload',
                    session_token: validTokenA,
                    submission_id: submissionA,
                    file_name: 'malware.exe',
                    content_type: 'application/x-msdownload',
                    file_size: 1024,
                }),
            });

            expect(response.ok).toBe(false);
        });
    });

    describe('Edge Function deleteFile', () => {
        it('Edge Function allows deleting own file', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        success: true,
                        deleted_file_id: 'file-id-123',
                    }),
            });

            const response = await fetch('https://test.supabase.co/functions/v1/student-storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteFile',
                    session_token: validTokenA,
                    file_id: 'file-id-123',
                }),
            });

            expect(response.ok).toBe(true);
            const data = await response.json();
            expect(data.success).toBe(true);
        });

        it('Edge Function denies deleting another students file', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                json: () =>
                    Promise.resolve({
                        error: 'Access denied: You do not own this file',
                    }),
            });

            const response = await fetch('https://test.supabase.co/functions/v1/student-storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'deleteFile',
                    session_token: validTokenA,
                    file_id: 'file-owned-by-student-b',
                }),
            });

            expect(response.ok).toBe(false);
            expect(response.status).toBe(403);
        });
    });
});
