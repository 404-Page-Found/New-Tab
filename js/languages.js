// js/languages.js - Internationalization support

const translations = {
  en: {
    // General UI
    searchPlaceholder: "Search or enter website",
    newApp: "New",
    feedback: "Feedback",
    settings: "Settings",
    todoList: "Todo List",
    addTodoPlaceholder: "Add a new todo...",
    dueDate: "Due Date",
    addTodo: "Add Todo",
    bing: "Bing",
    google: "Google",
    selectAll: "Select All",
    complete: "Complete",
    delete: "Delete",
    selectedCount: "selected",
    noTodos: "No todos yet. Add one above!",
    noTodosHint: "Try adding due dates for better organization.",
    newAppTitle: "New App",
    enterUrl: "Enter website URL",
    cancel: "Cancel",
    create: "Create",
    refreshMotto: "Refresh motto",
    copyMotto: "Copy motto",

    // Settings
    general: "General",
    background: "Background",
    apps: "Apps",
    clock: "Clock",
    date: "Date",
    themes: "Themes",
    language: "Language",
    about: "About",

    // General settings
    generalSettings: "General",
    generalSettingsDesc: "Configure basic app behavior",
    openNewTab: "Open apps in a new tab",

    // Background settings
    backgroundSettings: "Background",
    backgroundSettingsDesc: "Choose your background image",

    // Apps settings
    appsSettings: "Apps",
    appsSettingsDesc: "Customize app icons",
    iconStyle: "Icon Style",
    iconStyleDesc: "Choose the shape and appearance of your app icons",
    minimal: "Minimal",
    square: "Square",
    rounded: "Rounded",
    circle: "Circle",
    iconSize: "Icon Size",
    iconSizeDesc: "Adjust the size of your app icons",
    resetSize: "Reset Size",

    // Clock settings
    clockSettings: "Clock Style",
    clockSettingsDesc: "Customize the appearance of your clock display",
    color: "Color",
    font: "Font",
    size: "Size",
    resetStyle: "Reset Style",

    // Date settings
    dateSettings: "Date Style",
    dateSettingsDesc: "Customize the appearance of your date display",

    // Themes settings
    themeSettings: "Theme",
    themeSettingsDesc: "Choose your preferred interface theme",
    dark: "Dark",
    light: "Light",

    // Language settings
    languageSettings: "Language",
    languageSettingsDesc: "Choose your preferred language",
    english: "English",
    chinese: "中文 (Chinese)",

    // About settings
    aboutSettings: "About New-Tab",
    aboutSettingsDesc: "Customize your new tab experience with beautiful backgrounds, apps, and settings",
    project: "Project",
    version: "Version",
    createdBy: "Created by",
    openSource: "Open source project",
    onboardingTour: "Onboarding Tour",
    restartTour: "Restart Tour",
    tourDesc: "Review the key features and customization options",
    startTour: "Start Tour",
    repository: "Repository",
    viewSource: "View source code & contribute",
    updates: "Updates",
    enableUpdates: "Enable automatic update checks",
    updateStatus: "Update checker not loaded",
    checkNow: "Check for Updates Now",
    updateDesc: "Checks for new versions from GitHub releases once per day when enabled.",

    // Calendar
    clear: "Clear",
    today: "Today",

    // Days of week
    sunday: "Su",
    monday: "Mo",
    tuesday: "Tu",
    wednesday: "We",
    thursday: "Th",
    friday: "Fr",
    saturday: "Sa",

    // Months (for calendar)
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",

    // Todo date picker
    clearDate: "Clear",
    todayDate: "Today"
  },

  zh: {
    // General UI
    searchPlaceholder: "搜索或输入网站",
    newApp: "新建",
    feedback: "反馈",
    settings: "设置",
    todoList: "待办清单",
    addTodoPlaceholder: "添加新待办事项...",
    dueDate: "到期日期",
    addTodo: "添加待办",
    bing: "必应",
    google: "谷歌",
    selectAll: "全选",
    complete: "完成",
    delete: "删除",
    selectedCount: "已选中",
    noTodos: "还没有待办事项。在上方添加一个！",
    noTodosHint: "尝试添加到期日期以更好地组织。",
    newAppTitle: "新建应用",
    enterUrl: "输入网站URL",
    cancel: "取消",
    create: "创建",
    refreshMotto: "刷新格言",
    copyMotto: "复制格言",

    // Settings
    general: "通用",
    background: "背景",
    apps: "应用",
    clock: "时钟",
    date: "日期",
    themes: "主题",
    language: "语言",
    about: "关于",

    // General settings
    generalSettings: "通用",
    generalSettingsDesc: "配置基本应用行为",
    openNewTab: "在新标签页中打开应用",

    // Background settings
    backgroundSettings: "背景",
    backgroundSettingsDesc: "选择您的背景图片",

    // Apps settings
    appsSettings: "应用",
    appsSettingsDesc: "自定义应用图标",
    iconStyle: "图标样式",
    iconStyleDesc: "选择应用图标的形状和外观",
    minimal: "极简",
    square: "方形",
    rounded: "圆角",
    circle: "圆形",
    iconSize: "图标大小",
    iconSizeDesc: "调整应用图标的大小",
    resetSize: "重置大小",

    // Clock settings
    clockSettings: "时钟样式",
    clockSettingsDesc: "自定义时钟显示的外观",
    color: "颜色",
    font: "字体",
    size: "大小",
    resetStyle: "重置样式",

    // Date settings
    dateSettings: "日期样式",
    dateSettingsDesc: "自定义日期显示的外观",

    // Themes settings
    themeSettings: "主题",
    themeSettingsDesc: "选择您喜欢的界面主题",
    dark: "深色",
    light: "浅色",

    // Language settings
    languageSettings: "语言",
    languageSettingsDesc: "选择您喜欢的语言",
    english: "English",
    chinese: "中文 (Chinese)",

    // About settings
    aboutSettings: "关于 New-Tab",
    aboutSettingsDesc: "使用美丽的背景、应用和设置自定义您的新标签页体验",
    project: "项目",
    version: "版本",
    createdBy: "创建者",
    openSource: "开源项目",
    onboardingTour: "引导之旅",
    restartTour: "重新开始",
    tourDesc: "查看关键功能和自定义选项",
    startTour: "开始之旅",
    repository: "代码库",
    viewSource: "查看源代码并贡献",
    updates: "更新",
    enableUpdates: "启用自动更新检查",
    updateStatus: "更新检查器未加载",
    checkNow: "立即检查更新",
    updateDesc: "启用后，每天从 GitHub releases 检查新版本一次。",

    // Calendar
    clear: "清除",
    today: "今天",

    // Days of week
    sunday: "日",
    monday: "一",
    tuesday: "二",
    wednesday: "三",
    thursday: "四",
    friday: "五",
    saturday: "六",

    // Months (for calendar)
    january: "一月",
    february: "二月",
    march: "三月",
    april: "四月",
    may: "五月",
    june: "六月",
    july: "七月",
    august: "八月",
    september: "九月",
    october: "十月",
    november: "十一月",
    december: "十二月",

    // Todo date picker
    clearDate: "清除",
    todayDate: "今天"
  }
};

