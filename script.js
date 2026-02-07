/* -------------------------
   PRO MODE
-------------------------- */
function isPro() {
  return localStorage.getItem("pro") === "true";
}

function enablePro() {
  localStorage.setItem("pro", "true");
  location.reload();
}

function disablePro() {
  localStorage.removeItem("pro");
  location.reload();
}

/* =========================
   TIME ZONES
========================= */
const zones = {
  EST: {
    tz: "America/New_York",
    label: "Eastern Time",
    location: "New York, USA",
    observesDST: true
  },
  IST: {
    tz: "Asia/Kolkata",
    label: "India Standard Time",
    location: "India",
    observesDST: false
  },
  GMT: {
    tz: "Europe/London",
    label: "Greenwich Mean Time",
    location: "United Kingdom",
    observesDST: true
  },
  PST: {
    tz: "America/Los_Angeles",
    label: "Pacific Time",
    location: "California, USA",
    observesDST: true
  },
  JST: {
    tz: "Asia/Tokyo",
    label: "Japan Standard Time",
    location: "Tokyo, Japan",
    observesDST: false
  }
};

/* -------------------------
   ROUTING (HASH-BASED)
-------------------------- */
function getZoneFromHash() {
  const hash = window.location.hash.replace("#", "").toUpperCase();
  return zones[hash] ? hash : "EST";
}

let currentZone = getZoneFromHash();

