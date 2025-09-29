#!/bin/bash

# PM2 Lock Fix Script
# سكريبت لإصلاح مشاكل القفل في PM2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== PM2 Lock Fix Script ===${NC}"
echo -e "${YELLOW}Fixing PM2 lock issues...${NC}"

# Load environment variables
if [ -f .env.deploy ]; then
    source .env.deploy
fi

# Default values
SERVER_IP=${SERVER_IP:-"162.0.209.203"}
SSH_USERNAME=${SSH_USERNAME:-"bitcstcp"}
SSH_PORT=${SSH_PORT:-"21098"}
APP_NAME=${APP_NAME:-"elhamd-imports"}

# Function to execute SSH command
execute_ssh() {
    ssh -p $SSH_PORT $SSH_USERNAME@$SERVER_IP "$1"
}

echo -e "${YELLOW}Step 1: Checking PM2 status...${NC}"
execute_ssh "pm2 status"

echo -e "${YELLOW}Step 2: Checking for running processes...${NC}"
execute_ssh "ps aux | grep node"

echo -e "${YELLOW}Step 3: Stopping all PM2 processes...${NC}"
execute_ssh "pm2 stop all || true"

echo -e "${YELLOW}Step 4: Deleting all PM2 processes...${NC}"
execute_ssh "pm2 delete all || true"

echo -e "${YELLOW}Step 5: Killing any remaining Node.js processes...${NC}"
execute_ssh "pkill -f node || true"

echo -e "${YELLOW}Step 6: Removing PM2 lock files...${NC}"
execute_ssh "rm -f ~/.pm2/*.lock || true"
execute_ssh "rm -f ~/.pm2/dump.pm2 || true"

echo -e "${YELLOW}Step 7: Cleaning PM2 cache...${NC}"
execute_ssh "pm2 kill || true"

echo -e "${YELLOW}Step 8: Restarting PM2 daemon...${NC}"
execute_ssh "pm2 resurrect || true"

echo -e "${YELLOW}Step 9: Checking PM2 status after cleanup...${NC}"
execute_ssh "pm2 status"

echo -e "${YELLOW}Step 10: Checking disk space...${NC}"
execute_ssh "df -h"

echo -e "${YELLOW}Step 11: Checking memory usage...${NC}"
execute_ssh "free -h"

echo -e "${YELLOW}Step 12: Checking Node.js version...${NC}"
execute_ssh "node --version"
execute_ssh "npm --version"

echo -e "${GREEN}=== PM2 Lock Fix Completed ===${NC}"
echo -e "${GREEN}All locks have been cleared and PM2 has been reset.${NC}"
echo -e "${YELLOW}You can now try running your application again.${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Navigate to your app directory: cd /home/bitcstcp/elhamd-imports${NC}"
echo -e "${BLUE}2. Try to run: npm run dev${NC}"
echo -e "${BLUE}3. Or for production: npm run build && npm start${NC}"