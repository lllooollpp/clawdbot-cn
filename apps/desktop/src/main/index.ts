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
let isGatewayReady = false
const gatewayLogBuffer: string[] = []
const maxGatewayLogLines = 300

function sendGatewayLog(line: string): void {
  gatewayLogBuffer.push(line)
  if (gatewayLogBuffer.length > maxGatewayLogLines) {
    gatewayLogBuffer.splice(0, gatewayLogBuffer.length - maxGatewayLogLines)
  }
  if (!mainWindow || mainWindow.isDestroyed()) return
  mainWindow.webContents.send('gateway-log', line)
  // Secondary check for readiness based on log output
  if (line.includes('主面板地址:') || line.includes('listening on')) {
    if (!isGatewayReady) {
      console.log('[OpenClaw] Gateway detected as ready via logs')
      isGatewayReady = true
      setTimeout(() => {
        const url = isOnboardingNeeded
          ? 'http://127.0.0.1:18789?onboarding=1'
          : 'http://127.0.0.1:18789'
        mainWindow?.loadURL(url)
      }, 500)
    }
  }
}

ipcMain.handle('gateway-log-buffer', () => gatewayLogBuffer.slice())
ipcMain.handle('get-onboarding-needed', () => isOnboardingNeeded)

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

let isOnboardingNeeded = false

