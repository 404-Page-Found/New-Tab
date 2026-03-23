// js/todo.js - Modern Todo List Functionality

// State management
let todos = [];
let filteredTodos = [];
let currentFilters = {
  status: 'all'
};

// Animation config
const STAGGER_DELAY = 0.05; // seconds between each item

// DOM elements
let elements = {};

// Edit modal state
let editModalState = {
  currentTodoId: null,
  isOpen: false
};

// Load todos from localStorage
function loadTodos() {
  return JSON.parse(localStorage.getItem("todos") || "[]");
}

// Save todos to localStorage
function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Generate unique ID for todos
function generateTodoId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Date utilities

// Date utilities
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const currentLang = window.i18n ? window.i18n.currentLanguage() : 'en';
  const locale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

function isOverdue(dateString) {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}


// Filtering and sorting
function filterTodos() {
  let filtered = [...todos];

  // Status filter
  if (currentFilters.status !== 'all') {
    filtered = filtered.filter(todo => {
      switch (currentFilters.status) {
        case 'pending':
          return !todo.completed;
        case 'completed':
          return todo.completed;
        case 'overdue':
          return !todo.completed && todo.dueDate && isOverdue(todo.dueDate);
        default:
          return true;
      }
    });
  }

  // Sort: incomplete items first (by order), then completed items (by completion time)
  filtered.sort((a, b) => {
    // If both are incomplete, sort by order (original position)
    if (!a.completed && !b.completed) {
      const orderA = a.order !== undefined ? a.order : new Date(a.createdAt).getTime();
      const orderB = b.order !== undefined ? b.order : new Date(b.createdAt).getTime();
      return orderA - orderB;
    }
    
    // If both are completed, sort by completion time (chronological)
    if (a.completed && b.completed) {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeA - timeB;
    }
    
    // Incomplete items come first
    if (!a.completed && b.completed) return -1;
    if (a.completed && !b.completed) return 1;
    
    return 0;
  });

  filteredTodos = filtered;
  return filtered;
}

// Render the todo list with FLIP animation for smooth reordering
function renderTodos() {
  const todoList = elements.todoList;
  const emptyState = elements.emptyState;

  if (!todoList || !emptyState) return;

  // Get existing element positions (First step of FLIP)
  const existingItems = {};
  todoList.querySelectorAll('.todo-item').forEach(item => {
    const rect = item.getBoundingClientRect();
    existingItems[item.dataset.id] = {
      top: rect.top,
      left: rect.left
    };
  });

  // Clear existing list
  todoList.innerHTML = '';

  // Show/hide empty state
  if (filteredTodos.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  // Render each todo with staggered animation
  filteredTodos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.dueDate && isOverdue(todo.dueDate) ? 'overdue' : ''}`;
    li.dataset.id = todo.id;
    li.draggable = true;

    // Format due date if exists
    const dueDateHtml = todo.dueDate ? `
      <div class="todo-due-date ${isOverdue(todo.dueDate) ? 'overdue' : ''}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span class="due-date-text">${formatDate(todo.dueDate)}</span>
      </div>
    ` : '';

    li.innerHTML = `
      <div class="todo-bullet" data-id="${todo.id}">
        ${todo.completed ? `
          <svg viewBox="0 0 24 24" fill="none" class="bullet-checked">
            <circle cx="12" cy="12" r="10" fill="currentColor"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        ` : `
          <svg viewBox="0 0 24 24" fill="none" class="bullet-unchecked">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        `}
      </div>
      <div class="todo-content">
        <p class="todo-text">${todo.text}</p>
        <div class="todo-meta">
          ${dueDateHtml}
        </div>
      </div>
      <div class="todo-actions">
        <button class="todo-edit-btn" data-id="${todo.id}" title="Edit Todo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="todo-delete-btn" data-id="${todo.id}" title="Delete Todo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;

    // Add staggered animation delay
    li.style.animationDelay = `${index * STAGGER_DELAY}s`;
    li.setAttribute('data-animation', 'enter');

    todoList.appendChild(li);
  });

  // Apply FLIP animation for reordering
  requestAnimationFrame(() => {
    todoList.querySelectorAll('.todo-item').forEach(item => {
      const id = item.dataset.id;
      if (existingItems[id]) {
        const newRect = item.getBoundingClientRect();
        const oldPos = existingItems[id];
        const deltaY = oldPos.top - newRect.top;
        const deltaX = oldPos.left - newRect.left;

        // If position changed, apply flip animation
        if (deltaY !== 0 || deltaX !== 0) {
          // Invert: move item back to original position
          item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          item.style.transition = 'none';

          // Play: animate to new position
          requestAnimationFrame(() => {
            item.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            item.style.transform = '';
          });
        }
      }
    });
  });
}

