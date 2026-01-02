/**
 * Test Setup File
 * Tüm testlerden önce çalışır, global mock'ları ve yardımcıları tanımlar.
 */

// --- Browser API Mock'ları ---

// localStorage mock
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => {
            store[key] = String(value);
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// sessionStorage mock
Object.defineProperty(globalThis, 'sessionStorage', { value: localStorageMock });

// --- Supabase Mock ---
// Gerçek Supabase bağlantısı olmadan test yapmak için
globalThis.mockSupabase = {
    from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        eq: function () {
            return this;
        },
        single: function () {
            return Promise.resolve({ data: null, error: null });
        },
    }),
    auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    rpc: () => Promise.resolve({ data: null, error: null }),
};

// --- Test Yardımcıları ---
globalThis.testHelpers = {
    // Test için basit student objesi oluştur
    createMockStudent: (overrides = {}) => ({
        id: 'test-student-id',
        display_name: 'Test Öğrenci',
        classroom_id: 'test-classroom-id',
        avatar: '🧒',
        ...overrides,
    }),

    // Test için basit classroom objesi oluştur
    createMockClassroom: (overrides = {}) => ({
        id: 'test-classroom-id',
        name: 'Test Sınıfı',
        code: 'ABCDE',
        teacher_id: 'test-teacher-id',
        is_active: true,
        ...overrides,
    }),

    // LocalStorage'ı temizle
    clearStorage: () => {
        localStorage.clear();
        sessionStorage.clear();
    },
};

// Her testten önce storage'ı temizle
beforeEach(() => {
    testHelpers.clearStorage();
});
