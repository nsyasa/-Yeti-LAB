/**
 * ClassroomsSection - Sınıf listesi section'ı (Single Screen Layout)
 * Kendi içinde scroll eden grid yapısı
 */
const ClassroomsSection = {
    render() {
        return `
            <div class="h-full flex flex-col p-4 pb-20 lg:pb-4">
                
                <!-- Header -->
                <div class="flex flex-wrap items-center justify-between gap-3 mb-4 flex-shrink-0">
                    <div class="flex items-center gap-2">
                        <p class="text-slate-600 dark:text-slate-400 text-sm">
                            💡 Öğrencileriniz sınıf kodunu kullanarak katılabilir
                        </p>
                    </div>
                    <button onclick="TeacherManager?.openCreateClassroomModal()"
                        class="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold text-xs hover:brightness-110 transition-all shadow-sm shadow-emerald-500/30 relative z-50">
                        <span>+</span>
                        <span>Yeni Sınıf</span>
                    </button>
                </div>

                <!-- Classrooms Grid with internal scroll -->
                <div class="flex-1 overflow-y-auto min-h-0">
                    <div id="classroomsList" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        <!-- Classrooms will be rendered here by ClassroomManager -->
                        <div class="col-span-full teacher-panel-card p-8 text-center">
                            <div class="text-3xl mb-2">🏫</div>
                            <p class="text-slate-500 dark:text-slate-400 text-sm">Sınıflar yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
};

window.ClassroomsSection = ClassroomsSection;
