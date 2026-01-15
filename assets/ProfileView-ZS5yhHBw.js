const r={isLoaded:!1,currentView:"settings",scriptsLoaded:!1,container:null,async checkAuth(){if(window.Auth&&typeof Auth.waitForInit=="function"&&await Auth.waitForInit(),window.Auth&&Auth.currentUser)return Auth.currentUser;const e=sessionStorage.getItem("studentSession");if(e)try{return JSON.parse(e)}catch(t){console.error("[ProfileView] Failed to parse student session:",t)}return null},async loadDependencies(){if(this.scriptsLoaded)return;if(window.Profile&&window.turkeyData&&window.Validators){console.log("[ProfileView] Dependencies already bundled, skipping dynamic load"),this.scriptsLoaded=!0;return}const e=["modules/constants.js","modules/validators.js","data/cities.js","modules/badges.js","modules/profile.js"];for(const t of e)document.querySelector(`script[src="${t}"]`)||await new Promise((i,a)=>{const s=document.createElement("script");s.src=t,s.onload=i,s.onerror=a,document.body.appendChild(s)});this.scriptsLoaded=!0,console.log("[ProfileView] Dependencies loaded")},template(){return`
            <div class="profile-bg flex flex-col min-h-screen">
                <!-- Main Content -->
                <main class="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                    <!-- VIEW: WIZARD (First Time Setup) -->
                    <div id="view-wizard" class="hidden max-w-2xl mx-auto">
                        <!-- Progress Steps -->
                        <div class="flex justify-center gap-4 mb-8">
                            <div class="step-dot w-3 h-3 rounded-full bg-theme ring-4 ring-theme/20"></div>
                            <div class="step-dot w-3 h-3 rounded-full bg-gray-200"></div>
                            <div class="step-dot w-3 h-3 rounded-full bg-gray-200"></div>
                        </div>

                        <div class="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-theme to-cyan-400"></div>

                            <!-- Wizard Step 1: Role -->
                            <div id="wizard-step-1" class="wizard-step">
                                <h2 class="text-3xl font-bold text-center mb-2">Hoş Geldin! 👋</h2>
                                <p class="text-gray-500 text-center mb-8">Seni daha yakından tanıyalım</p>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div onclick="Wizard.selectRole('teacher')" class="role-card border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-theme transition-colors group">
                                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍🏫</div>
                                        <h3 class="text-xl font-bold mb-2">Öğretmenim</h3>
                                        <p class="text-gray-400 text-sm">Sınıflar oluştur, öğrencilerini yönet</p>
                                    </div>
                                    <div onclick="Wizard.selectRole('student')" class="role-card border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-theme transition-colors group">
                                        <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                                        <h3 class="text-xl font-bold mb-2">Öğrenciyim</h3>
                                        <p class="text-gray-400 text-sm">Dersleri tamamla, projeler yap</p>
                                    </div>
                                </div>

                                <button id="wiz-btn-1" onclick="Wizard.nextStep()" disabled class="w-full bg-gray-200 text-gray-400 py-4 rounded-xl font-bold transition-all">
                                    Devam Et
                                </button>
                            </div>

                            <!-- Wizard Step 2: Info -->
                            <div id="wizard-step-2" class="wizard-step hidden">
                                <h2 class="text-2xl font-bold text-center mb-6">Bilgilerini Tamamla 📝</h2>
                                <div class="space-y-4">
                                    <div>
                                        <label class="block font-bold text-gray-700 mb-2">Ad Soyad</label>
                                        <input type="text" id="wiz-name" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none transition-colors" />
                                    </div>
                                    <div>
                                        <label class="block font-bold text-gray-700 mb-2">Okul Adı</label>
                                        <input type="text" id="wiz-school" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none transition-colors" placeholder="Örn: Atatürk Ortaokulu" />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div>
                                            <label class="block font-bold text-gray-700 mb-2">İl</label>
                                            <select id="wiz-city" onchange="loadDistricts('wiz-city', 'wiz-district')" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none"></select>
                                        </div>
                                        <div>
                                            <label class="block font-bold text-gray-700 mb-2">İlçe</label>
                                            <select id="wiz-district" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-theme outline-none"></select>
                                        </div>
                                    </div>
                                </div>
                                <div class="flex gap-4 mt-8">
                                    <button onclick="Wizard.prevStep()" class="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Geri</button>
                                    <button onclick="Wizard.nextStep()" class="flex-1 bg-theme text-white py-4 rounded-xl font-bold hover:brightness-110 transition-all">Devam Et</button>
                                </div>
                            </div>

                            <!-- Wizard Step 3: Avatar -->
                            <div id="wizard-step-3" class="wizard-step hidden">
                                <h2 class="text-2xl font-bold text-center mb-6">Bir Avatar Seç 🎨</h2>
                                <div class="grid grid-cols-4 sm:grid-cols-6 gap-4 mb-8" id="wiz-avatar-grid">
                                    <!-- Avatars will be injected here -->
                                </div>
                                <div class="text-center">
                                    <button onclick="Wizard.complete()" id="wiz-complete-btn" class="w-full bg-theme text-white py-4 rounded-xl font-bold text-lg hover:brightness-110 shadow-lg shadow-theme/30 transition-all">
                                        Başla 🚀
                                    </button>
                                    <p id="wiz-error" class="text-red-500 mt-4 text-sm hidden"></p>
                                </div>
                                <div class="mt-4 text-center">
                                    <button onclick="Wizard.prevStep()" class="text-gray-400 text-sm hover:text-gray-600">Geri Dön</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- VIEW: SETTINGS (Modern Card Layout) -->
                    <div id="view-settings" class="hidden">
                        <!-- Hero Section -->
                        <div class="text-center mb-8">
                            <div class="inline-block relative">
                                <div class="hero-avatar" id="profile-hero-avatar">
                                    <span id="hero-avatar-emoji">👤</span>
                                </div>
                                <button onclick="ProfileEditor.toggleAvatarSelector()" class="hero-avatar-edit" title="Avatar Değiştir">✏️</button>
                            </div>
                            <!-- Avatar Selector (hidden by default) -->
                            <div id="avatar-selector-popup" class="hidden mt-4 p-4 bg-white rounded-2xl shadow-lg border max-w-xs mx-auto">
                                <div class="grid grid-cols-8 gap-2" id="avatar-grid">
                                    <!-- Avatars injected via JS -->
                                </div>
                            </div>
                            <h2 class="text-2xl font-bold mt-4" id="hero-name">Kullanıcı</h2>
                            <div class="flex items-center justify-center gap-2 mt-1">
                                <span id="hero-role-badge" class="text-xs font-bold px-3 py-1 rounded-full bg-theme/10 text-theme">Öğrenci</span>
                                <span id="hero-level-badge" class="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">Level 1</span>
                            </div>

                            <!-- XP Progress Bar -->
                            <div class="max-w-xs mx-auto mt-3">
                                <div class="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Kazanılan XP: <span id="hero-xp" class="text-theme font-bold">0</span></span>
                                    <span>Sonraki Seviye: <span id="hero-next-xp">1000</span></span>
                                </div>
                                <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div id="hero-xp-bar" class="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-1000" style="width: 0%"></div>
                                </div>
                            </div>

                            <p class="text-gray-500 text-sm mt-2" id="hero-email">email@example.com</p>
                            <p class="text-gray-400 text-xs mt-1" id="hero-joined">Katılım: Ocak 2026</p>
                        </div>

                        <!-- Stats Cards -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-lessons">0</div>
                                <div class="stat-badge-label">Ders Tamamlandı</div>
                            </div>
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-badges">0</div>
                                <div class="stat-badge-label">Rozet Kazanıldı</div>
                            </div>
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-streak">0</div>
                                <div class="stat-badge-label">Gün Seri</div>
                            </div>
                            <div class="stat-badge">
                                <div class="stat-badge-value" id="stat-quiz">0%</div>
                                <div class="stat-badge-label">Quiz Ortalaması</div>
                            </div>
                        </div>

                        <!-- Activity Heatmap -->
                        <div class="mb-8">
                            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                                <span>📊</span> Son 30 Günlük Aktivite
                            </h3>
                            <div class="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div id="activity-heatmap" class="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <!-- Heatmap cells injected via JS -->
                                </div>
                                <div class="flex items-center gap-2 mt-4 text-xs text-gray-400 justify-end">
                                    <span>Az</span>
                                    <div class="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700"></div>
                                    <div class="w-3 h-3 rounded-sm bg-theme/40"></div>
                                    <div class="w-3 h-3 rounded-sm bg-theme"></div>
                                    <span>Çok</span>
                                </div>
                            </div>
                        </div>

                        <!-- Badge Gallery -->
                        <div class="mb-8">
                            <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
                                <span>🏆</span> Rozet Koleksiyonu
                            </h3>
                            <div id="badge-gallery" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <!-- Badges injected via JS -->
                            </div>
                        </div>

                        <!-- Teacher Panel Link (Hidden by default) -->
                        <div id="teacher-panel-link" class="hidden mb-6">
                            <a href="#/teacher" onclick="event.preventDefault(); Navbar.navigateSPA('/teacher');" class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-full bg-theme/10 flex items-center justify-center text-2xl">🎛️</div>
                                    <div>
                                        <h3 class="font-bold text-lg text-gray-800 dark:text-white group-hover:text-theme transition-colors">Öğretmen Kontrol Paneli</h3>
                                        <p class="text-gray-500 text-sm">Sınıflarınızı ve öğrencilerinizi yönetin</p>
                                    </div>
                                </div>
                                <span class="text-gray-400 group-hover:translate-x-1 transition-transform text-xl">→</span>
                            </a>
                        </div>

                        <!-- Ayarlar Akordeon (varsayılan kapalı) -->
                        <div class="mb-4">
                            <button onclick="ProfileView.toggleSettings()" id="settings-accordion-btn" 
                                class="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group">
                                <div class="flex items-center gap-3">
                                    <span class="text-xl">⚙️</span>
                                    <span class="font-bold text-gray-700 dark:text-gray-200">Hesap Ayarları</span>
                                </div>
                                <span id="settings-accordion-icon" class="text-gray-400 transition-transform duration-300">▼</span>
                            </button>
                            
                            <div id="settings-accordion-content" class="hidden mt-2 space-y-3 animate-fade-in">
                                <!-- Kişisel Bilgiler Card (Kompakt) -->
                                <div class="profile-card" id="card-personal">
                                    <div class="profile-card-header py-2 px-4">
                                        <div class="profile-card-title text-sm"><span>📋</span> Kişisel Bilgiler</div>
                                        <button class="edit-btn text-xs" onclick="ProfileEditor.toggleEdit('personal')" title="Düzenle">✏️</button>
                                    </div>
                                    <div class="profile-card-body py-2 px-4">
                                        <!-- View Mode (Kompakt - tek satır) -->
                                        <div class="view-mode">
                                            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                                <span><span class="text-gray-400">Ad:</span> <span id="view-name" class="font-medium">—</span></span>
                                                <span><span class="text-gray-400">Okul:</span> <span id="view-school" class="font-medium">—</span></span>
                                                <span><span class="text-gray-400">Konum:</span> <span id="view-city" class="font-medium">—</span>, <span id="view-district">—</span></span>
                                            </div>
                                        </div>
                                        <!-- Edit Mode -->
                                        <div class="edit-mode space-y-3 pt-2">
                                            <div class="grid grid-cols-2 gap-3">
                                                <input type="text" id="edit-name" class="inline-field-input text-sm" placeholder="Ad Soyad" />
                                                <input type="text" id="edit-school" class="inline-field-input text-sm" placeholder="Okul (opsiyonel)" />
                                            </div>
                                            <div class="grid grid-cols-2 gap-3">
                                                <select id="edit-city" class="inline-field-input text-sm" onchange="ProfileEditor.loadDistricts()">
                                                    <option value="">İl Seçin</option>
                                                </select>
                                                <select id="edit-district" class="inline-field-input text-sm">
                                                    <option value="">İlçe</option>
                                                </select>
                                            </div>
                                            <div class="flex gap-2">
                                                <button class="btn-save text-sm py-1.5" onclick="ProfileEditor.savePersonal()">💾 Kaydet</button>
                                                <button class="btn-cancel text-sm py-1.5" onclick="ProfileEditor.cancelEdit('personal')">İptal</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Güvenlik Card (Kompakt) -->
                                <div class="profile-card" id="card-security">
                                    <div class="profile-card-header py-2 px-4">
                                        <div class="profile-card-title text-sm"><span>🔐</span> Güvenlik</div>
                                        <button class="edit-btn text-xs" onclick="ProfileEditor.toggleEdit('security')" title="Şifre Değiştir">✏️</button>
                                    </div>
                                    <div class="profile-card-body py-2 px-4">
                                        <div class="view-mode">
                                            <div class="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                                <span><span class="text-gray-400">Şifre:</span> <span class="font-medium">••••••••</span></span>
                                                <span><span class="text-gray-400">Bağlı:</span> <span id="view-connections" class="font-medium">—</span></span>
                                            </div>
                                        </div>
                                        <div class="edit-mode space-y-3 pt-2">
                                            <div class="grid grid-cols-2 gap-3">
                                                <input type="password" id="new-password" class="inline-field-input text-sm" placeholder="Yeni şifre" minlength="6" />
                                                <input type="password" id="new-password-confirm" class="inline-field-input text-sm" placeholder="Tekrar" minlength="6" />
                                            </div>
                                            <div class="flex gap-2">
                                                <button class="btn-save text-sm py-1.5" onclick="ProfileEditor.savePassword()">🔒 Güncelle</button>
                                                <button class="btn-cancel text-sm py-1.5" onclick="ProfileEditor.cancelEdit('security')">İptal</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Tema Seçimi (Kompakt - inline) -->
                                <div class="profile-card" id="card-preferences">
                                    <div class="profile-card-body py-3 px-4">
                                        <div class="flex items-center justify-between">
                                            <span class="text-sm font-medium text-gray-600 dark:text-gray-300">🎨 Tema</span>
                                            <div class="flex gap-2">
                                                <button onclick="ProfileEditor.setTheme('light')" id="theme-light-btn" class="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 transition">☀️ Açık</button>
                                                <button onclick="ProfileEditor.setTheme('dark')" id="theme-dark-btn" class="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 transition">🌙 Koyu</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Çıkış Butonu -->
                        <div class="text-center mt-8 mb-8">
                            <button onclick="ProfileView.logout()" class="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-2 mx-auto">
                                🚪 Çıkış Yap
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        `},async mount(e){if(console.log("[ProfileView] Mounting..."),this.container=e,e.innerHTML=`
            <div class="flex flex-col items-center justify-center min-h-[60vh]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-theme mb-4"></div>
                <p class="text-gray-500">Profil yükleniyor...</p>
            </div>
        `,!await this.checkAuth()){console.log("[ProfileView] Not authenticated, redirecting to auth..."),window.location.href="auth.html?redirect=profile";return}if(await this.loadDependencies(),e.innerHTML=this.template(),window.Profile&&window.Auth){const i=Auth.getUserInfo();!(Auth.isProfileComplete||i.role&&i.displayName&&i.displayName!=="Misafir")?(this.currentView="wizard",document.getElementById("view-wizard")?.classList.remove("hidden"),document.getElementById("view-settings")?.classList.add("hidden"),Profile.Wizard.init(i)):(this.currentView="settings",document.getElementById("view-wizard")?.classList.add("hidden"),document.getElementById("view-settings")?.classList.remove("hidden"),Profile.Settings.init(i))}this.isLoaded=!0,console.log("[ProfileView] Mounted successfully")},unmount(){console.log("[ProfileView] Unmounting..."),this.container&&(this.container.innerHTML="",this.container.classList.add("hidden"));const e=document.getElementById("profile-view-container");e&&(e.innerHTML="",e.classList.add("hidden")),this.isLoaded=!1,this.container=null,console.log("[ProfileView] Unmounted")},toggleSettings(){const e=document.getElementById("settings-accordion-content"),t=document.getElementById("settings-accordion-icon");e.classList.contains("hidden")?(e.classList.remove("hidden"),t.style.transform="rotate(180deg)"):(e.classList.add("hidden"),t.style.transform="rotate(0deg)")},logout(){window.Profile&&typeof Profile.logout=="function"?Profile.logout():window.Auth&&typeof Auth.signOut=="function"?(Auth.signOut(),Router.navigate("/")):(sessionStorage.removeItem("studentSession"),Router.navigate("/"))},goHome(){window.Navbar&&typeof Navbar.navigateSPA=="function"?Navbar.navigateSPA("/"):window.Router?Router.navigate("/"):window.location.href="index.html"}};window.ProfileView=r;window.Wizard={selectRole:e=>Profile?.Wizard?.selectRole?.(e),nextStep:()=>Profile?.Wizard?.nextStep?.(),prevStep:()=>Profile?.Wizard?.prevStep?.(),complete:()=>Profile?.Wizard?.complete?.()};window.loadDistricts=(e,t)=>{const i=document.getElementById(e),a=document.getElementById(t),s=window.turkeyData||window.Cities&&window.Cities.districts;if(!i||!a||!s){console.warn("[ProfileView] Missing city data or elements");return}const o=i.value,n=s[o]||[];a.innerHTML='<option value="">İlçe Seçiniz</option>',n.forEach(l=>{const d=document.createElement("option");d.value=l,d.textContent=l,a.appendChild(d)})};
