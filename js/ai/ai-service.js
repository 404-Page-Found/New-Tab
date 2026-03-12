// js/ai/ai-service.js - AI Service Module
// Handles chat UI, message management, and integrates with OpenRouter API

const AIService = (function() {
  // DOM Elements cache
  let elements = {};
  
  // Chat state
  let messages = [];
  let isLoading = false;
  
  // Default system prompt
  const SYSTEM_PROMPT = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.';
  
  // ============== DOM Elements ==============
  
  /**
   * Cache DOM elements
   */
  function cacheElements() {
    elements = {
      modal: document.getElementById('ai-chat-modal'),
      container: document.getElementById('ai-chat-container'),
      input: document.getElementById('ai-chat-input'),
      sendBtn: document.getElementById('ai-chat-send'),
      closeBtn: document.getElementById('ai-chat-close'),
      clearBtn: document.getElementById('ai-chat-clear'),
      loadingIndicator: document.getElementById('ai-chat-loading'),
      errorDisplay: document.getElementById('ai-chat-error'),
      title: document.getElementById('ai-chat-title')
    };
  }
  
  /**
   * Check if modal exists
   * @returns {boolean}
   */
  function hasModal() {
    return !!document.getElementById('ai-chat-modal');
  }
  
  // ============== Modal Control ==============
  
  /**
   * Open the AI chat modal
   */
  function openModal() {
    if (!hasModal()) return;
    
    cacheElements();
    if (!elements.modal) return;
    
    elements.modal.style.display = 'flex';
    
    // Load chat history
    loadChatHistory();
    
    // Focus input
    setTimeout(() => {
      if (elements.input) elements.input.focus();
    }, 100);
  }
  
  /**
   * Close the AI chat modal
   */
  function closeModal() {
    if (!elements.modal) {
      cacheElements();
    }
    if (elements.modal) {
      elements.modal.style.display = 'none';
    }
  }
  
  // ============== Chat History ==============
  
  /**
   * Load chat history from storage and render
   */
  function loadChatHistory() {
    messages = OpenRouterAPI.loadChatHistory();
    renderMessages();
  }
  
  /**
   * Save current messages to storage
   */
  function saveMessages() {
    OpenRouterAPI.saveChatHistory(messages);
  }
  
  /**
   * Clear chat history
   */
  function clearChat() {
    messages = [];
    OpenRouterAPI.clearChatHistory();
    renderMessages();
  }
  
  // ============== Rendering ==============
  
  /**
   * Get message HTML for a single message
   * @param {Object} msg - Message object
   * @returns {string} HTML string
   */
  function getMessageHTML(msg) {
    const isUser = msg.role === 'user';
    const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
    const isStreaming = msg.isStreaming;
    const content = isStreaming ? (msg.content || getTranslation('aiThinking')) : msg.content;
    
    return `
      <div class="ai-message ${isUser ? 'ai-message-user' : 'ai-message-assistant'}">
        <div class="ai-message-avatar">
          ${isUser ? 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>' : 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6v6l4 2"></path></svg>'
          }
        </div>
        <div class="ai-message-content">
          <div class="ai-message-text ${isStreaming ? 'ai-message-streaming' : ''}">${escapeHTML(content)}</div>
          <div class="ai-message-time">${time}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Escape HTML special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  /**
   * Render all messages
   */
  function renderMessages() {
    if (!elements.container) {
      cacheElements();
    }
    if (!elements.container) return;
    
    if (messages.length === 0) {
      elements.container.innerHTML = `
        <div class="ai-welcome">
          <div class="ai-welcome-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
          <div class="ai-welcome-title">${getTranslation('aiWelcome')}</div>
          <div class="ai-welcome-subtitle">${getTranslation('aiWelcomeSubtitle')}</div>
        </div>
      `;
      return;
    }
    
    elements.container.innerHTML = messages.map(msg => getMessageHTML(msg)).join('');
    
    // Scroll to bottom
    elements.container.scrollTop = elements.container.scrollHeight;
  }
  
  /**
   * Get translation for a key
   * @param {string} key - Translation key
   * @returns {string} Translated string or key
   */
  function getTranslation(key) {
    if (window.i18n && window.i18n.t) {
      return window.i18n.t(key);
    }
    const translations = {
      aiWelcome: 'Welcome to AI Assistant',
      aiWelcomeSubtitle: 'Ask me anything!',
      aiThinking: 'Thinking...',
      aiError: 'An error occurred',
      aiRateLimit: 'Too many requests. Please wait.',
      aiClearConfirm: 'Clear chat history?',
      aiPlaceholder: 'Type your message...'
    };
    return translations[key] || key;
  }
  
  // ============== Sending Messages ==============
  
  /**
   * Show loading state
   */
  function showLoading() {
    isLoading = true;
    if (elements.loadingIndicator) {
      elements.loadingIndicator.style.display = 'flex';
    }
    if (elements.sendBtn) {
      elements.sendBtn.disabled = true;
    }
    if (elements.input) {
      elements.input.disabled = true;
    }
    if (elements.errorDisplay) {
      elements.errorDisplay.textContent = '';
      elements.errorDisplay.style.display = 'none';
    }
  }
  
  /**
   * Hide loading state
   */
  function hideLoading() {
    isLoading = false;
    if (elements.loadingIndicator) {
      elements.loadingIndicator.style.display = 'none';
    }
    if (elements.sendBtn) {
      elements.sendBtn.disabled = false;
    }
    if (elements.input) {
      elements.input.disabled = false;
      elements.input.focus();
    }
  }
  
  /**
   * Display error message
   * @param {string} error - Error message
   */
  function showError(error) {
    if (elements.errorDisplay) {
      elements.errorDisplay.textContent = error;
      elements.errorDisplay.style.display = 'block';
    }
  }
  
  /**
   * Send a message with streaming support
   * @param {string} userMessage - User's message
   */
  async function sendMessage(userMessage) {
    if (!userMessage || isLoading) return;
    
    // Add user message to chat
    const userMsg = {
      role: 'user',
      content: userMessage.trim(),
      timestamp: Date.now()
    };
    messages.push(userMsg);
    renderMessages();
    saveMessages();
    
    // Clear input
    if (elements.input) {
      elements.input.value = '';
    }
    
    // Show loading
    showLoading();
    
    // Get conversation history for context (exclude system message)
    const historyForAPI = messages
      .filter(m => m.role !== 'system')
      .slice(0, -1) // Exclude current message
      .map(m => ({ role: m.role, content: m.content }));
    
    // Create placeholder for streaming response
    const assistantMsg = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    messages.push(assistantMsg);
    
    // Render and get reference to the assistant message element
    renderMessages();
    
    // Get the assistant message element for direct updates
    const assistantElements = elements.container?.querySelectorAll('.ai-message-assistant');
    const streamingElement = assistantElements ? assistantElements[assistantElements.length - 1] : null;
    const streamingTextElement = streamingElement?.querySelector('.ai-message-text');
    
    try {
      // Use streaming API
      const result = await OpenRouterAPI.sendMessageStreaming(
        userMessage, 
        historyForAPI,
        (chunk) => {
          // Directly update the DOM element without re-rendering everything
          if (streamingTextElement) {
            const currentContent = streamingTextElement.textContent;
            streamingTextElement.textContent = currentContent + chunk;
          }
        }
      );
      
      if (result.success) {
        // Update the message in the array
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          lastMsg.isStreaming = false;
          lastMsg.content = streamingTextElement?.textContent || '';
        }
        
        // Update streaming indicator in UI
        if (streamingTextElement) {
          streamingTextElement.classList.remove('ai-message-streaming');
        }
        
        saveMessages();
      } else {
        showError(result.error);
        // Remove user and assistant messages if API failed
        messages.pop(); // Remove assistant
        messages.pop(); // Remove user
        renderMessages();
      }
    } catch (e) {
      showError(getTranslation('aiError'));
      // Remove messages on error
      messages.pop(); // Remove assistant
      messages.pop(); // Remove user
      renderMessages();
    }
    
    hideLoading();
  }
  
  /**
   * Handle send button click or Enter key
   */
  function handleSend() {
    if (!elements.input) {
      cacheElements();
    }
    if (!elements.input) return;
    
    const message = elements.input.value;
    if (message.trim()) {
      sendMessage(message);
    }
  }
  
  // ============== Event Handlers ==============
  
  /**
   * Initialize event listeners
   */
  function initEventListeners() {
    // Send button
    if (elements.sendBtn) {
      elements.sendBtn.addEventListener('click', handleSend);
    }
    
    // Input Enter key
    if (elements.input) {
      elements.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
    }
    
    // Close button
    if (elements.closeBtn) {
      elements.closeBtn.addEventListener('click', closeModal);
    }
    
    // Clear button
    if (elements.clearBtn) {
      elements.clearBtn.addEventListener('click', () => {
        if (confirm(getTranslation('aiClearConfirm'))) {
          clearChat();
        }
      });
    }
    
    // Close on outside click
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
    }
  }
  
  // ============== Public API ==============
  
  /**
   * Initialize the AI service
   */
  function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    cacheElements();
    initEventListeners();
    loadChatHistory();
  }
  
  /**
   * Open AI chat from external trigger
   */
  function open() {
    openModal();
  }
  
  /**
   * Quick AI search (for search bar integration)
   * @param {string} query - Search query
   * @returns {Promise<string>} AI response or empty string
   */
  async function quickSearch(query) {
    if (!query || !query.trim()) return '';
    
    try {
      const result = await OpenRouterAPI.quickSearch(query);
      if (result.success) {
        return result.content;
      }
      console.error('AI Search error:', result.error);
      return '';
    } catch (e) {
      console.error('AI Search error:', e);
      return '';
    }
  }
  
  /**
   * Check if AI is available (API key configured)
   * @returns {boolean}
   */
  function isAvailable() {
    return OpenRouterAPI && OpenRouterAPI.hasAPIKey();
  }
  
  // Initialize on load
  init();
  
  return {
    open,
    close: closeModal,
    sendMessage,
    quickSearch,
    isAvailable,
    clearChat
  };
  
})();

// Export to global scope
window.AIService = AIService;
