/**
 * Tab Configuration for Courses
 * Her kurs türü için sekme yapılarını ve başlıkları tanımlar.
 */

const TabConfig = {
    courses: {
        microbit: {
            tabs: [
                { id: 'mission', label: 'Amaç 🎯' },
                { id: 'materials', label: 'Donanım 🧩' },
                { id: 'circuit', label: 'Bloklar 🧱' },
                { id: 'code', label: 'Kod 💾' },
                { id: 'challenge', label: 'Görev 🚀' },
                { id: 'tip', label: 'İpucu 💡' },
                { id: 'quiz', label: 'Test 📝' }
            ],
            headers: {
                materials: "Gerekli Donanım",
                circuit: "Blok Diyagramı",
                code: "MakeCode / Python"
            }
        },
        scratch: {
            tabs: [
                { id: 'mission', label: '🎯 Amaç' },
                { id: 'materials', label: '🎭 Kuklalar' },
                { id: 'circuit', label: '🧩 Bloklar' },
                { id: 'code', label: '💻 Kod' },
                { id: 'challenge', label: '🏆 Görev' },
                { id: 'tip', label: '💡 İpucu' },
                { id: 'quiz', label: '📝 Test' }
            ],
            headers: {
                materials: "Kuklalar",
                circuit: "Blok Dizilimi"
            }
        },
        mblock: {
            tabs: [
                { id: 'mission', label: 'Amaç 🎯' },
                { id: 'materials', label: 'Aygıt & Uzantı 🔌' },
                { id: 'circuit', label: 'Bloklar 🧩' },
                { id: 'code', label: 'Kodlar 💻' },
                { id: 'challenge', label: 'Görevler 🏆' },
                { id: 'tip', label: 'İpucu 💡' },
                { id: 'quiz', label: 'Test 📝' }
            ],
            headers: {
                materials: "Aygıtlar ve Uzantılar",
                circuit: "Blok Yapısı"
            }
        },
        appinventor: {
            tabs: [
                { id: 'mission', label: 'Amaç 🎯' },
                { id: 'design', label: 'Tasarım 🎨' },
                { id: 'blocks', label: 'Bloklar 🧩' },
                { id: 'challenge', label: 'Görev 🏆' },
                { id: 'tip', label: 'İpucu 💡' },
                { id: 'quiz', label: 'Test 📝' }
            ],
            headers: {
                materials: "Gerekli Malzemeler",
                circuit: "Arayüz Tasarımı" // 'design' tabı aslında 'circuit' içeriğini kullanacak
            },
            // Özel ID eşleştirmeleri (Standart içerik anahtarlarını sekme ID'lerine yönlendirir)
            mapping: {
                'design': 'circuit', // design sekmesi -> circuit içeriğini gösterir
                'blocks': 'code'     // blocks sekmesi -> code içeriğini gösterir
            }
        },
        default: {
            tabs: [
                { id: 'mission', label: '🎯 Amaç' },
                { id: 'materials', label: '🧩 Devre Elemanları' },
                { id: 'circuit', label: '⚡ Devre' },
                { id: 'code', label: '💻 Kod' },
                { id: 'challenge', label: '🏆 Görev' },
                { id: 'tip', label: '💡 İpucu' },
                { id: 'quiz', label: '📝 Test' }
            ],
            headers: {
                materials: "Devre Elemanları",
                circuit: "Bağlantı Şeması",
                code: "Proje Kodu"
            }
        }
    },

    getConfig: (courseKey) => {
        return TabConfig.courses[courseKey] || TabConfig.courses.default;
    }
};

window.TabConfig = TabConfig;
