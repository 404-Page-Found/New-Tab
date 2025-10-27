/*
  live-background.js
  Manages live background videos for the New Tab page
*/

class LiveBackgroundManager {
  constructor() {
    this.videos = {
      'Abstract Digital Animation': {
        title: 'Abstract Digital Animation',
        url: 'background/Live_background/Abstract Digital Animation.mp4',
        thumb: 'background/Live_background/Abstract Digital Animation.mp4',
      },
      'Changes In Form And Appearance Of A Submerged Material': {
        title: 'Changes In Form And Appearance Of A Submerged Material',
        url: 'background/Live_background/Changes In Form And Appearance Of A Submerged Material.mp4',
        thumb: 'background/Live_background/Changes In Form And Appearance Of A Submerged Material.mp4',
      },
      'Spooky Jack-o-Lantern': {
        title: 'Spooky Jack-o-Lantern',
        url: 'background/Live_background/Spooky Jack-o-Lantern.mp4',
        thumb: 'background/Live_background/Spooky Jack-o-Lantern.mp4',
      },
    };

    this.currentVideo = null;
    this.videoElement = null;
    this.isApplied = false;
  }

  // Initialize the manager
  init() {
    this.createVideoElement();
    this.applySavedBackground();
  }

  // Create video element for background
  createVideoElement() {
    if (this.videoElement) {
      this.videoElement.remove();
    }

    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.setAttribute('autoplay', '');
    this.videoElement.setAttribute('muted', '');
    this.videoElement.setAttribute('loop', '');
    this.videoElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      object-fit: cover;
      z-index: -1;
      pointer-events: none;
    `;

    // Append to body
    document.body.insertBefore(this.videoElement, document.body.firstChild);

    // Add error handling
    this.videoElement.addEventListener('error', (e) => {
      console.error('Video loading error:', e);
      this.onVideoError();
    });

    // Add load success handler
    this.videoElement.addEventListener('loadeddata', () => {
      this.isApplied = true;
    });
  }

  // Apply a video background
  applyVideo(videoId) {
    if (!this.videoElement) {
      this.createVideoElement();
    }

    const video = this.videos[videoId];
    if (!video) {
      console.error('Video not found:', videoId);
      return;
    }

    // Remove any static background first
    if (window._findBackgroundUrlById) {
      // Clear static background if present
      const staticBg = localStorage.getItem("homepageBg");
      if (staticBg) {
        localStorage.setItem("originalStaticBg", staticBg);
      }
    }
    document.body.style.background = 'none';

    // Set video source
    this.videoElement.src = video.url;
    this.currentVideo = videoId;

    // Play video
    this.videoElement.play().catch(e => {
      console.error('Video playback error:', e);
      this.onVideoError();
    });
  }

  // Remove live background and restore static if there was one
  removeVideoBackground() {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.src = '';
      this.videoElement.remove();
      this.videoElement = null;
    }

    // Restore static background if there was one
    const originalStaticBg = localStorage.getItem("originalStaticBg");
    if (originalStaticBg && window._findBackgroundUrlById) {
      const imgUrl = window._findBackgroundUrlById(originalStaticBg);
      if (imgUrl) {
        document.body.style.background = `url('${imgUrl}') center center/cover no-repeat fixed`;
        localStorage.setItem("homepageBg", originalStaticBg);
      }
    } else {
      document.body.style.background = 'var(--body-bg)';
    }

    this.currentVideo = null;
    this.isApplied = false;
  }

  // Handle video loading errors
  onVideoError() {
    console.warn('Falling back to default background due to video error');
    this.removeVideoBackground();
  }

  // Get available videos as array
  getVideos() {
    return Object.keys(this.videos).map(id => ({ id, ...this.videos[id] }));
  }

  // Load saved preference
  loadSavedBackground() {
    return localStorage.getItem("liveBackground") || null;
  }

  // Save current preference
  saveBackground(videoId) {
    if (videoId) {
      localStorage.setItem("liveBackground", videoId);
      this.applyVideo(videoId);
    } else {
      localStorage.removeItem("liveBackground");
      this.removeVideoBackground();
    }
  }

  // Apply saved background on page load
  applySavedBackground() {
    const saved = this.loadSavedBackground();
    if (saved) {
      this.applyVideo(saved);
    }
  }

  // Check if video is currently applied
  isVideoApplied() {
    return this.isApplied && this.currentVideo !== null;
  }
}

// Create and expose global instance
window.liveBackgroundManager = new LiveBackgroundManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => window.liveBackgroundManager.init());
} else {
  window.liveBackgroundManager.init();
}
