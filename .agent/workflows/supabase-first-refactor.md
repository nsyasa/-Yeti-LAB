---
description: Supabase-First Admin Panel Refactoring - Eylem Planı
---

# Supabase-First Admin Panel Refactoring

Bu workflow, admin panelindeki veri yönetimini tamamen Supabase'e dayalı hale getirmek için adımları içerir.

## ✅ Tamamlanan Adımlar

### ADIM 1: Supabase Schema Kontrolü

- [x] `projects` tablosu yapısı incelendi
- [x] `position` kolonu mevcut (kritik)
- [x] UNIQUE constraint: `(course_id, slug)`
- [x] RLS politikaları doğru yapılandırılmış

### ADIM 3: Slug Stratejisi Değişikliği

- [x] `syncProjects()` fonksiyonunda slug artık `p-{position}` formatında
- [x] `saveProjectToSupabase()` fonksiyonunda slug aynı formata getirildi
- [x] Başlık değiştiğinde yeni kayıt oluşmuyor

### ADIM 4: Proje CRUD Düzeltmeleri

- [x] `deleteProjectByPosition()` metodu eklendi
- [x] `ProjectManager.delete()` artık Supabase'den de siliyor
- [x] `ProjectManager.add()` Supabase max position kontrolü yapıyor
- [x] `saveProjectToSupabase()` tutarlı slug kullanıyor

### ADIM 6: Faz CRUD Düzenlemesi

- [x] Faz dropdown'ı ders formunda mevcut fazları gösteriyor
- [x] `PhaseManager.add()` Supabase'e kaydediyor
- [x] `PhaseManager.delete()` Supabase'den siliyor
- [x] `PhaseManager.update()` Supabase'e güncelliyor

### Veritabanı Temizliği

- [x] 26 duplicate proje silindi
- [x] Tüm sluglar `p-X` formatına güncellendi
- [x] Duplicate Microbit kursu silindi

### UUID Doğrulama

- [x] `progress.js`'te UUID doğrulaması eklendi
- [x] Geçersiz student_id otomatik temizleniyor

## ⏳ Bekleyen Adımlar

(Tüm adımlar tamamlandı! 🎉)

## Kod Değişiklikleri Özeti

### `modules/admin/supabase-sync.js`

1. `syncProjects()` - Slug `p-{position}` formatında
2. `saveProjectToSupabase()` - Aynı slug formatı
3. `deleteProjectByPosition()` - Yeni metod

### `modules/admin/projects.js`

1. `delete()` - Supabase'den siliyor
2. `add()` - Supabase max position kontrolü
3. `populatePhaseDropdown()` - Yeni metod
4. Config'e `getPhases` eklendi

### `modules/progress.js`

1. UUID doğrulaması ve otomatik session temizleme

### `admin.html`

1. Faz seçimi `<input>` → `<select>` değiştirildi
