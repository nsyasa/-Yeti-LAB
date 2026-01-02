/**
 * Yeti LAB - Hotspot Editor Module
 * Micro:bit ve Arduino devre şemaları üzerinde etkileşim noktaları oluşturur.
 */

const HotspotEditor = {
    addMode: false,
    data: [], // Current hotspots list

    // Callbacks provided by parent (admin.js)
    onUpdate: null,

    /**
     * Initialize the editor with project data
     * @param {Array} existingHotspots - hotspots array from project
     * @param {string} imgSource - URL or path to circuit image
     * @param {Function} updateCallback - Function to call when data changes
     */
    init: (existingHotspots, imgSource, updateCallback) => {
        HotspotEditor.data = existingHotspots || [];
        HotspotEditor.onUpdate = updateCallback;
        HotspotEditor.addMode = false;

        const img = document.getElementById('hotspot-image');

        // Handle both "img/file.jpg" and "file.jpg" formats
        // If it starts with http, leave it be
        let imgPath = imgSource;
        if (!imgPath.startsWith('http')) {
            imgPath = imgPath.startsWith('img/') ? imgPath : `img/${imgPath}`;
        }

        // Reset onerror before setting new src
        img.onerror = null;
        img.src = imgPath;

        // Set error handler
        img.onerror = function () {
            this.onerror = null;
            this.style.display = 'none';
            const editor = document.getElementById('hotspot-editor');
            if (!editor.querySelector('.error-msg')) {
                const msg = document.createElement('div');
                msg.className =
                    'error-msg absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-center p-4';
                msg.innerHTML = `<div><div class="text-4xl mb-2">🖼️</div><div>Resim bulunamadı:<br><code class="text-xs">${imgPath}</code></div></div>`;
                editor.appendChild(msg);
            }
        };

        // On load
        img.onload = function () {
            this.style.display = 'block';
            const oldMsg = document.getElementById('hotspot-editor').querySelector('.error-msg');
            if (oldMsg) oldMsg.remove();
        };

        HotspotEditor.renderMarkers();
        HotspotEditor.renderList();

        // Reset button state
        const btn = document.getElementById('btn-hotspot-mode');
        if (btn) {
            btn.textContent = '🎯 Nokta Ekle Modu';
            btn.classList.add('bg-orange-600');
            btn.classList.remove('bg-green-600');
        }
        const layer = document.getElementById('hotspot-click-layer');
        if (layer) layer.style.cursor = 'default';
    },

    toggleMode: () => {
        HotspotEditor.addMode = !HotspotEditor.addMode;
        const btn = document.getElementById('btn-hotspot-mode');
        const layer = document.getElementById('hotspot-click-layer');

        if (HotspotEditor.addMode) {
            btn.textContent = '✋ İptal (Ekleme Modu Açık)';
            btn.classList.remove('bg-orange-600');
            btn.classList.add('bg-green-600');
            layer.style.cursor = 'crosshair';
        } else {
            btn.textContent = '🎯 Nokta Ekle Modu';
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-orange-600');
            layer.style.cursor = 'default';
        }
    },

    handleClick: (e) => {
        if (!HotspotEditor.addMode) return;

        const editor = document.getElementById('hotspot-editor');
        const img = document.getElementById('hotspot-image');
        const imgRect = img.getBoundingClientRect();

        // Calculate click position relative to image
        const clickX = e.clientX - imgRect.left;
        const clickY = e.clientY - imgRect.top;

        // Normalize to image dimensions (0-100%)
        const percentX = Math.round((clickX / imgRect.width) * 100);
        const percentY = Math.round((clickY / imgRect.height) * 100);

        // Check bounds
        if (percentX < 0 || percentX > 100 || percentY < 0 || percentY > 100) return;

        // Prompt for hotspot name
        const name = prompt('Bu noktanın adı ne olsun? (örn: USB Port)');
        if (!name) return;

        const desc = prompt('Açıklama girin (örn: Bilgisayara bağlanmak için kullanılır)') || '';

        // Add to data
        const newHotspot = {
            name: name,
            desc: desc,
            x: percentX,
            y: percentY,
            r: 15, // Default radius
        };

        HotspotEditor.data.push(newHotspot);
        HotspotEditor.sync();
        HotspotEditor.renderMarkers();
        HotspotEditor.renderList();

        // Auto-disable add mode after adding
        HotspotEditor.toggleMode();
    },

    renderMarkers: () => {
        const container = document.getElementById('hotspot-markers');
        container.innerHTML = '';

        HotspotEditor.data.forEach((hs, index) => {
            const marker = document.createElement('div');
            marker.className =
                'absolute w-6 h-6 bg-orange-500 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-xs text-white font-bold';
            marker.style.left = `calc(${hs.x}% - 12px)`;
            marker.style.top = `calc(${hs.y}% - 12px)`;
            marker.style.pointerEvents = 'auto';
            marker.style.cursor = 'pointer';
            marker.textContent = index + 1;
            marker.title = hs.name;
            marker.onclick = () => HotspotEditor.select(index);
            container.appendChild(marker);
        });
    },

    renderList: () => {
        const list = document.getElementById('hotspot-list');

        if (HotspotEditor.data.length === 0) {
            list.innerHTML =
                '<div class="text-center text-gray-400 text-sm py-4">Henüz nokta eklenmedi. "Nokta Ekle Modu"nu açıp resme tıklayın.</div>';
            return;
        }

        list.innerHTML = HotspotEditor.data
            .map(
                (hs, i) => `
            <div class="flex items-center justify-between bg-white p-2 rounded border text-sm">
                <div class="flex items-center gap-2">
                    <span class="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">${i + 1}</span>
                    <div>
                        <div class="font-bold text-gray-700">${hs.name}</div>
                        <div class="text-xs text-gray-400">${hs.desc || 'Açıklama yok'}</div>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button type="button" onclick="HotspotEditor.edit(${i})" class="text-blue-500 hover:text-blue-700 p-1">✏️</button>
                    <button type="button" onclick="HotspotEditor.delete(${i})" class="text-red-500 hover:text-red-700 p-1">🗑️</button>
                </div>
            </div>
        `
            )
            .join('');
    },

    select: (index) => {
        const markers = document.querySelectorAll('#hotspot-markers > div');
        markers.forEach((m, i) => {
            if (i === index) {
                m.classList.add('ring-2', 'ring-yellow-400');
            } else {
                m.classList.remove('ring-2', 'ring-yellow-400');
            }
        });
    },

    edit: (index) => {
        const hs = HotspotEditor.data[index];
        const newName = prompt('Yeni isim:', hs.name);
        if (newName === null) return;

        const newDesc = prompt('Yeni açıklama:', hs.desc);
        if (newDesc === null) return;

        hs.name = newName;
        hs.desc = newDesc;

        HotspotEditor.sync();
        HotspotEditor.renderMarkers();
        HotspotEditor.renderList();
    },

    delete: (index) => {
        if (!confirm(`"${HotspotEditor.data[index].name}" noktasını silmek istediğinize emin misiniz?`)) return;

        HotspotEditor.data.splice(index, 1);
        HotspotEditor.sync();
        HotspotEditor.renderMarkers();
        HotspotEditor.renderList();
    },

    clearAll: () => {
        if (HotspotEditor.data.length === 0) return;
        if (!confirm('Tüm etkileşim noktalarını silmek istediğinize emin misiniz?')) return;

        HotspotEditor.data = [];
        HotspotEditor.sync();
        HotspotEditor.renderMarkers();
        HotspotEditor.renderList();
    },

    // Notify parent to save
    sync: () => {
        if (HotspotEditor.onUpdate) HotspotEditor.onUpdate(HotspotEditor.data);
    },
};

window.HotspotEditor = HotspotEditor;
