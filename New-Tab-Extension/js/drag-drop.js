// js/drag-drop.js - Drag and drop functionality for app grid

// Drag and drop logic
let dragSrcId = null;
function handleDragEvent(e) {
  const type = e.type;
  if (type === 'dragstart') {
    dragSrcId = this.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  } else if (type === 'dragend') {
    this.classList.remove('dragging');
  } else if (type === 'dragover') {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
  } else if (type === 'dragleave') {
    this.classList.remove('drag-over');
  } else if (type === 'drop') {
    e.stopPropagation();
    this.classList.remove('drag-over');
    if (dragSrcId === this.id) return;
    let order = JSON.parse(localStorage.getItem('appOrder') || 'null');
    const fromIdx = order.indexOf(dragSrcId);
    const toIdx = order.indexOf(this.id);
    if (fromIdx === -1 || toIdx === -1) return;
    const oldOrder = order.slice();
    order.splice(toIdx, 0, order.splice(fromIdx, 1)[0]);
    localStorage.setItem('appOrder', JSON.stringify(order));
    window.renderAllApps(); // Assuming renderAllApps is available globally
    attachDnDEvents();
    if (JSON.stringify(order) !== JSON.stringify(oldOrder)) {
      setTimeout(() => location.reload(), 300);
    }
  }
}

// Attach drag and drop events
function attachDnDEvents() {
  const draggableIcons = Array.from(document.querySelectorAll('.app-grid .app-icon')).filter(icon => icon.id !== 'add-app');
  draggableIcons.forEach(icon => {
    ['dragstart','dragend','dragover','dragleave','drop'].forEach(evt => icon.addEventListener(evt, handleDragEvent));
  });
}

// Initial attach
attachDnDEvents();
