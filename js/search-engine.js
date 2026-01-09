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
      <img src="${searchEngines[savedEngine].icon}" alt="${savedEngineName}" title="${savedEngineName}" />
      <span class="dropdown-arrow">▼</span>
    </div>
    <div class="engine-dropdown">
      ${Object.keys(searchEngines).map(key => {
        const name = window.i18n ? window.i18n.t(searchEngines[key].nameKey) : searchEngines[key].nameKey;
        return `
        <div class="engine-option" data-key="${key}" ${key === savedEngine ? 'id="selected"' : ''}>
          <img src="${searchEngines[key].icon}" alt="${name}" title="${name}" />
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
document.querySelector(".search-bar input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    const query = this.value.trim();
    if (!query) return;
    const selectedEngine = searchEngines[getSavedEngine()];
    if (query.includes(".")) {
      window.location.href = query.startsWith("http") ? query : `https://${query}`;
    } else {
      window.location.href = `${selectedEngine.url}${encodeURIComponent(query)}`;
    }
  }
});

// Initialize on page load
initSearchEngine();

// Expose for global access (used by language switching)
window.initSearchEngine = initSearchEngine;
