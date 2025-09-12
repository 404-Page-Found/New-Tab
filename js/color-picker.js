// js/color-picker.js - Modern Color Picker Component

class ModernColorPicker {
  constructor(options = {}) {
    this.options = {
      element: null,
      defaultColor: '#ffffff',
      onColorSelect: null,
      allowAlpha: false,
      ...options
    };

    this.isOpen = false;
    this.selectedColor = this.options.defaultColor;
    this.pickerElement = null;

    this.init();
  }

  init() {
    this.createColorSwatch();
    this.createPickerPopup();
    this.bindEvents();
  }

  createColorSwatch() {
    const { element } = this.options;

    if (!element) return;

    // Create the color swatch button
    this.swatch = document.createElement('div');
    this.swatch.className = 'color-swatch';
    this.swatch.innerHTML = `
      <div class="color-swatch-preview" style="background-color: ${this.selectedColor}"></div>
      <input type="hidden" value="${this.selectedColor}">
    `;

    // Replace the original input with the swatch
    element.parentNode.insertBefore(this.swatch, element);
    element.style.display = 'none';

    // Store reference to original input for compatibility
    this.swatch._originalInput = element;
    this.updateSwatch(this.selectedColor);
  }

  createPickerPopup() {
    // Common colors palette
    this.commonColors = [
      '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6',
      '#000000', '#6c757d', '#495057', '#343a40',
      '#dc3545', '#fd7e14', '#ffc107', '#28a745',
      '#007bff', '#6610f2', '#6f42c1', '#e83e8c',
      '#20c997', '#17a2b8', '#6f7884', '#959ba5'
    ];

    // Create popup structure
    this.pickerElement = document.createElement('div');
    this.pickerElement.className = 'color-picker-popup';
    this.pickerElement.innerHTML = `
      <div class="color-palette">
        <div class="color-grid">
          ${this.commonColors.map(color => `
            <button class="color-chip" data-color="${color}" style="background-color: ${color}"
                    data-selected="${color === this.selectedColor ? 'true' : 'false'}">
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(this.pickerElement);

    // Bind popup events
    this.bindPopupEvents();
  }

  bindEvents() {
    // Swatch click event
    this.swatch.addEventListener('click', () => {
      this.show();
    });

    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.pickerElement.contains(e.target) && !this.swatch.contains(e.target)) {
        this.hide();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.hide();
      }
    });
  }

  bindPopupEvents() {
    const colorChips = this.pickerElement.querySelectorAll('.color-chip');

    // Color chip selection - immediately select and close
    colorChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const color = chip.dataset.color;
        this.selectColor(color);
        this.hide();
      });
    });
  }

  show() {
    if (!this.pickerElement) return;

    // Position the popup near the swatch
    const swatchRect = this.swatch.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const popupHeight = 320;

    // Calculate position - prefer above the swatch if there's more space
    let top = swatchRect.top - popupHeight - 10;
    if (top < 10 || (viewportHeight - swatchRect.bottom) > (swatchRect.top - popupHeight)) {
      top = swatchRect.bottom + 10;
    }

    this.pickerElement.style.left = `${Math.max(10, Math.min(swatchRect.left, window.innerWidth - 350))}px`;
    this.pickerElement.style.top = `${top}px`;

    this.pickerElement.classList.add('visible');
    this.isOpen = true;
  }

  hide() {
    this.pickerElement.classList.remove('visible');
    this.isOpen = false;
  }

  selectColor(color) {
    this.selectedColor = color.toLowerCase();

    // Update swatch
    this.updateSwatch(color);

    // Update popup
    this.updatePopup(color);

    // Update original input for compatibility
    if (this.swatch._originalInput) {
      this.swatch._originalInput.value = color;
      // Trigger change event
      const event = new Event('input', { bubbles: true });
      this.swatch._originalInput.dispatchEvent(event);
    }

    // Call callback
    if (this.options.onColorSelect) {
      this.options.onColorSelect(color);
    }
  }

  updateSwatch(color) {
    const preview = this.swatch.querySelector('.color-swatch-preview');
    preview.style.backgroundColor = color;
  }

  updatePopup(color) {
    // Update selected chip
    const chips = this.pickerElement.querySelectorAll('.color-chip');
    chips.forEach(chip => {
      chip.dataset.selected = chip.dataset.color.toLowerCase() === color.toLowerCase() ? 'true' : 'false';
    });
  }

  setColor(color) {
    this.selectedColor = color;
    this.updateSwatch(color);
    this.updatePopup(color);
  }

  destroy() {
    if (this.pickerElement && this.pickerElement.parentNode) {
      this.pickerElement.parentNode.removeChild(this.pickerElement);
    }
    if (this.swatch && this.swatch.parentNode) {
      this.swatch.parentNode.removeChild(this.swatch);
      // Restore original input
      if (this.swatch._originalInput) {
        this.swatch._originalInput.style.display = '';
      }
    }
  }
}

// Initialize modern color pickers for all color inputs in settings
let colorPickers = [];

function initModernColorPickers() {
  // Remove existing pickers
  colorPickers.forEach(picker => picker.destroy());
  colorPickers = [];

  const colorInputs = document.querySelectorAll('input[type="color"][id*="color-picker"]');
  colorInputs.forEach(input => {
    const picker = new ModernColorPicker({
      element: input,
      defaultColor: input.value || '#ffffff',
      onColorSelect: (color) => {
        // Trigger any existing handlers
        const event = new Event('input', { bubbles: true });
        input.dispatchEvent(event);
      }
    });
    colorPickers.push(picker);
  });
}

// Export for use in other modules
window.initModernColorPickers = initModernColorPickers;
window.ModernColorPicker = ModernColorPicker;
