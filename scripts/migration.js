/**
 * Yeti LAB - Modüler Multi-Kurs Migration Scripti
 * 
 * Kullanım:
 *   node scripts/migration.js                    # Tüm kursları aktar
 *   node scripts/migration.js arduino            # Sadece Arduino
 *   node scripts/migration.js arduino,microbit   # Seçili kurslar
 * 
 * Gereksinimler:
 *   .env dosyasında SUPABASE_URL ve SUPABASE_ANON_KEY tanımlanmalı
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { COURSE_CONFIGS } from './course-configs.js';

// ==========================================
// .ENV DOSYASINI OKU
// ==========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

// .env dosyasını manuel parse et (dotenv yerine)
function loadEnv() {
    if (!existsSync(envPath)) {
        console.error('❌ .env dosyası bulunamadı!');
        console.log('   Lütfen .env.example dosyasını .env olarak kopyalayıp doldurun.');
        process.exit(1);
    }

    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    }
}

loadEnv();

// ==========================================
// SUPABASE BAĞLANTISI
// ==========================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ SUPABASE_URL ve SUPABASE_ANON_KEY .env dosyasında tanımlanmalı!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// YARDIMCI FONKSİYONLAR
// ==========================================

/**
 * .js dosyasından kurs verisini çıkar
 */
function extractCourseData(filePath) {
    if (!existsSync(filePath)) {
        console.error(`   ❌ Dosya bulunamadı: ${filePath}`);
        return null;
    }

    const content = readFileSync(filePath, 'utf-8');

    // window.courseData.XXX = {...} formatından JSON çıkar
    const match = content.match(/window\.courseData\.\w+\s*=\s*(\{[\s\S]*\});?\s*$/);

    if (!match) {
        console.error(`   ❌ Veri formatı tanınmadı: ${filePath}`);
        return null;
    }

    try {
        // JSON5 benzeri format, eval ile parse (dikkatli kullanım)
        const jsonStr = match[1];
        // Trailing comma ve JS syntax temizliği
        const cleanJson = jsonStr
            .replace(/,(\s*[}\]])/g, '$1')  // Trailing comma
            .replace(/\\n/g, '\\n');        // Newline escape

        return JSON.parse(cleanJson);
    } catch (e) {
        // Alternatif: Function constructor ile
        try {
            const func = new Function('return ' + match[1]);
            return func();
        } catch (e2) {
            console.error(`   ❌ JSON parse hatası: ${e2.message}`);
            return null;
        }
    }
}

/**
 * Tek bir kursu migrate et
 */
