/**
 * DashboardSection - Teacher dashboard içeriği (Kompakt tasarım)
 */
const DashboardSection = {
    render() {
        return `
            <div class="space-y-6">
                <!-- Stats Bar (Kompakt tek satır) -->
                <div class="flex flex-wrap gap-3 mb-6">
                    <div class="px-4 py-2 rounded-xl shadow-md flex items-center gap-2" style="background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); color: white;">
                        <span class="text-lg">🏫</span>
                        <span class="font-bold" id="statClassrooms">0</span>
                        <span class="text-sm" style="opacity: 0.9;">Sınıf</span>
                    </div>
                    <div class="px-4 py-2 rounded-xl shadow-md flex items-center gap-2" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white;">
                        <span class="text-lg">👨‍🎓</span>
                        <span class="font-bold" id="statStudents">0</span>
                        <span class="text-sm" style="opacity: 0.9;">Öğrenci</span>
                    </div>
                    <div class="px-4 py-2 rounded-xl shadow-md flex items-center gap-2" style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: white;">
                        <span class="text-lg">⚡</span>
                        <span class="font-bold" id="statActiveToday">0</span>
                        <span class="text-sm" style="opacity: 0.9;">Aktif Bugün</span>
                    </div>
                    <div class="px-4 py-2 rounded-xl shadow-md flex items-center gap-2" style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white;">
                        <span class="text-lg">✓</span>
                        <span class="font-bold" id="statCompletedLessons">0</span>
                        <span class="text-sm" style="opacity: 0.9;">Tamamlanan</span>
                    </div>
                </div>

                <!-- Sınıflarım Özet -->
                <div class="glass-card rounded-2xl p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            🏫 Sınıflarım
                        </h3>
                        <button onclick="TeacherManager?.openCreateClassroomModal()"
                            class="text-sm text-theme hover:underline font-semibold">
                            + Yeni Sınıf
                        </button>
                    </div>
                    <div id="dashboardClassroomsList" class="space-y-2">
                        <div class="empty-state py-8">
                            <div class="icon text-4xl mb-2">🏫</div>
                            <p class="text-gray-500">Henüz sınıf oluşturmadınız</p>
                            <button onclick="TeacherManager?.openCreateClassroomModal()"
                                class="mt-3 px-4 py-2 bg-theme text-white rounded-lg text-sm font-semibold hover:brightness-110 transition">
                                İlk Sınıfı Oluştur
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Son Aktiviteler -->
                <div class="glass-card rounded-2xl p-5">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        📋 Son Aktiviteler
                    </h3>
                    <div id="recentActivity" class="space-y-3">
                        <div class="empty-state py-6">
                            <div class="icon text-3xl mb-2">📭</div>
                            <p class="text-gray-400 text-sm">Henüz aktivite yok</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
};

window.DashboardSection = DashboardSection;
