/**
 * Rich Text Editor - Admin Panel Integration
 * Global wrapper for TipTap-based editor
 * 
 * Bu dosya, ES module olan richTextEditor.js'i
 * global window objesi üzerinden erişilebilir hale getirir.
 * 
 * Kullanım:
 *   const editor = AdminRichTextEditor.create('#editor-container', {
 *       content: '<p>Mevcut içerik</p>',
 *       onSave: (html) => { console.log(html); }
 *   });
 */

const AdminRichTextEditor = {
    // Active editor instances
    instances: new Map(),

    // Default configuration
    defaults: {
        placeholder: 'Ders içeriğini buraya yazın...',
        autosave: true,
        autosaveDelay: 3000,
    },

    /**
     * Create a new editor instance
     * @param {string|HTMLElement} element - Container element or selector
     * @param {Object} options - Editor options
     * @returns {Object} Editor instance wrapper
     */
    create(element, options = {}) {
        const id = `editor-${Date.now()}`;
        const container = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;

        if (!container) {
            console.error('[AdminRichTextEditor] Container not found:', element);
            return null;
        }

        // Merge options with defaults
        const config = { ...this.defaults, ...options };

        // Create simple fallback editor (textarea-based)
        // Full TipTap integration requires Vite build
        const wrapper = this._createFallbackEditor(container, config, id);
        
        this.instances.set(id, wrapper);
        return wrapper;
    },

    /**
     * Create a fallback editor (textarea + markdown preview)
     * Used when TipTap is not available (non-bundled environment)
     */
    _createFallbackEditor(container, config, id) {
        container.innerHTML = `
            <div class="admin-rte-wrapper" data-editor-id="${id}">
                <div class="admin-rte-toolbar">
                    <div class="admin-rte-toolbar-group">
                        <button type="button" data-action="bold" title="Kalın" class="admin-rte-btn">
                            <strong>B</strong>
                        </button>
                        <button type="button" data-action="italic" title="İtalik" class="admin-rte-btn">
                            <em>I</em>
                        </button>
                        <button type="button" data-action="heading" title="Başlık" class="admin-rte-btn">
                            H
                        </button>
                        <button type="button" data-action="list" title="Liste" class="admin-rte-btn">
                            ☰
                        </button>
                        <button type="button" data-action="link" title="Link" class="admin-rte-btn">
                            🔗
                        </button>
                        <button type="button" data-action="code" title="Kod" class="admin-rte-btn">
                            { }
                        </button>
                    </div>
                    <div class="admin-rte-toolbar-spacer"></div>
                    <div class="admin-rte-toolbar-group">
                        <button type="button" data-action="preview" title="Önizleme" class="admin-rte-btn">
                            👁️
                        </button>
                        <span class="admin-rte-status"></span>
                    </div>
                </div>
                <div class="admin-rte-body">
                    <textarea class="admin-rte-textarea" placeholder="${config.placeholder}">${config.content || ''}</textarea>
                    <div class="admin-rte-preview" style="display:none;"></div>
                </div>
            </div>
        `;

        const textarea = container.querySelector('.admin-rte-textarea');
        const preview = container.querySelector('.admin-rte-preview');
        const status = container.querySelector('.admin-rte-status');
        let autosaveTimer = null;
        let isDirty = false;
        let isPreviewMode = false;

        // Toolbar actions
        container.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this._handleAction(textarea, action, preview);
                
                if (action === 'preview') {
                    isPreviewMode = !isPreviewMode;
                    textarea.style.display = isPreviewMode ? 'none' : 'block';
                    preview.style.display = isPreviewMode ? 'block' : 'none';
                    if (isPreviewMode) {
                        preview.innerHTML = this._markdownToHtml(textarea.value);
                    }
                    btn.classList.toggle('active', isPreviewMode);
                }
            });
        });

        // Autosave
        textarea.addEventListener('input', () => {
            isDirty = true;
            status.textContent = 'Değişiklikler...';
            
            if (autosaveTimer) clearTimeout(autosaveTimer);
            
            if (config.autosave && config.onSave) {
                autosaveTimer = setTimeout(() => {
                    config.onSave(textarea.value);
                    isDirty = false;
                    status.textContent = '✓ Kaydedildi';
                }, config.autosaveDelay);
            }
        });

        // Return wrapper object
        return {
            id,
            container,
            
            getHTML() {
                return this._markdownToHtml(textarea.value);
            },
            
            getText() {
                return textarea.value;
            },
            
            getContent() {
                return textarea.value;
            },
            
            setContent(content) {
                textarea.value = content || '';
                isDirty = false;
            },
            
            clear() {
                textarea.value = '';
                isDirty = false;
            },
            
            save() {
                if (config.onSave) {
                    config.onSave(textarea.value);
                    isDirty = false;
                    status.textContent = '✓ Kaydedildi';
                }
            },
            
            hasUnsavedChanges() {
                return isDirty;
            },
            
            focus() {
                textarea.focus();
            },
            
            destroy() {
                if (autosaveTimer) clearTimeout(autosaveTimer);
                container.innerHTML = '';
                AdminRichTextEditor.instances.delete(id);
            },
            
            _markdownToHtml: AdminRichTextEditor._markdownToHtml.bind(AdminRichTextEditor),
        };
    },

    /**
     * Handle toolbar actions
     */
    _handleAction(textarea, action, preview) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        
        let replacement = '';
        let cursorOffset = 0;
        
        switch (action) {
            case 'bold':
                replacement = `**${selected || 'kalın metin'}**`;
                cursorOffset = selected ? 0 : 2;
                break;
            case 'italic':
                replacement = `*${selected || 'italik metin'}*`;
                cursorOffset = selected ? 0 : 1;
                break;
            case 'heading':
                replacement = `\n## ${selected || 'Başlık'}\n`;
                break;
            case 'list':
                replacement = `\n- ${selected || 'Liste öğesi'}\n- \n- \n`;
                break;
            case 'link':
                const url = prompt('URL girin:', 'https://');
                if (url) {
                    replacement = `[${selected || 'link metni'}](${url})`;
                }
                break;
            case 'code':
                if (selected.includes('\n')) {
                    replacement = `\n\`\`\`\n${selected}\n\`\`\`\n`;
                } else {
                    replacement = `\`${selected || 'kod'}\``;
                }
                break;
            case 'preview':
                return; // Handled separately
        }
        
        if (replacement) {
            textarea.value = text.substring(0, start) + replacement + text.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + cursorOffset, start + replacement.length);
            textarea.dispatchEvent(new Event('input'));
        }
    },

    /**
     * Simple Markdown to HTML converter
     */
    _markdownToHtml(markdown) {
        if (!markdown) return '';
        
        let html = markdown
            // Escape HTML
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // Headers
            .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            // Bold & Italic
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
            // Lists
            .replace(/^\s*[-*]\s+(.+)$/gm, '<li>$1</li>')
            // Blockquotes
            .replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>')
            // Horizontal rule
            .replace(/^---$/gm, '<hr>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Wrap lists
        html = html.replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>');
        
        // Wrap in paragraphs if not already wrapped
        if (!html.startsWith('<')) {
            html = '<p>' + html + '</p>';
        }
        
        return html;
    },

    /**
     * Get editor instance by ID
     */
    getInstance(id) {
        return this.instances.get(id);
    },

    /**
     * Destroy all instances
     */
    destroyAll() {
        this.instances.forEach(instance => instance.destroy());
        this.instances.clear();
    },

    /**
     * Sanitize HTML (XSS protection)
     */
    sanitize(html) {
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(html, {
                ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
                    'h1', 'h2', 'h3', 'h4',
                    'ul', 'ol', 'li',
                    'blockquote', 'hr',
                    'a', 'img',
                    'table', 'thead', 'tbody', 'tr', 'th', 'td',
                ],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
            });
        }
        
        // Basic fallback sanitization
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
    }
};

