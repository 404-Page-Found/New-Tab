// js/onboarding.js - Interactive onboarding tour for new users

class OnboardingTour {
  constructor() {
    this.currentStep = 0;
    this.steps = this.defineSteps();
    this.overlay = null;
    this.tooltip = null;
    this.isActive = false;
    this.completed = this.isCompleted();
  }

  // Check if onboarding has been completed
  isCompleted() {
    return localStorage.getItem('onboardingCompleted') === 'true';
  }

  // Mark onboarding as completed
  markCompleted() {
    localStorage.setItem('onboardingCompleted', 'true');
    this.completed = true;
  }

  // Reset onboarding (for settings restart)
  reset() {
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('onboardingStep');
    this.completed = false;
    this.currentStep = 0;
  }

  // Define all onboarding steps
  defineSteps() {
    return [
      {
        id: 'welcome',
        title: 'Welcome to New-Tab! 🎉',
        content: 'Let\'s take a quick tour of the features to help you get started with personalizing your new tab page.',
        target: null,
        position: 'center',
        action: null,
        waitForAction: false
      },
      {
        id: 'clock',
        title: 'Clock & Date Display',
        content: 'Your current time and date are displayed here. You can customize the appearance in Settings.',
        target: '#clock',
        position: 'bottom',
        action: null,
        waitForAction: false
      },
      {
        id: 'search',
        title: 'Smart Search',
        content: 'Search the web directly from your new tab. Click the search icon to switch between different search engines.',
        target: '.search-bar',
        position: 'bottom',
        action: null,
        waitForAction: false
      },
      {
        id: 'apps',
        title: 'App Shortcuts',
        content: 'Add your favorite websites as quick-launch icons. Drag and drop to reorder them.',
        target: '#app-grid',
        position: 'top',
        action: 'add-app',
        waitForAction: false
      },
      {
        id: 'background',
        title: 'Beautiful Backgrounds',
        content: 'Choose from stunning built-in backgrounds or upload your own. Access this in Settings > Background.',
        target: 'body',
        position: 'center',
        action: null,
        waitForAction: false
      },
      {
        id: 'motto',
        title: 'Daily Inspiration',
        content: 'Enjoy a new motivational quote each day. Click ↻ to get a random quote or ↩ to copy it.',
        target: '#motto-container',
        position: 'top',
        action: null,
        waitForAction: false
      },
      {
        id: 'settings',
        title: 'Customization Center',
        content: 'Click the gear icon to access extensive customization options for themes, styling, and more.',
        target: '#settings-modal',
        position: 'left',
        action: 'open-settings',
        waitForAction: false
      },
      {
        id: 'complete',
        title: 'You\'re All Set! ✨',
        content: 'You now know the basics of New-Tab. Explore the settings to make it truly yours. You can always restart this tour from Settings > About.',
        target: null,
        position: 'center',
        action: null,
        waitForAction: false
      }
    ];
  }

  // Initialize and start the tour
  async start() {
    if (this.isActive || this.completed) {
      console.log('⚠️ Onboarding tour already active or completed');
      return;
    }

    console.log('🚀 Starting onboarding tour...');
    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.showStep();
  }

  // Create overlay elements
  createOverlay() {
    console.log('🎯 Creating onboarding overlay...');

    // Main overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <div class="onboarding-background"></div>
      <div class="onboarding-spotlight"></div>
      <div class="onboarding-tooltip">
        <div class="onboarding-tooltip-header">
          <div class="onboarding-step-counter">
            <span class="current-step">1</span>
            <span class="total-steps">/ ${this.steps.length}</span>
          </div>
          <button class="onboarding-close-btn" title="Skip tour">×</button>
        </div>
        <div class="onboarding-tooltip-content">
          <h3 class="onboarding-tooltip-title"></h3>
          <p class="onboarding-tooltip-text"></p>
        </div>
        <div class="onboarding-tooltip-actions">
          <button class="onboarding-btn onboarding-btn-secondary" id="onboarding-prev">Previous</button>
          <div class="onboarding-progress">
            ${this.steps.map((_, i) => `<div class="progress-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`).join('')}
          </div>
          <button class="onboarding-btn onboarding-btn-primary" id="onboarding-next">Next</button>
        </div>
      </div>
    `;

    // Force overlay to be visible
    this.overlay.style.display = 'flex';
    this.overlay.style.opacity = '1';

    document.body.appendChild(this.overlay);
    console.log('✅ Overlay created and appended to body');

    // Add event listeners
    this.overlay.querySelector('.onboarding-close-btn').addEventListener('click', () => this.end());
    this.overlay.querySelector('#onboarding-next').addEventListener('click', () => this.nextStep());
    this.overlay.querySelector('#onboarding-prev').addEventListener('click', () => this.prevStep());

    // Progress dots
    this.overlay.querySelectorAll('.progress-dot').forEach((dot, index) => {
      dot.addEventListener('click', () => this.goToStep(index));
    });

    // Click outside to advance (for non-action steps)
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay && !this.steps[this.currentStep].waitForAction) {
        this.nextStep();
      }
    });
  }

  // Show current step
  showStep() {
    console.log('🎯 Showing onboarding step:', this.currentStep + 1, 'of', this.steps.length);

    const step = this.steps[this.currentStep];
    const tooltip = this.overlay.querySelector('.onboarding-tooltip');
    const spotlight = this.overlay.querySelector('.onboarding-spotlight');
    const title = this.overlay.querySelector('.onboarding-tooltip-title');
    const text = this.overlay.querySelector('.onboarding-tooltip-text');
    const stepCounter = this.overlay.querySelector('.current-step');
    const prevBtn = this.overlay.querySelector('#onboarding-prev');
    const nextBtn = this.overlay.querySelector('#onboarding-next');

    // Update content
    title.textContent = step.title;
    text.textContent = step.content;
    stepCounter.textContent = this.currentStep + 1;

    // Update progress dots
    this.overlay.querySelectorAll('.progress-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentStep);
    });

    // Handle positioning
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        console.log('🎯 Positioning tooltip for target:', step.target);
        this.positionTooltip(tooltip, targetElement, step.position);
        this.createSpotlight(spotlight, targetElement);
        tooltip.style.opacity = '1';
        spotlight.style.opacity = '1';
      } else {
        console.warn('⚠️ Target element not found:', step.target);
      }
    } else {
      // Center positioned tooltips
      console.log('🎯 Centering tooltip (no target)');
      tooltip.style.position = 'fixed';
      tooltip.style.top = '50%';
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translate(-50%, -50%)';
      spotlight.style.opacity = '0';
    }

    // Force tooltip to be visible
    tooltip.style.display = 'block';
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';

    // Handle navigation buttons
    prevBtn.style.display = this.currentStep === 0 ? 'none' : 'block';
    nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next';

    // Handle special actions
    if (step.action) {
      this.handleAction(step.action);
    }

    console.log('✅ Step display completed');
  }

  // Position tooltip relative to target element
  positionTooltip(tooltip, target, position) {
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    tooltip.style.position = 'fixed';

    switch (position) {
      case 'top':
        tooltip.style.top = `${rect.top - tooltipRect.height - 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.left - tooltipRect.width - 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        break;
      case 'right':
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.transform = 'translateY(-50%)';
        break;
      default:
        tooltip.style.top = `${rect.top + rect.height / 2}px`;
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.transform = 'translate(-50%, -50%)';
    }

    // Ensure tooltip stays within viewport
    this.adjustTooltipPosition(tooltip);
  }