// Add a new todo
function addTodo(text, dueDate = null) {
  if (!text.trim()) return;

  // Find the maximum order value among existing todos
  const maxOrder = todos.reduce((max, todo) => {
    return todo.order !== undefined ? Math.max(max, todo.order) : max;
  }, -1);

  const newTodo = {
    id: generateTodoId(),
    text: text.trim(),
    completed: false,
    completedAt: null, // Track when todo was completed
    dueDate: dueDate,
    createdAt: new Date().toISOString(),
    order: maxOrder + 1 // Add order property to track position (always at the end)
  };

  todos.push(newTodo);
  saveTodos(todos);
  applyFilters();
  clearInputs();
}

// Migrate existing todos to have completedAt property
function migrateTodos() {
  let needsMigration = false;
  
  todos.forEach(todo => {
    if (todo.completedAt === undefined) {
      // For existing completed todos without completedAt,
      // use createdAt as a fallback (they were completed before this feature)
      todo.completedAt = todo.completed ? todo.createdAt : null;
      needsMigration = true;
    }
  });
  
  if (needsMigration) {
    saveTodos(todos);
  }
}

// Edit a todo
function editTodo(id, newText, newPriority, newDueDate) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.text = newText.trim();
    todo.priority = newPriority;
    todo.dueDate = newDueDate;
    saveTodos(todos);
    applyFilters();
  }
}

// Toggle todo completion
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    
    // Track completion time for sorting
    if (todo.completed) {
      todo.completedAt = new Date().toISOString();
    } else {
      todo.completedAt = null;
    }
    
    saveTodos(todos);
    applyFilters();
  }
}

// Delete a todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos(todos);
  applyFilters();
}

// Filter management
function applyFilters() {
  filterTodos();
  renderTodos();
  updateFilterUI();
  updateProgressRing();
  updateFilterCounts();
}

function updateFilters() {
  currentFilters.status = elements.filterStatus?.value || 'all';
  applyFilters();
}

// Update filter pill UI
function updateFilterUI() {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    const filter = pill.dataset.filter;
    pill.classList.toggle('active', filter === currentFilters.status);
  });
}

// Update progress ring
function updateProgressRing() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const fill = document.getElementById('progress-ring-fill');
  const text = document.getElementById('progress-text');
  
  if (fill) {
    fill.setAttribute('stroke-dasharray', `${percentage}, 100`);
  }
  if (text) {
    text.textContent = `${percentage}%`;
  }
}

// Update filter badge counts
function updateFilterCounts() {
  const all = todos.length;
  const pending = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;
  const overdue = todos.filter(t => !t.completed && t.dueDate && isOverdue(t.dueDate)).length;
  
  const badgeAll = document.getElementById('badge-all');
  const badgePending = document.getElementById('badge-pending');
  const badgeCompleted = document.getElementById('badge-completed');
  const badgeOverdue = document.getElementById('badge-overdue');
  const todoCount = document.getElementById('todo-count');
  
  if (badgeAll) badgeAll.textContent = all;
  if (badgePending) badgePending.textContent = pending;
  if (badgeCompleted) badgeCompleted.textContent = completed;
  if (badgeOverdue) badgeOverdue.textContent = overdue;
  if (todoCount) todoCount.textContent = all > 0 ? `${completed}/${all}` : '';
}

// Quick actions
function clearCompleted() {
  const completedTodos = todos.filter(t => t.completed);
  if (completedTodos.length === 0) return;
  
  // Show confirmation dialog
  showClearCompletedDialog();
}

