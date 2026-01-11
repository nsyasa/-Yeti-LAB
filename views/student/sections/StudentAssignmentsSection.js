/**
 * StudentAssignmentsSection - Öğrenci ödev listesi ve yönetimi
 * Ödevleri görüntüleme, filtreleme ve durum takibi
 */
const StudentAssignmentsSection = {
    assignments: [],
    isLoading: false,
    filter: 'all', // all, pending, submitted, graded

    /**
     * Ana render
     */
    render() {
        return `
            <div class="student-assignments-section">
                <!-- Header -->
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            📋 Ödevlerim
                        </h2>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Sana atanan ödevleri görüntüle ve gönder
                        </p>
                    </div>
                </div>

                <!-- Filter Tabs -->
                <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                    <button onclick="StudentAssignmentsSection.setFilter('all')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="all">
                        📋 Tümü
                    </button>
                    <button onclick="StudentAssignmentsSection.setFilter('pending')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="pending">
                        ⏳ Bekleyen
                    </button>
                    <button onclick="StudentAssignmentsSection.setFilter('submitted')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="submitted">
                        📤 Gönderilenler
                    </button>
                    <button onclick="StudentAssignmentsSection.setFilter('graded')"
                        class="assignment-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        data-filter="graded">
                        ✅ Notlandırılanlar
                    </button>
                </div>

                <!-- Stats -->
                <div id="studentAssignmentStats" class="flex flex-wrap gap-3 mb-6">
                    ${this.renderStats()}
                </div>

                <!-- Assignments List -->
                <div id="studentAssignmentsList" class="space-y-4">
                    ${this.renderLoading()}
                </div>
            </div>
        `;
    },

    /**
     * Stats render
     */
    renderStats() {
        const stats = this.calculateStats();
        return `
            <div class="px-4 py-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center gap-2">
                <span class="font-bold text-blue-700 dark:text-blue-400">${stats.total}</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">Toplam</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center gap-2">
                <span class="font-bold text-yellow-700 dark:text-yellow-400">${stats.pending}</span>
                <span class="text-sm text-yellow-600 dark:text-yellow-400">Bekliyor</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center gap-2">
                <span class="font-bold text-orange-700 dark:text-orange-400">${stats.urgent}</span>
                <span class="text-sm text-orange-600 dark:text-orange-400">Acil</span>
            </div>
            <div class="px-4 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center gap-2">
                <span class="font-bold text-green-700 dark:text-green-400">${stats.graded}</span>
                <span class="text-sm text-green-600 dark:text-green-400">Notlandı</span>
            </div>
        `;
    },

    /**
     * Loading render
     */
    renderLoading() {
        return `
            <div class="glass-card rounded-2xl p-12 text-center">
                <div class="teacher-spinner mx-auto mb-4"></div>
                <p class="text-gray-500 dark:text-gray-400">Ödevler yükleniyor...</p>
            </div>
        `;
    },

    /**
     * Boş durum
     */
    renderEmptyState() {
        return `
            <div class="glass-card rounded-2xl p-12 text-center">
                <div class="text-6xl mb-4">📭</div>
                <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-2">Henüz ödevin yok</h3>
                <p class="text-gray-500 dark:text-gray-400">Öğretmenin sana ödev atadığında burada görünecek</p>
            </div>
        `;
    },

    /**
     * Ödev kartı render
     */
    renderAssignmentCard(assignment) {
        const service = window.StudentSubmissionService;
        const status = service?.getAssignmentStatus(assignment) || { label: '-', icon: '📋', color: 'gray' };
        const timeRemaining = service?.getTimeRemaining(assignment.due_date) || { text: '-' };
        const statusBadge = service?.getStatusBadgeHtml(status) || '';

        const submission = assignment.my_submission;
        const hasGrade = submission?.grade !== null && submission?.grade !== undefined;

        return `
            <div class="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onclick="StudentAssignmentsSection.openAssignment('${assignment.id}')">
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <!-- Sol: Ana Bilgiler -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start gap-3 mb-2">
                            <span class="text-3xl">${this.getTypeIcon(assignment.assignment_type)}</span>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-lg text-gray-800 dark:text-white">
                                    ${this.escapeHtml(assignment.title)}
                                </h4>
                                <div class="flex flex-wrap items-center gap-2 mt-1">
                                    ${statusBadge}
                                    ${assignment.course ? `<span class="text-xs text-gray-500">📚 ${this.escapeHtml(assignment.course.title)}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        ${assignment.description ? `
                            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-12 mb-2">
                                ${this.escapeHtml(assignment.description.substring(0, 120))}${assignment.description.length > 120 ? '...' : ''}
                            </p>
                        ` : ''}

                        <div class="flex flex-wrap items-center gap-4 text-sm ml-12">
                            ${assignment.due_date ? `
                                <span class="flex items-center gap-1 ${timeRemaining.overdue ? 'text-red-500 font-medium' : timeRemaining.urgent ? 'text-orange-500 font-medium' : 'text-gray-500'}">
                                    ⏰ ${timeRemaining.text}
                                </span>
                            ` : '<span class="text-gray-400">⏰ Süresiz</span>'}
                            <span class="text-gray-500">⭐ ${assignment.max_points} puan</span>
                        </div>
                    </div>

                    <!-- Sağ: Not veya Aksiyon -->
                    <div class="flex items-center gap-3 lg:flex-shrink-0">
                        ${hasGrade ? `
                            <div class="text-center">
                                <div class="text-3xl font-bold ${submission.grade >= assignment.max_points * 0.6 ? 'text-green-600' : 'text-orange-600'}">
                                    ${submission.grade}
                                </div>
                                <div class="text-xs text-gray-500">/ ${assignment.max_points}</div>
                            </div>
                        ` : status.canSubmit ? `
                            <button onclick="event.stopPropagation(); StudentAssignmentsSection.openAssignment('${assignment.id}')"
                                class="px-5 py-2.5 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-md">
                                ${submission?.status === 'draft' ? '📝 Devam Et' : '📤 Gönder'}
                            </button>
                        ` : `
                            <span class="text-gray-400 text-sm">👀 Görüntüle</span>
                        `}
                        
                        <span class="text-gray-400 text-xl">→</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Ödevleri listele
     */
    renderAssignmentsList() {
        const container = document.getElementById('studentAssignmentsList');
        if (!container) return;

        if (this.isLoading) {
            container.innerHTML = this.renderLoading();
            return;
        }

        const filtered = this.getFilteredAssignments();

        if (filtered.length === 0) {
            if (this.assignments.length === 0) {
                container.innerHTML = this.renderEmptyState();
            } else {
                container.innerHTML = `
                    <div class="glass-card rounded-2xl p-8 text-center">
                        <div class="text-4xl mb-3">🔍</div>
                        <p class="text-gray-500 dark:text-gray-400">Bu kategoride ödev bulunamadı</p>
                        <button onclick="StudentAssignmentsSection.setFilter('all')"
                            class="mt-3 text-theme hover:underline text-sm font-medium">
                            Tümünü Göster
                        </button>
                    </div>
                `;
            }
            return;
        }

        // Acil olanları üste al
        const sorted = [...filtered].sort((a, b) => {
            const statusA = window.StudentSubmissionService?.getAssignmentStatus(a);
            const statusB = window.StudentSubmissionService?.getAssignmentStatus(b);
            
            // Önce canSubmit olanlar
            if (statusA?.canSubmit && !statusB?.canSubmit) return -1;
            if (!statusA?.canSubmit && statusB?.canSubmit) return 1;
            
            // Sonra due date'e göre
            if (a.due_date && b.due_date) {
                return new Date(a.due_date) - new Date(b.due_date);
            }
            return 0;
        });

        container.innerHTML = sorted.map(a => this.renderAssignmentCard(a)).join('');
    },

    /**
     * Verileri yükle
     */
    async loadData() {
        this.isLoading = true;
        this.renderAssignmentsList();
        this.updateFilterButtons();

        try {
            const assignments = await window.StudentSubmissionService?.getMyAssignments({ status: 'all' }) || [];
            this.assignments = assignments;

            // Stats güncelle
            this.updateStats();

        } catch (error) {
            console.error('[StudentAssignmentsSection] Load error:', error);
            if (window.Toast) {
                Toast.error('Ödevler yüklenirken hata oluştu');
            }
        } finally {
            this.isLoading = false;
            this.renderAssignmentsList();
        }
    },

    /**
     * Stats güncelle
     */
    updateStats() {
        const container = document.getElementById('studentAssignmentStats');
        if (container) {
            container.innerHTML = this.renderStats();
        }
    },

    /**
     * İstatistikleri hesapla
     */
    calculateStats() {
        const service = window.StudentSubmissionService;
        
        let pending = 0;
        let urgent = 0;
        let submitted = 0;
        let graded = 0;

        this.assignments.forEach(a => {
            const status = service?.getAssignmentStatus(a);
            const time = service?.getTimeRemaining(a.due_date);

            if (status?.code === 'graded') {
                graded++;
            } else if (status?.code === 'submitted') {
                submitted++;
            } else if (status?.canSubmit) {
                pending++;
                if (time?.urgent && !time?.overdue) {
                    urgent++;
                }
            }
        });

        return {
            total: this.assignments.length,
            pending,
            urgent,
            submitted,
            graded
        };
    },

    /**
     * Filtrelenmiş ödevleri getir
     */
    getFilteredAssignments() {
        const service = window.StudentSubmissionService;

        return this.assignments.filter(assignment => {
            const status = service?.getAssignmentStatus(assignment);

            switch (this.filter) {
                case 'pending':
                    return status?.canSubmit && status?.code !== 'draft';
                case 'submitted':
                    return status?.code === 'submitted' || status?.code === 'draft';
                case 'graded':
                    return status?.code === 'graded';
                default:
                    return true;
            }
        });
    },

    /**
     * Filtre değiştir
     */
    setFilter(filter) {
        this.filter = filter;
        this.updateFilterButtons();
        this.renderAssignmentsList();
    },

    /**
     * Filtre butonlarını güncelle
     */
    updateFilterButtons() {
        document.querySelectorAll('.assignment-filter-btn').forEach(btn => {
            btn.classList.remove('bg-theme', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');
            
            if (btn.dataset.filter === this.filter) {
                btn.classList.add('bg-theme', 'text-white');
                btn.classList.remove('bg-gray-100', 'text-gray-600', 'dark:bg-gray-700', 'dark:text-gray-300');
            }
        });
    },

    // ==========================================
    // AKSİYONLAR
    // ==========================================

    /**
     * Ödev detayını aç
     */
    async openAssignment(assignmentId) {
        if (window.StudentSubmissionModal) {
            StudentSubmissionModal.open(assignmentId);
        }
    },

    // ==========================================
    // YARDIMCI
    // ==========================================

    /**
     * Tip ikonu
     */
    getTypeIcon(type) {
        const icons = {
            project: '🎯',
            homework: '📚',
            quiz: '❓',
            exam: '📝'
        };
        return icons[type] || '📋';
    },

    /**
     * HTML escape
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

window.StudentAssignmentsSection = StudentAssignmentsSection;