  // Adjust tooltip position to stay within viewport
  adjustTooltipPosition(tooltip) {
    const rect = tooltip.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    if (rect.right > viewport.width) {
      tooltip.style.left = `${viewport.width - rect.width - 10}px`;
    }
    if (rect.left < 0) {
      tooltip.style.left = '10px';
    }
    if (rect.bottom > viewport.height) {
      tooltip.style.top = `${viewport.height - rect.height - 10}px`;
    }
    if (rect.top < 0) {
      tooltip.style.top = '10px';
    }
  }

  // Create spotlight effect around target element
  createSpotlight(spotlight, target) {
    const rect = target.getBoundingClientRect();

    spotlight.style.position = 'fixed';
    spotlight.style.top = `${rect.top - 5}px`;
    spotlight.style.left = `${rect.left - 5}px`;
    spotlight.style.width = `${rect.width + 10}px`;
    spotlight.style.height = `${rect.height + 10}px`;
    spotlight.style.borderRadius = `${parseFloat(getComputedStyle(target).borderRadius) + 5}px`;
  }

  // Handle special actions for certain steps
  handleAction(action) {
    switch (action) {
      case 'open-settings':
        // Wait for settings modal to open
        const checkSettingsOpen = setInterval(() => {
          if (document.getElementById('settings-modal').style.display !== 'none') {
            clearInterval(checkSettingsOpen);
            setTimeout(() => this.nextStep(), 1000);
          }
        }, 100);
        break;
      case 'add-app':
        // This step doesn't require specific action
        break;
    }
  }

  // Navigate to next step
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.showStep();
    } else {
      this.end();
    }
  }

  // Navigate to previous step
  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.showStep();
    }
  }

  // Go to specific step
  goToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStep = stepIndex;
      this.showStep();
    }
  }

  // End the tour
  end() {
    // Always mark as completed once the user has seen the tour (even partially)
    this.markCompleted();

    this.isActive = false;

    if (this.overlay) {
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        if (this.overlay && this.overlay.parentNode) {
          this.overlay.parentNode.removeChild(this.overlay);
        }
        this.overlay = null;
      }, 300);
    }
  }
}

// Global instance
const onboardingTour = new OnboardingTour();

// Check if all required elements exist
function checkRequiredElements() {
  const requiredElements = [
    '#clock',
    '#date',
    '.search-bar',
    '#app-grid',
    '#motto-container'
  ];

  return requiredElements.every(selector => {
    const element = document.querySelector(selector);
    return element && element.offsetWidth > 0 && element.offsetHeight > 0;
  });
}

// Auto-start for new users
document.addEventListener('DOMContentLoaded', () => {
  // Wait for all elements to be ready
  let attempts = 0;
  const maxAttempts = 50; // 5 seconds max wait

  const checkAndStart = () => {
    attempts++;

    if (!onboardingTour.isCompleted() && checkRequiredElements()) {
      console.log('🎯 Starting New-Tab onboarding tour...');
      onboardingTour.start();
    } else if (attempts < maxAttempts) {
      setTimeout(checkAndStart, 100);
    } else {
      console.log('⚠️ Onboarding tour skipped - elements not ready or already completed');
    }
  };

  // Initial delay to let other scripts initialize
  setTimeout(checkAndStart, 500);
});

// Also try on window load as fallback
window.addEventListener('load', () => {
  setTimeout(() => {
    if (!onboardingTour.isCompleted() && !onboardingTour.isActive && checkRequiredElements()) {
      console.log('🎯 Starting New-Tab onboarding tour (fallback)...');
      onboardingTour.start();
    }
  }, 1000);
});

// Expose to window for settings access
window.onboardingTour = onboardingTour;