// Show clear completed confirmation dialog
function showClearCompletedDialog() {
  const dialog = document.getElementById('clear-completed-dialog');
  const confirmBtn = document.getElementById('clear-completed-confirm');
  const cancelBtn = dialog?.querySelector('.ai-confirm-cancel');
  const overlay = dialog?.querySelector('.ai-confirm-overlay');
  
  if (!dialog) return;
  
  // Show the dialog
  dialog.classList.add('ai-confirm-open');
  
  // Update message with count
  const completedCount = todos.filter(t => t.completed).length;
  const messageEl = dialog.querySelector('.ai-confirm-message');
  if (messageEl && window.i18n) {
    const message = window.i18n.t('clearCompletedConfirmMessage');
    messageEl.textContent = message;
  }
  
  // Handle confirm button click
  const handleConfirm = () => {
    // Actually clear the completed todos
    todos = todos.filter(t => !t.completed);
    saveTodos(todos);
    applyFilters();
    hideClearCompletedDialog();
    
    // Remove event listeners
    confirmBtn?.removeEventListener('click', handleConfirm);
    cancelBtn?.removeEventListener('click', handleCancel);
    overlay?.removeEventListener('click', handleCancel);
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    hideClearCompletedDialog();
    
    // Remove event listeners
    confirmBtn?.removeEventListener('click', handleConfirm);
    cancelBtn?.removeEventListener('click', handleCancel);
    overlay?.removeEventListener('click', handleCancel);
  };
  
  // Add event listeners
  confirmBtn?.addEventListener('click', handleConfirm);
  cancelBtn?.addEventListener('click', handleCancel);
  overlay?.addEventListener('click', handleCancel);
}

// Hide clear completed confirmation dialog
function hideClearCompletedDialog() {
  const dialog = document.getElementById('clear-completed-dialog');
  if (dialog) {
    dialog.classList.remove('ai-confirm-open');
  }
}

// Handle filter pill clicks
function handleFilterPillClick(event) {
  const pill = event.target.closest('.filter-pill');
  if (!pill) return;
  
  currentFilters.status = pill.dataset.filter;
  applyFilters();
}

// Clear input fields
function clearInputs() {
  if (elements.todoInput) elements.todoInput.value = '';
  if (elements.todoDueDate) elements.todoDueDate.value = '';
  // Clear custom date picker
  if (customDatePicker) {
    customDatePicker.clearDate();
  }
}

// Drag and drop functionality
let draggedElement = null;

function handleDragStart(event) {
  draggedElement = event.target;
  event.target.style.opacity = '0.5';
}

function handleDragEnd(event) {
  event.target.style.opacity = '1';
  draggedElement = null;
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  if (!draggedElement) return;

  const draggedId = draggedElement.dataset.id;
  const dropTarget = event.target.closest('.todo-item');

  if (!dropTarget || draggedElement === dropTarget) return;

  const draggedIndex = filteredTodos.findIndex(todo => todo.id === draggedId);
  const dropIndex = filteredTodos.findIndex(todo => todo.id === dropTarget.dataset.id);

  if (draggedIndex === -1 || dropIndex === -1) return;

  // Reorder the filtered todos array
  const [removed] = filteredTodos.splice(draggedIndex, 1);
  filteredTodos.splice(dropIndex, 0, removed);

  // Update the order property for all todos to match the new order
  filteredTodos.forEach((todo, index) => {
    todo.order = index;
  });

  // Update the main todos array to match the new order
  const newOrder = filteredTodos.map(todo => todo.id);
  todos.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));

  saveTodos(todos);
  renderTodos();
}

// Event handlers
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    const input = elements.todoInput;
    const dueDate = elements.todoDueDate?.value || null;
    addTodo(input.value, dueDate);
  }
}

function handleAddTodo() {
  const input = elements.todoInput;
  const dueDate = elements.todoDueDate?.value || null;
  addTodo(input.value, dueDate);
}

function handleTodoListClick(event) {
  const target = event.target;

  // Handle bullet click (new circular bullet)
  const bullet = target.closest('.todo-bullet');
  if (bullet) {
    event.stopPropagation();
    const id = bullet.dataset.id;
    toggleTodo(id);
    return;
  }

  // Handle delete button
  if (target.closest('.todo-delete-btn')) {
    event.stopPropagation();
    const id = target.closest('.todo-delete-btn').dataset.id;
    deleteTodo(id);
    return;
  }

  // Handle edit button
  if (target.closest('.todo-edit-btn')) {
    event.stopPropagation();
    const id = target.closest('.todo-edit-btn').dataset.id;
    openEditModal(id);
    return;
  }
}

