/**
 * ClassroomsSection - Sınıf listesi section'ı
 */
const ClassroomsSection = {
    render() {
        return `
            <div class="space-y-6">
                <div class="flex justify-between items-center">
                    <p class="text-gray-600 dark:text-gray-400">
                        Öğrencileriniz için sınıflar oluşturun ve kod paylaşın
                    </p>
                    <button onclick="TeacherManager?.openCreateClassroomModal()"
                        class="flex items-center gap-2 px-4 py-2 bg-theme text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                        <span>+</span>
                        <span>Yeni Sınıf</span>
                    </button>
                </div>

                <div id="classroomsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Classrooms will be rendered here by ClassroomManager -->
                </div>
            </div>
        `;
    },
};

window.ClassroomsSection = ClassroomsSection;
