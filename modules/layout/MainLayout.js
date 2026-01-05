/**
 * Main Layout Module
 * Sayfanın genel iskeletini (Header + Content + Footer) yönetir.
 * Sayfa yüklendiğinde Navbar ve Footer'ı otomatik başlatır.
 */

const MainLayout = {
    init: () => {
        // 1. Header (Navbar) Başlat
        if (window.Navbar) {
            window.Navbar.init();
        } else {
            console.warn('Navbar module not found');
        }

        // 2. Footer Başlat
        if (window.Footer) {
            window.Footer.init();
        } else {
            console.warn('Footer module not found');
        }

        // 3. İçerik Alanı Ayarlamaları (Opsiyonel)
        // Örneğin sayfa geçiş animasyonları veya scroll pozisyonu burada yönetilebilir
        MainLayout.adjustContentSpacing();

        // Pencere boyutlanınca tekrar hesapla
        window.addEventListener('resize', MainLayout.adjustContentSpacing);
    },

    // Header yüksekliğine göre içerik boşluğunu ayarla (Web sitelerindeki o klasik sorun için)
    adjustContentSpacing: () => {
        const header = document.getElementById('main-header');
        const main = document.querySelector('main');

        if (header && main) {
            // Eğer header fixed/sticky ise main'e margin gerekebilir.
            // Şu an CSS ile halletik ama JS kontrolü daha sağlamdır.
            // const headerHeight = header.offsetHeight;
            // main.style.paddingTop = `${headerHeight + 20}px`;
        }
    },
};

window.MainLayout = MainLayout;
