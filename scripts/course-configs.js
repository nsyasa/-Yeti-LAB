/**
 * Yeti LAB - Kurs Konfigürasyonu
 * Yeni kurs eklemek için bu dosyaya config ekleyin
 */

export const COURSE_CONFIGS = {
    arduino: {
        slug: 'arduino',
        title: 'Arduino Eğitimi',
        description: 'Kapsamlı Arduino Eğitimi',
        theme_color: '#00979D',
        icon: '⚡',
        dataFile: 'data/arduino.js',
    },
    microbit: {
        slug: 'microbit',
        title: 'Micro:bit ile Kodlama',
        description: 'Eğlenceli ve Kolay Başlangıç',
        theme_color: '#00ED00',
        icon: '📟',
        dataFile: 'data/microbit.js',
    },
    scratch: {
        slug: 'scratch',
        title: 'Scratch ile Oyun Tasarımı',
        description: 'Kendi Oyununu Yap',
        theme_color: '#FF9F1C',
        icon: '🐱',
        dataFile: 'data/scratch.js',
    },
    mblock: {
        slug: 'mblock',
        title: 'mBlock ile Robotik',
        description: 'Blok Tabanlı Arduino Kodlama',
        theme_color: '#0078D7',
        icon: '🤖',
        dataFile: 'data/mblock.js',
    },
    appinventor: {
        slug: 'appinventor',
        title: 'App Inventor',
        description: 'Mobil Uygulama Geliştirme',
        theme_color: '#8BC34A',
        icon: '📱',
        dataFile: 'data/appinventor.js',
    },
};

// Yeni kurs eklemek için yukarıya config ekleyip
// data/ klasörüne ilgili .js dosyasını koyun
