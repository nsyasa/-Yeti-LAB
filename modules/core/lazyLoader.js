/**
 * Yeti LAB - Lazy Loading Module
 * Büyük listeler için lazy loading ve virtual scrolling
 * Faz 8: Performans Optimizasyonu
 */

export const LazyLoader = {
    // Aktif observer'lar
    observers: new Map(),

    // Varsayılan ayarlar
    defaultOptions: {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
    },

    /**
     * Intersection Observer oluştur
     * @param {string} id - Observer ID
     * @param {Function} callback - Görünür olduğunda çağrılacak fonksiyon
     * @param {Object} options - Observer seçenekleri
     */
    createObserver(id, callback, options = {}) {
        if (this.observers.has(id)) {
            this.destroyObserver(id);
        }

        const mergedOptions = { ...this.defaultOptions, ...options };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback(entry.target);
                }
            });
        }, mergedOptions);

        this.observers.set(id, observer);
        return observer;
    },

    /**
     * Element'i gözlemle
     * @param {string} observerId - Observer ID
     * @param {HTMLElement} element - Gözlemlenecek element
     */
    observe(observerId, element) {
        const observer = this.observers.get(observerId);
        if (observer && element) {
            observer.observe(element);
        }
    },

    /**
     * Element'i gözlemden çıkar
     * @param {string} observerId - Observer ID
     * @param {HTMLElement} element - Element
     */
    unobserve(observerId, element) {
        const observer = this.observers.get(observerId);
        if (observer && element) {
            observer.unobserve(element);
        }
    },

    /**
     * Observer'ı yok et
     * @param {string} id - Observer ID
     */
    destroyObserver(id) {
        const observer = this.observers.get(id);
        if (observer) {
            observer.disconnect();
            this.observers.delete(id);
        }
    },

    /**
     * Tüm observer'ları temizle
     */
    destroyAll() {
        this.observers.forEach((observer) => observer.disconnect());
        this.observers.clear();
    },

    /**
     * Lazy loading ile resim yükleme
     * @param {string} selector - Resim seçicisi
     */
    lazyLoadImages(selector = 'img[data-src]') {
        const images = document.querySelectorAll(selector);

        if ('IntersectionObserver' in window) {
            const imageObserver = this.createObserver('lazy-images', (img) => {
                const src = img.dataset.src;
                if (src) {
                    img.src = src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                }
                this.unobserve('lazy-images', img);
            });

            images.forEach((img) => imageObserver.observe(img));
        } else {
            // Fallback: Tüm resimleri hemen yükle
            images.forEach((img) => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        }
    },

    /**
     * Infinite scroll için sentinel element
     * @param {string} containerId - Liste container ID
     * @param {Function} loadMore - Daha fazla yükle fonksiyonu
     * @param {Object} options - Seçenekler
     */
    setupInfiniteScroll(containerId, loadMore, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Sentinel element oluştur
        let sentinel = container.querySelector('.scroll-sentinel');
        if (!sentinel) {
            sentinel = document.createElement('div');
            sentinel.className = 'scroll-sentinel';
            sentinel.style.cssText = 'height: 1px; width: 100%;';
            container.appendChild(sentinel);
        }

        const observerId = `infinite-scroll-${containerId}`;
        let isLoading = false;

        this.createObserver(
            observerId,
            async () => {
                if (isLoading) return;

                isLoading = true;
                sentinel.innerHTML = '<div class="loading-spinner"></div>';

                try {
                    const hasMore = await loadMore();

                    if (!hasMore) {
                        // Daha fazla veri yok, observer'ı durdur
                        this.destroyObserver(observerId);
                        sentinel.innerHTML = '<p class="text-muted">Tüm veriler yüklendi</p>';
                    } else {
                        sentinel.innerHTML = '';
                    }
                } catch (error) {
                    console.error('[LazyLoader] Infinite scroll error:', error);
                    sentinel.innerHTML = '<p class="text-error">Yüklenirken hata oluştu</p>';
                }

                isLoading = false;
            },
            { rootMargin: '200px', ...options }
        );

        this.observe(observerId, sentinel);

        return () => this.destroyObserver(observerId);
    },

    /**
     * Virtual scroll için görünür aralık hesapla
     * @param {number} scrollTop - Scroll pozisyonu
     * @param {number} containerHeight - Container yüksekliği
     * @param {number} itemHeight - Her item'ın yüksekliği
     * @param {number} totalItems - Toplam item sayısı
     * @param {number} buffer - Ekstra render edilecek item sayısı
     */
    calculateVisibleRange(scrollTop, containerHeight, itemHeight, totalItems, buffer = 5) {
        const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * buffer;
        const endIndex = Math.min(totalItems - 1, startIndex + visibleCount);

        return {
            startIndex,
            endIndex,
            offsetY: startIndex * itemHeight,
            visibleCount,
        };
    },
};

/**
 * Pagination Helper
 */
