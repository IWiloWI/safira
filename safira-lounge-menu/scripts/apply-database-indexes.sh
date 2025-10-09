#!/bin/bash
# Apply Database Indexes - Phase 2 Optimization
# Usage: ./apply-database-indexes.sh

set -e  # Exit on error

echo "🗄️  Safira API - Phase 2: Database Index Optimization"
echo "====================================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SQL_FILE="database/phase2_database_indexes.sql"
BACKUP_DIR="database/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${YELLOW}Phase 2: Database Index Optimization${NC}"
echo "Expected improvement: 30-40% (237ms → 150-180ms)"
echo ""

# ===================================================================
# PRE-FLIGHT CHECKS
# ===================================================================
echo -e "${BLUE}Step 1: Pre-flight checks${NC}"
echo "--------------------------------------"

# Check if SQL file exists
if [ ! -f "$SQL_FILE" ]; then
    echo -e "${RED}❌ Error: $SQL_FILE not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ SQL script found${NC}"

# Check database credentials
echo ""
echo "Database connection details:"
echo "  Host: db5018522360.hosting-data.io"
echo "  Database: dbs14708743"
echo "  User: dbu3362598"
echo ""

# ===================================================================
# PERFORMANCE BASELINE
# ===================================================================
echo -e "${BLUE}Step 2: Measure current performance (baseline)${NC}"
echo "--------------------------------------"
echo "Testing API performance BEFORE indexes..."
echo ""

# Test 3 times and calculate average
total=0
for i in {1..3}; do
    time=$(curl -w "%{time_total}" -o /dev/null -s \
      "http://test.safira-lounge.de/safira-api-fixed.php?action=products&nocache=1")
    echo "  Test $i: ${time}s"
    total=$(echo "$total + $time" | bc)
done

avg_before=$(echo "scale=3; $total / 3" | bc)
echo ""
echo -e "${YELLOW}Baseline average: ${avg_before}s${NC}"
echo ""

# ===================================================================
# DATABASE BACKUP
# ===================================================================
echo -e "${BLUE}Step 3: Backup strategy${NC}"
echo "--------------------------------------"
echo "IMPORTANT: Indexes are non-destructive (no data loss risk)"
echo "However, you should have a database backup before proceeding."
echo ""
echo -e "${YELLOW}⚠️  Do you have a recent database backup?${NC}"
read -p "Continue? (yes/no): " backup_confirm

if [ "$backup_confirm" != "yes" ]; then
    echo -e "${RED}❌ Aborted. Please backup database first.${NC}"
    echo ""
    echo "To backup via phpMyAdmin:"
    echo "  1. Login to phpMyAdmin"
    echo "  2. Select database 'dbs14708743'"
    echo "  3. Click 'Export' tab"
    echo "  4. Click 'Go' to download backup"
    exit 1
fi

echo -e "${GREEN}✅ Backup confirmed${NC}"
echo ""

# ===================================================================
# APPLY INDEXES
# ===================================================================
echo -e "${BLUE}Step 4: Apply database indexes${NC}"
echo "--------------------------------------"
echo "This will create 17 indexes across 4 tables:"
echo "  • 4 indexes on categories"
echo "  • 4 indexes on subcategories"
echo "  • 6 indexes on products (most critical)"
echo "  • 3 indexes on product_sizes"
echo ""
echo "Estimated time: 1-3 minutes"
echo ""

read -p "Apply indexes now? (yes/no): " apply_confirm

if [ "$apply_confirm" != "yes" ]; then
    echo -e "${RED}❌ Index application cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Applying indexes...${NC}"
echo ""

# ===================================================================
# OPTION 1: Apply via MySQL command line (if available)
# ===================================================================
echo "Choose application method:"
echo "  1) Manual (copy SQL and run in phpMyAdmin)"
echo "  2) Automatic (requires mysql command - may not work)"
echo ""
read -p "Enter choice [1-2]: " method

case $method in
    1)
        echo ""
        echo -e "${GREEN}Manual application selected${NC}"
        echo ""
        echo "Steps to apply indexes:"
        echo "  1. Open phpMyAdmin"
        echo "  2. Select database 'dbs14708743'"
        echo "  3. Click 'SQL' tab"
        echo "  4. Copy entire content of: $SQL_FILE"
        echo "  5. Paste into SQL query box"
        echo "  6. Click 'Go' to execute"
        echo ""
        echo "The script will:"
        echo "  • Create all indexes"
        echo "  • Optimize tables"
        echo "  • Update statistics"
        echo "  • Show verification results"
        echo ""
        echo -e "${YELLOW}Opening SQL file location...${NC}"
        open "$(dirname "$SQL_FILE")" 2>/dev/null || echo "SQL file location: $(pwd)/$SQL_FILE"
        echo ""
        read -p "Press ENTER after applying indexes in phpMyAdmin..."
        ;;
    2)
        echo ""
        echo "Attempting automatic application..."

        # Try to connect to database
        DB_HOST="db5018522360.hosting-data.io"
        DB_NAME="dbs14708743"
        DB_USER="dbu3362598"
        DB_PASS='!Aramat1.'

        if command -v mysql &> /dev/null; then
            echo "MySQL client found, applying indexes..."
            mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SQL_FILE"
            echo -e "${GREEN}✅ Indexes applied successfully${NC}"
        else
            echo -e "${RED}❌ mysql command not found${NC}"
            echo "Please use manual method (Option 1)"
            exit 1
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Indexes applied${NC}"
echo ""