// Current language
let currentLanguage = 'en';

// Load language from localStorage
function loadLanguage() {
  return localStorage.getItem("language") || "en";
}

// Save language to localStorage
function saveLanguage(lang) {
  localStorage.setItem("language", lang);
}

// Apply language to UI
function applyLanguage(lang) {
  currentLanguage = lang;
  saveLanguage(lang);

  // Update document lang attribute
  document.documentElement.lang = lang;

  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      const translation = translations[lang][key];

      // Different handling based on element type
      if (element.tagName === 'INPUT' && element.placeholder) {
        element.placeholder = translation;
      } else if (element.tagName === 'OPTION') {
        element.textContent = translation;
      } else if (element.hasAttribute('title')) {
        element.title = translation;
      } else {
        element.textContent = translation;
      }
    }
  });

  // Update any dynamic content that might have been added after initial load
  updateDynamicTranslations();
}

// Update dynamic translations (for content added after initial load)
function updateDynamicTranslations() {
  // Update todo section if it exists
  const todoTitle = document.querySelector('.todo-title');
  if (todoTitle) {
    todoTitle.textContent = translations[currentLanguage].todoList;
  }

  // Update empty state messages
  const emptyStateP = document.querySelector('.empty-state p');
  if (emptyStateP) {
    emptyStateP.textContent = translations[currentLanguage].noTodos;
  }

  const emptyStateSmall = document.querySelector('.empty-state small');
  if (emptyStateSmall) {
    emptyStateSmall.textContent = translations[currentLanguage].noTodosHint;
  }

  // Update bulk actions
  const selectAllBtn = document.getElementById('select-all-btn');
  if (selectAllBtn) selectAllBtn.textContent = translations[currentLanguage].selectAll;

  const completeSelectedBtn = document.getElementById('complete-selected-btn');
  if (completeSelectedBtn) completeSelectedBtn.textContent = translations[currentLanguage].complete;

  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  if (deleteSelectedBtn) deleteSelectedBtn.textContent = translations[currentLanguage].delete;

  // Update selected count text
  const selectedCount = document.getElementById('selected-count');
  if (selectedCount) {
    const count = selectedCount.textContent.split(' ')[0];
    selectedCount.textContent = `${count} ${translations[currentLanguage].selectedCount}`;
  }

  // Re-render apps to update default app names
  if (window.renderCustomApps) {
    window.renderCustomApps();
  }

  // Update date display with new language
  if (window.updateTime) {
    window.updateTime();
  }

  // Re-render calendar if it's open
  if (window.customDatePicker && window.customDatePicker.renderCalendar) {
    window.customDatePicker.renderCalendar();
  }

  // Update search engine names
  if (window.initSearchEngine) {
    window.initSearchEngine();
  }

  // Update motto to match new language
  if (window.displayDailyMotto) {
    window.displayDailyMotto();
  }
}

// Get translated text
function t(key) {
  return translations[currentLanguage] && translations[currentLanguage][key] ? translations[currentLanguage][key] : key;
}

// Initialize language system
function initLanguage() {
  const lang = loadLanguage();
  applyLanguage(lang);
}

// Export functions for global use
window.i18n = {
  applyLanguage,
  t,
  currentLanguage: () => currentLanguage
};