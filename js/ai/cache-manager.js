// js/ai/cache-manager.js - Response caching module
// Caches API responses in localStorage for offline access and repeated queries

const CacheManager = (function() {
  // Configuration
  const CONFIG = {
    cacheKey: 'ai_response_cache',
    maxCacheSize: 100, // Maximum number of cached responses
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    hashLength: 8 // Length of query hash for display
  };

  // In-memory cache for faster access
  let memoryCache = null;

  /**
   * Initialize the cache manager
   */
  function init() {
    loadFromStorage();
  }

  /**
   * Generate a hash for a query string
   * @param {string} query - The query string
   * @returns {string} A hash string
   */
  function hashQuery(query) {
    if (!query) return '';
    
    // Simple hash function for query
    let hash = 0;
    const str = query.toLowerCase().trim();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to positive hex string
    return Math.abs(hash).toString(36);
  }

  /**
   * Load cache from localStorage
   */
  function loadFromStorage() {
    try {
      const stored = localStorage.getItem(CONFIG.cacheKey);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Validate and filter out old entries
        const now = Date.now();
        const validEntries = {};
        
        for (const key in data) {
          const entry = data[key];
          if (entry.timestamp && (now - entry.timestamp) < CONFIG.maxAge) {
            validEntries[key] = entry;
          }
        }
        
        memoryCache = validEntries;
        
        // Clean up old entries in storage
        if (Object.keys(validEntries).length !== Object.keys(data).length) {
          saveToStorage();
        }
      } else {
        memoryCache = {};
      }
    } catch (e) {
      console.warn('Failed to load cache from storage:', e);
      memoryCache = {};
    }
  }

  /**
   * Save cache to localStorage
   */
  function saveToStorage() {
    try {
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify(memoryCache));
    } catch (e) {
      console.warn('Failed to save cache to storage:', e);
      // If storage is full, try to clear old entries
      if (e.name === 'QuotaExceededError') {
        evictOldest(10);
        try {
          localStorage.setItem(CONFIG.cacheKey, JSON.stringify(memoryCache));
        } catch (e2) {
          console.error('Failed to save cache even after eviction:', e2);
        }
      }
    }
  }

  /**
   * Evict oldest entries from cache
   * @param {number} count - Number of entries to evict
   */
  function evictOldest(count) {
    if (!memoryCache || Object.keys(memoryCache).length === 0) return;
    
    // Sort by timestamp and remove oldest
    const entries = Object.entries(memoryCache)
      .sort((a, b) => (a[1].timestamp || 0) - (b[1].timestamp || 0));
    
    for (let i = 0; i < count && i < entries.length; i++) {
      delete memoryCache[entries[i][0]];
    }
  }

  /**
   * Ensure cache doesn't exceed max size
   */
  function enforceMaxSize() {
    const size = Object.keys(memoryCache || {}).length;
    if (size >= CONFIG.maxCacheSize) {
      evictOldest(size - CONFIG.maxSize + 1);
    }
  }

  /**
   * Get a cached response
   * @param {string} query - The query string
   * @returns {Object|null} Cached response or null
   */
  function get(query) {
    if (!query || !memoryCache) return null;
    
    const hash = hashQuery(query);
    const entry = memoryCache[hash];
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > CONFIG.maxAge) {
      delete memoryCache[hash];
      saveToStorage();
      return null;
    }
    
    return entry.response;
  }

  /**
   * Cache a response
   * @param {string} query - The query string
   * @param {Object} response - The response to cache
   */
  function set(query, response) {
    if (!query || !response || !memoryCache) return;
    
    const hash = hashQuery(query);
    
    memoryCache[hash] = {
      query: query.substring(0, 100), // Store truncated query for debugging
      response: response,
      timestamp: Date.now()
    };
    
    enforceMaxSize();
    saveToStorage();
  }

  /**
   * Get cached response or fetch from API
   * @param {string} query - The query string
   * @param {Function} fetchFn - Function to call if not cached
   * @returns {Promise<Object>} Response object
   */
  async function getOrFetch(query, fetchFn) {
    // Try cache first
    const cached = get(query);
    if (cached) {
      return {
        ...cached,
        fromCache: true
      };
    }
    
    // If no cache, call the fetch function
    if (typeof fetchFn === 'function') {
      const response = await fetchFn(query);
      
      // Cache successful responses
      if (response && response.success) {
        set(query, response);
      }
      
      return response;
    }
    
    return { success: false, error: 'No fetch function provided' };
  }

  /**
   * Clear all cached responses
   */
  function clear() {
    memoryCache = {};
    try {
      localStorage.removeItem(CONFIG.cacheKey);
    } catch (e) {
      console.warn('Failed to clear cache from storage:', e);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  function getStats() {
    const entries = Object.values(memoryCache || {});
    const now = Date.now();
    
    let validCount = 0;
    let oldest = null;
    let newest = null;
    
    for (const entry of entries) {
      if (entry.timestamp) {
        if (now - entry.timestamp < CONFIG.maxAge) {
          validCount++;
        }
        if (!oldest || entry.timestamp < oldest) {
          oldest = entry.timestamp;
        }
        if (!newest || entry.timestamp > newest) {
          newest = entry.timestamp;
        }
      }
    }
    
    return {
      totalEntries: entries.length,
      validEntries: validCount,
      oldestEntry: oldest,
      newestEntry: newest
    };
  }

  /**
   * Pre-populate cache with common queries (for offline mode)
   * @param {Array} queries - Array of {query, response} objects
   */
  function prePopulate(queries) {
    if (!Array.isArray(queries)) return;
    
    for (const item of queries) {
      if (item.query && item.response) {
        set(item.query, item.response);
      }
    }
  }

  // Initialize
  init();

  // Public API
  return {
    get,
    set,
    getOrFetch,
    clear,
    getStats,
    prePopulate,
    hashQuery
  };

})();

// Export to global scope
window.CacheManager = CacheManager;
