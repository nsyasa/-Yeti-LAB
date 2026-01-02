/**
 * Internationalization (i18n) Module
 * Handles translations for the application.
 */

const I18n = {
    // Current Language
    get lang() {
        return window.Settings?.get('language') || 'tr';
    },

    // Dictionary
    translations: {
        tr: {
            // General
            loading: 'Yükleniyor...',
            error_loading: 'Veri Yüklenemedi',
            back: 'Geri Dön',
            start: 'Başla →',
            completed: '✅ Tamamlandı',
            percent_completed: '%{rate} Tamamlandı',

            // Dashboard & Navigation
            course_selection_title: 'Hangi Maceraya Atılmak İstersin? 🚀',
            course_selection_desc: 'İlgi alanına uygun eğitim setini seç ve hemen öğrenmeye başla.',
            no_content: 'Bu ders için henüz içerik eklenmemiş.',
            intro: 'Başlangıç',
            episode: 'Bölüm',
            simulation_badge: 'Simülasyonlu',

            // Project Tabs
            tab_mission: '🎯 Amaç',
            tab_materials: 'Devre Elemanları',
            tab_circuit: '🔌 Devre',
            tab_code: '💻 Kod',
            tab_challenge: '🏆 Görev',
            tab_quiz: '📝 Test',
            tab_blocks: 'Blok Kodları',
            tab_design: 'Tasarım',

            // Content Headers
            header_mission: 'Amaç',
            header_circuit: 'Bağlantı Şeması',
            header_challenge: 'Meydan Okuma',
            header_quiz: 'Kendini Test Et',

            // Interaction
            btn_complete: '🏆 Dersi Tamamla',
            btn_copy_code: 'Kodu Kopyala',
            msg_copied: 'Kopyalandı',
            msg_progress_saved: 'Dersi tamamladığınızda ilerleme kaydedilir.',
            quiz_correct: '🎉 Doğru Cevap! Harikasın.',
            quiz_wrong: '😔 Yanlış Cevap. Doğru cevap işaretlendi.',

            // Simulation / Explorer
            sim_lab: 'Sanal Laboratuvar',
            sim_live: 'CANLI',
            sim_explore: 'İnteraktif Keşif',
            sim_learn: 'ÖĞREN',
            sim_discover: 'KEŞFET',
            sim_interactive_img: 'Etkileşimli Görsel',
            info_title: 'Bilgi',
            exp_hover_msg: 'Parçaların üzerine gelerek ne işe yaradıklarını öğren.',
            exp_hotspot_msg: 'Numaralı noktaların üzerine gelerek açıklamaları görün.',

            // Errors & Modals
            img_not_found: '📷 Resim bulunamadı.',
            zoom_in: '🔍 Büyüt',
        },
        en: {
            // General
            loading: 'Loading...',
            error_loading: 'Data Could Not Be Loaded',
            back: 'Go Back',
            start: 'Start →',
            completed: '✅ Completed',
            percent_completed: '%{rate} Completed',

            // Dashboard & Navigation
            course_selection_title: 'Which Adventure Do You Want? 🚀',
            course_selection_desc: 'Choose the training set that suits your interest and start learning immediately.',
            no_content: 'No content added for this course yet.',
            intro: 'Intro',
            episode: 'Episode',
            simulation_badge: 'Simulation',

            // Project Tabs
            tab_mission: '🎯 Mission',
            tab_materials: 'Components',
            tab_circuit: '🔌 Circuit',
            tab_code: '💻 Code',
            tab_challenge: '🏆 Challenge',
            tab_quiz: '📝 Quiz',
            tab_blocks: 'Block Codes',
            tab_design: 'Design',

            // Content Headers
            header_mission: 'Mission',
            header_circuit: 'Wiring Diagram',
            header_challenge: 'Challenge',
            header_quiz: 'Test Yourself',

            // Interaction
            btn_complete: '🏆 Complete Lesson',
            btn_copy_code: 'Copy Code',
            msg_copied: 'Copied',
            msg_progress_saved: 'Progress is saved when you complete the lesson.',
            quiz_correct: '🎉 Correct Answer! Awesome.',
            quiz_wrong: '😔 Wrong Answer. Correct answer highlighted.',

            // Simulation / Explorer
            sim_lab: 'Virtual Lab',
            sim_live: 'LIVE',
            sim_explore: 'Interactive Explorer',
            sim_learn: 'LEARN',
            sim_discover: 'DISCOVER',
            sim_interactive_img: 'Interactive Image',
            info_title: 'Info',
            exp_hover_msg: 'Hover over parts to learn what they do.',
            exp_hotspot_msg: 'Hover over numbered spots to see descriptions.',

            // Errors & Modals
            img_not_found: '📷 Image not found.',
            zoom_in: '🔍 Zoom In',
        },
    },

    /**
     * Translate a key
     * @param {string} key - The dictionary key
     * @param {object} params - Optional parameters for interpolation (e.g. {rate: 50})
     */
    t: (key, params = {}) => {
        const lang = I18n.lang;
        let str = I18n.translations[lang][key] || I18n.translations['tr'][key] || key;

        // Simple interpolation
        Object.keys(params).forEach((param) => {
            str = str.replace(`%{${param}}`, params[param]);
        });

        return str;
    },
};

window.I18n = I18n;
