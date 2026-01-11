/**
 * ClassroomsSection - Sınıf listesi section'ı
 */
const ClassroomsSection = {
    render() {
        return `
            <div class="space-y-3">
                <div class="mb-2">
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        💡 Öğrencileriniz sınıf kodunu kullanarak katılabilir
                    </p>
                </div>

                <div id="classroomsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <!-- Classrooms will be rendered here by ClassroomManager -->
                </div>
            </div>
        `;
    },
};

window.ClassroomsSection = ClassroomsSection;
