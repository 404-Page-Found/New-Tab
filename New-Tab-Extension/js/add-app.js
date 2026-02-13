// js/add-app.js - Add app modal and functionality

// Default apps list
const defaultAppsList = [];

// Render default apps list in modal
function renderDefaultAppsList() {
  const container = document.getElementById("default-apps-list");
  if (!container) return;
  container.innerHTML = "";
  // Cache existing app names
  const existingNames = new Set(Array.from(document.querySelectorAll(".app-icon .app-name")).map(e => e.textContent));
  for (let i = 0; i < defaultAppsList.length; i++) {
    const app = defaultAppsList[i];
    const btn = document.createElement("button");
    btn.style.display = "inline-flex";
    btn.style.alignItems = "center";
    btn.style.gap = "8px";
    btn.style.margin = "2px 4px 2px 0";
    btn.style.padding = "6px 12px";
    btn.style.border = "1px solid #ddd";
    btn.style.borderRadius = "8px";
    btn.style.background = "#f5f7fa";
    btn.style.cursor = "pointer";
    btn.innerHTML = app.icon
      ? `<img src="${app.icon}" alt="${app.name}" style="width:20px;height:20px;object-fit:contain;background:#f5f7fa;display:block;">`
      : `<span style='display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:6px;background:#fff;font-size:16px;font-weight:bold;'>T</span>` + `<span>${app.name}</span>`;
    btn.addEventListener("click", function () {
      if (existingNames.has(app.name)) return;
      const apps = JSON.parse(localStorage.getItem("customApps") || "[]");
      const id = 'custom-app-' + Date.now() + '-' + Math.floor(Math.random()*100000);
      apps.push({ id, url: app.url, name: app.name, icon: app.icon });
      localStorage.setItem("customApps", JSON.stringify(apps));
      let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
      if (!order) order = [];
      order.push(id);
      localStorage.setItem('appOrder', JSON.stringify(order));
      if (window.renderCustomApps) window.renderCustomApps();
      const modal = document.getElementById("add-app-modal");
      if (modal) modal.style.display = "none";
    });
    container.appendChild(btn);
  }
}

// Add App Modal
const addAppBtn = document.getElementById("new-app");
const addAppModal = document.getElementById("add-app-modal");
const addAppUrlInput = document.getElementById("add-app-url");
const addAppCancel = document.getElementById("add-app-cancel");
const addAppConfirm = document.getElementById("add-app-confirm");

// Open modal
if (addAppBtn && addAppModal && addAppUrlInput) {
  addAppBtn.addEventListener("click", function (e) {
    e.preventDefault();
    addAppModal.style.display = "flex";
    addAppUrlInput.value = "";
    addAppUrlInput.focus();
    renderDefaultAppsList();
  });

  // Close on outside click
  addAppModal.addEventListener("click", function (e) {
    if (e.target === addAppModal) addAppModal.style.display = "none";
  });

  // Cancel button
  if (addAppCancel) {
    addAppCancel.addEventListener("click", function () {
      addAppModal.style.display = "none";
    });
  }

  // Add app from input
  const addAppFromInput = (url) => {
    let name = url.replace(/^https?:\/\//, "").split("/")[0];
    const icon = window.getFavicon ? window.getFavicon(url) : url.replace(/^https?:\/\//, "").split("/")[0] + "/favicon.ico";
    const apps = JSON.parse(localStorage.getItem("customApps") || "[]");
    const id = 'custom-app-' + Date.now() + '-' + Math.floor(Math.random()*100000);
    apps.push({
      id,
      url: url.startsWith("http") ? url : "https://" + url,
      name,
      icon,
    });
    localStorage.setItem("customApps", JSON.stringify(apps));
    let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
    if (!order) order = [];
    order.push(id);
    localStorage.setItem('appOrder', JSON.stringify(order));
    if (window.renderCustomApps) window.renderCustomApps();
    addAppModal.style.display = "none";
  };

  // Enter key in input
  addAppUrlInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      const url = this.value.trim();
      if (!url) return;
      addAppFromInput(url);
    }
  });

  // Confirm button
  if (addAppConfirm) {
    addAppConfirm.addEventListener("click", function () {
      const url = addAppUrlInput.value.trim();
      if (!url) return;
      addAppFromInput(url);
    });
  }
}
