// js/version.js - Centralized version management

// Current application version
// Update this single constant when releasing new versions
const CURRENT_VERSION = '0.3.9';

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CURRENT_VERSION };
}

// Also expose to window for global access
window.CURRENT_VERSION = CURRENT_VERSION;

// Update version display in HTML when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const versionDisplay = document.getElementById('version-display');
  if (versionDisplay) {
    versionDisplay.textContent = CURRENT_VERSION;
  }
});
