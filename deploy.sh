#!/bin/bash

# Namecheap Deployment Script
# سكريبت النشر على Namecheap

# Load environment variables
source .deploy.env

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Elhamd Imports Deployment Script ===${NC}"
echo -e "${YELLOW}Deploying to Namecheap server...${NC}"

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo -e "${YELLOW}SSH key not found. Creating new SSH key...${NC}"
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo -e "${GREEN}SSH key created successfully!${NC}"
    echo -e "${YELLOW}Please add the following public key to your Namecheap server:${NC}"
    cat ~/.ssh/id_rsa.pub
    echo -e "${YELLOW}After adding the key, run this script again.${NC}"
    exit 1
fi

# Function to execute SSH command
execute_ssh() {
    ssh -p $SSH_PORT $SSH_USERNAME@$SERVER_IP "$1"
}

# Function to copy files via SCP
copy_files() {
    scp -P $SSH_PORT -r $1 $SSH_USERNAME@$SERVER_IP:$2
}

echo -e "${YELLOW}Step 1: Building the application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Build completed successfully!${NC}"

echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
mkdir -p deploy-temp
cp -r .next deploy-temp/
cp -r public deploy-temp/
cp -r prisma deploy-temp/
cp package.json deploy-temp/
cp package-lock.json deploy-temp/
cp next.config.* deploy-temp/
cp .env.example deploy-temp/.env

echo -e "${YELLOW}Step 3: Connecting to server and preparing directories...${NC}"
execute_ssh "mkdir -p $REMOTE_PATH && mkdir -p $PUBLIC_PATH"

echo -e "${YELLOW}Step 4: Uploading files to server...${NC}"
copy_files deploy-temp/* $REMOTE_PATH/

echo -e "${YELLOW}Step 5: Installing dependencies on server...${NC}"
execute_ssh "cd $REMOTE_PATH && npm ci --only=production"

echo -e "${YELLOW}Step 6: Setting up database...${NC}"
execute_ssh "cd $REMOTE_PATH && npm run db:push"

echo -e "${YELLOW}Step 7: Starting the application...${NC}"
execute_ssh "cd $REMOTE_PATH && pm2 describe $APP_NAME > /dev/null 2>&1"
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}Application already exists, restarting...${NC}"
    execute_ssh "$RESTART_COMMAND"
else
    echo -e "${YELLOW}Starting new application instance...${NC}"
    execute_ssh "$START_COMMAND"
fi

echo -e "${YELLOW}Step 8: Setting up PM2 to start on boot...${NC}"
execute_ssh "pm2 save && pm2 startup"

echo -e "${YELLOW}Step 9: Checking application status...${NC}"
execute_ssh "pm2 status $APP_NAME"

echo -e "${GREEN}=== Deployment completed successfully! ===${NC}"
echo -e "${GREEN}Your application is now running on Namecheap server.${NC}"
echo -e "${YELLOW}Access your application at: http://$SERVER_IP:$PORT${NC}"

# Clean up temporary files
rm -rf deploy-temp

echo -e "${YELLOW}To view logs, run: ssh -p $SSH_PORT $SSH_USERNAME@$SERVER_IP 'pm2 logs $APP_NAME'${NC}"
echo -e "${YELLOW}To stop the application, run: ssh -p $SSH_PORT $SSH_USERNAME@$SERVER_IP 'pm2 stop $APP_NAME'${NC}"