async function startGateway(): Promise<void> {
  const stateDir = app.getPath('userData')
  const configPath = join(stateDir, 'openclaw.json')

  // Ensure config directory exists
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true })
  }

  isOnboardingNeeded = !fs.existsSync(configPath)

  // Double-check: Create a minimal config if none exists to satisfy the "mode=local" check
  if (isOnboardingNeeded) {
    console.log('[OpenClaw] Initializing default config for new install at:', configPath)
    const defaultConfig = {
      gateway: {
        mode: 'local',
        bind: 'loopback',
        port: 18789
      },
      agents: {
        defaults: {
          model: {
            primary: 'zhipu/glm-4-plus'
          }
        }
      }
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
  } else {
    // Clean up invalid plugin references that may cause startup failures
    try {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      let modified = false
      
      // Ensure plugins configuration exists
      if (!configData.plugins) configData.plugins = {}
      if (!configData.plugins.slots) configData.plugins.slots = {}
      
      // Memory slot cleanup
      const memorySlotValue = configData.plugins.slots.memory
      if (memorySlotValue === 'memory-core' || memorySlotValue === 'memory-lancedb') {
        const extensionRelPath = `extensions/${memorySlotValue}`
        const extensionPath = isPackaged 
          ? join(process.resourcesPath, 'app.asar', extensionRelPath)
          : join(workspaceRoot, extensionRelPath)
        
        if (!fs.existsSync(extensionPath)) {
          console.log(`[OpenClaw] Missing memory extension at ${extensionPath}, disabling slot`)
          configData.plugins.slots.memory = null // Explicitly disable to avoid default 'memory-core' fallback
          modified = true
        }
      }

      // Allowlist/Denylist cleanup
      if (Array.isArray(configData.plugins.allow)) {
        configData.plugins.allow = configData.plugins.allow.filter(id => {
          if (id === 'memory-lancedb') return false // Always remove lancedb if missing
          return true
        })
        // If we removed something, modified = true (simplified here)
      }
      
      if (modified) {
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2))
        console.log('[OpenClaw] Config sanitized for desktop environment')
      }
    } catch (err) {
      console.warn('[OpenClaw] Failed to sanitize config:', err)
    }
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
  console.log('[OpenClaw] Workspace root:', workspaceRoot)
  const nodeBin = findNodeBin()
  
  // Bundled gateway entry point (created by vite.gateway.config.ts)
  // Located at out/gateway/entry.cjs relative to out/main/index.cjs (__dirname)
  let entryPath = resolve(__dirname, '../gateway/entry.cjs')
  
  // Fallback in dev mode to source TS file if bundle missing
  if (!isPackaged && !fs.existsSync(entryPath)) {
    entryPath = join(workspaceRoot, 'src/entry.ts')
  }

  console.log('[OpenClaw] Target entry path:', entryPath)
  
  if (isPackaged && !fs.existsSync(entryPath)) {
    console.error('[OpenClaw] Packaged gateway missing at:', entryPath)
    sendGatewayLog(`[OpenClaw] Packaged gateway missing at: ${entryPath}`)
  }

  const shouldUseElectronNode =
    isPackaged ||
    !nodeBin ||
    !fs.existsSync(nodeBin) ||
    entryPath.includes('app.asar')
  const spawnBin = shouldUseElectronNode ? process.execPath : nodeBin
  
  // ERROR FIX: Packaged Electron executables reject the '--run-as-node' command line flag.
  // We must rely solely on the ELECTRON_RUN_AS_NODE environment variable.
  const runAsNodeArgs: string[] = [] 
  
  const gatewayArgs = (entryPath.endsWith('.js') || entryPath.endsWith('.cjs'))
    ? [...runAsNodeArgs, entryPath, 'gateway', 'run', '--bind', 'loopback', '--port', '18789', '--allow-unconfigured', '--force']
    : [...runAsNodeArgs, '--import', 'tsx', entryPath, 'gateway', 'run', '--bind', 'loopback', '--port', '18789', '--allow-unconfigured', '--force']

  // Don't use asar path for cwd, it causes spawn ENOENT on Windows
  const spawnCwd = isPackaged ? dirname(process.execPath) : workspaceRoot

  console.log('[OpenClaw] Starting gateway with:', spawnBin, gatewayArgs)
  console.log('[OpenClaw] CWD:', spawnCwd)
  console.log('[OpenClaw] State directory:', process.env.CLAWDBOT_STATE_DIR)
  sendGatewayLog(`[OpenClaw] Starting gateway with: ${[spawnBin, ...gatewayArgs].join(' ')}`)
  sendGatewayLog(`[OpenClaw] CWD: ${spawnCwd}`)
  sendGatewayLog(`[OpenClaw] State directory: ${process.env.CLAWDBOT_STATE_DIR ?? ''}`)
  
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
      if (isGatewayReady) return
      try {
        const response = await fetch('http://127.0.0.1:18789/health')
        // Even if 404/503, if the server is responding, it's alive
        if (response.status < 500) {
          console.log('[OpenClaw] Gateway is ready via health check, status:', response.status)
          isGatewayReady = true
          const url = isOnboardingNeeded
            ? 'http://127.0.0.1:18789?onboarding=1'
            : 'http://127.0.0.1:18789'
          mainWindow?.loadURL(url)
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
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  const menuTemplate: any[] = [
    {
      label: '文件 (File)',
      submenu: [
        { label: '显示主界面', click: () => mainWindow?.show() },
        { type: 'separator' },
        {
          label: '退出 (Quit)',
          click: () => {
            isAppQuitting = true
            app.quit()
          }
        }
      ]
    },
    {
      label: '配置 (Settings)',
      submenu: [
        {
          label: '配置向导 (Onboarding Wizard)',
          click: () => {
            mainWindow?.loadURL('http://127.0.0.1:18789?onboarding=1')
            mainWindow?.show()
          }
        },
        { type: 'separator' },
        {
          label: '打开数据文件夹',
          click: () => shell.openPath(app.getPath('userData'))
        }
      ]
    },
    {
      label: '视图 (View)',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助 (Help)',
      submenu: [
        {
          label: '文档 (Documentation)',
          click: () => shell.openExternal('https://docs.clawd.bot')
        },
        {
          label: 'GitHub',
          click: () => shell.openExternal('https://github.com/clawdbot/clawdbot')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(menu)

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
    const url = new URL(process.env['ELECTRON_RENDERER_URL'])
    if (isOnboardingNeeded) url.searchParams.set('onboarding', '1')
    mainWindow.loadURL(url.toString())
  } else {
    // For local file, we can't easily append search params to loadFile on some platforms 
    // without it being interpreted as part of the path, but we'll try or use loadURL
    if (isOnboardingNeeded) {
        mainWindow.loadURL(`http://127.0.0.1:18789?onboarding=1`)
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
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
    { label: '显示 OpenClaw', click: () => mainWindow?.show() },
    {
      label: '配置向导 (Onboarding)',
      click: () => {
        mainWindow?.loadURL('http://127.0.0.1:18789?onboarding=1')
        mainWindow?.show()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isAppQuitting = true
        app.quit()
      }
    }
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
