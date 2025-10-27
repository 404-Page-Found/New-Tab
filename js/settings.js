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

// Event listeners for theme
document.addEventListener("change", function (e) {
  if (e.target.name === "theme") {
    const selectedTheme = e.target.value;
    localStorage.setItem("theme", selectedTheme);
    applyTheme();
  }
});

// Live Background
function initLiveBackgrounds() {
  if (!window.liveBackgroundManager) return;

  const container = document.getElementById('live-bg-options');
  if (!container) return;

  container.innerHTML = '';

  // Create video options
  window.liveBackgroundManager.getVideos().forEach((video) => {
    const option = document.createElement('div');
    option.className = 'live-bg-option';
    option.setAttribute('data-video', video.id);
    option.innerHTML = `
      <div class="video-preview">
        <video width="80" height="60" muted preload="metadata">
          <source src="${video.url}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="video-overlay">${video.title}</div>
      </div>
    `;
    container.appendChild(option);
  });

  // Add event listeners
  container.addEventListener('click', function(e) {
    const option = e.target.closest('.live-bg-option');
    if (option) {
      const videoId = option.getAttribute('data-video');

      // Remove previous selection
      container.querySelectorAll('.live-bg-option.selected').forEach(el => el.classList.remove('selected'));

      // Add selection to clicked option
      option.classList.add('selected');

      // Apply video background
      if (window.liveBackgroundManager) {
        window.liveBackgroundManager.saveBackground(videoId);
      }

      // Clear static background selection if video is active
      const thumbs = document.querySelectorAll('.bg-thumb');
      thumbs.forEach(thumb => thumb.classList.remove('selected'));
    }
  });

  // Initialize selection state
  const currentVideo = window.liveBackgroundManager.loadSavedBackground();
  if (currentVideo) {
    const selectedOption = container.querySelector(`[data-video="${currentVideo}"]`);
    if (selectedOption) {
      selectedOption.classList.add('selected');
    }
  }

  // Handle disable button
  const disableBtn = document.getElementById('live-bg-disable');
  if (disableBtn) {
    disableBtn.addEventListener('click', function() {
      // Remove selection from all video options
      container.querySelectorAll('.live-bg-option.selected').forEach(el => el.classList.remove('selected'));

      // Disable live background
      if (window.liveBackgroundManager) {
        window.liveBackgroundManager.saveBackground(null);
      }
    });
  }
}

// Settings menu logic
const settingsMenu = document.querySelector(".settings-menu");
let settingsMenuItems = [];
const settingsSections = document.querySelectorAll(".settings-section");
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
        s.style.display = s.getAttribute("data-section") === section ? "block" : "none";
      });
      // Lazy load backgrounds
      if (section === 'background' && !backgroundsInitialized) {
        backgroundsInitialized = true;
        if (window._initBackgrounds) window._initBackgrounds();
      }
      // Lazy load live backgrounds
      if (section === 'live-background') {
        initLiveBackgrounds();
      }
    });
  });

  // Auto-open the Apps tab by default. This overrides any `selected` class
  // present in the HTML so the settings modal starts on Apps.
  (function setDefaultTab() {
    const defaultSection = 'apps';
    const defaultItem = settingsMenuItems.find(i => i.getAttribute('data-section') === defaultSection) || settingsMenuItems[0];
    if (defaultItem) {
      // Trigger the same behavior as a user click so lazy init and section
      // switching run consistently.
      defaultItem.click();
    }
  })();
}

function initSettings() {
  // Apply initial settings
  applyBg();
  applyClockStyle();
  applyDateStyle();
  applyTheme();

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
