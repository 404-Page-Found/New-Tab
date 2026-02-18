// js/update-checker.js - Automatic update checking from GitHub releases

class UpdateChecker {
  constructor() {
    this.repo = '404-Page-Found/New-Tab';
    this.apiUrl = `https://api.github.com/repos/${this.repo}/releases/latest`;
    this.currentVersion = window.CURRENT_VERSION; // Use centralized version
    this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  // Check if update checking is enabled
  isEnabled() {
    return localStorage.getItem('updateCheckEnabled') !== 'false';
  }

  // Enable/disable update checking
  setEnabled(enabled) {
    localStorage.setItem('updateCheckEnabled', enabled);
  }

  // Get last check time
  getLastCheckTime() {
    const time = localStorage.getItem('lastUpdateCheck');
    return time ? parseInt(time) : 0;
  }

  // Set last check time
  setLastCheckTime(time = Date.now()) {
    localStorage.setItem('lastUpdateCheck', time.toString());
  }

  // Check if we should perform an update check
  shouldCheck() {
    if (!this.isEnabled()) return false;
    const lastCheck = this.getLastCheckTime();
    const now = Date.now();
    return (now - lastCheck) > this.checkInterval;
  }

  // Fetch latest release from GitHub API
  async fetchLatestRelease() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        version: data.tag_name.replace(/^v/, ''), // Remove 'v' prefix if present
        url: data.html_url,
        publishedAt: data.published_at,
        body: data.body
      };
    } catch (error) {
      console.error('Failed to fetch latest release:', error);
      return null;
    }
  }

  // Compare versions using semantic versioning
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    return 0;
  }

  // Check for updates
  async checkForUpdates() {
    if (!this.shouldCheck()) return null;

    const latestRelease = await this.fetchLatestRelease();
    if (!latestRelease) return null;

    this.setLastCheckTime();

    const comparison = this.compareVersions(latestRelease.version, this.currentVersion);
    if (comparison > 0) {
      // New version available
      return latestRelease;
    }

    return null; // No update available
  }

  // Show update notification
  showUpdateNotification(release) {
    // Remove existing notification if present
    this.hideUpdateNotification();

    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="update-notification-content">
        <div class="update-notification-icon">🚀</div>
        <div class="update-notification-text">
          <strong>New version available!</strong>
          <br>
          New-Tab v${release.version} is now available.
        </div>
        <div class="update-notification-actions">
          <button class="update-btn update-btn-primary" onclick="window.open('${release.url}', '_blank')">
            View Release
          </button>
          <button class="update-btn update-btn-secondary" onclick="updateChecker.hideUpdateNotification()">
            Dismiss
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-hide after 30 seconds (visibility-aware)
    this._scheduleAutoHide(() => this.hideUpdateNotification(), 30000);
  }

  // Schedule auto-hide with visibility awareness
  _scheduleAutoHide(callback, delay) {
    if (window.visibilityManager) {
      let remaining = delay;
      let startTime = Date.now();
      let timeoutId = null;

      const hide = () => {
        callback();
        if (unsubscribe) unsubscribe();
      };

      const onVisibilityChange = (visible) => {
        if (visible) {
          // Tab became visible, resume timer
          startTime = Date.now();
          timeoutId = setTimeout(hide, remaining);
        } else {
          // Tab hidden, pause timer
          remaining -= Date.now() - startTime;
          if (timeoutId) clearTimeout(timeoutId);
        }
      };

      const unsubscribe = window.visibilityManager.onChange(onVisibilityChange);

      // Start timer if visible
      if (window.visibilityManager.isVisible) {
        timeoutId = setTimeout(hide, remaining);
      }
    } else {
      // Fallback for browsers without visibility manager
      setTimeout(callback, delay);
    }
  }

  // Hide update notification
  hideUpdateNotification() {
    const notification = document.querySelector('.update-notification');
    if (notification) {
      notification.remove();
    }
  }

  // Show manual check notification (for all manual check results)
  showManualCheckNotification(message, type = 'info') {
    // Remove existing manual check notification if present
    this.hideManualCheckNotification();

    const notification = document.createElement('div');
    notification.className = 'manual-check-notification';

    let icon = 'ℹ️';
    let bgColor = 'rgba(33, 150, 243, 0.1)';
    let borderColor = 'rgba(33, 150, 243, 0.3)';

    if (type === 'success') {
      icon = '✅';
      bgColor = 'rgba(34, 197, 94, 0.1)';
      borderColor = 'rgba(34, 197, 94, 0.3)';
    } else if (type === 'warning') {
      icon = '⚠️';
      bgColor = 'rgba(251, 191, 36, 0.1)';
      borderColor = 'rgba(251, 191, 36, 0.3)';
    } else if (type === 'error') {
      icon = '❌';
      bgColor = 'rgba(239, 68, 68, 0.1)';
      borderColor = 'rgba(239, 68, 68, 0.3)';
    }

    notification.innerHTML = `
      <div class="manual-check-notification-content">
        <div class="manual-check-notification-icon">${icon}</div>
        <div class="manual-check-notification-text">
          ${message}
        </div>
        <div class="manual-check-notification-actions">
          <button class="manual-check-btn" onclick="updateChecker.hideManualCheckNotification()">
            Dismiss
          </button>
        </div>
      </div>
    `;

    // Apply theme-specific colors
    const isLightTheme = document.body.classList.contains('light-theme');
    if (isLightTheme) {
      notification.style.background = bgColor.replace('0.1', '0.05').replace('0.3', '0.2');
      notification.style.borderColor = borderColor.replace('0.3', '0.2');
    } else {
      notification.style.background = bgColor;
      notification.style.borderColor = borderColor;
    }

    document.body.appendChild(notification);

    // Auto-hide after 5 seconds (visibility-aware)
    this._scheduleAutoHide(() => this.hideManualCheckNotification(), 5000);
  }

  // Hide manual check notification
  hideManualCheckNotification() {
    const notification = document.querySelector('.manual-check-notification');
    if (notification) {
      notification.remove();
    }
  }

  // Manual check for updates (called from settings)
  async manualCheck() {
    const latestRelease = await this.fetchLatestRelease();
    if (!latestRelease) {
      const errorMessage = 'Failed to check for updates. Please try again later.';
      this.showManualCheckNotification(errorMessage, 'error');
      this.showManualCheckResult(errorMessage);
      return;
    }

    this.setLastCheckTime();

    const comparison = this.compareVersions(latestRelease.version, this.currentVersion);
    if (comparison > 0) {
      // New version available - show both update notification and manual check notification
      this.showUpdateNotification(latestRelease);
      const message = `New version v${latestRelease.version} is available!`;
      this.showManualCheckNotification(message, 'success');
      this.showManualCheckResult(message);
    } else if (comparison < 0) {
      // Development version
      const message = `You're running a development version (v${this.currentVersion}). Latest release is v${latestRelease.version}.`;
      this.showManualCheckNotification(message, 'warning');
      this.showManualCheckResult(message);
    } else {
      // Up to date
      const message = 'You\'re running the latest version!';
      this.showManualCheckNotification(message, 'success');
      this.showManualCheckResult(message);
    }
  }

  // Show manual check result
  showManualCheckResult(message) {
    // Remove existing result
    const existing = document.querySelector('.manual-check-result');
    if (existing) existing.remove();

    const result = document.createElement('div');
    result.className = 'manual-check-result';
    result.textContent = message;

    // Add to about section
    const aboutSection = document.querySelector('.settings-section[data-section="about"]');
    if (aboutSection) {
      aboutSection.appendChild(result);
      this._scheduleAutoHide(() => result.remove(), 5000);
    }
  }

  // Get update status for about section
  getUpdateStatus() {
    const t = window.i18n ? window.i18n.t : (key => key);

    if (!this.isEnabled()) {
      return t('updateChecksDisabled');
    }

    const lastCheck = this.getLastCheckTime();
    if (lastCheck === 0) {
      return t('neverChecked');
    }

    const now = Date.now();
    const hoursSince = Math.floor((now - lastCheck) / (1000 * 60 * 60));
    if (hoursSince < 1) {
      return t('lastCheckedLessThanHour');
    } else if (hoursSince < 24) {
      const key = hoursSince === 1 ? 'lastCheckedHoursAgo' : 'lastCheckedHoursAgoPlural';
      return t(key).replace('{n}', hoursSince);
    } else {
      const daysSince = Math.floor(hoursSince / 24);
      const key = daysSince === 1 ? 'lastCheckedDaysAgo' : 'lastCheckedDaysAgoPlural';
      return t(key).replace('{n}', daysSince);
    }
  }
}

// Global instance
const updateChecker = new UpdateChecker();
// Expose to window object for settings.js access
window.updateChecker = updateChecker;

// Auto-check on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (updateChecker.shouldCheck()) {
    const update = await updateChecker.checkForUpdates();
    if (update) {
      updateChecker.showUpdateNotification(update);
    }
  }
});
