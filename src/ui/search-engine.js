// js/search-engine.js - Search handling for the new tab page

let isSearchHandlerBound = false;

function openDefaultSearch(query) {
  if (typeof chrome !== "undefined" && chrome.search && typeof chrome.search.query === "function") {
    chrome.search.query({
      text: query,
      disposition: "CURRENT_TAB",
    }).catch((error) => {
      console.error("Failed to open search results with the default provider:", error);
    });
    return true;
  }

  console.error("chrome.search.query is not available in this context.");
  return false;
}

function runSearch(query) {
  const validation = validateUrl(query);

  if (validation.status === "valid") {
    window.location.href = validation.url.href;
    return;
  }

  if (validation.status === "malformed") {
    showSearchValidationFeedback(validation.message);
  }

  openDefaultSearch(query);
}

// Initialize search handling
function initSearchEngine() {
  if (isSearchHandlerBound) {
    return;
  }

  const searchInput = document.querySelector(".search-bar input");
  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("keydown", function (event) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const query = this.value.trim();
    if (!query) return;

    runSearch(query);
  });

  searchInput.addEventListener("input", clearSearchValidationFeedback);
  isSearchHandlerBound = true;
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