// Edit Modal Functions
function openEditModal(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  editModalState.currentTodoId = id;
  editModalState.isOpen = true;

  // Populate modal fields
  const textInput = document.getElementById('todo-edit-text');
  const modal = document.getElementById('todo-edit-modal');

  if (textInput) textInput.value = todo.text;

  // Show modal
  if (modal) {
    modal.style.display = 'flex';
    // Focus on text input
    setTimeout(() => {
      if (textInput) textInput.focus();
    }, 100);
  }
}

function closeEditModal() {
  editModalState.currentTodoId = null;
  editModalState.isOpen = false;

  const modal = document.getElementById('todo-edit-modal');

  if (modal) modal.style.display = 'none';
}

function saveEdit() {
  if (!editModalState.currentTodoId) return;

  const textInput = document.getElementById('todo-edit-text');

  const newText = textInput ? textInput.value.trim() : '';

  if (!newText) {
    // Show error or focus on text input
    if (textInput) textInput.focus();
    return;
  }

  // Get the existing todo to preserve its due date
  const existingTodo = todos.find(t => t.id === editModalState.currentTodoId);
  const preservedDueDate = existingTodo ? existingTodo.dueDate : null;

  editTodo(editModalState.currentTodoId, newText, null, preservedDueDate);
  closeEditModal();
}

// Initialize todo functionality
function initTodo() {
  // Get DOM elements
  elements = {
    todoInput: document.getElementById('todo-input'),
    todoDueDate: document.getElementById('todo-due-date'),
    addTodoBtn: document.getElementById('add-todo-btn'),
    todoList: document.getElementById('todo-list'),
    emptyState: document.getElementById('empty-state'),
    filterStatus: document.getElementById('filter-status'),
    todoFilters: document.querySelector('.todo-filters')
  };

  // Check if all elements exist
  const requiredElements = ['todoInput', 'addTodoBtn', 'todoList'];
  if (!requiredElements.every(key => elements[key])) {
    console.warn('Required todo elements not found');
    return;
  }

  // Load todos
  todos = loadTodos();
  
  // Migrate existing todos to have completedAt property
  migrateTodos();

  // Event listeners
  elements.addTodoBtn.addEventListener('click', handleAddTodo);
  elements.todoInput.addEventListener('keypress', handleKeyPress);

  // Filter listeners - pill style
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', handleFilterPillClick);
  });
  
  // Keep legacy dropdown support
  if (elements.filterStatus) {
    elements.filterStatus.addEventListener('change', updateFilters);
  }
  
  // Quick action buttons
  const clearCompletedBtn = document.getElementById('clear-completed');
  
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener('click', clearCompleted);
  }

  // Todo list event delegation
  elements.todoList.addEventListener('click', handleTodoListClick);

  // Drag and drop
  elements.todoList.addEventListener('dragstart', handleDragStart);
  elements.todoList.addEventListener('dragend', handleDragEnd);
  elements.todoList.addEventListener('dragover', handleDragOver);
  elements.todoList.addEventListener('drop', handleDrop);

  // Edit modal event listeners
  const editModalClose = document.getElementById('todo-edit-close');
  const editModalCancel = document.getElementById('todo-edit-cancel');
  const editModalSave = document.getElementById('todo-edit-save');
  const editModal = document.getElementById('todo-edit-modal');

  if (editModalClose) {
    editModalClose.addEventListener('click', closeEditModal);
  }
  if (editModalCancel) {
    editModalCancel.addEventListener('click', closeEditModal);
  }
  if (editModalSave) {
    editModalSave.addEventListener('click', saveEdit);
  }
  // Close modal when clicking outside
  if (editModal) {
    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeEditModal();
      }
    });
  }

  // Initial render
  applyFilters();
  
  // Initialize progress ring and counts
  updateProgressRing();
  updateFilterCounts();
}

// Custom Date Picker Functionality
class CustomDatePicker {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.isOpen = false;

