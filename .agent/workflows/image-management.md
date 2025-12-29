# Hybrid Resim Yönetimi Rehberi

Bu rehber, Yeti LAB projesinde resim eklemenin 3 farklı yolunu açıklar.

## 📊 Genel Bakış

| Yöntem | Avantaj | Ne Zaman Kullan |
|--------|---------|----------------|
| **GitHub Pages** | Ücretsiz, sınırsız | Kalıcı resimler |
| **Supabase Storage** | Admin'den direkt yükleme | Hızlı test/deneme |
| **Harici URL** | Kolay paylaşım | Geçici resimler |

---

## 🔧 Yöntem 1: GitHub Pages (Ana Kaynak)

### Editör Akışı:

1. Resmi bilgisayarına indir (örn: `sensor_ldr.jpg`)
2. Resmi projenin `img/` klasörüne kopyala
3. Git ile commit & push yap:

```bash
cd /c/Users/Enes/Documents/-Yeti-LAB
git add img/sensor_ldr.jpg
git commit -m "LDR sensör resmi eklendi"
git push
```

4. Admin panelde dosya adını gir: `sensor_ldr.jpg`

### Avantajları:
- ✅ 100 GB/ay bandwidth (ücretsiz)
- ✅ CDN ile hızlı yükleme
- ✅ Git versiyon kontrolü

---

## ☁️ Yöntem 2: Supabase Storage (Admin Upload)

### Ön Gereksinimler:

1. Supabase Dashboard'da `images` bucket oluşturulmuş olmalı
2. Bucket public olmalı

### Editör Akışı:

1. Admin panelde bir ders seç
2. "Devre" sekmesine git
3. "⬆️ Yükle" butonuna tıkla
4. Dosyayı seç
5. Otomatik olarak yüklenir ve URL alana yazılır

### Avantajları:
- ✅ Admin panelden direkt yükleme
- ✅ Git bilgisi gerektirmez

### Sınırlamalar:
- ⚠️ 1 GB storage limiti (Free tier)
- ⚠️ 10 GB/ay bandwidth

---

## 🌐 Yöntem 3: Harici URL

### Editör Akışı:

1. Resmi bir servise yükle:
   - [Imgur](https://imgur.com)
   - [ImgBB](https://imgbb.com)
   - [Postimages](https://postimages.org)
2. Paylaşım URL'sini kopyala
3. Admin panelde URL'yi yapıştır

### Örnek:
```
https://i.imgur.com/abc123.png
```

### Avantajları:
- ✅ En kolay yöntem
- ✅ Anında kullanılabilir

### Sınırlamalar:
- ⚠️ Dış servislere bağımlılık
- ⚠️ Resimler silinebilir

---

## 🎯 Özet: Hangi Yöntemi Kullanmalıyım?

| Senaryo | Önerilen Yöntem |
|---------|-----------------|
| Yeni ders ekliyorum, kalıcı resim | **GitHub Pages** |
| Hızlı test ediyorum | **Supabase Upload** |
| Geçici demo yapıyorum | **Harici URL** |
| Teknik bilgim yok | **Supabase Upload** veya **Harici URL** |

---

## ⚙️ Teknik Notlar

### URL Çözümleme Mantığı:

```javascript
if (url.startsWith('http://') || url.startsWith('https://')) {
    // Direkt kullan (Supabase veya harici URL)
    return url;
} else {
    // Lokal dosya - img/ klasöründen
    return 'img/' + url;
}
```

### Desteklenen Formatlar:
- `.jpg`, `.jpeg`
- `.png`
- `.gif`
- `.webp`
