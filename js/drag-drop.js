// js/drag-drop.js - Drag and drop functionality for app grid

(function() {
  'use strict';

  // Drag state (using closure instead of global)
  let dragState = {
    sourceId: null,
    sourceElement: null,
    placeholder: null,
    dropIndex: -1
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

  // Get the grid's layout info for calculating positions
  function getGridLayout() {
    const grid = getAppGrid();
    if (!grid) return null;
    
    const style = window.getComputedStyle(grid);
    const gap = parseInt(style.gap) || 50;
    const paddingLeft = parseInt(style.paddingLeft) || 70;
    const paddingRight = parseInt(style.paddingRight) || 70;
    
    return {
      gap,
      paddingLeft,
      paddingRight,
      gridWidth: grid.offsetWidth - paddingLeft - paddingRight
    };
  }

  // Calculate the drop index based on mouse position
  function calculateDropIndex(e) {
    const grid = getAppGrid();
    const layout = getGridLayout();
    if (!grid || !layout) return -1;
    
    const icons = getDraggableIcons();
    if (icons.length === 0) return 0;
    
    // Get the first icon to calculate item dimensions
    const firstIcon = icons[0];
    const itemWidth = firstIcon.offsetWidth + layout.gap;
    const itemsPerRow = Math.floor(layout.gridWidth / itemWidth) || 1;
    
    // Get grid bounding rect
    const gridRect = grid.getBoundingClientRect();
    
    // Calculate position relative to grid
    const relativeX = e.clientX - gridRect.left - layout.paddingLeft;
    const relativeY = e.clientY - gridRect.top - grid.querySelector('.app-icon')?.offsetTop || 30;
    
    // Calculate row and column
    const col = Math.max(0, Math.floor(relativeX / itemWidth));
    const row = Math.max(0, Math.floor(relativeY / (firstIcon.offsetHeight + layout.gap)));
    
    // Calculate index
    let index = row * itemsPerRow + col;
    const maxIndex = icons.length - 1;
    
    // Clamp index - ensure placeholder never goes after the last draggable icon
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;
    
    return index;
  }

  // Create placeholder element
  function createPlaceholder(sourceElement) {
    const placeholder = document.createElement('div');
    placeholder.className = 'drag-placeholder';
    placeholder.style.width = sourceElement.offsetWidth + 'px';
    placeholder.style.height = sourceElement.offsetHeight + 'px';
    return placeholder;
  }

  // Insert placeholder at the calculated position
  function insertPlaceholder(index) {
    const grid = getAppGrid();
    const icons = getDraggableIcons();
    const addAppBtn = document.getElementById('new-app');
    
    // Remove existing placeholder
    removePlaceholder();
    
    // Create new placeholder if needed
    if (!dragState.placeholder) {
      dragState.placeholder = createPlaceholder(dragState.sourceElement);
    }
    
    // Ensure we never place placeholder after the add app button
    // Clamp index to valid range
    const maxIndex = Math.min(index, icons.length - 1);
    
    // Insert at the appropriate position
    if (maxIndex < 0 || icons.length === 0) {
      // No icons yet, insert before add app button
      if (addAppBtn) {
        grid.insertBefore(dragState.placeholder, addAppBtn);
      } else {
        grid.appendChild(dragState.placeholder);
      }
    } else if (maxIndex === 0) {
      grid.insertBefore(dragState.placeholder, icons[0]);
    } else {
      // Find the icon at the target index
      const targetIcon = icons[maxIndex];
      grid.insertBefore(dragState.placeholder, targetIcon);
    }
    
    // Animate other icons to dodge
    animateDodging(index);
    
    dragState.dropIndex = index;
  }

  // Animate icons to dodge around the placeholder
  function animateDodging(placeholderIndex) {
    const icons = getDraggableIcons();
    const placeholder = dragState.placeholder;
    
    icons.forEach((icon, idx) => {
      // Skip the source element - don't change its opacity
      if (icon.id === dragState.sourceId) {
        return;
      }
      
      icon.style.opacity = '1';
    });
  }

  // Remove placeholder
  function removePlaceholder() {
    if (dragState.placeholder && dragState.placeholder.parentNode) {
      dragState.placeholder.parentNode.removeChild(dragState.placeholder);
    }
    dragState.dropIndex = -1;
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
    target.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', target.id);
    
    // Set drag image at the position where the user clicked inside the element
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setDragImage(target, offsetX, offsetY);
    
    // Add global drag over listener for calculating drop position
    document.addEventListener('dragover', handleGlobalDragOver);
  }

  // Handle global drag over for placeholder positioning
  function handleGlobalDragOver(e) {
    e.preventDefault();
    const newIndex = calculateDropIndex(e);
    
    if (newIndex !== dragState.dropIndex && newIndex >= 0) {
      insertPlaceholder(newIndex);
    }
  }

  // Drag end handler
  function handleDragEnd(e, target) {
    target.classList.remove('dragging');
    target.style.opacity = '1';
    
    // Clean up any remaining drag-over classes
    getDraggableIcons().forEach(icon => {
      icon.classList.remove('drag-over');
      icon.style.opacity = '1';
    });
    
    // Remove placeholder
    removePlaceholder();
    
    // Remove global drag over listener
    document.removeEventListener('dragover', handleGlobalDragOver);
    
    // Reset state
    dragState.sourceId = null;
    dragState.sourceElement = null;
    dragState.placeholder = null;
  }

  // Drag over handler
  function handleDragOver(e, target) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Only add class if not dragging the same element
    if (target.id !== dragState.sourceId) {
      target.classList.add('drag-over');
    }
    
    // Update placeholder position based on target
    const icons = getDraggableIcons();
    const targetIndex = icons.indexOf(target);
    
    if (targetIndex !== -1 && targetIndex !== dragState.dropIndex) {
      insertPlaceholder(targetIndex);
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
    
    // Use the calculated drop index
    let toIdx = dragState.dropIndex;
    const fromIdx = order.indexOf(sourceId);
    
    // If no placeholder was created, fall back to target-based index
    if (toIdx === -1) {
      toIdx = order.indexOf(targetId);
    }
    
    // Both elements must be in the order array
    if (fromIdx === -1 || toIdx === -1) {
      return;
    }
    
    // Adjust index if moving forward
    let adjustedToIdx = toIdx;
    if (fromIdx < toIdx) {
      adjustedToIdx = toIdx - 1;
    }
    
    // Create new order
    const newOrder = order.slice();
    const [movedItem] = newOrder.splice(fromIdx, 1);
    newOrder.splice(adjustedToIdx, 0, movedItem);
    
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
