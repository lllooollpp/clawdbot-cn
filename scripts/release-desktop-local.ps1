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

# Set proxy
$env:HTTPS_PROXY = "http://127.0.0.1:10810"
$env:HTTP_PROXY = "http://127.0.0.1:10810"

# 2. Update version numbers
Write-Host "Updating version numbers..." -ForegroundColor Yellow
$RootPkg = Get-Content "package.json" | ConvertFrom-Json
$RootPkg.version = $PureVersion
$RootPkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

$DesktopPkg = Get-Content "apps/desktop/package.json" | ConvertFrom-Json
$DesktopPkg.version = $PureVersion
$DesktopPkg | ConvertTo-Json -Depth 10 | Set-Content "apps/desktop/package.json"

# 3. Local build process
Write-Host "Running local build (Core & UI)..." -ForegroundColor Yellow
pnpm build
pnpm ui:build

Write-Host "Packaging Electron (Windows)..." -ForegroundColor Yellow
cd apps/desktop
pnpm run build:win
cd ../..

# 4. Commit and push
Write-Host "Committing and tagging..." -ForegroundColor Yellow
git add .
git commit -m "chore: release $Version (local build)" --no-verify
git tag $Version
git -c http.proxy=http://127.0.0.1:10810 push origin main --tags

# 5. GH Release
Write-Host "Uploading to GitHub Releases..." -ForegroundColor Yellow
# 检查 gh cli 是否登录
gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Error "GitHub CLI 未登录，请先运行 'gh auth login'"
    exit 1
}

gh release create $Version apps/desktop/dist/*.exe apps/desktop/dist/*.msi --title "Clawdbot $Version" --notes "Local build release."

Write-Host "Success! Check your release at: https://github.com/lllooollpp/clawdbot-cn/releases" -ForegroundColor Green
