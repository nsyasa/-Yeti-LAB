/**
 * Yeti Asistan 2.0
 * Bağlam farkındalığı + Adım adım rehber modu
 */

const Assistant = {
    isOpen: false,
    currentStep: 0,
    guidedMode: false,

    // ============================================
    // KNOWLEDGE BASE - Kural Tabanlı Yanıtlar
    // ============================================
    rules: [
        {
            keywords: ['merhaba', 'selam', 'naber', 'hey'],
            response: () => `Merhaba! 👋 Ben Yeti Asistan. ${Assistant.getContextGreeting()}`,
            priority: 1,
        },
        {
            keywords: ['yardım', 'help', 'ne yapabilirim'],
            response: () => Assistant.getHelpMessage(),
            priority: 1,
        },
        {
            keywords: ['bu ders', 'şu an', 'hangi ders', 'neredeyim'],
            response: () => Assistant.getCurrentLessonInfo(),
            priority: 2,
        },
        {
            keywords: ['ipucu', 'hint', 'takıldım', 'anlamadım'],
            response: () => Assistant.getContextualTip(),
            priority: 2,
        },
        {
            keywords: ['kod', 'açıkla', 'nasıl çalışıyor'],
            response: () => Assistant.explainCurrentCode(),
            priority: 2,
        },
        {
            keywords: ['malzeme', 'devre', 'bileşen', 'ne lazım'],
            response: () => Assistant.getMaterialsInfo(),
            priority: 2,
        },
        {
            keywords: ['adım adım', 'rehber', 'başla', 'yönlendir'],
            response: () => {
                Assistant.startGuidedMode();
                return null;
            },
            priority: 3,
        },
        {
            keywords: ['led', 'lamba', 'ışık'],
            response: () =>
                'LED yakmak için <code>digitalWrite(pin, HIGH);</code> komutunu kullanmalısın. Ayrıca <code>pinMode(pin, OUTPUT);</code> ile pini çıkış yapmayı unutma!',
            priority: 0,
        },
        {
            keywords: ['döngü', 'loop', 'for', 'while', 'tekrar'],
            response: () =>
                "Döngüler bir işlemi tekrar ettirmek için kullanılır. Arduino'da <code>void loop()</code> ana döngüdür ve sürekli çalışır. <code>for</code> döngüsü belirli sayıda tekrar için kullanılır.",
            priority: 0,
        },
        {
            keywords: ['hata', 'error', 'çalışmıyor', 'bozuk', 'sorun'],
            response: () =>
                'Kodunda bir sorun mu var? 🐞 Kodu buraya yapıştırırsan senin için kontrol edebilirim!<br><br>Yaygın hatalar:<br>• Noktalı virgül (;) unutulmuş<br>• Parantez kapatılmamış<br>• Değişken tanımlanmamış',
            priority: 0,
        },
        {
            keywords: ['arduino', 'uno', 'nano', 'mega'],
            response: () =>
                "Arduino, elektronik projeleri yapmamızı sağlayan bir mikrodenetleyici kartıdır. Sensörleri okuyabilir, motorları kontrol edebilir. En popüler model Arduino Uno'dur.",
            priority: 0,
        },
        {
            keywords: ['micro:bit', 'microbit', 'bbc'],
            response: () =>
                'Micro:bit, üzerinde LED ekran, butonlar ve sensörler barındıran küçük bir bilgisayardır. MakeCode ile blok tabanlı kodlanır.',
            priority: 0,
        },
        {
            keywords: ['scratch', 'kukla', 'sprite'],
            response: () =>
                'Scratch ile kendi oyunlarını ve animasyonlarını yapabilirsin. Kuklalar (sprite) sahnede hareket eder.',
            priority: 0,
        },
        {
            keywords: ['mblock', 'panda'],
            response: () =>
                "mBlock, Scratch tabanlı bir programdır. Blokları sürükle-bırak yaparak Arduino'yu kodlayabilirsin!",
            priority: 0,
        },
        {
            keywords: ['sensör', 'mesafe', 'sıcaklık', 'hc-sr04', 'dht11'],
            response: () =>
                'Sensörler çevreyi algılar:<br>• <strong>HC-SR04:</strong> Mesafe ölçer<br>• <strong>DHT11:</strong> Sıcaklık ve Nem ölçer<br>• <strong>LDR:</strong> Işık seviyesi ölçer',
            priority: 0,
        },
        {
            keywords: ['servo', 'motor'],
            response: () =>
                'Servo motorlar belirli bir açıya (0-180 derece) dönebilen motorlardır. Robot kol veya bariyer yapımında kullanılır.',
            priority: 0,
        },
        {
            keywords: ['teşekkür', 'sağol', 'eyvallah'],
            response: () => 'Rica ederim! 😊 Başka sorun olursa yardımcı olmaktan mutluluk duyarım. 🏔️',
            priority: 1,
        },
    ],

    // ============================================
    // GUIDED MODE - Adım Adım Rehber
    // ============================================
    guidedSteps: {
        default: [
            {
                message: 'Hoş geldin! 🏔️ Seni bu derste adım adım yönlendireceğim. Hazır mısın?',
                options: ['Evet, başlayalım!', 'Dersi anlat'],
            },
            {
                message: 'İlk adım: <strong>Görevi oku</strong>. Bu derste ne yapacağımızı anlamalıyız.',
                options: ['Okudum, devam', 'Görevi göster'],
            },
            {
                message: 'İkinci adım: <strong>Malzemeleri hazırla</strong>. Gerekli parçalar masanda mı?',
                options: ['Hazır!', 'Malzemeleri göster'],
            },
            {
                message: 'Üçüncü adım: <strong>Devreyi kur</strong>. Bağlantı şemasına göre kabloları bağla.',
                options: ['Kurdum', 'Şemayı göster'],
            },
            {
                message: "Dördüncü adım: <strong>Kodu yükle</strong>. Kodu Arduino'ya yükle ve test et.",
                options: ['Çalıştı! 🎉', 'Hata aldım'],
            },
            {
                message: 'Harika! 🎉 Dersi tamamladın! Şimdi meydan okumayı dene veya teste geç.',
                options: ['Testi çöz', 'Meydan okumayı göster'],
            },
        ],
    },

    // ============================================
    // UTILS
    // ============================================
    isAdminContext: () => {
        // Check URL/Route specifically for Admin Panel
        const hash = window.location.hash;
        if (hash.startsWith('#/admin') || hash.includes('/admin')) {
            return true;
        }

        // Also check legacy/separate page if any
        if (window.location.pathname.includes('admin.html')) {
            return true;
        }

        return false;
    },

    // ============================================
    // INITIALIZATION
    // ============================================
    init: () => {
        Assistant.renderUI();

        // Initial check
        Assistant.checkRouteVisibility();

        // Listen for route changes
        window.addEventListener('hashchange', () => Assistant.checkRouteVisibility());
        window.addEventListener('popstate', () => Assistant.checkRouteVisibility());

        // Listen for custom route events if available
        window.addEventListener('route-changed', () => Assistant.checkRouteVisibility());
    },

    // Route Change Visibility Check (Debounced)
    checkRouteVisibility: () => {
        if (Assistant.checkRouteTimer) clearTimeout(Assistant.checkRouteTimer);
        Assistant.checkRouteTimer = setTimeout(() => {
            Assistant._performRouteCheck();
        }, 100);
    },

    _performRouteCheck: () => {
        const btn = document.getElementById('chat-btn');
        const windowEl = document.getElementById('chat-window');
        const notification = document.getElementById('chat-notification'); // Assuming a notification dot element might exist

        if (!btn || !windowEl) return;

        // Check if we are in admin context (URL based)
        const isAdmin = Assistant.isAdminContext();

        if (isAdmin) {
            // Hide in Admin Panel
            btn.classList.add('hidden');
            windowEl.classList.add('hidden');
            if (notification) notification.classList.add('hidden');
            Assistant.isOpen = false; // Reset state when hidden
        } else {
            // Show in other areas (Student/Teacher/Home)
            // Only ensure button is visible so they CAN open it
            // Do NOT touch window class, let user control open/close state
            btn.classList.remove('hidden');
        }
    },

    renderUI: () => {
        // ALWAYS Create DOM elements, but hide them initially if needed
        // This allows us to show them later when navigating out of Admin

        const div = document.createElement('div');
        div.id = 'assistant-container';
        div.innerHTML = `
            <!-- Chat Button with Notification Dot (positioned higher on mobile) -->
            <button id="chat-btn" onclick="Assistant.toggle()" 
                class="fixed bottom-24 md:bottom-4 right-4 w-20 md:w-32 h-auto transform hover:scale-110 active:scale-95 transition z-40 drop-shadow-2xl cursor-pointer hover:drop-shadow-3xl animate-gentle-bounce"
                style="filter: drop-shadow(0 0 15px rgba(0, 151, 156, 0.4));">
                <div class="notification-dot"></div>
                <img src="img/yeti-ask.png" class="w-full h-full object-contain filter drop-shadow-lg" alt="Bana Sor">
                <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF8C00] to-[#FF4500] text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-500/40 whitespace-nowrap">BANA SOR</span>
            </button>

            <!-- Chat Window -->
            <div id="chat-window" class="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 hidden flex flex-col z-50 transform transition-all origin-bottom-right scale-95 opacity-0" 
                 style="height: 520px; max-height: 80vh;">
                <!-- Header -->
                <div class="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
                    <div class="flex items-center">
                         <img src="img/yeti-peek.png" class="w-10 h-10 object-contain mr-2 bg-white/10 rounded-full p-1">
                        <div>
                            <h3 class="font-bold">Yeti Asistan</h3>
                            <p class="text-xs text-teal-100" id="assistant-status">Sana yardımcı olmaya hazırım</p>
                        </div>
                    </div>
                    <button onclick="Assistant.toggle()" class="text-white hover:bg-white/20 rounded p-1">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <!-- Context Bar (shows current lesson) -->
                <div id="context-bar" class="bg-teal-50 px-4 py-2 text-xs text-teal-700 border-b hidden">
                    <span id="context-text">📚 Ders seçilmedi</span>
                </div>

                <!-- Messages Area -->
                <div id="chat-messages" class="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 text-sm">
                    <!-- Welcome message will be added dynamically -->
                </div>

                <!-- Quick Actions -->
                <div id="quick-actions" class="px-3 py-2 bg-white border-t flex flex-wrap gap-2">
                </div>

                <!-- Input Area -->
                <div class="p-3 bg-white border-t rounded-b-2xl">
                    <div class="flex gap-2">
                        <input type="text" id="chat-input" placeholder="Bir şeyler yaz veya soru sor..." 
                            class="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                            onkeypress="if(event.key === 'Enter') Assistant.sendMessage()">
                        <button onclick="Assistant.sendMessage()" class="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-600 transition">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        // Add pulse animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-glow {
                0%, 100% { filter: drop-shadow(0 0 2px rgba(0, 151, 156, 0.5)); transform: scale(1); }
                50% { filter: drop-shadow(0 0 10px rgba(0, 151, 156, 0.8)); transform: scale(1.05); }
            }
        `;
        document.head.appendChild(style);
    },

    // ============================================
    // TOGGLE & UI
    // ============================================
    toggle: () => {
        Assistant.isOpen = !Assistant.isOpen;
        const win = document.getElementById('chat-window');
        const btn = document.getElementById('chat-btn');

        if (Assistant.isOpen) {
            win.classList.remove('hidden', 'scale-95', 'opacity-0');
            win.classList.add('scale-100', 'opacity-100');
            btn.classList.add('hidden');

            // Update context and show welcome
            Assistant.updateContext();
            if (document.getElementById('chat-messages').children.length === 0) {
                Assistant.showWelcome();
            }

            setTimeout(() => document.getElementById('chat-input').focus(), 100);
        } else {
            win.classList.add('hidden', 'scale-95', 'opacity-0');
            win.classList.remove('scale-100', 'opacity-100');
            btn.classList.remove('hidden');
        }
    },

    // ============================================
    // CONTEXT AWARENESS
    // ============================================
    updateContext: () => {
        const contextBar = document.getElementById('context-bar');
        const contextText = document.getElementById('context-text');
        const statusText = document.getElementById('assistant-status');

        const project = window.app?.currentProject;
        const courseKey = window.app?.currentCourseKey;

        if (project) {
            contextBar.classList.remove('hidden');
            contextText.innerHTML = `📚 <strong>${project.title}</strong> ${project.icon || ''}`;
            statusText.textContent = `${project.title} dersinde yardımcıyım`;
        } else if (courseKey) {
            contextBar.classList.remove('hidden');
            const courseNames = {
                arduino: 'Arduino',
                microbit: 'Micro:bit',
                scratch: 'Scratch',
                mblock: 'mBlock',
                appinventor: 'App Inventor',
            };
            contextText.innerHTML = `📚 ${courseNames[courseKey] || courseKey} Kursu`;
            statusText.textContent = 'Ders seçmeni bekliyorum';
        } else {
            contextBar.classList.add('hidden');
            statusText.textContent = 'Sana yardımcı olmaya hazırım';
        }

        // Update quick actions based on context
        Assistant.updateQuickActions();
    },

    updateQuickActions: () => {
        const container = document.getElementById('quick-actions');
        const project = window.app?.currentProject;

        let actions = [];

        if (project) {
            actions = [
                { label: '💡 İpucu', action: "Assistant.setUserInput('İpucu ver')" },
                { label: '🔧 Kodu Açıkla', action: "Assistant.setUserInput('Kodu açıkla')" },
                { label: '📦 Malzemeler', action: "Assistant.setUserInput('Malzemeler neler?')" },
                { label: '🎯 Rehber Başlat', action: 'Assistant.startGuidedMode()' },
            ];
        } else {
            actions = [
                { label: '👋 Merhaba', action: "Assistant.setUserInput('Merhaba')" },
                { label: '❓ Yardım', action: "Assistant.setUserInput('Yardım')" },
                { label: '⚡ Arduino Nedir?', action: "Assistant.setUserInput('Arduino nedir?')" },
            ];
        }

        container.innerHTML = actions
            .map(
                (a) =>
                    `<button onclick="${a.action}" class="bg-white border border-teal-300 text-teal-700 px-3 py-1 rounded-full text-xs hover:bg-teal-500 hover:text-white transition">${a.label}</button>`
            )
            .join('');
    },

    showWelcome: () => {
        const project = window.app?.currentProject;

        if (project) {
            Assistant.addMessage(
                `Merhaba! 👋 <strong>${project.title}</strong> dersinde sana yardımcı olacağım.<br><br>Aşağıdaki butonları kullanabilir veya soru sorabilirsin!`
            );
        } else {
            Assistant.addMessage(
                'Merhaba! 👋 Ben <strong>Yeti Asistan</strong>. Kodlama ve robotik konularında sana yardımcı olabilirim.<br><br>Bir ders seçtiğinde sana özel ipuçları verebilirim!'
            );
        }
    },

    // ============================================
    // CONTEXT-AWARE RESPONSES
    // ============================================
    getContextGreeting: () => {
        const project = window.app?.currentProject;
        if (project) {
            return `<strong>${project.title}</strong> dersinde sana yardımcı olabilirim. Ne sormak istersin?`;
        }
        return 'Sana nasıl yardımcı olabilirim?';
    },

    getHelpMessage: () => {
        const project = window.app?.currentProject;
        let help = "İşte yapabileceklerim:<br><ul class='list-disc pl-4 mt-2'>";
        help += '<li>Dersleri adım adım anlatmak</li>';
        help += '<li>Kodunu kontrol etmek</li>';
        help += '<li>İpucu ve öneriler vermek</li>';
        help += '<li>Hataları açıklamak</li>';
        help += '</ul>';

        if (project) {
            help += `<br>Şu an <strong>${project.title}</strong> dersinde olduğunu görüyorum. Özel yardım için 'ipucu' veya 'rehber başlat' yazabilirsin!`;
        }
        return help;
    },

    getCurrentLessonInfo: () => {
        const project = window.app?.currentProject;
        if (!project) {
            return 'Henüz bir ders seçmedin. Ana sayfadan bir kurs ve ders seç, sonra sana yardımcı olabilirim!';
        }

        return `
            <strong>${project.icon} ${project.title}</strong><br><br>
            <strong>Görev:</strong> ${project.mission}<br><br>
            <strong>Teori:</strong> ${project.theory?.substring(0, 150)}...
        `;
    },

    getContextualTip: () => {
        const project = window.app?.currentProject;
        if (!project) {
            return 'Bir ders seçersen sana özel ipuçları verebilirim! 💡';
        }

        // Course-specific tips
        const tips = {
            arduino: [
                "💡 Kodu yüklemeden önce 'Doğrula' butonuna bas, hataları önceden yakala!",
                '💡 LED yanmıyorsa, uzun bacağın (+) pinde olduğundan emin ol.',
                "💡 Seri Port Ekranı'nı aç (Ctrl+Shift+M) ve sensör değerlerini izle.",
                '💡 delay() yerine millis() kullanarak çoklu görev yapabilirsin.',
            ],
            microbit: [
                "💡 LED'ler aynı zamanda ışık sensörü olarak çalışır!",
                '💡 A+B butonlarına aynı anda basmayı dene.',
                '💡 Radyo ile arkadaşınla mesajlaşabilirsin!',
                '💡 Pusula kullanmadan önce kart kalibre edilmeli.',
            ],
            scratch: [
                '💡 Kuklayı klonlayarak çok sayıda karakter oluşturabilirsin.',
                "💡 'Haber sal' bloğu ile kuklalar birbiriyle haberleşebilir.",
                '💡 Animasyon için kostümleri hızlıca değiştir.',
                "💡 Değişkenleri 'Sadece bu kukla için' yaparak bağımsız kontrol sağla.",
            ],
            mblock: [
                "💡 mBlock'ta hem sahnedeki Panda'yı hem Arduino'yu kodlayabilirsin.",
                '💡 Uzantılar bölümünden ek sensör blokları ekleyebilirsin.',
                "💡 'Canlı Mod'da kodu yüklemeden test edebilirsin.",
                '💡 Sayısal pin okuma 0 veya 1 döner, analog 0-1023 arası.',
            ],
            appinventor: [
                '💡 TinyDB ile verileri kalıcı olarak kaydedebilirsin.',
                '💡 Canvas üzerinde Ball ve ImageSprite ile oyun yapabilirsin.',
                '💡 Telefonu salla algılamak için AccelerometerSensor kullan.',
                '💡 Blok editöründe sağ tık ile kodu kopyalayabilirsin.',
            ],
        };

        const courseKey = window.app?.currentCourseKey || 'arduino';
        const courseTips = tips[courseKey] || tips.arduino;
        const randomTip = courseTips[Math.floor(Math.random() * courseTips.length)];

        let response = `<strong>${project.title}</strong> için ipucu:<br><br>${randomTip}`;

        if (project.challenge) {
            response += `<br><br>🏆 <strong>Meydan Okuma:</strong> ${project.challenge}`;
        }

        return response;
    },

    explainCurrentCode: () => {
        const project = window.app?.currentProject;
        if (!project || !project.code) {
            return 'Şu anki derste gösterilecek kod yok. Kod içeren bir ders seç!';
        }

        // Check if code is an image
        if (project.code.match(/\.(jpeg|jpg|gif|png)$/) != null) {
            return 'Bu derste blok tabanlı kod kullanılıyor. Resmi inceleyerek blokların ne yaptığını anlayabilirsin!';
        }

        const code = project.code;
        let explanation = '<strong>🔧 Kod Açıklaması:</strong><br><br>';

        // Simple code pattern explanations
        if (code.includes('pinMode')) {
            explanation += '• <code>pinMode(pin, OUTPUT/INPUT)</code>: Pini giriş veya çıkış olarak ayarlar.<br>';
        }
        if (code.includes('digitalWrite')) {
            explanation += '• <code>digitalWrite(pin, HIGH/LOW)</code>: Pine elektrik verir veya keser.<br>';
        }
        if (code.includes('digitalRead')) {
            explanation += '• <code>digitalRead(pin)</code>: Pinin durumunu okur (1 veya 0).<br>';
        }
        if (code.includes('analogRead')) {
            explanation += '• <code>analogRead(pin)</code>: Analog değer okur (0-1023).<br>';
        }
        if (code.includes('analogWrite')) {
            explanation += '• <code>analogWrite(pin, değer)</code>: PWM ile parlaklık/hız ayarlar (0-255).<br>';
        }
        if (code.includes('delay')) {
            explanation += '• <code>delay(ms)</code>: Belirtilen milisaniye kadar bekler.<br>';
        }
        if (code.includes('Serial')) {
            explanation += '• <code>Serial.begin/print</code>: Bilgisayarla haberleşme için.<br>';
        }
        if (code.includes('Servo')) {
            explanation += '• <code>Servo</code>: Servo motorları kontrol etmek için kütüphane.<br>';
        }

        explanation += "<br><em>Tam kodu görmek için 'Kod' sekmesine geç!</em>";

        return explanation;
    },

    getMaterialsInfo: () => {
        const project = window.app?.currentProject;
        if (!project || !project.materials || project.materials.length === 0) {
            return 'Bu derste özel malzeme listesi yok.';
        }

        let response = `<strong>📦 ${project.title} için gereken malzemeler:</strong><br><br>`;
        response += "<ul class='list-disc pl-4'>";
        project.materials.forEach((m) => {
            response += `<li>${m}</li>`;
        });
        response += '</ul>';

        if (project.circuit_desc) {
            response += `<br><strong>Bağlantı:</strong> ${project.circuit_desc}`;
        }

        return response;
    },

    // ============================================
    // GUIDED MODE
    // ============================================
    startGuidedMode: () => {
        const project = window.app?.currentProject;
        if (!project) {
            Assistant.addMessage('Rehber modu için önce bir ders seçmelisin! Ana sayfadan bir ders seç.');
            return;
        }

        Assistant.guidedMode = true;
        Assistant.currentStep = 0;

        Assistant.addMessage(
            '🎯 <strong>Rehber Modu Başladı!</strong><br><br>Seni bu derste adım adım yönlendireceğim.'
        );

        setTimeout(() => Assistant.showGuidedStep(), 500);
    },

    showGuidedStep: () => {
        const steps = Assistant.guidedSteps.default;
        const step = steps[Assistant.currentStep];

        if (!step) {
            Assistant.guidedMode = false;
            Assistant.addMessage(
                '🎉 <strong>Tebrikler!</strong> Rehberi tamamladın. Başka sorun varsa yardımcı olmaya hazırım!'
            );
            return;
        }

        // Add step message with options
        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = 'flex items-start';
        div.innerHTML = `
            <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-teal-200 max-w-[90%]">
                <div class="text-teal-600 text-xs font-bold mb-1">ADIM ${Assistant.currentStep + 1}/${Assistant.guidedSteps.default.length}</div>
                ${step.message}
                <div class="flex flex-wrap gap-2 mt-3">
                    ${step.options
                        .map(
                            (opt, i) =>
                                `<button onclick="Assistant.handleGuidedOption(${i}, '${opt}')" class="bg-teal-500 text-white px-3 py-1 rounded-full text-xs hover:bg-teal-600 transition">${opt}</button>`
                        )
                        .join('')}
                </div>
            </div>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    },

    handleGuidedOption: (index, optionText) => {
        // Add user's choice
        Assistant.addMessage(optionText, 'user');

        const project = window.app?.currentProject;

        // Handle special options
        if (optionText.includes('Görevi göster') && project) {
            Assistant.addMessage(`<strong>Görev:</strong> ${project.mission}`);
        } else if (optionText.includes('Malzemeleri göster') && project) {
            Assistant.addMessage(Assistant.getMaterialsInfo());
        } else if (optionText.includes('Şemayı göster')) {
            Assistant.addMessage('Devre şemasını görmek için <strong>Devre</strong> sekmesine tıkla!');
        } else if (optionText.includes('Hata aldım')) {
            Assistant.addMessage('Hata mesajını buraya yapıştır, birlikte çözelim! 🐞');
            return; // Don't advance step
        } else if (optionText.includes('Testi çöz')) {
            Assistant.addMessage('Test için <strong>Test</strong> sekmesine geç. Başarılar! 📝');
        } else if (optionText.includes('Meydan okumayı göster') && project?.challenge) {
            Assistant.addMessage(`🏆 <strong>Meydan Okuma:</strong><br><br>${project.challenge}`);
        }

        // Advance to next step
        Assistant.currentStep++;
        setTimeout(() => Assistant.showGuidedStep(), 800);
    },

    // ============================================
    // MESSAGE HANDLING
    // ============================================
    addMessage: (text, type = 'bot') => {
        if (!text) return;

        const container = document.getElementById('chat-messages');
        const div = document.createElement('div');
        div.className = `flex ${type === 'user' ? 'justify-end' : 'items-start'}`;

        const bubble = document.createElement('div');
        bubble.className =
            type === 'user'
                ? 'bg-teal-500 text-white p-3 rounded-2xl rounded-tr-none shadow-sm max-w-[85%]'
                : 'bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[85%]';

        bubble.innerHTML = text;
        div.appendChild(bubble);
        container.appendChild(div);

        container.scrollTop = container.scrollHeight;
    },

    setUserInput: (text) => {
        const input = document.getElementById('chat-input');
        input.value = text;
        Assistant.sendMessage();
    },

    sendMessage: () => {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        // User Message
        Assistant.addMessage(text, 'user');
        input.value = '';

        // Exit guided mode if user types something else
        if (Assistant.guidedMode && !text.toLowerCase().includes('devam')) {
            Assistant.guidedMode = false;
        }

        // Typing indicator
        const thinkingId = 'thinking-' + Date.now();
        const container = document.getElementById('chat-messages');
        container.innerHTML += `<div id="${thinkingId}" class="flex items-start"><div class="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-xs text-gray-500">Düşünüyor...</div></div>`;
        container.scrollTop = container.scrollHeight;

        setTimeout(() => {
            const thinkingEl = document.getElementById(thinkingId);
            if (thinkingEl) thinkingEl.remove();

            // Check if input is code
            if (Assistant.isCode(text)) {
                const analysis = Assistant.analyzeCode(text);
                Assistant.addMessage(analysis);
            } else {
                const response = Assistant.findResponse(text);
                if (response) Assistant.addMessage(response);
            }
        }, 600);
    },

    isCode: (text) => {
        return (
            (text.includes(';') && text.includes('(')) ||
            text.includes('{') ||
            text.includes('void ') ||
            text.includes('int ') ||
            text.includes('#include')
        );
    },

    analyzeCode: (code) => {
        const issues = [];

        const lines = code.split('\n');
        lines.forEach((line, i) => {
            const l = line.trim();
            if (
                l &&
                !l.startsWith('//') &&
                !l.startsWith('#') &&
                !l.endsWith('{') &&
                !l.endsWith('}') &&
                !l.endsWith(';') &&
                l.length > 3 &&
                !l.startsWith('*')
            ) {
                issues.push(`Satır ${i + 1}: Noktalı virgül (;) eksik olabilir.`);
            }
        });

        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            issues.push(`Parantez hatası: ${openBraces} adet '{' var ama ${closeBraces} adet '}' var.`);
        }

        const openParens = (code.match(/\(/g) || []).length;
        const closeParens = (code.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            issues.push(`Parantez hatası: ${openParens} adet '(' var ama ${closeParens} adet ')' var.`);
        }

        if (issues.length > 0) {
            return `<strong>🐞 Bulduğum sorunlar:</strong><br><ul class='list-disc pl-4 mt-2'>${issues.map((i) => `<li>${i}</li>`).join('')}</ul><br>Bunları kontrol et ve tekrar dene!`;
        } else {
            return '✅ Kodun yapısal olarak düzgün görünüyor! Mantık hatası olup olmadığını görmek için çalıştırıp test etmelisin.';
        }
    },

    findResponse: (text) => {
        const lower = text.toLowerCase();

        // Sort by priority (higher = more specific)
        const sortedRules = [...Assistant.rules].sort((a, b) => (b.priority || 0) - (a.priority || 0));

        const match = sortedRules.find((r) => r.keywords.some((k) => lower.includes(k)));

        if (match) {
            return typeof match.response === 'function' ? match.response() : match.response;
        }

        return "Bunu tam anlayamadım 😕 Şunları deneyebilirsin:<br>• 'İpucu ver'<br>• 'Kodu açıkla'<br>• 'Rehber başlat'<br>• Veya hatalı kodunu yapıştır.";
    },
};

window.Assistant = Assistant;
