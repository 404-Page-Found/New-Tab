// js/todo.js - Modern Todo List Functionality

// State management
let todos = [];
let filteredTodos = [];
let selectedTodos = new Set();
let currentFilters = {
  status: 'all'
};

// DOM elements
let elements = {};

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
  return date.toLocaleDateString('en-US', {
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

// Progress calculation
function updateProgress() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Update progress ring
  const progressRing = elements.progressRing;
  const progressText = elements.progressText;
  if (progressRing && progressText) {
    const circle = progressRing.querySelector('circle:last-child');
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
    progressText.textContent = `${percentage}%`;
  }
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

  // Sort by due date, then by creation date
  filtered.sort((a, b) => {
    // Due date first
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (a.dueDate) {
      return -1;
    } else if (b.dueDate) {
      return 1;
    }

    // Creation date last
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  filteredTodos = filtered;
  return filtered;
}

// Render the todo list
function renderTodos() {
  const todoList = elements.todoList;
  const emptyState = elements.emptyState;

  if (!todoList || !emptyState) return;

  // Clear existing list
  todoList.innerHTML = '';

  // Show/hide empty state
  if (filteredTodos.length === 0) {
    emptyState.style.display = 'flex';
    updateBulkActionsVisibility();
    return;
  }

  emptyState.style.display = 'none';

  // Render each todo
  filteredTodos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.dueDate && isOverdue(todo.dueDate) ? 'overdue' : ''}`;
    li.dataset.id = todo.id;
    li.draggable = true;

    const isSelected = selectedTodos.has(todo.id);

    li.innerHTML = `
      <input type="checkbox" class="todo-bulk-checkbox" ${isSelected ? 'checked' : ''} data-id="${todo.id}">
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
      <div class="todo-content">
        <p class="todo-text">${todo.text}</p>
        <div class="todo-meta">
          ${todo.dueDate ? `<span class="todo-due-date ${isOverdue(todo.dueDate) ? 'overdue' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>${formatDate(todo.dueDate)}</span>` : ''}
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

    // Add animation delay
    li.style.animationDelay = `${index * 0.05}s`;
    li.setAttribute('data-animation', 'enter');

    todoList.appendChild(li);
  });

  updateBulkActionsVisibility();
}

// Update bulk actions visibility
function updateBulkActionsVisibility() {
  const bulkActions = elements.bulkActions;
  const selectedCount = elements.selectedCount;

  if (!bulkActions || !selectedCount) return;

  if (selectedTodos.size > 0) {
    bulkActions.style.display = 'flex';
    selectedCount.textContent = `${selectedTodos.size} selected`;
  } else {
    bulkActions.style.display = 'none';
  }
}

// Add a new todo
function addTodo(text, dueDate = null) {
  if (!text.trim()) return;

  const newTodo = {
    id: generateTodoId(),
    text: text.trim(),
    completed: false,
    dueDate: dueDate,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  saveTodos(todos);
  applyFilters();
  clearInputs();
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
    saveTodos(todos);
    applyFilters();
  }
}

// Delete a todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  selectedTodos.delete(id);
  saveTodos(todos);
  applyFilters();
}

// Bulk operations
function toggleTodoSelection(id) {
  if (selectedTodos.has(id)) {
    selectedTodos.delete(id);
  } else {
    selectedTodos.add(id);
  }
  renderTodos();
}

function selectAllTodos() {
  filteredTodos.forEach(todo => selectedTodos.add(todo.id));
  renderTodos();
}

function completeSelectedTodos() {
  todos.forEach(todo => {
    if (selectedTodos.has(todo.id)) {
      todo.completed = true;
    }
  });
  selectedTodos.clear();
  saveTodos(todos);
  applyFilters();
}

function deleteSelectedTodos() {
  todos = todos.filter(todo => !selectedTodos.has(todo.id));
  selectedTodos.clear();
  saveTodos(todos);
  applyFilters();
}

// Filter management
function applyFilters() {
  filterTodos();
  renderTodos();
  updateProgress();
}

function updateFilters() {
  currentFilters.status = elements.filterStatus?.value || 'all';
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

  // Handle checkbox toggle
  if (target.classList.contains('todo-checkbox')) {
    event.stopPropagation();
    const id = target.dataset.id;
    toggleTodo(id);
    return;
  }

  // Handle bulk checkbox
  if (target.classList.contains('todo-bulk-checkbox')) {
    event.stopPropagation();
    const id = target.dataset.id;
    toggleTodoSelection(id);
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
    // For now, just focus on the item (could expand to inline editing)
    const todoItem = target.closest('.todo-item');
    todoItem.style.transform = 'scale(1.02)';
    setTimeout(() => {
      todoItem.style.transform = '';
    }, 200);
    return;
  }
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
    bulkActions: document.getElementById('bulk-actions'),
    selectedCount: document.getElementById('selected-count'),
    selectAllBtn: document.getElementById('select-all-btn'),
    completeSelectedBtn: document.getElementById('complete-selected-btn'),
    deleteSelectedBtn: document.getElementById('delete-selected-btn'),
    progressRing: document.querySelector('.progress-ring-circle'),
    progressText: document.querySelector('.progress-text')
  };

  // Check if all elements exist
  const requiredElements = ['todoInput', 'addTodoBtn', 'todoList'];
  if (!requiredElements.every(key => elements[key])) {
    console.warn('Required todo elements not found');
    return;
  }

  // Load todos
  todos = loadTodos();

  // Event listeners
  elements.addTodoBtn.addEventListener('click', handleAddTodo);
  elements.todoInput.addEventListener('keypress', handleKeyPress);

  // Filter listeners
  if (elements.filterStatus) {
    elements.filterStatus.addEventListener('change', updateFilters);
  }

  // Bulk action listeners
  if (elements.selectAllBtn) {
    elements.selectAllBtn.addEventListener('click', selectAllTodos);
  }
  if (elements.completeSelectedBtn) {
    elements.completeSelectedBtn.addEventListener('click', completeSelectedTodos);
  }
  if (elements.deleteSelectedBtn) {
    elements.deleteSelectedBtn.addEventListener('click', deleteSelectedTodos);
  }

  // Todo list event delegation
  elements.todoList.addEventListener('click', handleTodoListClick);

  // Drag and drop
  elements.todoList.addEventListener('dragstart', handleDragStart);
  elements.todoList.addEventListener('dragend', handleDragEnd);
  elements.todoList.addEventListener('dragover', handleDragOver);
  elements.todoList.addEventListener('drop', handleDrop);

  // Initial render
  applyFilters();
  updateProgress();
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
      this.selectedDateText.textContent = this.selectedDate ? this.formatDateForDisplay(this.selectedDate) : 'Due Date';
    }
    if (this.trigger) {
      this.trigger.classList.toggle('selected', !!this.selectedDate);
    }
  }

  formatDateForInput(date) {
    return date.toISOString().split('T')[0];
  }

  formatDateForDisplay(date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  renderCalendar() {
    if (!this.monthElement || !this.yearElement || !this.daysContainer) return;

    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    this.monthElement.textContent = monthNames[this.currentDate.getMonth()];
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
