const zones = {
  EST: "America/New_York",
  IST: "Asia/Kolkata",
  GMT: "Europe/London",
  PST: "America/Los_Angeles",
  JST: "Asia/Tokyo"
};

function getZoneFromURL() {
  const path = window.location.pathname.split("/").pop().toUpperCase();
  return zones[path] ? path : "EST";
}

let currentZone = getZoneFromURL();

function updateTime() {
  const now = new Date();
  document.getElementById("clock").innerText =
    now.toLocaleTimeString("en-US", {
      timeZone: zones[currentZone],
      hour12: false
    });

  document.getElementById("zoneTitle").innerText =
    `Current Time in ${currentZone}`;
}

function updateWorld() {
  const now = new Date();
  const el = document.getElementById("world");
  el.innerHTML = "";

  for (let z in zones) {
    const t = now.toLocaleTimeString("en-US", {
      timeZone: zones[z],
      hour12: false
    });

    el.innerHTML += `<div><strong>${z}</strong><br>${t}</div>`;
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
}

setInterval(() => {
  updateTime();
  updateWorld();
}, 1000);
