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
renameItem.setAttribute('data-i18n', 'renameApp');
renameItem.textContent = "Rename";

const changeThumbnailItem = document.createElement("div");
changeThumbnailItem.id = "change-thumbnail";
changeThumbnailItem.className = "context-menu-item";
changeThumbnailItem.setAttribute('data-i18n', 'changeThumbnail');
changeThumbnailItem.textContent = "Change Thumbnail";

const deleteItem = document.createElement("div");
deleteItem.id = "delete-app";
deleteItem.className = "context-menu-item delete-item";
deleteItem.setAttribute('data-i18n', 'deleteApp');
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
    document.body.classList.add("context-menu-open");
  }
});

// Hide context menu when clicking elsewhere
document.addEventListener("click", function (e) {
  if (!contextMenu.contains(e.target) && e.button !== 2) {
    contextMenu.style.display = "none";
    document.body.classList.remove("context-menu-open");
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
  
  // Store the app index for the modal handler
  window.renameAppIdx = idx;
  
  // Set the current name in the input
  document.getElementById('rename-app-input').value = currentApp.name;
  
  // Show the rename modal
  document.getElementById('rename-app-modal').style.display = 'flex';
  
  // Focus the input
  setTimeout(() => {
    document.getElementById('rename-app-input').focus();
    document.getElementById('rename-app-input').select();
  }, 100);
  
  contextMenu.style.display = "none";
  document.body.classList.remove("context-menu-open");
});

// Rename modal event handlers
document.addEventListener('DOMContentLoaded', function() {
  const renameModal = document.getElementById('rename-app-modal');
  const renameInput = document.getElementById('rename-app-input');
  const renameCancel = document.getElementById('rename-app-cancel');
  const renameConfirm = document.getElementById('rename-app-confirm');
  
  if (renameModal && renameInput && renameCancel && renameConfirm) {
    // Close modal on cancel button
    renameCancel.addEventListener('click', function() {
      renameModal.style.display = 'none';
      window.renameAppIdx = -1;
    });
    
    // Close modal on confirm
    renameConfirm.addEventListener('click', function() {
      const newName = renameInput.value.trim();
      if (newName && window.renameAppIdx !== -1) {
        const apps = JSON.parse(localStorage.getItem("customApps") || "[]");
        if (apps[window.renameAppIdx]) {
          apps[window.renameAppIdx].name = newName;
          localStorage.setItem("customApps", JSON.stringify(apps));
          if (window.renderCustomApps) window.renderCustomApps();
        }
      }
      renameModal.style.display = 'none';
      window.renameAppIdx = -1;
    });
    
    // Close modal on Enter key in input
    renameInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        renameConfirm.click();
      }
    });
    
    // Close modal on backdrop click
    renameModal.addEventListener('click', function(e) {
      if (e.target === renameModal) {
        renameModal.style.display = 'none';
        window.renameAppIdx = -1;
      }
    });
  }
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
  
  // Store the app index and app data for the modal handler
  window.thumbnailAppIdx = idx;
  
  // Set the current icon URL in the input
  document.getElementById('thumbnail-app-input').value = currentApp.icon || '';
  
  // Update the preview
  const previewIcon = document.getElementById('thumbnail-preview-icon');
  const previewName = document.getElementById('thumbnail-preview-name');
  if (currentApp.icon) {
    previewIcon.innerHTML = `<img src="${currentApp.icon}" alt="Icon" onerror="this.parentElement.innerHTML='<svg viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'1.5\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'></rect><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'></circle><polyline points=\'21,15 16,10 5,21\'></polyline></svg>'">`;
  } else {
    previewIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21,15 16,10 5,21"></polyline></svg>`;
  }
  previewName.textContent = currentApp.name;
  
  // Show the thumbnail modal
  document.getElementById('thumbnail-app-modal').style.display = 'flex';
  
  // Focus the input
  setTimeout(() => {
    document.getElementById('thumbnail-app-input').focus();
  }, 100);
  
  contextMenu.style.display = "none";
  document.body.classList.remove("context-menu-open");
});

