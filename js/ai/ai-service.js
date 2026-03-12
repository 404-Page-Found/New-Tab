// js/ai/ai-service.js - AI Service Module
// Handles chat UI, message management, topics/conversations, and integrates with OpenRouter API

const AIService = (function() {
  // DOM Elements cache
  let elements = {};
  
  // Chat state
  let currentConversationId = null;
  let conversations = [];
  let isLoading = false;
  
  // Storage keys
  const STORAGE_KEYS = {
    conversations: 'ai_conversations',
    currentId: 'ai_current_conversation_id'
  };
  
  // Default system prompt
  const SYSTEM_PROMPT = 'You are a helpful AI assistant. Provide clear, concise, and accurate responses.';
  
  // Maximum conversations to store
  const MAX_CONVERSATIONS = 50;
  
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
      loadingIndicator: document.getElementById('ai-chat-loading'),
      errorDisplay: document.getElementById('ai-chat-error'),
      title: document.getElementById('ai-chat-title'),
      newChatBtn: document.getElementById('ai-new-chat-btn'),
      topicsList: document.getElementById('ai-topics-list')
    };
  }
  
  /**
   * Check if modal exists
   * @returns {boolean}
   */
  function hasModal() {
    return !!document.getElementById('ai-chat-modal');
  }

  // ============== Conversation Management ==============
  
  /**
   * Generate unique ID
   * @returns {string}
   */
  function generateId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Create a new conversation
   * @returns {Object} New conversation object
   */
  function createNewConversation() {
    const conversation = {
      id: generateId(),
      title: getTranslation('aiNewConversation'),
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    return conversation;
  }
  
  /**
   * Load conversations from storage
   */
  function loadConversations() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.conversations);
      conversations = stored ? JSON.parse(stored) : [];
      
      // Load current conversation ID
      const currentId = localStorage.getItem(STORAGE_KEYS.currentId);
      
      // Find the current conversation or create a new one
      if (currentId && conversations.find(c => c.id === currentId)) {
        currentConversationId = currentId;
      } else if (conversations.length > 0) {
        currentConversationId = conversations[0].id;
      } else {
        // Create initial conversation
        const newConv = createNewConversation();
        conversations.push(newConv);
        currentConversationId = newConv.id;
        saveConversations();
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
      conversations = [];
      const newConv = createNewConversation();
      conversations.push(newConv);
      currentConversationId = newConv.id;
    }
  }
  
  /**
   * Save conversations to storage
   */
  function saveConversations() {
    try {
      // Trim to max conversations
      if (conversations.length > MAX_CONVERSATIONS) {
        conversations = conversations.slice(-MAX_CONVERSATIONS);
      }
      
      localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations));
      localStorage.setItem(STORAGE_KEYS.currentId, currentConversationId);
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  }
  
  /**
   * Get current conversation
   * @returns {Object}
   */
  function getCurrentConversation() {
    return conversations.find(c => c.id === currentConversationId) || conversations[0];
  }
  
  /**
   * Get current messages
   * @returns {Array}
   */
  function getCurrentMessages() {
    const conv = getCurrentConversation();
    return conv ? conv.messages : [];
  }
  
  /**
   * Add message to current conversation
   * @param {Object} message
   */
  function addMessageToConversation(message) {
    const conv = getCurrentConversation();
    if (conv) {
      conv.messages.push(message);
      conv.updatedAt = Date.now();
      
      // Update title if this is the first user message
      if (conv.messages.length === 1 && message.role === 'user') {
        conv.title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
      }
      
      saveConversations();
    }
  }
  
  /**
   * Create new chat
   */
  function createNewChat() {
    const newConv = createNewConversation();
    conversations.unshift(newConv);
    currentConversationId = newConv.id;
    saveConversations();
    renderTopicsList();
    renderMessages();
    
    // Focus input
    if (elements.input) {
      elements.input.focus();
    }
  }
  
  /**
   * Switch to a conversation
   * @param {string} conversationId
   */
  function switchConversation(conversationId) {
    if (currentConversationId === conversationId) return;
    
    currentConversationId = conversationId;
    saveConversations();
    renderTopicsList();
    renderMessages();
  }
  
  /**
   * Delete a conversation
   * @param {string} conversationId
   */
  function deleteConversation(conversationId) {
    const index = conversations.findIndex(c => c.id === conversationId);
    if (index === -1) return;
    
    conversations.splice(index, 1);
    
    // If deleted current conversation, switch to another
    if (currentConversationId === conversationId) {
      if (conversations.length > 0) {
        currentConversationId = conversations[0].id;
      } else {
        // Create new if all deleted
        const newConv = createNewConversation();
        conversations.push(newConv);
        currentConversationId = newConv.id;
      }
    }
    
    saveConversations();
    renderTopicsList();
    renderMessages();
  }
  
  /**
   * Clear current conversation
   */
  function clearCurrentConversation() {
    const conv = getCurrentConversation();
    if (conv) {
      conv.messages = [];
      conv.title = getTranslation('aiNewConversation');
      saveConversations();
      renderMessages();
      renderTopicsList();
    }
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
    
    // Load conversations
    loadConversations();
    renderTopicsList();
    renderMessages();
    
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

  // ============== Rendering ==============
  
  /**
   * Format timestamp for topic display
   * @param {number} timestamp
   * @returns {string}
   */
  function formatTopicTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return getTranslation('aiJustNow');
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
  
  /**
   * Render topics list in sidebar
   */
  function renderTopicsList() {
    if (!elements.topicsList) {
      cacheElements();
    }
    if (!elements.topicsList) return;
    
    if (conversations.length === 0) {
      elements.topicsList.innerHTML = `
        <div class="ai-topics-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>${getTranslation('aiNoConversations')}</p>
        </div>
      `;
      return;
    }
    
    elements.topicsList.innerHTML = conversations.map(conv => {
      const isActive = conv.id === currentConversationId;
      return `
        <div class="ai-topic-item ${isActive ? 'active' : ''}" data-id="${conv.id}">
          <div class="ai-topic-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="ai-topic-info">
            <div class="ai-topic-title">${escapeHTML(conv.title)}</div>
            <div class="ai-topic-time">${formatTopicTime(conv.updatedAt)}</div>
          </div>
          <button class="ai-topic-delete" data-id="${conv.id}" title="${getTranslation('aiDeleteConversation')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    elements.topicsList.querySelectorAll('.ai-topic-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.ai-topic-delete')) return;
        const id = item.dataset.id;
        switchConversation(id);
      });
    });
    
    elements.topicsList.querySelectorAll('.ai-topic-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm(getTranslation('aiDeleteConfirm'))) {
          deleteConversation(id);
        }
      });
    });
  }
  
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
    
    const messages = getCurrentMessages();
    
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
      aiPlaceholder: 'Type your message...',
      aiNewChat: 'New Chat',
      aiConversations: 'Conversations',
      aiNoConversations: 'No conversations yet',
      aiNewConversation: 'New Conversation',
      aiDeleteConversation: 'Delete conversation',
      aiDeleteConfirm: 'Delete this conversation?',
      aiJustNow: 'Just now'
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
    addMessageToConversation(userMsg);
    renderMessages();
    renderTopicsList();
    saveConversations();
    
    // Clear input
    if (elements.input) {
      elements.input.value = '';
    }
    
    // Show loading
    showLoading();
    
    // Get conversation history for context
    const messages = getCurrentMessages();
    const historyForAPI = messages
      .filter(m => m.role !== 'system')
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content }));
    
    // Create placeholder for streaming response
    const assistantMsg = {
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };
    addMessageToConversation(assistantMsg);
    
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
        const conv = getCurrentConversation();
        const lastMsg = conv.messages[conv.messages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          lastMsg.isStreaming = false;
          lastMsg.content = streamingTextElement?.textContent || '';
        }
        
        // Update streaming indicator in UI
        if (streamingTextElement) {
          streamingTextElement.classList.remove('ai-message-streaming');
        }
        
        saveConversations();
        renderTopicsList();
      } else {
        showError(result.error);
        // Remove user and assistant messages if API failed
        const conv = getCurrentConversation();
        conv.messages.pop(); // Remove assistant
        conv.messages.pop(); // Remove user
        renderMessages();
      }
    } catch (e) {
      showError(getTranslation('aiError'));
      // Remove messages on error
      const conv = getCurrentConversation();
      conv.messages.pop(); // Remove assistant
      conv.messages.pop(); // Remove user
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
    
    // New chat button
    if (elements.newChatBtn) {
      elements.newChatBtn.addEventListener('click', createNewChat);
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
    loadConversations();
    initEventListeners();
    renderTopicsList();
    renderMessages();
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
    clearChat: clearCurrentConversation
  };
  
})();

// Export to global scope
window.AIService = AIService;
