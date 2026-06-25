#!/bin/bash

# Omni-Agents Studio Mobile - GitHub Sync Script
# This script automatically syncs the mobile app with GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="${GITHUB_REPO_URL:-https://github.com/YOUR_USERNAME/omni-agents-studio-mobile.git}"
BRANCH="${GITHUB_BRANCH:-main}"
COMMIT_MESSAGE="${1:-Automated sync: $(date '+%Y-%m-%d %H:%M:%S')}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Omni-Agents Studio Mobile - GitHub Sync${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
fi

# Get current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${YELLOW}Project directory: $PROJECT_DIR${NC}"
echo -e "${YELLOW}Repository URL: $REPO_URL${NC}"
echo -e "${YELLOW}Branch: $BRANCH${NC}"

cd "$PROJECT_DIR"

# Check if git repository exists
if [ ! -d .git ]; then
    echo -e "${YELLOW}Initializing git repository...${NC}"
    git init
    git remote add origin "$REPO_URL"
    git branch -M "$BRANCH"
fi

# Check for uncommitted changes
echo -e "${YELLOW}Checking for changes...${NC}"
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}No changes to commit${NC}"
else
    echo -e "${YELLOW}Changes detected. Committing...${NC}"
    git add .
    git commit -m "$COMMIT_MESSAGE"
    echo -e "${GREEN}Changes committed${NC}"
fi

# Pull latest changes
echo -e "${YELLOW}Pulling latest changes from remote...${NC}"
git pull origin "$BRANCH" --rebase || true

# Push changes
echo -e "${YELLOW}Pushing changes to remote...${NC}"
git push origin "$BRANCH"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Sync completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"

# Display summary
echo -e "\n${BLUE}Summary:${NC}"
echo -e "  Repository: $REPO_URL"
echo -e "  Branch: $BRANCH"
echo -e "  Latest commit: $(git log -1 --pretty=format:'%h - %s')"
echo -e "  Last updated: $(git log -1 --pretty=format:'%ai')"
