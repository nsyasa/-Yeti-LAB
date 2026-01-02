# ❄️ Yeti LAB

**İnteraktif Robotik ve Kodlama Eğitim Platformu**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://nsyasa.github.io/-Yeti-LAB/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 Proje Hakkında

Yeti LAB, öğrencilere Arduino, Micro:bit, Scratch, mBlock ve App Inventor gibi platformları öğreten interaktif bir eğitim platformudur. Öğretmenler sınıf oluşturabilir, öğrenci ilerlemelerini takip edebilir.

### ✨ Özellikler

- 🤖 **5 Farklı Kurs**: Arduino, Micro:bit, Scratch, mBlock, App Inventor
- 🎮 **İnteraktif Simülasyonlar**: Gerçek zamanlı devre simülasyonları
- 📊 **İlerleme Takibi**: Öğrenci bazlı ders tamamlama takibi
- 🏫 **Öğretmen Paneli**: Sınıf yönetimi ve ilerleme raporları
- 🧪 **Quiz Sistemi**: Her ders sonunda test
- 🏔️ **Yeti Asistan**: AI destekli yardımcı
- 🌙 **Karanlık Mod**: Göz yorgunluğunu azaltan tema
- 🌍 **Çoklu Dil**: Türkçe ve İngilizce desteği

---

## 🚀 Demo

**Canlı Site:** https://nsyasa.github.io/-Yeti-LAB/

| Sayfa           | Link                                                            |
| --------------- | --------------------------------------------------------------- |
| Ana Sayfa       | [index.html](https://nsyasa.github.io/-Yeti-LAB/)               |
| Giriş           | [auth.html](https://nsyasa.github.io/-Yeti-LAB/auth.html)       |
| Öğretmen Paneli | [teacher.html](https://nsyasa.github.io/-Yeti-LAB/teacher.html) |

---

## 🛠️ Teknolojiler

| Teknoloji        | Kullanım                          |
| ---------------- | --------------------------------- |
| **HTML/CSS/JS**  | Frontend                          |
| **Tailwind CSS** | Styling                           |
| **Supabase**     | Backend (Auth, Database, Storage) |
| **GitHub Pages** | Hosting                           |

---

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn

### Adımlar

```bash
# Repo'yu klonla
git clone https://github.com/nsyasa/-Yeti-LAB.git
cd -Yeti-LAB

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusu
npx http-server -p 3000
```

Tarayıcıda `http://localhost:3000` adresini açın.

---

## 📁 Proje Yapısı

```
-Yeti-LAB/
├── index.html          # Ana sayfa
├── auth.html           # Giriş sayfası
├── teacher.html        # Öğretmen paneli
├── profile.html        # Profil sayfası
├── admin.html          # Admin paneli
├── app.js              # Ana uygulama logic
├── modules/            # JavaScript modülleri
│   ├── auth.js         # Kimlik doğrulama
│   ├── progress.js     # İlerleme takibi
│   ├── ui.js           # UI yardımcıları
│   └── ...
├── data/               # Kurs verileri
│   ├── arduino.js
│   ├── microbit.js
│   └── ...
├── styles/             # CSS dosyaları
└── scripts/            # SQL ve yardımcı scriptler
```

---

## 🎓 Kullanım

### Öğrenci Olarak

1. Öğretmeninizden **sınıf kodunu** alın
2. [Giriş sayfası](https://nsyasa.github.io/-Yeti-LAB/auth.html)'ndan kodu girin
3. İsminizi yazın ve derslere başlayın!

### Öğretmen Olarak

1. Google veya GitHub ile giriş yapın
2. [Öğretmen paneli](https://nsyasa.github.io/-Yeti-LAB/teacher.html)'nden sınıf oluşturun
3. Sınıf kodunu öğrencilerinizle paylaşın
4. İlerlemelerini takip edin

---

## 🤝 Katkıda Bulunma

1. Repo'yu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 👤 İletişim

- **GitHub:** [@nsyasa](https://github.com/nsyasa)

---

<p align="center">
  Made with ❄️ by Yeti LAB Team
</p>
