# Video Optimization Guide for Safira Lounge Menu

## Problem
Videos are constantly buffering on tablets and mobile devices because they are too large/high-bitrate for smooth web playback over mobile networks.

## Solution
Compress videos using FFmpeg with web-optimized settings to reduce file size while maintaining acceptable quality.

---

## Quick Start

### 1. Install FFmpeg (if not already installed)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### 2. Run the Optimization Script

```bash
chmod +x optimize-videos.sh
./optimize-videos.sh
```

---

## Video Optimization Settings

### Recommended Settings for Web Playback

#### For 1080p Videos (1920x1080):
- **Target Bitrate:** 2-3 Mbps
- **Resolution:** Keep at 1080p or downscale to 720p
- **Codec:** H.264 (AVC) - best browser compatibility
- **Audio:** AAC, 128 kbps

#### For 720p Videos (1280x720):
- **Target Bitrate:** 1-2 Mbps
- **Resolution:** Keep at 720p
- **Codec:** H.264 (AVC)
- **Audio:** AAC, 96 kbps

### FFmpeg Command Examples

#### Optimize 1080p video (high quality):
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -b:v 2500k \
  -maxrate 3000k \
  -bufsize 6000k \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac \
  -b:a 128k \
  -ar 44100 \
  -movflags +faststart \
  -pix_fmt yuv420p \
  output.mp4
```

#### Optimize to 720p (smaller file, faster loading):
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 23 \
  -b:v 1500k \
  -maxrate 2000k \
  -bufsize 4000k \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac \
  -b:a 96k \
  -ar 44100 \
  -movflags +faststart \
  -pix_fmt yuv420p \
  output.mp4
```

#### Aggressive compression (smallest files):
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 28 \
  -b:v 1000k \
  -maxrate 1500k \
  -bufsize 3000k \
  -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac \
  -b:a 96k \
  -ar 44100 \
  -movflags +faststart \
  -pix_fmt yuv420p \
  output.mp4
```

---

## Parameter Explanation

| Parameter | Purpose |
|-----------|---------|
| `-c:v libx264` | Use H.264 codec (best compatibility) |
| `-preset slow` | Better compression (slower encoding) |
| `-crf 23` | Quality level (18-28, lower = better quality) |
| `-b:v 2500k` | Target video bitrate |
| `-maxrate 3000k` | Maximum bitrate peak |
| `-bufsize 6000k` | Buffer size (2x maxrate) |
| `-vf scale=...` | Resize and pad video |
| `-c:a aac` | AAC audio codec |
| `-b:a 128k` | Audio bitrate |
| `-movflags +faststart` | Enable streaming before full download |
| `-pix_fmt yuv420p` | Color format for maximum compatibility |

---

## Batch Processing

The `optimize-videos.sh` script will:
1. Create a backup of original videos
2. Analyze each video file size
3. Apply appropriate compression settings
4. Generate optimized versions
5. Show before/after file sizes

---

## Expected Results

### Before Optimization:
- File Size: 50-200 MB per video
- Bitrate: 10-30 Mbps
- Load Time: 10-30 seconds on 4G
- Buffering: Constant on mobile

### After Optimization:
- File Size: 5-20 MB per video (80-90% reduction)
- Bitrate: 1-3 Mbps
- Load Time: 2-5 seconds on 4G
- Buffering: Minimal to none

---

## Testing Optimized Videos

1. Upload optimized videos to server
2. Test on actual tablet/mobile device over cellular connection
3. Monitor video playback smoothness
4. Adjust compression settings if needed

---

## Troubleshooting

### Videos look pixelated/blocky
- Increase bitrate: `-b:v 3000k`
- Lower CRF value: `-crf 21`

### Videos still buffer
- Further reduce bitrate: `-b:v 1000k`
- Downscale to 720p
- Check network connection speed

### Videos won't play on some browsers
- Ensure using H.264 codec: `-c:v libx264`
- Check pixel format: `-pix_fmt yuv420p`
- Verify faststart flag: `-movflags +faststart`

---

## Additional Tips

1. **Progressive Enhancement:** Start with aggressive compression, test, then adjust if quality is too low
2. **Network Simulation:** Test with Chrome DevTools network throttling (Fast 3G, Slow 3G)
3. **Monitor Real Usage:** Check actual loading times on target devices
4. **Consider CDN:** Use a CDN to serve videos closer to users
5. **Adaptive Bitrate:** For production, consider HLS/DASH for adaptive streaming

---

## Files to Optimize

Based on the console logs, these videos are currently in use:

1. `/safira/videos/portrait-of-a-young-stylish-woman-smokes-a-hookah-2023-11-27-05-32-08-utc1_1_1.mp4`
2. `/safira/videos/cola-with-ice-cubes-close-up-2025-08-29-05-32-01-utc.mp4`
3. `/safira/videos/round-multicolored-candies-fill-the-container-2025-08-29-12-22-08-utc.mp4`
4. `/safira/videos/two-young-female-friends-are-sitting-relaxed-in-a-4k-2025-08-28-14-47-45-utc.mp4`
5. `/safira/videos/ice-tea-with-ice-cubes-rotating-4k-2025-08-28-16-31-55-utc.mp4`
6. `/safira/videos/Edit-And-Render_1.mp4`
7. `/safira/videos/Safte.mp4`
8. `/safira/videos/Cocktails.mp4`
9. `/safira/videos/Cocktail.mp4`
10. And others...

Run the optimization script on all these files.
