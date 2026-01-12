/**
 * QuizManager - Quiz Editör Wrapper
 * QuizEditor modülünü modal API'si ile sarmalar
 * Template'lerde QuizManager.openEditor() şeklinde çağrılır
 */
const QuizManager = {
    currentProjectId: null,
    isOpen: false,

    /**
     * Quiz editör modalını aç
     */
    openEditor() {
        const projectId = window.admin?.currentProjectId || window.ProjectManager?.currentProjectId;
        if (!projectId && projectId !== 0) {
            console.warn('[QuizManager] No project selected');
            if (window.Toast) Toast.warning('Önce bir ders seçin');
            return;
        }

        this.currentProjectId = projectId;

        // Get project data
        const projects = window.admin?.currentData?.projects || [];
        const project = projects.find((p) => p.id === projectId);

        if (!project) {
            console.error('[QuizManager] Project not found:', projectId);
            return;
        }

        // Ensure quiz array exists
        if (!project.quiz) project.quiz = [];

        // Initialize QuizEditor with project data
        if (window.QuizEditor) {
            QuizEditor.init(projectId, project.quiz, (newData) => {
                project.quiz = newData;
                this.updateQuizCount(newData.length);
                if (window.admin?.triggerAutoSave) admin.triggerAutoSave();
            });
        }

        // Show modal
        const modal = document.getElementById('quiz-editor-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            this.isOpen = true;
        }

        // Render questions
        this.renderQuestions();
    },

    /**
     * Quiz editör modalını kapat
     */
    closeEditor() {
        const modal = document.getElementById('quiz-editor-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            this.isOpen = false;
        }
    },

    /**
     * Yeni soru ekle
     */
    addQuestion() {
        if (window.QuizEditor) {
            QuizEditor.addQuestion();
            this.renderQuestions();
        }
    },

    /**
     * Soru sil
     */
    removeQuestion(index) {
        if (window.QuizEditor) {
            QuizEditor.removeQuestion(index);
            this.renderQuestions();
        }
    },

    /**
     * Soru güncelle
     */
    updateQuestion(qIndex, field, value) {
        if (window.QuizEditor) {
            QuizEditor.updateQuestion(qIndex, field, value);
        }
    },

    /**
     * Kaydet ve kapat
     */
    saveAndClose() {
        // QuizEditor already syncs on each change
        // Just close the modal
        this.closeEditor();

        if (window.Toast) {
            Toast.success('Quiz kaydedildi');
        }
    },

    /**
     * Soruları modal içinde render et
     */
    renderQuestions() {
        const container = document.getElementById('quiz-questions-container');
        if (!container || !window.QuizEditor) return;

        const data = QuizEditor.data || [];

        if (data.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-400">
                    <div class="text-5xl mb-4">📝</div>
                    <p>Henüz soru eklenmemiş.</p>
                    <button onclick="QuizManager.addQuestion()" 
                            class="mt-4 text-theme hover:text-theme-dark font-bold">
                        + İlk soruyu ekle
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = data.map((q, index) => this.renderQuestion(q, index)).join('');
    },

    /**
     * Tek soru render
     */
    renderQuestion(q, index) {
        // Ensure options exists
        if (!q.options || !Array.isArray(q.options)) q.options = ['', '', '', ''];
        while (q.options.length < 4) q.options.push('');

        return `
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 relative group">
                <button type="button" 
                        onclick="QuizManager.removeQuestion(${index})" 
                        class="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-lg opacity-0 group-hover:opacity-100 transition">
                    ❌
                </button>
                
                <div class="mb-4">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        Soru ${index + 1}
                    </label>
                    <input type="text" 
                           class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 text-sm font-bold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                           value="${this.escapeHtml(q.q || '')}" 
                           onchange="QuizManager.updateQuestion(${index}, 'q', this.value)"
                           placeholder="Soruyu yazın...">
                </div>
                
                <div class="space-y-2">
                    <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Seçenekler</label>
                    ${q.options
                        .map(
                            (opt, oIndex) => `
                        <div class="flex items-center gap-3">
                            <input type="radio" 
                                   name="q${index}_ans" 
                                   value="${oIndex}" 
                                   ${q.answer === oIndex ? 'checked' : ''} 
                                   onchange="QuizManager.updateQuestion(${index}, 'answer', ${oIndex})"
                                   class="w-5 h-5 text-green-600">
                            <span class="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-xs font-bold">
                                ${String.fromCharCode(65 + oIndex)}
                            </span>
                            <input type="text" 
                                   class="flex-1 border border-gray-300 dark:border-gray-600 rounded p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" 
                                   value="${this.escapeHtml(opt)}" 
                                   onchange="QuizManager.updateQuestion(${index}, 'option_${oIndex}', this.value)"
                                   placeholder="${String.fromCharCode(65 + oIndex)} şıkkı...">
                        </div>
                    `
                        )
                        .join('')}
                </div>
                
                <div class="mt-3 text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                    <span>✓</span>
                    <span>Doğru cevabın yanındaki kutucuğu işaretleyin</span>
                </div>
            </div>
        `;
    },

    /**
     * Quiz sayısını güncelle
     */
    updateQuizCount(count) {
        const badge = document.getElementById('quiz-count-badge');
        if (badge) badge.textContent = count;
    },

    /**
     * HTML escape
     */
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
};

window.QuizManager = QuizManager;
