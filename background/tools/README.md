# Background Tools

Easy workflow to add more background images from Pexels to the New Tab extension.

## Quick Start (3 steps)

### 1. Install Dependencies
```bash
npm install sharp node-fetch
```

### 2. Download Images from Pexels
```bash
PEXELS_API_KEY='your_api_key_here' npm run fetch-pexels
```

Get a free API key: https://www.pexels.com/api/

### 3. Complete the Setup
```bash
npm run generate-thumbs
npm run generate-map
```

**Done!** New backgrounds are now available in the extension.

## What Each Tool Does

| Script | Purpose | Command |
|--------|---------|---------|
| `fetch_pexels_images.js` | Download high-quality images from Pexels | `PEXELS_API_KEY='key' npm run fetch-pexels` |
| `thumbs_generation.js` | Create 128x128 thumbnail previews | `npm run generate-thumbs` |
| `generate_backgrounds_map.js` | Auto-generate `backgrounds.js` entries | `npm run generate-map` |

## One-Command Setup

```bash
# Prerequisites: Node.js 16+, npm
npm install sharp node-fetch
PEXELS_API_KEY='your_key' npm run update-backgrounds
```

## Detailed Guide

For comprehensive instructions, see [PEXELS_GUIDE.md](./PEXELS_GUIDE.md)

## Features

✅ **Automated**: One command downloads, generates thumbnails, and updates config  
✅ **High Quality**: Downloads original resolution images from Pexels  
✅ **Customizable**: Edit search queries in `fetch_pexels_images.js`  
✅ **Attribution**: Automatically collects photographer information  
✅ **Safe**: No API keys stored in git (use environment variables)  

## Troubleshooting

- **Cannot install sharp?** Try: `npm install --build-from-source sharp` or use Node 18+
- **API errors?** Verify your Pexels API key: https://www.pexels.com/api/
- **Missing images?** Check browser cache or rebuild thumbnails

## Directory Structure

```
.
├── fetch_pexels_images.js      # Download images
├── thumbs_generation.js         # Create thumbnails  
├── generate_backgrounds_map.js  # Update config
├── PEXELS_GUIDE.md             # Full documentation
└── README.md                    # This file
```

## Files Modified/Created

- `backgrounds.js` - Auto-updated with new image entries
- `background/` - Where downloaded images are stored
- `background/thumbs/` - Auto-generated thumbnails

---

**Questions?** See [PEXELS_GUIDE.md](./PEXELS_GUIDE.md) or the main [README.md](../../README.md)
