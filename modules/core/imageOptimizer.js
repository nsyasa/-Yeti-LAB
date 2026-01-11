/**
 * Yeti LAB - Image Optimizer Module
 * Resim optimizasyonu ve responsive image handling
 * Faz 8: Performans Optimizasyonu
 */

export const ImageOptimizer = {
    // Desteklenen formatlar
    supportedFormats: ['webp', 'avif', 'jpeg', 'png'],

    // Varsayılan breakpoints
    breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
    },

    /**
     * WebP desteğini kontrol et
     * @returns {Promise<boolean>}
     */
    async checkWebPSupport() {
        if (typeof this._webpSupport !== 'undefined') {
            return this._webpSupport;
        }

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this._webpSupport = img.width === 1;
                resolve(this._webpSupport);
            };
            img.onerror = () => {
                this._webpSupport = false;
                resolve(false);
            };
            img.src =
                'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        });
    },

    /**
     * AVIF desteğini kontrol et
     * @returns {Promise<boolean>}
     */
    async checkAVIFSupport() {
        if (typeof this._avifSupport !== 'undefined') {
            return this._avifSupport;
        }

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this._avifSupport = img.width === 1;
                resolve(this._avifSupport);
            };
            img.onerror = () => {
                this._avifSupport = false;
                resolve(false);
            };
            img.src =
                'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAQ0AIyExIAA2c5YQgA';
        });
    },

    /**
     * Responsive srcset oluştur
     * @param {string} basePath - Temel resim yolu
     * @param {Array<number>} widths - Genişlik değerleri
     * @param {string} format - Resim formatı
     */
    generateSrcSet(basePath, widths = [320, 640, 768, 1024, 1280], format = null) {
        const ext = format || basePath.split('.').pop();
        const baseWithoutExt = basePath.replace(/\.[^.]+$/, '');

        return widths
            .map((width) => `${baseWithoutExt}-${width}w.${ext} ${width}w`)
            .join(', ');
    },

    /**
     * Picture element oluştur
     * @param {Object} options - Seçenekler
     */
    createPictureElement(options) {
        const {
            src,
            alt = '',
            className = '',
            widths = [320, 640, 1024],
            sizes = '100vw',
            lazy = true,
        } = options;

        const ext = src.split('.').pop();
        const baseWithoutExt = src.replace(/\.[^.]+$/, '');

        return `
            <picture class="${className}">
                <source 
                    type="image/avif"
                    srcset="${this.generateSrcSet(src, widths, 'avif')}"
                    sizes="${sizes}"
                >
                <source 
                    type="image/webp"
                    srcset="${this.generateSrcSet(src, widths, 'webp')}"
                    sizes="${sizes}"
                >
                <img 
                    src="${src}"
                    ${lazy ? `data-src="${src}"` : ''}
                    srcset="${this.generateSrcSet(src, widths, ext)}"
                    sizes="${sizes}"
                    alt="${alt}"
                    ${lazy ? 'loading="lazy"' : ''}
                    decoding="async"
                >
            </picture>
        `;
    },

    /**
     * Placeholder oluştur (blur-up tekniği)
     * @param {string} src - Resim URL
     * @param {number} width - Placeholder genişliği
     */
    createPlaceholder(src, width = 20) {
        // Supabase storage için thumbnail URL oluştur
        if (src.includes('supabase')) {
            const url = new URL(src);
            url.searchParams.set('width', width);
            url.searchParams.set('quality', 10);
            return url.toString();
        }
        return src;
    },

    /**
     * Blur-up image component
     * @param {Object} options - Seçenekler
     */
    createBlurUpImage(options) {
        const {
            src,
            alt = '',
            className = '',
            aspectRatio = '16/9',
        } = options;

        const placeholder = this.createPlaceholder(src);

        return `
            <div class="blur-up-container ${className}" style="aspect-ratio: ${aspectRatio}">
                <img 
                    class="blur-up-placeholder" 
                    src="${placeholder}" 
                    alt=""
                    aria-hidden="true"
                >
                <img 
                    class="blur-up-main"
                    data-src="${src}"
                    alt="${alt}"
                    loading="lazy"
                    decoding="async"
                    onload="this.classList.add('loaded')"
                >
            </div>
        `;
    },

    /**
     * Resim boyutlarını optimize et
     * @param {File} file - Resim dosyası
     * @param {Object} options - Seçenekler
     * @returns {Promise<Blob>}
     */
    async resizeImage(file, options = {}) {
        const {
            maxWidth = 1920,
            maxHeight = 1080,
            quality = 0.8,
            format = 'image/jpeg',
        } = options;

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                // Boyut hesaplama
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Canvas ile yeniden boyutlandır
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    format,
                    quality
                );

                URL.revokeObjectURL(img.src);
            };

            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                reject(new Error('Image load failed'));
            };

            img.src = URL.createObjectURL(file);
        });
    },

    /**
     * Thumbnail oluştur
     * @param {File} file - Resim dosyası
     * @param {number} size - Thumbnail boyutu
     * @returns {Promise<Blob>}
     */
    async createThumbnail(file, size = 150) {
        return this.resizeImage(file, {
            maxWidth: size,
            maxHeight: size,
            quality: 0.7,
        });
    },

    /**
     * Data URL'e dönüştür
     * @param {Blob|File} blob - Blob veya File
     * @returns {Promise<string>}
     */
    async toDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    /**
     * Dominant renk çıkar (placeholder için)
     * @param {string} src - Resim URL
     * @returns {Promise<string>}
     */
    async extractDominantColor(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 1, 1);

                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                resolve(`rgb(${r}, ${g}, ${b})`);
            };

            img.onerror = () => resolve('#e5e7eb'); // Fallback gri
            img.src = src;
        });
    },
};

// CSS stilleri
export const imageOptimizerStyles = `
    .blur-up-container {
        position: relative;
        overflow: hidden;
        background: var(--skeleton-bg, #e5e7eb);
    }

    .blur-up-placeholder {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        filter: blur(20px);
        transform: scale(1.1);
        transition: opacity 0.3s;
    }

    .blur-up-main {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.3s;
    }

    .blur-up-main.loaded {
        opacity: 1;
    }

    .blur-up-main.loaded + .blur-up-placeholder,
    .blur-up-container:has(.blur-up-main.loaded) .blur-up-placeholder {
        opacity: 0;
    }

    picture img {
        width: 100%;
        height: auto;
    }

    img[loading="lazy"] {
        background: var(--skeleton-bg, #e5e7eb);
    }
`;

// Global'e ekle
if (typeof window !== 'undefined') {
    window.ImageOptimizer = ImageOptimizer;
}
