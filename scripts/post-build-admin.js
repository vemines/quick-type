import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const releaseDir = path.resolve(__dirname, '../src-tauri/target/release');
const srcExe = path.join(releaseDir, 'QuickType.exe');
const destExe = path.join(releaseDir, 'QuickType_admin.exe');

if (fs.existsSync(srcExe)) {
  fs.copyFileSync(srcExe, destExe);
  console.log(`[SUCCESS] Copied ${srcExe} -> ${destExe}`);
} else {
  console.error(`[ERROR] Source executable not found: ${srcExe}`);
  process.exit(1);
}