export const Pagination = {
    /**
     * Pagination state oluştur
     * @param {Object} options - Seçenekler
     */
    createState(options = {}) {
        return {
            currentPage: options.currentPage || 1,
            pageSize: options.pageSize || 20,
            totalItems: options.totalItems || 0,
            totalPages: 0,
        };
    },

    /**
     * Toplam sayfa sayısını hesapla
     * @param {number} totalItems - Toplam item sayısı
     * @param {number} pageSize - Sayfa başına item
     */
    calculateTotalPages(totalItems, pageSize) {
        return Math.ceil(totalItems / pageSize);
    },

    /**
     * Offset hesapla (Supabase range için)
     * @param {number} page - Sayfa numarası (1-indexed)
     * @param {number} pageSize - Sayfa başına item
     */
    calculateOffset(page, pageSize) {
        return (page - 1) * pageSize;
    },

    /**
     * Range hesapla (Supabase için)
     * @param {number} page - Sayfa numarası
     * @param {number} pageSize - Sayfa başına item
     */
    calculateRange(page, pageSize) {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        return { from, to };
    },

    /**
     * Pagination UI render et
     * @param {Object} state - Pagination state
     * @param {Function} onPageChange - Sayfa değişim callback'i
     */
    render(state, onPageChange) {
        const { currentPage, totalPages } = state;

        if (totalPages <= 1) return '';

        const pages = this.getPageNumbers(currentPage, totalPages);

        return `
            <div class="pagination">
                <button 
                    class="pagination-btn pagination-prev"
                    ${currentPage <= 1 ? 'disabled' : ''}
                    data-page="${currentPage - 1}"
                >
                    <span class="icon">←</span> Önceki
                </button>
                
                <div class="pagination-pages">
                    ${pages
                        .map((page) =>
                            page === '...'
                                ? '<span class="pagination-ellipsis">...</span>'
                                : `<button 
                                    class="pagination-btn pagination-page ${page === currentPage ? 'active' : ''}"
                                    data-page="${page}"
                                >${page}</button>`
                        )
                        .join('')}
                </div>
                
                <button 
                    class="pagination-btn pagination-next"
                    ${currentPage >= totalPages ? 'disabled' : ''}
                    data-page="${currentPage + 1}"
                >
                    Sonraki <span class="icon">→</span>
                </button>
            </div>
        `;
    },

    /**
     * Görünür sayfa numaralarını hesapla
     * @param {number} current - Mevcut sayfa
     * @param {number} total - Toplam sayfa
     * @param {number} maxVisible - Maksimum görünür sayfa sayısı
     */
    getPageNumbers(current, total, maxVisible = 7) {
        if (total <= maxVisible) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        const pages = [];
        const halfVisible = Math.floor(maxVisible / 2);

        // Her zaman ilk sayfayı göster
        pages.push(1);

        // Başlangıç ve bitiş aralığını hesapla
        let start = Math.max(2, current - halfVisible);
        let end = Math.min(total - 1, current + halfVisible);

        // Aralığı ayarla
        if (current <= halfVisible + 1) {
            end = maxVisible - 2;
        } else if (current >= total - halfVisible) {
            start = total - maxVisible + 3;
        }

        // Başta ellipsis
        if (start > 2) {
            pages.push('...');
        }

        // Orta sayfalar
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Sonda ellipsis
        if (end < total - 1) {
            pages.push('...');
        }

        // Her zaman son sayfayı göster
        if (total > 1) {
            pages.push(total);
        }

        return pages;
    },

    /**
     * Pagination click handler'ını bağla
     * @param {HTMLElement} container - Pagination container
     * @param {Function} onPageChange - Sayfa değişim callback'i
     */
    bindEvents(container, onPageChange) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-page]');
            if (btn && !btn.disabled) {
                const page = parseInt(btn.dataset.page, 10);
                if (!isNaN(page)) {
                    onPageChange(page);
                }
            }
        });
    },
};

// CSS stilleri
export const paginationStyles = `
    .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 16px;
        flex-wrap: wrap;
    }

    .pagination-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border: 1px solid var(--border-color, #e5e7eb);
        border-radius: 6px;
        background: var(--card-bg, #fff);
        color: var(--text-primary, #374151);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled) {
        background: var(--hover-bg, #f3f4f6);
        border-color: var(--primary-color, #3b82f6);
    }

    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-btn.active {
        background: var(--primary-color, #3b82f6);
        color: white;
        border-color: var(--primary-color, #3b82f6);
    }

    .pagination-pages {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .pagination-page {
        min-width: 36px;
        justify-content: center;
    }

    .pagination-ellipsis {
        padding: 8px 4px;
        color: var(--text-muted, #9ca3af);
    }

    .scroll-sentinel {
        display: flex;
        justify-content: center;
        padding: 16px;
    }

    .loading-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--border-color, #e5e7eb);
        border-top-color: var(--primary-color, #3b82f6);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    img[data-src] {
        opacity: 0;
        transition: opacity 0.3s;
    }

    img.loaded {
        opacity: 1;
    }

    @media (max-width: 640px) {
        .pagination {
            gap: 4px;
        }

        .pagination-btn {
            padding: 6px 10px;
            font-size: 13px;
        }

        .pagination-prev .icon,
        .pagination-next .icon {
            display: none;
        }
    }
`;

// Global'e ekle
if (typeof window !== 'undefined') {
    window.LazyLoader = LazyLoader;
    window.Pagination = Pagination;
}
