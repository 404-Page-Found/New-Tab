// js/utils.js - Common utility functions

// URL Validation Utility
// Returns an object with status, url, message, and originalInput
function validateUrl(input) {
  const originalInput = input.trim();
  
  if (!originalInput) {
    return {
      status: 'undetectable',
      url: null,
      message: 'Please enter a URL or search query',
      originalInput: input
    };
  }

  // Check if it looks like it could be a URL (contains dots or looks like an IP)
  const hasDot = originalInput.includes('.');
  const isIP = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?$/.test(originalInput);
  const isLocalhost = /^localhost(:\d+)?$/.test(originalInput.toLowerCase());
  const hasProtocol = /^https?:\/\//i.test(originalInput);
  
  // Detect if it looks like a URL at all
  const looksLikeUrl = hasDot || isIP || isLocalhost || hasProtocol;
  
  if (!looksLikeUrl) {
    // Doesn't look like a URL - treat as search query
    return {
      status: 'undetectable',
      url: null,
      message: 'This URL appears to be invalid. Press Enter to Create',
      originalInput: originalInput
    };
  }

  // Try to parse as URL with https:// prefix if no protocol
  let urlToParse = originalInput;
  if (!hasProtocol) {
    urlToParse = 'https://' + originalInput;
  }

  try {
    const url = new URL(urlToParse);
    
    // Validate hostname
    const hostname = url.hostname;
    
    // Check for empty hostname
    if (!hostname) {
      return {
        status: 'malformed',
        url: null,
        message: 'Invalid URL: missing hostname',
        originalInput: originalInput
      };
    }

    // Validate hostname characters
    const validHostnameChars = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    if (!validHostnameChars.test(hostname) && !isIP && !isLocalhost) {
      return {
        status: 'malformed',
        url: null,
        message: 'Invalid URL: hostname contains invalid characters',
        originalInput: originalInput
      };
    }

    // Check for valid TLD (minimum 2 characters for common TLDs)
    const hostnameParts = hostname.split('.');
    if (hostnameParts.length > 1) {
      const tld = hostnameParts[hostnameParts.length - 1];
      if (tld.length < 2) {
        return {
          status: 'malformed',
          url: null,
          message: 'Invalid URL: top-level domain too short',
          originalInput: originalInput
        };
      }
    } else if (!isIP && !isLocalhost) {
      // Single-part hostname (no dot) - could be valid for localhost or single-word domains
      // but if it has a port or path, it might be malformed
      if (url.port || url.pathname.length > 1) {
        return {
          status: 'malformed',
          url: null,
          message: 'Invalid URL: incomplete domain name',
          originalInput: originalInput
        };
      }
    }

    // Validate IP addresses
    if (isIP) {
      const ipParts = hostname.split(':');
      const ip = ipParts[0].split('.');
      for (const part of ip) {
        const num = parseInt(part, 10);
        if (num > 255) {
          return {
            status: 'malformed',
            url: null,
            message: 'Invalid URL: IP address out of range',
            originalInput: originalInput
          };
        }
      }
    }

    // URL is valid!
    return {
      status: 'valid',
      url: url,
      message: 'Valid URL',
      originalInput: originalInput
    };

  } catch (e) {
    // URL parsing failed - this is a malformed URL
    return {
      status: 'malformed',
      url: null,
      message: 'Malformed URL: ' + (e.message || 'could not parse'),
      originalInput: originalInput
    };
  }
}

// Check if input is a valid URL (simple boolean version)
function isValidUrl(string) {
  const result = validateUrl(string);
  return result.status === 'valid';
}

// Check if input looks like a URL but is malformed
function isMalformedUrl(string) {
  const result = validateUrl(string);
  return result.status === 'malformed';
}

// Check if input doesn't look like a URL at all
function isSearchQuery(string) {
  const result = validateUrl(string);
  return result.status === 'undetectable';
}

// Get the normalized URL (with protocol)
function normalizeUrl(input) {
  const result = validateUrl(input);
  if (result.status === 'valid' && result.url) {
    return result.url.href;
  }
  return null;
}

