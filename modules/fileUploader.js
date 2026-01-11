/**
 * File Uploader Module - Yeti LAB
 * Supabase Storage entegrasyonu ile dosya yükleme
 * 
 * Özellikler:
 * - Drag & drop desteği
 * - Progress göstergesi
 * - Dosya validasyonu (boyut, tür)
 * - Çoklu dosya yükleme
 * - Signed URL'ler ile güvenli erişim
 */

const FileUploader = {
    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    config: {
        bucket: 'submissions',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 3,
        allowedTypes: {
            'application/pdf': { ext: 'pdf', name: 'PDF' },
            'application/msword': { ext: 'doc', name: 'Word' },
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: 'docx', name: 'Word' },
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': { ext: 'pptx', name: 'PowerPoint' },
            'application/zip': { ext: 'zip', name: 'ZIP' },
            'application/x-zip-compressed': { ext: 'zip', name: 'ZIP' },
            'image/png': { ext: 'png', name: 'PNG' },
            'image/jpeg': { ext: 'jpg', name: 'JPEG' },
        },
        allowedExtensions: ['pdf', 'doc', 'docx', 'pptx', 'zip', 'png', 'jpg', 'jpeg'],
    },

    // Upload durumları
    uploads: new Map(), // uploadId -> { file, progress, status, error }

    // Event listeners
    listeners: {
        onProgress: null,
        onComplete: null,
        onError: null,
    },

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * Initialize with custom configuration
     * @param {Object} options - Custom config options
     */
    init(options = {}) {
        if (options.maxFileSize) this.config.maxFileSize = options.maxFileSize;
        if (options.maxFiles) this.config.maxFiles = options.maxFiles;
        if (options.allowedExtensions) this.config.allowedExtensions = options.allowedExtensions;
        if (options.bucket) this.config.bucket = options.bucket;
        
        console.log('[FileUploader] Initialized with config:', this.config);
    },

    /**
     * Set event listeners
     * @param {Object} listeners - { onProgress, onComplete, onError }
     */
    setListeners(listeners) {
        this.listeners = { ...this.listeners, ...listeners };
    },

    // ==========================================
    // VALIDATION
    // ==========================================

    /**
     * Validate a single file
     * @param {File} file - File to validate
     * @returns {Object} { valid: boolean, error?: string }
     */
    validateFile(file) {
        // Check if file exists
        if (!file) {
            return { valid: false, error: 'Dosya bulunamadı' };
        }

        // Check file size
        if (file.size > this.config.maxFileSize) {
            const maxMB = (this.config.maxFileSize / (1024 * 1024)).toFixed(1);
            const fileMB = (file.size / (1024 * 1024)).toFixed(1);
            return { 
                valid: false, 
                error: `Dosya çok büyük (${fileMB}MB). Maksimum: ${maxMB}MB` 
            };
        }

        // Check file type by MIME
        const isAllowedMime = this.config.allowedTypes[file.type];
        
        // Also check by extension as fallback
        const extension = file.name.split('.').pop()?.toLowerCase();
        const isAllowedExt = this.config.allowedExtensions.includes(extension);

        if (!isAllowedMime && !isAllowedExt) {
            return { 
                valid: false, 
                error: `Desteklenmeyen dosya türü: ${extension || file.type}. İzin verilen: ${this.config.allowedExtensions.join(', ')}` 
            };
        }

        // Check for potentially dangerous files
        const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'ps1', 'js', 'vbs'];
        if (dangerousExtensions.includes(extension)) {
            return { valid: false, error: 'Güvenlik nedeniyle bu dosya türü kabul edilmiyor' };
        }

        return { valid: true };
    },

    /**
     * Validate multiple files
     * @param {FileList|Array} files - Files to validate
     * @returns {Object} { valid: boolean, errors: string[], validFiles: File[] }
     */
    validateFiles(files) {
        const fileArray = Array.from(files);
        const errors = [];
        const validFiles = [];

        // Check max files limit
        if (fileArray.length > this.config.maxFiles) {
            errors.push(`Maksimum ${this.config.maxFiles} dosya yükleyebilirsiniz`);
        }

        // Validate each file
        fileArray.slice(0, this.config.maxFiles).forEach((file, index) => {
            const result = this.validateFile(file);
            if (result.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${result.error}`);
            }
        });

        return {
            valid: errors.length === 0,
            errors,
            validFiles,
        };
    },

    // ==========================================
    // UPLOAD FUNCTIONS
    // ==========================================

    /**
     * Generate storage path for a file
     * @param {string} studentId - Student UUID
     * @param {string} assignmentId - Assignment UUID
     * @param {string} fileName - Original file name
     * @returns {string} Storage path
     */
    generatePath(studentId, assignmentId, fileName) {
        // Sanitize filename
        const safeName = fileName
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .replace(/_+/g, '_')
            .substring(0, 100);
        
        // Add timestamp to prevent overwrites
        const timestamp = Date.now();
        const ext = safeName.split('.').pop();
        const baseName = safeName.replace(`.${ext}`, '');
        
        return `${studentId}/${assignmentId}/${baseName}_${timestamp}.${ext}`;
    },

    /**
     * Upload a single file to Supabase Storage
     * @param {File} file - File to upload
     * @param {string} studentId - Student UUID
     * @param {string} assignmentId - Assignment UUID
     * @param {Function} onProgress - Progress callback (0-100)
     * @returns {Promise<Object>} { success, path, url, error }
     */
    async uploadFile(file, studentId, assignmentId, onProgress = null) {
        const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // Validate
            const validation = this.validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Generate path
            const path = this.generatePath(studentId, assignmentId, file.name);

            // Track upload
            this.uploads.set(uploadId, {
                file,
                path,
                progress: 0,
                status: 'uploading',
                error: null,
            });

            // Get Supabase client
            const supabase = SupabaseClient.getClient();
            if (!supabase) {
                throw new Error('Supabase bağlantısı kurulamadı');
            }

            // Upload with progress tracking
            // Note: Supabase JS v2 doesn't have native progress, using XHR wrapper
            const result = await this._uploadWithProgress(
                supabase,
                this.config.bucket,
                path,
                file,
                (progress) => {
                    this.uploads.get(uploadId).progress = progress;
                    if (onProgress) onProgress(progress);
                    if (this.listeners.onProgress) {
                        this.listeners.onProgress(uploadId, progress, file);
                    }
                }
            );

            if (result.error) {
                throw result.error;
            }

            // Update status
            this.uploads.get(uploadId).status = 'complete';

            // Get public URL or signed URL
            const urlResult = await this.getSignedUrl(path);

            const uploadResult = {
                success: true,
                uploadId,
                path,
                url: urlResult.url,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
            };

            if (this.listeners.onComplete) {
                this.listeners.onComplete(uploadResult);
            }

            return uploadResult;

        } catch (error) {
            console.error('[FileUploader] Upload error:', error);
            
            if (this.uploads.has(uploadId)) {
                this.uploads.get(uploadId).status = 'error';
                this.uploads.get(uploadId).error = error.message;
            }

            const errorResult = {
                success: false,
                uploadId,
                error: error.message,
                fileName: file.name,
            };

            if (this.listeners.onError) {
                this.listeners.onError(errorResult);
            }

            return errorResult;
        }
    },

    /**
     * Upload with XMLHttpRequest for progress tracking
     * @private
     */
    async _uploadWithProgress(supabase, bucket, path, file, onProgress) {
        // For Supabase, we'll use the standard upload and simulate progress
        // Real progress requires signed upload URLs or custom implementation
        
        // Simulate progress for better UX
        let fakeProgress = 0;
        const progressInterval = setInterval(() => {
            fakeProgress = Math.min(fakeProgress + 10, 90);
            onProgress(fakeProgress);
        }, 100);

        try {
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            clearInterval(progressInterval);
            onProgress(100);

            return { data, error };
        } catch (error) {
            clearInterval(progressInterval);
            return { data: null, error };
        }
    },

    /**
     * Upload multiple files
     * @param {FileList|Array} files - Files to upload
     * @param {string} studentId - Student UUID
     * @param {string} assignmentId - Assignment UUID
     * @param {Function} onTotalProgress - Overall progress callback
     * @returns {Promise<Object>} { successful: [], failed: [] }
     */
    async uploadMultiple(files, studentId, assignmentId, onTotalProgress = null) {
        const fileArray = Array.from(files);
        const results = { successful: [], failed: [] };
        let completedCount = 0;

        for (const file of fileArray) {
            const result = await this.uploadFile(
                file,
                studentId,
                assignmentId,
                (progress) => {
                    // Calculate total progress
                    const totalProgress = Math.round(
                        ((completedCount * 100) + progress) / fileArray.length
                    );
                    if (onTotalProgress) onTotalProgress(totalProgress);
                }
            );

            if (result.success) {
                results.successful.push(result);
            } else {
                results.failed.push(result);
            }

            completedCount++;
        }

        if (onTotalProgress) onTotalProgress(100);

        return results;
    },

    // ==========================================
    // FILE ACCESS
    // ==========================================

    /**
     * Get signed URL for a file (expires in 1 hour)
     * @param {string} path - File path in storage
     * @param {number} expiresIn - Expiry time in seconds (default: 3600)
     * @returns {Promise<Object>} { url, error }
     */
    async getSignedUrl(path, expiresIn = 3600) {
        try {
            const supabase = SupabaseClient.getClient();
            
            const { data, error } = await supabase.storage
                .from(this.config.bucket)
                .createSignedUrl(path, expiresIn);

            if (error) throw error;

            return { url: data.signedUrl, error: null };
        } catch (error) {
            console.error('[FileUploader] Signed URL error:', error);
            return { url: null, error: error.message };
        }
    },

    /**
     * Download a file
     * @param {string} path - File path in storage
     * @returns {Promise<Blob>}
     */
    async downloadFile(path) {
        try {
            const supabase = SupabaseClient.getClient();
            
            const { data, error } = await supabase.storage
                .from(this.config.bucket)
                .download(path);

            if (error) throw error;

            return { data, error: null };
        } catch (error) {
            console.error('[FileUploader] Download error:', error);
            return { data: null, error: error.message };
        }
    },

    /**
     * Delete a file from storage
     * @param {string} path - File path in storage
     * @returns {Promise<Object>} { success, error }
     */
    async deleteFile(path) {
        try {
            const supabase = SupabaseClient.getClient();
            
            const { error } = await supabase.storage
                .from(this.config.bucket)
                .remove([path]);

            if (error) throw error;

            return { success: true, error: null };
        } catch (error) {
            console.error('[FileUploader] Delete error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * List files in a folder
     * @param {string} folder - Folder path (e.g., studentId/assignmentId)
     * @returns {Promise<Array>}
     */
    async listFiles(folder) {
        try {
            const supabase = SupabaseClient.getClient();
            
            const { data, error } = await supabase.storage
                .from(this.config.bucket)
                .list(folder, {
                    limit: 100,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) throw error;

            return { files: data, error: null };
        } catch (error) {
            console.error('[FileUploader] List error:', error);
            return { files: [], error: error.message };
        }
    },

    // ==========================================
    // UI HELPERS
    // ==========================================

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size (e.g., "2.5 MB")
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Get file icon based on type
     * @param {string} mimeType - MIME type
     * @returns {string} Emoji icon
     */
    getFileIcon(mimeType) {
        const icons = {
            'application/pdf': '📄',
            'application/msword': '📝',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📊',
            'application/zip': '📦',
            'application/x-zip-compressed': '📦',
            'image/png': '🖼️',
            'image/jpeg': '🖼️',
        };
        return icons[mimeType] || '📎';
    },

    /**
     * Create drag & drop zone
     * @param {HTMLElement} element - Container element
     * @param {Function} onDrop - Callback when files are dropped
     */
    createDropZone(element, onDrop) {
        if (!element) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Highlight on drag
        ['dragenter', 'dragover'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.add('drag-over');
            }, false);
        });

        // Remove highlight
        ['dragleave', 'drop'].forEach(eventName => {
            element.addEventListener(eventName, () => {
                element.classList.remove('drag-over');
            }, false);
        });

        // Handle drop
        element.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0 && onDrop) {
                onDrop(files);
            }
        }, false);
    },

    /**
     * Generate HTML for file preview
     * @param {Object} fileInfo - { name, size, type, url }
     * @returns {string} HTML string
     */
    generateFilePreviewHTML(fileInfo) {
        const icon = this.getFileIcon(fileInfo.type);
        const size = this.formatFileSize(fileInfo.size);
        
        return `
            <div class="file-preview flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <span class="text-2xl">${icon}</span>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">${fileInfo.name}</p>
                    <p class="text-xs text-gray-400">${size}</p>
                </div>
                ${fileInfo.url ? `
                    <a href="${fileInfo.url}" target="_blank" 
                       class="text-blue-400 hover:text-blue-300 text-sm">
                        Görüntüle
                    </a>
                ` : ''}
                <button type="button" class="file-remove text-red-400 hover:text-red-300" 
                        data-path="${fileInfo.path || ''}">
                    ✕
                </button>
            </div>
        `;
    },

    /**
     * Generate progress bar HTML
     * @param {number} progress - Progress percentage (0-100)
     * @param {string} fileName - File name
     * @returns {string} HTML string
     */
    generateProgressHTML(progress, fileName) {
        return `
            <div class="upload-progress p-3 bg-white/5 rounded-lg">
                <div class="flex justify-between text-sm mb-1">
                    <span class="text-white truncate">${fileName}</span>
                    <span class="text-gray-400">${progress}%</span>
                </div>
                <div class="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                         style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    },
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUploader;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.FileUploader = FileUploader;
}
