/**
 * Rich Text Editor Module - Yeti LAB
 * TipTap tabanlı WYSIWYG editör
 * 
 * Özellikler:
 * - Temel formatlama (bold, italic, underline)
 * - Başlıklar (H1-H4)
 * - Listeler (sıralı, sırasız)
 * - Kod blokları (syntax highlighting)
 * - Görsel ekleme (Supabase Storage)
 * - Link ekleme
 * - Tablo desteği
 * - XSS koruması (DOMPurify)
 * - Auto-save
 */

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import DOMPurify from 'dompurify';

// Lowlight instance for syntax highlighting
const lowlight = createLowlight(common);

/**
 * RichTextEditor Class
 * Manages TipTap editor instances
 */
class RichTextEditor {
    constructor(options = {}) {
        this.editor = null;
        this.container = null;
        this.toolbar = null;
        this.options = {
            element: null,
            content: '',
            placeholder: 'İçerik yazmaya başlayın...',
            editable: true,
            autosave: true,
            autosaveDelay: 3000,
            onUpdate: null,
            onSave: null,
            onImageUpload: null,
            ...options,
        };
        
        this.autosaveTimer = null;
        this.isDirty = false;
    }

    /**
     * Initialize the editor
     */
    init() {
        if (!this.options.element) {
            console.error('[RichTextEditor] No element provided');
            return null;
        }

        this.container = typeof this.options.element === 'string'
            ? document.querySelector(this.options.element)
            : this.options.element;

        if (!this.container) {
            console.error('[RichTextEditor] Container element not found');
            return null;
        }

        // Create editor structure
        this._createEditorStructure();

        // Initialize TipTap
        this.editor = new Editor({
            element: this.container.querySelector('.rte-content'),
            extensions: [
                StarterKit.configure({
                    heading: {
                        levels: [1, 2, 3, 4],
                    },
                    codeBlock: false, // We use CodeBlockLowlight instead
                }),
                Image.configure({
                    inline: false,
                    allowBase64: false,
                    HTMLAttributes: {
                        class: 'rte-image',
                    },
                }),
                Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                        class: 'rte-link',
                        rel: 'noopener noreferrer',
                        target: '_blank',
                    },
                }),
                Placeholder.configure({
                    placeholder: this.options.placeholder,
                }),
                Table.configure({
                    resizable: true,
                    HTMLAttributes: {
                        class: 'rte-table',
                    },
                }),
                TableRow,
                TableCell,
                TableHeader,
                CodeBlockLowlight.configure({
                    lowlight,
                    HTMLAttributes: {
                        class: 'rte-code-block',
                    },
                }),
            ],
            content: this.options.content,
            editable: this.options.editable,
            onUpdate: ({ editor }) => {
                this.isDirty = true;
                
                if (this.options.onUpdate) {
                    this.options.onUpdate(editor.getHTML());
                }

                if (this.options.autosave) {
                    this._triggerAutosave();
                }
            },
            onSelectionUpdate: () => {
                this._updateToolbarState();
            },
        });

        // Setup toolbar events
        this._setupToolbarEvents();

        console.log('[RichTextEditor] Initialized');
        return this;
    }

    /**
     * Create editor HTML structure
     */
    _createEditorStructure() {
        this.container.innerHTML = `
            <div class="rte-wrapper">
                <div class="rte-toolbar">
                    <div class="rte-toolbar-group">
                        <button type="button" data-action="bold" title="Kalın (Ctrl+B)" class="rte-btn">
                            <strong>B</strong>
                        </button>
                        <button type="button" data-action="italic" title="İtalik (Ctrl+I)" class="rte-btn">
                            <em>I</em>
                        </button>
                        <button type="button" data-action="strike" title="Üstü Çizili" class="rte-btn">
                            <s>S</s>
                        </button>
                        <button type="button" data-action="code" title="Satır İçi Kod" class="rte-btn">
                            <code>&lt;/&gt;</code>
                        </button>
                    </div>
                    
                    <div class="rte-toolbar-divider"></div>
                    
                    <div class="rte-toolbar-group">
                        <select data-action="heading" title="Başlık" class="rte-select">
                            <option value="paragraph">Normal</option>
                            <option value="1">Başlık 1</option>
                            <option value="2">Başlık 2</option>
                            <option value="3">Başlık 3</option>
                            <option value="4">Başlık 4</option>
                        </select>
                    </div>
                    
                    <div class="rte-toolbar-divider"></div>
                    
                    <div class="rte-toolbar-group">
                        <button type="button" data-action="bulletList" title="Madde İşaretli Liste" class="rte-btn">
                            ☰
                        </button>
                        <button type="button" data-action="orderedList" title="Numaralı Liste" class="rte-btn">
                            1.
                        </button>
                        <button type="button" data-action="blockquote" title="Alıntı" class="rte-btn">
                            ❝
                        </button>
                        <button type="button" data-action="codeBlock" title="Kod Bloğu" class="rte-btn">
                            { }
                        </button>
                    </div>
                    
                    <div class="rte-toolbar-divider"></div>
                    
                    <div class="rte-toolbar-group">
                        <button type="button" data-action="link" title="Link Ekle (Ctrl+K)" class="rte-btn">
                            🔗
                        </button>
                        <button type="button" data-action="image" title="Görsel Ekle" class="rte-btn">
                            🖼️
                        </button>
                        <button type="button" data-action="table" title="Tablo Ekle" class="rte-btn">
                            ⊞
                        </button>
                    </div>
                    
                    <div class="rte-toolbar-divider"></div>
                    
                    <div class="rte-toolbar-group">
                        <button type="button" data-action="undo" title="Geri Al (Ctrl+Z)" class="rte-btn">
                            ↩
                        </button>
                        <button type="button" data-action="redo" title="Yinele (Ctrl+Y)" class="rte-btn">
                            ↪
                        </button>
                    </div>
                    
                    <div class="rte-toolbar-spacer"></div>
                    
                    <div class="rte-toolbar-group">
                        <span class="rte-status" id="rte-autosave-status"></span>
                    </div>
                </div>
                
                <div class="rte-content"></div>
                
                <!-- Hidden file input for images -->
                <input type="file" class="rte-image-input" accept="image/png,image/jpeg,image/gif,image/webp" style="display:none;">
                
                <!-- Link dialog -->
                <div class="rte-dialog rte-link-dialog" style="display:none;">
                    <div class="rte-dialog-content">
                        <h4>Link Ekle</h4>
                        <input type="url" class="rte-dialog-input" placeholder="https://..." id="rte-link-url">
                        <div class="rte-dialog-actions">
                            <button type="button" class="rte-dialog-btn rte-dialog-cancel">İptal</button>
                            <button type="button" class="rte-dialog-btn rte-dialog-confirm">Ekle</button>
                        </div>
                    </div>
                </div>
                
                <!-- Table dialog -->
                <div class="rte-dialog rte-table-dialog" style="display:none;">
                    <div class="rte-dialog-content">
                        <h4>Tablo Ekle</h4>
                        <div class="rte-dialog-row">
                            <label>Satır: <input type="number" id="rte-table-rows" value="3" min="1" max="10"></label>
                            <label>Sütun: <input type="number" id="rte-table-cols" value="3" min="1" max="10"></label>
                        </div>
                        <div class="rte-dialog-actions">
                            <button type="button" class="rte-dialog-btn rte-dialog-cancel">İptal</button>
                            <button type="button" class="rte-dialog-btn rte-dialog-confirm">Ekle</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.toolbar = this.container.querySelector('.rte-toolbar');
    }

    /**
     * Setup toolbar button events
     */
    _setupToolbarEvents() {
        // Button clicks
        this.toolbar.querySelectorAll('[data-action]').forEach(el => {
            if (el.tagName === 'BUTTON') {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    this._handleToolbarAction(el.dataset.action);
                });
            } else if (el.tagName === 'SELECT') {
                el.addEventListener('change', (e) => {
                    this._handleToolbarAction(el.dataset.action, e.target.value);
                    e.target.value = 'paragraph'; // Reset
                });
            }
        });

        // Image input
        const imageInput = this.container.querySelector('.rte-image-input');
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this._handleImageUpload(file);
            }
            e.target.value = '';
        });

        // Link dialog
        const linkDialog = this.container.querySelector('.rte-link-dialog');
        linkDialog.querySelector('.rte-dialog-cancel').addEventListener('click', () => {
            linkDialog.style.display = 'none';
        });
        linkDialog.querySelector('.rte-dialog-confirm').addEventListener('click', () => {
            const url = document.getElementById('rte-link-url').value;
            if (url) {
                this.editor.chain().focus().setLink({ href: url }).run();
            }
            linkDialog.style.display = 'none';
        });

        // Table dialog
        const tableDialog = this.container.querySelector('.rte-table-dialog');
        tableDialog.querySelector('.rte-dialog-cancel').addEventListener('click', () => {
            tableDialog.style.display = 'none';
        });
        tableDialog.querySelector('.rte-dialog-confirm').addEventListener('click', () => {
            const rows = parseInt(document.getElementById('rte-table-rows').value) || 3;
            const cols = parseInt(document.getElementById('rte-table-cols').value) || 3;
            this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            tableDialog.style.display = 'none';
        });
    }

    /**
     * Handle toolbar actions
     */
    _handleToolbarAction(action, value = null) {
        if (!this.editor) return;

        const chain = this.editor.chain().focus();

        switch (action) {
            case 'bold':
                chain.toggleBold().run();
                break;
            case 'italic':
                chain.toggleItalic().run();
                break;
            case 'strike':
                chain.toggleStrike().run();
                break;
            case 'code':
                chain.toggleCode().run();
                break;
            case 'heading':
                if (value === 'paragraph') {
                    chain.setParagraph().run();
                } else {
                    chain.toggleHeading({ level: parseInt(value) }).run();
                }
                break;
            case 'bulletList':
                chain.toggleBulletList().run();
                break;
            case 'orderedList':
                chain.toggleOrderedList().run();
                break;
            case 'blockquote':
                chain.toggleBlockquote().run();
                break;
            case 'codeBlock':
                chain.toggleCodeBlock().run();
                break;
            case 'link':
                this._showLinkDialog();
                break;
            case 'image':
                this.container.querySelector('.rte-image-input').click();
                break;
            case 'table':
                this._showTableDialog();
                break;
            case 'undo':
                chain.undo().run();
                break;
            case 'redo':
                chain.redo().run();
                break;
        }
    }

    /**
     * Show link dialog
     */
    _showLinkDialog() {
        const dialog = this.container.querySelector('.rte-link-dialog');
        const input = document.getElementById('rte-link-url');
        
        // Get existing link if any
        const previousUrl = this.editor.getAttributes('link').href;
        input.value = previousUrl || '';
        
        dialog.style.display = 'flex';
        input.focus();
    }

    /**
     * Show table dialog
     */
    _showTableDialog() {
        const dialog = this.container.querySelector('.rte-table-dialog');
        dialog.style.display = 'flex';
    }

    /**
     * Handle image upload
     */
    async _handleImageUpload(file) {
        // Validate file
        const maxSize = 2 * 1024 * 1024; // 2MB for images in content
        if (file.size > maxSize) {
            alert('Görsel boyutu 2MB\'dan küçük olmalıdır.');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Lütfen geçerli bir görsel dosyası seçin.');
            return;
        }

        try {
            this._updateStatus('Görsel yükleniyor...');

            let imageUrl;

            if (this.options.onImageUpload) {
                // Custom upload handler (e.g., Supabase Storage)
                imageUrl = await this.options.onImageUpload(file);
            } else {
                // Fallback: Convert to base64 (not recommended for production)
                imageUrl = await this._fileToBase64(file);
            }

            if (imageUrl) {
                this.editor.chain().focus().setImage({ src: imageUrl }).run();
                this._updateStatus('Görsel eklendi');
            }
        } catch (error) {
            console.error('[RichTextEditor] Image upload error:', error);
            this._updateStatus('Görsel yüklenemedi', true);
        }
    }

    /**
     * Convert file to base64 (fallback)
     */
    _fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Update toolbar button states
     */
    _updateToolbarState() {
        if (!this.editor || !this.toolbar) return;

        // Update active states
        this.toolbar.querySelectorAll('[data-action]').forEach(el => {
            const action = el.dataset.action;
            let isActive = false;

            switch (action) {
                case 'bold':
                    isActive = this.editor.isActive('bold');
                    break;
                case 'italic':
                    isActive = this.editor.isActive('italic');
                    break;
                case 'strike':
                    isActive = this.editor.isActive('strike');
                    break;
                case 'code':
                    isActive = this.editor.isActive('code');
                    break;
                case 'bulletList':
                    isActive = this.editor.isActive('bulletList');
                    break;
                case 'orderedList':
                    isActive = this.editor.isActive('orderedList');
                    break;
                case 'blockquote':
                    isActive = this.editor.isActive('blockquote');
                    break;
                case 'codeBlock':
                    isActive = this.editor.isActive('codeBlock');
                    break;
                case 'link':
                    isActive = this.editor.isActive('link');
                    break;
            }

            el.classList.toggle('active', isActive);
        });
    }

    /**
     * Trigger autosave with debounce
     */
    _triggerAutosave() {
        if (this.autosaveTimer) {
            clearTimeout(this.autosaveTimer);
        }

        this._updateStatus('Değişiklikler kaydediliyor...');

        this.autosaveTimer = setTimeout(() => {
            this.save();
        }, this.options.autosaveDelay);
    }

    /**
     * Update status indicator
     */
    _updateStatus(message, isError = false) {
        const status = this.container.querySelector('#rte-autosave-status');
        if (status) {
            status.textContent = message;
            status.className = `rte-status ${isError ? 'rte-status-error' : ''}`;
        }
    }

    // ==========================================
    // PUBLIC METHODS
    // ==========================================

    /**
     * Get editor content as HTML
     */
    getHTML() {
        return this.editor ? this.editor.getHTML() : '';
    }

    /**
     * Get editor content as sanitized HTML
     */
    getSanitizedHTML() {
        const html = this.getHTML();
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'p', 'br', 'strong', 'em', 's', 'code', 'pre',
                'h1', 'h2', 'h3', 'h4',
                'ul', 'ol', 'li',
                'blockquote',
                'a', 'img',
                'table', 'thead', 'tbody', 'tr', 'th', 'td',
            ],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
            ALLOW_DATA_ATTR: false,
        });
    }

    /**
     * Get editor content as JSON
     */
    getJSON() {
        return this.editor ? this.editor.getJSON() : null;
    }

    /**
     * Get editor content as plain text
     */
    getText() {
        return this.editor ? this.editor.getText() : '';
    }

    /**
     * Set editor content from HTML
     */
    setContent(content) {
        if (this.editor) {
            // Sanitize incoming content
            const sanitized = DOMPurify.sanitize(content);
            this.editor.commands.setContent(sanitized);
            this.isDirty = false;
        }
    }

    /**
     * Clear editor content
     */
    clear() {
        if (this.editor) {
            this.editor.commands.clearContent();
            this.isDirty = false;
        }
    }

    /**
     * Save content
     */
    save() {
        if (!this.isDirty) return;

        const content = this.getSanitizedHTML();
        
        if (this.options.onSave) {
            this.options.onSave(content);
        }

        this.isDirty = false;
        this._updateStatus('✓ Kaydedildi');
    }

    /**
     * Focus editor
     */
    focus() {
        if (this.editor) {
            this.editor.commands.focus();
        }
    }

    /**
     * Check if editor has unsaved changes
     */
    hasUnsavedChanges() {
        return this.isDirty;
    }

    /**
     * Enable/disable editor
     */
    setEditable(editable) {
        if (this.editor) {
            this.editor.setEditable(editable);
        }
    }

    /**
     * Destroy editor instance
     */
    destroy() {
        if (this.autosaveTimer) {
            clearTimeout(this.autosaveTimer);
        }
        
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }

        if (this.container) {
            this.container.innerHTML = '';
        }

        console.log('[RichTextEditor] Destroyed');
    }
}

// Factory function for easy creation
function createRichTextEditor(options) {
    const editor = new RichTextEditor(options);
    return editor.init();
}

// Export for ES modules
export { RichTextEditor, createRichTextEditor };

// Export for global use
if (typeof window !== 'undefined') {
    window.RichTextEditor = RichTextEditor;
    window.createRichTextEditor = createRichTextEditor;
}
