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

  document.getElementById("zoneTitle").innerText =
    `Current Time in ${currentZone}`;

  document.getElementById("zoneInfo").innerText =
  `${zones[currentZone].label} — ${zones[currentZone].location}`;

  document.title = `Current Time in ${currentZone} | Time Architect`;

   const now = new Date();

document.getElementById("dateInfo").innerText =
  now.toLocaleDateString("en-US", {
    timeZone: zones[currentZone].tz,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

document.getElementById("zoneInfo").innerText =
  `${zones[currentZone].label} — ${zones[currentZone].location} (${getUTCOffset(zones[currentZone].tz)})`;

document.getElementById("dstInfo").innerText =
  zones[currentZone].observesDST
    ? "Daylight Saving Time observed"
    : "No Daylight Saving Time";
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

updateTime();
updateWorld();

/* -------------------------
   ALARM FEATURE
-------------------------- */
let alarmTime = localStorage.getItem("alarmTime");

function setAlarm() {
  const input = document.getElementById("alarmTime").value;

  if (!input) {
    alert("Please select a time");
    return;
  }

  alarmTime = input;
  localStorage.setItem("alarmTime", alarmTime);

  document.getElementById("alarmStatus").innerText =
    `Alarm set for ${alarmTime} (${currentZone})`;
}

function checkAlarm() {
  if (!alarmTime) return;

  const now = new Date();
  const timeNow = now.toLocaleTimeString("en-US", {
    timeZone: zones[currentZone],
    hour12: false
  }).slice(0, 5);

  if (timeNow === alarmTime) {
    document.getElementById("alarmSound").play();
    alert("⏰ Alarm!");
    localStorage.removeItem("alarmTime");
    alarmTime = null;
    document.getElementById("alarmStatus").innerText = "";
  }
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

