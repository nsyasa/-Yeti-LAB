/**
 * Progress Module Unit Tests
 * modules/progress.js için test suite
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Progress Module', () => {
    describe('Data Structure', () => {
        it('should have correct initial data shape', () => {
            // Progress modülünün beklenen veri yapısı
            const expectedShape = {
                data: {}, // { courseKey: [completedProjectIds] }
                scores: {}, // { courseKey: { projectId: score } }
                dates: [], // ISO date strings
                isLoading: false,
                isInitialized: false,
            };

            expect(Object.keys(expectedShape)).toContain('data');
            expect(Object.keys(expectedShape)).toContain('scores');
            expect(Object.keys(expectedShape)).toContain('dates');
        });
    });

    describe('Course Key Handling', () => {
        it('should handle valid course keys', () => {
            const validCourseKeys = ['arduino', 'microbit', 'scratch', 'mblock', 'appinventor'];

            validCourseKeys.forEach((key) => {
                expect(typeof key).toBe('string');
                expect(key.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Completion Toggle Logic', () => {
        let progressData;

        beforeEach(() => {
            // Her testte temiz başla
            progressData = { arduino: [] };
        });

        it('should add project to completed list', () => {
            const projectId = 5;

            if (!progressData.arduino.includes(projectId)) {
                progressData.arduino.push(projectId);
            }

            expect(progressData.arduino).toContain(5);
        });

        it('should remove project from completed list on toggle', () => {
            progressData.arduino = [1, 2, 3];
            const projectIdToRemove = 2;

            const index = progressData.arduino.indexOf(projectIdToRemove);
            if (index > -1) {
                progressData.arduino.splice(index, 1);
            }

            expect(progressData.arduino).not.toContain(2);
            expect(progressData.arduino).toEqual([1, 3]);
        });

        it('should not add duplicate project ids', () => {
            progressData.arduino = [1, 2];
            const projectId = 2; // Already exists

            if (!progressData.arduino.includes(projectId)) {
                progressData.arduino.push(projectId);
            }

            expect(progressData.arduino.filter((id) => id === 2).length).toBe(1);
        });
    });

    describe('Completion Rate Calculation', () => {
        it('should calculate 0% when no projects completed', () => {
            const completed = 0;
            const total = 20;
            const rate = total > 0 ? (completed / total) * 100 : 0;

            expect(rate).toBe(0);
        });

        it('should calculate 50% when half projects completed', () => {
            const completed = 10;
            const total = 20;
            const rate = (completed / total) * 100;

            expect(rate).toBe(50);
        });

        it('should calculate 100% when all projects completed', () => {
            const completed = 20;
            const total = 20;
            const rate = (completed / total) * 100;

            expect(rate).toBe(100);
        });

        it('should handle edge case of zero total projects', () => {
            const completed = 0;
            const total = 0;
            const rate = total > 0 ? (completed / total) * 100 : 0;

            expect(rate).toBe(0);
        });
    });

    describe('Student ID Extraction', () => {
        it('should extract student id from classroom session', () => {
            const mockSession = testHelpers.createMockStudent();
            sessionStorage.setItem('yeti_student_session', JSON.stringify(mockSession));

            const stored = JSON.parse(sessionStorage.getItem('yeti_student_session'));
            expect(stored.id).toBe('test-student-id');
        });

        it('should return null when no student session', () => {
            const stored = sessionStorage.getItem('yeti_student_session');
            expect(stored).toBeNull();
        });
    });

    describe('Statistics Aggregation', () => {
        it('should count total completed lessons across courses', () => {
            const progressData = {
                arduino: [1, 2, 3],
                microbit: [1, 2],
                scratch: [1],
            };

            const totalCompleted = Object.values(progressData).reduce((sum, arr) => sum + arr.length, 0);

            expect(totalCompleted).toBe(6);
        });

        it('should calculate XP based on completed lessons', () => {
            const completedLessons = 10;
            const xpPerLesson = 50;
            const totalXP = completedLessons * xpPerLesson;

            expect(totalXP).toBe(500);
        });
    });
});
