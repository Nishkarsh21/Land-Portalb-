// ======================
// GLOBALS
// ======================
let historyStack = [];
let viewer = null;

// ======================
// NAVIGATION
// ======================
function nav(id) {
  const current = document.querySelector(".page.active");
  if (current && current.id !== id) historyStack.push(current.id);

  if (id === "p4" && !localStorage.getItem("loggedInUser")) {
    alert("Login first");
    return;
  }

  if (id === "p5" && !localStorage.getItem("verified")) {
    alert("Verify identity first");
    return;
  }

  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function goBack() {
  const prev = historyStack.pop();
  if (prev) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(prev).classList.add("active");
  }
}

// ======================
// AUTH (LOCAL STORAGE)
// ======================
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function signup() {
  const email = signupEmail.value.trim();
  const pass = signupPass.value.trim();
  const conf = signupConfirm.value.trim();

  if (!email || !pass || pass !== conf) {
    alert("Invalid signup");
    return;
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    alert("User already exists, login instead");
    nav("p2");
    return;
  }

  users.push({ email, pass });
  saveUsers(users);

  localStorage.setItem("loggedInUser", email);
  localStorage.removeItem("verified");
  nav("p4");
}

function login() {
  const email = loginEmail.value.trim();
  const pass = loginPass.value.trim();

  const user = getUsers().find(u => u.email === email && u.pass === pass);
  if (!user) {
    alert("Invalid login");
    return;
  }

  localStorage.setItem("loggedInUser", email);
  localStorage.removeItem("verified");
  nav("p4");
}

function logout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("verified");
  historyStack = [];
  nav("p1");
}

// ======================
// IDENTITY VERIFICATION
// ======================
function verifyIdentity() {
  const type = docType.value;
  const num = docNumber.value.trim();

  if (type === "aadhaar" && num.length !== 12) {
    alert("Invalid Aadhaar");
    return;
  }
  if (type === "pan" && num.length !== 10) {
    alert("Invalid PAN");
    return;
  }
  if (type === "voter" && num.length < 8) {
    alert("Invalid Voter ID");
    return;
  }

  localStorage.setItem("verified", "true");
  nav("p5");
}

// ======================
// DASHBOARD SECTION OPEN
// ======================
function openSection(type) {
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    nav("p6");
    renderMobile(type);
  } else {
    renderDesktop(type);
  }
}

// ======================
// DESKTOP CONTENT
// ======================
function renderDesktop(type) {
  const c = dashboardContent;
  c.innerHTML = "";

  if (type === "map") {
    c.innerHTML = `
      <h2>3D Location Search</h2>
      <input id="state" placeholder="State">
      <input id="district" placeholder="District / City">
      <input id="village" placeholder="Village / Area">
      <button onclick="locate3D()">Locate in 3D</button>
      <div id="cesiumContainer"></div>
    `;
  }

  if (type === "records") {
    c.innerHTML = `
      <h2>Property Details</h2>
      <p><b>Owner:</b> Rajesh Sharma</p>
      <p><b>Property ID:</b> #IND-9921</p>
      <p><b>Khasra Number:</b> 128/4B</p>
      <p><b>Area:</b> 2.45 Hectares</p>
      <p><b>Status:</b> Verified</p>
      <p><b>Tax:</b> Paid (2025)</p>
    `;
  }

  if (type === "correction") {
    c.innerHTML = `
      <h2>Correction Request</h2>
      <textarea placeholder="Describe required correction"></textarea>
      <button>Submit</button>
    `;
  }

  if (type === "support") {
    c.innerHTML = `
      <h2>Support</h2>
      <p>Email: support@lanportal.gov.in</p>
      <p>Toll Free: 1800-123-4567</p>
      <p>Hours: 10 AM – 6 PM (Mon–Sat)</p>
    `;
  }
}

// ======================
// MOBILE CONTENT (NEW PAGE)
// ======================
function renderMobile(type) {
  const page = document.getElementById("p6");

  if (type === "map") {
    page.innerHTML = `
      <button class="back" onclick="nav('p5')">⬅ Back</button>
      <h2>3D Location Search</h2>
      <input id="state" placeholder="State">
      <input id="district" placeholder="District / City">
      <input id="village" placeholder="Village / Area">
      <button onclick="locate3D()">Locate in 3D</button>
      <div id="cesiumContainer"></div>
    `;
  }

  if (type === "records") {
    page.innerHTML = `
      <button class="back" onclick="nav('p5')">⬅ Back</button>
      <h2>Property Details</h2>
      <p><b>Owner:</b> Rajesh Sharma</p>
      <p><b>Property ID:</b> #IND-9921</p>
      <p><b>Khasra Number:</b> 128/4B</p>
      <p><b>Area:</b> 2.45 Hectares</p>
      <p><b>Status:</b> Verified</p>
      <p><b>Tax:</b> Paid (2025)</p>
    `;
  }

  if (type === "correction") {
    page.innerHTML = `
      <button class="back" onclick="nav('p5')">⬅ Back</button>
      <h2>Correction Request</h2>
      <textarea placeholder="Describe required correction"></textarea>
      <button>Submit</button>
    `;
  }

  if (type === "support") {
    page.innerHTML = `
      <button class="back" onclick="nav('p5')">⬅ Back</button>
      <h2>Support</h2>
      <p>Email: support@lanportal.gov.in</p>
      <p>Toll Free: 1800-123-4567</p>
      <p>Hours: 10 AM – 6 PM (Mon–Sat)</p>
    `;
  }
}

// ======================
// CESIUM MAP (FINAL SAFE)
// ======================
async function locate3D() {
  const stateEl = document.getElementById("state");
  const districtEl = document.getElementById("district");
  const villageEl = document.getElementById("village");

  if (!stateEl || !districtEl) {
    alert("Location inputs not found");
    return;
  }

  const state = stateEl.value.trim();
  const district = districtEl.value.trim();
  const village = villageEl ? villageEl.value.trim() : "";

  if (!state || !district) {
    alert("State and District are required");
    return;
  }

  const query = `${village} ${district} ${state} India`.trim();

  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Geocode API failed");

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      alert("Location not found");
      return;
    }

    const lat = parseFloat(data[0].lat);
    const lon = parseFloat(data[0].lon);

    // destroy old viewer
    if (window.viewer) {
      window.viewer.destroy();
      window.viewer = null;
    }

    // MOBILE + DYNAMIC DOM FIX
    setTimeout(() => {
      const container = document.getElementById("cesiumContainer");
      if (!container) {
        alert("Map container missing");
        return;
      }

      window.viewer = new Cesium.Viewer(container, {
        imageryProvider: false,
        baseLayerPicker: false,
        animation: false,
        timeline: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        navigationHelpButton: false
      });

      window.viewer.resize();

      window.viewer.imageryLayers.removeAll();
      window.viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          subdomains: ["a", "b", "c"]
        })
      );

      window.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 3000),
        duration: 2
      });

      window.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
          pixelSize: 12,
          color: Cesium.Color.RED
        },
        label: {
          text: query,
          fillColor: Cesium.Color.WHITE,
          pixelOffset: new Cesium.Cartesian2(0, -22),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
      });

    }, 400); // mobile layout settle delay

  } catch (err) {
    console.error(err);
    alert("Map service error");
  }
}

// ======================
// AUTO LOAD STATE
// ======================
window.onload = () => {
  const u = localStorage.getItem("loggedInUser");
  const v = localStorage.getItem("verified");

  if (!u) nav("p1");
  else if (u && !v) nav("p4");
  else nav("p5");
};
window.addEventListener("resize", () => {
  if (window.viewer) {
    window.viewer.resize();
  }
});
