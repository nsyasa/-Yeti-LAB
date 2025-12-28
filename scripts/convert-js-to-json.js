/**
 * convert-js-to-json.js
 * 
 * Bu script data/ klasöründeki JS dosyalarını JSON formatına dönüştürür.
 * Supabase import scripti için hazırlık yapar.
 * 
 * Kullanım: node scripts/convert-js-to-json.js
 * 
 * Çıktı: scripts/exports/ klasörüne JSON dosyaları oluşturur
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const dataDir = path.join(__dirname, '..', 'data');
const exportsDir = path.join(__dirname, 'exports');

// Ensure exports directory exists
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
}

// Files to convert
const jsFiles = [
    'arduino.js',
    'microbit.js',
    'scratch.js',
    'mblock.js',
    'appinventor.js'
];

// Mock window object for evaluation
function createMockWindow() {
    return {
        courseData: {},
        YetiLab: { courseData: {} },
        ArduinoCity: {}
    };
}

function convertFile(fileName) {
    const filePath = path.join(dataDir, fileName);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Dosya bulunamadı: ${fileName}`);
        return null;
    }

    console.log(`📖 Okunuyor: ${fileName}`);

    const jsContent = fs.readFileSync(filePath, 'utf8');

    // Create a sandbox with mock window
    const sandbox = {
        window: createMockWindow()
    };

    // Also add direct courseData reference
    sandbox.courseData = sandbox.window.courseData;

    try {
        // Run the JS file in sandbox
        vm.createContext(sandbox);
        vm.runInContext(jsContent, sandbox);

        // Extract course data
        const courseName = fileName.replace('.js', '');
        let courseData = sandbox.window.courseData[courseName] ||
            sandbox.courseData[courseName] ||
            sandbox.window.YetiLab?.courseData?.[courseName];

        if (!courseData) {
            console.log(`⚠️ Kurs verisi bulunamadı: ${courseName}`);
            return null;
        }

        // Save as JSON
        const jsonFileName = `${courseName}.json`;
        const jsonPath = path.join(exportsDir, jsonFileName);

        fs.writeFileSync(jsonPath, JSON.stringify(courseData, null, 2), 'utf8');

        console.log(`✅ Dönüştürüldü: ${jsonFileName}`);

        // Return stats
        const data = courseData.data || courseData;
        return {
            file: jsonFileName,
            title: courseData.title,
            phasesCount: data.phases?.length || 0,
            projectsCount: data.projects?.length || 0,
            componentsCount: Object.keys(data.componentInfo || {}).length
        };

    } catch (error) {
        console.error(`❌ Hata (${fileName}):`, error.message);
        return null;
    }
}

// Main
console.log('🚀 JS → JSON Dönüştürme Başlıyor...\n');
console.log(`📁 Kaynak: ${dataDir}`);
console.log(`📁 Hedef: ${exportsDir}\n`);

const results = [];

for (const file of jsFiles) {
    const result = convertFile(file);
    if (result) {
        results.push(result);
    }
}

console.log('\n📊 ÖZET:');
console.log('─'.repeat(60));

if (results.length === 0) {
    console.log('❌ Hiçbir dosya dönüştürülemedi!');
} else {
    results.forEach(r => {
        console.log(`✅ ${r.title}`);
        console.log(`   📁 ${r.file}`);
        console.log(`   📚 ${r.phasesCount} bölüm, ${r.projectsCount} proje, ${r.componentsCount} bileşen`);
    });

    console.log('─'.repeat(60));
    console.log(`\n✅ Toplam ${results.length} kurs JSON'a dönüştürüldü.`);
    console.log(`📁 Dosyalar: ${exportsDir}`);
    console.log('\n🔜 Sonraki adım:');
    console.log('   node scripts/import-to-supabase.js');
}
