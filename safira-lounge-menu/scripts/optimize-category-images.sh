#!/bin/bash

# Category Image Optimization Script
# Compresses and creates responsive versions of category images

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Category Image Optimization ===${NC}\n"

# Check if ffmpeg is installed (for image optimization)
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: ffmpeg is not installed${NC}"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Input directory (adjust based on your setup)
INPUT_DIR="../public/images"
OUTPUT_DIR="../public/images/categories"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Image sizes to generate
SIZES=(300 600 900)

# Find all category images that don't have responsive versions
echo -e "${YELLOW}Searching for category images...${NC}\n"

# Process category_*.webp files
for input_file in "$INPUT_DIR"/category_*.webp; do
    if [ ! -f "$input_file" ]; then
        continue
    fi

    # Extract filename without path
    filename=$(basename "$input_file")

    # Extract category ID from filename (e.g., category_11_1759741750.webp -> 11)
    if [[ $filename =~ category_([0-9]+)_ ]]; then
        category_id="${BASH_REMATCH[1]}"
    else
        echo -e "${RED}Warning: Could not extract category ID from $filename${NC}"
        continue
    fi

    echo -e "${GREEN}Processing: $filename (Category ID: $category_id)${NC}"

    # Generate responsive versions
    for size in "${SIZES[@]}"; do
        output_file="$OUTPUT_DIR/category_${category_id}_${size}w.webp"

        if [ -f "$output_file" ]; then
            echo -e "  ${YELLOW}⏭  Skipping $output_file (already exists)${NC}"
            continue
        fi

        echo -e "  ${BLUE}📦 Creating ${size}w version...${NC}"

        # Use ffmpeg to resize and optimize
        ffmpeg -i "$input_file" \
            -vf "scale=${size}:-1:force_original_aspect_ratio=decrease" \
            -c:v libwebp \
            -quality 85 \
            -compression_level 6 \
            -lossless 0 \
            -y \
            "$output_file" \
            -hide_banner -loglevel error

        # Get file sizes
        original_size=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file")
        new_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file")

        original_kb=$((original_size / 1024))
        new_kb=$((new_size / 1024))
        savings=$((100 - (new_size * 100 / original_size)))

        echo -e "  ${GREEN}✅ Created: $output_file${NC}"
        echo -e "     Original: ${original_kb}KB → New: ${new_kb}KB (${savings}% smaller)"
    done

    echo ""
done

echo -e "${GREEN}=== Optimization Complete! ===${NC}\n"

# Print summary
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Update database to use new responsive image URLs"
echo "2. Example: UPDATE categories SET image = '/images/categories/category_11_600w.webp' WHERE id = 11"
echo ""
echo -e "${YELLOW}Database Update SQL:${NC}"

for input_file in "$INPUT_DIR"/category_*.webp; do
    if [ ! -f "$input_file" ]; then
        continue
    fi

    filename=$(basename "$input_file")

    if [[ $filename =~ category_([0-9]+)_ ]]; then
        category_id="${BASH_REMATCH[1]}"
        echo "UPDATE categories SET image = '/images/categories/category_${category_id}_600w.webp' WHERE id = ${category_id};"
    fi
done

echo ""
echo -e "${GREEN}Done!${NC}"
