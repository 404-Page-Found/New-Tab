# Adding Background Images from Pexels

This guide explains how to add more background images from [Pexels.com](https://www.pexels.com) to the New Tab project.

## Prerequisites

- Node.js 18+ (or Node.js 16+ with `node-fetch` package installed)
- A free Pexels API key (from https://www.pexels.com/api/)
- Internet connection

## Step-by-Step Guide

### 1. Get a Pexels API Key

1. Visit https://www.pexels.com/api/
2. Click "Request API Key"
3. Fill in your email address and description
4. You'll receive an API key via email
5. Keep this key safe (don't commit it to the repository)

### 2. Download Images from Pexels

Navigate to the background/tools directory and run the downloader:

```bash
cd background/tools
PEXELS_API_KEY='your_api_key_here' node fetch_pexels_images.js
```

Or set it as an environment variable:

```bash
export PEXELS_API_KEY='your_api_key_here'
node fetch_pexels_images.js
```

**What this does:**
- Searches Pexels for various nature, landscape, and scenic images
- Downloads images in high quality (original resolution)
- Saves them to the `background/` directory with descriptive names
- Displays photographer credits

### 3. Generate Thumbnails

Once images are downloaded, generate thumbnail previews:

```bash
node thumbs_generation.js
```

**Requirements:**
- Install sharp: `npm install sharp`
- This creates 128x128 thumbnails in `background/thumbs/`

### 4. Update backgrounds.js

Automatically generate the backgrounds map:

```bash
node generate_backgrounds_map.js
```

This script will:
- Scan all images in the background folder
- Create entries in `backgrounds.js`
- Convert filenames to readable titles
- Update the `backgroundsMap` object

### 5. Verify Changes

1. Open `New-Tab.html` in your browser
2. Check the "Backgrounds" section (gear icon)
3. New backgrounds should appear in the thumbnail grid
4. Click them to verify they load correctly

## Customizing the Search

To change what images are downloaded, edit `fetch_pexels_images.js`:

```javascript
const SEARCH_QUERIES = [
  'nature landscape',      // Modify these searches
  'mountains sunset',
  'ocean beach',
  // ... add more as needed
];
```

Common search terms:
- `nature landscape`
- `mountains`
- `ocean beach`
- `forest`
- `night sky`
- `sunset`
- `stars`
- `city`
- `aurora`
- `waterfall`

## Batch Processing Example

Add 20 random nature images:

```bash
# Download multiple searches
PEXELS_API_KEY='your_api_key' node fetch_pexels_images.js

# Generate thumbnails
node thumbs_generation.js

# Update backgrounds map
node generate_backgrounds_map.js
```

## Crediting Photographers

The script automatically collects photographer information. Include credits in:
- README.md
- Or a dedicated CREDITS.md file

Example:
```
Background Images from Pexels:
- [Photographer Name](photographer_url) - Image title
```

## Troubleshooting

### "PEXELS_API_KEY not set"
- Set your API key before running: `export PEXELS_API_KEY='your_key'`
- Or edit the script to hardcode it (not recommended for version control)

### "Failed to download"
- Check internet connection
- Verify your Pexels API key is valid
- Check available download quota on Pexels

### "Cannot find module 'sharp'"
```bash
npm install sharp
```

### Images not appearing
- Run `node thumbs_generation.js` to create thumbnails
- Run `node generate_backgrounds_map.js` to update backgrounds.js
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Refresh the New Tab page

## Best Practices

1. **Optimize**: Images are auto-compressed to thumbnails, but consider resizing large originals
2. **Variety**: Use diverse search terms to get variety
3. **Quality**: Pexels images are high quality and free to use
4. **Attribution**: Credit photographers as per Pexels license
5. **Testing**: Always verify new backgrounds in the UI before committing

## File Structure

```
background/
├── tools/
│   ├── fetch_pexels_images.js    # Download from Pexels
│   ├── thumbs_generation.js       # Create thumbnails
│   ├── generate_backgrounds_map.js # Update backgrounds.js
│   └── PEXELS_GUIDE.md           # This file
├── thumbs/                        # Thumbnail images (auto-generated)
├── Beach_-_Australia.jpeg
├── City_-_Shanghai.jpeg
└── ... (more background images)

backgrounds.js                      # Main backgrounds config
```

## Integration with CI/CD

For automated image updates in CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Update backgrounds from Pexels
  env:
    PEXELS_API_KEY: ${{ secrets.PEXELS_API_KEY }}
  run: |
    cd background/tools
    npm install sharp
    node fetch_pexels_images.js
    node thumbs_generation.js
    node generate_backgrounds_map.js
```

## Legal Notes

- Pexels images are released under the Pexels License (free for commercial and non-commercial use)
- Attribution to photographers is appreciated but not required
- Review the full license: https://www.pexels.com/license/

---

Need help? See the main [README.md](../../README.md) or create an issue on GitHub.