// Add CSS styles dynamically
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .admin-rte-wrapper {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            overflow: hidden;
            background: rgba(30, 41, 59, 0.75);
        }
        
        .admin-rte-toolbar {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.5rem;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .admin-rte-toolbar-group {
            display: flex;
            align-items: center;
            gap: 0.125rem;
        }
        
        .admin-rte-toolbar-spacer {
            flex: 1;
        }
        
        .admin-rte-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            padding: 0;
            background: transparent;
            border: none;
            border-radius: 0.375rem;
            color: #94a3b8;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        
        .admin-rte-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }
        
        .admin-rte-btn.active {
            background: linear-gradient(135deg, #ff8c00, #ff4500);
            color: #fff;
        }
        
        .admin-rte-status {
            font-size: 0.75rem;
            color: #64748b;
            padding: 0 0.5rem;
        }
        
        .admin-rte-body {
            position: relative;
        }
        
        .admin-rte-textarea {
            width: 100%;
            min-height: 300px;
            padding: 1rem;
            background: #1e293b;
            border: none;
            color: #e2e8f0;
            font-family: 'Fira Code', Monaco, monospace;
            font-size: 0.9rem;
            line-height: 1.6;
            resize: vertical;
        }
        
        .admin-rte-textarea:focus {
            outline: none;
        }
        
        .admin-rte-textarea::placeholder {
            color: #475569;
        }
        
        .admin-rte-preview {
            min-height: 300px;
            padding: 1rem;
            background: #1e293b;
            color: #e2e8f0;
            line-height: 1.6;
            overflow-y: auto;
        }
        
        .admin-rte-preview h1,
        .admin-rte-preview h2,
        .admin-rte-preview h3,
        .admin-rte-preview h4 {
            margin: 1rem 0 0.5rem;
            color: #fff;
        }
        
        .admin-rte-preview h1 { font-size: 1.75rem; }
        .admin-rte-preview h2 { font-size: 1.5rem; }
        .admin-rte-preview h3 { font-size: 1.25rem; }
        .admin-rte-preview h4 { font-size: 1.1rem; }
        
        .admin-rte-preview p {
            margin: 0.5rem 0;
        }
        
        .admin-rte-preview ul, .admin-rte-preview ol {
            margin: 0.5rem 0;
            padding-left: 1.5rem;
        }
        
        .admin-rte-preview code {
            padding: 0.125rem 0.375rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 0.25rem;
            font-family: 'Fira Code', monospace;
            color: #ff8c00;
        }
        
        .admin-rte-preview pre {
            margin: 1rem 0;
            padding: 1rem;
            background: #0f172a;
            border-radius: 0.5rem;
            overflow-x: auto;
        }
        
        .admin-rte-preview pre code {
            padding: 0;
            background: none;
            color: #e0e0e0;
        }
        
        .admin-rte-preview blockquote {
            margin: 1rem 0;
            padding: 0.75rem 1rem;
            border-left: 3px solid #ff8c00;
            background: rgba(255, 140, 0, 0.1);
            font-style: italic;
        }
        
        .admin-rte-preview a {
            color: #00d4ff;
            text-decoration: underline;
        }
        
        .admin-rte-preview img {
            max-width: 100%;
            border-radius: 0.5rem;
        }
    `;
    document.head.appendChild(style);
})();

// Export globally
if (typeof window !== 'undefined') {
    window.AdminRichTextEditor = AdminRichTextEditor;
}
