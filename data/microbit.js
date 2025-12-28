window.courseData = window.courseData || {};
window.courseData.microbit = {
    "title": "Micro:bit ile Kodlama",
    "description": "Eğlenceli ve Kolay Başlangıç",
    "data": {
        "componentInfo": {},
        "phases": [
            {
                "title": "🚀 Başlangıç",
                "weeks": [
                    1
                ],
                "color": "orange"
            },
            {
                "title": "💡 Temel Özellikler",
                "weeks": [
                    2,
                    3
                ],
                "color": "blue"
            },
            {
                "title": "🌡️ Sensörler",
                "weeks": [
                    4,
                    5
                ],
                "color": "green"
            },
            {
                "title": "📡 İleri Seviye",
                "weeks": [
                    6,
                    7
                ],
                "color": "purple"
            }
        ],
        "projects": [
            {
                "id": 101,
                "phase": 0,
                "title": "Micro:bit Tanışma",
                "icon": "📟",
                "desc": "Kartın özelliklerini keşfet.",
                "hasGraph": false,
                "hasSim": true,
                "simType": "explorer_board",
                "circuitImage": "",
                "hotspots": null,
                "mission": "Micro:bit üzerindeki butonları ve sensörleri incele.",
                "theory": "Micro:bit, üzerinde LED ekran, butonlar ve sensörler barındıran minik bir bilgisayardır.",
                "materials": [],
                "mainComponent": "Micro:bit",
                "circuit_desc": "Micro:bit Ön Yüzü",
                "code": "",
                "challenge": "",
                "enableHotspots": false,
                "showHotspotsInLab": false,
                "hiddenTabs": [
                    "circuit",
                    "code",
                    "challenge",
                    "quiz"
                ]
            },
            {
                "id": 102,
                "phase": 1,
                "title": "Kalp Atışı",
                "icon": "❤️",
                "desc": "LED ekranda ikon gösterimi.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Micro:bit ekranında atan bir kalp animasyonu oluştur.",
                "theory": "Micro:bit üzerinde 25 adet (5x5) kırmızı LED bulunur. Bunları yakarak şekiller ve yazılar oluşturabiliriz. 'Icon' blokları hazır şekilleri kullanmamızı sağlar.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "USB kablosu ile bilgisayara bağla.",
                "code": "basic.showIcon(IconNames.Heart)\\nbasic.pause(500)\\nbasic.showIcon(IconNames.SmallHeart)\\nbasic.pause(500)",
                "challenge": "Kalp atış hızını arttır.",
                "quiz": [
                    {
                        "q": "Micro:bit üzerinde kaç adet LED bulunur?",
                        "options": ["16 adet (4x4)", "25 adet (5x5)", "36 adet (6x6)", "9 adet (3x3)"],
                        "answer": 1
                    },
                    {
                        "q": "Animasyon hızını yavaşlatmak için ne yapmalıyız?",
                        "options": ["LED sayısını azalt", "pause süresini artır", "Kalp boyutunu küçült", "Kodu sil"],
                        "answer": 1
                    }
                ]
            },
            {
                "id": 103,
                "phase": 1,
                "title": "Merhaba Dünya",
                "icon": "👋",
                "desc": "Kayan yazı gösterimi.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Ekranda kendi adını veya 'Merhaba' yazısını kaydır.",
                "theory": "LED matris küçük olduğu için uzun yazılar sığmaz. Bu yüzden yazılar sağdan sola doğru kayarak (scrolling) gösterilir.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "USB kablosu ile bilgisayara bağla.",
                "code": "basic.showString('Merhaba Dunya!')",
                "challenge": "Kendi ismini ve ardından bir gülücük ikonunu göster.",
                "quiz": [
                    {
                        "q": "Uzun yazılar neden kaydırılarak gösterilir?",
                        "options": ["Daha güzel görünsün diye", "LED matris küçük olduğu için sığmaz", "Pil tasarrufu için", "Zorunlu değil, tercih meselesi"],
                        "answer": 1
                    },
                    {
                        "q": "showString komutu ne yapar?",
                        "options": ["Sayı gösterir", "Müzik çalar", "Yazı kaydırarak gösterir", "LED'leri kapatır"],
                        "answer": 2
                    }
                ]
            },
            {
                "id": 104,
                "phase": 1,
                "title": "Buton Kontrolü",
                "icon": "🅰️",
                "desc": "A ve B butonlarını kullanma.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "A butonuna basınca gülen yüz, B butonuna basınca üzgün yüz göster.",
                "theory": "Micro:bit üzerinde kullanıcı girişi için iki adet buton (A ve B) bulunur. Bunlar 'Input' (Giriş) olarak çalışır.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "USB kablosu ile bilgisayara bağla.",
                "code": "input.onButtonPressed(Button.A, function () {\\n    basic.showIcon(IconNames.Happy)\\n})\\ninput.onButtonPressed(Button.B, function () {\\n    basic.showIcon(IconNames.Sad)\\n})",
                "challenge": "A ve B'ye aynı anda basınca (A+B) şaşkın yüz göster.",
                "quiz": [
                    {
                        "q": "Micro:bit üzerinde kaç adet buton vardır?",
                        "options": ["1", "2", "3", "4"],
                        "answer": 1
                    },
                    {
                        "q": "Butonlar hangi tür giriş olarak çalışır?",
                        "options": ["Analog giriş", "Dijital giriş", "Ses girişi", "Işık girişi"],
                        "answer": 1
                    }
                ]
            },
            {
                "id": 105,
                "phase": 2,
                "title": "Dijital Termometre",
                "icon": "🌡️",
                "desc": "Sıcaklık sensörü kullanımı.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Ortam sıcaklığını ölçüp ekranda sayı olarak göster.",
                "theory": "Micro:bit'in işlemcisi içinde dahili bir sıcaklık sensörü vardır. Bu sensör işlemcinin sıcaklığını ölçer ancak genellikle ortam sıcaklığına çok yakındır.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "USB kablosu ile bilgisayara bağla.",
                "code": "input.onButtonPressed(Button.A, function () {\\n    basic.showNumber(input.temperature())\\n})",
                "challenge": "Sıcaklık 25 derecenin üzerindeyse güneş ikonu göster.",
                "quiz": [
                    {
                        "q": "Micro:bit'in sıcaklık sensörü nerededir?",
                        "options": ["Harici bir sensör gerekir", "LED'lerin arkasında", "İşlemcinin içinde", "Butonların altında"],
                        "answer": 2
                    },
                    {
                        "q": "input.temperature() komutu ne döndürür?",
                        "options": ["Işık seviyesi", "Derece cinsinden sıcaklık", "Nem oranı", "Pil durumu"],
                        "answer": 1
                    }
                ]
            },
            {
                "id": 106,
                "phase": 2,
                "title": "Gece Lambası",
                "icon": "💡",
                "desc": "Işık seviyesi sensörü.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Ortam karardığında LED ekranı otomatik olarak yak.",
                "theory": "Micro:bit LED'leri aynı zamanda ışık sensörü olarak da kullanılabilir! LED'ler üzerine düşen ışık miktarını ölçebilir.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "USB kablosu ile bilgisayara bağla.",
                "code": "basic.forever(function () {\\n    if (input.lightLevel() < 50) {\\n        basic.showLeds(`\\n            # # # # #\\n            # # # # #\\n            # # # # #\\n            # # # # #\\n            # # # # #\\n            `)\\n    } else {\\n        basic.clearScreen()\\n    }\\n})",
                "challenge": "Işık seviyesine göre parlaklığı ayarla (Daha karanlık -> Daha parlak).",
                "quiz": [
                    {
                        "q": "Micro:bit ışığı nasıl algılar?",
                        "options": ["Harici LDR ile", "LED'leri sensör olarak kullanarak", "Kamera ile", "Algılayamaz"],
                        "answer": 1
                    },
                    {
                        "q": "lightLevel() hangi aralıkta değer döner?",
                        "options": ["0-100", "0-255", "0-1023", "0-50"],
                        "answer": 1
                    }
                ]
            },
            {
                "id": 107,
                "phase": 2,
                "title": "Salla Beni",
                "icon": "📳",
                "desc": "İvmeölçer ve Jestler.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Micro:bit'i salladığında rastgele bir sayı (zar) tut.",
                "theory": "İvmeölçer (Accelerometer), kartın hareketini ve duruşunu algılar. 'Shake' (Sallama), 'Tilt' (Eğme) gibi hareketleri kodlayabiliriz.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "Pille çalıştırıp eline alabilirsin.",
                "code": "input.onGesture(Gesture.Shake, function () {\\n    basic.showNumber(randint(1, 6))\\n})",
                "challenge": "Ekran aşağı (Screen Down) baktığında uyumasını (ekranı kapatmasını) sağla.",
                "quiz": [
                    {
                        "q": "İvmeölçer (Accelerometer) ne algılar?",
                        "options": ["Ses dalgalarını", "Kartın hareket ve duruşunu", "Manyetik alanı", "Işık miktarını"],
                        "answer": 1
                    },
                    {
                        "q": "Zar için rastgele sayı aralığı ne olmalı?",
                        "options": ["0-5", "1-6", "0-6", "1-10"],
                        "answer": 1
                    }
                ]
            },
            {
                "id": 108,
                "phase": 2,
                "title": "Pusula",
                "icon": "🧭",
                "desc": "Manyetometre kullanımı.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Micro:bit ile Kuzey yönünü bul.",
                "theory": "Dahili manyetometre, Dünya'nın manyetik alanını algılar. Kullanmadan önce kalibre edilmesi (çevrilmesi) gerekir.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "USB veya Pil ile çalıştır.",
                "code": "basic.forever(function () {\\n    let degree = input.compassHeading()\\n    if (degree < 45 || degree > 315) {\\n        basic.showString(\"N\")\\n    } else {\\n        basic.clearScreen()\\n    }\\n})",
                "challenge": "Doğu, Batı ve Güney yönlerini de gösterecek şekilde geliştir."
            },
            {
                "id": 109,
                "phase": 3,
                "title": "Adımsayar",
                "icon": "👣",
                "desc": "Değişkenler ve Mantık.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Her adım attığında (sallandığında) sayacı bir arttır.",
                "theory": "Verileri hafızada tutmak için 'Değişkenler' (Variables) kullanılır. Adım sayısını bir değişkende tutup ekrana yazdıracağız.",
                "materials": [
                    "Micro:bit",
                    "Pil Yuvası"
                ],
                "circuit_desc": "Ayağına veya beline bağla.",
                "code": "let adim = 0\\ninput.onGesture(Gesture.Shake, function () {\\n    adim += 1\\n    basic.showNumber(adim)\\n})",
                "challenge": "A+B butonuna basınca sayacı sıfırla."
            },
            {
                "id": 110,
                "phase": 3,
                "title": "Telsiz Mesajlaşma",
                "icon": "📡",
                "desc": "Radyo özelliği.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "İki Micro:bit arasında emoji veya yazı gönder.",
                "theory": "Micro:bit'ler radyo dalgaları ile kablosuz haberleşebilir. Aynı 'Grup' numarasını kullanan kartlar birbirini duyar.",
                "materials": [
                    "2x Micro:bit"
                ],
                "circuit_desc": "En az iki kart gerekli.",
                "code": "radio.setGroup(1)\\ninput.onButtonPressed(Button.A, function () {\\n    radio.sendString(\"Selam\")\\n})\\nradio.onReceivedString(function (receivedString) {\\n    basic.showString(receivedString)\\n})",
                "challenge": "Gizli bir mesajlaşma sistemi kur (Şifreli haberleşme)."
            },
            {
                "id": 111,
                "phase": 3,
                "title": "Harici LED",
                "icon": "🔌",
                "desc": "Pin kullanımı (GPIO).",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Micro:bit'in pinlerine harici bir LED bağlayıp yak.",
                "theory": "Micro:bit'in altındaki altın renkli şeritler (Pinler) dış dünyaya açılan kapılardır. 0, 1 ve 2 nolu pinler kolayca kullanılabilir.",
                "materials": [
                    "Micro:bit",
                    "LED",
                    "Direnç",
                    "Krokodil Kablo"
                ],
                "circuit_desc": "LED'in uzun bacağı Pin 0'a, kısa bacağı GND'ye.",
                "code": "basic.forever(function () {\\n    pins.digitalWritePin(DigitalPin.P0, 1)\\n    basic.pause(1000)\\n    pins.digitalWritePin(DigitalPin.P0, 0)\\n    basic.pause(1000)\\n})",
                "challenge": "Bir buton bağlayarak harici LED'i kontrol et."
            },
            {
                "id": 112,
                "phase": 2,
                "title": "Taş Kağıt Makas",
                "icon": "✂️",
                "desc": "Sallayarak oyun oyna.",
                "hasGraph": false,
                "hasSim": false,
                "simType": "none",
                "mission": "Micro:bit'i salladığında rastgele Taş, Kağıt veya Makas göster.",
                "theory": "Rastgele sayı üretimi ve Eğer/Değilse (Conditionals) yapısı. Bilgisayar 1, 2 veya 3 tutar; biz bunu şekillere eşitleriz.",
                "materials": [
                    "Micro:bit"
                ],
                "circuit_desc": "Pille çalıştırıp eline alabilirsin.",
                "code": "input.onGesture(Gesture.Shake, function () {\\n    let el = randint(1, 3)\\n    if (el == 1) {\\n        basic.showIcon(IconNames.SmallSquare)\\n    } else if (el == 2) {\\n        basic.showIcon(IconNames.Square)\\n    } else {\\n        basic.showIcon(IconNames.Scissors)\\n    }\\n})",
                "challenge": "Skor tutmak için değişken kullan."
            }
        ]
    }
};