#!/bin/bash

# Omni-Agents GitHub Secrets Configuration Script
# This script helps configure all required secrets in GitHub

set -e

echo "🔐 Omni-Agents GitHub Secrets Configuration"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not authenticated with GitHub${NC}"
    echo "Run: gh auth login"
    exit 1
fi

REPO="hoopstreet/Omni-Agents"

echo -e "${YELLOW}Repository: ${REPO}${NC}"
echo ""

# Function to set secret
set_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if [ -z "$secret_value" ]; then
        echo -e "${YELLOW}⏭️  Skipping ${secret_name} (empty value)${NC}"
        return
    fi
    
    echo -n "Setting ${secret_name}... "
    if echo "$secret_value" | gh secret set "$secret_name" -R "$REPO"; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
    fi
}

# Secrets to configure
echo "📋 Secrets to configure:"
echo "1. GITHUB_TOKEN_FINE_GRAINED"
echo "2. SUPABASE_URL"
echo "3. SUPABASE_ANON_KEY"
echo "4. SUPABASE_SERVICE_ROLE_KEY"
echo "5. OPENROUTER_API_KEY"
echo "6. OPENROUTER_WEBHOOK_KEY"
echo "7. EXPO_TOKEN"
echo "8. NOTION_API_KEY"
echo "9. GOOGLE_API_KEY"
echo "10. SLACK_WEBHOOK"
echo ""

# Interactive mode
read -p "Enter configuration mode (interactive/file): " mode

if [ "$mode" = "interactive" ]; then
    echo ""
    echo "📝 Enter secret values (press Enter to skip):"
    echo ""
    
    read -sp "GITHUB_TOKEN_FINE_GRAINED: " github_token
    echo ""
    set_secret "GITHUB_TOKEN_FINE_GRAINED" "$github_token"
    
    read -p "SUPABASE_URL: " supabase_url
    set_secret "SUPABASE_URL" "$supabase_url"
    
    read -sp "SUPABASE_ANON_KEY: " supabase_anon_key
    echo ""
    set_secret "SUPABASE_ANON_KEY" "$supabase_anon_key"
    
    read -sp "SUPABASE_SERVICE_ROLE_KEY: " supabase_service_role_key
    echo ""
    set_secret "SUPABASE_SERVICE_ROLE_KEY" "$supabase_service_role_key"
    
    read -sp "OPENROUTER_API_KEY: " openrouter_api_key
    echo ""
    set_secret "OPENROUTER_API_KEY" "$openrouter_api_key"
    
    read -sp "OPENROUTER_WEBHOOK_KEY: " openrouter_webhook_key
    echo ""
    set_secret "OPENROUTER_WEBHOOK_KEY" "$openrouter_webhook_key"
    
    read -sp "EXPO_TOKEN: " expo_token
    echo ""
    set_secret "EXPO_TOKEN" "$expo_token"
    
    read -sp "NOTION_API_KEY: " notion_api_key
    echo ""
    set_secret "NOTION_API_KEY" "$notion_api_key"
    
    read -sp "GOOGLE_API_KEY: " google_api_key
    echo ""
    set_secret "GOOGLE_API_KEY" "$google_api_key"
    
    read -p "SLACK_WEBHOOK: " slack_webhook
    set_secret "SLACK_WEBHOOK" "$slack_webhook"
    
elif [ "$mode" = "file" ]; then
    echo ""
    read -p "Enter path to secrets file (.env format): " secrets_file
    
    if [ ! -f "$secrets_file" ]; then
        echo -e "${RED}❌ File not found: $secrets_file${NC}"
        exit 1
    fi
    
    # Source the file and set secrets
    set -a
    source "$secrets_file"
    set +a
    
    set_secret "GITHUB_TOKEN_FINE_GRAINED" "$GITHUB_TOKEN_FINE_GRAINED"
    set_secret "SUPABASE_URL" "$SUPABASE_URL"
    set_secret "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY"
    set_secret "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"
    set_secret "OPENROUTER_API_KEY" "$OPENROUTER_API_KEY"
    set_secret "OPENROUTER_WEBHOOK_KEY" "$OPENROUTER_WEBHOOK_KEY"
    set_secret "EXPO_TOKEN" "$EXPO_TOKEN"
    set_secret "NOTION_API_KEY" "$NOTION_API_KEY"
    set_secret "GOOGLE_API_KEY" "$GOOGLE_API_KEY"
    set_secret "SLACK_WEBHOOK" "$SLACK_WEBHOOK"
else
    echo -e "${RED}❌ Invalid mode${NC}"
    exit 1
fi

echo ""
echo "✅ Secrets configuration complete!"
echo ""
echo "📋 List configured secrets:"
gh secret list -R "$REPO"
