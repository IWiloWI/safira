# Fallback Image Testing Guide

## ✅ Deployment Status

### Completed:
- [x] Database migration (fallback_image column added)
- [x] PHP API endpoints (get_video_mappings, save_video_mapping)
- [x] Frontend Video Manager (upload UI, validation, save logic)
- [x] Frontend built and ready

### Ready for Testing:
- [ ] Upload fallback images for categories
- [ ] Verify database saves
- [ ] Test VideoBackground component integration
- [ ] Test on slow connection

## 🧪 Testing Steps

### 1. Verify Database Migration
```sql
-- Check column exists
DESCRIBE video_mappings;
-- Should show: fallback_image | varchar(255) | YES | NULL

-- Check for existing data
SELECT category_id, video_path, fallback_image FROM video_mappings;
```

### 2. Test API Endpoints

#### Test GET endpoint:
```bash
curl "https://test.safira-lounge.de/safira-api-fixed.php?action=get_video_mappings"
```

**Expected Response:**
```json
{
  "status": "success",
  "mappings": [
    {
      "category_id": "home",
      "video_path": "videos/home.mp4",
      "fallback_image": "",
      "updated_at": "2025-10-09 12:00:00"
    }
  ],
  "count": 1
}
```

#### Test POST endpoint:
```bash
curl -X POST "https://test.safira-lounge.de/safira-api-fixed.php?action=save_video_mapping" \
  -H "Content-Type: application/json" \
  -d '{
    "category_id": "home",
    "video_path": "videos/home.mp4",
    "fallback_image": "images/home-fallback.jpg"
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "Video mapping saved successfully",
  "category_id": "home",
  "video_path": "videos/home.mp4",
  "fallback_image": "images/home-fallback.jpg"
}
```

### 3. Test Video Manager UI

1. **Open Video Manager:**
   - Login to admin panel
   - Navigate to Video Manager

2. **Upload Fallback Image:**
   - Find a category (e.g., "Startseite")
   - Click "Fallback-Bild" button
   - Select an image (JPEG/PNG/WebP, < 10 MB)
   - Wait for upload to complete

3. **Verify UI Updates:**
   - Check "Fallback-Bild:" shows filename
   - Check "● Nicht gespeicherte Änderungen" appears
   - Click "Speichern"
   - Verify success alert

4. **Refresh Page:**
   - Reload Video Manager
   - Verify fallback image persists
   - Check image filename displays correctly

### 4. Test Browser Console

**Open DevTools Console (F12) and check for:**

```javascript
// Upload started
[VideoManager] Uploading fallback image for category: home

// Upload complete
[VideoManager] Fallback image uploaded successfully: images/home-fallback.jpg

// Save started
[VideoManager] Saving video mapping: {
  category: "home",
  videoPath: "unchanged",
  fallbackImage: "images/home-fallback.jpg"
}

// Save complete
[VideoManager] Successfully saved video mapping to server: home
```

### 5. Verify Database

```sql
SELECT category_id, video_path, fallback_image, updated_at
FROM video_mappings
WHERE category_id = 'home';
```

**Expected:**
```
category_id | video_path        | fallback_image              | updated_at
home        | videos/home.mp4   | images/home-fallback.jpg    | 2025-10-09 12:30:00
```

## 🖼️ Creating Fallback Images

### Quick Method (Extract from Video):
```bash
# Extract frame at 2 seconds
ffmpeg -i videos/home.mp4 -ss 00:00:02 -vframes 1 home-fallback.jpg

# Optimize for web (resize to 1920x1080, quality 80%)
ffmpeg -i home-fallback.jpg -vf scale=1920:1080 -q:v 80 home-fallback-optimized.jpg

# Convert to WebP (better compression)
cwebp -q 80 home-fallback-optimized.jpg -o home-fallback.webp
```

### Image Specs:
- **Resolution**: 1920x1080 (Full HD) or 1280x720 (HD)
- **Format**: WebP (best) or JPEG
- **File Size**: 50-200 KB target
- **Quality**: 70-80%

