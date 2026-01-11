/**
 * AssignmentsSection - Öğretmen paneli ödev yönetimi
 * Ödev listesi, filtreleme ve temel işlemler
 */
const AssignmentsSection = {
    assignments: [],
    classrooms: [],
    courses: [],
    filters: {
        classroom: '',
        status: '',
        search: '',
    },
    isLoading: false,

    /**
     * Ana render
     */
    render() {
        return `
            <div class="space-y-3">
                <!-- Filters -->
                <div class="glass-card rounded-xl p-3">
                    <div class="flex flex-col sm:flex-row gap-2">
                        <!-- Search -->
                        <div class="flex-1">
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                                <input type="text" 
                                    id="assignmentSearchInput"
                                    placeholder="Ödev ara..." 
                                    onkeyup="AssignmentsSection.onSearchChange(event)"
                                    class="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:border-theme focus:ring-1 focus:ring-theme/20 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
                            </div>
                        </div>

                        <!-- Classroom Filter -->
                        <select id="assignmentClassroomFilter"
                            onchange="AssignmentsSection.onFilterChange()"
                            class="px-3 py-2 border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm min-w-[130px]">
                            <option value="">Tüm Sınıflar</option>
                        </select>

                        <!-- Status Filter -->
                        <select id="assignmentStatusFilter"
                            onchange="AssignmentsSection.onFilterChange()"
                            class="px-3 py-2 border border-gray-200 rounded-lg focus:border-theme dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm min-w-[110px]">
                            <option value="">Tüm Durumlar</option>
                            <option value="draft">📝 Taslak</option>
                            <option value="active">✅ Aktif</option>
                            <option value="closed">🔒 Kapalı</option>
                        </select>
                        
                        <!-- Create Button -->
                        <button onclick="AssignmentsSection.openCreateModal()"
                            class="flex items-center justify-center gap-1.5 px-3 py-2 bg-theme text-white rounded-lg font-semibold hover:brightness-110 transition-all shadow-sm text-sm">
                            <span>+</span>
                            <span>Yeni Ödev</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Bar -->
                <div id="assignmentStatsBar" class="flex flex-wrap gap-2">
                    ${this.renderStatsBar()}
                </div>

                <!-- Assignments List -->
                <div id="assignmentsList" class="space-y-2">
                    ${this.renderEmptyState()}
                </div>
            </div>
        `;
    },

    /**
     * Stats bar render
     */
    renderStatsBar() {
        const stats = this.calculateStats();
        return `
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-gray-100 dark:bg-gray-700">
                <span class="text-lg">📋</span>
                <span class="font-bold text-gray-800 dark:text-white">${stats.total}</span>
                <span class="text-sm text-gray-600 dark:text-gray-300">Toplam</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-green-100 dark:bg-green-900/30">
                <span class="text-lg">✅</span>
                <span class="font-bold text-green-700 dark:text-green-400">${stats.active}</span>
                <span class="text-sm text-green-600 dark:text-green-400">Aktif</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30">
                <span class="text-lg">📝</span>
                <span class="font-bold text-yellow-700 dark:text-yellow-400">${stats.draft}</span>
                <span class="text-sm text-yellow-600 dark:text-yellow-400">Taslak</span>
            </div>
            <div class="px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30">
                <span class="text-lg">📥</span>
                <span class="font-bold text-blue-700 dark:text-blue-400">${stats.pendingSubmissions}</span>
                <span class="text-sm text-blue-600 dark:text-blue-400">Bekleyen Gönderi</span>
            </div>
        `;
    },

    /**
     * Boş durum render
     */
    renderEmptyState() {
        return `
            <div class="glass-card rounded-xl p-6">
                <div class="empty-state text-center">
                    <div class="text-3xl mb-2">📋</div>
                    <h3 class="text-base font-bold text-gray-800 dark:text-white mb-1">Henüz ödev oluşturmadınız</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">Yukarıdaki "Yeni Ödev" butonuna tıklayın</p>
                </div>
            </div>
        `;
    },

    /**
     * Loading durumu render
     */
    renderLoading() {
        return `
            <div class="glass-card rounded-xl p-6">
                <div class="flex flex-col items-center justify-center">
                    <div class="teacher-spinner mb-2"></div>
                    <p class="text-gray-500 text-sm">Ödevler yükleniyor...</p>
                </div>
            </div>
        `;
    },

    /**
     * Ödev kartı render
     * @param {Object} assignment - Ödev verisi
     */
    renderAssignmentCard(assignment) {
        const timeRemaining = window.AssignmentService?.getTimeRemaining(assignment.due_date) || { text: '-' };
        const statusBadge = window.AssignmentService?.getStatusBadge(assignment.status) || '';
        const typeBadge = window.AssignmentService?.getTypeBadge(assignment.assignment_type) || '';

        return `
            <div class="glass-card rounded-2xl p-5 hover:shadow-lg transition-all duration-200" data-assignment-id="${assignment.id}">
                <div class="flex flex-col lg:flex-row lg:items-center gap-4">
                    <!-- Sol: Ana Bilgiler -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start gap-3 mb-2">
                            <span class="text-2xl">${this.getAssignmentIcon(assignment.assignment_type)}</span>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-lg text-gray-800 dark:text-white truncate">
                                    ${this.escapeHtml(assignment.title)}
                                </h4>
                                <div class="flex flex-wrap items-center gap-2 mt-1">
                                    ${statusBadge}
                                    ${typeBadge}
                                    ${assignment.classroom ? `<span class="text-xs text-gray-500">🏫 ${this.escapeHtml(assignment.classroom.name)}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        
                        ${
                            assignment.description
                                ? `
                            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 ml-9 mb-2">
                                ${this.escapeHtml(assignment.description.substring(0, 150))}${assignment.description.length > 150 ? '...' : ''}
                            </p>
                        `
                                : ''
                        }

                        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 ml-9">
                            ${
                                assignment.due_date
                                    ? `
                                <span class="flex items-center gap-1 ${timeRemaining.isOverdue ? 'text-red-500' : timeRemaining.isUrgent ? 'text-orange-500' : ''}">
                                    ⏰ ${timeRemaining.text}
                                </span>
                            `
                                    : ''
                            }
                            <span class="flex items-center gap-1">
                                📥 ${assignment.submission_count || 0} gönderi
                            </span>
                            <span class="flex items-center gap-1">
                                ⭐ ${assignment.max_points} puan
                            </span>
                        </div>
                    </div>

                    <!-- Sağ: Aksiyonlar -->
                    <div class="flex items-center gap-2 lg:flex-shrink-0">
                        ${
                            assignment.status === 'draft'
                                ? `
                            <button onclick="AssignmentsSection.publishAssignment('${assignment.id}')"
                                class="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors text-sm"
                                title="Yayınla">
                                🚀 Yayınla
                            </button>
                        `
                                : ''
                        }
                        
                        <button onclick="AssignmentsSection.viewSubmissions('${assignment.id}')"
                            class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
                            title="Gönderileri Gör">
                            📥 Gönderiler
                        </button>
                        
                        <button onclick="AssignmentsSection.editAssignment('${assignment.id}')"
                            class="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            title="Düzenle">
                            ✏️
                        </button>
                        
                        <button onclick="AssignmentsSection.showAssignmentMenu('${assignment.id}', event)"
                            class="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                            title="Daha Fazla">
                            ⋮
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Ödevleri listele
     */
    renderAssignmentsList() {
        const container = document.getElementById('assignmentsList');
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
                        <p class="text-gray-500 dark:text-gray-400">Filtrelere uygun ödev bulunamadı</p>
                        <button onclick="AssignmentsSection.clearFilters()"
                            class="mt-3 text-theme hover:underline text-sm font-medium">
                            Filtreleri Temizle
                        </button>
                    </div>
                `;
            }
            return;
        }

        container.innerHTML = filtered.map((a) => this.renderAssignmentCard(a)).join('');
    },

    /**
     * Verileri yükle
     */
    async loadData() {
        this.isLoading = true;
        this.renderAssignmentsList();

        try {
            // Paralel yükleme
            const [assignments, classrooms, courses] = await Promise.all([
                window.AssignmentService?.getAssignments() || [],
                window.AssignmentService?.getTeacherClassrooms() || [],
                window.AssignmentService?.getCourses() || [],
            ]);

            this.assignments = assignments;
            this.classrooms = classrooms;
            this.courses = courses;

            // Sınıf filtresini doldur
            this.populateClassroomFilter();

            // Stats'ı güncelle
            this.updateStatsBar();
        } catch (error) {
            console.error('[AssignmentsSection] Load error:', error);
            if (window.Toast) {
                Toast.error('Ödevler yüklenirken hata oluştu');
            }
        } finally {
            this.isLoading = false;
            this.renderAssignmentsList();
        }
    },

    /**
     * Sınıf filtre dropdown'ını doldur
     */
    populateClassroomFilter() {
        const select = document.getElementById('assignmentClassroomFilter');
        if (!select) return;

        select.innerHTML =
            '<option value="">Tüm Sınıflar</option>' +
            this.classrooms.map((c) => `<option value="${c.id}">${this.escapeHtml(c.name)}</option>`).join('');
    },

    /**
     * Stats bar'ı güncelle
     */
    updateStatsBar() {
        const container = document.getElementById('assignmentStatsBar');
        if (container) {
            container.innerHTML = this.renderStatsBar();
        }
    },

    /**
     * İstatistikleri hesapla
     */
    calculateStats() {
        const stats = {
            total: this.assignments.length,
            active: this.assignments.filter((a) => a.status === 'active').length,
            draft: this.assignments.filter((a) => a.status === 'draft').length,
            closed: this.assignments.filter((a) => a.status === 'closed').length,
            pendingSubmissions: 0,
        };

        // Bekleyen gönderi sayısını hesapla
        stats.pendingSubmissions = this.assignments.reduce((sum, a) => {
            return sum + (a.submission_count || 0);
        }, 0);

        return stats;
    },

    /**
     * Filtrelenmiş ödevleri getir
     */
    getFilteredAssignments() {
        return this.assignments.filter((assignment) => {
            // Sınıf filtresi
            if (this.filters.classroom && assignment.classroom_id !== this.filters.classroom) {
                return false;
            }

            // Status filtresi
            if (this.filters.status && assignment.status !== this.filters.status) {
                return false;
            }

            // Arama filtresi
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const titleMatch = assignment.title.toLowerCase().includes(searchLower);
                const descMatch = assignment.description?.toLowerCase().includes(searchLower);
                if (!titleMatch && !descMatch) {
                    return false;
                }
            }

            return true;
        });
    },

    /**
     * Filtre değişikliği
     */
    onFilterChange() {
        const classroomSelect = document.getElementById('assignmentClassroomFilter');
        const statusSelect = document.getElementById('assignmentStatusFilter');

        this.filters.classroom = classroomSelect?.value || '';
        this.filters.status = statusSelect?.value || '';

        this.renderAssignmentsList();
    },

    /**
     * Arama değişikliği (debounced)
     */
    onSearchChange(event) {
        clearTimeout(this._searchTimeout);
        this._searchTimeout = setTimeout(() => {
            this.filters.search = event.target.value.trim();
            this.renderAssignmentsList();
        }, 300);
    },

    /**
     * Filtreleri temizle
     */
    clearFilters() {
        this.filters = { classroom: '', status: '', search: '' };

        const searchInput = document.getElementById('assignmentSearchInput');
        const classroomSelect = document.getElementById('assignmentClassroomFilter');
        const statusSelect = document.getElementById('assignmentStatusFilter');

        if (searchInput) searchInput.value = '';
        if (classroomSelect) classroomSelect.value = '';
        if (statusSelect) statusSelect.value = '';

        this.renderAssignmentsList();
    },

    // ==========================================
    // AKSİYONLAR
    // ==========================================

    /**
     * Yeni ödev modalını aç
     */
    openCreateModal() {
        if (window.AssignmentModals) {
            AssignmentModals.openCreate(this.classrooms, this.courses);
        }
    },

    /**
     * Ödev düzenleme modalını aç
     */
    async editAssignment(assignmentId) {
        try {
            const assignment = await window.AssignmentService?.getAssignment(assignmentId);
            if (assignment && window.AssignmentModals) {
                AssignmentModals.openEdit(assignment, this.classrooms, this.courses);
            }
        } catch (error) {
            console.error('[AssignmentsSection] Edit error:', error);
            if (window.Toast) Toast.error('Ödev yüklenirken hata oluştu');
        }
    },

    /**
     * Ödevi yayınla
     */
    async publishAssignment(assignmentId) {
        if (!confirm('Bu ödevi yayınlamak istediğinize emin misiniz?')) return;

        try {
            await window.AssignmentService?.publishAssignment(assignmentId);
            if (window.Toast) Toast.success('Ödev yayınlandı!');
            await this.loadData();
        } catch (error) {
            console.error('[AssignmentsSection] Publish error:', error);
            if (window.Toast) Toast.error('Yayınlama başarısız');
        }
    },

    /**
     * Gönderileri görüntüle
     */
    viewSubmissions(assignmentId) {
        if (window.AssignmentModals) {
            AssignmentModals.openSubmissions(assignmentId);
        }
    },

    /**
     * Ödev menüsünü göster
     */
    showAssignmentMenu(assignmentId, event) {
        event.stopPropagation();

        // Mevcut menüyü kaldır
        const existingMenu = document.querySelector('.assignment-context-menu');
        if (existingMenu) existingMenu.remove();

        const assignment = this.assignments.find((a) => a.id === assignmentId);
        if (!assignment) return;

        const menu = document.createElement('div');
        menu.className =
            'assignment-context-menu absolute z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 min-w-[180px]';

        const rect = event.target.getBoundingClientRect();
        menu.style.top = `${rect.bottom + 8}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;

        menu.innerHTML = `
            <button onclick="AssignmentsSection.duplicateAssignment('${assignmentId}')" 
                class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                📋 Kopyala
            </button>
            ${
                assignment.status === 'active'
                    ? `
                <button onclick="AssignmentsSection.closeAssignment('${assignmentId}')" 
                    class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    🔒 Kapat
                </button>
            `
                    : ''
            }
            ${
                assignment.status === 'closed'
                    ? `
                <button onclick="AssignmentsSection.reopenAssignment('${assignmentId}')" 
                    class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                    🔓 Yeniden Aç
                </button>
            `
                    : ''
            }
            <hr class="my-2 border-gray-200 dark:border-gray-700">
            <button onclick="AssignmentsSection.deleteAssignment('${assignmentId}')" 
                class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                🗑️ Sil
            </button>
        `;

        document.body.appendChild(menu);

        // Dışarı tıklanınca kapat
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => document.addEventListener('click', closeMenu), 0);
    },

    /**
     * Ödevi kapat
     */
    async closeAssignment(assignmentId) {
        document.querySelector('.assignment-context-menu')?.remove();

        if (!confirm('Bu ödevi kapatmak istediğinize emin misiniz? Öğrenciler artık gönderi yapamayacak.')) return;

        try {
            await window.AssignmentService?.closeAssignment(assignmentId);
            if (window.Toast) Toast.success('Ödev kapatıldı');
            await this.loadData();
        } catch (error) {
            console.error('[AssignmentsSection] Close error:', error);
            if (window.Toast) Toast.error('İşlem başarısız');
        }
    },

    /**
     * Ödevi yeniden aç
     */
    async reopenAssignment(assignmentId) {
        document.querySelector('.assignment-context-menu')?.remove();

        try {
            await window.AssignmentService?.updateAssignment(assignmentId, { status: 'active' });
            if (window.Toast) Toast.success('Ödev yeniden açıldı');
            await this.loadData();
        } catch (error) {
            console.error('[AssignmentsSection] Reopen error:', error);
            if (window.Toast) Toast.error('İşlem başarısız');
        }
    },

    /**
     * Ödevi kopyala
     */
    async duplicateAssignment(assignmentId) {
        document.querySelector('.assignment-context-menu')?.remove();

        try {
            const original = await window.AssignmentService?.getAssignment(assignmentId);
            if (!original) throw new Error('Ödev bulunamadı');

            const copy = {
                ...original,
                title: `${original.title} (Kopya)`,
                status: 'draft',
                due_date: null,
            };
            delete copy.id;
            delete copy.created_at;
            delete copy.updated_at;
            delete copy.published_at;

            await window.AssignmentService?.createAssignment(copy);
            if (window.Toast) Toast.success('Ödev kopyalandı');
            await this.loadData();
        } catch (error) {
            console.error('[AssignmentsSection] Duplicate error:', error);
            if (window.Toast) Toast.error('Kopyalama başarısız');
        }
    },

    /**
     * Ödevi sil
     */
    async deleteAssignment(assignmentId) {
        document.querySelector('.assignment-context-menu')?.remove();

        if (!confirm('Bu ödevi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

        try {
            await window.AssignmentService?.deleteAssignment(assignmentId);
            if (window.Toast) Toast.success('Ödev silindi');
            await this.loadData();
        } catch (error) {
            console.error('[AssignmentsSection] Delete error:', error);
            if (window.Toast) Toast.error('Silme başarısız');
        }
    },

    // ==========================================
    // YARDIMCI FONKSİYONLAR
    // ==========================================

    /**
     * Ödev tipi ikonu
     */
    getAssignmentIcon(type) {
        const icons = {
            project: '🎯',
            homework: '📚',
            quiz: '❓',
            exam: '📝',
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
    },
};

window.AssignmentsSection = AssignmentsSection;