async function migrateCourse(courseKey) {
    const config = COURSE_CONFIGS[courseKey];

    if (!config) {
        console.error(`❌ Kurs bulunamadı: ${courseKey}`);
        console.log(`   Mevcut kurslar: ${Object.keys(COURSE_CONFIGS).join(', ')}`);
        return false;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📚 ${config.title} (${config.slug})`);
    console.log(`${'='.repeat(50)}`);

    // 1. Veri dosyasını oku
    console.log('📖 Veri dosyası okunuyor...');
    const courseData = extractCourseData(config.dataFile);

    if (!courseData) {
        return false;
    }

    const data = courseData.data || courseData;
    console.log(`   ✓ ${data.projects?.length || 0} proje, ${data.phases?.length || 0} faz bulundu`);

    // 2. Kursu oluştur veya bul
    console.log('📦 Kurs kontrol ediliyor...');
    let { data: existingCourse } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', config.slug)
        .maybeSingle();

    let courseId;

    if (existingCourse) {
        courseId = existingCourse.id;
        console.log(`   ✓ Mevcut kurs: ${courseId}`);
    } else {
        const { data: newCourse, error } = await supabase
            .from('courses')
            .insert({
                slug: config.slug,
                title: config.title,
                description: config.description,
                theme_color: config.theme_color,
                meta: { icon: config.icon },
                is_published: false
            })
            .select()
            .single();

        if (error) {
            console.error(`   ❌ Kurs oluşturulamadı: ${error.message}`);
            console.log(`   💡 RLS hatası ise Supabase Dashboard'dan ekleyin.`);
            return false;
        }

        courseId = newCourse.id;
        console.log(`   ✓ Yeni kurs oluşturuldu: ${courseId}`);
    }

    // 3. Fazları aktar
    console.log('📁 Fazlar aktarılıyor...');
    const phaseIdMap = {};
    const phases = data.phases || [];

    for (let i = 0; i < phases.length; i++) {
        const phase = phases[i];
        const phaseName = phase.title || `Faz ${i + 1}`;

        let { data: existingPhase } = await supabase
            .from('phases')
            .select('id')
            .eq('course_id', courseId)
            .eq('name', phaseName)
            .maybeSingle();

        if (existingPhase) {
            phaseIdMap[i] = existingPhase.id;
        } else {
            const { data: newPhase, error } = await supabase
                .from('phases')
                .insert({
                    course_id: courseId,
                    name: phaseName,
                    description: phase.description || '',
                    position: i,
                    meta: { color: phase.color, weeks: phase.weeks }
                })
                .select()
                .single();

            if (error) {
                console.error(`   ❌ Faz ${i} eklenemedi: ${error.message}`);
                continue;
            }

            phaseIdMap[i] = newPhase.id;
            console.log(`   ✓ ${phaseName}`);
        }
    }

    // 4. Bileşenleri aktar
    const componentInfo = data.componentInfo || {};
    if (Object.keys(componentInfo).length > 0) {
        console.log('🔧 Bileşenler aktarılıyor...');
        for (const [key, compData] of Object.entries(componentInfo)) {
            const { error } = await supabase
                .from('course_components')
                .upsert({
                    course_id: courseId,
                    key: key,
                    data: compData
                }, { onConflict: 'course_id,key' });

            if (!error) {
                console.log(`   ✓ ${key}`);
            }
        }
    }

    // 5. Projeleri aktar
    console.log('📚 Projeler aktarılıyor...');
    const projects = data.projects || [];
    let stats = { success: 0, skip: 0, error: 0 };

    for (const project of projects) {
        const phaseId = phaseIdMap[project.phase];

        if (!phaseId) {
            console.error(`   ❌ Proje ${project.id}: Faz ${project.phase} bulunamadı`);
            stats.error++;
            continue;
        }

        const projectSlug = `project-${project.id}`;

        // Mevcut kontrol
        let { data: existing } = await supabase
            .from('projects')
            .select('id')
            .eq('course_id', courseId)
            .eq('slug', projectSlug)
            .maybeSingle();

        if (existing) {
            stats.skip++;
            continue;
        }

        const { error } = await supabase
            .from('projects')
            .insert({
                course_id: courseId,
                phase_id: phaseId,
                slug: projectSlug,
                title: project.title,
                description: project.desc,
                materials: project.materials || [],
                circuit: project.circuit_desc,
                code: project.code,
                simulation: project.simType || null,
                challenge: project.challenge,
                position: project.id,
                is_published: true,
                component_info: {
                    icon: project.icon,
                    hasGraph: project.hasGraph,
                    hasSim: project.hasSim,
                    mission: project.mission,
                    theory: project.theory,
                    mainComponent: project.mainComponent || null,
                    hotspots: project.hotspots || null,
                    circuitImage: project.circuitImage || null,
                    quiz: project.quiz || []
                }
            });

        if (error) {
            console.error(`   ❌ ${project.title}: ${error.message}`);
            stats.error++;
        } else {
            stats.success++;
        }
    }

    console.log(`   📊 ${stats.success} eklendi, ${stats.skip} mevcut, ${stats.error} hatalı`);

    // 6. Kursu yayınla
    console.log('🌐 Kurs yayınlanıyor...');
    await supabase
        .from('courses')
        .update({ is_published: true })
        .eq('id', courseId);

    console.log(`✅ ${config.title} tamamlandı!`);
    return true;
}

// ==========================================
// ANA FONKSİYON
// ==========================================

async function main() {
    console.log('🚀 Yeti LAB Migration v2.0\n');

    // Argümanları al
    const args = process.argv.slice(2);
    let coursesToMigrate;

    if (args.length === 0) {
        // Tüm kurslar
        coursesToMigrate = Object.keys(COURSE_CONFIGS);
        console.log('📋 Tüm kurslar aktarılacak...');
    } else {
        // Seçili kurslar
        coursesToMigrate = args[0].split(',').map(s => s.trim().toLowerCase());
    }

    console.log(`   Kurslar: ${coursesToMigrate.join(', ')}`);

    let successCount = 0;
    for (const courseKey of coursesToMigrate) {
        const result = await migrateCourse(courseKey);
        if (result) successCount++;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🎉 TAMAMLANDI: ${successCount}/${coursesToMigrate.length} kurs aktarıldı`);
    console.log(`${'='.repeat(50)}`);
}

main().catch(console.error);
