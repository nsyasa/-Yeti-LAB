import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        // Test klasörü
        include: ['tests/**/*.test.js'],

        // Browser-like ortam (DOM erişimi için)
        environment: 'jsdom',

        // Global değişkenler (window.* modüllerini simüle etmek için)
        globals: true,

        // Coverage ayarları
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['modules/**/*.js'],
            exclude: ['modules/admin.js'], // Çok büyük, aşamalı eklenecek
        },

        // Setup dosyası
        setupFiles: ['./tests/setup.js'],
    },
});
