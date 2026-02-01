/**
 * 扫描所有 Vite external 模块，生成 electron-builder 的 files 和 asarUnpack 配置
 */
const fs = require('fs')
const path = require('path')

const workspaceRoot = path.resolve(__dirname, '../../..')
const pnpmStore = path.join(workspaceRoot, 'node_modules/.pnpm')

// 所有需要打包的 external 模块（从 vite.gateway.config.ts 中提取）
const externalModules = [
  'better-sqlite3',
  'bufferutil',
  'utf-8-validate',
  'node-llama-cpp',
  '@napi-rs/canvas',
  'sharp',
  'sqlite-vec',
  '@lydell/node-pty',
  'qrcode-terminal',
  '@mariozechner/clipboard',
  'jiti',
]

// 检查模块是否有原生绑定
function hasNativeBindings(modulePath) {
  try {
    const files = fs.readdirSync(modulePath, { recursive: true })
    return files.some(f => f.toString().endsWith('.node'))
  } catch {
    return false
  }
}

// 在 pnpm store 中查找模块
function findModuleInPnpm(moduleName) {
  const results = []
  
  // 转换模块名为 pnpm 目录格式：@scope/name -> @scope+name
  const pnpmName = moduleName.replace('/', '+')
  
  try {
    const dirs = fs.readdirSync(pnpmStore)
    for (const dir of dirs) {
      if (dir.startsWith(pnpmName + '@')) {
        const modulePath = path.join(pnpmStore, dir, 'node_modules', ...moduleName.split('/'))
        if (fs.existsSync(modulePath)) {
          results.push({
            name: moduleName,
            pnpmDir: dir,
            from: `../../node_modules/.pnpm/${dir}/node_modules/${moduleName}`,
            to: `node_modules/${moduleName}`,
            isNative: hasNativeBindings(modulePath)
          })
        }
      }
    }
  } catch (e) {
    console.error(`Error scanning for ${moduleName}:`, e.message)
  }
  
  return results
}

// 查找平台特定的绑定模块（如 @mariozechner/clipboard-win32-x64-msvc）
function findPlatformBindings(moduleName) {
  const results = []
  const baseName = moduleName.replace('/', '+')
  
  const platforms = ['win32-x64-msvc', 'darwin-arm64', 'darwin-x64', 'linux-x64-gnu', 'linux-arm64-gnu']
  
  try {
    const dirs = fs.readdirSync(pnpmStore)
    for (const dir of dirs) {
      for (const platform of platforms) {
        const bindingName = `${baseName}-${platform}`
        if (dir.startsWith(bindingName + '@')) {
          const bindingModuleName = `${moduleName}-${platform}`
          const modulePath = path.join(pnpmStore, dir, 'node_modules', ...bindingModuleName.split('/'))
          if (fs.existsSync(modulePath)) {
            results.push({
              name: bindingModuleName,
              pnpmDir: dir,
              from: `../../node_modules/.pnpm/${dir}/node_modules/${bindingModuleName}`,
              to: `node_modules/${bindingModuleName}`,
              isNative: true
            })
          }
        }
      }
    }
  } catch (e) {
    console.error(`Error scanning platform bindings for ${moduleName}:`, e.message)
  }
  
  return results
}

// 主函数
function main() {
  console.log('扫描 external 模块...\n')
  
  const allModules = []
  const nativeModules = []
  
  for (const moduleName of externalModules) {
    const found = findModuleInPnpm(moduleName)
    if (found.length > 0) {
      // 取第一个匹配（通常只有一个版本）
      const mod = found[0]
      allModules.push(mod)
      if (mod.isNative) {
        nativeModules.push(mod.name)
      }
      console.log(`✓ ${moduleName} -> ${mod.pnpmDir} ${mod.isNative ? '(native)' : ''}`)
      
      // 查找平台特定绑定
      const bindings = findPlatformBindings(moduleName)
      for (const binding of bindings) {
        allModules.push(binding)
        nativeModules.push(binding.name)
        console.log(`  ↳ ${binding.name} -> ${binding.pnpmDir} (native binding)`)
      }
    } else {
      console.log(`✗ ${moduleName} - 未找到`)
    }
  }
  
  console.log('\n\n========== 生成的 files 配置 ==========\n')
  
  const filesConfig = allModules.map(m => ({
    from: m.from,
    to: m.to
  }))
  
  console.log(JSON.stringify(filesConfig, null, 2))
  
  console.log('\n\n========== 生成的 asarUnpack 配置 ==========\n')
  
  const asarUnpackConfig = nativeModules.map(name => `**/${name.replace('/', '/')}/**`)
  console.log(JSON.stringify(asarUnpackConfig, null, 2))
  
  // 写入 JSON 文件供后续使用
  const output = {
    files: filesConfig,
    asarUnpack: asarUnpackConfig,
    summary: {
      total: allModules.length,
      native: nativeModules.length
    }
  }
  
  fs.writeFileSync(
    path.join(__dirname, 'externals-config.json'),
    JSON.stringify(output, null, 2)
  )
  
  console.log('\n配置已写入 scripts/externals-config.json')
}

main()
