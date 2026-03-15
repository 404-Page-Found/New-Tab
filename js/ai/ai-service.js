// js/ai/ai-service.js - AI Service Module
// Handles chat UI, message management, topics/conversations, and integrates with OpenRouter API
// Includes offline mode support for when API is unavailable

const AIService = (function() {
  // DOM Elements cache
  let elements = {};
  
  // Chat state
  let currentConversationId = null;
  let conversations = [];
  let isLoading = false;
  let isOfflineMode = false;
  
  // Search and sort state
  let searchQuery = '';
  let sortOrder = 'date-desc'; // 'date-desc', 'date-asc', 'alpha-asc', 'alpha-desc'
  let keyboardSelectedIndex = -1;
  
  // Storage keys
  const STORAGE_KEYS = {
    conversations: 'ai_conversations',
    currentId: 'ai_current_conversation_id',
    sortOrder: 'ai_sort_order'
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
      topicsList: document.getElementById('ai-topics-list'),
      topicsSearch: document.getElementById('ai-topics-search-input'),
      topicsSortBtn: document.getElementById('ai-topics-sort-btn'),
      topicsCount: document.getElementById('ai-topics-count')
    };
  }
  
  /**
   * Check if modal exists
   * @returns {boolean}
   */
  function hasModal() {
    return !!document.getElementById('ai-chat-modal');
  }

  // ============== Search and Sort ==============
  
  /**
   * Load sort order from storage
   */
  function loadSortOrder() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.sortOrder);
      if (stored && ['date-desc', 'date-asc', 'alpha-asc', 'alpha-desc'].includes(stored)) {
        sortOrder = stored;
      }
    } catch (e) {
      console.error('Failed to load sort order:', e);
    }
  }
  
  /**
   * Save sort order to storage
   */
  function saveSortOrder() {
    try {
      localStorage.setItem(STORAGE_KEYS.sortOrder, sortOrder);
    } catch (e) {
      console.error('Failed to save sort order:', e);
    }
  }
  
  /**
   * Get filtered and sorted conversations
   * @returns {Array} Filtered and sorted conversations
   */
  function getFilteredConversations() {
    let filtered = [...conversations];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(conv => 
        conv.title.toLowerCase().includes(query) ||
        conv.messages.some(msg => msg.content && msg.content.toLowerCase().includes(query))
      );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return b.updatedAt - a.updatedAt;
        case 'date-asc':
          return a.updatedAt - b.updatedAt;
        case 'alpha-asc':
          return a.title.localeCompare(b.title);
        case 'alpha-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    return filtered;
  }
  
  /**
   * Handle search input change
   * @param {string} query - Search query
   */
  function handleSearch(query) {
    searchQuery = query;
    keyboardSelectedIndex = -1;
    renderTopicsList();
  }
  
  /**
   * Handle sort button click
   */
  function handleSortClick(e) {
    e.stopPropagation();
    const btn = elements.topicsSortBtn;
    const dropdown = btn?.parentElement?.querySelector('.ai-sort-dropdown');
    
    // Toggle dropdown visibility
    if (dropdown) {
      dropdown.classList.toggle('visible');
      btn?.classList.toggle('active');
    }
    
    // Close dropdown when clicking outside
    const closeDropdown = (event) => {
      if (!btn?.contains(event.target) && !dropdown?.contains(event.target)) {
        dropdown?.classList.remove('visible');
        btn?.classList.remove('active');
        document.removeEventListener('click', closeDropdown);
      }
    };
    
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 0);
  }
  
  /**
   * Handle sort option selection
   * @param {string} newSortOrder - New sort order
   */
  function handleSortChange(newSortOrder) {
    sortOrder = newSortOrder;
    saveSortOrder();
    keyboardSelectedIndex = -1;
    renderTopicsList();
    
    // Close dropdown
    const btn = elements.topicsSortBtn;
    const dropdown = btn?.parentElement?.querySelector('.ai-sort-dropdown');
    dropdown?.classList.remove('visible');
    btn?.classList.remove('active');
  }
  
  /**
   * Get sort option translations
   * @param {string} key - Sort key
   * @returns {string}
   */
  function getSortLabel(key) {
    const labels = {
      'date-desc': getTranslation('aiSortNewest'),
      'date-asc': getTranslation('aiSortOldest'),
      'alpha-asc': getTranslation('aiSortAtoZ'),
      'alpha-desc': getTranslation('aiSortZtoA')
    };
    return labels[key] || key;
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
    
    elements.modal.classList.add('ai-modal-open');
    
    // Apply current theme to ensure AI modal uses global theme
    applyThemeToAI();
    
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
   * Apply global theme to AI modal elements
   * Ensures AI chat uses the same theme as the rest of the app
   */
  function applyThemeToAI() {
    const theme = loadTheme();
    const modal = document.getElementById('ai-chat-modal');
    if (modal) {
      // The theme class is on body, CSS will handle the styling
      // This function ensures any dynamic elements are updated if needed
      if (theme === 'light') {
        modal.classList.add('light-theme');
      } else {
        modal.classList.remove('light-theme');
      }
    }
  }
  
  /**
   * Load current theme setting
   * @returns {string} 'dark' or 'light'
   */
  function loadTheme() {
    return localStorage.getItem('theme') || 'dark';
  }
  
  /**
   * Close the AI chat modal
   */
  function closeModal() {
    if (!elements.modal) {
      cacheElements();
    }
    if (elements.modal) {
      elements.modal.classList.remove('ai-modal-open');
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
    
    const filteredConversations = getFilteredConversations();
    
    // Update count
    if (elements.topicsCount) {
      const total = conversations.length;
      const shown = filteredConversations.length;
      elements.topicsCount.textContent = shown === total ? total : `${shown}/${total}`;
    }
    
    if (filteredConversations.length === 0) {
      if (searchQuery.trim()) {
        elements.topicsList.innerHTML = `
          <div class="ai-topics-no-results">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <p>${getTranslation('aiNoSearchResults')}</p>
          </div>
        `;
      } else {
        elements.topicsList.innerHTML = `
          <div class="ai-topics-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>${getTranslation('aiNoConversations')}</p>
          </div>
        `;
      }
      return;
    }
    
    elements.topicsList.innerHTML = filteredConversations.map((conv, index) => {
      const isActive = conv.id === currentConversationId;
      const isKeyboardSelected = index === keyboardSelectedIndex;
      return `
        <div class="ai-topic-item ${isActive ? 'active' : ''} ${isKeyboardSelected ? 'keyboard-selected' : ''}" data-id="${conv.id}" data-index="${index}">
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
    
    // Scroll to active item
    if (keyboardSelectedIndex >= 0) {
      const selectedItem = elements.topicsList.querySelector('.keyboard-selected');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
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
    const content = isStreaming ? (msg.content || '') : msg.content;
    
    return `
      <div class="ai-message ${isUser ? 'ai-message-user' : 'ai-message-assistant'}">
        <div class="ai-message-avatar">
          ${isUser ? 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>' : 
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/><line x1="12" y1="9.5" x2="12" y2="5"/><circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none"/><line x1="14.3" y1="10.2" x2="17" y2="7"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><line x1="14.5" y1="12" x2="19" y2="12"/><circle cx="19.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><line x1="14.3" y1="13.8" x2="17" y2="17"/><circle cx="17.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><line x1="12" y1="14.5" x2="12" y2="19"/><circle cx="12" cy="20" r="1.2" fill="currentColor" stroke="none"/><line x1="9.7" y1="13.8" x2="7" y2="17"/><circle cx="6.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><line x1="9.5" y1="12" x2="5" y2="12"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><line x1="9.7" y1="10.2" x2="7" y2="7"/><circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>'
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>
              <line x1="12" y1="9.5" x2="12" y2="5"/>
              <circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none"/>
              <line x1="14.3" y1="10.2" x2="17" y2="7"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
              <line x1="14.5" y1="12" x2="19" y2="12"/>
              <circle cx="19.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
              <line x1="14.3" y1="13.8" x2="17" y2="17"/>
              <circle cx="17.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>
              <line x1="12" y1="14.5" x2="12" y2="19"/>
              <circle cx="12" cy="20" r="1.2" fill="currentColor" stroke="none"/>
              <line x1="9.7" y1="13.8" x2="7" y2="17"/>
              <circle cx="6.5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>
              <line x1="9.5" y1="12" x2="5" y2="12"/>
              <circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none"/>
              <line x1="9.7" y1="10.2" x2="7" y2="7"/>
              <circle cx="6.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
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
      aiSearchConversations: 'Search...',
      aiSortNewest: 'Newest first',
      aiSortOldest: 'Oldest first',
      aiSortAtoZ: 'A to Z',
      aiSortZtoA: 'Z to A',
      aiNoSearchResults: 'No conversations found',
      aiNewChat: 'New Chat',
      aiConversations: 'Conversations',
      aiNoConversations: 'No conversations yet',
      aiNewConversation: 'New Conversation',
      aiDeleteConversation: 'Delete conversation',
      aiDeleteConfirm: 'Delete this conversation?',
      aiJustNow: 'Just now',
      aiOnline: 'Online',
      aiOffline: 'Offline',
      aiAuthError: 'Invalid or missing API key',
      aiForbidden: 'Access forbidden',
      aiServerError: 'Service error. Please try again later.',
      aiNetworkError: 'Network error occurred',
      aiInvalidResponse: 'Invalid response format',
      aiNoContent: 'No content in response',
      aiMessageRequired: 'Message is required',
      aiMessageEmpty: 'Message cannot be empty',
      aiMessageTooLong: 'Message too long (max 2000 characters)'
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
    
    // Search input
    if (elements.topicsSearch) {
      elements.topicsSearch.addEventListener('input', (e) => {
        handleSearch(e.target.value);
      });
      
      // Clear search on escape
      elements.topicsSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          elements.topicsSearch.value = '';
          handleSearch('');
          elements.topicsSearch.blur();
        }
      });
    }
    
    // Sort button
    if (elements.topicsSortBtn) {
      elements.topicsSortBtn.addEventListener('click', handleSortClick);
    }
    
    // Topics list keyboard navigation
    if (elements.topicsList) {
      elements.topicsList.addEventListener('keydown', handleTopicsKeydown);
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
    
    // Listen for theme changes to update AI modal in real-time
    document.addEventListener('themeChanged', () => {
      applyThemeToAI();
    });
    
    // Also listen for localStorage changes (for cross-tab sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'theme') {
        applyThemeToAI();
      }
    });
  }
  
  /**
   * Handle keyboard navigation in topics list
   * @param {KeyboardEvent} e
   */
  function handleTopicsKeydown(e) {
    const filteredConversations = getFilteredConversations();
    if (filteredConversations.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        keyboardSelectedIndex = Math.min(keyboardSelectedIndex + 1, filteredConversations.length - 1);
        renderTopicsList();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        keyboardSelectedIndex = Math.max(keyboardSelectedIndex - 1, 0);
        renderTopicsList();
        break;
        
      case 'Enter':
        e.preventDefault();
        if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < filteredConversations.length) {
          const convId = filteredConversations[keyboardSelectedIndex].id;
          switchConversation(convId);
        }
        break;
        
      case 'Delete':
      case 'Backspace':
        if (keyboardSelectedIndex >= 0 && keyboardSelectedIndex < filteredConversations.length) {
          const convId = filteredConversations[keyboardSelectedIndex].id;
          if (confirm(getTranslation('aiDeleteConfirm'))) {
            deleteConversation(convId);
          }
        }
        break;
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
    loadSortOrder();
    loadConversations();
    initEventListeners();
    renderTopicsList();
    renderMessages();
    initNetworkListener();
    createSortDropdown();
  }
  
  /**
   * Create sort dropdown dynamically
   */
  function createSortDropdown() {
    // Wait for the sort button to be in the DOM
    const checkButton = () => {
      const btn = document.getElementById('ai-topics-sort-btn');
      if (!btn) {
        setTimeout(checkButton, 100);
        return;
      }
      
      // Create dropdown if it doesn't exist
      if (!btn.parentElement.querySelector('.ai-sort-dropdown')) {
        const dropdown = document.createElement('div');
        dropdown.className = 'ai-sort-dropdown';
        dropdown.innerHTML = `
          <div class="ai-sort-option ${sortOrder === 'date-desc' ? 'active' : ''}" data-sort="date-desc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19,12 12,19 5,12"></polyline>
            </svg>
            <span>${getSortLabel('date-desc')}</span>
          </div>
          <div class="ai-sort-option ${sortOrder === 'date-asc' ? 'active' : ''}" data-sort="date-asc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5,12 12,5 19,12"></polyline>
            </svg>
            <span>${getSortLabel('date-asc')}</span>
          </div>
          <div class="ai-sort-option ${sortOrder === 'alpha-asc' ? 'active' : ''}" data-sort="alpha-asc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span>${getSortLabel('alpha-asc')}</span>
          </div>
          <div class="ai-sort-option ${sortOrder === 'alpha-desc' ? 'active' : ''}" data-sort="alpha-desc">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span>${getSortLabel('alpha-desc')}</span>
          </div>
        `;
        
        btn.parentElement.style.position = 'relative';
        btn.parentElement.appendChild(dropdown);
        
        // Add click handlers
        dropdown.querySelectorAll('.ai-sort-option').forEach(option => {
          option.addEventListener('click', (e) => {
            e.stopPropagation();
            const newSort = option.dataset.sort;
            handleSortChange(newSort);
          });
        });
      }
    };
    
    setTimeout(checkButton, 100);
  }

  /**
   * Initialize network status listener
   */
  function initNetworkListener() {
    // Listen for network status changes
    NetworkDetector.addListener(handleNetworkStatusChange);
    
    // Update initial status
    const status = NetworkDetector.getStatus();
    handleNetworkStatusChange(status);
  }

  /**
   * Handle network status changes
   * @param {Object} status - Network status object
   */
  function handleNetworkStatusChange(status) {
    const wasOffline = isOfflineMode;
    isOfflineMode = status.isOffline;
    
    // Update UI if status changed
    if (wasOffline !== isOfflineMode) {
      updateConnectionStatus();
      
      // Notify user of status change
      if (isOfflineMode) {
        console.info('AI Service: Switched to offline mode');
      } else {
        console.info('AI Service: Back to online mode');
      }
    }
  }

  /**
   * Update connection status indicator in UI
   */
  function updateConnectionStatus() {
    const statusIndicator = document.getElementById('ai-connection-status');
    if (!statusIndicator) {
      // Create status indicator if it doesn't exist
      createConnectionStatusIndicator();
      return;
    }
    
    const onlineText = getTranslation('aiOnline');
    const offlineText = getTranslation('aiOffline');
    
    if (isOfflineMode) {
      statusIndicator.className = 'ai-connection-status offline';
      statusIndicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg><span>' + offlineText + '</span>';
    } else {
      statusIndicator.className = 'ai-connection-status online';
      statusIndicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg><span>' + onlineText + '</span>';
    }
  }

  /**
   * Create connection status indicator in UI
   */
  function createConnectionStatusIndicator() {
    // Find the chat title area
    const titleArea = document.querySelector('.ai-chat-header');
    if (!titleArea) return;
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'ai-connection-status';
    
    const onlineText = getTranslation('aiOnline');
    const offlineText = getTranslation('aiOffline');
    
    statusDiv.className = isOfflineMode ? 'ai-connection-status offline' : 'ai-connection-status online';
    statusDiv.innerHTML = isOfflineMode 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg><span>' + offlineText + '</span>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg><span>' + onlineText + '</span>';
    
    titleArea.appendChild(statusDiv);
  }

  /**
   * Send a message with streaming support
   * @param {string} userMessage - User's message
   */
  async function sendMessage(userMessage) {
    if (!userMessage || isLoading) return;
    
    // Check if we should use offline mode
    const networkStatus = NetworkDetector.getStatus();
    
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
      let result;
      
      if (networkStatus.isOffline) {
        // Use offline mode
        result = OfflineMode.getResponse(userMessage);
        
        // Simulate streaming for offline responses
        if (result.success && result.content) {
          const content = result.content;
          const chunks = content.split('');
          
          for (let i = 0; i < chunks.length; i++) {
            if (streamingTextElement) {
              streamingTextElement.textContent += chunks[i];
            }
            // Small delay for effect
            if (i % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 5));
            }
          }
        }
      } else {
        // Direct API call - no caching
        result = await OpenRouterAPI.sendMessageStreaming(
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
      }
      
      if (result.success) {
        // Update the message in the array
        const conv = getCurrentConversation();
        const lastMsg = conv.messages[conv.messages.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          lastMsg.isStreaming = false;
          // Get content from streaming element or from result
          lastMsg.content = (streamingTextElement?.textContent) || result.content || '';
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
      console.error('AI sendMessage error:', e);
      // Remove messages on error
      const conv = getCurrentConversation();
      if (conv.messages.length >= 2) {
        conv.messages.pop(); // Remove assistant
        conv.messages.pop(); // Remove user
        renderMessages();
      }
    }
    
    // Always hide loading - ensure this runs even on errors
    hideLoading();
  }

  /**
   * Quick AI search (for search bar integration)
   * @param {string} query - Search query
   * @returns {Promise<string>} AI response or empty string
   */
  async function quickSearch(query) {
    if (!query || !query.trim()) return '';
    
    const networkStatus = NetworkDetector.getStatus();
    
    try {
      let result;
      
      if (networkStatus.isOffline) {
        // Use offline mode
        result = OfflineMode.getResponse(query);
      } else {
        // Direct API call - no caching
        result = await OpenRouterAPI.quickSearch(query);
      }
      
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
    // API key is now handled server-side by Cloudflare Worker
    // But we also check network status
    return !!OpenRouterAPI && !NetworkDetector.getStatus().isOffline;
  }
  
  /**
   * Open AI chat from external trigger
   */
  function open() {
    openModal();
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
