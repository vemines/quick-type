import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const releaseDir = path.resolve(__dirname, '../src-tauri/target/release');
const srcExe = path.join(releaseDir, 'QuickType.exe');
const destAdminExe = path.join(releaseDir, 'QuickType_admin.exe');

// 1. Tắt process đang chạy (tránh lock file nhị phân trên Windows)
try { execSync('taskkill /F /IM QuickType.exe /T', { stdio: 'ignore' }); } catch {}
try { execSync('taskkill /F /IM QuickType_admin.exe /T', { stdio: 'ignore' }); } catch {}

// 2. Build bản Admin
console.log('\n>>> [1/2] Building QuickType (Admin version)...');
execSync('npx tauri build --no-bundle --features admin-manifest', { stdio: 'inherit' });
if (fs.existsSync(srcExe)) {
  fs.copyFileSync(srcExe, destAdminExe);
  console.log(`[SUCCESS] Copied to: ${destAdminExe}`);
} else {
  console.error(`[ERROR] Source executable not found: ${srcExe}`);
  process.exit(1);
}

// 3. Build bản Thường
console.log('\n>>> [2/2] Building QuickType (Standard version)...');
execSync('npx tauri build --no-bundle', { stdio: 'inherit' });
console.log(`[SUCCESS] Generated: ${srcExe}`);

console.log('\n>>> [DONE] Built both QuickType.exe and QuickType_admin.exe successfully!\n');
