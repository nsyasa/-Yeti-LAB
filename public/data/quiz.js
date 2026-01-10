// Quiz Data - Part of YetiLab namespace
window.YetiLab = window.YetiLab || {};
window.YetiLab.quizData = {
    // Project 0: Donanımı Tanıyalım
    0: [
        {
            q: "Arduino Uno kartının 'beyni' olan mikrodenetleyici hangisidir?",
            options: ['Intel i7', 'ATmega328P', 'Snapdragon 888', 'Arduino Core'],
            answer: 1, // 0-indexed (B şıkkı)
        },
        {
            q: 'Kod yüklemek için hangi portu kullanırız?',
            options: ['Güç Girişi', 'HDMI Portu', 'USB Portu', 'Kulaklık Girişi'],
            answer: 2,
        },
        {
            q: 'Reset butonu ne işe yarar?',
            options: ['Kartı kapatır', 'Kodu siler', 'Kodu baştan başlatır', 'Bilgisayarı kapatır'],
            answer: 2,
        },
    ],
    // Project 1: Yazılımı Tanıyalım
    1: [
        {
            q: 'Arduino IDE nedir?',
            options: [
                'Bir oyun motorudur',
                'Kod yazma ve yükleme programıdır',
                '3D çizim programıdır',
                'Virüs temizleme programıdır',
            ],
            answer: 1,
        },
        {
            q: 'Yazdığımız kodda hata olup olmadığını kontrol etmek için hangi butona basarız?',
            options: ['Kontrol Et (Tik İşareti)', 'Yükle (Ok İşareti)', 'Yeni Dosya', 'Kaydet'],
            answer: 0,
        },
        {
            q: "Arduino'dan gelen mesajları okuduğumuz pencerenin adı nedir?",
            options: ['Mesaj Kutusu', 'Seri Port Ekranı', 'Terminal', 'Chat Ekranı'],
            answer: 1,
        },
    ],
    // Project 2: Blink
    2: [
        {
            q: "Dijital dünyada 'HIGH' komutu ne anlama gelir?",
            options: ['0 Volt (Kapalı)', '2.5 Volt (Yarım)', '5 Volt (Açık)', '100 Volt (Tehlikeli)'],
            answer: 2,
        },
        {
            q: '1 saniye beklemek için hangi komut kullanılır?',
            options: ['wait(1)', 'sleep(1000)', 'delay(1000)', 'stop(1)'],
            answer: 2,
        },
        {
            q: "LED'in uzun bacağı hangisidir?",
            options: ['Anot (+)', 'Katot (-)', 'Nötr', 'Toprak'],
            answer: 0,
        },
    ],
};

// Backward compatibility aliases
window.quizData = window.YetiLab.quizData;
window.ArduinoCity = window.ArduinoCity || {};
window.ArduinoCity.quizData = window.YetiLab.quizData;
