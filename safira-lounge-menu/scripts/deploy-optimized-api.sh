#!/bin/bash
# Deploy Optimized API to Test Server
# Usage: ./deploy-optimized-api.sh

set -e  # Exit on error

echo "🚀 Safira API Optimization - Deployment Script"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
OPTIMIZED_FILE="safira-api-optimized.php"
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${YELLOW}Step 1: Pre-deployment checks${NC}"
echo "--------------------------------------"

# Check if optimized file exists
if [ ! -f "$OPTIMIZED_FILE" ]; then
    echo -e "${RED}❌ Error: $OPTIMIZED_FILE not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Optimized file found${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup directory ready${NC}"

echo ""
echo -e "${YELLOW}Step 2: Backup current API${NC}"
echo "--------------------------------------"

# Backup current production file
if [ -f "safira-api-fixed.php" ]; then
    BACKUP_FILE="$BACKUP_DIR/safira-api-fixed.php.backup.$TIMESTAMP"
    cp safira-api-fixed.php "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  No current API file to backup${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Deployment options${NC}"
echo "--------------------------------------"
echo "Choose deployment strategy:"
echo "  1) Test alongside (deploy as safira-api-optimized.php)"
echo "  2) Replace current (replace safira-api-fixed.php)"
echo "  3) Cancel"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}✅ Deploying alongside current API${NC}"
        echo "Test URL will be: http://test.safira-lounge.de/safira-api-optimized.php?action=products"
        echo ""
        echo "Upload $OPTIMIZED_FILE to your server via FTP/SFTP"
        echo ""
        echo "Test commands:"
        echo "  curl http://test.safira-lounge.de/safira-api-optimized.php?action=test"
        echo "  curl http://test.safira-lounge.de/safira-api-optimized.php?action=products | jq '._performance'"
        ;;
    2)
        echo ""
        echo -e "${YELLOW}⚠️  WARNING: This will replace the current API!${NC}"
        read -p "Are you sure? Type 'yes' to confirm: " confirm
        if [ "$confirm" = "yes" ]; then
            cp "$OPTIMIZED_FILE" safira-api-fixed.php
            echo -e "${GREEN}✅ API replaced with optimized version${NC}"
            echo "Upload safira-api-fixed.php to your server"
        else
            echo -e "${RED}❌ Deployment cancelled${NC}"
            exit 1
        fi
        ;;
    3)
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}Step 4: Performance testing${NC}"
echo "--------------------------------------"
echo "After uploading, run these tests:"
echo ""
echo "# Test 1: Verify API works"
echo "curl http://test.safira-lounge.de/safira-api-optimized.php?action=test"
echo ""
echo "# Test 2: Check performance (cache miss)"
echo "curl -w '\nTime: %{time_total}s\n' \\"
echo "  http://test.safira-lounge.de/safira-api-optimized.php?action=products\&nocache=1"
echo ""
echo "# Test 3: Check performance (cache hit)"
echo "curl -w '\nTime: %{time_total}s\n' \\"
echo "  http://test.safira-lounge.de/safira-api-optimized.php?action=products"
echo ""
echo "# Test 4: Performance metrics"
echo "curl http://test.safira-lounge.de/safira-api-optimized.php?action=products | jq '._performance'"
echo ""

echo -e "${YELLOW}Step 5: Rollback procedure (if needed)${NC}"
echo "--------------------------------------"
echo "If you encounter issues, restore from backup:"
echo "  cp $BACKUP_FILE safira-api-fixed.php"
echo "  # Upload to server"
echo ""

echo -e "${GREEN}🎉 Deployment script complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Upload $OPTIMIZED_FILE to server"
echo "  2. Run performance tests"
echo "  3. Monitor error logs"
echo "  4. Compare metrics with baseline"
echo ""
