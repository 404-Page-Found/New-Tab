// js/drag-drop.js - Drag and drop functionality for app grid

(function() {
  'use strict';

  // Drag state (using closure instead of global)
  let dragState = {
    sourceId: null,
    sourceElement: null
  };

  // Get container element
  function getAppGrid() {
    return document.getElementById('app-grid');
  }

  // Get all draggable app icons (excluding add-app button)
  function getDraggableIcons() {
    const grid = getAppGrid();
    if (!grid) return [];
    return Array.from(grid.querySelectorAll('.app-icon')).filter(
      icon => icon.id !== 'new-app' && icon.id !== 'add-app'
    );
  }

  // Handle drag events using event delegation
  function handleDragEvent(e) {
    const type = e.type;
    const target = e.target.closest('.app-icon');
    
    if (!target || target.id === 'new-app' || target.id === 'add-app') {
      return;
    }

    switch (type) {
      case 'dragstart':
        handleDragStart(e, target);
        break;
      case 'dragend':
        handleDragEnd(e, target);
        break;
      case 'dragover':
        handleDragOver(e, target);
        break;
      case 'dragleave':
        handleDragLeave(e, target);
        break;
      case 'drop':
        handleDrop(e, target);
        break;
    }
  }

  // Drag start handler
  function handleDragStart(e, target) {
    dragState.sourceId = target.id;
    dragState.sourceElement = target;
    
    target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', target.id);
    
    // Set drag image (optional, can be customized)
    e.dataTransfer.setDragImage(target, 0, 0);
  }

  // Drag end handler
  function handleDragEnd(e, target) {
    target.classList.remove('dragging');
    
    // Clean up any remaining drag-over classes
    getDraggableIcons().forEach(icon => {
      icon.classList.remove('drag-over');
    });
    
    // Reset state
    dragState.sourceId = null;
    dragState.sourceElement = null;
  }

  // Drag over handler
  function handleDragOver(e, target) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only add class if not dragging the same element
    if (target.id !== dragState.sourceId) {
      target.classList.add('drag-over');
    }
  }

  // Drag leave handler
  function handleDragLeave(e, target) {
    target.classList.remove('drag-over');
  }

  // Drop handler
  function handleDrop(e, target) {
    e.preventDefault();
    e.stopPropagation();
    
    target.classList.remove('drag-over');
    
    const sourceId = dragState.sourceId;
    const targetId = target.id;
    
    // Don't do anything if dropped on same element
    if (!sourceId || sourceId === targetId) {
      return;
    }
    
    // Get current order from localStorage
    let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
    if (!order) {
      return;
    }
    
    const fromIdx = order.indexOf(sourceId);
    const toIdx = order.indexOf(targetId);
    
    // Both elements must be in the order array
    if (fromIdx === -1 || toIdx === -1) {
      return;
    }
    
    // Create new order
    const newOrder = order.slice();
    newOrder.splice(toIdx, 0, newOrder.splice(fromIdx, 1)[0]);
    
    // Save new order
    localStorage.setItem('appOrder', JSON.stringify(newOrder));
    
    // Re-render apps (instead of reloading page)
    if (typeof window.renderAllApps === 'function') {
      window.renderAllApps();
    }
  }

  // Attach event listeners to the container (event delegation)
  function attachDnDEvents() {
    const grid = getAppGrid();
    if (!grid) {
      console.warn('App grid not found');
      return;
    }
    
    // Use event delegation - attach single listener to container
    const events = ['dragstart', 'dragend', 'dragover', 'dragleave', 'drop'];
    
    events.forEach(eventType => {
      grid.addEventListener(eventType, handleDragEvent, false);
    });
  }

  // Initialize drag and drop
  function init() {
    attachDnDEvents();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for external use if needed
  window.DnD = {
    refresh: attachDnDEvents
  };

})();
