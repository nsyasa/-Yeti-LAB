import globals from 'globals';

export default [
    {
        // Tüm JavaScript dosyaları için geçerli
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
                // Yeti LAB Global Modülleri
                Auth: 'readonly',
                Progress: 'readonly',
                UI: 'readonly',
                SupabaseClient: 'readonly',
                I18n: 'readonly',
                Settings: 'readonly',
                Toast: 'readonly',
                supabase: 'readonly',
                Search: 'readonly',
                Simulations: 'readonly',
                courseData: 'readonly',
                courseManifest: 'readonly',
                app: 'readonly',
                admin: 'readonly',
                TabConfig: 'readonly',
                Badges: 'readonly',
                quizData: 'readonly',
                EL: 'readonly',
                ThemeManager: 'readonly',
                ProfileEditor: 'readonly',
                CourseLoader: 'readonly',
                Chart: 'readonly',
                Utils: 'readonly',
                Validators: 'readonly',
                Constants: 'readonly',
                HotspotEditor: 'readonly',
                QuizEditor: 'readonly',
                ComponentManager: 'readonly',
                ProjectManager: 'readonly',
                PhaseManager: 'readonly',
                CourseSettings: 'readonly',
                StorageManager: 'readonly',
                ImageManager: 'readonly',
                SupabaseSync: 'readonly',
                ClassroomManager: 'readonly',
                StudentManager: 'readonly',
                TeacherAnalytics: 'readonly', // Added Teacher Analytics
                Router: 'readonly', // SPA Router
                Store: 'readonly', // State Management
                // Teacher View Components (SPA)
                TeacherView: 'readonly',
                TeacherLayout: 'readonly',
                TeacherModals: 'readonly',
                DashboardSection: 'readonly',
                ClassroomsSection: 'readonly',
                StudentsSection: 'readonly',
                TeacherManager: 'readonly',
                Toast: 'readonly',
                // Admin View Components (SPA)
                AdminView: 'readonly',
                AdminLayout: 'readonly',
                AdminModals: 'readonly',
                ProjectsSection: 'readonly',
                PhasesSection: 'readonly',
                ComponentsSection: 'readonly',
                CourseManager: 'readonly',
                HotspotManager: 'readonly',
                QuizManager: 'readonly',
                // Test globals
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                vi: 'readonly',
                testHelpers: 'readonly',
                mockSupabase: 'readonly',
            },
        },
        rules: {
            // Hata önleme
            'no-unused-vars': [
                'warn',
                {
                    varsIgnorePattern: '^_',
                    argsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            'no-undef': 'error',

            // Kod kalitesi
            'no-console': 'off', // Development için izin
            'no-debugger': 'warn',

            // ES6+
            'prefer-const': 'warn',
            'no-var': 'warn',

            // Tutarlılık
            semi: ['warn', 'always'],
            quotes: ['warn', 'single', { avoidEscape: true }],
        },
    },
    {
        // Test dosyaları için ek kurallar
        files: ['tests/**/*.js'],
        rules: {
            'no-unused-expressions': 'off',
        },
    },
    {
        // Ignore patterns
        ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'scripts/exports/**'],
    },
];
