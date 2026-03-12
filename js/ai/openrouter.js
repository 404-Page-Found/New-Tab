// js/ai/openrouter.js - OpenRouter API Integration
// Integrates with openrouter/free model

const OpenRouterAPI = (function() {
  // Configuration
  const CONFIG = {
    baseURL: 'https://openrouter.ai/api/v1',
    model: 'openrouter/free',
    maxTokens: 1000,
    maxRetries: 2,
    retryDelay: 1000,
    rateLimit: {
      maxRequests: 5,
      windowMs: 60000 // 1 minute
    }
  };

  // Rate limiting state
  let requestTimestamps = [];

  // Security: Salt for API key encoding
  const SALT = 'n3w-t4b-41-2024';

  // Storage keys
  const STORAGE_KEYS = {
    apiKey: 'ai_api_key_secure',
    chatHistory: 'ai_chat_history',
    keyInitialized: 'ai_api_key_initialized'
  };

  // Default API key (set once on first load)
  const DEFAULT_API_KEY = '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';

  // Initialize API key on first use
  function initializeAPIKey() {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.keyInitialized);
    if (!isInitialized && DEFAULT_API_KEY) {
      setAPIKey(DEFAULT_API_KEY);
      localStorage.setItem(STORAGE_KEYS.keyInitialized, 'true');
    }
  }

  // Call initialization
  initializeAPIKey();

  // Storage Functions ============== Secure ==============

  /**
   * Encode string with salt (simple obfuscation)
   * @param {string} str - String to encode
   * @returns {string} Encoded string
   */
  function encodeWithSalt(str) {
    try {
      return btoa(str + SALT);
    } catch (e) {
      console.error('Failed to encode string');
      return '';
    }
  }

  /**
   * Decode string with salt
   * @param {string} encoded - Encoded string
   * @returns {string} Decoded string
   */
  function decodeWithSalt(encoded) {
    try {
      const decoded = atob(encoded);
      return decoded.replace(SALT, '');
    } catch (e) {
      console.error('Failed to decode string');
      return '';
    }
  }

  /**
   * Set API key securely
   * @param {string} apiKey - OpenRouter API key
   */
  function setAPIKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
      console.error('Invalid API key');
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.apiKey, encodeWithSalt(apiKey));
      return true;
    } catch (e) {
      console.error('Failed to store API key');
      return false;
    }
  }

  /**
   * Get API key (decoded)
   * @returns {string|null} API key or null
   */
  function getAPIKey() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.apiKey);
      return stored ? decodeWithSalt(stored) : null;
    } catch (e) {
      console.error('Failed to retrieve API key');
      return null;
    }
  }

  /**
   * Check if API key is configured
   * @returns {boolean}
   */
  function hasAPIKey() {
    return !!getAPIKey();
  }

  /**
   * Clear API key from storage
   */
  function clearAPIKey() {
    localStorage.removeItem(STORAGE_KEYS.apiKey);
  }

  // ============== Rate Limiting ==============

  /**
   * Check if rate limit is exceeded
   * @returns {boolean}
   */
  function isRateLimited() {
    const now = Date.now();
    // Remove old timestamps outside the window
    requestTimestamps = requestTimestamps.filter(
      ts => now - ts < CONFIG.rateLimit.windowMs
    );
    return requestTimestamps.length >= CONFIG.rateLimit.maxRequests;
  }

  /**
   * Record a request timestamp
   */
  function recordRequest() {
    requestTimestamps.push(Date.now());
  }

  /**
   * Get rate limit reset time
   * @returns {number} Milliseconds until reset
   */
  function getRateLimitResetTime() {
    if (requestTimestamps.length === 0) return 0;
    const oldestTimestamp = Math.min(...requestTimestamps);
    return Math.max(0, CONFIG.rateLimit.windowMs - (Date.now() - oldestTimestamp));
  }

  // ============== Chat History ==============

  /**
   * Save chat history
   * @param {Array} messages - Array of message objects
   */
  function saveChatHistory(messages) {
    try {
      // Limit history to last 50 messages
      const trimmed = messages.slice(-50);
      localStorage.setItem(STORAGE_KEYS.chatHistory, JSON.stringify(trimmed));
    } catch (e) {
      console.error('Failed to save chat history');
    }
  }

  /**
   * Load chat history
   * @returns {Array} Array of message objects
   */
  function loadChatHistory() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.chatHistory);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load chat history');
      return [];
    }
  }

  /**
   * Clear chat history
   */
  function clearChatHistory() {
    localStorage.removeItem(STORAGE_KEYS.chatHistory);
  }

  // ============== API Requests ==============

  /**
   * Build request headers
   * @returns {Object} Headers object
   */
  function buildHeaders() {
    const apiKey = getAPIKey();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.href,
      'X-Title': 'New Tab AI Assistant'
    };
  }

  /**
   * Validate user input
   * @param {string} message - User message
   * @returns {Object} Validation result
   */
  function validateInput(message) {
    if (!message || typeof message !== 'string') {
      return { valid: false, error: 'Message is required' };
    }
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }
    if (trimmed.length > 2000) {
      return { valid: false, error: 'Message too long (max 2000 characters)' };
    }
    return { valid: true, message: trimmed };
  }

  /**
   * Parse OpenRouter API response
   * @param {Object} data - Response data
   * @returns {Object} Parsed result
   */
  function parseResponse(data) {
    try {
      if (!data || !data.choices || !data.choices[0]) {
        return { success: false, error: 'Invalid response format' };
      }
      
      const choice = data.choices[0];
      if (!choice.message || !choice.message.content) {
        return { success: false, error: 'No content in response' };
      }

      return {
        success: true,
        content: choice.message.content,
        usage: data.usage || null,
        model: data.model || CONFIG.model
      };
    } catch (e) {
      return { success: false, error: 'Failed to parse response' };
    }
  }

  /**
   * Handle API errors
   * @param {Response} response - Fetch response
   * @returns {Object} Error information
   */
  async function handleError(response) {
    let errorMessage = 'An unknown error occurred';
    let errorCode = 'UNKNOWN';

    try {
      const errorData = await response.json();
      
      switch (response.status) {
        case 401:
          errorCode = 'AUTH_ERROR';
          errorMessage = 'Invalid or missing API key';
          break;
        case 403:
          errorCode = 'FORBIDDEN';
          errorMessage = 'Access forbidden';
          break;
        case 429:
          errorCode = 'RATE_LIMIT';
          const retryAfter = response.headers.get('Retry-After');
          errorMessage = retryAfter 
            ? `Rate limited. Try again in ${retryAfter} seconds` 
            : 'Too many requests. Please wait.';
          break;
        case 500:
        case 502:
        case 503:
          errorCode = 'SERVER_ERROR';
          errorMessage = 'OpenRouter service error. Please try again later.';
          break;
        default:
          errorCode = errorData.error?.code || 'API_ERROR';
          errorMessage = errorData.error?.message || errorMessage;
      }
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }

    return { code: errorCode, message: errorMessage };
  }

  /**
   * Send chat completion request
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} Result object
   */
  async function sendMessage(userMessage, conversationHistory = []) {
    // Validate input
    const validation = validateInput(userMessage);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check rate limit
    if (isRateLimited()) {
      const resetTime = getRateLimitResetTime();
      return {
        success: false,
        error: `Rate limited. Please wait ${Math.ceil(resetTime / 1000)} seconds.`,
        retryAfter: resetTime
      };
    }

    // Check API key
    if (!hasAPIKey()) {
      return { success: false, error: 'API key not configured' };
    }

    // Build messages array
    const messages = [
      { 
        role: 'system', 
        content: 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.'
      }
    ];

    // Add conversation history (last 10 messages)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({ role: 'user', content: validation.message });

    // Build request body
    const requestBody = {
      model: CONFIG.model,
      messages: messages,
      max_tokens: CONFIG.maxTokens
    };

    // Make request with retry logic
    let lastError = null;
    
    for (let attempt = 0; attempt <= CONFIG.maxRetries; attempt++) {
      try {
        recordRequest();

        const response = await fetch(`${CONFIG.baseURL}/chat/completions`, {
          method: 'POST',
          headers: buildHeaders(),
          body: JSON.stringify(requestBody)
        });

        // Handle non-OK responses
        if (!response.ok) {
          const errorInfo = await handleError(response);
          
          // Don't retry on auth errors
          if (errorInfo.code === 'AUTH_ERROR' || errorInfo.code === 'FORBIDDEN') {
            return { success: false, error: errorInfo.message, code: errorInfo.code };
          }
          
          // Retry on server errors and rate limits
          if (attempt < CONFIG.maxRetries && 
              (response.status >= 500 || response.status === 429)) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * (attempt + 1)));
            continue;
          }
          
          return { success: false, error: errorInfo.message, code: errorInfo.code };
        }

        // Parse successful response
        const data = await response.json();
        const result = parseResponse(data);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        return {
          success: true,
          content: result.content,
          usage: result.usage,
          model: result.model
        };

      } catch (e) {
        lastError = e;
        
        // Network error - retry
        if (attempt < CONFIG.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * (attempt + 1)));
          continue;
        }
      }
    }

    return { 
      success: false, 
      error: lastError?.message || 'Network error occurred' 
    };
  }

  /**
   * Quick search (single message, no history)
   * @param {string} query - Search query
   * @returns {Promise<Object>} Result object
   */
  async function quickSearch(query) {
    return sendMessage(query, []);
  }

  // ============== Public API ==============

  return {
    // Configuration
    config: CONFIG,
    
    // Storage
    setAPIKey,
    getAPIKey,
    hasAPIKey,
    clearAPIKey,
    saveChatHistory,
    loadChatHistory,
    clearChatHistory,
    
    // Rate limiting
    isRateLimited,
    getRateLimitResetTime,
    
    // API
    sendMessage,
    quickSearch,
    validateInput
  };

})();

// Export to global scope
window.OpenRouterAPI = OpenRouterAPI;