    this.init();
  }

  init() {
    this.bindElements();
    this.setupEventListeners();
    this.updateTriggerDisplay();
  }

  bindElements() {
    this.trigger = document.getElementById('date-picker-trigger');
    this.calendar = document.getElementById('custom-calendar');
    this.hiddenInput = document.getElementById('todo-due-date');
    this.selectedDateText = document.getElementById('selected-date-text');
    this.monthElement = document.getElementById('calendar-month');
    this.yearElement = document.getElementById('calendar-year');
    this.daysContainer = document.getElementById('calendar-days');
    this.prevBtn = document.getElementById('prev-month');
    this.nextBtn = document.getElementById('next-month');
    this.clearBtn = document.getElementById('clear-date');
    this.todayBtn = document.getElementById('today-date');
  }

  setupEventListeners() {
    // Trigger button
    if (this.trigger) {
      this.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleCalendar();
      });
    }

    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.navigateMonth(-1));
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.navigateMonth(1));
    }

    // Footer buttons
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.clearDate());
    }
    if (this.todayBtn) {
      this.todayBtn.addEventListener('click', () => this.selectToday());
    }

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.trigger.contains(e.target) && !this.calendar.contains(e.target)) {
        this.closeCalendar();
      }
    });

    // Prevent calendar clicks from closing
    if (this.calendar) {
      this.calendar.addEventListener('click', (e) => e.stopPropagation());
    }
  }

  toggleCalendar() {
    if (this.isOpen) {
      this.closeCalendar();
    } else {
      this.openCalendar();
    }
  }

  openCalendar() {
    if (this.calendar) {
      this.isOpen = true;
      this.calendar.classList.add('visible');
      this.renderCalendar();
      this.trigger.classList.add('selected');
    }
  }

  closeCalendar() {
    if (this.calendar) {
      this.isOpen = false;
      this.calendar.classList.remove('visible');
      this.trigger.classList.remove('selected');
    }
  }

  navigateMonth(delta) {
    this.currentDate.setMonth(this.currentDate.getMonth() + delta);
    this.renderCalendar();
  }

  selectDate(date) {
    this.selectedDate = new Date(date);
    this.updateHiddenInput();
    this.updateTriggerDisplay();
    this.closeCalendar();
  }

  clearDate() {
    this.selectedDate = null;
    this.updateHiddenInput();
    this.updateTriggerDisplay();
    this.closeCalendar();
  }

  selectToday() {
    this.selectDate(new Date());
  }

  updateHiddenInput() {
    if (this.hiddenInput) {
      this.hiddenInput.value = this.selectedDate ? this.formatDateForInput(this.selectedDate) : '';
    }
  }

  updateTriggerDisplay() {
    if (this.selectedDateText) {
      this.selectedDateText.textContent = this.selectedDate ? this.formatDateForDisplay(this.selectedDate) : (window.i18n ? window.i18n.t('dueDate') : 'Due Date');
    }
    if (this.trigger) {
      this.trigger.classList.toggle('selected', !!this.selectedDate);
    }
  }

  formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  formatDateForDisplay(date) {
    const currentLang = window.i18n ? window.i18n.currentLanguage() : 'en';
    const locale = currentLang === 'zh' ? 'zh-CN' : 'en-US';
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  renderCalendar() {
    if (!this.monthElement || !this.yearElement || !this.daysContainer) return;

    // Update month/year display
    const monthIndex = this.currentDate.getMonth();
    const monthKey = ['january', 'february', 'march', 'april', 'may', 'june',
                      'july', 'august', 'september', 'october', 'november', 'december'][monthIndex];
    const monthName = window.i18n ? window.i18n.t(monthKey) : monthKey;
    this.monthElement.textContent = monthName;
    this.yearElement.textContent = this.currentDate.getFullYear();

    // Clear previous days
    this.daysContainer.innerHTML = '';

    // Get calendar data
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate 6 weeks of days
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = date.getDate();

      // Check if this date is in the current month
      const isCurrentMonth = date.getMonth() === month;
      if (!isCurrentMonth) {
        dayElement.classList.add('other-month');
      }

      // Check if this is today
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      if (isToday) {
        dayElement.classList.add('today');
      }

      // Check if this is selected
      const isSelected = this.selectedDate && date.toDateString() === this.selectedDate.toDateString();
      if (isSelected) {
        dayElement.classList.add('selected');
      }

      // Add click handler
      if (isCurrentMonth) {
        dayElement.addEventListener('click', () => this.selectDate(date));
      }

      this.daysContainer.appendChild(dayElement);
    }
  }
}

// Initialize date picker when DOM is ready
let customDatePicker;

function initCustomDatePicker() {
  customDatePicker = new CustomDatePicker();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTodo();
  initCustomDatePicker();
});
