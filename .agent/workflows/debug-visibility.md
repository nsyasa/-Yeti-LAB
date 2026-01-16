---
description: Element görünmüyor sorununu debug et - Tailwind/CSS çakışmalarını tespit et
---

# 🔍 Debug Visibility / Element Görünmüyor

Bu workflow, bir elementin neden görünmediğini debug etmek için kullanılır.
Özellikle **Tailwind + Custom CSS** karışık kullanıldığında yararlıdır.

## Adım 1: Element'in Class Listesini Kontrol Et

DevTools → Elements → İlgili elementi bul → class listesine bak

**Aranacak Sınıflar:**

- `hidden` - Tailwind: display: none
- `invisible` - Tailwind: visibility: hidden
- `-translate-x-full` / `-translate-y-full` - Tailwind: ekran dışına itilmiş
- `opacity-0` - Tailwind: görünmez ama yer kaplıyor

## Adım 2: Custom CSS Class'larını Kontrol Et

CSS dosyasında (genellikle `src/input.css`) element için tanımlı kurallar var mı?

```css
/* Örnek: CSS'te .open class tanımı varsa */
#element.open {
    transform: translateX(0);
    visibility: visible;
}
```

## Adım 3: JS Toggle Fonksiyonunu İncele

Fonksiyon hangi class'ları ekliyor/siliyor?

```javascript
// ❌ YANLIŞ: Sadece CSS class'ı ekliyor, Tailwind class'larını kaldırmıyor
element.classList.add('open'); // Tailwind -translate-x-full hala override ediyor!

// ✅ DOĞRU: Önce Tailwind class'larını kaldır, sonra CSS class'ını ekle
element.classList.remove('invisible', '-translate-x-full');
element.classList.add('open');
```

## Adım 4: Specificity (Öncelik) Kontrolü

Tailwind class'ları genellikle daha spesifik. Computed Styles'ta bakarak hangisinin kazandığını gör:

1. DevTools → Element seç → Computed tab
2. `transform`, `visibility`, `display` değerlerine bak
3. Strikethrough olan kurallar override edilmiş demek

## Çözüm Stratejileri

### Strateji A: Tek Sistem Kullan

Ya sadece Tailwind ya da sadece CSS class'ları kullan, karıştırma:

```html
<!-- Seçenek 1: Tamamen Tailwind -->
<div
    class="invisible -translate-x-full data-[open=true]:visible data-[open=true]:translate-x-0"
    data-open="false"
></div>
```

```html
<!-- Seçenek 2: Tamamen CSS -->
<div class="sidebar-closed" id="sidebar">
    <!-- CSS: .sidebar-closed { visibility: hidden; transform: translateX(-100%); } -->
    <!-- CSS: .sidebar-open { visibility: visible; transform: translateX(0); } -->
</div>
```

### Strateji B: Her İki Sistemi Yönet

JS'te toggle yaparken HER İKİ sistemi de güncelle:

```javascript
// AÇARKEN
element.classList.remove('invisible', '-translate-x-full'); // Tailwind
element.classList.add('open'); // CSS

// KAPATIRKEN - Animasyon bittikten sonra
element.classList.remove('open'); // CSS
setTimeout(() => {
    element.classList.add('invisible', '-translate-x-full'); // Tailwind
}, 350); // CSS transition süresine eşit
```

## Uyarı Notu

> ⚠️ **Overlay vs Element Farklılığı**
>
> Bazen overlay (backdrop/karartma) doğru çalışır ama asıl element (sidebar/modal) çalışmaz.
> Bu durumda **element'in transform değerine** odaklan, overlay seni yanıltabilir!
