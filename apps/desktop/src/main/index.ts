import { app, shell, BrowserWindow, Tray, Menu, nativeImage } from 'electron'
import { join, dirname } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Import Clawdbot logic
import { runCli } from 'clawdbot/cli/run-main.js'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

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
  
  const gatewayArgs = [
    process.execPath, 
    'clawdbot', 
    'gateway', 
    'run', 
    '--bind', 'loopback', 
    '--port', '18789', 
    '--allow-unconfigured',
    '--force'
  ]
  
  console.log('[Clawdbot] Starting gateway with args:', gatewayArgs)
  console.log('[Clawdbot] State directory:', process.env.CLAWDBOT_STATE_DIR)
  
  try {
    // Run CLI in the background. We don't await because it's a long-running server.
    runCli(gatewayArgs).catch(err => {
      console.error('[Clawdbot] Background runCli error:', err)
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
      preload: join(__dirname, '../preload/index.js'),
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
    if (!app.isQuitting) {
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
      app.isQuitting = true
      app.quit()
    }}
  ])

  tray.setToolTip('Clawdbot Gateway')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', () => mainWindow?.show())
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.clawdbot.app')

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
