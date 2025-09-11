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
    const mottoContainer = document.getElementById("motto-container");
    if (mottoContainer) {
      mottoContainer.textContent = motto[index];
      // Add fade-in effect
      mottoContainer.style.opacity = "0";
      setTimeout(() => {
        mottoContainer.style.transition = "opacity 0.5s";
        mottoContainer.style.opacity = "1";
      }, 50);
    }
  } catch (e) {
    console.error("Error displaying motto:", e);
  }
}

// Set the motto after the page has finished loading
document.addEventListener("DOMContentLoaded", displayDailyMotto);
