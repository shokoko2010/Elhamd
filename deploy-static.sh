#!/bin/bash

# Namecheap Static Deployment Script
# سكريبت النشر الثابت على Namecheap

# Load environment variables
source .deploy.env

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Elhamd Imports Static Deployment Script ===${NC}"
echo -e "${YELLOW}Deploying static files to Namecheap...${NC}"

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

echo -e "${YELLOW}Step 1: Creating temporary next.config.js for static export...${NC}"
cp next.config.ts next.config.ts.backup

# Create static export configuration
cat > next.config.ts << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  assetPrefix: '',
  experimental: {
    esmExternals: false
  }
}

export default nextConfig
EOF

echo -e "${YELLOW}Step 2: Building static export...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Please fix the errors and try again.${NC}"
    # Restore original config
    mv next.config.ts.backup next.config.ts
    exit 1
fi

echo -e "${GREEN}Static build completed successfully!${NC}"

echo -e "${YELLOW}Step 3: Exporting static files...${NC}"
npx next export

echo -e "${YELLOW}Step 4: Connecting to server and preparing public directory...${NC}"
execute_ssh "mkdir -p $PUBLIC_PATH && rm -rf $PUBLIC_PATH/*"

echo -e "${YELLOW}Step 5: Uploading static files to server...${NC}"
copy_files out/* $PUBLIC_PATH/

echo -e "${YELLOW}Step 6: Setting correct permissions...${NC}"
execute_ssh "chmod -R 755 $PUBLIC_PATH"

echo -e "${YELLOW}Step 7: Creating .htaccess file for routing...${NC}"
execute_ssh "cat > $PUBLIC_PATH/.htaccess << 'EOL'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
EOL"

echo -e "${YELLOW}Step 8: Testing deployment...${NC}"
execute_ssh "ls -la $PUBLIC_PATH"

# Restore original config
mv next.config.ts.backup next.config.ts

echo -e "${GREEN}=== Static deployment completed successfully! ===${NC}"
echo -e "${GREEN}Your static site is now deployed to Namecheap.${NC}"
echo -e "${YELLOW}Access your site at: http://$SERVER_IP${NC}"
echo -e "${YELLOW}Or through your domain: https://elhamdimports.com${NC}"

# Clean up
rm -rf out

echo -e "${YELLOW}Note: Static export means some dynamic features (API routes, database operations) will not work.${NC}"
echo -e "${YELLOW}For full functionality, use the dynamic deployment script (deploy.sh)${NC}"