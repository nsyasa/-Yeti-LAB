/**
 * DashboardSection - Teacher dashboard içeriği (Kompakt tasarım)
 */
const DashboardSection = {
    render() {
        return `
            <div class="space-y-3">
                <!-- Stats Bar (Kompakt tek satır) -->
                <div class="flex flex-wrap gap-2 mb-3">
                    <div class="teacher-stat-card stat-classrooms">
                        <span class="stat-icon">🏫</span>
                        <span class="stat-value" id="statClassrooms">0</span>
                        <span class="stat-label">Sınıf</span>
                    </div>
                    <div class="teacher-stat-card stat-students">
                        <span class="stat-icon">👨‍🎓</span>
                        <span class="stat-value" id="statStudents">0</span>
                        <span class="stat-label">Öğrenci</span>
                    </div>
                    <div class="teacher-stat-card stat-active">
                        <span class="stat-icon">⚡</span>
                        <span class="stat-value" id="statActiveToday">0</span>
                        <span class="stat-label">Aktif Bugün</span>
                    </div>
                    <div class="teacher-stat-card stat-completed">
                        <span class="stat-icon">✓</span>
                        <span class="stat-value" id="statCompletedLessons">0</span>
                        <span class="stat-label">Tamamlanan</span>
                    </div>
                </div>

                <!-- Sınıflarım Özet -->
                <div class="glass-card rounded-xl p-4">
                    <h3 class="text-base font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        🏫 Sınıflarım
                    </h3>
                    <div id="dashboardClassroomsList" class="space-y-1.5">
                        <div class="empty-state py-4">
                            <div class="icon text-2xl mb-1">🏫</div>
                            <p class="text-gray-500 text-sm">Henüz sınıf oluşturmadınız</p>
                            <p class="text-xs text-gray-400 mt-0.5">Üst menüden "Yeni Sınıf" butonuna tıklayın</p>
                        </div>
                    </div>
                </div>

                <!-- Son Aktiviteler -->
                <div class="glass-card rounded-xl p-4">
                    <h3 class="text-base font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        📋 Son Aktiviteler
                    </h3>
                    <div id="recentActivity" class="space-y-2">
                        <div class="empty-state py-3">
                            <div class="icon text-2xl mb-1">📭</div>
                            <p class="text-gray-400 text-sm">Henüz aktivite yok</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
};

window.DashboardSection = DashboardSection;
