#!/bin/bash

# Performance Benchmark Script for Safira API
# Usage: ./benchmark-test.sh [old|new|both]

set -e

# Configuration
OLD_API="https://test.safira-lounge.de/safira-api-fixed.php"
NEW_API="https://test.safira-lounge.de/safira-api-optimized.php"
RUNS=10
FORMAT_FILE="curl-format.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run benchmark
benchmark_endpoint() {
    local url=$1
    local name=$2
    local total_time=0
    local total_size=0

    echo -e "${YELLOW}Testing: $name${NC}"
    echo "URL: $url"
    echo "Runs: $RUNS"
    echo "---"

    for i in $(seq 1 $RUNS); do
        echo -n "Run $i/$RUNS... "

        # Run curl and capture timing
        result=$(curl -s -w "@$FORMAT_FILE" -o /dev/null "$url?action=products&lang=de")

        time=$(echo "$result" | grep "time_total:" | awk '{print $2}' | sed 's/s//')
        size=$(echo "$result" | grep "size_download:" | awk '{print $2}')

        total_time=$(echo "$total_time + $time" | bc)
        total_size=$(echo "$total_size + $size" | bc)

        echo -e "${GREEN}${time}s, ${size} bytes${NC}"
    done

    # Calculate averages
    avg_time=$(echo "scale=3; $total_time / $RUNS" | bc)
    avg_size=$(echo "scale=0; $total_size / $RUNS" | bc)

    echo -e "${GREEN}================================${NC}"
    echo -e "Average Response Time: ${GREEN}${avg_time}s${NC}"
    echo -e "Average Payload Size: ${GREEN}${avg_size} bytes ($(echo "scale=1; $avg_size / 1024" | bc) KB)${NC}"
    echo -e "${GREEN}================================${NC}"
    echo ""

    # Export results
    echo "$avg_time" > "${name}_time.txt"
    echo "$avg_size" > "${name}_size.txt"
}

# Function to compare results
compare_results() {
    if [ -f "old_time.txt" ] && [ -f "new_time.txt" ]; then
        old_time=$(cat old_time.txt)
        new_time=$(cat new_time.txt)
        old_size=$(cat old_size.txt)
        new_size=$(cat new_size.txt)

        time_improvement=$(echo "scale=1; (($old_time - $new_time) / $old_time) * 100" | bc)
        size_improvement=$(echo "scale=1; (($old_size - $new_size) / $old_size) * 100" | bc)

        echo -e "${YELLOW}================================${NC}"
        echo -e "${YELLOW}COMPARISON RESULTS${NC}"
        echo -e "${YELLOW}================================${NC}"
        echo ""
        echo -e "Response Time:"
        echo -e "  Old: ${RED}${old_time}s${NC}"
        echo -e "  New: ${GREEN}${new_time}s${NC}"
        echo -e "  Improvement: ${GREEN}${time_improvement}%${NC}"
        echo ""
        echo -e "Payload Size:"
        echo -e "  Old: ${RED}$(echo "scale=1; $old_size / 1024" | bc) KB${NC}"
        echo -e "  New: ${GREEN}$(echo "scale=1; $new_size / 1024" | bc) KB${NC}"
        echo -e "  Improvement: ${GREEN}${size_improvement}%${NC}"
        echo -e "${YELLOW}================================${NC}"

        # Cleanup
        rm -f old_time.txt new_time.txt old_size.txt new_size.txt
    fi
}

# Main script
case "${1:-both}" in
    old)
        benchmark_endpoint "$OLD_API" "old"
        ;;
    new)
        benchmark_endpoint "$NEW_API" "new"
        ;;
    both)
        benchmark_endpoint "$OLD_API" "old"
        benchmark_endpoint "$NEW_API" "new"
        compare_results
        ;;
    *)
        echo "Usage: $0 [old|new|both]"
        exit 1
        ;;
esac
