// Rozet Tanımları
const BADGES = [
    {
        id: 'newbie',
        icon: '🌱',
        title: 'İlk Adım',
        description: 'İlk dersini başarıyla tamamladın.',
        condition: (stats) => stats.totalLessons >= 1,
    },
    {
        id: 'worker',
        icon: '🐝',
        title: 'Çalışkan Arı',
        description: '5 farklı dersi tamamladın.',
        condition: (stats) => stats.totalLessons >= 5,
    },
    {
        id: 'master',
        icon: '🚀',
        title: 'Usta Yeti',
        description: '10 ders tamamladın! Artık bir uzmansın.',
        condition: (stats) => stats.totalLessons >= 10,
    },
    {
        id: 'brain',
        icon: '🧠',
        title: 'Bilgi Küpü',
        description: 'Quiz ortalaman %80 ve üzeri.',
        condition: (stats) => stats.quizAvg >= 80 && stats.totalLessons >= 3,
    },
    {
        id: 'fire',
        icon: '🔥',
        title: 'Alev Alan',
        description: '3 gün üst üste ders çalıştın! Zinciri kırma.',
        condition: (stats) => stats.streak >= 3,
    },
    {
        id: 'star',
        icon: '⭐',
        title: 'Yıldız Öğrenci',
        description: 'Tüm quizlerden tam puan aldın!',
        condition: (stats) => stats.quizAvg === 100 && stats.totalLessons >= 5,
    },
];

// Global scope'a ekleyelim ki her yerden erişilebilsin
window.BadgeSystem = {
    getAll: () => BADGES,

    // Kullanıcının kazandığı rozetleri hesapla
    calculateEarned: (stats) => {
        return BADGES.filter((badge) => {
            try {
                return badge.condition(stats);
            } catch (e) {
                console.warn('Badge calculation error:', e);
                return false;
            }
        });
    },
};
