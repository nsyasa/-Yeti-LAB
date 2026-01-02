/**
 * Yeti LAB - Quiz Editor Module
 * Projelere ait quiz sorularının düzenlenmesini sağlar.
 * Veri Yapısı: { q: string, options: string[], answer: number (index) }
 */

const QuizEditor = {
    projectId: null,
    data: null, // Current quiz data (Array of questions)
    onUpdate: null, // Callback to save data

    /**
     * Initialize quiz editor for a project
     * @param {string|number} projectId
     * @param {Array} quizData - Existing quiz data array (project.quiz)
     * @param {Function} updateCallback - Function to call on change
     */
    init: (projectId, quizData, updateCallback) => {
        QuizEditor.projectId = projectId;
        QuizEditor.data = Array.isArray(quizData) ? quizData : [];
        QuizEditor.onUpdate = updateCallback;

        QuizEditor.render();
    },

    render: () => {
        const list = document.getElementById('quiz-editor-list');
        const emptyMsg = document.getElementById('quiz-empty-msg');

        if (!list) return;

        list.innerHTML = '';

        if (!QuizEditor.data || QuizEditor.data.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('hidden');
        } else {
            if (emptyMsg) emptyMsg.classList.add('hidden');

            QuizEditor.data.forEach((q, index) => {
                // Ensure options exists and has 4 items
                if (!q.options || !Array.isArray(q.options)) q.options = ['', '', '', ''];
                while (q.options.length < 4) q.options.push('');

                const qDiv = document.createElement('div');
                qDiv.className = 'bg-white border rounded p-4 shadow-sm relative group';
                qDiv.innerHTML = `
                    <button type="button" onclick="QuizEditor.removeQuestion(${index})" class="absolute top-2 right-2 text-gray-300 hover:text-red-500 font-bold p-1">❌</button>
                    
                    <div class="mb-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">Soru ${index + 1}</label>
                        <input type="text" class="w-full border rounded p-2 text-sm font-bold" 
                            value="${QuizEditor.escapeHtml(q.q)}" 
                            onchange="QuizEditor.updateQuestion(${index}, 'q', this.value)">
                    </div>
                    
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">Seçenekler</label>
                        ${q.options
                            .map(
                                (opt, oIndex) => `
                            <div class="flex items-center space-x-2">
                                <input type="radio" name="q${index}_ans" value="${oIndex}" 
                                    ${q.answer === oIndex ? 'checked' : ''} 
                                    onchange="QuizEditor.updateQuestion(${index}, 'answer', ${oIndex})">
                                <input type="text" class="w-full border rounded p-1 text-sm bg-gray-50" 
                                    value="${QuizEditor.escapeHtml(opt)}" 
                                    onchange="QuizEditor.updateQuestion(${index}, 'option_${oIndex}', this.value)">
                            </div>
                        `
                            )
                            .join('')}
                    </div>
                    <div class="mt-2 text-xs text-green-600 font-bold">
                        * Doğru cevabın yanındaki kutucuğu işaretleyin.
                    </div>
                `;
                list.appendChild(qDiv);
            });
        }
    },

    addQuestion: () => {
        if (!QuizEditor.data) QuizEditor.data = [];

        QuizEditor.data.push({
            q: 'Yeni Soru?',
            options: ['A Şıkkı', 'B Şıkkı', 'C Şıkkı', 'D Şıkkı'],
            answer: 0,
        });

        QuizEditor.render();
        QuizEditor.sync();
    },

    removeQuestion: (index) => {
        if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) return;
        QuizEditor.data.splice(index, 1);
        QuizEditor.render();
        QuizEditor.sync();
    },

    updateQuestion: (qIndex, field, value) => {
        const question = QuizEditor.data[qIndex];

        if (field === 'q') {
            question.q = value;
        } else if (field === 'answer') {
            question.answer = parseInt(value);
        } else if (field.startsWith('option_')) {
            const optIndex = parseInt(field.split('_')[1]);
            question.options[optIndex] = value;
        }

        QuizEditor.sync();
    },

    sync: () => {
        if (QuizEditor.onUpdate) {
            QuizEditor.onUpdate(QuizEditor.data);
        }
    },

    escapeHtml: (text) => {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
};

window.QuizEditor = QuizEditor;
