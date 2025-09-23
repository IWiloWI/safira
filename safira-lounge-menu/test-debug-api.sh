#!/bin/bash

# Test Debug API Endpoints
# This script tests all debug endpoints to investigate database schema

HOST="test.safira-lounge.de"
API_BASE="http://$HOST/api-debug"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Testing Safira Lounge Debug API${NC}"
echo -e "Base URL: ${YELLOW}$API_BASE${NC}\n"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local method=${3:-GET}

    echo -e "${YELLOW}Testing: $description${NC}"
    echo -e "URL: ${BLUE}$API_BASE$endpoint${NC}"

    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n---\nHTTP_CODE:%{http_code}\nTIME:%{time_total}s\n" "$API_BASE$endpoint")
    else
        echo -e "${RED}Method $method not implemented in test script${NC}"
        return
    fi

    # Extract HTTP code
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    time_taken=$(echo "$response" | grep "TIME:" | cut -d: -f2)

    # Remove status info from response
    json_response=$(echo "$response" | sed '/---/,$d')

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code, ${time_taken})${NC}"

        # Pretty print first 500 characters of JSON
        echo -e "${BLUE}Response preview:${NC}"
        echo "$json_response" | head -c 500
        if [ ${#json_response} -gt 500 ]; then
            echo -e "\n${YELLOW}... (response truncated)${NC}"
        fi
    else
        echo -e "${RED}❌ Failed (HTTP $http_code, ${time_taken})${NC}"
        echo -e "${RED}Response:${NC}"
        echo "$json_response"
    fi

    echo -e "\n---\n"
}

# Function to save full response to file
save_response() {
    local endpoint=$1
    local filename=$2

    echo -e "${YELLOW}Saving full response from $endpoint to $filename${NC}"
    curl -s "$API_BASE$endpoint" | jq . > "$filename" 2>/dev/null || curl -s "$API_BASE$endpoint" > "$filename"

    if [ -f "$filename" ]; then
        echo -e "${GREEN}✅ Response saved to $filename${NC}"
    else
        echo -e "${RED}❌ Failed to save response${NC}"
    fi
}

# Test all debug endpoints
echo -e "${BLUE}🏥 Health Check${NC}"
test_endpoint "/health" "API Health Check"

echo -e "${BLUE}📊 Database Overview${NC}"
test_endpoint "/debug" "Database Debug Overview"

echo -e "${BLUE}📋 Table Analysis${NC}"
test_endpoint "/debug/tables" "All Tables Structure"

echo -e "${BLUE}🏷️  Categories Investigation${NC}"
test_endpoint "/debug/categories" "Categories Table Analysis"

echo -e "${BLUE}🛍️  Products Investigation${NC}"
test_endpoint "/debug/products" "Products Table Analysis"

echo -e "${BLUE}📝 Sample Data${NC}"
test_endpoint "/debug/sample-data" "Sample Data from Tables"

echo -e "${BLUE}🧪 Query Testing${NC}"
test_endpoint "/debug/test-query" "Categories Query Test"

echo -e "${BLUE}📋 Categories API${NC}"
test_endpoint "/categories" "Categories API (with debug info)"

# Save detailed responses for analysis
echo -e "${BLUE}💾 Saving Detailed Responses${NC}"
mkdir -p debug-responses

save_response "/debug/categories" "debug-responses/categories-table-analysis.json"
save_response "/debug/test-query" "debug-responses/query-test-results.json"
save_response "/debug/sample-data" "debug-responses/sample-data.json"
save_response "/categories" "debug-responses/categories-api-response.json"

echo -e "${GREEN}🎉 Debug API Testing Complete!${NC}"

echo -e "\n${BLUE}📁 Saved Files:${NC}"
ls -la debug-responses/ 2>/dev/null || echo -e "${YELLOW}No response files saved${NC}"

echo -e "\n${BLUE}🔍 Key Investigation Points:${NC}"
echo -e "1. Check ${YELLOW}debug-responses/categories-table-analysis.json${NC} for actual column names"
echo -e "2. Review ${YELLOW}debug-responses/query-test-results.json${NC} for query execution details"
echo -e "3. Analyze ${YELLOW}debug-responses/sample-data.json${NC} for data structure"
echo -e "4. Compare with ${YELLOW}debug-responses/categories-api-response.json${NC} for API processing"

echo -e "\n${YELLOW}⚠️  Manual Testing Suggestions:${NC}"
echo -e "• Open each URL in browser for detailed JSON view"
echo -e "• Test category creation with POST request"
echo -e "• Compare debug info with working API responses"
echo -e "• Check for column name mismatches"

# Test category creation
echo -e "\n${BLUE}🧪 Testing Category Creation${NC}"
echo -e "${YELLOW}Creating test category...${NC}"

test_data='{
    "name": {
        "de": "Test Kategorie Debug",
        "en": "Test Category Debug",
        "tr": "Test Kategori Debug"
    },
    "icon": "🧪",
    "description": {
        "de": "Debug-Test Kategorie",
        "en": "Debug test category",
        "tr": "Debug test kategorisi"
    }
}'

create_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$test_data" \
    -w "\nHTTP_CODE:%{http_code}" \
    "$API_BASE/categories")

create_http_code=$(echo "$create_response" | grep "HTTP_CODE:" | cut -d: -f2)
create_json=$(echo "$create_response" | sed '/HTTP_CODE:/d')

if [ "$create_http_code" = "201" ]; then
    echo -e "${GREEN}✅ Category creation successful (HTTP $create_http_code)${NC}"
    echo -e "${BLUE}Creation Response:${NC}"
    echo "$create_json" | head -c 300
    echo -e "\n${YELLOW}... (truncated)${NC}"

    # Save creation response
    echo "$create_json" > debug-responses/category-creation-response.json
    echo -e "${GREEN}✅ Creation response saved to debug-responses/category-creation-response.json${NC}"
else
    echo -e "${RED}❌ Category creation failed (HTTP $create_http_code)${NC}"
    echo -e "${RED}Error Response:${NC}"
    echo "$create_json"

    # Save error response
    echo "$create_json" > debug-responses/category-creation-error.json
    echo -e "${YELLOW}⚠️  Error response saved to debug-responses/category-creation-error.json${NC}"
fi

echo -e "\n${GREEN}🔍 Debug Investigation Complete!${NC}"
echo -e "${BLUE}Next steps: Analyze saved JSON files to identify schema issues${NC}"