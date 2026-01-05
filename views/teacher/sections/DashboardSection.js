/**
 * DashboardSection - Teacher dashboard içeriği
 */
const DashboardSection = {
    render() {
        return `
            <div class="space-y-6">
                <!-- Stats Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="stat-card animate-fade-in-up">
                        <p class="text-white/80 text-sm mb-1">Toplam Sınıf</p>
                        <p id="statClassrooms" class="text-3xl font-bold">0</p>
                    </div>
                    <div class="stat-card secondary animate-fade-in-up delay-100">
                        <p class="text-white/80 text-sm mb-1">Toplam Öğrenci</p>
                        <p id="statStudents" class="text-3xl font-bold">0</p>
                    </div>
                    <div class="stat-card warning animate-fade-in-up delay-200">
                        <p class="text-white/80 text-sm mb-1">Aktif Bugün</p>
                        <p id="statActiveToday" class="text-3xl font-bold">0</p>
                    </div>
                    <div class="stat-card success animate-fade-in-up delay-300">
                        <p class="text-white/80 text-sm mb-1">Tamamlanan Ders</p>
                        <p id="statCompletedLessons" class="text-3xl font-bold">0</p>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="glass-card rounded-2xl p-6">
                    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">📋 Son Aktiviteler</h3>
                    <div id="recentActivity" class="space-y-3">
                        <div class="empty-state">
                            <div class="icon">📭</div>
                            <p>Henüz aktivite yok</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="TeacherManager?.openCreateClassroomModal()"
                        class="glass-card rounded-2xl p-6 text-left hover:border-theme transition-colors group">
                        <span class="text-3xl mb-3 block group-hover:scale-110 transition-transform">🏫</span>
                        <h4 class="font-bold text-gray-800 dark:text-white">Sınıf Oluştur</h4>
                        <p class="text-sm text-gray-500 mt-1">Yeni bir sınıf oluştur ve öğrenci ekle</p>
                    </button>
                    <button onclick="TeacherView.showSection('students')"
                        class="glass-card rounded-2xl p-6 text-left hover:border-theme transition-colors group">
                        <span class="text-3xl mb-3 block group-hover:scale-110 transition-transform">👨‍🎓</span>
                        <h4 class="font-bold text-gray-800 dark:text-white">Öğrenci Listesi</h4>
                        <p class="text-sm text-gray-500 mt-1">Tüm öğrencilerinizi görüntüle</p>
                    </button>
                    <a href="#/" onclick="Router.navigate('/')"
                        class="glass-card rounded-2xl p-6 text-left hover:border-theme transition-colors group">
                        <span class="text-3xl mb-3 block group-hover:scale-110 transition-transform">🎮</span>
                        <h4 class="font-bold text-gray-800 dark:text-white">Ders Platformu</h4>
                        <p class="text-sm text-gray-500 mt-1">Ana eğitim platformuna git</p>
                    </a>
                </div>
            </div>
        `;
    },
};

window.DashboardSection = DashboardSection;
