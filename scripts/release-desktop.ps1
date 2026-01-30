# This script helps to tag and push for a new desktop release.
# Usage: .\scripts\release-desktop.ps1 v1.0.0

param (
    [Parameter(Mandatory=$true)]
    [string]$Version
)

# 1. Sync and verify the repository
Write-Host "🔄 Syncing with origin..." -ForegroundColor Cyan
git pull --rebase origin main

# 2. Update version in apps/desktop/package.json
Write-Host "📝 Updating version in apps/desktop/package.json to $Version..." -ForegroundColor Cyan
# Strip 'v' prefix for package.json
$PkgVersion = $Version.TrimStart('v')
$PkgPath = "apps/desktop/package.json"
$PkgContent = Get-Content $PkgPath | ConvertFrom-Json
$PkgContent.version = $PkgVersion
$PkgContent | ConvertTo-Json -Depth 10 | Set-Content $PkgPath

# 3. Commit the version bump
git add $PkgPath
git commit -m "chore: bump desktop version to $Version"

# 4. Create and push tag
Write-Host "🏷  Tagging $Version..." -ForegroundColor Cyan
git tag -a "$Version" -m "Release $Version"

Write-Host "🚀 Pushing to origin..." -ForegroundColor Cyan
git push origin main
git push origin "$Version"

Write-Host "✅ Done! GitHub Actions will now build and release $Version." -ForegroundColor Green
