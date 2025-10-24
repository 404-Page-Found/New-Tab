// main.js - Main initialization, time, date, motto

function updateTime() {
  const now = new Date();
  const timeElement = document.getElementById("clock");
  const dateElement = document.getElementById("date");

  // Update time
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  timeElement.textContent = `${hours}:${minutes}`;

  // Update date
  const options = { weekday: "long", month: "long", day: "numeric" };
  dateElement.textContent = now.toLocaleDateString("en-US", options);
}

// Update time immediately and then every minute
updateTime();
setInterval(updateTime, 60000);

// Display a motto that stays the same for each day
function displayDailyMotto() {
  try {
    const now = new Date();
    // Use year, month, and day to get a unique number for the day
    const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    // Deterministically pick a motto for the day
    const index = daySeed % motto.length;
    const mottoText = document.getElementById("motto-text");
    if (mottoText) {
      mottoText.textContent = motto[index];
      // Add fade-in effect
      mottoText.style.opacity = "0";
      setTimeout(() => {
        mottoText.style.transition = "opacity 0.5s";
        mottoText.style.opacity = "1";
      }, 50);
    }
  } catch (e) {
    console.error("Error displaying motto:", e);
  }
}

// Handle refresh motto functionality
function setupRefreshMotto() {
  const refreshBtn = document.getElementById("refresh-motto-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      const mottoText = document.getElementById("motto-text");
      if (mottoText) {
        // Pick a random motto
        const randomIndex = Math.floor(Math.random() * motto.length);
        mottoText.textContent = motto[randomIndex];
        // Add refresh animation
        mottoText.style.opacity = "0";
        setTimeout(() => {
          mottoText.style.transition = "opacity 0.3s ease";
          mottoText.style.opacity = "1";
        }, 50);

        // Show refresh feedback
        const originalIcon = refreshBtn.textContent;
        refreshBtn.textContent = "🔄⟳";
        setTimeout(() => {
          refreshBtn.textContent = originalIcon;
        }, 800);
      }
    });
  }
}

// Handle copy motto functionality
function setupCopyMotto() {
  const copyBtn = document.getElementById("copy-motto-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const mottoText = document.getElementById("motto-text");
      if (mottoText && mottoText.textContent) {
        try {
          await navigator.clipboard.writeText(mottoText.textContent);
          // Temporarily show "Copied!" feedback
          const originalIcon = copyBtn.textContent;
          copyBtn.textContent = "✅";
          setTimeout(() => {
            copyBtn.textContent = originalIcon;
          }, 1000);
        } catch (err) {
          console.error("Failed to copy motto:", err);
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = mottoText.textContent;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            copyBtn.textContent = "✅";
            setTimeout(() => {
              copyBtn.textContent = originalIcon;
            }, 1000);
          } catch (fallbackErr) {
            console.error("Fallback copy failed:", fallbackErr);
          }
          document.body.removeChild(textArea);
        }
      }
    });
  }
}

// Set the motto and button functionality after the page has finished loading
document.addEventListener("DOMContentLoaded", () => {
  displayDailyMotto();
  setupRefreshMotto();
  setupCopyMotto();
});
