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
function