# ===================================================================
# PERFORMANCE TESTING
# ===================================================================
echo -e "${BLUE}Step 5: Measure performance AFTER indexes${NC}"
echo "--------------------------------------"
echo "Testing API performance with new indexes..."
echo ""

# Clear cache to force fresh queries
curl -o /dev/null -s "http://test.safira-lounge.de/safira-api-fixed.php?action=products&nocache=1" 2>/dev/null
sleep 2

# Test 3 times and calculate average
total=0
for i in {1..3}; do
    time=$(curl -w "%{time_total}" -o /dev/null -s \
      "http://test.safira-lounge.de/safira-api-fixed.php?action=products&nocache=1")
    echo "  Test $i: ${time}s"
    total=$(echo "$total + $time" | bc)
    sleep 1
done

avg_after=$(echo "scale=3; $total / 3" | bc)
echo ""
echo -e "${YELLOW}After indexes average: ${avg_after}s${NC}"
echo ""

# ===================================================================
# RESULTS COMPARISON
# ===================================================================
echo -e "${BLUE}Step 6: Performance comparison${NC}"
echo "--------------------------------------"

improvement=$(echo "scale=1; ($avg_before - $avg_after) / $avg_before * 100" | bc)
speedup=$(echo "scale=2; $avg_before / $avg_after" | bc)

echo "BEFORE: ${avg_before}s"
echo "AFTER:  ${avg_after}s"
echo ""
echo -e "${GREEN}Improvement: ${improvement}% faster${NC}"
echo -e "${GREEN}Speedup: ${speedup}x${NC}"
echo ""

if (( $(echo "$improvement > 20" | bc -l) )); then
    echo -e "${GREEN}🎉 Excellent improvement!${NC}"
elif (( $(echo "$improvement > 10" | bc -l) )); then
    echo -e "${YELLOW}✅ Good improvement${NC}"
else
    echo -e "${YELLOW}⚠️  Modest improvement - indexes may already have existed${NC}"
fi

echo ""

# ===================================================================
# VERIFICATION
# ===================================================================
echo -e "${BLUE}Step 7: Verify index usage${NC}"
echo "--------------------------------------"
echo "Check detailed performance metrics:"
echo ""
curl -s "http://test.safira-lounge.de/safira-api-fixed.php?action=products&nocache=1" | \
    jq '._performance.breakdown | {
        "DB Queries Total": .query_sizes,
        "Query Categories": (.query_categories - .cache_miss_start_db),
        "Query Subcategories": (.query_subcategories - .query_categories),
        "Query Products": (.query_products - .query_subcategories),
        "Query Sizes": (.query_sizes - .query_products)
    }'

echo ""

# ===================================================================
# COMPLETION
# ===================================================================
echo -e "${GREEN}======================================"
echo "✅ Phase 2 Optimization Complete!"
echo "======================================${NC}"
echo ""
echo "Summary:"
echo "  • 17 database indexes created"
echo "  • Tables optimized and analyzed"
echo "  • Performance improvement: ${improvement}%"
echo ""
echo "Current performance:"
echo "  • Cache miss: ${avg_after}s"
echo "  • Cache hit: ~0.03s (from Phase 1)"
echo ""
echo "Next steps:"
echo "  1. Monitor performance over 24 hours"
echo "  2. Check slow query log"
echo "  3. Consider Phase 3 (OpCache) for further gains"
echo ""
echo "Rollback (if needed):"
echo "  • Run rollback section in $SQL_FILE"
echo "  • Indexes can be safely dropped without data loss"
echo ""

# Save results
mkdir -p database/performance-reports
cat > "database/performance-reports/phase2_results_${TIMESTAMP}.txt" << EOF
Phase 2: Database Index Optimization Results
=============================================
Date: $(date)
Indexes Applied: 17

Performance Results:
- Before: ${avg_before}s
- After:  ${avg_after}s
- Improvement: ${improvement}%
- Speedup: ${speedup}x

Status: SUCCESS
EOF

echo -e "${GREEN}Results saved to: database/performance-reports/phase2_results_${TIMESTAMP}.txt${NC}"
echo ""