// Icon caching utilities
const iconCache = {
  // Fetch an icon and convert to data URL
  async fetchIconAsDataUrl(iconUrl) {
    if (!iconUrl || typeof iconUrl !== 'string' || (!iconUrl.startsWith('http') && !iconUrl.startsWith('data:'))) {
      return null;
    }
    try {
      const response = await fetch(iconUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Failed to fetch icon:', iconUrl, error);
      return null;
    }
  },

  // Save icon to localStorage cache
  saveIconToCache(iconUrl, dataUrl) {
    if (!dataUrl) return false;
    try {
      const cacheKey = `iconCache_${btoa(encodeURIComponent(iconUrl))}`;
      const cacheEntry = {
        url: iconUrl,
        dataUrl: dataUrl,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, cannot cache icon');
      } else {
        console.warn('Failed to cache icon:', error);
      }
      return false;
    }
  },

  // Load icon from cache
  loadIconFromCache(iconUrl) {
    try {
      const cacheKey = `iconCache_${btoa(encodeURIComponent(iconUrl))}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const entry = JSON.parse(cached);
      // Check if cache is stale (older than 7 days)
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - entry.timestamp > oneWeek) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      return entry.dataUrl;
    } catch (error) {
      console.warn('Failed to load cached icon:', error);
      return null;
    }
  },

  // Get icon URL with caching
  async getIconWithCache(iconUrl) {
    // Check cache first
    const cached = this.loadIconFromCache(iconUrl);
    if (cached) return cached;

    // Fetch and cache
    const dataUrl = await this.fetchIconAsDataUrl(iconUrl);
    if (dataUrl) {
      this.saveIconToCache(iconUrl, dataUrl);
    }
    return dataUrl || iconUrl; // Return original URL if caching fails
  },

  // Check if we're offline
  isOffline() {
    return !navigator.onLine;
  },

  // Get icon URL with offline support
  async getIconUrl(iconUrl) {
    // If offline, try cache
    if (this.isOffline()) {
      const cached = this.loadIconFromCache(iconUrl);
      return cached || iconUrl; // Return cached or original
    }

    // Online: use cache with network fallback
    return this.getIconWithCache(iconUrl);
  },

  // Cache icons for existing apps
  async cacheExistingAppIcons() {
    try {
      const apps = AppGridState.getCustomApps();
      const promises = apps.map(async (app) => {
        if (app.icon && !app.cachedIcon) {
          try {
            const cachedIcon = await this.getIconWithCache(app.icon);
            if (cachedIcon && cachedIcon !== app.icon) {
              app.cachedIcon = cachedIcon;
            }
          } catch (error) {
            console.warn(`Failed to cache icon for ${app.name}:`, error);
          }
        }
        return app;
      });

      const updatedApps = await Promise.all(promises);
      AppGridState.saveCustomApps(updatedApps);
      return updatedApps;
    } catch (error) {
      console.warn('Failed to cache existing app icons:', error);
      return [];
    }
  }
};

// Page Visibility Manager - handles background tab optimizations
const visibilityManager = {
  isVisible: !document.hidden,
  callbacks: [],

  init() {
    document.addEventListener('visibilitychange', () => {
      const wasVisible = this.isVisible;
      this.isVisible = !document.hidden;
      if (wasVisible !== this.isVisible) {
        this.callbacks.forEach(cb => cb(this.isVisible));
      }
    });
  },

  onChange(callback) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  },

  whenVisible(callback) {
    if (this.isVisible) callback();
    else {
      const unsubscribe = this.onChange((visible) => {
        if (visible) {
          callback();
          unsubscribe();
        }
      });
    }
  }
};

// Visibility-aware interval manager
class VisibilityInterval {
  constructor(callback, interval, runImmediately = false) {
    this.callback = callback;
    this.interval = interval;
    this.intervalId = null;
    this.isRunning = false;

    if (runImmediately) callback();

    this.start();

    // Subscribe to visibility changes
    this.unsubscribe = visibilityManager.onChange((visible) => {
      if (visible) {
        this.start();
        // Sync immediately when becoming visible
        callback();
      } else {
        this.stop();
      }
    });
  }

  start() {
    if (this.isRunning || !visibilityManager.isVisible) return;
    this.isRunning = true;
    this.intervalId = setInterval(this.callback, this.interval);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.unsubscribe) this.unsubscribe();
  }
}

// Initialize visibility manager
visibilityManager.init();

// Make utilities available globally
window.visibilityManager = visibilityManager;
window.VisibilityInterval = VisibilityInterval;
window.validateUrl = validateUrl;
window.isValidUrl = isValidUrl;
window.isMalformedUrl = isMalformedUrl;
window.isSearchQuery = isSearchQuery;
window.normalizeUrl = normalizeUrl;
window.iconCache = iconCache;
