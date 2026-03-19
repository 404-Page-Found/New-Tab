/**
 * fetch_pexels_images.js
 * Helper script to download background images from Pexels API
 * 
 * Usage:
 * 1. Get a Pexels API key from https://www.pexels.com/api/
 * 2. Set the API key in the PEXELS_API_KEY variable below or via environment variable
 * 3. Run: node fetch_pexels_images.js
 * 
 * Requirements:
 * - Node.js with fetch API (v18.0+) or install: npm install node-fetch
 * - Internet connection
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY_HERE';
const BG_DIR = path.join(__dirname, '..');
const SEARCH_QUERIES = [
  'nature landscape',
  'mountains sunset',
  'ocean beach',
  'forest trees',
  'starry night sky',
  'city skyline',
  'desert sand',
  'northern lights',
  'waterfall',
  'autumn leaves'
];

// Number of images per query
const IMAGES_PER_QUERY = 1;

/**
 * Download an image from URL and save it locally
 */
async function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(BG_DIR, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve(filepath);
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete on error
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Search Pexels API and download images
 */
async function searchAndDownloadFromPexels(query) {
  if (!PEXELS_API_KEY || PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
    console.error('Error: PEXELS_API_KEY not set. Please get one from https://www.pexels.com/api/');
    process.exit(1);
  }

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${IMAGES_PER_QUERY}`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': PEXELS_API_KEY }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.photos || data.photos.length === 0) {
      console.log(`No results for: ${query}`);
      return [];
    }

    const downloadedImages = [];
    
    for (const photo of data.photos) {
      // Create a safe filename from the query and photo ID
      const safeQuery = query.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
      const filename = `Pexels_${safeQuery}_${photo.id}.jpeg`;
      
      try {
        // Use the original large image
        const imageUrl = photo.src.original;
        await downloadImage(imageUrl, filename);
        downloadedImages.push({
          filename,
          url: imageUrl,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url
        });
      } catch (err) {
        console.error(`Failed to download ${filename}:`, err.message);
      }
    }

    return downloadedImages;
  } catch (err) {
    console.error(`Error searching for "${query}":`, err.message);
    return [];
  }
}

/**
 * Fetch using built-in fetch (Node 18+) or fallback
 */
async function fetch(url, options) {
  if (typeof global.fetch === 'function') {
    return global.fetch(url, options);
  }

  // Fallback to node-fetch
  try {
    const nodeFetch = require('node-fetch');
    return nodeFetch(url, options);
  } catch {
    console.error('Error: Please install node-fetch: npm install node-fetch');
    console.error('Or upgrade to Node.js 18+ for built-in fetch support');
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('Fetching background images from Pexels...\n');

  const allDownloaded = [];

  for (const query of SEARCH_QUERIES) {
    console.log(`Searching: "${query}"`);
    const downloaded = await searchAndDownloadFromPexels(query);
    allDownloaded.push(...downloaded);
    
    // Be respectful with API rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✓ Downloaded ${allDownloaded.length} images`);
  
  if (allDownloaded.length > 0) {
    console.log('\nNext steps:');
    console.log('1. Run: node thumbs_generation.js (to generate thumbnails)');
    console.log('2. Update backgrounds.js with new entries');
    console.log('\nPhotographer credits:');
    allDownloaded.forEach(img => {
      console.log(`  - ${img.photographer}: ${img.photographerUrl}`);
    });
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
