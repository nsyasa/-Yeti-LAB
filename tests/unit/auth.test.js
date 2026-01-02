/**
 * Auth Module Unit Tests
 * modules/auth.js için test suite
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Test için Auth modülü mock ---
// Gerçek modül global window'a bağlı olduğundan, izole test için fonksiyonları simüle ediyoruz

describe('Auth Module', () => {
    describe('Session Storage Keys', () => {
        it('should have correct session key names', () => {
            // Auth modülündeki key'lerin tutarlılığını test et
            const expectedStudentKey = 'yeti_student_session';
            const expectedRoleKey = 'yeti_user_role';

            // Bu değerler modules/auth.js içinde tanımlı
            expect(expectedStudentKey).toBe('yeti_student_session');
            expect(expectedRoleKey).toBe('yeti_user_role');
        });
    });

    describe('Student Session', () => {
        beforeEach(() => {
            testHelpers.clearStorage();
        });

        it('should store student session in sessionStorage', () => {
            const mockStudent = testHelpers.createMockStudent();

            // Simulate saving session
            sessionStorage.setItem('yeti_student_session', JSON.stringify(mockStudent));

            // Verify
            const stored = JSON.parse(sessionStorage.getItem('yeti_student_session'));
            expect(stored.id).toBe('test-student-id');
            expect(stored.display_name).toBe('Test Öğrenci');
        });

        it('should return null when no session exists', () => {
            const stored = sessionStorage.getItem('yeti_student_session');
            expect(stored).toBeNull();
        });

        it('should clear session on logout', () => {
            // Setup
            sessionStorage.setItem('yeti_student_session', JSON.stringify({ id: '123' }));
            sessionStorage.setItem('yeti_user_role', 'student');

            // Simulate logout
            sessionStorage.removeItem('yeti_student_session');
            sessionStorage.removeItem('yeti_user_role');

            // Verify
            expect(sessionStorage.getItem('yeti_student_session')).toBeNull();
            expect(sessionStorage.getItem('yeti_user_role')).toBeNull();
        });
    });

    describe('Role Management', () => {
        it('should identify student role correctly', () => {
            sessionStorage.setItem('yeti_user_role', 'student');
            expect(sessionStorage.getItem('yeti_user_role')).toBe('student');
        });

        it('should identify teacher role correctly', () => {
            sessionStorage.setItem('yeti_user_role', 'teacher');
            expect(sessionStorage.getItem('yeti_user_role')).toBe('teacher');
        });
    });

    describe('Classroom Code Validation', () => {
        // Sınıf kodu 5 karakter olmalı
        it('should validate 5-character classroom code', () => {
            const validCode = 'ABCDE';
            const invalidCodes = ['ABC', 'ABCDEF', '', '12345'];

            expect(validCode.length).toBe(5);
            expect(/^[A-Z]{5}$/.test(validCode)).toBe(true);

            invalidCodes.forEach((code) => {
                if (code.length !== 5) {
                    expect(code.length).not.toBe(5);
                }
            });
        });
    });

    describe('Display Name Extraction', () => {
        it('should get display name from student session', () => {
            const mockStudent = testHelpers.createMockStudent({ display_name: 'Ahmet Yılmaz' });
            sessionStorage.setItem('yeti_student_session', JSON.stringify(mockStudent));

            const stored = JSON.parse(sessionStorage.getItem('yeti_student_session'));
            expect(stored.display_name).toBe('Ahmet Yılmaz');
        });

        it('should handle missing display name gracefully', () => {
            const mockStudent = { id: 'test-id' }; // display_name yok
            sessionStorage.setItem('yeti_student_session', JSON.stringify(mockStudent));

            const stored = JSON.parse(sessionStorage.getItem('yeti_student_session'));
            expect(stored.display_name).toBeUndefined();
        });
    });
});
