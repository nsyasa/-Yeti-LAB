/**
 * StudentsSection - Öğrenci listesi section'ı
 */
const StudentsSection = {
    render() {
        return `
            <div class="space-y-3">
                <!-- Filter by Classroom -->
                <div class="flex flex-wrap gap-2 items-center">
                    <label class="text-gray-600 dark:text-gray-400 text-sm">Sınıf:</label>
                    <select id="classroomFilter"
                        class="px-3 py-1.5 border border-gray-200 rounded-lg focus:border-theme focus:ring-1 focus:ring-theme/20 dark:bg-gray-800 dark:border-gray-600 dark:text-white text-sm">
                        <option value="all">Tüm Sınıflar</option>
                    </select>
                    <button onclick="TeacherManager?.printStudentList()"
                        class="ml-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                        title="Öğrenci Şifre Listesini Yazdır">
                        <span>🖨️</span>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Şifre Listesi</span>
                    </button>
                </div>

                <div id="studentsList" class="space-y-1">
                    <!-- Students will be rendered here by StudentManager -->
                </div>
            </div>
        `;
    },
};

window.StudentsSection = StudentsSection;
