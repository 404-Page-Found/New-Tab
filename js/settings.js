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
  if (bg !== 'default') {
    const imgUrl = window._findBackgroundUrlById ? window._findBackgroundUrlById(bg) : '';
    if (imgUrl) document.body.style.background = `url('${imgUrl}') center center/cover no-repeat fixed`;
    else document.body.style.background = '';
  } else {
    document.body.style.background = '';
  }
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

// Settings menu logic
const settingsMenuItems = document.querySelectorAll(".settings-menu-item");
const settingsSections = document.querySelectorAll(".settings-section");
let backgroundsInitialized = false;

if (settingsMenuItems.length && settingsSections.length) {
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
    });
  });
}

// Apply initial settings
applyBg();
applyClockStyle();
applyDateStyle();
