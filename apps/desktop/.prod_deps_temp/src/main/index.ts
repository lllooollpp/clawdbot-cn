import { app, shell, BrowserWindow, Tray, Menu, nativeImage, ipcMain } from 'electron'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { spawn } from 'child_process'

console.log('[Clawdbot] Electron version:', process.versions.electron)
console.log('[Clawdbot] Node version:', process.versions.node)

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

function findNodeBin(): string | null {
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
  return null
}

async function startGateway(): Promise<void> {
  const stateDir = app.getPath('userData')
  const configPath = join(stateDir, 'clawdbot.json')

  // Ensure config directory exists
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true })
  }

  // Double-check: Create a minimal config if none exists to satisfy the "mode=local" check
  if (!fs.existsSync(configPath)) {
    console.log('[Clawdbot] Initializing default config at:', configPath)
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
  process.env.CLAWDBOT_NODE_OPTIONS_READY = '1'
  
  const isPackaged = app.isPackaged
  const workspaceRoot = isPackaged ? app.getAppPath() : resolve(__dirname, '../../../..')
  console.log('[Clawdbot] Workspace root:', workspaceRoot)
  const nodeBin = findNodeBin()
  const packagedRoot = process.resourcesPath
  const entryTs = join(workspaceRoot, 'src/entry.ts')
  const entryJs = join(workspaceRoot, 'dist/entry.js')
  
  // Try both ASAR and unpacked paths
  let packagedEntryJs = join(packagedRoot, 'app.asar', 'node_modules', 'clawdbot', 'dist', 'entry.js')
  if (!fs.existsSync(packagedEntryJs)) {
      packagedEntryJs = join(packagedRoot, 'app', 'node_modules', 'clawdbot', 'dist', 'entry.js')
  }
  
  if (isPackaged && !fs.existsSync(packagedEntryJs)) {
    console.error('[Clawdbot] Packaged entry.js missing at:', packagedEntryJs)
    sendGatewayLog(`[Clawdbot] Packaged entry.js missing at: ${packagedEntryJs}`)
  }
  
  const entryPath = isPackaged
    ? packagedEntryJs
    : (fs.existsSync(entryJs) ? entryJs : entryTs)

  const shouldUseElectronNode =
    isPackaged ||
    !nodeBin ||
    !fs.existsSync(nodeBin) ||
    entryPath.includes('app.asar')
  const spawnBin = shouldUseElectronNode ? process.execPath : nodeBin
  
  // ERROR FIX: Packaged Electron executables reject the '--run-as-node' command line flag.
  // We must rely solely on the ELECTRON_RUN_AS_NODE environment variable.
  const runAsNodeArgs: string[] = [] 
  
  const gatewayArgs = entryPath.endsWith('.js')
    ? [...runAsNodeArgs, entryPath, 'gateway', 'run', '--bind', 'loopback', '--port', '18789', '--allow-unconfigured', '--force']
    : [...runAsNodeArgs, '--import', 'tsx', entryPath, 'gateway', 'run', '--bind', 'loopback', '--port', '18789', '--allow-unconfigured', '--force']

  // Don't use asar path for cwd, it causes spawn ENOENT on Windows
  const spawnCwd = isPackaged ? dirname(process.execPath) : workspaceRoot

  console.log('[Clawdbot] Starting gateway with:', spawnBin, gatewayArgs)
  console.log('[Clawdbot] CWD:', spawnCwd)
  console.log('[Clawdbot] State directory:', process.env.CLAWDBOT_STATE_DIR)
  sendGatewayLog(`[Clawdbot] Starting gateway with: ${[spawnBin, ...gatewayArgs].join(' ')}`)
  sendGatewayLog(`[Clawdbot] CWD: ${spawnCwd}`)
  sendGatewayLog(`[Clawdbot] State directory: ${process.env.CLAWDBOT_STATE_DIR ?? ''}`)
  
  const logFile = join(stateDir, 'gateway.log')
  const logStream = fs.createWriteStream(logFile, { flags: 'a' })
  
  try {
    // Run CLI in a separate Node process to avoid Electron's Node runtime.
    const child = spawn(spawnBin, gatewayArgs, {
      cwd: spawnCwd,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1'
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      // Windows: Quote the executable if it has spaces and we are using shell, but we are not using shell here.
      // However, if we do encounter issues, shell: false is safer for paths with spaces in argv[0].
      shell: false
    })
    child.stdout?.pipe(logStream)
    child.stderr?.pipe(logStream)
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
      console.error('[Clawdbot] Failed to spawn gateway process:', err)
      sendGatewayLog(`[Clawdbot] Failed to spawn gateway process: ${String(err)}`)
    })
    child.on('exit', (code, signal) => {
      if (signal) {
        console.error('[Clawdbot] Gateway process exited with signal:', signal)
        sendGatewayLog(`[Clawdbot] Gateway process exited with signal: ${signal}`)
        return
      }
      if (code && code !== 0) {
        console.error('[Clawdbot] Gateway process exited with code:', code)
        sendGatewayLog(`[Clawdbot] Gateway process exited with code: ${code}`)
      }
    })
    console.log('[Clawdbot] Gateway initialization triggered')

    // Poll for gateway readiness to load the UI
    const checkGatewayReady = async (): Promise<void> => {
      try {
        const response = await fetch('http://127.0.0.1:18789/health')
        if (response.ok) {
          console.log('[Clawdbot] Gateway is ready, loading dashboard')
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
    console.error('[Clawdbot] Failed to start gateway:', error)
  }
}

function createWindow(): void {
  console.log('[Clawdbot] Creating window...')
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
    console.log('[Clawdbot] Window ready to show')
    mainWindow?.show()
    mainWindow?.focus() // Force focus
  })

  // Fallback if ready-to-show doesn't fire
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('[Clawdbot] ready-to-show timeout, forcing show')
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
    { label: 'Show Clawdbot', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => {
      isAppQuitting = true
      app.quit()
    }}
  ])

  tray.setToolTip('Clawdbot Gateway')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => mainWindow?.show())
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.clawdbot.desktop')

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
