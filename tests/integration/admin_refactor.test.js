import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
const mockSupabase = {
    auth: {
        getSession: vi.fn(),
    },
};
global.SupabaseClient = { client: mockSupabase };

// Ensure window exists and extend it
global.window = global.window || {};
Object.assign(global.window, {
    location: { hash: '' },
    confirm: vi.fn(() => true),
    alert: vi.fn(), // Missing alert mock
});

// Ensure document exists and extend it
global.document = global.document || {};
Object.assign(global.document, {
    getElementById: vi.fn(() => ({
        classList: { remove: vi.fn(), add: vi.fn(), toggle: vi.fn() },
        addEventListener: vi.fn(),
        querySelector: vi.fn(() => ({ textContent: '' })),
    })),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    createElement: vi.fn(() => ({
        classList: { remove: vi.fn(), add: vi.fn() },
        click: vi.fn(),
        querySelector: vi.fn(() => ({ textContent: '' })),
        setAttribute: vi.fn(),
    })),
});

// Mock body.appendChild separately to respect JSDOM
if (global.document.body) {
    global.document.body.appendChild = vi.fn();
} else {
    // Should not happen in JSDOM, but fallback
    try {
        global.document.body = { appendChild: vi.fn() };
    } catch (e) {
        // Read-only body, ignore
    }
}
// URL Mock - Force Overwrite
try {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
} catch (e) {
    // console.warn('Could not patch URL directly, trying defineProperty');
    try {
        Object.defineProperty(global.URL, 'createObjectURL', {
            value: vi.fn(() => 'blob:mock-url'),
            writable: true,
            configurable: true,
        });
        Object.defineProperty(global.URL, 'revokeObjectURL', { value: vi.fn(), writable: true, configurable: true });
    } catch (e2) {
        // console.error('Failed to mock URL:', e2);
    }
}

// Ensure window.URL is linked
if (global.window) {
    global.window.URL = global.URL;
    global.window.Blob = global.Blob;
}

global.Blob = class Blob {
    constructor(content) {
        this.content = content;
    }
};

// Import modules to test
import AdminState from '../../modules/admin/state.js';
import AdminUI from '../../modules/admin/ui.js';
import BackupService from '../../modules/admin/backup.js';
import ProjectEditor from '../../modules/admin/projectEditor.js';

describe('Admin Refactoring Integration Test', () => {
    beforeEach(async () => {
        // Reset AdminState
        AdminState.allCourseData = {};
        AdminState.currentCourseKey = 'arduino';

        // Ensure globals are set
        window.AdminState = AdminState;
        window.AdminUI = AdminUI;
        window.BackupService = BackupService;
        window.ProjectEditor = ProjectEditor;

        // Manual module re-attachment because dynamic import catches the module instance
        const adminModule = await import('../../modules/admin.js');
        if (!window.admin && adminModule.default) {
            window.admin = adminModule.default;
        }
    });

    it('should have AdminState correctly linked', () => {
        // Test Getter
        AdminState.allCourseData = { test: 123 };
        expect(window.admin.allCourseData).toEqual({ test: 123 });

        // Test Setter
        window.admin.currentCourseKey = 'mblock';
        expect(AdminState.currentCourseKey).toBe('mblock');
    });

    it('should delegate UI calls to AdminUI', () => {
        const spyShow = vi.spyOn(AdminUI, 'showLoading');
        const spyConvert = vi.spyOn(AdminUI, 'switchLangUI');

        window.admin.showLoading('Test');
        expect(spyShow).toHaveBeenCalledWith('Test');

        window.admin.switchLang('en');
        expect(spyConvert).toHaveBeenCalledWith('en');
    });

    it('should delegate Backup calls to BackupService', () => {
        const spyBackup = vi.spyOn(BackupService, 'downloadCourseAsFile');
        // Simulate fallback
        vi.spyOn(window.admin, 'saveData').mockImplementation(() => {});

        window.admin.downloadCourseAsFile('test', {});
        expect(spyBackup).toHaveBeenCalled();
    });

    it('should delegate Project Management to ProjectEditor', () => {
        const spyAdd = vi.spyOn(ProjectEditor, 'add');

        window.admin.addNewProject();
        expect(spyAdd).toHaveBeenCalled();
    });
});
