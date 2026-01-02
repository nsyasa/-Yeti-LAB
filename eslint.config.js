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
                ClassroomManager: 'readonly',
                StudentManager: 'readonly',
                Toast: 'readonly',
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
            'no-unused-vars': 'off', // Geçici olarak kapalı - Faz 2'de düzeltilecek
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
