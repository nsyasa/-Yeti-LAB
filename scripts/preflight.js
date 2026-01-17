#!/usr/bin/env node
/**
 * Preflight Check Script
 * Release öncesi kalite kapısı - tek komutla tüm kontrolleri çalıştır
 *
 * Kullanım: npm run preflight
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let hasErrors = false;

function log(color, icon, message) {
    console.log(`${color}${icon} ${message}${RESET}`);
}

function runCommand(cmd, description) {
    log(CYAN, '🔄', `${description}...`);
    try {
        execSync(cmd, { stdio: 'inherit', cwd: ROOT });
        log(GREEN, '✅', `${description} PASS`);
        return true;
    } catch {
        log(RED, '❌', `${description} FAIL`);
        hasErrors = true;
        return false;
    }
}

function checkGitStatus() {
    log(CYAN, '🔍', 'Git status kontrol ediliyor...');
    try {
        const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf-8' });
        if (status.trim()) {
            log(YELLOW, '⚠️', 'Git working directory temiz değil:');
            console.log(status);
            log(YELLOW, '💡', 'Öneri: Değişiklikleri commit edin veya stash yapın');
            // Warning, not error - allow continuing
            return true;
        }
        log(GREEN, '✅', 'Git working directory temiz');
        return true;
    } catch {
        log(RED, '❌', 'Git status kontrol edilemedi');
        hasErrors = true;
        return false;
    }
}

function checkArtifacts() {
    log(CYAN, '🔍', 'Build artifact kontrolü...');
    const artifacts = [];

    // Check for vite timestamp files
    const rootFiles = readdirSync(ROOT);
    const timestampFiles = rootFiles.filter((f) => f.match(/^vite\.config\.mjs\.timestamp-.*\.mjs$/));
    if (timestampFiles.length > 0) {
        artifacts.push(...timestampFiles.map((f) => `Root: ${f}`));
    }

    // Check for coverage directory in git
    try {
        const gitFiles = execSync('git ls-files coverage/', { cwd: ROOT, encoding: 'utf-8' });
        if (gitFiles.trim()) {
            artifacts.push('coverage/ directory tracked in git');
        }
    } catch {
        // coverage not in git, which is good
    }

    // Check for .nyc_output
    if (existsSync(join(ROOT, '.nyc_output'))) {
        try {
            const gitFiles = execSync('git ls-files .nyc_output/', { cwd: ROOT, encoding: 'utf-8' });
            if (gitFiles.trim()) {
                artifacts.push('.nyc_output/ tracked in git');
            }
        } catch {
            // not in git, which is good
        }
    }

    if (artifacts.length > 0) {
        log(RED, '❌', "Build artifact tespit edildi (git'te olmamalı):");
        artifacts.forEach((a) => console.log(`   - ${a}`));
        log(YELLOW, '💡', 'Çözüm: git rm --cached <file> ve .gitignore güncelle');
        hasErrors = true;
        return false;
    }

    log(GREEN, '✅', 'Build artifact yok');
    return true;
}

function main() {
    console.log('\n' + '='.repeat(50));
    log(CYAN, '🚀', 'PREFLIGHT CHECK BAŞLIYOR');
    console.log('='.repeat(50) + '\n');

    // Step 1: Git status
    checkGitStatus();

    // Step 2: Artifact check
    checkArtifacts();

    // Step 3: Build
    console.log('');
    if (!runCommand('npm run build', 'Build')) {
        log(RED, '🛑', 'Build başarısız - test atlanıyor');
        process.exit(1);
    }

    // Step 4: Test
    console.log('');
    runCommand('npm test', 'Unit/Integration Tests');

    // Summary
    console.log('\n' + '='.repeat(50));
    if (hasErrors) {
        log(RED, '❌', 'PREFLIGHT FAILED - Yukarıdaki hataları düzeltin');
        process.exit(1);
    } else {
        log(GREEN, '✅', 'PREFLIGHT PASS - Release için hazır!');
        process.exit(0);
    }
}

main();
