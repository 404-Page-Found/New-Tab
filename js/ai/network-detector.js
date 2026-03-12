// js/ai/network-detector.js - Network availability detection module
// Detects online/offline status and checks API health

const NetworkDetector = (function() {
  // Configuration
  const CONFIG = {
    apiCheckTimeout: 5000, // 5 second timeout for API health check
    apiEndpoint: 'https://new-tab-openrouter-proxy.lucas20220605.workers.dev',
    checkInterval: 30000, // Check API health every 30 seconds when active
    retryAfterFailure: 10000 // Wait 10 seconds before retry after failure
  };

  // State
  let isOnline = navigator.onLine;
  let apiAvailable = null; // null = unknown, true = available, false = unavailable
  let lastApiCheck = 0;
  let checkIntervalId = null;
  let listeners = [];

  /**
   * Initialize network detection
   */
  function init() {
    // Set initial state
    isOnline = navigator.onLine;
    
    // Listen for browser online/offline events
    window.addEventListener('online', () => handleOnlineStatusChange(true));
    window.addEventListener('offline', () => handleOnlineStatusChange(false));
    
    // Check API availability immediately
    checkApiHealth();
    
    // Start periodic health checks
    startPeriodicCheck();
  }

  /**
   * Handle browser online/offline status change
   * @param {boolean} online - Whether browser is online
   */
  function handleOnlineStatusChange(online) {
    isOnline = online;
    notifyListeners();
    
    if (online) {
      // Re-check API when browser comes online
      checkApiHealth();
    } else {
      // Mark API as unavailable when browser goes offline
      apiAvailable = false;
      notifyListeners();
    }
  }

  /**
   * Check if the API endpoint is available
   * @returns {Promise<boolean>} True if API is reachable
   */
  async function checkApiHealth() {
    // Don't check too frequently
    const now = Date.now();
    if (now - lastApiCheck < CONFIG.retryAfterFailure && apiAvailable !== null) {
      return apiAvailable;
    }
    
    lastApiCheck = now;
    
    try {
      // Use a simple fetch to check if the endpoint is reachable
      // We use a very short timeout to fail fast
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.apiCheckTimeout);
      
      // Try a simple request to the API
      // We use HEAD request to minimize data transfer
      const response = await fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Any response (even error) means the endpoint is reachable
      apiAvailable = true;
    } catch (error) {
      // Network error, timeout, or CORS issue means API is unavailable
      apiAvailable = false;
      console.warn('API health check failed:', error.message);
    }
    
    notifyListeners();
    return apiAvailable;
  }

  /**
   * Start periodic API health checks
   */
  function startPeriodicCheck() {
    if (checkIntervalId) {
      clearInterval(checkIntervalId);
    }
    
    checkIntervalId = setInterval(() => {
      if (isOnline) {
        checkApiHealth();
      }
    }, CONFIG.checkInterval);
  }

  /**
   * Stop periodic health checks
   */
  function stopPeriodicCheck() {
    if (checkIntervalId) {
      clearInterval(checkIntervalId);
      checkIntervalId = null;
    }
  }

  /**
   * Notify all listeners of status change
   */
  function notifyListeners() {
    const status = getStatus();
    listeners.forEach(callback => {
      try {
        callback(status);
      } catch (e) {
        console.error('Error in network status listener:', e);
      }
    });
  }

  /**
   * Add a listener for network status changes
   * @param {Function} callback - Called with status object when changes occur
   */
  function addListener(callback) {
    if (typeof callback === 'function') {
      listeners.push(callback);
    }
  }

  /**
   * Remove a listener
   * @param {Function} callback - The callback to remove
   */
  function removeListener(callback) {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Get current network status
   * @returns {Object} Status object with isOnline and apiAvailable
   */
  function getStatus() {
    return {
      isOnline: isOnline,
      apiAvailable: apiAvailable,
      isOffline: !isOnline || apiAvailable === false
    };
  }

  /**
   * Force a manual API check
   * @returns {Promise<boolean>} Current API availability
   */
  async function forceCheck() {
    return checkApiHealth();
  }

  // Initialize immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  return {
    init,
    addListener,
    removeListener,
    getStatus,
    forceCheck,
    checkApiHealth
  };

})();

// Export to global scope
window.NetworkDetector = NetworkDetector;
