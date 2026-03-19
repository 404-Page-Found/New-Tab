/**
 * generate_backgrounds_map.js
 * Automatically generates backgrounds.js entries for images in the background folder
 * 
 * Usage:
 * node generate_backgrounds_map.js
 */

const fs = require('fs');
const path = require('path');

const BG_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(__dirname, '..', '..', 'backgrounds.js');

function isImage(file) {
  return /\.(jpe?g|png)$/i.test(file);
}

/**
 * Convert filename to a readable title
 * Examples:
 *   "Beach_-_Australia.jpeg" -> "Beach - Australia"
 *   "Pexels_nature_landscape_12345.jpeg" -> "Nature Landscape (Pexels)"
 */
function filenameToTitle(filename) {
  const baseName = filename.replace(/\.(jpe?g|png)$/i, '');
  
  // Handle Pexels format
  if (baseName.startsWith('Pexels_')) {
    const parts = baseName.replace('Pexels_', '').split('_');
    // Remove the ID at the end (assumed to be the last numeric part)
    if (/^\d+$/.test(parts[parts.length - 1])) {
      parts.pop();
    }
    const title = parts.join(' ');
    return title.charAt(0).toUpperCase() + title.slice(1) + ' (Pexels)';
  }
  
  // Handle standard format with underscores and dashes
  return baseName.replace(/_/g, ' ');
}

/**
 * Generate the backgrounds map
 */
function generateBackgroundsMap() {
  const files = fs.readdirSync(BG_DIR)
    .filter(isImage)
    .filter(f => f !== 'Thumbs.db') // Ignore system files
    .sort();

  if (files.length === 0) {
    console.log('No images found in /background');
    return null;
  }

  let mapCode = 'const backgroundsMap = {\n';

  files.forEach((file, index) => {
    const title = filenameToTitle(file);
    const base = file.replace(/\.(jpe?g|png)$/i, '');
    const thumb = `background/thumbs/${base}.jpeg`;
    const url = `background/${file}`;

    mapCode += `  '${title}': {\n`;
    mapCode += `    title: '${title}',\n`;
    mapCode += `    thumb: '${thumb}',\n`;
    mapCode += `    url: '${url}',\n`;
    mapCode += `  },\n`;
  });

  mapCode += '};\n';
  return { mapCode, count: files.length };
}

/**
 * Update backgrounds.js with new map
 */
function updateBackgroundsJS() {
  const result = generateBackgroundsMap();
  
  if (!result) {
    console.log('Aborted: No images found.');
    return false;
  }

  // Read existing file
  let content = fs.readFileSync(OUTPUT_FILE, 'utf-8');

  // Find and replace the backgroundsMap section
  const mapStart = content.indexOf('const backgroundsMap = {');
  const mapEnd = content.indexOf('};', mapStart) + 2;

  if (mapStart === -1) {
    console.error('Error: Could not find backgroundsMap in backgrounds.js');
    return false;
  }

  // Replace the old map with new one
  const newContent = content.substring(0, mapStart) + result.mapCode + content.substring(mapEnd);

  // Write back
  fs.writeFileSync(OUTPUT_FILE, newContent, 'utf-8');

  console.log(`✓ Updated backgrounds.js with ${result.count} background(s)`);
  console.log(`  Output: ${OUTPUT_FILE}`);
  
  return true;
}

// Main execution
try {
  updateBackgroundsJS();
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
