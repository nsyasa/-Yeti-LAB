/**
 * Yeti LAB - Bundle Analyzer Helper
 * Bundle size analizi ve optimizasyon önerileri
 * Faz 8: Performans Optimizasyonu
 */

/**
 * Modül boyut analizi (development ortamında kullanılır)
 */
export const BundleAnalyzer = {
    /**
     * Import edilmiş modülleri listele
     * @returns {Object} Modül bilgileri
     */
    getImportedModules() {
        const modules = {
            core: [
                'modules/cache.js',
                'modules/utils.js',
                'modules/constants.js',
                'modules/validators.js',
            ],
            routing: [
                'modules/router.js',
                'modules/viewManager.js',
                'modules/scrollManager.js',
            ],
            auth: [
                'modules/auth.js',
                'modules/authUI.js',
                'modules/supabaseClient.js',
            ],
            ui: [
                'modules/ui.js',
                'modules/toast.js',
                'modules/themeManager.js',
                'modules/themes.js',
            ],
            features: [
                'modules/progress.js',
                'modules/badges.js',
                'modules/profile.js',
                'modules/search.js',
                'modules/metrics.js',
                'modules/i18n.js',
            ],
            teacher: [
                'modules/teacher/classrooms.js',
                'modules/teacher/students.js',
                'modules/teacher/analytics.js',
                'modules/teacher/analyticsService.js',
            ],
            assignment: [
                'modules/assignmentService.js',
                'modules/studentSubmissionService.js',
                'modules/courseEnrollmentService.js',
                'modules/notificationService.js',
            ],
            data: [
                'data/scratch.js',
                'data/appinventor.js',
                'data/mblock.js',
                'data/microbit.js',
                'data/minecraft-edu.js',
                'data/arduino.js',
            ],
        };

        return modules;
    },

    /**
     * Lazy load edilebilecek modülleri belirle
     * @returns {Array} Lazy load önerileri
     */
    getLazyLoadCandidates() {
        return [
            {
                module: 'data/*.js',
                reason: 'Kurs verileri sadece ilgili kurs açıldığında yüklenmeli',
                savings: '~100KB',
            },
            {
                module: 'modules/teacher/*',
                reason: 'Sadece öğretmen panelinde kullanılıyor',
                savings: '~50KB',
            },
            {
                module: 'modules/admin/*',
                reason: 'Sadece admin panelinde kullanılıyor',
                savings: '~30KB',
            },
            {
                module: 'views/teacher/*',
                reason: 'Teacher view bileşenleri',
                savings: '~40KB',
            },
            {
                module: 'views/student/*',
                reason: 'Student view bileşenleri',
                savings: '~30KB',
            },
        ];
    },

    /**
     * Optimizasyon önerileri
     * @returns {Array} Öneriler listesi
     */
    getOptimizationSuggestions() {
        return [
            {
                category: 'Code Splitting',
                suggestions: [
                    'Route-based code splitting uygula',
                    'Dynamic import() kullan',
                    'Vendor chunk ayrımı yap',
                ],
            },
            {
                category: 'Tree Shaking',
                suggestions: [
                    'Named exports kullan (default yerine)',
                    'Kullanılmayan fonksiyonları kaldır',
                    'sideEffects: false ekle package.json\'a',
                ],
            },
            {
                category: 'Compression',
                suggestions: [
                    'Gzip/Brotli sıkıştırma aktif et',
                    'Minification kontrol et',
                    'Source map production\'da devre dışı bırak',
                ],
            },
            {
                category: 'Caching',
                suggestions: [
                    'Content hash kullan dosya adlarında',
                    'Long-term caching için chunk ayır',
                    'Service worker ekle',
                ],
            },
            {
                category: 'Images',
                suggestions: [
                    'WebP/AVIF formatı kullan',
                    'Responsive images (srcset) kullan',
                    'Lazy loading aktif et',
                    'Image CDN kullan',
                ],
            },
        ];
    },

    /**
     * Vite config optimizasyonları
     * @returns {Object} Önerilen Vite config
     */
    getRecommendedViteConfig() {
        return {
            build: {
                // Chunk boyut uyarı limiti
                chunkSizeWarningLimit: 500,

                // Rollup options
                rollupOptions: {
                    output: {
                        // Manuel chunk ayrımı
                        manualChunks: {
                            // Vendor chunk
                            vendor: ['@supabase/supabase-js'],
                            // UI utilities
                            ui: ['modules/ui.js', 'modules/toast.js', 'modules/themeManager.js'],
                            // Data chunks (her kurs ayrı)
                            'data-scratch': ['data/scratch.js'],
                            'data-appinventor': ['data/appinventor.js'],
                            'data-mblock': ['data/mblock.js'],
                        },
                        // Chunk isimlendirme
                        chunkFileNames: 'assets/[name]-[hash].js',
                        entryFileNames: 'assets/[name]-[hash].js',
                        assetFileNames: 'assets/[name]-[hash].[ext]',
                    },
                },

                // Minify ayarları
                minify: 'terser',
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                    },
                },

                // Source map
                sourcemap: false,

                // CSS code splitting
                cssCodeSplit: true,
            },

            // Optimizasyon
            optimizeDeps: {
                include: ['@supabase/supabase-js'],
            },
        };
    },

    /**
     * Performance budget
     * @returns {Object} Budget limitleri
     */
    getPerformanceBudget() {
        return {
            // Bundle boyutları (gzip sonrası)
            bundles: {
                main: { max: '150KB', warning: '120KB' },
                vendor: { max: '100KB', warning: '80KB' },
                'data-*': { max: '50KB', warning: '40KB' },
                css: { max: '30KB', warning: '25KB' },
            },
            // Performance metrikleri
            metrics: {
                FCP: { max: 1800, warning: 1500 }, // First Contentful Paint
                LCP: { max: 2500, warning: 2000 }, // Largest Contentful Paint
                TTI: { max: 3800, warning: 3000 }, // Time to Interactive
                TBT: { max: 300, warning: 200 },   // Total Blocking Time
                CLS: { max: 0.1, warning: 0.05 },  // Cumulative Layout Shift
            },
        };
    },

    /**
     * Rapor oluştur
     * @returns {string} Markdown formatında rapor
     */
    generateReport() {
        const modules = this.getImportedModules();
        const lazyLoad = this.getLazyLoadCandidates();
        const suggestions = this.getOptimizationSuggestions();

        let report = '# Bundle Analysis Report\n\n';
        report += `Generated: ${new Date().toISOString()}\n\n`;

        report += '## Module Groups\n\n';
        Object.entries(modules).forEach(([group, files]) => {
            report += `### ${group}\n`;
            files.forEach((f) => (report += `- ${f}\n`));
            report += '\n';
        });

        report += '## Lazy Load Candidates\n\n';
        lazyLoad.forEach((item) => {
            report += `- **${item.module}**: ${item.reason} (${item.savings})\n`;
        });

        report += '\n## Optimization Suggestions\n\n';
        suggestions.forEach((cat) => {
            report += `### ${cat.category}\n`;
            cat.suggestions.forEach((s) => (report += `- ${s}\n`));
            report += '\n';
        });

        return report;
    },
};

// Console'a yazdır (development için)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.BundleAnalyzer = BundleAnalyzer;
    console.log('[BundleAnalyzer] Available. Run BundleAnalyzer.generateReport() for analysis.');
}
