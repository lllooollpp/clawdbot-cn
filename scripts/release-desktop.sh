#!/usr/bin/env bash
set -euo pipefail

# This script helps to tag and push for a new desktop release.
# Usage: ./scripts/release-desktop.sh v1.0.0

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.0.0"
    exit 1
fi

VERSION=$1

# 1. Sync and verify the repository
echo "🔄 Syncing with origin..."
git pull --rebase origin main

# 2. Update version in apps/desktop/package.json
echo "📝 Updating version in apps/desktop/package.json to $VERSION..."
# Strip 'v' prefix for package.json
PKG_VERSION=${VERSION#v}
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('apps/desktop/package.json', 'utf8'));
pkg.version = '$PKG_VERSION';
fs.writeFileSync('apps/desktop/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# 3. Commit the version bump
git add apps/desktop/package.json
git commit -m "chore: bump desktop version to $VERSION"

# 4. Create and push tag
echo "🏷  Tagging $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION"

echo "🚀 Pushing to origin..."
git push origin main
git push origin "$VERSION"

echo "✅ Done! GitHub Actions will now build and release $VERSION."
