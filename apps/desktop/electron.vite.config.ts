import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

// 根项目路径（workspace root）
const workspaceRoot = resolve(__dirname, '../..')

export default defineConfig({
  main: {
    plugins: [
      // Disable automatic externalization to bundle dependencies (including clawdbot)
      // externalizeDepsPlugin({ exclude: ['clawdbot'] })
    ],
    resolve: {
      alias: {
        // 让 Vite 正确解析 workspace 包 - 指向 src 目录以便在改动代码后无需 build 即可生效
        'clawdbot/cli/run-main.js': resolve(workspaceRoot, 'src/cli/run-main.ts'),
        'clawdbot': resolve(workspaceRoot, 'src/index.ts'),
        'node:sqlite': resolve(__dirname, 'src/main/node-sqlite-shim.ts')
      }
    },
    build: {
      lib: {
        entry: resolve('src/main/index.ts'),
        formats: ['cjs']
      },
      rollupOptions: {
        output: {
          entryFileNames: 'index.cjs',
          chunkFileNames: 'chunks/[name]-[hash].cjs'
        },
        // 只排除真正的原生模块（需要 .node 文件或特殊编译的）
        external: [
          'electron',
          'better-sqlite3',
          'bufferutil',
          'utf-8-validate',
           'jiti',
          'node-llama-cpp',
          '@napi-rs/canvas',
          'sharp',
          'sqlite-vec',
          '@lydell/node-pty'
        ]
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve('src/preload/index.ts')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
