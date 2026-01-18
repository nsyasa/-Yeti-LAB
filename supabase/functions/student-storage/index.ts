// Supabase Edge Function: student-storage
// Handles secure file uploads for session-token students (Model B)
// Uses service role key - NEVER expose to frontend

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// File type allowlist
const ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Session token format: 64 hex characters
const SESSION_TOKEN_REGEX = /^[0-9a-f]{64}$/i;

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Only POST allowed
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ error: 'Method not allowed' }), {
                status: 405,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Parse request body
        const body = await req.json();
        const { action, session_token } = body;

        if (!action || !session_token) {
            return new Response(JSON.stringify({ error: 'Missing required fields: action, session_token' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Validate session token format
        if (!SESSION_TOKEN_REGEX.test(session_token)) {
            return new Response(JSON.stringify({ error: 'Invalid session token format' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Create Supabase client with service role (bypass RLS)
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Validate session and get student info
        const { data: student, error: studentError } = await supabase
            .from('students')
            .select('id, classroom_id, display_name')
            .eq('session_token', session_token)
            .single();

        if (studentError || !student || !student.classroom_id) {
            return new Response(JSON.stringify({ error: 'Invalid or expired session token' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Route to action handler
        switch (action) {
            case 'createUpload':
                return await handleCreateUpload(supabase, student, body, corsHeaders);
            case 'deleteFile':
                return await handleDeleteFile(supabase, student, body, corsHeaders);
            default:
                return new Response(JSON.stringify({ error: 'Unknown action' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
        }
    } catch (error) {
        console.error('Edge function error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

async function handleCreateUpload(
    supabase: ReturnType<typeof createClient>,
    student: { id: string; classroom_id: string },
    body: { submission_id: string; file_name: string; content_type: string; file_size: number },
    corsHeaders: Record<string, string>
) {
    const { submission_id, file_name, content_type, file_size } = body;

    // Validate required fields
    if (!submission_id || !file_name || !content_type || !file_size) {
        return new Response(
            JSON.stringify({ error: 'Missing required fields: submission_id, file_name, content_type, file_size' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(content_type)) {
        return new Response(JSON.stringify({ error: 'File type not allowed', allowed: ALLOWED_FILE_TYPES }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Validate file size
    if (file_size > MAX_FILE_SIZE) {
        return new Response(JSON.stringify({ error: 'File too large', max_size_mb: MAX_FILE_SIZE / (1024 * 1024) }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Get submission and verify ownership
    const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .select('id, student_id, assignment_id')
        .eq('id', submission_id)
        .single();

    if (submissionError || !submission) {
        return new Response(JSON.stringify({ error: 'Submission not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Verify student owns this submission
    if (submission.student_id !== student.id) {
        return new Response(JSON.stringify({ error: 'Access denied: You do not own this submission' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Verify assignment belongs to student's classroom and is active/closed
    const { data: assignment, error: assignmentError } = await supabase
        .from('assignments')
        .select('id, classroom_id, status')
        .eq('id', submission.assignment_id)
        .single();

    if (assignmentError || !assignment) {
        return new Response(JSON.stringify({ error: 'Assignment not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (assignment.classroom_id !== student.classroom_id) {
        return new Response(JSON.stringify({ error: 'Access denied: Assignment not in your classroom' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!['published', 'active', 'closed'].includes(assignment.status)) {
        return new Response(JSON.stringify({ error: 'Assignment is not accepting submissions' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Generate storage path
    const sanitizedFileName = file_name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uuid = crypto.randomUUID();
    const storagePath = `students/${student.id}/${submission_id}/${uuid}-${sanitizedFileName}`;

    // Create signed upload URL
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from('submissions')
        .createSignedUploadUrl(storagePath);

    if (signedUrlError) {
        console.error('Signed URL error:', signedUrlError);
        return new Response(JSON.stringify({ error: 'Failed to create upload URL' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Get public URL for the file
    const { data: publicUrlData } = supabase.storage.from('submissions').getPublicUrl(storagePath);

    return new Response(
        JSON.stringify({
            success: true,
            path: storagePath,
            signed_url: signedUrl.signedUrl,
            token: signedUrl.token,
            public_url: publicUrlData.publicUrl,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
}

async function handleDeleteFile(
    supabase: ReturnType<typeof createClient>,
    student: { id: string; classroom_id: string },
    body: { file_id: string },
    corsHeaders: Record<string, string>
) {
    const { file_id } = body;

    if (!file_id) {
        return new Response(JSON.stringify({ error: 'Missing required field: file_id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Get file record with submission join for ownership check
    const { data: fileRecord, error: fileError } = await supabase
        .from('submission_files')
        .select('id, file_path, submission:submissions!inner(id, student_id)')
        .eq('id', file_id)
        .single();

    if (fileError || !fileRecord) {
        return new Response(JSON.stringify({ error: 'File not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Verify student owns this file's submission
    const submission = fileRecord.submission as { id: string; student_id: string };
    if (submission.student_id !== student.id) {
        return new Response(JSON.stringify({ error: 'Access denied: You do not own this file' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Delete from storage
    if (fileRecord.file_path) {
        const { error: storageError } = await supabase.storage.from('submissions').remove([fileRecord.file_path]);

        if (storageError) {
            console.error('Storage delete error:', storageError);
            // Continue to delete DB record even if storage fails
        }
    }

    // Delete DB record
    const { error: deleteError } = await supabase.from('submission_files').delete().eq('id', file_id);

    if (deleteError) {
        return new Response(JSON.stringify({ error: 'Failed to delete file record' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ success: true, deleted_file_id: file_id }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
}
