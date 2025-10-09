#!/bin/bash

###############################################################################
# Video Optimization Script for Safira Lounge Menu
#
# This script optimizes video files for web playback on tablets and mobile
# devices by reducing file size and bitrate while maintaining quality.
#
# Usage: ./optimize-videos.sh [input_directory] [output_directory]
#
# Example: ./optimize-videos.sh /path/to/videos /path/to/optimized
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default directories
INPUT_DIR="${1:-./videos}"
OUTPUT_DIR="${2:-./videos_optimized}"

# Compression presets
PRESET_720P="720p"      # 1-2 Mbps, good for mobile
PRESET_1080P="1080p"    # 2-3 Mbps, good balance
PRESET_AGGRESSIVE="aggressive"  # 1 Mbps, smallest files

# Default preset
PRESET="${3:-$PRESET_720P}"

###############################################################################
# Functions
###############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Safira Lounge - Video Optimization Script${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_dependencies() {
    print_info "Checking dependencies..."

    if ! command -v ffmpeg &> /dev/null; then
        print_error "FFmpeg is not installed!"
        echo ""
        echo "Install FFmpeg:"
        echo "  Ubuntu/Debian: sudo apt install ffmpeg"
        echo "  macOS: brew install ffmpeg"
        echo "  Windows: Download from https://ffmpeg.org/download.html"
        exit 1
    fi

    print_success "FFmpeg is installed"
    ffmpeg -version | head -n 1
    echo ""
}

get_file_size() {
    local file="$1"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        stat -f%z "$file"
    else
        # Linux
        stat -c%s "$file"
    fi
}

format_size() {
    local size=$1
    local mb=$(echo "scale=2; $size / 1048576" | bc)
    echo "${mb} MB"
}

get_compression_params() {
    local preset=$1

    case $preset in
        "$PRESET_720P")
            echo "-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2 -b:v 1500k -maxrate 2000k -bufsize 4000k -b:a 96k"
            ;;
        "$PRESET_1080P")
            echo "-vf scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2 -b:v 2500k -maxrate 3000k -bufsize 6000k -b:a 128k"
            ;;
        "$PRESET_AGGRESSIVE")
            echo "-vf scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2 -b:v 1000k -maxrate 1500k -bufsize 3000k -b:a 96k"
            ;;
        *)
            print_error "Unknown preset: $preset"
            exit 1
            ;;
    esac
}

optimize_video() {
    local input_file="$1"
    local output_file="$2"
    local preset="$3"

    local filename=$(basename "$input_file")

    print_info "Processing: $filename"

    # Get original file size
    local original_size=$(get_file_size "$input_file")
    local original_size_mb=$(format_size $original_size)

    echo "  Original size: $original_size_mb"

    # Get compression parameters
    local params=$(get_compression_params "$preset")

    # Run FFmpeg
    echo "  Optimizing..."
    ffmpeg -i "$input_file" \
        -c:v libx264 \
        -preset slow \
        -crf 23 \
        $params \
        -c:a aac \
        -ar 44100 \
        -movflags +faststart \
        -pix_fmt yuv420p \
        -y \
        "$output_file" \
        -hide_banner \
        -loglevel error \
        -stats

    if [ $? -eq 0 ]; then
        # Get optimized file size
        local optimized_size=$(get_file_size "$output_file")
        local optimized_size_mb=$(format_size $optimized_size)

        # Calculate reduction
        local reduction=$(echo "scale=1; 100 - ($optimized_size * 100 / $original_size)" | bc)

        print_success "Optimized: $optimized_size_mb (${reduction}% reduction)"
        echo ""

        return 0
    else
        print_error "Failed to optimize $filename"
        echo ""
        return 1
    fi
}

###############################################################################
# Main Script
###############################################################################

print_header

check_dependencies

# Validate input directory
if [ ! -d "$INPUT_DIR" ]; then
    print_error "Input directory does not exist: $INPUT_DIR"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

print_info "Input directory: $INPUT_DIR"
print_info "Output directory: $OUTPUT_DIR"
print_info "Compression preset: $PRESET"
echo ""

# Find all MP4 files
mapfile -t video_files < <(find "$INPUT_DIR" -type f -name "*.mp4")

if [ ${#video_files[@]} -eq 0 ]; then
    print_warning "No .mp4 files found in $INPUT_DIR"
    exit 0
fi

print_info "Found ${#video_files[@]} video file(s)"
echo ""

# Process each video
total_original=0
total_optimized=0
success_count=0
failed_count=0

for input_file in "${video_files[@]}"; do
    filename=$(basename "$input_file")
    output_file="$OUTPUT_DIR/$filename"

    # Track sizes
    original_size=$(get_file_size "$input_file")
    total_original=$((total_original + original_size))

    if optimize_video "$input_file" "$output_file" "$PRESET"; then
        optimized_size=$(get_file_size "$output_file")
        total_optimized=$((total_optimized + optimized_size))
        success_count=$((success_count + 1))
    else
        failed_count=$((failed_count + 1))
    fi
done

# Print summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
print_success "Successfully optimized: $success_count file(s)"

if [ $failed_count -gt 0 ]; then
    print_error "Failed: $failed_count file(s)"
fi

echo ""
total_original_mb=$(format_size $total_original)
total_optimized_mb=$(format_size $total_optimized)
total_saved=$((total_original - total_optimized))
total_saved_mb=$(format_size $total_saved)

if [ $total_original -gt 0 ]; then
    total_reduction=$(echo "scale=1; 100 - ($total_optimized * 100 / $total_original)" | bc)
else
    total_reduction=0
fi

echo "Total original size:  $total_original_mb"
echo "Total optimized size: $total_optimized_mb"
echo "Total saved:          $total_saved_mb (${total_reduction}% reduction)"
echo ""

print_success "Optimization complete!"
echo ""
echo "Next steps:"
echo "  1. Test optimized videos on tablet/mobile devices"
echo "  2. Upload optimized videos to server: /safira/videos/"
echo "  3. Monitor playback performance"
echo ""
