// js/ai/openrouter.js - OpenRouter API Integration via Cloudflare Proxy
// For security, API requests are proxied through Cloudflare Workers
// API key is stored server-side and never exposed to the client

const OpenRouterAPI = (function() {
  // Configuration
  const CONFIG = {
    // Cloudflare Worker URL - UPDATE THIS AFTER DEPLOYMENT
    // Run: cd cloudflare && wrangler deploy
    // Then copy the worker URL here
    baseURL: 'https://new-tab-openrouter-proxy.lucas20220605.workers.dev',
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

  // Storage keys
  const STORAGE_KEYS = {
    chatHistory: 'ai_chat_history'
  };

  // NOTE: API key is now handled server-side by Cloudflare Worker
  // No client-side API key storage needed anymore

  // Initialize - no longer need to initialize API key

  // NOTE: These functions are kept for backwards compatibility but are deprecated
  // API key is now handled server-side by Cloudflare Worker

  // ============== Deprecated Functions ==============

  /**
   * Set API key - DEPRECATED (now handled by Cloudflare Worker)
   * This function is kept for backwards compatibility but does nothing
   * @deprecated
   * @param {string} apiKey - OpenRouter API key (ignored)
   * @returns {boolean} Always returns false
   */
  function setAPIKey(apiKey) {
    console.warn('API key is now handled server-side by Cloudflare Worker. This function is deprecated.');
    return false;
  }

  /**
   * Get API key - DEPRECATED (now handled by Cloudflare Worker)
   * @deprecated Always returns null
   * @returns {null}
   */
  function getAPIKey() {
    console.warn('API key is now handled server-side by Cloudflare Worker.');
    return null;
  }

  /**
   * Check if API key is configured
   * Now always returns true since the worker handles authentication
   * @returns {boolean}
   */
  function hasAPIKey() {
    // Always return true since the worker handles the API key
    // The worker will return an error if the key is not set server-side
    return true;
  }

  /**
   * Clear API key - DEPRECATED
   * @deprecated
   */
  function clearAPIKey() {
    console.warn('API key is now handled server-side by Cloudflare Worker.');
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
   * Build request headers for Cloudflare Worker proxy
   * No API key needed - it's handled server-side
   * @returns {Object} Headers object
   */
  function buildHeaders() {
    return {
      'Content-Type': 'application/json',
      // No Authorization header - API key is on the server side (Cloudflare Worker)
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

        const response = await fetch(CONFIG.baseURL, {
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

  /**
   * Send streaming chat completion request
   * @param {string} userMessage - User's message
   * @param {Array} conversationHistory - Previous messages
   * @param {Function} onChunk - Callback for each chunk received
   * @returns {Promise<Object>} Final result object
   */
  async function sendMessageStreaming(userMessage, conversationHistory = [], onChunk) {
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

    // Build request body with streaming enabled
    const requestBody = {
      model: CONFIG.model,
      messages: messages,
      max_tokens: CONFIG.maxTokens,
      stream: true
    };

    try {
      recordRequest();

      const response = await fetch(CONFIG.baseURL, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(requestBody)
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorInfo = await handleError(response);
        return { success: false, error: errorInfo.message, code: errorInfo.code };
      }

      // Get the reader for streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            // Check for [DONE] signal
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                if (onChunk) {
                  onChunk(content);
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return {
        success: true,
        content: fullContent,
        usage: null,
        model: CONFIG.model
      };

    } catch (e) {
      return { 
        success: false, 
        error: e.message || 'Network error occurred' 
      };
    }
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
    sendMessageStreaming,
    validateInput
  };

})();

// Export to global scope
window.OpenRouterAPI = OpenRouterAPI;
