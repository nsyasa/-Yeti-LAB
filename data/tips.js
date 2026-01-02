// Tips Data - Part of ArduinoCity namespace
window.ArduinoCity = window.ArduinoCity || {};
window.ArduinoCity.tipsData = {
    // Component Specific Tips
    LED: {
        title: 'LED Kullanımı',
        text: "LED'lerin uzun bacağı (+) Anot, kısa bacağı (-) Katottur. Ters bağlarsan çalışmaz! Ayrıca patlamaması için her zaman direnç kullanmalısın.",
        icon: '💡',
    },
    Buton: {
        title: 'Buton Sinyalleri',
        text: "Butonların kararlı çalışması için 'Pull-down' veya 'Pull-up' direnci gerekir. Yoksa havadaki statik elektrikten etkilenip rastgele değerler okuyabilir.",
        icon: '🔘',
    },
    Potansiyometre: {
        title: 'Analog Okuma',
        text: "Potansiyometreler 0 ile 1023 arasında değer üretir. Ancak LED parlaklığı 0-255 arasıdır. Bu yüzden değeri 4'e bölmeyi unutma!",
        icon: '🎛️',
    },
    Servo: {
        title: 'Servo Motor Limiti',
        text: 'Servo motoru elinle zorla döndürmeye çalışma, dişlileri kırılabilir. Ayrıca 0 ve 180 derece sınırlarını kodla zorlama, motor ısınabilir.',
        icon: '🦾',
    },
    Ultrasonik: {
        title: 'Yankı Bekleme',
        text: 'Ultrasonik sensör sert ve düz yüzeylerde en iyi sonucu verir. Kumaş gibi yumuşak yüzeyler sesi yutar ve yanlış ölçüm yapabilir.',
        icon: '🦇',
    },
    LDR: {
        title: 'Işık Hassasiyeti',
        text: "LDR'nin üzerine doğrudan güçlü ışık tutarsan direnci çok düşer. Ortam ışığını ayarlamak için kalibrasyon yapman gerekebilir.",
        icon: '☀️',
    },
    DHT11: {
        title: 'Zamanlama Önemli',
        text: 'DHT11 sensöründen saniyede en fazla 1 kere okuma yapmalısın. Daha sık okursan hatalı sonuçlar alabilirsin.',
        icon: '🌡️',
    },
    Buzzer: {
        title: 'Aktif vs Pasif',
        text: "Aktif buzzer'a sadece elektrik verince öter. Pasif buzzer (bizim kullandığımız) ise nota çalmak için kodla frekans verilmesini ister.",
        icon: '🔊',
    },

    // Concept Specific Tips
    Döngü: {
        title: 'Sonsuz Döngü',
        text: "Arduino'da `void loop()` zaten sonsuz bir döngüdür. İçine `while(true)` yazmana gerek yoktur.",
        icon: '🔄',
    },
    Değişken: {
        title: 'Türkçe Karakter',
        text: 'Değişken isimlendirirken Türkçe karakter (ş, İ, ğ, ö, ç) ve boşluk kullanmamalısın. Örn: `isikSeviyesi` doğru, `ışık seviyesi` yanlıştır.',
        icon: '📝',
    },

    // Fallback (General) Tips
    General: [
        {
            title: 'Önce Algoritma',
            text: 'Kod yazmaya başlamadan önce ne yapacağını adım adım kağıda yazmak (Algoritma), işini çok kolaylaştırır.',
            icon: '🧠',
        },
        {
            title: 'Noktalı Virgül',
            text: "C++ dilinde (Arduino) her komut satırının sonuna noktalı virgül (;) koymayı unutma! Hataların %90'ı bundan kaynaklanır.",
            icon: ';)',
        },
        {
            title: 'Kabloları Kontrol Et',
            text: 'Kodun doğru ama çalışmıyor mu? Genelde suçlu koddur ama bazen de temassızlık yapan bir kablodur. Kablolarını kontrol et!',
            icon: '🔌',
        },
        {
            title: 'Yorum Satırları',
            text: 'Kodlarına `//` ile notlar al. Bir hafta sonra kendi koduna baktığında ne yaptığını hatırlamanı sağlar.',
            icon: '💬',
        },
    ],
};

// Backward compatibility alias
window.tipsData = window.ArduinoCity.tipsData;
