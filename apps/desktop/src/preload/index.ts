import { contextBridge, ipcRenderer } from 'electron'
import { exposeElectronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getGatewayLogBuffer: () => ipcRenderer.invoke('gateway-log-buffer'),
  onGatewayLog: (listener: (line: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, line: string) => listener(line)
    ipcRenderer.on('gateway-log', handler)
    return () => ipcRenderer.removeListener('gateway-log', handler)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    exposeElectronAPI()
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in d.ts)
  window.electron = electronAPI
  // @ts-ignore (define in d.ts)
  window.api = api
}
