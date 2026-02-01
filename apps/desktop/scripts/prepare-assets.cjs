const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../..');
const desktopDir = path.resolve(__dirname, '..');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules') continue; // Don't copy node_modules
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('[OpenClaw] Copying extensions and SDK to local folders...');

// Extensions
const extensionsDir = path.join(rootDir, 'extensions');
if (fs.existsSync(extensionsDir)) {
  const entries = fs.readdirSync(extensionsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const src = path.join(extensionsDir, entry.name);
      const dest = path.join(desktopDir, 'extensions', entry.name);
      console.log(` - extension: ${entry.name}`);
      copyDir(src, dest);
    }
  }
}

// Plugin SDK and core dependencies
const srcFolders = [
  'plugin-sdk',
  'channels',
  'plugins',
  'config',
  'wizard',
  'routing',
  'agents',
  'auto-reply',
  'infra',
  'logging',
  'media',
  'discord',
  'imessage',
  'slack',
  'telegram',
  'signal',
  'web',
  'whatsapp',
  'line',
  'feishu',
  'wecom',
  'hooks',
  'terminal',
  'assistant-identity',
  'types',
  'shared',
  'memory',
  'sessions',
  'providers',
  'utils',
  'gateway',
  'cli',
  'process',
  'markdown',
  'commands',
  'pairing',
  'security',
  'tts',
  'tui',
  'browser',
  'canvas-host',
  'cron',
  'daemon',
  'link-understanding',
  'macos',
  'media-understanding',
  'node-host',
  'acp',
  'docs'
];

console.log(' - core source folders');
for (const folder of srcFolders) {
  const src = path.join(rootDir, 'src', folder);
  const dest = path.join(desktopDir, 'src', folder);
  if (fs.existsSync(src)) {
    copyDir(src, dest);
  }
}

// Support files
const srcFiles = ['utils.ts', 'runtime.ts', 'index.ts', 'version.ts', 'logger.ts', 'globals.ts', 'entry.ts', 'logging.ts', 'polls.ts', 'channel-web.ts'];
for (const file of srcFiles) {
  const src = path.join(rootDir, 'src', file);
  const dest = path.join(desktopDir, 'src', file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Control UI (Web Dashboard)
const uiSrc = path.join(rootDir, 'dist', 'control-ui');
const uiDest = path.join(desktopDir, 'control-ui');
if (fs.existsSync(uiSrc)) {
  console.log(' - control-ui');
  copyDir(uiSrc, uiDest);
} else {
  console.warn('[OpenClaw] Warning: dist/control-ui not found, dashboard will be missing!');
}

// Documentation templates
const docsSrc = path.join(rootDir, 'docs');
const docsDest = path.join(desktopDir, 'docs');
if (fs.existsSync(docsSrc)) {
  console.log(' - docs templates');
  copyDir(docsSrc, docsDest);
}

console.log('[OpenClaw] Assets prepared.');
