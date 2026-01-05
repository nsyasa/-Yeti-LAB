/**
 * StudentsSection - Öğrenci listesi section'ı
 */
const StudentsSection = {
    render() {
        return `
            <div class="space-y-6">
                <!-- Filter by Classroom -->
                <div class="flex flex-wrap gap-4 items-center">
                    <label class="text-gray-600 dark:text-gray-400">Sınıf Filtresi:</label>
                    <select id="classroomFilter"
                        class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-theme focus:ring-2 focus:ring-theme/20 dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                        <option value="all">Tüm Sınıflar</option>
                    </select>
                    <button onclick="TeacherManager?.printStudentList()"
                        class="ml-auto bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        title="Öğrenci Şifre Listesini Yazdır">
                        <span>🖨️</span>
                        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Şifre Listesini Yazdır</span>
                    </button>
                </div>

                <div id="studentsList" class="space-y-3">
                    <!-- Students will be rendered here by StudentManager -->
                </div>
            </div>
        `;
    },
};

window.StudentsSection = StudentsSection;
