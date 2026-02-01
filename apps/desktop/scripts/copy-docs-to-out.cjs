const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../..');
const desktopDir = path.resolve(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`[copy-docs] Source not found: ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[copy-docs] Copying docs templates to out directory...');

// Copy docs to out/docs
const docsSrc = path.join(rootDir, 'docs');
const docsDest = path.join(desktopDir, 'out', 'docs');

if (fs.existsSync(docsSrc)) {
  copyDir(docsSrc, docsDest);
  console.log('[copy-docs] Docs copied successfully to out/docs');
} else {
  console.warn('[copy-docs] Warning: docs not found in workspace root!');
}
