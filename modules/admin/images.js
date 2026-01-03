/**
 * Image Manager Module for Admin Panel
 * Handles image selection, upload, preview, and URL resolution.
 *
 * Features:
 * - Image selector modal with grid view
 * - Supabase storage upload
 * - Smart URL resolution (local, Supabase, external)
 */

const ImageManager = {
    // Configuration
    config: {
        onUpdate: null, // Callback after image selection
        getCourseData: () => window.courseData || {},
    },

    // State
    targetInputId: null,
    targetInputId2: null,

    /**
     * Initialize with configuration
     */
    init(config) {
        this.config = { ...this.config, ...config };
    },

    // ==========================================
    // IMAGE SELECTOR MODAL
    // ==========================================

    /**
     * Open image selector modal
     */
    openSelector(inputId, inputId2 = null) {
        this.targetInputId = inputId;
        this.targetInputId2 = inputId2;

        const modal = document.getElementById('image-selector-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadImageList();
        }
    },

    /**
     * Close image selector modal
     */
    closeSelector() {
        const modal = document.getElementById('image-selector-modal');
        if (modal) modal.classList.add('hidden');

        this.targetInputId = null;
        this.targetInputId2 = null;
    },

    /**
     * Load available images into selector grid
     */
    async loadImageList() {
        const grid = document.getElementById('image-selector-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="col-span-full text-center p-4">Yükleniyor...</div>';

        // Collect images from all loaded course data
        const knownImages = new Set();
        const courseData = this.config.getCourseData();

        Object.values(courseData).forEach((course) => {
            if (course && course.data) {
                (course.data.projects || []).forEach((p) => {
                    if (p.circuitImage) knownImages.add(p.circuitImage);
                    if (p.code && p.code.match(/\.(png|jpg|jpeg|gif)$/i)) knownImages.add(p.code);
                });
                Object.values(course.data.componentInfo || {}).forEach((c) => {
                    if (c.imgFileName) knownImages.add(c.imgFileName);
                });
            }
        });

        // Add generic fallback images
        ['arduino_uno.jpg', 'breadboard.jpg', 'led_red.jpg', 'resistor.jpg', 'buzzer.jpg'].forEach((img) =>
            knownImages.add(img)
        );

        grid.innerHTML = '';

        if (knownImages.size === 0) {
            grid.innerHTML = '<div class="col-span-full text-center p-4 text-gray-500">Kayıtlı resim bulunamadı.</div>';
            return;
        }

        Array.from(knownImages)
            .sort()
            .forEach((imgName) => {
                const div = document.createElement('div');
                div.className =
                    'border rounded cursor-pointer hover:border-blue-500 hover:shadow-md transition p-1 bg-white flex flex-col items-center';
                div.onclick = () => this.selectImage(imgName);
                div.innerHTML = `
                <div class="w-full h-24 bg-gray-100 mb-1 flex items-center justify-center overflow-hidden">
                    <img src="img/${imgName}" class="max-w-full max-h-full object-contain" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNSIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBvbHlsaW5lIHBvaW50cz0iMjEgMTUgMTYgMTAgNSAyMSIvPjwvc3ZnPg=='">
                </div>
                <span class="text-[10px] text-gray-600 truncate w-full text-center" title="${imgName}">${imgName}</span>
            `;
                grid.appendChild(div);
            });
    },

    /**
     * Handle image selection
     */
    selectImage(imgName) {
        // Update primary input
        if (this.targetInputId) {
            const el = document.getElementById(this.targetInputId);
            if (el) {
                el.value = imgName;
                el.dispatchEvent(new Event('input'));
                el.dispatchEvent(new Event('change'));
            }
        }

        // Update secondary input if specified
        if (this.targetInputId2) {
            const el2 = document.getElementById(this.targetInputId2);
            if (el2) {
                el2.value = imgName;
                el2.dispatchEvent(new Event('input'));
                el2.dispatchEvent(new Event('change'));
            }
        }

        this.closeSelector();
    },

    // ==========================================
    // IMAGE PREVIEW & UPLOAD
    // ==========================================

    /**
     * Preview circuit image when URL/filename changes
     */
    previewCircuitImage() {
        const input = document.getElementById('p-circuitImage');
        const preview = document.getElementById('circuit-image-preview');
        const img = document.getElementById('circuit-preview-img');

        if (!input || !preview || !img) return;

        const value = input.value.trim();
        if (!value) {
            preview.classList.add('hidden');
            return;
        }

        const resolvedUrl = this.resolveImageUrl(value);
        img.src = resolvedUrl;
        img.onload = () => preview.classList.remove('hidden');
        img.onerror = () => preview.classList.add('hidden');
    },

    /**
     * Upload circuit image to Supabase Storage
     */
    async uploadCircuitImage(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const statusEl = document.getElementById('autosave-status');
        if (statusEl) {
            statusEl.textContent = '⬆️ Resim yükleniyor...';
            statusEl.classList.add('text-yellow-400');
        }

        try {
            if (!window.SupabaseClient || !window.SupabaseClient.getClient()) {
                throw new Error('Supabase client not initialized');
            }

            const publicUrl = await window.SupabaseClient.uploadImage(file, 'circuits');

            const circuitInput = document.getElementById('p-circuitImage');
            if (circuitInput) {
                circuitInput.value = publicUrl;
                this.previewCircuitImage();
            }

            if (statusEl) {
                statusEl.textContent = '✅ Resim yüklendi!';
                statusEl.classList.remove('text-yellow-400');
                statusEl.classList.add('text-green-400');
            }

            if (this.config.onUpdate) this.config.onUpdate();
        } catch (error) {
            console.error('Image upload error:', error);

            if (statusEl) {
                statusEl.textContent = '❌ Yükleme hatası!';
                statusEl.classList.remove('text-yellow-400');
                statusEl.classList.add('text-red-400');
            }

            alert(
                'Resim yüklenemedi: ' +
                    error.message +
                    '\n\nAlternatif: Dosya adını manuel girin veya harici URL kullanın.'
            );
        }

        fileInput.value = '';
    },

    /**
     * Smart Image URL Resolver
     * Handles: local files, Supabase storage, external URLs
     */
    resolveImageUrl(imagePath) {
        if (!imagePath) return '';

        // Already a full URL
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }

        // Local file - use relative path
        return imagePath.startsWith('img/') ? imagePath : `img/${imagePath}`;
    },
};

window.ImageManager = ImageManager;
