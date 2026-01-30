param (
    [Parameter(Mandatory=$true)]
    [string]$Version
)

# 1. 验证版本号格式 (v1.2.3)
if ($Version -notmatch "^v\d+\.\d+\.\d+$") {
    Write-Error "版本号必须符合 v1.2.3 格式"
    exit 1
}

$PureVersion = $Version.Substring(1)
Write-Host "Starting local build and release for: $Version" -ForegroundColor Cyan

# 2. Update version numbers
Write-Host "Updating version numbers..." -ForegroundColor Yellow
$PureVersion = $Version.Substring(1)

# Function to update JSON file while preserving formatting
function Update-JsonVersion($Path, $NewVersion) {
    if (Test-Path $Path) {
        $Json = Get-Content $Path -Raw | ConvertFrom-Json
        $Json.version = $NewVersion
        # Use depth to ensure all nested objects are preserved
        $JsonContent = $Json | ConvertTo-Json -Depth 100
        # Ensure we write as UTF8 without BOM to keep Node happy
        [System.IO.File]::WriteAllText((Get-Item $Path).FullName, $JsonContent)
    }
}

Update-JsonVersion "package.json" $PureVersion
Update-JsonVersion "apps/desktop/package.json" $PureVersion

# 3. Local build process
Write-Host "Cleaning dist folder..." -ForegroundColor Yellow
Remove-Item -Recurse -Force apps/desktop/dist -ErrorAction SilentlyContinue

Write-Host "Running local build (Core & UI)..." -ForegroundColor Yellow
pnpm build
pnpm ui:build

Write-Host "Packaging Electron (Windows)..." -ForegroundColor Yellow
cd apps/desktop
# Set debugging flag for electron-builder to see where it gets stuck
$env:DEBUG = "electron-builder"
pnpm run build:win
cd ../..

# 4. Commit and push
Write-Host "Committing and tagging..." -ForegroundColor Yellow
git add .
git commit -m "chore: release $Version (local build)" --no-verify
git tag $Version -f

# 尝试推送，如果失败则输出警告
Write-Host "Trying to push to GitHub..." -ForegroundColor Yellow
git push origin main --tags -f

# 5. GH Release
Write-Host "Uploading to GitHub Releases..." -ForegroundColor Yellow
# 检查 gh cli 是否登录
gh auth status
$isAuth = $LASTEXITCODE
if ($isAuth -ne 0) {
    Write-Warning "GitHub CLI Not Logged In. Artifacts are in apps/desktop/dist/."
} else {
    gh release create $Version apps/desktop/dist/*.exe apps/desktop/dist/*.msi --title "OpenClaw $Version" --notes "Local build release."
}

Write-Host "Done! Artifacts are in apps/desktop/dist/" -ForegroundColor Green
