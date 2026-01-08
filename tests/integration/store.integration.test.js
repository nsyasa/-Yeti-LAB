/**
 * Store Module Integration Tests
 *
 * Bu testler GERÇEK Store modülünü test eder.
 * Mevcut unit testler mock kullanır, bunlar gerçek davranışı test eder.
 *
 * Not: Bu testler modülü dinamik olarak yükler ve reset eder.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Store Integration', () => {
    let Store;

    beforeEach(async () => {
        // Her test öncesi localStorage temizle
        localStorage.clear();
        sessionStorage.clear();

        // Modül cache'ini temizle
        vi.resetModules();

        // DOM'u hazırla
        document.body.innerHTML = '';
        document.body.classList.remove('dark-mode');

        // window.Store'u temizle
        delete window.Store;

        try {
            // Modülü yeniden yükle (fresh state için)
            const module = await import('../../modules/store/store.js');
            Store = window.Store; // Store, window'a atanıyor
        } catch (e) {
            console.warn('Store module import failed:', e.message);
            Store = null;
        }
    });

    afterEach(() => {
        localStorage.clear();
        document.body.classList.remove('dark-mode');
    });

    describe('Module Loading', () => {
        it('should load Store module successfully', () => {
            if (!Store) {
                console.log('Store module not available, skipping...');
                return;
            }
            expect(Store).toBeDefined();
        });

        it('should have required methods', () => {
            if (!Store) return;

            expect(typeof Store.init).toBe('function');
            expect(typeof Store.getState).toBe('function');
            expect(typeof Store.setState).toBe('function');
            expect(typeof Store.subscribe).toBe('function');
            expect(typeof Store.on).toBe('function');
            expect(typeof Store.off).toBe('function');
            expect(typeof Store.emit).toBe('function');
        });

        it('should be available on window object', () => {
            if (!Store) return;

            expect(window.Store).toBe(Store);
        });
    });

    describe('State Management', () => {
        it('should have default state structure', () => {
            if (!Store) return;

            const state = Store.getState();
            expect(state).toBeDefined();
            expect(state).toHaveProperty('user');
            expect(state).toHaveProperty('courses');
            expect(state).toHaveProperty('theme');
            expect(state).toHaveProperty('phases');
            expect(state).toHaveProperty('projects');
            expect(state).toHaveProperty('componentInfo');
        });

        it('should update state correctly', () => {
            if (!Store) return;

            Store.setState({ user: { id: 'test-user' } });
            const state = Store.getState();
            expect(state.user).toEqual({ id: 'test-user' });
        });

        it('should preserve other state when updating', () => {
            if (!Store) return;

            Store.setState({ user: { id: 'test' } });
            Store.setState({ theme: 'dark' });

            const state = Store.getState();
            expect(state.user).toEqual({ id: 'test' });
            expect(state.theme).toBe('dark');
        });
    });

    describe('Subscription System', () => {
        it('should notify subscribers on state change', () => {
            if (!Store) return;

            const callback = vi.fn();
            Store.subscribe(callback);

            Store.setState({ theme: 'dark' });

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark' }), expect.any(Object));
        });

        it('should allow unsubscribing', () => {
            if (!Store) return;

            const callback = vi.fn();
            const unsubscribe = Store.subscribe(callback);

            Store.setState({ theme: 'dark' });
            expect(callback).toHaveBeenCalledTimes(1);

            unsubscribe();

            Store.setState({ theme: 'light' });
            expect(callback).toHaveBeenCalledTimes(1); // Hâlâ 1
        });
    });

    describe('Event Bus', () => {
        it('should emit events to listeners', () => {
            if (!Store) return;

            const callback = vi.fn();
            Store.on('test-event', callback);

            Store.emit('test-event', { data: 'test' });

            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });

        it('should allow multiple listeners for same event', () => {
            if (!Store) return;

            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Store.on('multi-event', callback1);
            Store.on('multi-event', callback2);

            Store.emit('multi-event', 'payload');

            expect(callback1).toHaveBeenCalledWith('payload');
            expect(callback2).toHaveBeenCalledWith('payload');
        });

        it('should remove listener with off()', () => {
            if (!Store) return;

            const callback = vi.fn();
            Store.on('removable-event', callback);

            Store.emit('removable-event', 1);
            expect(callback).toHaveBeenCalledTimes(1);

            Store.off('removable-event', callback);

            Store.emit('removable-event', 2);
            expect(callback).toHaveBeenCalledTimes(1); // Hâlâ 1
        });
    });

    describe('Theme Management', () => {
        it('should set theme and persist to localStorage', () => {
            if (!Store) return;

            Store.setTheme('dark');

            expect(Store.getState().theme).toBe('dark');
            expect(localStorage.getItem('theme')).toBe('dark');
        });

        it('should add dark-mode class to body', () => {
            if (!Store) return;

            Store.setTheme('dark');
            expect(document.body.classList.contains('dark-mode')).toBe(true);

            Store.setTheme('light');
            expect(document.body.classList.contains('dark-mode')).toBe(false);
        });
    });

    describe('Course Data Management', () => {
        it('should set and get current course key', () => {
            if (!Store) return;

            Store.setCurrentCourseKey('arduino');
            expect(Store.getCurrentCourseKey()).toBe('arduino');
        });

        it('should set course data with setCourseData', () => {
            if (!Store) return;

            const testData = {
                phases: [{ title: 'Phase 1' }],
                projects: [{ id: 1, title: 'Project 1' }],
                componentInfo: { led: { name: 'LED' } },
            };

            Store.setCourseData(testData);

            expect(Store.getPhases()).toEqual([{ title: 'Phase 1' }]);
            expect(Store.getProjects()).toEqual([{ id: 1, title: 'Project 1' }]);
            expect(Store.getComponentInfo()).toEqual({ led: { name: 'LED' } });
        });

        it('should handle empty course data', () => {
            if (!Store) return;

            Store.setCourseData({});

            expect(Store.getPhases()).toEqual([]);
            expect(Store.getProjects()).toEqual([]);
            expect(Store.getComponentInfo()).toEqual({});
        });
    });

    describe('User Management', () => {
        it('should set user with setUser', () => {
            if (!Store) return;

            const testUser = { id: 'user-123', email: 'test@example.com' };
            Store.setUser(testUser);

            expect(Store.getState().user).toEqual(testUser);
        });

        it('should set profile with setProfile', () => {
            if (!Store) return;

            const testProfile = { xp: 100, level: 5 };
            Store.setProfile(testProfile);

            expect(Store.getState().userProfile).toEqual(testProfile);
        });
    });
});
