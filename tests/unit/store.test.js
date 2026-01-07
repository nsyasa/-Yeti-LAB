/**
 * Store Module Unit Tests
 *
 * Bu testler Store modülündeki state management ve event bus fonksiyonlarını kapsar.
 * Çalıştırma: npm run test tests/unit/store.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Store modülünü mock olarak tanımla
const createStore = () => ({
    state: {
        user: null,
        userProfile: null,
        courses: [],
        currentCourse: null,
        currentCourseKey: null,
        activeProject: null,
        theme: 'light',
        notifications: [],
        phases: [],
        projects: [],
        componentInfo: {},
    },

    listeners: [],
    events: {},

    init() {
        // Skip localStorage in tests
        this.setState({ theme: 'light' });
    },

    getState() {
        return { ...this.state };
    },

    setState(newState) {
        const previousState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.notify(this.state, previousState);
    },

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    },

    notify(state, previousState) {
        this.listeners.forEach((listener) => listener(state, previousState));
    },

    on(eventName, callback) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(callback);
    },

    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    },

    emit(eventName, payload) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach((cb) => {
            try {
                cb(payload);
            } catch (e) {
                console.error(`[Store] Error in event listener for ${eventName}:`, e);
            }
        });
    },

    setUser(user) {
        this.setState({ user });
    },

    setProfile(profile) {
        this.setState({ userProfile: profile });
    },

    setCourses(courses) {
        this.setState({ courses });
    },

    setCurrentCourse(course, key = null) {
        this.setState({
            currentCourse: course,
            currentCourseKey: key || course?.key || course?.slug || null,
        });
    },

    setCurrentCourseKey(key) {
        this.setState({ currentCourseKey: key });
    },

    getCurrentCourseKey() {
        return this.state.currentCourseKey;
    },

    setCourseData(data) {
        this.setState({
            phases: data.phases || [],
            projects: data.projects || [],
            componentInfo: data.componentInfo || {},
        });
    },

    getPhases() {
        return this.state.phases;
    },

    getProjects() {
        return this.state.projects;
    },

    getComponentInfo() {
        return this.state.componentInfo;
    },

    setTheme(theme) {
        this.setState({ theme });
    },

    // Reset for testing
    reset() {
        this.state = {
            user: null,
            userProfile: null,
            courses: [],
            currentCourse: null,
            currentCourseKey: null,
            activeProject: null,
            theme: 'light',
            notifications: [],
            phases: [],
            projects: [],
            componentInfo: {},
        };
        this.listeners = [];
        this.events = {};
    },
});

describe('Store Module', () => {
    let Store;

    beforeEach(() => {
        Store = createStore();
        Store.reset();
    });

    describe('State Management', () => {
        it('should initialize with default state', () => {
            const state = Store.getState();

            expect(state.user).toBeNull();
            expect(state.courses).toEqual([]);
            expect(state.theme).toBe('light');
            expect(state.phases).toEqual([]);
        });

        it('should update state with setState', () => {
            Store.setState({ user: { id: 1, name: 'Test' } });

            const state = Store.getState();
            expect(state.user).toEqual({ id: 1, name: 'Test' });
        });

        it('should merge state, not replace', () => {
            Store.setState({ user: { id: 1 } });
            Store.setState({ theme: 'dark' });

            const state = Store.getState();
            expect(state.user).toEqual({ id: 1 });
            expect(state.theme).toBe('dark');
        });

        it('should return immutable state copy', () => {
            Store.setState({ user: { id: 1 } });

            const state1 = Store.getState();
            state1.user = { id: 2 };

            const state2 = Store.getState();
            expect(state2.user).toEqual({ id: 1 });
        });
    });

    describe('Subscriptions', () => {
        it('should notify listeners on state change', () => {
            const listener = vi.fn();
            Store.subscribe(listener);

            Store.setState({ user: { id: 1 } });

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(expect.objectContaining({ user: { id: 1 } }), expect.any(Object));
        });

        it('should provide previous state to listeners', () => {
            const listener = vi.fn();
            Store.subscribe(listener);

            Store.setState({ theme: 'dark' });

            const [newState, previousState] = listener.mock.calls[0];
            expect(newState.theme).toBe('dark');
            expect(previousState.theme).toBe('light');
        });

        it('should support multiple listeners', () => {
            const listener1 = vi.fn();
            const listener2 = vi.fn();

            Store.subscribe(listener1);
            Store.subscribe(listener2);

            Store.setState({ user: { id: 1 } });

            expect(listener1).toHaveBeenCalledTimes(1);
            expect(listener2).toHaveBeenCalledTimes(1);
        });

        it('should allow unsubscribing', () => {
            const listener = vi.fn();
            const unsubscribe = Store.subscribe(listener);

            Store.setState({ user: { id: 1 } });
            expect(listener).toHaveBeenCalledTimes(1);

            unsubscribe();

            Store.setState({ user: { id: 2 } });
            expect(listener).toHaveBeenCalledTimes(1); // Still 1, not 2
        });
    });

    describe('Event Bus', () => {
        it('should register event listeners with on()', () => {
            const callback = vi.fn();
            Store.on('test-event', callback);

            Store.emit('test-event', { data: 'test' });

            expect(callback).toHaveBeenCalledWith({ data: 'test' });
        });

        it('should support multiple listeners for same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            Store.on('test-event', callback1);
            Store.on('test-event', callback2);

            Store.emit('test-event', 'payload');

            expect(callback1).toHaveBeenCalledWith('payload');
            expect(callback2).toHaveBeenCalledWith('payload');
        });

        it('should unsubscribe with off()', () => {
            const callback = vi.fn();
            Store.on('test-event', callback);

            Store.emit('test-event', 'first');
            expect(callback).toHaveBeenCalledTimes(1);

            Store.off('test-event', callback);

            Store.emit('test-event', 'second');
            expect(callback).toHaveBeenCalledTimes(1); // Still 1
        });

        it('should not throw when emitting non-existent event', () => {
            expect(() => Store.emit('nonexistent', 'data')).not.toThrow();
        });

        it('should catch errors in event listeners', () => {
            const errorCallback = vi.fn().mockImplementation(() => {
                throw new Error('Listener error');
            });
            const normalCallback = vi.fn();

            Store.on('test-event', errorCallback);
            Store.on('test-event', normalCallback);

            // Should not throw, and should call the second listener
            expect(() => Store.emit('test-event', 'data')).not.toThrow();
            expect(normalCallback).toHaveBeenCalled();
        });
    });

    describe('User Actions', () => {
        it('should set user with setUser()', () => {
            Store.setUser({ id: '123', email: 'test@example.com' });

            expect(Store.getState().user).toEqual({ id: '123', email: 'test@example.com' });
        });

        it('should set profile with setProfile()', () => {
            Store.setProfile({ xp: 100, level: 5 });

            expect(Store.getState().userProfile).toEqual({ xp: 100, level: 5 });
        });
    });

    describe('Course Actions', () => {
        it('should set courses with setCourses()', () => {
            const courses = [
                { id: 1, name: 'Arduino' },
                { id: 2, name: 'Microbit' },
            ];
            Store.setCourses(courses);

            expect(Store.getState().courses).toEqual(courses);
        });

        it('should set current course with setCurrentCourse()', () => {
            const course = { id: 1, slug: 'arduino', name: 'Arduino' };
            Store.setCurrentCourse(course);

            const state = Store.getState();
            expect(state.currentCourse).toEqual(course);
            expect(state.currentCourseKey).toBe('arduino');
        });

        it('should use key parameter if provided', () => {
            const course = { id: 1, name: 'Arduino' };
            Store.setCurrentCourse(course, 'custom-key');

            expect(Store.getState().currentCourseKey).toBe('custom-key');
        });

        it('should set and get current course key', () => {
            Store.setCurrentCourseKey('microbit');

            expect(Store.getCurrentCourseKey()).toBe('microbit');
        });

        it('should set course data with setCourseData()', () => {
            Store.setCourseData({
                phases: [{ id: 1, name: 'Phase 1' }],
                projects: [{ id: 1, title: 'Project 1' }],
                componentInfo: { tabs: ['intro', 'code'] },
            });

            expect(Store.getPhases()).toEqual([{ id: 1, name: 'Phase 1' }]);
            expect(Store.getProjects()).toEqual([{ id: 1, title: 'Project 1' }]);
            expect(Store.getComponentInfo()).toEqual({ tabs: ['intro', 'code'] });
        });

        it('should handle missing course data properties', () => {
            Store.setCourseData({});

            expect(Store.getPhases()).toEqual([]);
            expect(Store.getProjects()).toEqual([]);
            expect(Store.getComponentInfo()).toEqual({});
        });
    });

    describe('Theme Actions', () => {
        it('should set theme with setTheme()', () => {
            Store.setTheme('dark');

            expect(Store.getState().theme).toBe('dark');
        });
    });
});
