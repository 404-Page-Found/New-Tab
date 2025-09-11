// js/context-menu.js - Right-click context menu for custom apps

let currentAppIndex = -1;

// Create context menu element
const contextMenu = document.createElement("div");
contextMenu.id = "app-context-menu";
contextMenu.className = "app-context-menu";

// Menu items
const renameItem = document.createElement("div");
renameItem.id = "rename-app";
renameItem.className = "context-menu-item";
renameItem.textContent = "Rename";

const changeThumbnailItem = document.createElement("div");
changeThumbnailItem.id = "change-thumbnail";
changeThumbnailItem.className = "context-menu-item";
changeThumbnailItem.textContent = "Change Thumbnail";

const deleteItem = document.createElement("div");
deleteItem.id = "delete-app";
deleteItem.className = "context-menu-item delete-item";
deleteItem.textContent = "Delete";

// Add hover effects
[renameItem, changeThumbnailItem, deleteItem].forEach((item) => {
  item.addEventListener("mouseenter", () => item.classList.add("hover"));
  item.addEventListener("mouseleave", () => item.classList.remove("hover"));
});

contextMenu.appendChild(renameItem);
contextMenu.appendChild(changeThumbnailItem);
contextMenu.appendChild(deleteItem);
document.body.appendChild(contextMenu);

// Right-click to show context menu
document.addEventListener("contextmenu", function (e) {
  const appIcon = e.target.closest(".app-icon.custom-app");
  if (appIcon) {
    e.preventDefault();

    // Find the index of this app
    const appGrid = document.querySelector(".app-grid");
    const apps = Array.from(appGrid.querySelectorAll(".app-icon.custom-app"));
    currentAppIndex = apps.indexOf(appIcon);

    // Position and show context menu
    let left = e.pageX;
    let top = e.pageY;

    if (left + 160 > window.innerWidth) {
      left = window.innerWidth - 160 - 10;
    }

    if (top + 100 > window.innerHeight) {
      top = window.innerHeight - 100 - 10;
    }

    contextMenu.style.left = left + "px";
    contextMenu.style.top = top + "px";
    contextMenu.style.display = "block";
  }
});

// Hide context menu when clicking elsewhere
document.addEventListener("click", function (e) {
  if (!contextMenu.contains(e.target) && e.button !== 2) {
    contextMenu.style.display = "none";
  }
});

// Rename functionality
document.getElementById("rename-app").addEventListener("click", function () {
  if (currentAppIndex === -1) return;
  // Find by persistent id
  const order = JSON.parse(localStorage.getItem('appOrder') || 'null');
  const id = order.filter(id => id.startsWith('custom-app-'))[currentAppIndex];
  const apps = JSON.parse(localStorage.getItem("customApps") || "[]");
  const idx = apps.findIndex(app => app.id === id);
  if (idx === -1) return;
  const currentApp = apps[idx];
  const newName = prompt("Enter new name:", currentApp.name);
  if (newName && newName.trim() !== "") {
    apps[idx].name = newName.trim();
    localStorage.setItem("customApps", JSON.stringify(apps));
    if (window.renderCustomApps) window.renderCustomApps();
    location.reload();
  }
  contextMenu.style.display = "none";
});

// Change thumbnail functionality
document.getElementById("change-thumbnail").addEventListener("click", function () {
  if (currentAppIndex === -1) return;
  // Find by persistent id
  const order = JSON.parse(localStorage.getItem('appOrder') || 'null');
  const id = order.filter(id => id.startsWith('custom-app-'))[currentAppIndex];
  const apps = JSON.parse(localStorage.getItem("customApps") || "[]");
  const idx = apps.findIndex(app => app.id === id);
  if (idx === -1) return;
  const currentApp = apps[idx];
  const newIcon = prompt("Enter new icon URL:", currentApp.icon);
  if (newIcon && newIcon.trim() !== "") {
    apps[idx].icon = newIcon.trim();
    localStorage.setItem("customApps", JSON.stringify(apps));
    if (window.renderCustomApps) window.renderCustomApps();
    location.reload();
  }
  contextMenu.style.display = "none";
});

// Delete functionality
document.getElementById("delete-app").addEventListener("click", function () {
  if (currentAppIndex === -1) return;
  if (confirm("Are you sure you want to delete this app?")) {
    // Find by persistent id
    let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
    const id = order.filter(id => id.startsWith('custom-app-'))[currentAppIndex];
    let apps = JSON.parse(localStorage.getItem("customApps") || "[]");
    const idx = apps.findIndex(app => app.id === id);
    if (idx === -1) return;
    apps.splice(idx, 1);
    localStorage.setItem("customApps", JSON.stringify(apps));
    // Remove from order
    order = order.filter(oid => oid !== id);
    localStorage.setItem('appOrder', JSON.stringify(order));
    if (window.renderCustomApps) window.renderCustomApps();
    location.reload();
  }
  contextMenu.style.display = "none";
});

// Prevent default context menu on default apps
document.addEventListener("contextmenu", function (e) {
  const appIcon = e.target.closest(".app-icon.default-app");
  if (appIcon) {
    e.preventDefault();
  }
});
