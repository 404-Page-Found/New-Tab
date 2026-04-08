// js/search-engine.js - Search engine configuration and handling

// Search Engine Configuration
const searchEngines = {
  bing: { nameKey: "bing", url: "https://www.bing.com/search?q=", icon: "https://www.bing.com/favicon.ico" },
  google: { nameKey: "google", url: "https://www.google.com/search?q=", icon: "https://www.google.com/favicon.ico" },
};

// Load saved search engine
function getSavedEngine() {
  return localStorage.getItem("defaultEngine") || "bing";
}

// Save search engine
function saveEngine(engine) {
  localStorage.setItem("defaultEngine", engine);
}

// Initialize search engine dropdown
function initSearchEngine() {
  const enginesEl = document.querySelector(".search-engines");
  let savedEngine = getSavedEngine();
  if (!searchEngines[savedEngine]) {
    saveEngine("bing");
    savedEngine = getSavedEngine();
  }
  const savedEngineName = window.i18n ? window.i18n.t(searchEngines[savedEngine].nameKey) : searchEngines[savedEngine].nameKey;
  enginesEl.innerHTML = `
    <div class="selected-engine">
      <img src="${searchEngines[savedEngine].icon}" alt="${savedEngineName}" />
      <span class="dropdown-arrow">▼</span>
    </div>
    <div class="engine-dropdown">
      ${Object.keys(searchEngines).map(key => {
        const name = window.i18n ? window.i18n.t(searchEngines[key].nameKey) : searchEngines[key].nameKey;
        return `
        <div class="engine-option" data-key="${key}" ${key === savedEngine ? 'id="selected"' : ''}>
          <img src="${searchEngines[key].icon}" alt="${name}" />
          <span>${name}</span>
        </div>
      `;
      }).join("")}
    </div>
  `;
  const selectedEngineEl = enginesEl.querySelector(".selected-engine");
  const dropdownEl = enginesEl.querySelector(".engine-dropdown");

  selectedEngineEl.addEventListener("click", () => {
    const isOpen = dropdownEl.classList.toggle("dropdown-open");
    selectedEngineEl.classList.toggle("dropdown-active", isOpen);
  });

  dropdownEl.querySelectorAll(".engine-option").forEach(option => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const key = option.getAttribute("data-key");
      saveEngine(key);
      initSearchEngine(); // Re-render to update selected
      dropdownEl.classList.remove("dropdown-open");
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!enginesEl.contains(e.target)) {
      dropdownEl.classList.remove("dropdown-open");
      selectedEngineEl.classList.remove("dropdown-active");
    }
  });
}

// Modify search event listener
const searchInput = document.querySelector(".search-bar input");
if (searchInput) {
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const query = this.value.trim();
      if (!query) return;
      
      const selectedEngine = searchEngines[getSavedEngine()];
      
      // Use the new validation utility to determine if it's a URL or search query
      const validation = validateUrl(query);
      
      if (validation.status === 'valid') {
        // It's a valid URL, navigate directly
        window.location.href = validation.url.href;
      } else if (validation.status === 'undetectable') {
        // Doesn't look like a URL, treat as search query
        window.location.href = `${selectedEngine.url}${encodeURIComponent(query)}`;
      } else {
        // Malformed URL - show feedback but still try to navigate
        // Show validation message on the search bar
        showSearchValidationFeedback(validation.message);
        // Still try to navigate with https:// prefix for malformed URLs that might work
        window.location.href = `https://${query}`;
      }
    }
  });
  
  // Clear validation feedback when user starts typing
  searchInput.addEventListener("input", function() {
    clearSearchValidationFeedback();
  });
}

// Show validation feedback in search bar
function showSearchValidationFeedback(message) {
  let feedbackEl = document.querySelector('.search-validation-feedback');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.className = 'search-validation-feedback';
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.appendChild(feedbackEl);
    }
  }
  feedbackEl.textContent = message;
  feedbackEl.classList.add('show');
}

// Clear validation feedback
function clearSearchValidationFeedback() {
  const feedbackEl = document.querySelector('.search-validation-feedback');
  if (feedbackEl) {
    feedbackEl.classList.remove('show');
  }
}

// Initialize on page load
initSearchEngine();

// Expose for global access (used by language switching)
window.initSearchEngine = initSearchEngine;
