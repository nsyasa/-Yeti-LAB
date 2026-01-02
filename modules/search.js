/**
 * Search Module
 * Handles global search across all courses.
 *
 * Usage:
 *   Search.handle(query)                     - Filter and display results
 *   Search.navigate(courseKey, projectId)   - Navigate to a specific project
 */

const Search = {
    // Reference to app functions (set on init)
    _selectCourse: null,
    _loadProject: null,

    init: (selectCourseFn, loadProjectFn) => {
        Search._selectCourse = selectCourseFn;
        Search._loadProject = loadProjectFn;

        // Bind events
        const input = document.getElementById('searchInput');
        const results = document.getElementById('searchResults');

        if (input) {
            input.addEventListener('input', (e) => Search.handle(e.target.value));
            input.addEventListener('blur', () => {
                setTimeout(() => results?.classList.add('hidden'), 200);
            });
            input.addEventListener('focus', () => {
                if (input.value.trim().length >= 2) {
                    results?.classList.remove('hidden');
                }
            });
        }
    },

    handle: (query) => {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        const q = query.trim().toLowerCase();

        if (q.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }

        const courseData = window.courseData || {};
        const results = [];

        Object.keys(courseData).forEach((courseKey) => {
            const course = courseData[courseKey];
            if (!course.data?.projects) return;

            course.data.projects.forEach((project) => {
                const searchable = `${project.title} ${project.desc} ${project.mission || ''}`.toLowerCase();
                if (searchable.includes(q)) {
                    results.push({
                        courseKey,
                        courseTitle: course.title,
                        id: project.id,
                        title: project.title,
                        icon: project.icon,
                    });
                }
            });
        });

        if (results.length > 0) {
            resultsContainer.innerHTML = results
                .slice(0, 8)
                .map(
                    (r) => `
                <div onclick="Search.navigate('${r.courseKey}', ${r.id})" 
                     class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 flex items-start">
                    <div class="text-2xl mr-3 bg-gray-100 p-2 rounded">${r.icon || '📝'}</div>
                    <div>
                        <div class="font-bold text-gray-800 text-sm">${r.title}</div>
                        <div class="text-xs text-gray-500">${r.courseTitle}</div>
                    </div>
                </div>
            `
                )
                .join('');
            resultsContainer.classList.remove('hidden');
        } else {
            resultsContainer.innerHTML = '<div class="p-4 text-sm text-gray-500 text-center">Sonuç bulunamadı.</div>';
            resultsContainer.classList.remove('hidden');
        }
    },

    navigate: (courseKey, projectId) => {
        // Close dropdown
        const resultsContainer = document.getElementById('searchResults');
        const input = document.getElementById('searchInput');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        if (input) input.value = '';

        // Close mobile search if open
        const mobileOverlay = document.getElementById('mobile-search-overlay');
        if (mobileOverlay && !mobileOverlay.classList.contains('hidden')) {
            app.toggleMobileSearch();
        }

        // Select course then load project
        if (Search._selectCourse) Search._selectCourse(courseKey);
        if (Search._loadProject) Search._loadProject(projectId);
    },

    // Mobile search handler - renders results in mobile overlay
    handleMobile: (query) => {
        const resultsContainer = document.getElementById('mobileSearchResults');
        if (!resultsContainer) return;

        const q = query.trim().toLowerCase();

        if (q.length < 2) {
            resultsContainer.innerHTML = '<div class="text-center text-gray-400 py-8">En az 2 karakter girin...</div>';
            return;
        }

        const courseData = window.courseData || {};
        const results = [];

        Object.keys(courseData).forEach((courseKey) => {
            const course = courseData[courseKey];
            if (!course.data?.projects) return;

            course.data.projects.forEach((project) => {
                const searchable = `${project.title} ${project.desc} ${project.mission || ''}`.toLowerCase();
                if (searchable.includes(q)) {
                    results.push({
                        courseKey,
                        courseTitle: course.title,
                        id: project.id,
                        title: project.title,
                        icon: project.icon,
                    });
                }
            });
        });

        if (results.length > 0) {
            resultsContainer.innerHTML = results
                .slice(0, 10)
                .map(
                    (r) => `
                <div onclick="Search.navigate('${r.courseKey}', ${r.id})" 
                     class="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center active:bg-gray-50 cursor-pointer">
                    <div class="text-3xl mr-4 bg-gray-100 p-3 rounded-lg">${r.icon || '📝'}</div>
                    <div>
                        <div class="font-bold text-gray-800">${r.title}</div>
                        <div class="text-sm text-gray-500">${r.courseTitle}</div>
                    </div>
                </div>
            `
                )
                .join('');
        } else {
            resultsContainer.innerHTML = '<div class="text-center text-gray-500 py-8">🔍 Sonuç bulunamadı</div>';
        }
    },
};

// Export for global access
window.Search = Search;
