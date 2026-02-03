import { resolve } from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'vite'

const workspaceRoot = resolve(__dirname, '../..')

// Node.js built-in modules (with and without node: prefix)
const nodeBuiltins = [
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`)
]

// Modules that cannot be bundled (native binaries or legacy syntax)
const externalModules = [
  'electron',
  'better-sqlite3',
  'bufferutil',
  'utf-8-validate',
  'node-llama-cpp',
  '@napi-rs/canvas',
  'sharp',
  'sqlite-vec',
  '@lydell/node-pty',
  'jiti',
  // qrcode-terminal uses legacy octal escapes incompatible with strict mode
  'qrcode-terminal',
  // native modules
  '@mariozechner/clipboard',
  '@mariozechner/clipboard-win32-x64-msvc',
  '@mariozechner/clipboard-darwin-arm64',
  '@mariozechner/clipboard-darwin-x64',
  '@mariozechner/clipboard-linux-x64-gnu',
  // All Node.js built-ins
  ...nodeBuiltins
]

export default defineConfig({
  resolve: {
    alias: {
      'clawdbot': resolve(workspaceRoot, 'src/index.ts'),
      'node:sqlite': resolve(__dirname, 'src/main/node-sqlite-shim.ts')
    }
  },
  // SSR mode: treat this as server-side code
  ssr: {
    target: 'node',
    noExternal: true,
    external: externalModules
  },
  build: {
    target: 'node20',
    outDir: 'out/gateway',
    // Use SSR entry instead of lib mode for proper Node.js bundling
    ssr: resolve(workspaceRoot, 'src/entry.ts'),
    commonjsOptions: {
      ignoreDynamicRequires: true
    },
    rollupOptions: {
      external: externalModules,
      output: {
        format: 'cjs',
        entryFileNames: 'entry.cjs'
      }
    },
    emptyOutDir: true,
    minify: false
  }
})
