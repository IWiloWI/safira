#!/bin/bash

# Deploy Debug API to IONOS Server
# This script uploads the debug API for database schema investigation

echo "🔍 Deploying Safira Lounge Debug API..."

# Configuration
HOST="test.safira-lounge.de"
USERNAME="ssh_umitgencay"
REMOTE_PATH="/homepages/5/d914788430/htdocs"
LOCAL_DEBUG_PATH="./api-debug"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Debug API Deployment Configuration:${NC}"
echo -e "  Host: ${YELLOW}$HOST${NC}"
echo -e "  Remote Path: ${YELLOW}$REMOTE_PATH/api-debug${NC}"
echo -e "  Local Source: ${YELLOW}$LOCAL_DEBUG_PATH${NC}"

# Check if debug API directory exists
if [ ! -d "$LOCAL_DEBUG_PATH" ]; then
    echo -e "${RED}❌ Error: Debug API directory not found at $LOCAL_DEBUG_PATH${NC}"
    exit 1
fi

echo -e "\n${BLUE}🚀 Starting deployment...${NC}"

# Create remote directory and upload files
echo -e "${YELLOW}📁 Creating remote debug API directory...${NC}"
ssh ${USERNAME}@${HOST} "mkdir -p ${REMOTE_PATH}/api-debug"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Remote directory created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create remote directory${NC}"
    exit 1
fi

# Upload debug API files
echo -e "${YELLOW}📤 Uploading debug API files...${NC}"
scp -r ${LOCAL_DEBUG_PATH}/* ${USERNAME}@${HOST}:${REMOTE_PATH}/api-debug/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Debug API files uploaded successfully${NC}"
else
    echo -e "${RED}❌ Failed to upload debug API files${NC}"
    exit 1
fi

# Set proper permissions
echo -e "${YELLOW}🔐 Setting file permissions...${NC}"
ssh ${USERNAME}@${HOST} "
    chmod 755 ${REMOTE_PATH}/api-debug
    chmod 644 ${REMOTE_PATH}/api-debug/*.php
    chmod 644 ${REMOTE_PATH}/api-debug/.htaccess
    chmod 755 ${REMOTE_PATH}/api-debug/endpoints
    chmod 644 ${REMOTE_PATH}/api-debug/endpoints/*.php
"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ File permissions set successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Could not set all file permissions${NC}"
fi

echo -e "\n${GREEN}🎉 Debug API deployment completed!${NC}"

echo -e "\n${BLUE}🔗 Debug API Endpoints:${NC}"
echo -e "  Health Check: ${YELLOW}http://$HOST/api-debug/health${NC}"
echo -e "  Database Overview: ${YELLOW}http://$HOST/api-debug/debug${NC}"
echo -e "  Categories Table Analysis: ${YELLOW}http://$HOST/api-debug/debug/categories${NC}"
echo -e "  Test Categories Query: ${YELLOW}http://$HOST/api-debug/debug/test-query${NC}"
echo -e "  Sample Data: ${YELLOW}http://$HOST/api-debug/debug/sample-data${NC}"
echo -e "  Categories API (Debug): ${YELLOW}http://$HOST/api-debug/categories${NC}"

echo -e "\n${BLUE}🧪 Testing Debug API...${NC}"

# Test health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST/api-debug/health")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Health endpoint responding (HTTP $response)${NC}"
else
    echo -e "${RED}❌ Health endpoint failed (HTTP $response)${NC}"
fi

# Test debug endpoint
echo -e "${YELLOW}Testing debug endpoint...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST/api-debug/debug")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Debug endpoint responding (HTTP $response)${NC}"
else
    echo -e "${RED}❌ Debug endpoint failed (HTTP $response)${NC}"
fi

echo -e "\n${GREEN}🔍 Debug API Ready for Schema Investigation!${NC}"
echo -e "\n${BLUE}📖 Next Steps:${NC}"
echo -e "1. Visit: ${YELLOW}http://$HOST/api-debug/debug/categories${NC}"
echo -e "2. Check the database column structure"
echo -e "3. Analyze the JSON data format"
echo -e "4. Compare with working vs failing queries"
echo -e "5. Test category creation with: ${YELLOW}http://$HOST/api-debug/categories${NC}"

echo -e "\n${YELLOW}⚠️  Remember: This debug API exposes database structure - remove after investigation!${NC}"