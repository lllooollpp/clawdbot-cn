import { app, shell, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

console.log('[OpenClaw] Electron version:', process.versions.electron)
console.log('[OpenClaw] Node version:', process.versions.node)

import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
const __dirname = dirname(fileURLToPath(import.meta.url))
const icon = fileURLToPath(new URL('../../resources/icon.png', import.meta.url))

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isAppQuitting = false
const gatewayLogBuffer: string[] = []
const maxGatewayLogLines = 300

function sendGatewayLog(line: string): void {
  gatewayLogBuffer.push(line)
  if (gatewayLogBuffer.length > maxGatewayLogLines) {
    gatewayLogBuffer.splice(0, gatewayLogBuffer.length - maxGatewayLogLines)
  }
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('gateway-log', line)
}

ipcMain.handle('gateway-log-buffer', () => gatewayLogBuffer.slice())

function findNodeBin(): string {
  if (process.env.CLAWDBOT_NODE_BIN) return process.env.CLAWDBOT_NODE_BIN
  const pathEnv = process.env.PATH ?? ''
  const parts = pathEnv.split(process.platform === 'win32' ? ';' : ':')
  const candidates = process.platform === 'win32' ? ['node.exe', 'node'] : ['node']
  for (const dir of parts) {
    const trimmed = dir.trim()
    if (!trimmed) continue
    for (const name of candidates) {
      const full = join(trimmed, name)
      if (fs.existsSync(full)) return full
    }
  }
  return 'node'
}

async function startGateway(): Promise<void> {
  const stateDir = app.getPath('userData')
  const configPath = join(stateDir, 'openclaw.json')

  // Ensure config directory exists
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true })
  }

  // Double-check: Create a minimal config if none exists to satisfy the "mode=local" check
  if (!fs.existsSync(configPath)) {
    console.log('[OpenClaw] Initializing default config at:', configPath)
    const defaultConfig = {
      gateway: {
        mode: 'local',
        bind: 'loopback',
        port: 18789
      },
      agents: {
        defaults: {
          model: {
            primary: 'volcengine/glm-4-plus' // 或者是你常用的 GLM 标识符
          }
        }
      }
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
  }

  // Pass through existing API keys from the host system environment
  const keys = [
    'ZAI_API_KEY', 'Z_AI_API_KEY', 
    'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 
    'GEMINI_API_KEY', 'DEEPSEEK_API_KEY'
  ]
  keys.forEach(key => {
    if (process.env[key]) {
      process.env[key] = process.env[key]
    }
  })

  // Pre-set configuration environment variables
  process.env.CLAWDBOT_STATE_DIR = stateDir
  process.env.CLAWDBOT_CONFIG_PATH = configPath
  process.env.CLAWDBOT_GATEWAY_MODE = 'local'
  process.env.CLAWDBOT_SKIP_UPDATE_CHECK = '1'
  process.env.CLAWDBOT_NO_RESPAWN = '1'
  
  const workspaceRoot = resolve(__dirname, '../../../..')
  const nodeBin = findNodeBin()
  const gatewayArgs = [
    nodeBin,
    '--import',
    'tsx',
    'src/entry.ts',
    'gateway',
    'run',
    '--bind',
    'loopback',
    '--port',
    '18789',
    '--allow-unconfigured',
    '--force'
  ]
  
  console.log('[OpenClaw] Starting gateway with args:', gatewayArgs)
  console.log('[OpenClaw] State directory:', process.env.CLAWDBOT_STATE_DIR)
  sendGatewayLog(`[OpenClaw] Starting gateway with args: ${gatewayArgs.join(' ')}`)
  sendGatewayLog(`[OpenClaw] State directory: ${process.env.CLAWDBOT_STATE_DIR ?? ''}`)
  
  try {
    // Run CLI in a separate Node process to avoid Electron's Node runtime.
    const child = spawn(gatewayArgs[0], gatewayArgs.slice(1), {
      cwd: workspaceRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true
    })
    child.stdout?.on('data', (data) => {
      const text = data.toString('utf-8')
      process.stdout.write(text)
      text
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => sendGatewayLog(line))
    })
    child.stderr?.on('data', (data) => {
      const text = data.toString('utf-8')
      process.stderr.write(text)
      text
        .split(/\r?\n/)
        .filter(Boolean)
        .forEach((line) => sendGatewayLog(line))
    })
    child.on('error', (err) => {
      console.error('[OpenClaw] Failed to spawn gateway process:', err)
      sendGatewayLog(`[OpenClaw] Failed to spawn gateway process: ${String(err)}`)
    })
    child.on('exit', (code, signal) => {
      if (signal) {
        console.error('[OpenClaw] Gateway process exited with signal:', signal)
        sendGatewayLog(`[OpenClaw] Gateway process exited with signal: ${signal}`)
        return
      }
      if (code && code !== 0) {
        console.error('[OpenClaw] Gateway process exited with code:', code)
        sendGatewayLog(`[OpenClaw] Gateway process exited with code: ${code}`)
      }
    })
    console.log('[OpenClaw] Gateway initialization triggered')

    // Poll for gateway readiness to load the UI
    const checkGatewayReady = async (): Promise<void> => {
      try {
        const response = await fetch('http://127.0.0.1:18789/health')
        if (response.ok) {
          console.log('[OpenClaw] Gateway is ready, loading dashboard')
          mainWindow?.loadURL('http://127.0.0.1:18789')
          return
        }
      } catch (err) {
        // Expected while starting
      }
      setTimeout(checkGatewayReady, 1000)
    }
    checkGatewayReady()
  } catch (error) {
    console.error('[OpenClaw] Failed to start gateway:', error)
  }
}

function createWindow(): void {
  console.log('[OpenClaw] Creating window...')
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    console.log('[OpenClaw] Window ready to show')
    mainWindow?.show()
    mainWindow?.focus() // Force focus
  })

  // Fallback if ready-to-show doesn't fire
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('[OpenClaw] ready-to-show timeout, forcing show')
      mainWindow.show()
    }
  }, 5000)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the local dashboard or our custom renderer
  // If the gateway is running, we can load http://127.0.0.1:18789 directly
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Handle window close to hide to tray
  mainWindow.on('close', (event) => {
    if (!isAppQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
    return false
  })
}

function createTray(): void {
  const trayIcon = nativeImage.createFromPath(icon)
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }))
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show OpenClaw', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      isAppQuitting = true
      app.quit()
    }}
  ])

  tray.setToolTip('OpenClaw Gateway')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => mainWindow?.show())
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.openclaw.desktop')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray()
  
  // Start the gateway logic
  startGateway()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Keep running in tray
  }
})