/* -------------------------
   TIME UPDATE
-------------------------- */
function updateTime() {
  const now = new Date();

  document.getElementById("clock").innerText =
    now.toLocaleTimeString("en-US", {
      timeZone: zones[currentZone].tz,
      hour12: false
    });

  document.getElementById("dateInfo").innerText =
    now.toLocaleDateString("en-US", {
      timeZone: zones[currentZone].tz,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  document.getElementById("zoneTitle").innerText =
    `Current Time in ${currentZone}`;

  document.getElementById("zoneInfo").innerText =
    `${zones[currentZone].label} — ${zones[currentZone].location} (${getUTCOffset(zones[currentZone].tz)})`;

  document.getElementById("dstInfo").innerText =
    zones[currentZone].observesDST
      ? "Daylight Saving Time observed"
      : "No Daylight Saving Time";

  document.getElementById("diffInfo").innerText =
    `${currentZone} is ${getTimeDifference(zones[currentZone].tz)} from your local time`;

  document.title = `Current Time in ${currentZone} | Time Architect`;
}

/* -------------------------
   WORLD CLOCK (CLICKABLE)
-------------------------- */
function updateWorld() {
  const now = new Date();
  const el = document.getElementById("world");
  el.innerHTML = "";

  for (let z in zones) {
    const t = now.toLocaleTimeString("en-US", {
      timeZone: zones[z].tz,
      hour12: false
    });

    el.innerHTML += `
      <div
        onclick="changeZone('${z}')"
        title="${zones[z].label} — ${zones[z].location}"
      >
        <strong>${z}</strong><br>
        ${t}<br>
        <small style="opacity:0.75">
          ${zones[z].location}
        </small>
      </div>
    `;
  }
}

function changeZone(zone) {
  currentZone = zone;
  window.location.hash = zone;
  updateTime();
}

/*------------------------
helper functions:
-------------------------*/
function getUTCOffset(timeZone) {
  const now = new Date();
  const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const local = new Date(now.toLocaleString("en-US", { timeZone }));
  const diff = (local - utc) / (1000 * 60 * 60);
  return `UTC ${diff >= 0 ? "+" : ""}${diff}`;
}

function getTimeDifference(targetTz) {
  const now = new Date();

  const local = new Date(
    now.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  );

  const target = new Date(
    now.toLocaleString("en-US", { timeZone: targetTz })
  );

  let diffMs = target - local;
  const sign = diffMs >= 0 ? "+" : "-";
  diffMs = Math.abs(diffMs);

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${sign}${hours}h ${minutes}m`;
}

/* -------------------------
   LISTEN FOR URL CHANGES
-------------------------- */
window.addEventListener("hashchange", () => {
  currentZone = getZoneFromHash();
  updateTime();
});

/* -------------------------
   INIT LOOP
-------------------------- */
setInterval(() => {
  updateTime();
  updateWorld();
  checkAlarm();
}, 1000);

/* -------------------------
   ALARM FEATURE
-------------------------- */

let alarmTime = localStorage.getItem("alarmTime");
let alarmTriggered = false;

/* Set alarm time */
function setAlarm() {
  unlockAudio(); // 🔑 REQUIRED
  const input = document.getElementById("alarmTime").value;

  if (!input) {
    alert("Please select a time");
    return;
  }

  alarmTime = input;
  alarmTriggered = false;

  localStorage.setItem("alarmTime", alarmTime);

  document.getElementById("alarmStatus").innerText =
    `Alarm set for ${alarmTime} (${currentZone})`;
}

/* Check alarm every second */
function checkAlarm() {
  if (!alarmTime || alarmTriggered) return;

  const now = new Date();
  const timeNow = now
    .toLocaleTimeString("en-US", {
      timeZone: zones[currentZone].tz,
      hour12: false
    })
    .slice(0, 5);

  if (timeNow === alarmTime) {
    alarmTriggered = true;
    playAlarm();
    showAlarmNotification();
    localStorage.removeItem("alarmTime");
    alarmTime = null;
    document.getElementById("alarmStatus").innerText = "";
  }
}

/* -------------------------
   ALARM SOUND SELECTION
-------------------------- */
let alarmAudio = null;
let alarmRinging = false;

/* Save selected alarm sound */
function setAlarmSound(key) {
  localStorage.setItem("alarmSound", key);
}

/* Load saved sound on startup */
(function loadAlarmSound() {
  const saved = localStorage.getItem("alarmSound") || "alarm1";
  const select = document.getElementById("alarmSoundSelect");
  if (select) select.value = saved;
})();

let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  const audio = document.getElementById("alarmSound");
  if (!audio) return;

  audio.src = alarmSounds.alarm1;
  audio.play()
    .then(() => {
      audio.pause();
      audio.currentTime = 0;
      audioUnlocked = true;
      console.log("🔓 Audio unlocked");
    })
    .catch(() => {
      console.warn("Audio unlock blocked");
    });
}

/* Non-Blocking Alarm Notification */
function showAlarmNotification() {
  const banner = document.createElement("div");
  banner.innerText = "⏰ Alarm!";
  banner.style.position = "fixed";
  banner.style.top = "20px";
  banner.style.left = "50%";
  banner.style.transform = "translateX(-50%)";
  banner.style.padding = "12px 20px";
  banner.style.background = "#ff4d4f";
  banner.style.color = "#fff";
  banner.style.borderRadius = "8px";
  banner.style.zIndex = "9999";
  banner.style.fontWeight = "600";

  document.body.appendChild(banner);

  setTimeout(() => banner.remove(), 4000);
}

/* -------------------------
   THEME SYSTEM (5 THEMES)
-------------------------- */

const themes = [
  "theme-light",
  "theme-dark",
  "theme-midnight",
  "theme-solar",
  "theme-graphite"
];

function setTheme(theme) {
  if (theme === "theme-graphite" && !isPro()) {
    alert("🧠 Graphite is a Pro theme. Upgrade to unlock.");
    document.getElementById("themeSelector").value =
      localStorage.getItem("theme") || "theme-light";
    return;
  }

  document.documentElement.classList.remove(...themes);
  document.documentElement.classList.add(theme);
  localStorage.setItem("theme", theme);

  const selector = document.getElementById("themeSelector");
  if (selector) selector.value = theme;
}

(function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "theme-light";
  setTheme(savedTheme);
})();

/* -------------------------
   ADS VISIBILITY
-------------------------- */
(function handleAds() {
  if (isPro()) {
    const ad = document.getElementById("adSection");
    if (ad) ad.style.display = "none";
  }
})();

/* -------------------------
   Backgrounds
-------------------------- */
const backgrounds = {
  bg1: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  bg2: "https://images.unsplash.com/photo-1499346030926-9a72daac6c63",
  bg3: "https://images.unsplash.com/photo-1526401485004-2aa7f3fca1c3"
};

function setBackground(key) {
  if (key === "none") {
    document.body.style.backgroundImage = "";
    localStorage.removeItem("bg");
    return;
  }

  if (key === "random") {
    const keys = Object.keys(backgrounds);
    key = keys[Math.floor(Math.random() * keys.length)];
  }

  document.body.style.backgroundImage = `url(${backgrounds[key]})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  localStorage.setItem("bg", key);
}

function uploadBackground(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    document.body.style.backgroundImage = `url(${reader.result})`;
    localStorage.setItem("bgCustom", reader.result);
  };
  reader.readAsDataURL(file);
}

(function loadBackground() {
  const custom = localStorage.getItem("bgCustom");
  if (custom) {
    document.body.style.backgroundImage = `url(${custom})`;
    return;
  }

  const bg = localStorage.getItem("bg");
  if (bg && backgrounds[bg]) {
    setBackground(bg);
  }
})();

const alarmSounds = {
  alarm1: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
  alarm2: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
  alarm3: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
};

function playAlarm() {
  const key = localStorage.getItem("alarmSound") || "alarm1";
  const volume = parseFloat(localStorage.getItem("alarmVolume") || "0.7");

  if (!alarmSounds[key]) {
    console.warn("Invalid alarm sound key:", key);
    return;
  }

  if (alarmAudio) {
    alarmAudio.pause();
  }

  alarmAudio = new Audio(alarmSounds[key]);
  alarmAudio.loop = true;
  alarmAudio.volume = volume;

  alarmAudio.play()
    .then(() => {
      alarmRinging = true;
      console.log("🔔 Alarm ringing");
    })
    .catch(err => {
      console.error("Alarm play blocked:", err);
    });
}

function stopAlarm() {
  if (!alarmAudio) return;

  alarmAudio.pause();
  alarmAudio.currentTime = 0;
  alarmRinging = false;

  console.log("🛑 Alarm stopped");
}

const volumeSlider = document.getElementById("alarmVolume");

if (volumeSlider) {
  volumeSlider.value = localStorage.getItem("alarmVolume") || "0.7";

  volumeSlider.addEventListener("input", () => {
    localStorage.setItem("alarmVolume", volumeSlider.value);
    if (alarmAudio) {
      alarmAudio.volume = parseFloat(volumeSlider.value);
    }
  });
}

function previewAlarm() {
  playAlarm();
  setTimeout(stopAlarm, 3000);
}

const stopKeySelect = document.getElementById("stopKey");

if (stopKeySelect) {
  stopKeySelect.value = localStorage.getItem("stopKey") || "Space";

  stopKeySelect.addEventListener("change", () => {
    localStorage.setItem("stopKey", stopKeySelect.value);
  });
}

document.addEventListener("keydown", (e) => {
  if (!alarmRinging) return;

  const stopKey = localStorage.getItem("stopKey") || "Space";

  if (e.code === stopKey || e.key === stopKey) {
    stopAlarm();
  }
});

/* -------------------------
   Settings Modal
-------------------------- */
function openSettings() {
  const overlay = document.getElementById("settingsOverlay");
  if (!overlay) {
    console.error("settingsOverlay not found");
    return;
  }
  overlay.classList.remove("hidden");
}

function closeSettings() {
  const overlay = document.getElementById("settingsOverlay");
  if (!overlay) return;
  overlay.classList.add("hidden");
}

/* ESC closes settings */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSettings();
  }
});
