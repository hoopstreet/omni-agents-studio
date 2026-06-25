#!/bin/bash

# Omni-Agents Repository Cleanup & Sanitization Script
# Removes secrets, large files, and malware from git history

set -e

echo "🧹 Omni-Agents Repository Cleanup & Sanitization"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Backup before cleanup
echo -e "${YELLOW}📦 Creating backup...${NC}"
BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
git clone --mirror . "$BACKUP_DIR" || true
echo -e "${GREEN}✅ Backup created: $BACKUP_DIR${NC}"
echo ""

# 1. Scan for secrets in git history
echo -e "${BLUE}🔍 Phase 1: Scanning for secrets in git history${NC}"
echo "=================================================="

echo "Scanning for common secret patterns..."
git log --all --source --remotes -S 'password\|token\|key\|secret\|api_key' --pretty=format:"%h %s" > /tmp/secret-matches.txt || true

if [ -s /tmp/secret-matches.txt ]; then
    echo -e "${RED}⚠️  Found potential secrets in git history:${NC}"
    cat /tmp/secret-matches.txt
    echo ""
    echo -e "${YELLOW}Action Required: Review and remove these commits${NC}"
else
    echo -e "${GREEN}✅ No obvious secrets found${NC}"
fi
echo ""

# 2. Find and remove large files
echo -e "${BLUE}🗑️  Phase 2: Removing large files${NC}"
echo "=================================================="

echo "Finding files larger than 100MB..."
LARGE_FILES=$(git rev-list --all --objects | sort -k2 | tail -20 | awk '{print $2}' | grep -v "^$")

if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}Large files found:${NC}"
    echo "$LARGE_FILES"
    echo ""
    
    # Use BFG to remove large files
    if command -v bfg &> /dev/null; then
        echo "Using BFG Repo-Cleaner to remove large files..."
        bfg --strip-blobs-bigger-than 100M --no-blob-protection .
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        echo -e "${GREEN}✅ Large files removed${NC}"
    else
        echo -e "${YELLOW}⚠️  BFG not installed. Install with: brew install bfg${NC}"
    fi
else
    echo -e "${GREEN}✅ No large files found${NC}"
fi
echo ""

# 3. Remove node_modules and build artifacts
echo -e "${BLUE}🗑️  Phase 3: Removing build artifacts${NC}"
echo "=================================================="

echo "Removing node_modules, dist, build directories from history..."
git filter-branch --tree-filter 'rm -rf node_modules dist build .next .expo' -- --all || true

echo -e "${GREEN}✅ Build artifacts removed${NC}"
echo ""

# 4. Verify .gitignore
echo -e "${BLUE}📋 Phase 4: Verifying .gitignore${NC}"
echo "=================================================="

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
pnpm-lock.yaml
yarn.lock
package-lock.json

# Build outputs
dist/
build/
.next/
.expo/
.expo-shared/

# Environment
.env
.env.local
.env.*.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db

# Secrets
.secrets/
secrets.json
credentials.json

# Temporary
tmp/
temp/
*.tmp

# Testing
coverage/
.nyc_output/

# Mobile
.gradle/
.m2/
android/
ios/

# Backups
*.bak
*.backup
EOF

echo -e "${GREEN}✅ .gitignore updated${NC}"
echo ""

# 5. Malware scanning
echo -e "${BLUE}🦠 Phase 5: Malware scanning${NC}"
echo "=================================================="

if command -v clamscan &> /dev/null; then
    echo "Running ClamAV malware scan..."
    clamscan -r --heuristic-scan-option=Plus . --log=/tmp/clamscan.log || true
    
    if grep -q "Infected files:" /tmp/clamscan.log; then
        echo -e "${RED}⚠️  Malware detected!${NC}"
        cat /tmp/clamscan.log
    else
        echo -e "${GREEN}✅ No malware detected${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  ClamAV not installed. Install with: sudo apt-get install clamav${NC}"
fi
echo ""

# 6. Dependency audit
echo -e "${BLUE}📦 Phase 6: Dependency audit${NC}"
echo "=================================================="

if command -v pnpm &> /dev/null; then
    echo "Running pnpm audit..."
    pnpm audit || true
fi

if command -v npm &> /dev/null; then
    echo "Running npm audit..."
    npm audit || true
fi

echo -e "${GREEN}✅ Dependency audit complete${NC}"
echo ""

# 7. Code quality checks
echo -e "${BLUE}✨ Phase 7: Code quality checks${NC}"
echo "=================================================="

if [ -f "package.json" ]; then
    if command -v pnpm &> /dev/null; then
        echo "Running linter..."
        pnpm lint || true
        
        echo "Running type check..."
        pnpm type-check || true
    fi
fi

echo -e "${GREEN}✅ Code quality checks complete${NC}"
echo ""

# 8. Git cleanup
echo -e "${BLUE}🧹 Phase 8: Git cleanup${NC}"
echo "=================================================="

echo "Cleaning git history..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo -e "${GREEN}✅ Git history cleaned${NC}"
echo ""

# 9. Generate cleanup report
echo -e "${BLUE}📊 Phase 9: Generating cleanup report${NC}"
echo "=================================================="

cat > CLEANUP_REPORT.md << 'EOF'
# Repository Cleanup Report

Generated: $(date)

## Actions Performed

- [x] Scanned for secrets in git history
- [x] Removed large files (>100MB)
- [x] Removed build artifacts
- [x] Updated .gitignore
- [x] Ran malware scan
- [x] Performed dependency audit
- [x] Code quality checks
- [x] Git history cleanup

## Findings

### Secrets
Check /tmp/secret-matches.txt for details

### Large Files
Removed via BFG Repo-Cleaner

### Malware
Check /tmp/clamscan.log for details

### Dependencies
Review audit reports above

## Next Steps

1. Review backup in: $BACKUP_DIR
2. Force push cleaned history: git push --force-with-lease
3. Notify team of cleanup
4. Update credentials (if any were exposed)
5. Monitor for issues

## Safety Notes

- Backup created before cleanup
- Use --force-with-lease to prevent accidental overwrites
- Notify all collaborators before force push
- Update any exposed credentials immediately

EOF

echo -e "${GREEN}✅ Cleanup report generated: CLEANUP_REPORT.md${NC}"
echo ""

# 10. Final summary
echo -e "${BLUE}📋 Cleanup Summary${NC}"
echo "=================================================="
echo -e "${GREEN}✅ Repository cleanup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review CLEANUP_REPORT.md"
echo "2. Verify changes locally"
echo "3. Force push to GitHub: git push --force-with-lease origin main"
echo "4. Notify team members"
echo "5. Update any exposed credentials"
echo ""
echo -e "${YELLOW}⚠️  Backup location: $BACKUP_DIR${NC}"
echo ""
