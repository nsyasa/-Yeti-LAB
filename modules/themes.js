// --- MERKEZI TEMA YAPILANDIRMASI ---
// Tüm kurs renklerini burada tanımlayın.
// Bu dosya hem index2.html hem de admin.html tarafından kullanılır.

window.CourseThemes = {
    arduino: {
        name: 'Arduino',
        color: '#00979C', // Ana tema rengi
        light: '#E6FFFA', // Açık arka plan rengi
        icon: '⚡',
    },
    microbit: {
        name: 'Micro:bit',
        color: '#E31C79', // Pembe
        light: '#FDE8F1',
        icon: '📟',
    },
    scratch: {
        name: 'Scratch',
        color: '#4C97FF', // Mavi
        light: '#E6F0FF',
        icon: '🐱',
    },
    mblock: {
        name: 'mBlock',
        color: '#00979C', // Arduino ile aynı (teal)
        light: '#E6FFFA',
        icon: '🐼',
    },
    appinventor: {
        name: 'App Inventor',
        color: '#88C542', // Yeşil
        light: '#F0F9E8',
        icon: '📱',
    },
};

// Tema uygulama yardımcı fonksiyonu
window.applyTheme = (courseKey) => {
    const theme = window.CourseThemes[courseKey] || window.CourseThemes.arduino;
    const root = document.documentElement;
    root.style.setProperty('--theme-color', theme.color);
    root.style.setProperty('--theme-light', theme.light);
    return theme;
};
