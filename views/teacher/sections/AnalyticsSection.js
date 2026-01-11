/**
 * AnalyticsSection - Öğretmen Analytics Dashboard (Single Screen Layout)
 * Kapsamlı istatistik ve grafik görünümü - kendi içinde scroll
 */
const AnalyticsSection = {
    summary: null,
    submissionTrend: [],
    classroomPerformance: [],
    assignmentStats: [],
    topStudents: [],
    statusDistribution: null,
    recentActivity: [],
    isLoading: false,

    /**
     * Ana render - Single Screen Layout
     */
    render() {
        return `
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Header with Refresh -->
                <div class="flex items-center justify-between mb-4 flex-shrink-0">
                    <h2 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        📊 Analytics Dashboard
                    </h2>
                    <button onclick="AnalyticsSection.refresh()"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-xs font-medium">
                        <span>🔄</span>
                        <span>Yenile</span>
                    </button>
                </div>

                <!-- Scrollable Content -->
                <div class="flex-1 overflow-y-auto min-h-0 space-y-4">
                    
                    <!-- Summary Stats Grid -->
                    <div id="analyticsSummaryGrid" class="grid grid-cols-2 md:grid-cols-4 gap-2">
                        ${this.renderSummaryLoading()}
                    </div>

                    <!-- Charts Row -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <!-- Submission Trend -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                📈 Gönderim Trendi (Son 7 Gün)
                            </h3>
                            <div id="submissionTrendChart" class="h-32">
                                ${this.renderChartLoading()}
                            </div>
                        </div>

                        <!-- Status Distribution -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                📊 Gönderim Durumu Dağılımı
                            </h3>
                            <div id="statusDistributionChart" class="h-32">
                                ${this.renderChartLoading()}
                            </div>
                        </div>
                    </div>

                    <!-- Classroom Performance -->
                    <div class="teacher-panel-card rounded-xl p-4">
                        <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                            🏫 Sınıf Performansı
                        </h3>
                        <div id="classroomPerformanceTable" class="max-h-40 overflow-y-auto">
                            ${this.renderTableLoading()}
                        </div>
                    </div>

                    <!-- Two Column Layout -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        <!-- Top Students -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                🏆 En Başarılı Öğrenciler
                            </h3>
                            <div id="topStudentsList" class="max-h-36 overflow-y-auto">
                                ${this.renderListLoading()}
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="teacher-panel-card rounded-xl p-4">
                            <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-2 flex items-center gap-1.5">
                                ⚡ Son Aktiviteler
                            </h3>
                            <div id="recentActivityList" class="max-h-36 overflow-y-auto">
                                ${this.renderListLoading()}
                            </div>
                        </div>
                    </div>

                    <!-- Assignment Stats Table -->
                    <div class="teacher-panel-card rounded-xl p-4">
                        <h3 class="font-semibold text-xs text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            📋 Ödev İstatistikleri
                        </h3>
                        <div id="assignmentStatsTable">
                            ${this.renderTableLoading()}
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
    },

    /**
     * Loading state for summary
     */
    renderSummaryLoading() {
        return Array(4)
            .fill('')
            .map(
                () => `
            <div class="glass-card rounded-xl p-4 animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
        `
            )
            .join('');
    },

    /**
     * Loading state for charts
     */
    renderChartLoading() {
        return `
            <div class="flex items-center justify-center h-full">
                <div class="teacher-spinner"></div>
            </div>
        `;
    },

    /**
     * Loading state for tables
     */
    renderTableLoading() {
        return `
            <div class="animate-pulse space-y-3">
                ${Array(3)
                    .fill('')
                    .map(
                        () => `
                    <div class="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    /**
     * Loading state for lists
     */
    renderListLoading() {
        return `
            <div class="animate-pulse space-y-3">
                ${Array(5)
                    .fill('')
                    .map(
                        () => `
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div class="flex-grow">
                            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1"></div>
                            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </div>
                    </div>
                `
                    )
                    .join('')}
            </div>
        `;
    },

    /**
     * Mount ve veri yükle
     */
    async mount() {
        this.isLoading = true;
        await this.loadAllData();
        this.renderAllSections();
        this.isLoading = false;
    },

    /**
     * Refresh data
     */
    async refresh() {
        if (window.showToast) window.showToast('Veriler yenileniyor...', 'info');
        await this.mount();
        if (window.showToast) window.showToast('Veriler güncellendi', 'success');
    },

    /**
     * Tüm verileri yükle
     */
    async loadAllData() {
        try {
            const { default: AnalyticsService } = await import('/modules/teacher/analyticsService.js');

            // Paralel yükleme
            const [
                summary,
                submissionTrend,
                classroomPerformance,
                assignmentStats,
                topStudents,
                statusDistribution,
                recentActivity,
            ] = await Promise.all([
                AnalyticsService.getDashboardSummary(),
                AnalyticsService.getSubmissionTrend(7),
                AnalyticsService.getClassroomPerformance(),
                AnalyticsService.getAssignmentStats(),
                AnalyticsService.getTopStudents(5),
                AnalyticsService.getSubmissionStatusDistribution(),
                AnalyticsService.getRecentActivity(10),
            ]);

            this.summary = summary;
            this.submissionTrend = submissionTrend;
            this.classroomPerformance = classroomPerformance;
            this.assignmentStats = assignmentStats;
            this.topStudents = topStudents;
            this.statusDistribution = statusDistribution;
            this.recentActivity = recentActivity;
        } catch (error) {
            console.error('Analytics veri yükleme hatası:', error);
            if (window.showToast) window.showToast('Veriler yüklenirken hata oluştu', 'error');
        }
    },

    /**
     * Tüm bölümleri render et
     */
    renderAllSections() {
        this.renderSummary();
        this.renderSubmissionTrend();
        this.renderStatusDistribution();
        this.renderClassroomPerformance();
        this.renderTopStudents();
        this.renderRecentActivity();
        this.renderAssignmentStats();
    },

    /**
     * Summary stats render
     */
    renderSummary() {
        const container = document.getElementById('analyticsSummaryGrid');
        if (!container || !this.summary) return;

        const stats = [
            { label: 'Toplam Öğrenci', value: this.summary.totalStudents, icon: '👨‍🎓', color: 'blue' },
            { label: 'Aktif Ödev', value: this.summary.activeAssignments, icon: '📋', color: 'green' },
            { label: 'Bekleyen Gönderim', value: this.summary.pendingSubmissions, icon: '📥', color: 'orange' },
            { label: 'Ortalama Puan', value: this.summary.averageScore, icon: '⭐', color: 'purple', suffix: '%' },
        ];

        container.innerHTML = stats
            .map(
                (stat) => `
            <div class="glass-card rounded-xl p-4 border-l-4 border-${stat.color}-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${stat.label}</p>
                        <p class="text-2xl font-bold text-gray-800 dark:text-white">
                            ${stat.value}${stat.suffix || ''}
                        </p>
                    </div>
                    <div class="text-3xl opacity-50">${stat.icon}</div>
                </div>
            </div>
        `
            )
            .join('');
    },

    /**
     * Submission trend chart (CSS-based bar chart)
     */
    renderSubmissionTrend() {
        const container = document.getElementById('submissionTrendChart');
        if (!container) return;

        if (!this.submissionTrend || this.submissionTrend.length === 0) {
            container.innerHTML = this.renderEmptyState('Gönderim verisi bulunamadı');
            return;
        }

        const maxCount = Math.max(...this.submissionTrend.map((d) => d.count), 1);

        container.innerHTML = `
            <div class="flex items-end justify-between h-48 gap-2 px-2">
                ${this.submissionTrend
                    .map((day) => {
                        const height = (day.count / maxCount) * 100;
                        return `
                        <div class="flex-1 flex flex-col items-center gap-1">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">${day.count}</span>
                            <div class="w-full bg-theme/20 rounded-t-lg transition-all hover:bg-theme/30 relative group"
                                 style="height: ${Math.max(height, 5)}%">
                                <div class="absolute inset-0 bg-theme rounded-t-lg" style="height: 100%"></div>
                            </div>
                            <span class="text-xs text-gray-500 dark:text-gray-400 text-center">${day.label}</span>
                        </div>
                    `;
                    })
                    .join('')}
            </div>
        `;
    },

    /**
     * Status distribution (CSS-based donut/pie)
     */
    renderStatusDistribution() {
        const container = document.getElementById('statusDistributionChart');
        if (!container || !this.statusDistribution) return;

        const total = Object.values(this.statusDistribution).reduce((a, b) => a + b, 0);

        if (total === 0) {
            container.innerHTML = this.renderEmptyState('Henüz gönderim yok');
            return;
        }

        const items = [
            { label: 'Bekliyor', value: this.statusDistribution.submitted, color: 'bg-yellow-500' },
            { label: 'Notlandı', value: this.statusDistribution.graded, color: 'bg-green-500' },
            { label: 'Geç Gönderim', value: this.statusDistribution.late_submitted, color: 'bg-orange-500' },
            { label: 'Taslak', value: this.statusDistribution.draft, color: 'bg-gray-400' },
            { label: 'Revizyon', value: this.statusDistribution.revision_requested, color: 'bg-purple-500' },
        ].filter((item) => item.value > 0);

        container.innerHTML = `
            <div class="flex items-center gap-6">
                <!-- Simple horizontal bars -->
                <div class="flex-grow space-y-3">
                    ${items
                        .map((item) => {
                            const percentage = Math.round((item.value / total) * 100);
                            return `
                            <div class="flex items-center gap-3">
                                <span class="w-24 text-sm text-gray-600 dark:text-gray-400">${item.label}</span>
                                <div class="flex-grow h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div class="${item.color} h-full rounded-full transition-all" style="width: ${percentage}%"></div>
                                </div>
                                <span class="w-12 text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">${item.value}</span>
                            </div>
                        `;
                        })
                        .join('')}
                </div>
            </div>
            <div class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                Toplam: ${total} gönderim
            </div>
        `;
    },

    /**
     * Classroom performance table
     */
    renderClassroomPerformance() {
        const container = document.getElementById('classroomPerformanceTable');
        if (!container) return;

        if (!this.classroomPerformance || this.classroomPerformance.length === 0) {
            container.innerHTML = this.renderEmptyState('Sınıf bulunamadı');
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th class="pb-3 font-semibold">Sınıf</th>
                            <th class="pb-3 font-semibold text-center">Öğrenci</th>
                            <th class="pb-3 font-semibold text-center">Ödev</th>
                            <th class="pb-3 font-semibold text-center">Gönderim</th>
                            <th class="pb-3 font-semibold text-center">Ort. Puan</th>
                            <th class="pb-3 font-semibold text-center">Teslim Oranı</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        ${this.classroomPerformance
                            .map(
                                (classroom) => `
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="py-3">
                                    <div class="flex items-center gap-2">
                                        <span class="text-lg">🏫</span>
                                        <span class="font-medium text-gray-800 dark:text-white">${classroom.name}</span>
                                    </div>
                                </td>
                                <td class="py-3 text-center text-gray-600 dark:text-gray-400">${classroom.studentCount}</td>
                                <td class="py-3 text-center text-gray-600 dark:text-gray-400">${classroom.assignmentCount}</td>
                                <td class="py-3 text-center text-gray-600 dark:text-gray-400">${classroom.submissionCount}</td>
                                <td class="py-3 text-center">
                                    <span class="px-2 py-1 rounded-full text-sm font-semibold ${this.getScoreColor(classroom.averageScore)}">
                                        ${classroom.averageScore}%
                                    </span>
                                </td>
                                <td class="py-3 text-center">
                                    <div class="flex items-center justify-center gap-2">
                                        <div class="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div class="h-full bg-theme rounded-full" style="width: ${classroom.submissionRate}%"></div>
                                        </div>
                                        <span class="text-sm text-gray-600 dark:text-gray-400">${classroom.submissionRate}%</span>
                                    </div>
                                </td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Top students list
     */
    renderTopStudents() {
        const container = document.getElementById('topStudentsList');
        if (!container) return;

        if (!this.topStudents || this.topStudents.length === 0) {
            container.innerHTML = this.renderEmptyState('Henüz öğrenci verisi yok');
            return;
        }

        container.innerHTML = `
            <div class="space-y-3">
                ${this.topStudents
                    .map((student, index) => {
                        const medals = ['🥇', '🥈', '🥉'];
                        const medal = index < 3 ? medals[index] : `${index + 1}.`;
                        const avatarHtml =
                            student.avatar && !student.avatar.startsWith('�')
                                ? `<img src="${student.avatar}" class="w-10 h-10 rounded-full object-cover">`
                                : `<span class="text-xl">${student.avatar || '👤'}</span>`;

                        return `
                        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <span class="text-lg w-8 text-center">${medal}</span>
                            <div class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                ${avatarHtml}
                            </div>
                            <div class="flex-grow">
                                <p class="font-medium text-gray-800 dark:text-white">${student.name}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${student.submissionCount} gönderim</p>
                            </div>
                            <div class="text-right">
                                <p class="font-bold text-theme">${student.averageScore}%</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">ortalama</p>
                            </div>
                        </div>
                    `;
                    })
                    .join('')}
            </div>
        `;
    },

    /**
     * Recent activity list
     */
    renderRecentActivity() {
        const container = document.getElementById('recentActivityList');
        if (!container) return;

        if (!this.recentActivity || this.recentActivity.length === 0) {
            container.innerHTML = this.renderEmptyState('Henüz aktivite yok');
            return;
        }

        container.innerHTML = `
            <div class="space-y-3 max-h-80 overflow-y-auto">
                ${this.recentActivity
                    .map((activity) => {
                        const isGraded = activity.type === 'graded';
                        const icon = isGraded ? '✅' : '📥';
                        const timeAgo = this.formatTimeAgo(activity.createdAt);
                        const avatarHtml =
                            activity.studentAvatar && !activity.studentAvatar.startsWith('�')
                                ? `<img src="${activity.studentAvatar}" class="w-8 h-8 rounded-full object-cover">`
                                : `<span class="text-sm">${activity.studentAvatar || '👤'}</span>`;

                        return `
                        <div class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                ${avatarHtml}
                            </div>
                            <div class="flex-grow min-w-0">
                                <p class="text-sm text-gray-800 dark:text-white">
                                    <span class="font-medium">${activity.studentName}</span>
                                    <span class="text-gray-500 dark:text-gray-400">
                                        ${isGraded ? 'puanlandı' : 'gönderim yaptı'}
                                    </span>
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">${activity.assignmentTitle}</p>
                            </div>
                            <div class="text-right shrink-0">
                                ${
                                    isGraded && activity.score !== null
                                        ? `
                                    <span class="text-sm font-semibold text-theme">${activity.score}%</span>
                                `
                                        : `
                                    <span class="text-lg">${icon}</span>
                                `
                                }
                                <p class="text-xs text-gray-400">${timeAgo}</p>
                            </div>
                        </div>
                    `;
                    })
                    .join('')}
            </div>
        `;
    },

    /**
     * Assignment stats table
     */
    renderAssignmentStats() {
        const container = document.getElementById('assignmentStatsTable');
        if (!container) return;

        if (!this.assignmentStats || this.assignmentStats.length === 0) {
            container.innerHTML = this.renderEmptyState('Henüz ödev oluşturulmadı');
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                            <th class="pb-3 font-semibold">Ödev</th>
                            <th class="pb-3 font-semibold">Sınıf</th>
                            <th class="pb-3 font-semibold text-center">Durum</th>
                            <th class="pb-3 font-semibold text-center">Gönderim</th>
                            <th class="pb-3 font-semibold text-center">Ort. Puan</th>
                            <th class="pb-3 font-semibold text-center">Geç</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        ${this.assignmentStats
                            .map(
                                (assignment) => `
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="py-3">
                                    <p class="font-medium text-gray-800 dark:text-white line-clamp-1">${assignment.title}</p>
                                    ${
                                        assignment.dueDate
                                            ? `
                                        <p class="text-xs text-gray-500 dark:text-gray-400">
                                            📅 ${new Date(assignment.dueDate).toLocaleDateString('tr-TR')}
                                        </p>
                                    `
                                            : ''
                                    }
                                </td>
                                <td class="py-3 text-sm text-gray-600 dark:text-gray-400">${assignment.classroomName}</td>
                                <td class="py-3 text-center">
                                    ${this.renderStatusBadge(assignment.status)}
                                </td>
                                <td class="py-3 text-center">
                                    <span class="text-gray-600 dark:text-gray-400">
                                        ${assignment.submissionCount}/${assignment.studentCount}
                                    </span>
                                    <span class="text-xs text-gray-400 ml-1">(${assignment.submissionRate}%)</span>
                                </td>
                                <td class="py-3 text-center">
                                    ${
                                        assignment.averageScore !== null
                                            ? `
                                        <span class="font-semibold ${this.getScoreColor(assignment.averageScore)}">${assignment.averageScore}%</span>
                                    `
                                            : `
                                        <span class="text-gray-400">-</span>
                                    `
                                    }
                                </td>
                                <td class="py-3 text-center">
                                    ${
                                        assignment.lateSubmissions > 0
                                            ? `
                                        <span class="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                                            ${assignment.lateSubmissions}
                                        </span>
                                    `
                                            : `
                                        <span class="text-gray-400">-</span>
                                    `
                                    }
                                </td>
                            </tr>
                        `
                            )
                            .join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    /**
     * Empty state helper
     */
    renderEmptyState(message) {
        return `
            <div class="flex flex-col items-center justify-center py-8 text-gray-400">
                <span class="text-4xl mb-2">📭</span>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Status badge helper
     */
    renderStatusBadge(status) {
        const badges = {
            draft: { label: 'Taslak', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
            published: {
                label: 'Aktif',
                class: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
            },
            closed: { label: 'Kapalı', class: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
        };
        const badge = badges[status] || badges['draft'];
        return `<span class="px-2 py-0.5 rounded-full text-xs font-medium ${badge.class}">${badge.label}</span>`;
    },

    /**
     * Score color helper
     */
    getScoreColor(score) {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        if (score >= 40) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    },

    /**
     * Time ago helper
     */
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk`;
        if (diffHours < 24) return `${diffHours} saat`;
        if (diffDays < 7) return `${diffDays} gün`;

        return date.toLocaleDateString('tr-TR');
    },
};

window.AnalyticsSection = AnalyticsSection;