### Online Tools:
- **Squoosh.app**: Compress and convert images
- **TinyPNG.com**: Optimize JPEG/PNG
- **CloudConvert.com**: Format conversion

## 📊 Test Cases

### Test Case 1: Upload Valid Image
- **Input**: JPEG, 150 KB, 1920x1080
- **Expected**: Upload success, preview shows, can save
- **Verify**: Database updated, image accessible

### Test Case 2: Upload Too Large
- **Input**: JPEG, 12 MB
- **Expected**: Error alert "Bild zu groß (max 10 MB)"
- **Verify**: Upload rejected, no changes saved

### Test Case 3: Invalid Format
- **Input**: PDF file
- **Expected**: Error alert "Ungültiges Bildformat"
- **Verify**: Upload rejected, no changes saved

### Test Case 4: Save Without Upload
- **Input**: Click save with no changes
- **Expected**: Nothing happens (no error, no save)
- **Verify**: No API calls, state unchanged

### Test Case 5: Discard Changes
- **Input**: Upload image, then click "Verwerfen"
- **Expected**: Pending image cleared, UI resets
- **Verify**: Fallback image shows previous value

### Test Case 6: Multiple Categories
- **Input**: Upload images for 3 different categories
- **Expected**: Each saves independently
- **Verify**: All 3 categories have correct fallback images

## 🚀 Integration with VideoBackground

### Next Step: Update VideoBackground Component

The VideoBackground component will need to be updated to display fallback images:

```typescript
// Example implementation
<VideoContainer>
  {/* Fallback Image Layer (z-index: 1) */}
  {fallbackImage && (
    <FallbackImage
      src={fallbackImage}
      style={{ opacity: videoLoaded ? 0 : 1 }}
    />
  )}

  {/* Video Layer (z-index: 2) */}
  <Video
    src={videoSource}
    onLoadedData={() => setVideoLoaded(true)}
    style={{ opacity: videoLoaded ? 1 : 0 }}
  />
</VideoContainer>
```

### Test Slow Connection:
1. Open DevTools (F12)
2. Network tab → Throttling → Slow 3G
3. Navigate to category with fallback image
4. **Expected**: Image appears instantly, video fades in when ready

## 📝 Known Limitations

### Current Status:
- ✅ Upload works
- ✅ Save works
- ✅ Database persists
- ⏳ VideoBackground integration pending

### Future Improvements:
- [ ] Image preview before upload
- [ ] Drag & drop upload
- [ ] Bulk upload for all categories
- [ ] Auto-generate fallback from video
- [ ] Image cropping tool

## 🐛 Troubleshooting

### Problem: Upload fails silently
**Check:**
- Browser console for errors
- Network tab for failed requests
- PHP error logs on server
- File permissions on upload directory

### Problem: Fallback image not shown after save
**Check:**
- Database value: `SELECT fallback_image FROM video_mappings WHERE category_id = 'home'`
- Image file exists on server
- Correct path format (relative from web root)

### Problem: "Bild-Upload noch nicht abgeschlossen"
**Reason:** Trying to save while upload is in progress
**Solution:** Wait for upload to complete (blob: URL should change to server path)

### Problem: Image too large error
**Solution:** Use image optimization tool (Squoosh, TinyPNG)
**Target**: < 500 KB for fallback images

## ✅ Success Criteria

**Feature is working when:**
1. ✅ Can upload fallback image for any category
2. ✅ Image saves to database
3. ✅ Refresh shows saved image
4. ✅ Multiple categories can have different fallback images
5. ✅ Validation prevents invalid files
6. ✅ Console shows no errors

**Integration is complete when:**
1. ⏳ VideoBackground component displays fallback
2. ⏳ Smooth fade transition from image to video
3. ⏳ Fallback shows on slow connections
4. ⏳ Fallback shows when video fails to load

---

**Status:** ✅ READY FOR TESTING
**Next Step:** Upload fallback images via Video Manager
**Documentation:** Complete
**Deployment:** Ready
