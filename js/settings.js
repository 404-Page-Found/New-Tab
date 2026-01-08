// js/settings.js - Background, clock/date style settings

// Background selection
function loadBg() {
  return localStorage.getItem("homepageBg") || "Water Beside Forest";
}
function applyBg() {
  const bg = loadBg();
  document.body.setAttribute("data-bg", bg);
  const thumbs = document.querySelectorAll('.bg-thumb');
  for (let i = 0; i < thumbs.length; i++) {
    thumbs[i].classList.toggle('selected', thumbs[i].getAttribute('data-bg') === bg);
  }
  const imgUrl = window._findBackgroundUrlById ? window._findBackgroundUrlById(bg) : '';
  if (imgUrl) document.body.style.background = `url('${imgUrl}') center center/cover no-repeat fixed`;
  else document.body.style.background = '';
}

// Delegate click events for backgrounds
document.addEventListener('click', function (e) {
  const t = e.target.closest && e.target.closest('.bg-thumb');
  if (t && t.getAttribute('data-bg')) {
    localStorage.setItem('homepageBg', t.getAttribute('data-bg'));
    applyBg();
  }
});

// Clock style
function loadClockStyle() {
  return {
    color: localStorage.getItem("clockColor") || "#ffffff",
    font: localStorage.getItem("clockFont") || "'Times New Roman', serif",
    size: localStorage.getItem("clockSize") || "80",
  };
}
function applyClockStyle() {
  const style = loadClockStyle();
  const clock = document.getElementById("clock");
  if (clock) {
    clock.style.color = style.color;
    clock.style.fontFamily = style.font;
    clock.style.fontSize = style.size + "px";
  }
  const clockColorPicker = document.getElementById("clock-color-picker");
  const clockFontPicker = document.getElementById("clock-font-picker");
  const clockSizePicker = document.getElementById("clock-size-picker");
  if (clockColorPicker && clockColorPicker.value !== style.color) clockColorPicker.value = style.color;
  if (clockFontPicker && clockFontPicker.value !== style.font) clockFontPicker.value = style.font;
  if (clockSizePicker && clockSizePicker.value !== style.size) clockSizePicker.value = style.size;
}

// Event listeners for clock
const clockColorPicker = document.getElementById("clock-color-picker");
const clockFontPicker = document.getElementById("clock-font-picker");
const clockSizePicker = document.getElementById("clock-size-picker");
const clockStyleReset = document.getElementById("clock-style-reset");

if (clockColorPicker) {
  clockColorPicker.addEventListener("input", function () {
    localStorage.setItem("clockColor", this.value);
    applyClockStyle();
  });
}
if (clockFontPicker) {
  clockFontPicker.addEventListener("change", function () {
    localStorage.setItem("clockFont", this.value);
    applyClockStyle();
  });
}
if (clockSizePicker) {
  clockSizePicker.addEventListener("input", function () {
    let val = this.value;
    if (val < 20) val = 20;
    if (val > 200) val = 200;
    localStorage.setItem("clockSize", val);
    applyClockStyle();
  });
}
if (clockStyleReset) {
  clockStyleReset.addEventListener("click", function () {
    localStorage.removeItem("clockColor");
    localStorage.removeItem("clockFont");
    localStorage.removeItem("clockSize");
    applyClockStyle();
  });
}

// Date style
function loadDateStyle() {
  return {
    color: localStorage.getItem("dateColor") || "#ffffff",
    font: localStorage.getItem("dateFont") || "'Times New Roman', serif",
    size: localStorage.getItem("dateSize") || "24",
  };
}
function applyDateStyle() {
  const style = loadDateStyle();
  const date = document.getElementById("date");
  if (date) {
    date.style.color = style.color;
    date.style.fontFamily = style.font;
    date.style.fontSize = style.size + "px";
  }
  const dateColorPicker = document.getElementById("date-color-picker");
  const dateFontPicker = document.getElementById("date-font-picker");
  const dateSizePicker = document.getElementById("date-size-picker");
  if (dateColorPicker && dateColorPicker.value !== style.color) dateColorPicker.value = style.color;
  if (dateFontPicker && dateFontPicker.value !== style.font) dateFontPicker.value = style.font;
  if (dateSizePicker && dateSizePicker.value !== style.size) dateSizePicker.value = style.size;
}

// Event listeners for date
const dateColorPicker = document.getElementById("date-color-picker");
const dateFontPicker = document.getElementById("date-font-picker");
const dateSizePicker = document.getElementById("date-size-picker");
const dateStyleReset = document.getElementById("date-style-reset");

