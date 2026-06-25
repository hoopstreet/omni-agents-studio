#!/bin/bash

# Omni-Agents Repository Vulnerability & Malware Scanning
# Comprehensive scanning of code repositories for security issues

set -e

echo "🔍 Omni-Agents Repository Vulnerability Scanning"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCAN_RESULTS="SCAN_RESULTS.md"
VULNERABILITIES_FOUND=0

# Initialize report
cat > "$SCAN_RESULTS" << 'EOF'
# Omni-Agents Repository Security Scan Report

Generated: $(date)

## Executive Summary

This report contains the results of comprehensive security scanning of the Omni-Agents repository.

---

EOF

# ============================================
# 1. DEPENDENCY SCANNING
# ============================================

echo -e "${BLUE}1️⃣  Dependency Vulnerability Scanning${NC}"
echo "=================================================="

echo "Scanning npm dependencies..."
if command -v npm &> /dev/null; then
    npm audit --json > /tmp/npm-audit.json 2>/dev/null || true
    
    VULN_COUNT=$(grep -o '"vulnerabilities"' /tmp/npm-audit.json | wc -l)
    if [ "$VULN_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ Found npm vulnerabilities${NC}"
        VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + VULN_COUNT))
        cat /tmp/npm-audit.json >> "$SCAN_RESULTS"
    else
        echo -e "${GREEN}✅ No npm vulnerabilities found${NC}"
    fi
fi

echo "Scanning pnpm dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm audit --json > /tmp/pnpm-audit.json 2>/dev/null || true
    echo "pnpm audit completed" >> "$SCAN_RESULTS"
fi

echo ""

# ============================================
# 2. SECRET SCANNING
# ============================================

echo -e "${BLUE}2️⃣  Secret & Credential Scanning${NC}"
echo "=================================================="

echo "Scanning for exposed secrets..."

SECRETS_FOUND=0

# Check for common secret patterns
echo "Checking for API keys..."
if grep -r "api[_-]?key\s*[=:]\s*['\"]" . --include="*.ts" --include="*.js" --include="*.env*" 2>/dev/null | grep -v node_modules | grep -v ".git"; then
    echo -e "${RED}⚠️  Potential API keys found${NC}"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
else
    echo -e "${GREEN}✅ No exposed API keys${NC}"
fi

echo "Checking for private keys..."
if grep -r "PRIVATE\|private[_-]?key\|-----BEGIN" . --include="*.ts" --include="*.js" --include="*.pem" 2>/dev/null | grep -v node_modules | grep -v ".git"; then
    echo -e "${RED}⚠️  Potential private keys found${NC}"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
else
    echo -e "${GREEN}✅ No exposed private keys${NC}"
fi

echo "Checking for database credentials..."
if grep -r "password\|passwd\|pwd" . --include="*.ts" --include="*.js" --include="*.env*" 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v "// password"; then
    echo -e "${RED}⚠️  Potential credentials found${NC}"
    SECRETS_FOUND=$((SECRETS_FOUND + 1))
else
    echo -e "${GREEN}✅ No exposed credentials${NC}"
fi

VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + SECRETS_FOUND))
echo ""

# ============================================
# 3. CODE QUALITY SCANNING
# ============================================

echo -e "${BLUE}3️⃣  Code Quality Scanning${NC}"
echo "=================================================="

echo "Running ESLint..."
if command -v eslint &> /dev/null; then
    eslint . --format=json > /tmp/eslint-report.json 2>/dev/null || true
    LINT_ISSUES=$(grep -o '"error"' /tmp/eslint-report.json | wc -l)
    if [ "$LINT_ISSUES" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $LINT_ISSUES ESLint issues${NC}"
    else
        echo -e "${GREEN}✅ No ESLint issues${NC}"
    fi
fi

echo "Running TypeScript type checking..."
if command -v tsc &> /dev/null; then
    tsc --noEmit 2>&1 | tee /tmp/tsc-report.txt || true
    TYPE_ERRORS=$(grep -c "error TS" /tmp/tsc-report.txt || echo 0)
    if [ "$TYPE_ERRORS" -gt 0 ]; then
        echo -e "${RED}❌ Found $TYPE_ERRORS TypeScript errors${NC}"
        VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + TYPE_ERRORS))
    else
        echo -e "${GREEN}✅ No TypeScript errors${NC}"
    fi
fi

echo ""

# ============================================
# 4. SECURITY ISSUES SCANNING
# ============================================

echo -e "${BLUE}4️⃣  Security Issues Scanning${NC}"
echo "=================================================="

SECURITY_ISSUES=0

echo "Checking for SQL injection vulnerabilities..."
if grep -r "query\|execute\|sql" . --include="*.ts" --include="*.js" 2>/dev/null | grep -v "parameterized\|prepared" | grep -v node_modules | head -5; then
    echo -e "${YELLOW}⚠️  Potential SQL injection risk (manual review needed)${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
else
    echo -e "${GREEN}✅ No obvious SQL injection risks${NC}"
fi

