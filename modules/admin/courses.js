/**
 * Course Manager Module
 * Handles creating, updating, deleting, and reordering courses.
 */

const CourseManager = {
    // State
    courses: [],

    init() {

        // Pre-load current manifest as array
        this.refreshList();
    },

    refreshList() {
        this.courses = [];

        // Priority 1: Use admin.allCourseData (Supabase data)
        if (typeof admin !== 'undefined' && admin.allCourseData && Object.keys(admin.allCourseData).length > 0) {
            this.courses = Object.entries(admin.allCourseData).map(([key, data]) => ({
                key,
                title: data.title || key,
                description: data.description || '',
                icon: data.icon || '📦',
                position: data._position !== undefined ? data._position : 999,
                _supabaseId: data._supabaseId
            }));
        }
        // Fallback: CourseLoader manifest
        else if (typeof CourseLoader !== 'undefined') {
            const manifest = CourseLoader.getManifest();
            this.courses = Object.entries(manifest).map(([key, data]) => ({
                key,
                title: data.title || key,
                description: data.description || '',
                icon: data.icon || '📦',
                position: data.position !== undefined ? data.position : 999
            }));
        }

        // Sort by position (ascending)
        this.courses.sort((a, b) => {
            const posA = a.position !== undefined ? a.position : 999;
            const posB = b.position !== undefined ? b.position : 999;
            return posA - posB;
        });

    },

    // --- INLINE COURSE SELECTOR GRID ---
    renderSelectorGrid() {
        const container = document.getElementById('course-selector-grid');
        if (!container) return;

        // refreshList is called externally, just use this.courses directly

        if (this.courses.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-4">Kayıtlı kurs yok.</div>';
            return;
        }

        const currentKey = admin.currentCourseKey;

        container.innerHTML = this.courses.map((c, index) => {
            const isActive = c.key === currentKey;
            const isFirst = index === 0;
            const isLast = index === this.courses.length - 1;

            return `
            <div class="relative group">
                <button type="button" onclick="CourseManager.selectCourse('${c.key}')"
                    class="w-full p-3 rounded-lg border-2 transition text-left ${isActive
                    ? 'border-theme bg-theme/10 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow'}">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">${c.icon || '📦'}</span>
                        <div class="flex-1 min-w-0">
                            <div class="font-bold text-sm text-gray-800 truncate">${c.title}</div>
                            <div class="text-xs text-gray-400 font-mono truncate">${c.key}</div>
                        </div>
                    </div>
                </button>
                <!-- Reorder buttons (on hover) -->
                <div class="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onclick="event.stopPropagation(); CourseManager.moveUp(${index})" 
                        class="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs ${isFirst ? 'invisible' : ''}"
                        title="Yukarı">↑</button>
                    <button type="button" onclick="event.stopPropagation(); CourseManager.moveDown(${index})" 
                        class="w-5 h-5 rounded bg-gray-200 hover:bg-gray-300 text-xs ${isLast ? 'invisible' : ''}"
                        title="Aşağı">↓</button>
                </div>
            </div>`;
        }).join('');
    },

    selectCourse(key) {
        if (typeof admin !== 'undefined' && admin.changeCourse) {
            admin.changeCourse(key);
            this.renderSelectorGrid(); // Update active state
        }
    },

    showInlineAddForm() {
        const form = document.getElementById('inline-add-course-form');
        if (form) {
            form.classList.remove('hidden');
            document.getElementById('inline-course-icon').value = '📚';
            document.getElementById('inline-course-title').value = '';
            document.getElementById('inline-course-key').value = '';
            document.getElementById('inline-course-desc').value = '';
            document.getElementById('inline-course-title').focus();
        }
    },

    hideInlineAddForm() {
        const form = document.getElementById('inline-add-course-form');
        if (form) form.classList.add('hidden');
    },

    async createFromInline() {
        const icon = document.getElementById('inline-course-icon').value || '📚';
        const title = document.getElementById('inline-course-title').value;
        let key = document.getElementById('inline-course-key').value;
        const desc = document.getElementById('inline-course-desc').value;

        // Auto-format key
        if (key) {
            key = key.toLowerCase().trim()
                .replace(/_/g, '-')
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9-]/g, '');
            document.getElementById('inline-course-key').value = key;
        }

        if (!title || !key) {
            alert('Lütfen başlık ve anahtar alanlarını doldurun.');
            return;
        }

        if (!/^[a-z0-9-]+$/.test(key)) {
            alert('Anahtar sadece küçük harf, rakam ve tire içerebilir.');
            return;
        }

        if (this.courses.find(c => c.key === key)) {
            alert('Bu anahtara sahip bir kurs zaten var.');
            return;
        }

        try {
            if (typeof admin !== 'undefined' && admin.showLoading) {
                admin.showLoading('Kurs oluşturuluyor...');
            }

            let courseId = null;

            // Create in Supabase
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client) {
                const { data, error } = await SupabaseClient.client
                    .from('courses')
                    .insert({
                        slug: key,
                        title: title,
                        description: desc,
                        meta: { icon },
                        is_published: true,
                        position: this.courses.length
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                courseId = data.id;

                // Create default phase
                await SupabaseClient.client
                    .from('phases')
                    .insert({
                        course_id: courseId,
                        name: 'Başlangıç',
                        description: 'İlk adımlar',
                        position: 0,
                        meta: { color: 'blue', icon: '🚀' }
                    });
            }

            // Add to local course data
            if (typeof admin !== 'undefined') {
                admin.allCourseData[key] = {
                    title: title,
                    description: desc,
                    icon: icon,
                    _supabaseId: courseId,
                    _phaseIds: {},
                    _projectIds: {},
                    data: {
                        phases: [{ color: 'blue', title: 'Başlangıç', description: 'İlk adımlar', icon: '🚀' }],
                        projects: [],
                        componentInfo: {}
                    }
                };
            }

            this.hideInlineAddForm();
            this.renderSelectorGrid();

            // Switch to new course
            if (typeof admin !== 'undefined' && admin.changeCourse) {
                await admin.changeCourse(key);
            }

            alert(`✅ "${title}" kursu oluşturuldu!`);

        } catch (e) {
            console.error(e);
            alert('Kurs oluşturulurken hata oluştu: ' + e.message);
        } finally {
            if (typeof admin !== 'undefined' && admin.hideLoading) {
                admin.hideLoading();
            }
        }
    },

    // --- UI RENDERING ---

    renderManagementModal() {
        const modalId = 'course-management-modal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            // Create modal if not exists
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center hidden';
            modal.innerHTML = `
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <!-- Header -->
                    <div class="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h3 class="text-xl font-bold text-gray-800">Kurs Yönetimi</h3>
                        <button onclick="CourseManager.closeModal()" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                    </div>

                    <!-- Content -->
                    <div class="p-6 overflow-y-auto flex-1">
                        
                        <!-- Actions -->
                        <div class="mb-6 flex justify-end">
                            <button onclick="CourseManager.showAddForm()" class="px-4 py-2 bg-theme text-white rounded-lg hover:bg-theme-dark flex items-center gap-2">
                                <span>➕</span> Yeni Kurs Ekle
                            </button>
                        </div>

                        <!-- Course List -->
                        <div id="course-list-container" class="space-y-3">
                            <!-- Populated by JS -->
                        </div>

                        <!-- Add Form (Hidden by default) -->
                        <div id="add-course-form" class="hidden mt-6 p-4 border rounded-lg bg-gray-50">
                            <h4 class="font-bold mb-4">Yeni Kurs Ekle</h4>
                            <div class="space-y-3">
                                <input type="text" id="new-course-title" placeholder="Kurs Başlığı" class="w-full p-2 border rounded">
                                <input type="text" id="new-course-key" placeholder="Kurs Anahtarı (örn: arduino-advanced)" class="w-full p-2 border rounded">
                                <input type="text" id="new-course-desc" placeholder="Açıklama" class="w-full p-2 border rounded">
                                <div class="flex gap-2">
                                    <input type="text" id="new-course-icon" placeholder="Emoji İkonu" class="w-20 p-2 border rounded text-center text-xl">
                                    <input type="color" id="new-course-color" value="#3b82f6" class="h-10 w-20 p-1 border rounded cursor-pointer">
                                </div>
                                <div class="flex justify-end gap-2 mt-4">
                                    <button onclick="CourseManager.hideAddForm()" class="px-3 py-1 text-gray-500 hover:bg-gray-200 rounded">İptal</button>
                                    <button onclick="CourseManager.createCourse()" class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">Oluştur</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        this.renderList();
        modal.classList.remove('hidden');
    },

    closeModal() {
        const modal = document.getElementById('course-management-modal');
        if (modal) modal.classList.add('hidden');
    },

    renderList() {
        const container = document.getElementById('course-list-container');
        if (!container) return;

        this.refreshList();

        if (this.courses.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 py-4">Kayıtlı kurs yok.</div>';
            return;
        }

        container.innerHTML = this.courses.map((c, index) => {
            const isFirst = index === 0;
            const isLast = index === this.courses.length - 1;

            return `
            <div class="flex items-center justify-between p-3 bg-white border rounded shadow-sm hover:shadow transition group" draggable="true" ondragstart="CourseManager.dragStart(event, ${index})" ondragover="CourseManager.allowDrop(event)" ondrop="CourseManager.drop(event, ${index})">
                <div class="flex items-center gap-4">
                    <div class="flex flex-col items-center gap-1">
                        <span class="text-xs font-bold text-gray-400 bg-gray-100 rounded px-2 py-0.5">#${index + 1}</span>
                        <span class="cursor-move text-gray-300 hover:text-gray-500 text-lg">☰</span>
                    </div>
                    <div class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded text-2xl">${c.icon || '📦'}</div>
                    <div>
                        <div class="font-bold text-gray-800">${c.title}</div>
                        <div class="text-xs text-gray-500 font-mono">${c.key}</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="event.stopPropagation(); CourseManager.moveUp(${index})" 
                            class="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-sm ${isFirst ? 'invisible' : ''}" 
                            title="Yukarı Taşı">↑</button>
                        <button onclick="event.stopPropagation(); CourseManager.moveDown(${index})" 
                            class="w-7 h-7 rounded bg-gray-200 hover:bg-gray-300 text-sm ${isLast ? 'invisible' : ''}" 
                            title="Aşağı Taşı">↓</button>
                    </div>
                    <button onclick="CourseManager.deleteCourse('${c.key}')" class="p-2 text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity" title="Sil">🗑️</button>
                </div>
            </div>`;
        }).join('');
    },

    showAddForm() {
        document.getElementById('add-course-form').classList.remove('hidden');
        document.getElementById('course-list-container').classList.add('hidden');
    },

    hideAddForm() {
        document.getElementById('add-course-form').classList.add('hidden');
        document.getElementById('course-list-container').classList.remove('hidden');
    },

    // --- ACTIONS ---

    async createCourse() {

        const title = document.getElementById('new-course-title').value;
        let key = document.getElementById('new-course-key').value;
        const desc = document.getElementById('new-course-desc').value;
        const icon = document.getElementById('new-course-icon').value || '📚';
        const color = document.getElementById('new-course-color').value;

        // Auto-format key to be URL friendly (lowercase, hyphens only)
        if (key) {
            key = key.toLowerCase().trim()
                .replace(/_/g, '-') // underscores to hyphens
                .replace(/\s+/g, '-') // spaces to hyphens
                .replace(/[^a-z0-9-]/g, ''); // remove others

            // Update input to show user the formatted key
            document.getElementById('new-course-key').value = key;
        }



        if (!title || !key) {
            alert('Lütfen başlık ve anahtar alanlarını doldurun.');
            return;
        }

        // Validate key format
        if (!/^[a-z0-9-]+$/.test(key)) {
            alert('Anahtar sadece küçük harf, rakam ve tire içerebilir.');
            return;
        }

        if (this.courses.find(c => c.key === key)) {
            alert('Bu anahtara sahip bir kurs zaten var.');
            return;
        }

        try {
            // Show loading
            if (typeof admin !== 'undefined' && admin.showLoading) {
                admin.showLoading('Kurs oluşturuluyor...');
            }

            let courseId = null;

            // 1. Create in Supabase
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client) {
                const { data, error } = await SupabaseClient.client
                    .from('courses')
                    .insert({
                        slug: key,
                        title: title,
                        description: desc,
                        meta: { icon, color },
                        is_published: true,
                        position: this.courses.length
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                courseId = data.id;

                // 2. Create default phase
                const { error: phaseError } = await SupabaseClient.client
                    .from('phases')
                    .insert({
                        course_id: courseId,
                        name: 'Başlangıç',
                        description: 'İlk adımlar',
                        position: 0,
                        meta: { color: 'blue', icon: '🚀' }
                    });

                if (phaseError) {
                    console.error('Phase creation error:', phaseError);
                }
            }

            // 3. Add to local course data (Supabase-First approach)
            if (typeof admin !== 'undefined') {
                admin.allCourseData[key] = {
                    title: title,
                    description: desc,
                    icon: icon,
                    _supabaseId: courseId,
                    _phaseIds: {},
                    _projectIds: {},
                    data: {
                        phases: [
                            { color: 'blue', title: 'Başlangıç', description: 'İlk adımlar', icon: '🚀' }
                        ],
                        projects: [],
                        componentInfo: {}
                    }
                };

                // Update course selector
                if (admin.populateCourseSelector) {
                    admin.populateCourseSelector();
                }
            }

            this.hideAddForm();
            this.closeModal();

            // 4. Switch to new course without reload
            if (typeof admin !== 'undefined' && admin.changeCourse) {
                await admin.changeCourse(key);
                alert(`✅ "${title}" kursu oluşturuldu!`);
            } else {
                alert(`✅ Kurs Supabase'e kaydedildi! Sayfayı yenileyerek kursu görebilirsiniz.`);
            }

        } catch (e) {
            console.error(e);
            alert('Kurs oluşturulurken hata oluştu: ' + e.message);
        } finally {
            if (typeof admin !== 'undefined' && admin.hideLoading) {
                admin.hideLoading();
            }
        }
    },

    async deleteCourse(key) {

        // Confirm devre dışı: Kullanıcıda popup çıkmıyor.
        // if (!confirm(`'${key}' kursunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) return;



        try {
            // 1. Delete from Supabase
            if (typeof SupabaseClient !== 'undefined' && SupabaseClient.client) {
                // We use slug to identify course
                const { error } = await SupabaseClient.client
                    .from('courses')
                    .delete()
                    .eq('slug', key);

                if (error) throw error;
            }

            // 2. Remove from local manifest
            if (typeof CourseLoader !== 'undefined') {
                delete CourseLoader.manifest[key];
            }

            this.renderList();
            alert('Kurs silindi.');
            location.reload();

        } catch (e) {
            console.error(e);
            alert('Silme işlemi başarısız: ' + e.message);
        }
    },

    // --- REORDERING via BUTTONS ---

    async moveUp(index) {
        if (index <= 0) return; // Already at top

        // Swap with previous
        const temp = this.courses[index];
        this.courses[index] = this.courses[index - 1];
        this.courses[index - 1] = temp;

        this.renderList();
        this.renderSelectorGrid();  // Also update inline grid
        await this.saveOrder();
    },

    async moveDown(index) {
        if (index >= this.courses.length - 1) return; // Already at bottom

        // Swap with next
        const temp = this.courses[index];
        this.courses[index] = this.courses[index + 1];
        this.courses[index + 1] = temp;

        this.renderList();
        this.renderSelectorGrid();  // Also update inline grid
        await this.saveOrder();
    },

    // --- DRAG & DROP FOR ORDERING ---
    // Note: To implement full reordering, we need to update 'position' field in Supabase for all items

    dragStart(e, index) {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    },

    allowDrop(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    async drop(e, dropIndex) {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (dragIndex === dropIndex) return;

        // Reorder array
        const item = this.courses.splice(dragIndex, 1)[0];
        this.courses.splice(dropIndex, 0, item);

        // Re-render immediately
        this.renderList();

        // Update Order in Supabase
        await this.saveOrder();
    },

    async saveOrder() {
        if (typeof SupabaseClient === 'undefined' || !SupabaseClient.client) return;

        // This is tricky because Supabase doesn't have a bulk update easily for different values
        // We will loop through and update position. 
        // OPTIMIZATION: In production, create a Postgres function or use a specialized library.
        // For now, simple loop is fine for < 20 courses.

        try {
            const updates = this.courses.map((course, index) => {
                return SupabaseClient.updateCourseBySlug(course.key, { position: index });
            });

            await Promise.all(updates);

        } catch (e) {
            console.error('Failed to save order', e);
        }
    }
};

window.CourseManager = CourseManager;
