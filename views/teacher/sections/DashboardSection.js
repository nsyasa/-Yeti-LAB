/**
 * DashboardSection - Teacher Dashboard (Single Screen Layout)
 * Compact stats + 2-column layout (Sınıflar + Aktiviteler)
 */
const DashboardSection = {
    render() {
        return `
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Stats Bar (Compact horizontal) -->
                <div class="flex flex-wrap gap-2 mb-4 flex-shrink-0">
                    <div class="teacher-stat-badge stat-classrooms">
                        <span class="stat-icon">🏫</span>
                        <span class="stat-value" id="statClassrooms">0</span>
                        <span class="stat-label">Sınıf</span>
                    </div>
                    <div class="teacher-stat-badge stat-students">
                        <span class="stat-icon">👨‍🎓</span>
                        <span class="stat-value" id="statStudents">0</span>
                        <span class="stat-label">Öğrenci</span>
                    </div>
                    <div class="teacher-stat-badge stat-active">
                        <span class="stat-icon">⚡</span>
                        <span class="stat-value" id="statActiveToday">0</span>
                        <span class="stat-label">Aktif</span>
                    </div>
                    <div class="teacher-stat-badge stat-completed">
                        <span class="stat-icon">✓</span>
                        <span class="stat-value" id="statCompletedLessons">0</span>
                        <span class="stat-label">Tamamlanan</span>
                    </div>
                </div>

                <!-- Main Content: 2-Column Layout -->
                <div class="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-0 overflow-hidden">
                    
                    <!-- Left Column: Sınıflarım (3/5) -->
                    <div class="lg:col-span-3 flex flex-col min-h-0 overflow-hidden">
                        <div class="teacher-panel-card flex-1 flex flex-col overflow-hidden">
                            <div class="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    🏫 Sınıflarım
                                </h3>
                                <button onclick="TeacherView?.showSection('classrooms'); setTimeout(() => ClassroomManager?.toggleNewClassForm(), 100);"
                                    class="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors font-medium relative z-50">
                                    + Yeni
                                </button>
                            </div>
                            <div id="dashboardClassroomsList" class="flex-1 overflow-y-auto p-3 space-y-2">
                                <div class="empty-state py-6">
                                    <div class="icon text-3xl mb-2">🏫</div>
                                    <p class="text-slate-500 dark:text-slate-400 text-sm">Henüz sınıf oluşturmadınız</p>
                                    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">Sağ üstteki "Yeni Sınıf" butonuna tıklayın</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column: Son Aktiviteler (2/5) -->
                    <div class="lg:col-span-2 flex flex-col min-h-0 overflow-hidden">
                        <div class="teacher-panel-card flex-1 flex flex-col overflow-hidden">
                            <div class="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <h3 class="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    📋 Son Aktiviteler
                                </h3>
                                <span class="text-xs text-slate-400">Son 7 gün</span>
                            </div>
                            <div id="recentActivity" class="flex-1 overflow-y-auto p-3 space-y-2">
                                <div class="empty-state py-6">
                                    <div class="icon text-3xl mb-2">📭</div>
                                    <p class="text-slate-400 dark:text-slate-500 text-sm">Henüz aktivite yok</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
    },
};

window.DashboardSection = DashboardSection;
