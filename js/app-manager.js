// js/app-manager.js - App grid management, drag and drop

// Helper functions
const getDraggableAppIcons = () => Array.from(document.querySelectorAll('.app-grid .app-icon')).filter(icon => icon.id !== 'new-app');
const getAppOrder = () => JSON.parse(localStorage.getItem('appOrder') || 'null');
const saveAppOrder = order => localStorage.setItem('appOrder', JSON.stringify(order));

// Load custom apps from localStorage
function loadCustomApps() {
  return JSON.parse(localStorage.getItem("customApps") || "[]");
}
function saveCustomApps(apps) {
  localStorage.setItem("customApps", JSON.stringify(apps));
}

// Get favicon URL from website URL
function getFavicon(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.origin + "/favicon.ico";
  } catch {
    return "";
  }
}

// Default apps
const defaultApps = [
  { id: 'feedback-app', name: 'Feedback', url: 'https://github.com/404-Page-Found/New-Tab/issues/new', icon: 'images/icons/feedback.svg', className: 'default-app' },
  { id: 'settings-app', name: 'Settings', url: '#', icon: 'images/icons/settings.svg', className: 'default-app' },
];

// Get all apps data
const getAllAppData = () => {
  const customApps = loadCustomApps().map(app => ({ ...app, className: 'custom-app' }));
  return [...defaultApps, ...customApps];
};

// Render the app grid
function renderAllApps() {
  const appGrid = document.getElementById('app-grid');
const addApp = document.getElementById('new-app');
  // Remove all except New
  Array.from(appGrid.children).forEach(child => { if (child.id !== 'new-app') appGrid.removeChild(child); });
  let order = getAppOrder();
  const allApps = getAllAppData();
  if (!order || order.length !== allApps.length) {
    order = allApps.map(app => app.id);
    saveAppOrder(order);
  }
  const appMap = Object.fromEntries(allApps.map(app => [app.id, app]));
  order.forEach(appId => {
    const app = appMap[appId];
    if (!app) return;
    const a = document.createElement('a');
    a.href = app.url;
    a.className = 'app-icon ' + app.className;
    a.id = app.id;
    a.draggable = true;
    if (app.className === 'custom-app') {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    // Load icon from external file (use images/icons/feedback.svg) rather than embedding inline SVG in JS.
    // The SVG file (`images/icons/feedback.svg`) uses `currentColor` where appropriate.
    let iconHtml = `<div class="icon"><img src="${app.icon}" alt="${app.name}" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/globe.svg';"></div>`;
    a.innerHTML = iconHtml + `<span class="app-name">${app.name}</span>`;
    appGrid.insertBefore(a, addApp);
  });
}

// Initial render
renderAllApps();

// Re-render function (export for other modules)
window.renderCustomApps = renderAllApps;

// Load and apply open in new tab setting
function loadOpenNewTabSetting() {
  return localStorage.getItem("openAppsInNewTab") !== "false";
}
function applyOpenNewTabSetting() {
  const openInNewTab = loadOpenNewTabSetting();
  const appLinks = document.querySelectorAll(".app-grid .app-icon");
  appLinks.forEach((link) => {
    if (link.id === "settings-app") return;
    if (openInNewTab) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    } else {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  });
  const openNewTabSetting = document.getElementById("open-new-tab-setting");
  if (openNewTabSetting) openNewTabSetting.checked = openInNewTab;
}
const openNewTabSetting = document.getElementById("open-new-tab-setting");
if (openNewTabSetting) {
  openNewTabSetting.addEventListener("change", function () {
    localStorage.setItem("openAppsInNewTab", this.checked);
    applyOpenNewTabSetting();
  });
}

// Apply on load
applyOpenNewTabSetting();

// Load and apply icon size
function loadIconSize() {
  return parseInt(localStorage.getItem("iconSize") || "60");
}
function applyIconSize() {
  const size = loadIconSize();
  document.documentElement.style.setProperty('--app-icon-size', size + 'px');
  // Also update icon radius if curvature is set
  applyCurvature();

  // Update slider
  const iconSizePicker = document.getElementById("icon-size-picker");
  if (iconSizePicker && iconSizePicker.value !== size.toString()) {
    iconSizePicker.value = size;
  }
}
const iconSizePicker = document.getElementById("icon-size-picker");
if (iconSizePicker) {
  iconSizePicker.addEventListener("input", function () {
    let val = parseInt(this.value);
    if (val < 40) val = 40;
    if (val > 100) val = 100;
    localStorage.setItem("iconSize", val);
    applyIconSize();
  });
}

// Reset icon size
function resetIconSize() {
  localStorage.removeItem("iconSize");
  applyIconSize();
}
const iconSizeReset = document.getElementById("icon-size-reset");
if (iconSizeReset) {
  iconSizeReset.addEventListener("click", resetIconSize);
}

// Load and apply app button curvature (now relative to icon size)
function loadCurvature() {
  return localStorage.getItem("appsButtonCurvature") || "20";
}
function applyCurvature() {
  const baseRadius = parseInt(loadCurvature());
  const size = loadIconSize();
  const actualRadius = size * (baseRadius / 60);
  document.documentElement.style.setProperty('--icon-radius', actualRadius + 'px');

  // Update radio button selection
  const curvatureRadios = document.querySelectorAll('input[name="curvature"]');
  curvatureRadios.forEach((radio) => {
    radio.checked = radio.value === baseRadius.toString();
  });
}
const curvatureRadios = document.querySelectorAll('input[name="curvature"]');
curvatureRadios.forEach((radio) => {
  radio.addEventListener("change", function () {
    if (this.checked) {
      localStorage.setItem("appsButtonCurvature", this.value);
      applyCurvature();
    }
  });
});
applyCurvature();





// Settings app click
const settingsApp = document.getElementById("settings-app");
if (settingsApp) {
  const settingsModal = document.getElementById("settings-modal");
  settingsApp.addEventListener("click", function (e) {
    e.preventDefault();
    settingsModal.style.display = "flex";
  });
  // Close modal on outside click
  settingsModal.addEventListener("click", function (e) {
    if (e.target === settingsModal) settingsModal.style.display = "none";
  });
}