echo "Checking for XSS vulnerabilities..."
if grep -r "innerHTML\|dangerouslySetInnerHTML" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v node_modules; then
    echo -e "${YELLOW}⚠️  Potential XSS risk found${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
else
    echo -e "${GREEN}✅ No obvious XSS risks${NC}"
fi

echo "Checking for insecure randomness..."
if grep -r "Math.random\|Math.floor" . --include="*.ts" --include="*.js" 2>/dev/null | grep -v node_modules | grep -v "test\|spec"; then
    echo -e "${YELLOW}⚠️  Insecure randomness detected (use crypto)${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
else
    echo -e "${GREEN}✅ No insecure randomness${NC}"
fi

echo "Checking for hardcoded URLs..."
if grep -r "http://\|hardcoded" . --include="*.ts" --include="*.js" 2>/dev/null | grep -v "https://" | grep -v node_modules | grep -v "test\|spec" | head -5; then
    echo -e "${YELLOW}⚠️  Potential hardcoded URLs found${NC}"
    SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
else
    echo -e "${GREEN}✅ No obvious hardcoded URLs${NC}"
fi

VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + SECURITY_ISSUES))
echo ""

# ============================================
# 5. MALWARE SCANNING
# ============================================

echo -e "${BLUE}5️⃣  Malware Scanning${NC}"
echo "=================================================="

if command -v clamscan &> /dev/null; then
    echo "Running ClamAV malware scan..."
    sudo clamscan -r --heuristic-scan-option=Plus . --log=/tmp/clamscan.log 2>/dev/null || true
    
    MALWARE_FOUND=$(grep -c "FOUND" /tmp/clamscan.log || echo 0)
    if [ "$MALWARE_FOUND" -gt 0 ]; then
        echo -e "${RED}❌ Malware detected!${NC}"
        cat /tmp/clamscan.log >> "$SCAN_RESULTS"
        VULNERABILITIES_FOUND=$((VULNERABILITIES_FOUND + MALWARE_FOUND))
    else
        echo -e "${GREEN}✅ No malware detected${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  ClamAV not installed${NC}"
fi

echo ""

# ============================================
# 6. DEPENDENCY TREE ANALYSIS
# ============================================

echo -e "${BLUE}6️⃣  Dependency Tree Analysis${NC}"
echo "=================================================="

echo "Analyzing dependency tree for issues..."
if command -v npm &> /dev/null; then
    npm ls --depth=0 2>&1 | tee /tmp/npm-ls.txt
    
    DEPRECATED=$(grep -c "deprecated" /tmp/npm-ls.txt || echo 0)
    if [ "$DEPRECATED" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $DEPRECATED deprecated packages${NC}"
    else
        echo -e "${GREEN}✅ No deprecated packages${NC}"
    fi
fi

echo ""

# ============================================
# 7. FILE PERMISSION SCANNING
# ============================================

echo -e "${BLUE}7️⃣  File Permission Scanning${NC}"
echo "=================================================="

echo "Checking for overly permissive files..."
WORLD_WRITABLE=$(find . -type f -perm -002 2>/dev/null | grep -v node_modules | wc -l)
if [ "$WORLD_WRITABLE" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $WORLD_WRITABLE world-writable files${NC}"
else
    echo -e "${GREEN}✅ No world-writable files${NC}"
fi

echo "Checking for executable scripts..."
EXECUTABLE=$(find . -type f -executable -name "*.sh" 2>/dev/null | grep -v node_modules | wc -l)
echo -e "${BLUE}Found $EXECUTABLE executable scripts${NC}"

echo ""

# ============================================
# 8. GENERATE FINAL REPORT
# ============================================

echo -e "${BLUE}📊 Scan Summary${NC}"
echo "=================================================="

cat >> "$SCAN_RESULTS" << EOF

## Scan Results Summary

- **Total Vulnerabilities Found:** $VULNERABILITIES_FOUND
- **Dependency Issues:** $VULN_COUNT
- **Secrets Exposed:** $SECRETS_FOUND
- **Security Issues:** $SECURITY_ISSUES
- **Malware Detected:** $MALWARE_FOUND
- **World-Writable Files:** $WORLD_WRITABLE
- **Executable Scripts:** $EXECUTABLE

## Recommendations

1. Update vulnerable dependencies
2. Rotate exposed credentials
3. Fix security issues
4. Remove malware
5. Fix file permissions
6. Review and update deprecated packages

## Next Steps

1. Address all critical vulnerabilities
2. Rotate compromised credentials
3. Update dependencies
4. Re-run scan to verify fixes
5. Deploy to production

---

Generated: $(date)
EOF

echo -e "${GREEN}✅ Scan completed${NC}"
echo "Report saved to: $SCAN_RESULTS"
echo ""

if [ "$VULNERABILITIES_FOUND" -gt 0 ]; then
    echo -e "${RED}⚠️  VULNERABILITIES FOUND: $VULNERABILITIES_FOUND${NC}"
    echo "Review $SCAN_RESULTS for details"
    exit 1
else
    echo -e "${GREEN}✅ No vulnerabilities found${NC}"
    exit 0
fi
