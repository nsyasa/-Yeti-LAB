window.courseData = window.courseData || {};
window.courseData.mblock = {
    "title": "mBlock Robotik",
    "description": "Blok Tabanlı Robotik",
    "data": {
        "componentInfo": {},
        "phases": [
            {
                "title": "🤖 Giriş",
                "weeks": [
                    1
                ],
                "color": "cyan"
            },
            {
                "title": "🚦 Temel Uygulamalar",
                "weeks": [
                    2,
                    3
                ],
                "color": "blue"
            },
            {
                "title": "🌡️ Sensör Dünyası",
                "weeks": [
                    4,
                    5
                ],
                "color": "green"
            },
            {
                "title": "🎹 İleri Seviye",
                "weeks": [
                    6,
                    7
                ],
                "color": "purple"
            }
        ],
        "projects": [
            {
                "id": 301,
                "phase": 0,
                "title": "mBlock Arayüzü",
                "icon": "🐼",
                "desc": "mBlock programını tanıyalım.",
                "hasGraph": false,
                "hasSim": true,
                "simType": "explorer_ide",
                "hotspots": [
                    {
                        "name": "Aygıtlar",
                        "desc": "Arduino veya diğer kartları seçtiğimiz sekme.",
                        "x": 100,
                        "y": 250,
                        "r": 40
                    },
                    {
                        "name": "Kuklalar",
                        "desc": "Sahne karakterlerini yönettiğimiz sekme.",
                        "x": 180,
                        "y": 250,
                        "r": 40
                    },
                    {
                        "name": "Bloklar",
                        "desc": "Kod bloklarının renkli listesi.",
                        "x": 80,
                        "y": 150,
                        "r": 60
                    },
                    {
                        "name": "Kod Alanı",
                        "desc": "Blokları dizdiğimiz çalışma alanı.",
                        "x": 300,
                        "y": 200,
                        "r": 80
                    }
                ],
                "mission": "mBlock arayüzünü ve cihaz/kukla ayrımını öğren.",
                "theory": "mBlock hem Arduino gibi kartları hem de sahnedeki pandayı kodlayabildiğimiz bir araçtır.",
                "materials": [],
                "mainComponent": "",
                "circuitImage": "mblock_interface.jpg",
                "circuit_desc": "mBlock 5 Arayüzü",
                "code": "",
                "challenge": "Uzantılar (Eklenti) butonunu bul."
            },
            {
                "id": 302,
                "phase": 1,
                "title": "İlk Göz Kırpma",
                "icon": "💡",
                "desc": "Dijital Çıkış (Blink).",
                "hasGraph": false,
                "hasSim": true,
                "simType": "blink",
                "mission": "Arduino üzerindeki LED'i yakıp söndür.",
                "theory": "mBlock'ta 'Pini Ayarla' bloğu ile elektriği açıp (Yüksek/1) kapatabiliriz (Düşük/0).",
                "materials": [
                    "Arduino Uno",
                    "LED"
                ],
                "code": "Arduino Başladığında:\\nSürekli Tekrarla:\\n  Sayısal pin 13 çıkışını (Yüksek) yap\\n  1 saniye bekle\\n  Sayısal pin 13 çıkışını (Düşük) yap\\n  1 saniye bekle",
                "challenge": "Yanıp sönme hızını artır.",
                "quiz": [
                    {
                        "q": "Dijital çıkışta 'Yüksek' (HIGH) ne anlama gelir?",
                        "options": ["Elektrik yok (0V)", "Elektrik var (5V)", "Yanlış sinyal", "Sensör değeri"],
                        "answer": 1
                    },
                    {
                        "q": "Arduino'da dahili LED hangi pine bağlıdır?",
                        "options": ["Pin 9", "Pin 10", "Pin 13", "Pin A0"],
                        "answer": 2
                    }
                ]
            },
            {
                "id": 303,
                "phase": 1,
                "title": "Trafik Lambası",
                "icon": "🚦",
                "desc": "Sıralı İşlemler.",
                "hasGraph": false,
                "hasSim": true,
                "simType": "traffic",
                "mission": "Kırmızı, Sarı ve Yeşil LED'leri sırayla yak.",
                "theory": "Kodlar yukarıdan aşağıya sırayla çalışır. Bekleme blokları sırayı kontrol etmek için önemlidir.",
                "materials": [
                    "Kırmızı LED",
                    "Sarı LED",
                    "Yeşil LED"
                ],
                "code": "Sürekli Tekrarla:\\n  Pin 9 Yüksek, Bekle 3sn, Pin 9 Düşük\\n  Pin 10 Yüksek, Bekle 1sn, Pin 10 Düşük\\n  Pin 11 Yüksek, Bekle 3sn, Pin 11 Düşük",
                "challenge": "Sarı ve Kırmızı aynı anda yansın.",
                "quiz": [
                    {
                        "q": "Kodlar nasıl çalışır?",
                        "options": ["Aynı anda", "Rastgele", "Yukarıdan aşağıya sırayla", "Tersinden"],
                        "answer": 2
                    },
                    {
                        "q": "Trafik lambasında sarı ışık ne için kullanılır?",
                        "options": ["Dur", "Geç", "Dikkat / Hazırlan", "Geri git"],
                        "answer": 2
                    }
                ]
            },
            {
                "id": 304,
                "phase": 1,
                "title": "Butonlu Lamba",
                "icon": "🔘",
                "desc": "Dijital Giriş.",
                "hasGraph": true,
                "hasSim": true,
                "simType": "button",
                "mission": "Butona basınca LED'i yak.",
                "theory": "Butonlar giriş elemanıdır. 'Eğer' bloğu ile butona basılıp basılmadığını kontrol ederiz.",
                "materials": [
                    "Buton",
                    "LED",
                    "Direnç"
                ],
                "code": "Sürekli Tekrarla:\\n  Eğer (Sayısal pin 2 okuma değeri = 1) ise:\\n    Pin 8 Yüksek yap\\n  Değilse:\\n    Pin 8 Düşük yap",
                "challenge": "Butona her basışta lamba durumunu değiştir (aç/kapa)."
            },
            {
                "id": 305,
                "phase": 1,
                "title": "Polis Çakarı",
                "icon": "🚓",
                "desc": "Hızlı Döngüler.",
                "hasGraph": false,
                "hasSim": true,
                "simType": "traffic",
                "mission": "İki LED'i sırayla çok hızlı yakıp söndür.",
                "theory": "Kısa bekleme süreleri (0.1 sn gibi) gözümüzde flaş etkisi yaratır.",
                "materials": [
                    "Kırmızı LED",
                    "Mavi LED"
                ],
                "code": "Sürekli Tekrarla:\\n  Pin 9 Yüksek, Pin 10 Düşük, Bekle 0.1sn\\n  Pin 9 Düşük, Pin 10 Yüksek, Bekle 0.1sn",
                "challenge": "Üçlü çakar yap (Kırmızı-Mavi-Beyaz)."
            },
            {
                "id": 306,
                "phase": 2,
                "title": "Mesafe Ölçer",
                "icon": "🦇",
                "desc": "Ultrasonik Sensör.",
                "hasGraph": true,
                "hasSim": true,
                "simType": "ultrasonic",
                "mission": "Mesafeyi ölçüp Panda'ya söylet.",
                "theory": "Ultrasonik sensör ses dalgaları ile ölçüm yapar. mBlock'ta hazır bloğu vardır.",
                "materials": [
                    "HC-SR04"
                ],
                "code": "Sürekli Tekrarla:\\n  Panda Konuş: (Ultrasonik Tetik 9 Echo 10 mesafesi)",
                "challenge": "Mesafe 10'dan küçükse Panda 'Dikkat!' desin."
            },
            {
                "id": 307,
                "phase": 2,
                "title": "Akıllı Gece Lambası",
                "icon": "🌙",
                "desc": "Analog Giriş (LDR).",
                "hasGraph": true,
                "hasSim": true,
                "simType": "streetLight",
                "mission": "Hava kararınca (Değer < 500) LED'i yak.",
                "theory": "Analog pinler 0-1023 arası değer okur. Kıyaslama operatörleri (<, >) ile karar veririz.",
                "materials": [
                    "LDR",
                    "Direnç",
                    "LED"
                ],
                "code": "Sürekli Tekrarla:\\n  Eğer (Analog pin A0 < 500) ise:\\n    Pin 13 Yüksek\\n  Değilse:\\n    Pin 13 Düşük",
                "challenge": "Işık azaldıkça LED parlaklığını artır."
            },
            {
                "id": 308,
                "phase": 2,
                "title": "Sıcaklık Göstergesi",
                "icon": "🌡️",
                "desc": "Veri Okuma.",
                "hasGraph": true,
                "hasSim": true,
                "simType": "dht",
                "mission": "Sıcaklığı ölç.",
                "theory": "Sensör verilerini 'Değişken' içinde saklayabiliriz.",
                "materials": [
                    "Sıcaklık Sensörü"
                ],
                "code": "Sürekli Tekrarla:\\n  Değişken Sıcaklık = DHT Pin 2 Sıcaklık\\n  Panda Düşün: (Sıcaklık)",
                "challenge": "Sıcaklık 30°C üstündeyse vantilatörü (Motor) çalıştır."
            },
            {
                "id": 309,
                "phase": 3,
                "title": "Hırsız Alarmı",
                "icon": "🚨",
                "desc": "Hareket Sensörü.",
                "hasGraph": true,
                "hasSim": true,
                "simType": "motion",
                "mission": "Hareket varsa ses çıkar.",
                "theory": "PIR sensörü hareket algılayınca 1 (High) gönderir.",
                "materials": [
                    "PIR Sensör",
                    "Buzzer"
                ],
                "code": "Sürekli Tekrarla:\\n  Eğer (Pin 2 = 1) ise:\\n    Pin 8 Nota C4 çal, 0.5 vuruş\\n  Değilse:\\n    Pin 8 sesi kapat",
                "challenge": "Alarm çaldığında LED'leri de yakıp söndür."
            },
            {
                "id": 310,
                "phase": 3,
                "title": "Bariyer Sistemi",
                "icon": "🚧",
                "desc": "Servo Motor.",
                "hasGraph": true,
                "hasSim": true,
                "simType": "servo",
                "mission": "Boşluk tuşuna basınca bariyeri kaldır.",
                "theory": "Servo motorlar belirli bir açıya (0-180) döner.",
                "materials": [
                    "Servo Motor"
                ],
                "code": "Sürekli Tekrarla:\\n  Eğer (Boşluk tuşu basılı?) ise:\\n    Servo Pin 9 Açısı 90\\n  Değilse:\\n    Servo Pin 9 Açısı 0",
                "challenge": "Bariyer açılırken sesli uyarı ver."
            },
            {
                "id": 311,
                "phase": 3,
                "title": "Piyano",
                "icon": "🎹",
                "desc": "Etkileşim.",
                "hasGraph": false,
                "hasSim": true,
                "simType": "melody",
                "mission": "Tuşlarla nota çal.",
                "theory": "Bilgisayar klavyesini Arduino'yu kontrol etmek için kullanabiliriz.",
                "materials": [
                    "Buzzer"
                ],
                "code": "Sürekli Tekrarla:\\n  Eğer (A tuşu basılı?) Nota C4 çal\\n  Eğer (S tuşu basılı?) Nota D4 çal",
                "challenge": "Kendi şarkını bestele."
            }
        ]
    }
};