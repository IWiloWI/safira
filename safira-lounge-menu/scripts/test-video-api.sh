#!/bin/bash
# Video API Test Script
# Usage: ./test-video-api.sh

set -e

# Configuration
API_URL="http://test.safira-lounge.de/safira-api-fixed.php"
TEST_VIDEO="test-video.mp4"
CATEGORY="home"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Safira Video API Test Suite         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Function to print test result
print_result() {
    local test_name=$1
    local status=$2
    local response=$3

    if [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
        echo "   Response: $(echo $response | jq -r '.status // .message // .error' 2>/dev/null || echo $response)"
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name (HTTP $status)"
        echo "   Response: $response"
    fi
    echo ""
}

# Test 1: Check API availability
echo -e "${YELLOW}Test 1: API Health Check${NC}"
response=$(curl -s -w "\n%{http_code}" "${API_URL}?action=test")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
print_result "API Health Check" "$http_code" "$body"

# Test 2: List available videos
echo -e "${YELLOW}Test 2: List Available Videos${NC}"
response=$(curl -s -w "\n%{http_code}" "${API_URL}?action=list_videos")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
print_result "List Videos" "$http_code" "$body"

# Test 3: Get current video mappings
echo -e "${YELLOW}Test 3: Get Video Mappings${NC}"
response=$(curl -s -w "\n%{http_code}" "${API_URL}?action=get_video_mappings")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
print_result "Get Video Mappings" "$http_code" "$body"

# Test 4: Upload without file parameter (should fail with 400)
echo -e "${YELLOW}Test 4: Upload Without File (Expected to Fail)${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}?action=upload")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Correctly rejected upload without file"
    echo "   Response: $(echo $body | jq -r '.error' 2>/dev/null || echo $body)"
else
    echo -e "${RED}✗ FAIL${NC} - Should return 400 but got $http_code"
    echo "   Response: $body"
fi
echo ""

# Test 5: Upload with wrong file type (should fail with 400)
echo -e "${YELLOW}Test 5: Upload Invalid File Type (Expected to Fail)${NC}"
# Create a temporary text file to test
echo "This is not a video" > /tmp/test.txt
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}?action=upload" -F "file=@/tmp/test.txt")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
rm /tmp/test.txt
if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Correctly rejected invalid file type"
    echo "   Response: $(echo $body | jq -r '.error' 2>/dev/null || echo $body)"
else
    echo -e "${RED}✗ FAIL${NC} - Should return 400 but got $http_code"
    echo "   Response: $body"
fi
echo ""

# Test 6: Save video mapping without parameters (should fail with 400)
echo -e "${YELLOW}Test 6: Save Mapping Without Parameters (Expected to Fail)${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}?action=save_video_mapping")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Correctly rejected missing parameters"
    echo "   Debug Info:"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo -e "${RED}✗ FAIL${NC} - Should return 400 but got $http_code"
    echo "   Response: $body"
fi
echo ""

# Test 7: Save video mapping with blob URL (should fail with 400)
echo -e "${YELLOW}Test 7: Save Mapping With Blob URL (Expected to Fail)${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}?action=save_video_mapping" \
    -F "category_id=test" \
    -F "video_path=blob:http://example.com/12345")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✓ PASS${NC} - Correctly rejected blob URL"
    echo "   Response: $(echo $body | jq -r '.error' 2>/dev/null || echo $body)"
else
    echo -e "${RED}✗ FAIL${NC} - Should return 400 but got $http_code"
    echo "   Response: $body"
fi
echo ""

# Test 8: Save video mapping with valid data
echo -e "${YELLOW}Test 8: Save Valid Video Mapping${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}?action=save_video_mapping" \
    -F "category_id=test_category" \
    -F "video_path=/safira/videos/test.mp4")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
print_result "Save Valid Mapping" "$http_code" "$body"

# Test 9: Test with JSON payload
echo -e "${YELLOW}Test 9: Save Mapping With JSON Payload${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "${API_URL}?action=save_video_mapping" \
    -H "Content-Type: application/json" \
    -d '{"category_id":"test_json","video_path":"/safira/videos/test.mp4"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')
print_result "Save Mapping (JSON)" "$http_code" "$body"

# Test 10: Check if video directory exists and is writable
echo -e "${YELLOW}Test 10: Check Video Directory Permissions${NC}"
if [ -d "/Users/umitgencay/Safira/safira-lounge-menu/public/safira/videos" ]; then
    echo -e "${GREEN}✓${NC} Directory exists: /safira/videos/"

    if [ -w "/Users/umitgencay/Safira/safira-lounge-menu/public/safira/videos" ]; then
        echo -e "${GREEN}✓${NC} Directory is writable"
    else
        echo -e "${RED}✗${NC} Directory is NOT writable"
    fi
else
    echo -e "${RED}✗${NC} Directory does NOT exist: /safira/videos/"
    echo "   Create it with: mkdir -p /path/to/public/safira/videos"
fi
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Test Summary                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "API Endpoint: ${API_URL}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. If tests fail, check /safira_error.log for PHP errors"
echo "2. Verify database connection and video_mappings table"
echo "3. Test with actual video file upload (use Test 11 below)"
echo ""
echo -e "${YELLOW}Manual Test Command (with actual video):${NC}"
echo "curl -X POST '${API_URL}?action=upload' \\"
echo "  -F 'file=@/path/to/your/video.mp4' -v"
echo ""