// Thumbnail modal event handlers
document.addEventListener('DOMContentLoaded', function() {
  const thumbnailModal = document.getElementById('thumbnail-app-modal');
  const thumbnailInput = document.getElementById('thumbnail-app-input');
  const thumbnailCancel = document.getElementById('thumbnail-app-cancel');
  const thumbnailConfirm = document.getElementById('thumbnail-app-confirm');
  
  if (thumbnailModal && thumbnailInput && thumbnailCancel && thumbnailConfirm) {
    // Close modal on cancel button
    thumbnailCancel.addEventListener('click', function() {
      thumbnailModal.style.display = 'none';
      window.thumbnailAppIdx = -1;
    });
    
    // Update preview when input changes
    thumbnailInput.addEventListener('input', function() {
      const iconUrl = this.value.trim();
      const previewIcon = document.getElementById('thumbnail-preview-icon');
      if (iconUrl) {
        previewIcon.innerHTML = `<img src="${iconUrl}" alt="Icon" onerror="this.parentElement.innerHTML='<svg viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'1.5\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'></rect><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'></circle><polyline points=\'21,15 16,10 5,21\'></polyline></svg>'">`;
      } else {
        previewIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21,15 16,10 5,21"></polyline></svg>`;
      }
    });
    
    // Close modal on confirm
    thumbnailConfirm.addEventListener('click', function() {
      const newIcon = thumbnailInput.value.trim();
      if (newIcon && window.thumbnailAppIdx !== -1) {
        try {
          const apps = JSON.parse(localStorage.getItem("customApps") || "[]");
          if (apps[window.thumbnailAppIdx]) {
            apps[window.thumbnailAppIdx].icon = newIcon;
            delete apps[window.thumbnailAppIdx].cachedIcon;
            localStorage.setItem("customApps", JSON.stringify(apps));
            if (window.renderCustomApps) window.renderCustomApps();
          }
        } catch (e) {
          console.error("Failed to update custom app thumbnail:", e);
        }
      }
      thumbnailModal.style.display = 'none';
      window.thumbnailAppIdx = -1;
    });
    
    // Close modal on Enter key in input
    thumbnailInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        thumbnailConfirm.click();
      }
    });
    
    // Close modal on backdrop click
    thumbnailModal.addEventListener('click', function(e) {
      if (e.target === thumbnailModal) {
        thumbnailModal.style.display = 'none';
        window.thumbnailAppIdx = -1;
      }
    });
  }
});

// Delete functionality
document.getElementById("delete-app").addEventListener("click", function () {
  if (currentAppIndex === -1) return;
  // Find by persistent id
  let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
  const id = order.filter(id => id.startsWith('custom-app-'))[currentAppIndex];
  let apps = JSON.parse(localStorage.getItem("customApps") || "[]");
  const idx = apps.findIndex(app => app.id === id);
  if (idx === -1) return;
  const currentApp = apps[idx];
  
  // Store the app index and app data for the modal handler
  window.deleteAppIdx = idx;
  
  // Update the delete preview
  const previewIcon = document.getElementById('delete-preview-icon');
  const previewName = document.getElementById('delete-preview-name');
  if (currentApp.icon) {
    previewIcon.innerHTML = `<img src="${currentApp.icon}" alt="Icon" onerror="this.parentElement.innerHTML='<svg viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'1.5\'><rect x=\'3\' y=\'3\' width=\'18\' height=\'18\' rx=\'2\' ry=\'2\'></rect><circle cx=\'8.5\' cy=\'8.5\' r=\'1.5\'></circle><polyline points=\'21,15 16,10 5,21\'></polyline></svg>'">`;
  } else {
    previewIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21,15 16,10 5,21"></polyline></svg>`;
  }
  previewName.textContent = currentApp.name;
  
  // Show the delete modal
  document.getElementById('delete-app-modal').style.display = 'flex';
  
  contextMenu.style.display = "none";
  document.body.classList.remove("context-menu-open");
});

// Delete modal event handlers
document.addEventListener('DOMContentLoaded', function() {
  const deleteModal = document.getElementById('delete-app-modal');
  const deleteCancel = document.getElementById('delete-app-cancel');
  const deleteConfirm = document.getElementById('delete-app-confirm');
  
  if (deleteModal && deleteCancel && deleteConfirm) {
    // Close modal on cancel button
    deleteCancel.addEventListener('click', function() {
      deleteModal.style.display = 'none';
      window.deleteAppIdx = -1;
    });
    
    // Delete on confirm
    deleteConfirm.addEventListener('click', function() {
      if (window.deleteAppIdx !== -1) {
        let apps = JSON.parse(localStorage.getItem("customApps") || "[]");
        let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
        
        if (apps[window.deleteAppIdx]) {
          const id = apps[window.deleteAppIdx].id;
          apps.splice(window.deleteAppIdx, 1);
          localStorage.setItem("customApps", JSON.stringify(apps));
          
          // Remove from order
          order = order.filter(oid => oid !== id);
          localStorage.setItem('appOrder', JSON.stringify(order));
          
          if (window.renderCustomApps) window.renderCustomApps();
        }
      }
      deleteModal.style.display = 'none';
      window.deleteAppIdx = -1;
    });
    
    // Close modal on backdrop click
    deleteModal.addEventListener('click', function(e) {
      if (e.target === deleteModal) {
        deleteModal.style.display = 'none';
        window.deleteAppIdx = -1;
      }
    });
  }
});

// Initialize modal indices
window.renameAppIdx = -1;
window.thumbnailAppIdx = -1;
window.deleteAppIdx = -1;

// Prevent default context menu on default apps
document.addEventListener("contextmenu", function (e) {
  const appIcon = e.target.closest(".app-icon.default-app");
  if (appIcon) {
    e.preventDefault();
  }
});