if (dateColorPicker) {
  dateColorPicker.addEventListener("input", function () {
    localStorage.setItem("dateColor", this.value);
    applyDateStyle();
  });
}
if (dateFontPicker) {
  dateFontPicker.addEventListener("change", function () {
    localStorage.setItem("dateFont", this.value);
    applyDateStyle();
  });
}
if (dateSizePicker) {
  dateSizePicker.addEventListener("input", function () {
    let val = this.value;
    if (val < 10) val = 10;
    if (val > 80) val = 80;
    localStorage.setItem("dateSize", val);
    applyDateStyle();
  });
}
if (dateStyleReset) {
  dateStyleReset.addEventListener("click", function () {
    localStorage.removeItem("dateColor");
    localStorage.removeItem("dateFont");
    localStorage.removeItem("dateSize");
    applyDateStyle();
  });
}

// Theme
function loadTheme() {
  return localStorage.getItem("theme") || "dark";
}
function applyTheme() {
  const theme = loadTheme();
  document.body.classList.toggle("light-theme", theme === "light");
  // Update radio buttons
  const darkRadio = document.querySelector('input[name="theme"][value="dark"]');
  const lightRadio = document.querySelector('input[name="theme"][value="light"]');
  if (darkRadio) darkRadio.checked = theme === "dark";
  if (lightRadio) lightRadio.checked = theme === "light";
}

// Language
function loadLanguageSetting() {
  return localStorage.getItem("language") || "en";
}
function applyLanguageSetting() {
  const lang = loadLanguageSetting();
  // Update radio buttons
  const enRadio = document.querySelector('input[name="language"][value="en"]');
  const zhRadio = document.querySelector('input[name="language"][value="zh"]');
  if (enRadio) enRadio.checked = lang === "en";
  if (zhRadio) zhRadio.checked = lang === "zh";

  // Apply language if i18n is available
  if (window.i18n && window.i18n.applyLanguage) {
    window.i18n.applyLanguage(lang);
  }
}

// Event listeners for theme
document.addEventListener("change", function (e) {
  if (e.target.name === "theme") {
    const selectedTheme = e.target.value;
    localStorage.setItem("theme", selectedTheme);
    applyTheme();
  }
});

// Event listeners for language
document.addEventListener("change", function (e) {
  if (e.target.name === "language") {
    const selectedLanguage = e.target.value;
    localStorage.setItem("language", selectedLanguage);
    applyLanguageSetting();
  }
});



// Settings menu logic
const settingsMenu = document.querySelector(".settings-menu");
let settingsMenuItems = [];
const settingsSections = document.querySelectorAll(".settings-section"); // This will include the About section if present in HTML
let backgroundsInitialized = false;

if (settingsMenu) {
  // Collect menu items, sort them alphabetically by their visible label,
  // then re-append to the menu so the DOM order matches alphabetical order.
  settingsMenuItems = Array.from(settingsMenu.querySelectorAll(".settings-menu-item"));
  settingsMenuItems.sort((a, b) =>
    a.textContent.trim().localeCompare(b.textContent.trim(), undefined, { sensitivity: 'base' })
  );
  settingsMenuItems.forEach((item) => settingsMenu.appendChild(item));

  // Attach click handlers to the (now-sorted) items
  settingsMenuItems.forEach((item) => {
    item.addEventListener("click", function () {
      const section = this.getAttribute("data-section");
      settingsMenuItems.forEach((i) => i.classList.remove("selected"));
      this.classList.add("selected");
      settingsSections.forEach((s) => {
        // Show the section that matches the clicked tab, hide others
        if (s.getAttribute("data-section") === section) {
          s.style.display = "block";
        } else {
          s.style.display = "none";
        }
      });
      // Lazy load backgrounds
      if (section === 'background' && !backgroundsInitialized) {
        backgroundsInitialized = true;
        if (window._initBackgrounds) window._initBackgrounds();
      }
      // No special logic needed for 'about' tab, just show the section
    });
  });

  // Auto-open the About tab by default. This overrides any `selected` class
  // present in the HTML so the settings modal starts on About.
  (function setDefaultTab() {
    const defaultSection = 'about';
    const defaultItem = settingsMenuItems.find(i => i.getAttribute('data-section') === defaultSection) || settingsMenuItems[0];
    if (defaultItem) {
      // Trigger the same behavior as a user click so lazy init and section
      // switching run consistently.
      defaultItem.click();
    }
  })();
}

