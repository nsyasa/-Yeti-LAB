/**
 * Footer Modülü
 * Tüm sayfalardaki alt bilgiyi tek bir yerden yönetir.
 */

const Footer = {
    render: (containerId = 'main-footer') => {
        const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
        if (!container) return; // Footer olmayan sayfalarda hata vermesin

        const year = new Date().getFullYear();

        const html = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                
                <!-- Brand & Copyright -->
            <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-700 p-1">
                    <img src="img/logo.svg" alt="Logo" class="w-full h-full object-contain" />
                </div>
                <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    © ${year} Yeti <span class="text-theme">LAB</span> - İçindeki Yeti'yi Keşfet
                </p>
            </div>

                <!-- Links -->
                <div class="flex items-center gap-6 text-sm text-gray-500">
                    <a href="#" class="hover:text-theme transition-colors">Hakkımızda</a>
                    <a href="#" class="hover:text-theme transition-colors">Gizlilik</a>
                    <a href="#" class="hover:text-theme transition-colors">İletişim</a>
                </div>
            </div>
            
            <div class="mt-4 text-center md:text-right">
             <p class="text-xs text-gray-400">Versiyon 1.2.0 • <span class="text-theme">Beta</span></p>
            </div>
        </div>
        `;

        container.innerHTML = html;

        // Base styles (Tailwind dark mode classes handle the theme)
        container.className =
            'bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 mt-auto transition-colors duration-300';
    },

    init: () => {
        Footer.render();
    },
};

window.Footer = Footer;
