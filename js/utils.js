// js/utils.js - Common utility functions

// Load custom apps from localStorage
function loadCustomApps() {
  return JSON.parse(localStorage.getItem("customApps") || "[]");
}

// Save custom apps to localStorage
function saveCustomApps(apps) {
  localStorage.setItem("customApps", JSON.stringify(apps));
}

// Get favicon URL from website URL
function getFavicon(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.origin + "/favicon.ico";
  } catch {
    return "";
  }
}

// Page Visibility Manager - handles background tab optimizations
const visibilityManager = {
  isVisible: !document.hidden,
  callbacks: [],

  init() {
    document.addEventListener('visibilitychange', () => {
      const wasVisible = this.isVisible;
      this.isVisible = !document.hidden;
      if (wasVisible !== this.isVisible) {
        this.callbacks.forEach(cb => cb(this.isVisible));
      }
    });
  },

  onChange(callback) {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) this.callbacks.splice(index, 1);
    };
  },

  whenVisible(callback) {
    if (this.isVisible) callback();
    else {
      const unsubscribe = this.onChange((visible) => {
        if (visible) {
          callback();
          unsubscribe();
        }
      });
    }
  }
};

// Visibility-aware interval manager
class VisibilityInterval {
  constructor(callback, interval, runImmediately = false) {
    this.callback = callback;
    this.interval = interval;
    this.intervalId = null;
    this.isRunning = false;

    if (runImmediately) callback();

    this.start();

    // Subscribe to visibility changes
    this.unsubscribe = visibilityManager.onChange((visible) => {
      if (visible) {
        this.start();
        // Sync immediately when becoming visible
        callback();
      } else {
        this.stop();
      }
    });
  }

  start() {
    if (this.isRunning || !visibilityManager.isVisible) return;
    this.isRunning = true;
    this.intervalId = setInterval(this.callback, this.interval);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.unsubscribe) this.unsubscribe();
  }
}

// Initialize visibility manager
visibilityManager.init();

// Make utilities available globally
window.visibilityManager = visibilityManager;
window.VisibilityInterval = VisibilityInterval;
