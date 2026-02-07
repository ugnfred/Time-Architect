/* =========================
   PRO MODE
========================= */
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
  EST: { tz: "America/New_York", label: "Eastern Time", location: "New York, USA", observesDST: true },
  IST: { tz: "Asia/Kolkata", label: "India Standard Time", location: "India", observesDST: false },
  GMT: { tz: "Europe/London", label: "Greenwich Mean Time", location: "United Kingdom", observesDST: true },
  PST: { tz: "America/Los_Angeles", label: "Pacific Time", location: "California, USA", observesDST: true },
  JST: { tz: "Asia/Tokyo", label: "Japan Standard Time", location: "Tokyo, Japan", observesDST: false }
};

/* =========================
   ROUTING
========================= */
function getZoneFromHash() {
  const hash = window.location.hash.replace("#", "").toUpperCase();
  return zones[hash] ? hash : "EST";
}

let currentZone = getZoneFromHash();

/* =========================
   TIME UPDATE
========================= */
function updateTime() {
  const now = new Date();

  document.getElementById("clock").innerText =
    now.toLocaleTimeString("en-US", { timeZone: zones[currentZone].tz, hour12: false });

  document.getElementById("dateInfo").innerText =
    now.toLocaleDateString("en-US", {
      timeZone: zones[currentZone].tz,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

  document.getElementById("zoneTitle").innerText = `Current Time in ${currentZone}`;

  document.getElementById("zoneInfo").innerText =
    `${zones[currentZone].label} — ${zones[currentZone].location} (${getUTCOffset(zones[currentZone].tz)})`;

  document.getElementById("dstInfo").innerText =
    zones[currentZone].observesDST ? "Daylight Saving Time observed" : "No Daylight Saving Time";

  document.getElementById("diffInfo").innerText =
    `${currentZone} is ${getTimeDifference(zones[currentZone].tz)} from your local time`;

  document.title = `Current Time in ${currentZone} | Time Architect`;
}

/* =========================
   WORLD CLOCK
========================= */
function updateWorld() {
  const now = new Date();
  const el = document.getElementById("world");
  el.innerHTML = "";

  for (const z in zones) {
    const t = now.toLocaleTimeString("en-US", { timeZone: zones[z].tz, hour12: false });

    el.innerHTML += `
      <div onclick="changeZone('${z}')" title="${zones[z].label} — ${zones[z].location}">
        <strong>${z}</strong><br>
        ${t}
        <small>${zones[z].location}</small>
      </div>
    `;
  }
}

function changeZone(zone) {
  currentZone = zone;
  window.location.hash = zone;
  updateTime();
}

/* =========================
   HELPERS
========================= */
function getUTCOffset(timeZone) {
  const now = new Date();
  const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const local = new Date(now.toLocaleString("en-US", { timeZone }));
  const diff = (local - utc) / 36e5;
  return `UTC ${diff >= 0 ? "+" : ""}${diff}`;
}

function getTimeDifference(targetTz) {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }));
  const target = new Date(now.toLocaleString("en-US", { timeZone: targetTz }));

  let diff = target - local;
  const sign = diff >= 0 ? "+" : "-";
  diff = Math.abs(diff);

  return `${sign}${Math.floor(diff / 36e5)}h ${Math.floor((diff % 36e5) / 6e4)}m`;
}

/* =========================
   SETTINGS STATE (SINGLE SOURCE)
========================= */
const settings = {
  alarmSound: localStorage.getItem("alarmSound") || "alarm1",
  alarmVolume: parseFloat(localStorage.getItem("alarmVolume") || "0.7"),
  stopKey: localStorage.getItem("stopKey") || "Space"
};

/* =========================
   ALARM ENGINE
========================= */
const alarmSounds = {
  alarm1: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
  alarm2: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg",
  alarm3: "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
};

let alarmTime = localStorage.getItem("alarmTime");
let alarmTriggered = false;
let alarmAudio = null;
let alarmRinging = false;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;
  const audio = new Audio(alarmSounds.alarm1);
  audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
    audioUnlocked = true;
  }).catch(() => {});
}

function setAlarm() {
  unlockAudio();
  const input = document.getElementById("alarmTime").value;
  if (!input) return alert("Please select a time");

  alarmTime = input;
  alarmTriggered = false;
  localStorage.setItem("alarmTime", alarmTime);

  document.getElementById("alarmStatus").innerText =
    `Alarm set for ${alarmTime} (${currentZone})`;
}

function checkAlarm() {
  if (!alarmTime || alarmTriggered) return;

  const now = new Date().toLocaleTimeString("en-US", {
    timeZone: zones[currentZone].tz,
    hour12: false
  }).slice(0, 5);

  if (now === alarmTime) {
    alarmTriggered = true;
    playAlarm();
    showAlarmNotification();
    localStorage.removeItem("alarmTime");
    alarmTime = null;
    document.getElementById("alarmStatus").innerText = "";
  }
}

function playAlarm() {
  stopAlarm();
  alarmAudio = new Audio(alarmSounds[settings.alarmSound]);
  alarmAudio.loop = true;
  alarmAudio.volume = settings.alarmVolume;
  alarmAudio.play().then(() => alarmRinging = true);
}

function stopAlarm() {
  if (!alarmAudio) return;
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
  alarmRinging = false;
}

function previewAlarm() {
  playAlarm();
  setTimeout(stopAlarm, 3000);
}

function showAlarmNotification() {
  const b = document.createElement("div");
  b.innerText = "⏰ Alarm!";
  Object.assign(b.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 20px",
    background: "#ff4d4f",
    color: "#fff",
    borderRadius: "8px",
    zIndex: 9999,
    fontWeight: "600"
  });
  document.body.appendChild(b);
  setTimeout(() => b.remove(), 4000);
}

/* =========================
   KEYBOARD STOP
========================= */
document.addEventListener("keydown", (e) => {
  if (!alarmRinging) return;
  if (
    (settings.stopKey === "Space" && e.code === "Space") ||
    (settings.stopKey === "Enter" && e.code === "Enter") ||
    (settings.stopKey === "Escape" && e.code === "Escape")
  ) {
    stopAlarm();
  }
});

/* =========================
   SETTINGS MODAL
========================= */
function openSettings() {
  document.getElementById("settingsOverlay")?.classList.remove("hidden");
  document.getElementById("alarmSoundSelect").value = settings.alarmSound;
  document.getElementById("alarmVolume").value = settings.alarmVolume;
  document.getElementById("stopKey").value = settings.stopKey;
}

function closeSettings() {
  document.getElementById("settingsOverlay")?.classList.add("hidden");
}

function saveSettings() {
  settings.alarmSound = document.getElementById("alarmSoundSelect").value;
  settings.alarmVolume = parseFloat(document.getElementById("alarmVolume").value);
  settings.stopKey = document.getElementById("stopKey").value;

  localStorage.setItem("alarmSound", settings.alarmSound);
  localStorage.setItem("alarmVolume", settings.alarmVolume);
  localStorage.setItem("stopKey", settings.stopKey);

  closeSettings();
}

/* =========================
   INIT
========================= */
window.addEventListener("hashchange", () => {
  currentZone = getZoneFromHash();
  updateTime();
});

setInterval(() => {
  updateTime();
  updateWorld();
  checkAlarm();
}, 1000);

updateTime();
updateWorld();
