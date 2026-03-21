// js/drag-drop.js - Enhanced drag and drop with glassy ghost outline and smooth animations

let dragSrcEl = null;
let dragSrcId = null;

function clearDragStates() {
  document.querySelectorAll('.app-icon.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleDragEvent(e) {
  const type = e.type;

  if (type === 'dragstart') {
    dragSrcEl = this;
    dragSrcId = this.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.id);
    // Delay adding class so browser captures a clean drag image first
    requestAnimationFrame(() => {
      this.classList.add('dragging');
    });
  }

  else if (type === 'dragend') {
    this.classList.remove('dragging');
    clearDragStates();
    dragSrcEl = null;
    dragSrcId = null;
  }

  else if (type === 'dragover') {
    if (this === dragSrcEl || this.id === 'new-app') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Highlight only the current target with glassy ghost outline
    if (!this.classList.contains('drag-over')) {
      clearDragStates();
      this.classList.add('drag-over');
    }
  }

  else if (type === 'dragleave') {
    // Only remove highlight when truly leaving (not moving to a child element)
    if (!this.contains(e.relatedTarget)) {
      this.classList.remove('drag-over');
    }
  }

  else if (type === 'drop') {
    e.stopPropagation();
    e.preventDefault();
    clearDragStates();

    if (!dragSrcEl || dragSrcId === this.id || this.id === 'new-app') return;

    let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
    if (!order) return;

    const fromIdx = order.indexOf(dragSrcId);
    const toIdx = order.indexOf(this.id);
    if (fromIdx === -1 || toIdx === -1) return;

    // Update order in storage
    order.splice(toIdx, 0, order.splice(fromIdx, 1)[0]);
    localStorage.setItem('appOrder', JSON.stringify(order));

    // Clean up dragging state before re-render
    dragSrcEl.classList.remove('dragging');

    // Re-render grid and re-attach events (no page reload for snappy feel)
    window.renderAllApps();
    attachDnDEvents();

    // Add bounce landing animation to the moved element
    const movedEl = document.getElementById(dragSrcId);
    if (movedEl) {
      movedEl.classList.add('drag-drop-landed');
      movedEl.addEventListener('animationend', function onEnd() {
        movedEl.classList.remove('drag-drop-landed');
        movedEl.removeEventListener('animationend', onEnd);
      });
    }
  }
}

// Attach drag and drop events (safe to call multiple times)
function attachDnDEvents() {
  const draggableIcons = Array.from(document.querySelectorAll('.app-grid .app-icon')).filter(icon => icon.id !== 'new-app');
  draggableIcons.forEach(icon => {
    // Remove old listeners to prevent stacking
    ['dragstart', 'dragend', 'dragover', 'dragleave', 'drop'].forEach(evt => {
      icon.removeEventListener(evt, handleDragEvent);
      icon.addEventListener(evt, handleDragEvent);
    });
  });
}

// Initial attach
attachDnDEvents();
