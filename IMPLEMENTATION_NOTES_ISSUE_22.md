# Issue #22: More Background Images from Pexels - Solution

## Summary

This implementation provides a complete, automated workflow for adding background images from Pexels.com to the New Tab extension. Contributors can now easily download, process, and integrate new backgrounds with just a few commands.

## What Was Added

### 1. **Tools Created** (`background/tools/`)

#### `fetch_pexels_images.js`
- Fetches images from Pexels API
- Supports customizable search queries
- Downloads full-resolution images
- Collects photographer credits
- Respects API rate limiting

#### `generate_backgrounds_map.js`
- Automatically scans the background folder
- Generates entries for `backgrounds.js`
- Converts filenames to readable titles
- Maintains consistent naming format (e.g., "Pexels_nature_landscape_12345" → "Nature Landscape (Pexels)")

#### `PEXELS_GUIDE.md`
- Comprehensive guide for adding Pexels images
- Step-by-step instructions
- Customization options
- Troubleshooting guide
- Legal/attribution information

#### `README.md` (tools directory)
- Quick start guide
- Command reference
- Directory structure
- Simple three-step process

### 2. **Configuration Files Added**

#### `package.json` (root)
- npm scripts for easy command execution:
  - `npm run fetch-pexels` - Download images
  - `npm run generate-thumbs` - Create thumbnails
  - `npm run generate-map` - Update backgrounds.js
  - `npm run update-backgrounds` - All three steps combined
- Dependencies: `sharp`, `node-fetch`
- Works with Node.js 16+

### 3. **Documentation Updated**

#### `README.md` (root - Updated)
- Added "Contributing Background Images" section
- Links to detailed Pexels guide
- Shows quick start command
- Explains what's needed (Node.js, API key)

## How It Works

### For Contributors

**Minimal effort (one-liner):**
```bash
npm install sharp node-fetch
PEXELS_API_KEY='your_key' npm run update-backgrounds
```

**Manual steps (if preferred):**
1. Download images: `PEXELS_API_KEY='key' npm run fetch-pexels`
2. Create thumbnails: `npm run generate-thumbs`
3. Update config: `npm run generate-map`

### Workflow Architecture

```
User runs npm command
         ↓
fetch_pexels_images.js: Downloads from Pexels API
         ↓
thumbs_generation.js: Creates 128x128 thumbnails
         ↓
generate_backgrounds_map.js: Updates backgrounds.js
         ↓
backgrounds.js: Updated with new entries
         ↓
New-Tab.html: Displays new backgrounds
```

## Key Features

✅ **Fully Automated** - Download, process, and configure all with one command  
✅ **High Quality** - Uses original resolution images from Pexels  
✅ **Customizable** - Easy to modify search terms and settings  
✅ **Attribution** - Automatically collects photographer credits  
✅ **Safe** - API keys handled via environment variables  
✅ **Well Documented** - Comprehensive guides for all skill levels  
✅ **Existing System Compatible** - Works with current thumbnail generation  
✅ **Extensible** - Easy to add more image sources in the future  

## File Structure

```
/
├── README.md (updated with Pexels section)
├── package.json (new - with npm scripts)
├── backgrounds.js (auto-updated by generate_backgrounds_map.js)
└── background/
    ├── tools/
    │   ├── fetch_pexels_images.js (new)
    │   ├── generate_backgrounds_map.js (new)
    │   ├── thumbs_generation.js (existing)
    │   ├── PEXELS_GUIDE.md (new)
    │   └── README.md (new)
    ├── thumbs/ (auto-generated thumbnails)
    └── [image files]
```

## Usage Examples

### Add 10 nature images
```bash
cd /workspaces/New-Tab
npm install sharp node-fetch
PEXELS_API_KEY='YOUR_API_KEY' npm run update-backgrounds
```

### Customize searches
Edit `background/tools/fetch_pexels_images.js`:
```javascript
const SEARCH_QUERIES = [
  'sunset beach',
  'mountain peak',
  'forest waterfall',
  // ... customize as needed
];
```

### Only update from existing images
```bash
npm run generate-thumbs
npm run generate-map
```

## Requirements for Users/Contributors

- **Node.js**: 16.0.0 or higher
- **npm**: Bundled with Node.js
- **Pexels API Key**: Free key from https://www.pexels.com/api/
- **Dependencies**: 
  - `sharp` - Image processing (installed via npm)
  - `node-fetch` - HTTP requests (if Node.js < 18)

## Testing Checklist

- [ ] Install dependencies: `npm install sharp node-fetch`
- [ ] Get Pexels API key from https://www.pexels.com/api/
- [ ] Run `PEXELS_API_KEY='key' npm run update-backgrounds`
- [ ] Verify images downloaded to `background/` folder
- [ ] Verify thumbnails created in `background/thumbs/` folder
- [ ] Verify `backgrounds.js` updated with new entries
- [ ] Open `New-Tab.html` in browser
- [ ] Check gear icon → backgrounds to see new images
- [ ] Click each new background to verify it loads
- [ ] Check browser console for any errors

## Integration Notes

### With CI/CD (GitHub Actions)
Can be automated in workflows by storing `PEXELS_API_KEY` as a secret.

### Backwards Compatibility
- Existing backgrounds remain unchanged
- Existing `backgrounds.js` format is preserved
- No breaking changes to the extension

### Image Optimization
- Original images stored in `background/`
- Thumbnails compressed to 128x128 @ 72% quality
- JPEG format used for compatibility

## Future Enhancements

Possible improvements for future iterations:
- Support for more image sources (Unsplash, Pixabay, etc.)
- Web UI for downloading images
- Automated daily updates via GitHub Actions
- Image caching/versioning system
- Community contributions of pre-curated image sets

## Related Files

- Main project README: [README.md](README.md)
- Image tools guide: [background/tools/PEXELS_GUIDE.md](background/tools/PEXELS_GUIDE.md)
- Tools README: [background/tools/README.md](background/tools/README.md)
- Pexels API: https://www.pexels.com/api/

---

**Issue**: More background images from pexels.com (#22)  
**Resolution**: Complete automated workflow for adding Pexels images  
**Status**: Ready for contributions