// About section initialization
function initAboutSection() {
  const aboutSection = document.querySelector('.settings-section[data-section="about"]');
  if (aboutSection) {
    const updateStatus = window.updateChecker ? updateChecker.getUpdateStatus() : 'Update checker not loaded';
    const isEnabled = window.updateChecker ? updateChecker.isEnabled() : true;

    const currentVersion = window.CURRENT_VERSION;
    aboutSection.innerHTML = `
      <div class="about-setting-group">
        <h4 data-i18n="aboutSettings">${window.i18n ? window.i18n.t('aboutSettings') : 'About New-Tab'}</h4>
        <p data-i18n="aboutSettingsDesc">${window.i18n ? window.i18n.t('aboutSettingsDesc') : 'Customize your new tab experience with beautiful backgrounds, apps, and settings'}</p>

        <div class="about-cards">
          <div class="setting-card">
            <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"></path>
              <path d="M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H8V5Z"></path>
              <path d="M16 14h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M12 14h.01"></path>
            </svg>
            <div class="setting-content">
              <label>Project</label>
              <div style="font-size: 16px; font-weight: 600; color: var(--settings-text-color); margin-bottom: 4px;">New-Tab</div>
              <div style="font-size: 14px; color: rgba(107, 114, 128, 0.8);">Version v${currentVersion}</div>
            </div>
          </div>

          <div class="setting-card">
            <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 2l-4.5 4.5"></path>
              <path d="M21 3l-4.5 4.5"></path>
            </svg>
            <div class="setting-content">
              <label>Created by</label>
              <div style="font-size: 16px; font-weight: 600; color: var(--settings-text-color);">404-Page-Found</div>
              <div style="font-size: 14px; color: rgba(107, 114, 128, 0.8);">Open source project</div>
            </div>
          </div>

          <div class="setting-card">
            <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"></path>
              <path d="M8 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2H8V5Z"></path>
              <path d="M16 14h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M12 14h.01"></path>
            </svg>
            <div class="setting-content">
              <label>Onboarding Tour</label>
              <div style="font-size: 16px; font-weight: 600; color: var(--settings-text-color);">Restart Tour</div>
              <div style="font-size: 14px; color: rgba(107, 114, 128, 0.8); margin-bottom: 12px;">Review the key features and customization options</div>
              <button id="restart-onboarding-btn" class="setting-btn" style="font-size: 13px; padding: 6px 12px;">
                Start Tour
              </button>
            </div>
          </div>

          <div class="setting-card">
            <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <div class="setting-content">
              <label>Repository</label>
              <a href="https://github.com/404-Page-Found/New-Tab" target="_blank" style="font-size: 16px; font-weight: 600; color: #2196f3; text-decoration: none; transition: all 0.2s ease;">GitHub Repository</a>
              <div style="font-size: 14px; color: rgba(107, 114, 128, 0.8);">View source code & contribute</div>
            </div>
          </div>

          <div class="setting-card">
            <svg class="setting-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4v16l13.5-8L4 4z"></path>
              <path d="M20 12h-3"></path>
            </svg>
            <div class="setting-content">
              <label>Updates</label>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <input type="checkbox" id="update-check-enabled" style="cursor: pointer;" ${isEnabled ? 'checked' : ''} />
                <span style="font-size: 14px; color: var(--settings-text-color);">Enable automatic update checks</span>
              </div>
              <div style="font-size: 13px; color: rgba(107, 114, 128, 0.8); margin-bottom: 12px;">
                ${updateStatus}
              </div>
              <button id="manual-update-check" class="setting-btn secondary" style="font-size: 13px; padding: 8px 12px;">
                Check for Updates Now
              </button>
              <div style="font-size: 12px; color: rgba(107, 114, 128, 0.7); margin-top: 8px;">
                Checks for new versions from GitHub releases once per day when enabled.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add event listeners for update settings
    const updateEnabledCheckbox = document.getElementById('update-check-enabled');
    const manualCheckButton = document.getElementById('manual-update-check');
    const restartOnboardingBtn = document.getElementById('restart-onboarding-btn');

    if (updateEnabledCheckbox && window.updateChecker) {
      updateEnabledCheckbox.addEventListener('change', function() {
        updateChecker.setEnabled(this.checked);
        // Refresh the about section to show updated status
        setTimeout(() => initAboutSection(), 100);
      });
    }

    if (manualCheckButton && window.updateChecker) {
      manualCheckButton.addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = 'Checking...';
        await updateChecker.manualCheck();
        this.disabled = false;
        this.textContent = 'Check for Updates Now';
        // Refresh the about section after manual check
        setTimeout(() => initAboutSection(), 100);
      });
    }

    if (restartOnboardingBtn && window.onboardingTour) {
      restartOnboardingBtn.addEventListener('click', function() {
        // Close settings modal first
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
          settingsModal.style.display = 'none';
        }
        // Reset and start onboarding tour
        window.onboardingTour.reset();
        window.onboardingTour.start();
      });
    }
  }
}

function initSettings() {
  // Apply initial settings
  applyBg();
  applyClockStyle();
  applyDateStyle();
  applyTheme();
  applyLanguageSetting();
  initAboutSection();

  // Initialize modern color pickers
  if (window.initModernColorPickers) {
    window.initModernColorPickers();
  }
}

// Initialize settings when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSettings);
} else {
  initSettings();
}
