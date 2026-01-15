import r from"./courseEnrollmentService-BxOyFng8.js";import"./router-__dgyCIu.js";const i={courses:[],isLoading:!1,studentId:null,async init(t){this.studentId=t,await this.loadCourses()},async loadCourses(){if(this.studentId){this.isLoading=!0;try{this.courses=await r.getMyActiveCourses(this.studentId)}catch(t){console.error("Kurslar yüklenemedi:",t),this.courses=[]}this.isLoading=!1}},render(){return this.isLoading?`
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin w-8 h-8 border-4 border-theme border-t-transparent rounded-full"></div>
                </div>
            `:!this.courses||this.courses.length===0?`
                <div class="glass-card rounded-2xl p-8 text-center">
                    <div class="text-4xl mb-3">📚</div>
                    <h4 class="font-bold text-gray-800 dark:text-white mb-1">Henüz kayıtlı kurs yok</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Öğretmeniniz size kurs atadığında burada görünecek.
                    </p>
                </div>
            `:`
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${this.courses.map(t=>this.renderCourseCard(t)).join("")}
            </div>
        `},renderCourseCard(t){const e=t.theme_color||"#00979c",s=t.enrolledAt?new Date(t.enrolledAt).toLocaleDateString("tr-TR"):"",o={arduino:"🤖",microbit:"💻",scratch:"🎮",mblock:"🦾","minecraft-edu":"⛏️",appinventor:"📱"}[t.slug]||"📚";return`
            <div class="course-progress-card glass-card rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer"
                 onclick="StudentCoursesSection.openCourse('${t.slug}')"
                 style="border-left: 4px solid ${e}">
                <div class="flex items-start gap-4">
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                         style="background: ${e}20">
                        ${o}
                    </div>
                    <div class="flex-grow min-w-0">
                        <h4 class="font-bold text-gray-800 dark:text-white line-clamp-1">
                            ${t.title}
                        </h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            ${t.description||"Açıklama yok"}
                        </p>
                        ${s?`
                            <p class="text-xs text-gray-400 mt-2">
                                📅 Kayıt: ${s}
                            </p>
                        `:""}
                    </div>
                </div>
                <button class="mt-4 w-full py-2.5 px-4 border-2 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
                        style="border-color: ${e}; color: ${e}">
                    <span>Kursa Git</span>
                    <span>→</span>
                </button>
            </div>
        `},openCourse(t){window.router&&typeof window.router.navigate=="function"?window.router.navigate(`/course/${t}`):window.location&&(window.location.hash=`#/course/${t}`)},async hasAccess(t){return this.studentId?await r.hasAccess(this.studentId,t):!1},getEnrolledCount(){return this.courses?.length||0}};window.StudentCoursesSection=i;export{i as default};
