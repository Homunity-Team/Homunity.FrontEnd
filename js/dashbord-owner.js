// =====================================================
// AUTH CHECK
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID = localStorage.getItem("id");
  if (userRole !== "owner" || !userID) {
    Swal.fire({ icon: "error", title: "Error", text: "You cannot access the dashboard without logging in" });
    setTimeout(() => { window.location.href = "../html/form.html"; }, 3000);
  }
});

// =====================================================
// RESPONSIVE SIDEBAR
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () { sidebar.classList.toggle("active"); });
  }
  document.querySelectorAll(".sidebar nav ul li").forEach(item => {
    item.addEventListener("click", () => { if (window.innerWidth < 992) sidebar.classList.remove("active"); });
  });
});

// =====================================================
// SECTIONS & MENU
// =====================================================
const sections = {
  properties: document.getElementById("sectionProperties"),
  oneProperti: document.getElementById("oneProperti"),
  addProperties: document.getElementById("sectionAddProperties"),
  updateProperties: document.getElementById("sectionUpdateProperties"),
  booking: document.getElementById("sectionBooking"),
  settingProperties: document.getElementById("sectionSettingProperties"),
  massageProperties: document.getElementById("sectionMassageProperties"),
};

const menuItems = {
  properties: document.getElementById("properties"),
  addProperties: document.getElementById("addProperties"),
  booking: document.getElementById("BookingButton"),
  settingProperties: document.getElementById("settingProperties"),
  massageProperties: document.getElementById("massageProperties"),
};

function hideAllSections(item, option) {
  for (let key in item) {
    if (option === "add") item[key].classList.add("d-none");
    else item[key].classList.remove("active");
  }
}

const laoding = document.getElementById("homunityLoader");
function showLoader() { laoding.classList.remove("d-none"); }
function hideLoader() { laoding.classList.add("d-none"); }

for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => { hideAllSections(sections, "add"); });
}
for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => {
    hideAllSections(menuItems, "a");
    sections[key].classList.remove("d-none");
    menuItems[key].classList.add("active");
  });
}

// =====================================================
// MAP SHARED UTILITIES
// =====================================================
const API_BASE = "https://homunityapiv1.runasp.net/api";
let allUniversities = [];
let universitiesLoaded = false;

async function fetchUniversities() {
  if (universitiesLoaded) return;
  try {
    const res = await fetch(`${API_BASE}/Universities/GetAll`);
    const data = await res.json();
    allUniversities = data.universities || [];
    universitiesLoaded = true;
  } catch (err) { console.warn("Universities load failed:", err); }
}
fetchUniversities();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

function findNearestUniversity(lat, lng) {
  if (!allUniversities.length) return null;
  let nearest = null, minDist = Infinity;
  allUniversities.forEach(u => {
    const d = parseFloat(calculateDistance(lat, lng, u.latitude, u.longitude));
    if (d < minDist) { minDist = d; nearest = u; }
  });
  return nearest ? { university: nearest, distance: minDist.toFixed(2) } : null;
}

function goldIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#efb81e,#d4a017);border:3px solid #212e43;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(33,46,67,0.4);display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-house" style="transform:rotate(45deg);color:#212e43;font-size:0.7rem;"></i></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
  });
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
}

async function searchLocationNominatim(query) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=eg&limit=1`);
    const data = await res.json();
    return data.length > 0 ? data[0] : null;
  } catch { return null; }
}

function applyLocationToUI(lat, lng, address, nearest, prefix) {
  document.getElementById(`${prefix}Lat`).value = lat;
  document.getElementById(`${prefix}Lng`).value = lng;
  document.getElementById(`${prefix}Address`).value = address;
  document.getElementById(`${prefix}SelectedAddress`).textContent = address;
  const uniEl = document.getElementById(`${prefix}SelectedUni`);
  if (nearest) {
    document.getElementById(`${prefix}UniversityId`).value = nearest.university.universityId;
    uniEl.textContent = `📍 Nearest: ${nearest.university.name} (${nearest.distance} km)`;
  } else {
    document.getElementById(`${prefix}UniversityId`).value = "";
    uniEl.textContent = "";
  }
  document.getElementById(`${prefix}LocationInfo`).classList.remove("d-none");
  const errEl = document.getElementById(`${prefix}LocationError`);
  if (errEl) errEl.style.display = "none";
}

// =====================================================
// ADD MAP
// =====================================================
let addMap = null, addMarker = null, addPickingMode = false;

function initAddMap() {
  if (addMap) return;
  addMap = L.map("addMap", { preferCanvas: true }).setView([30.04, 31.23], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(addMap);
  const banner = document.createElement("div");
  banner.id = "addPickingBanner";
  banner.className = "map-picking-banner";
  banner.textContent = "🖱️ Click anywhere on the map to set location";
  document.getElementById("addMapContainer").appendChild(banner);
  addMap.on("click", async (e) => {
    if (!addPickingMode) return;
    await setAddLocation(e.latlng.lat, e.latlng.lng);
    setAddPickingMode(false);
  });
}

function setAddPickingMode(active) {
  addPickingMode = active;
  const banner = document.getElementById("addPickingBanner");
  const btn = document.getElementById("addManualBtn");
  const wrap = document.getElementById("addMapContainer");
  [banner, btn, wrap].forEach(el => el && (active ? el.classList.add(el === banner ? "show" : "active") : el.classList.remove(el === banner ? "show" : "active")));
  if (wrap) active ? wrap.classList.add("map-picking-mode") : wrap.classList.remove("map-picking-mode");
}

async function setAddLocation(lat, lng) {
  if (addMarker) addMap.removeLayer(addMarker);
  addMarker = L.marker([lat, lng], { icon: goldIcon() }).addTo(addMap);
  addMap.setView([lat, lng], 15);
  const address = await reverseGeocode(lat, lng);
  const nearest = findNearestUniversity(lat, lng);
  applyLocationToUI(lat, lng, address, nearest, "add");
  if (nearest) addMarker.bindPopup(`<b>${address.split(",")[0]}</b><br><small>Near ${nearest.university.name}</small>`).openPopup();
}

document.getElementById("addGpsBtn").addEventListener("click", function () {
  if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
  this.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;
  this.disabled = true;
  const btn = this;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      initAddMap();
      await setAddLocation(pos.coords.latitude, pos.coords.longitude);
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
      btn.disabled = false;
    },
    () => {
      alert("Could not get location. Please pick manually.");
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
      btn.disabled = false;
    },
    { timeout: 8000, maximumAge: 60000 }
  );
});

document.getElementById("addManualBtn").addEventListener("click", function () {
  initAddMap();
  addPickingMode ? setAddPickingMode(false) : setAddPickingMode(true);
});

document.getElementById("addMapSearchBtn").addEventListener("click", async function () {
  const query = document.getElementById("addMapSearch").value.trim();
  if (!query) return;
  initAddMap();
  const result = await searchLocationNominatim(query);
  if (result) await setAddLocation(parseFloat(result.lat), parseFloat(result.lon));
  else alert("Location not found.");
});

document.getElementById("addMapSearch").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); document.getElementById("addMapSearchBtn").click(); }
});

menuItems.addProperties.addEventListener("click", () => setTimeout(() => initAddMap(), 150));

// =====================================================
// ADD PROPERTY SUBMIT
// =====================================================
document.getElementById("addPropertyForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const get = (id) => document.getElementById(id);
  const title = get("titleAdd"), price = get("priceAdd"), rooms = get("roomsAdd");
  const images = get("images"), video = get("video");
  const lat = get("addLat").value, lng = get("addLng").value;
  const address = get("addAddress").value, universityId = get("addUniversityId").value;
  let isValid = true;

  const toggleErr = (id, show) => { const el = get(id); if (el) el.style.display = show ? "block" : "none"; };
  if (title.value.length < 5) { toggleErr("titleError", true); isValid = false; } else { toggleErr("titleError", false); }
  if (!price.value || parseFloat(price.value) < 100) { toggleErr("priceError", true); isValid = false; } else { toggleErr("priceError", false); }
  if (!rooms.value || parseInt(rooms.value) < 1 || parseInt(rooms.value) > 10) { toggleErr("roomsError", true); isValid = false; } else { toggleErr("roomsError", false); }
  if (!lat || !lng) { get("addLocationError").style.display = "block"; isValid = false; } else { get("addLocationError").style.display = "none"; }
  if (images.files.length > 6) { alert("Max 6 images."); isValid = false; }
  for (let f of images.files) { if (f.size > 2 * 1024 * 1024) { alert(`${f.name} too large.`); isValid = false; break; } }
  if (video.files.length > 0 && video.files[0].size > 30 * 1024 * 1024) { alert("Video too large."); isValid = false; }
  if (!isValid) return;

  showLoader();
  try {
    const fd = new FormData();
    const ownerId = localStorage.getItem("id");
    fd.append("OwnerID", parseInt(ownerId));
    fd.append("Title", title.value);
    fd.append("Description", get("descreptionAdd").value || "");
    fd.append("Price", parseFloat(price.value));
    fd.append("Rooms", parseInt(rooms.value));
    fd.append("PropertyType", get("apartmentApp").checked ? "Apartment" : "Room");
    fd.append("LocationID", 1);
    fd.append("Latitude", parseFloat(lat));
    fd.append("Longitude", parseFloat(lng));
    fd.append("Address", address);
    if (universityId) fd.append("UniversityId", parseInt(universityId));
    for (let i = 0; i < images.files.length; i++) fd.append("Images", images.files[i]);
    if (video.files.length > 0) fd.append("Video", video.files[0]);
    [{ id: "wifi", val: 1 }, { id: "parking", val: 2 }, { id: "gym", val: 3 }, { id: "ac", val: 4 }].forEach(s => {
      const el = get(s.id); if (el && el.checked) fd.append("Services", s.val);
    });

    const res = await fetch(`${API_BASE}/Properties/CreateFullProperty`, { method: "POST", body: fd });
    if (res.ok) {
      Swal.fire({ icon: "success", title: "Success!", text: "Property added successfully!" });
      document.getElementById("addPropertyForm").reset();
      get("addLocationInfo").classList.add("d-none");
      ["addLat", "addLng", "addAddress", "addUniversityId"].forEach(id => { get(id).value = ""; });
      if (addMarker) { addMap.removeLayer(addMarker); addMarker = null; }
      sections.addProperties.classList.add("d-none");
      sections.properties.classList.remove("d-none");
      menuItems.addProperties.classList.remove("active");
      menuItems.properties.classList.add("active");
      fetchProperties();
      fetchOwnerStats();
    } else {
      const err = await res.json().catch(() => ({}));
      alert("Error: " + (err.message || "Please try again."));
    }
  } catch (err) { console.error(err); alert("Connection error."); }
  finally { hideLoader(); }
});

document.getElementById("cancelAdd").addEventListener("click", () => {
  sections.addProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
  menuItems.addProperties.classList.remove("active");
  menuItems.properties.classList.add("active");
});

// =====================================================
// UPDATE MAP
// =====================================================
let updateMap = null, updateMarker = null, updatePickingMode = false;

function initUpdateMap(lat, lng) {
  if (updateMap) { updateMap.remove(); updateMap = null; updateMarker = null; }
  const center = (lat && lng) ? [parseFloat(lat), parseFloat(lng)] : [30.04, 31.23];
  const zoom = (lat && lng) ? 15 : 11;
  updateMap = L.map("updateMap", { preferCanvas: true }).setView(center, zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(updateMap);
  const old = document.getElementById("updatePickingBanner");
  if (old) old.remove();
  const banner = document.createElement("div");
  banner.id = "updatePickingBanner";
  banner.className = "map-picking-banner";
  banner.textContent = "🖱️ Click anywhere on the map to set location";
  document.getElementById("updateMapContainer").appendChild(banner);
  if (lat && lng) updateMarker = L.marker([parseFloat(lat), parseFloat(lng)], { icon: goldIcon() }).addTo(updateMap);
  updateMap.on("click", async (e) => {
    if (!updatePickingMode) return;
    await setUpdateLocation(e.latlng.lat, e.latlng.lng);
    setUpdatePickingMode(false);
  });
}

function setUpdatePickingMode(active) {
  updatePickingMode = active;
  const banner = document.getElementById("updatePickingBanner");
  const btn = document.getElementById("updateManualBtn");
  const wrap = document.getElementById("updateMapContainer");
  if (active) { banner && banner.classList.add("show"); btn && btn.classList.add("active"); wrap && wrap.classList.add("map-picking-mode"); }
  else { banner && banner.classList.remove("show"); btn && btn.classList.remove("active"); wrap && wrap.classList.remove("map-picking-mode"); }
}

async function setUpdateLocation(lat, lng) {
  if (updateMarker) updateMap.removeLayer(updateMarker);
  updateMarker = L.marker([lat, lng], { icon: goldIcon() }).addTo(updateMap);
  updateMap.setView([lat, lng], 15);
  const address = await reverseGeocode(lat, lng);
  const nearest = findNearestUniversity(lat, lng);
  applyLocationToUI(lat, lng, address, nearest, "update");
  if (nearest) updateMarker.bindPopup(`<b>${address.split(",")[0]}</b><br><small>Near ${nearest.university.name}</small>`).openPopup();
}

document.getElementById("updateGpsBtn").addEventListener("click", function () {
  if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
  this.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;
  this.disabled = true;
  const btn = this;
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      await setUpdateLocation(pos.coords.latitude, pos.coords.longitude);
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
      btn.disabled = false;
    },
    () => {
      alert("Could not get location.");
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
      btn.disabled = false;
    },
    { timeout: 8000, maximumAge: 60000 }
  );
});

document.getElementById("updateManualBtn").addEventListener("click", function () {
  updatePickingMode ? setUpdatePickingMode(false) : setUpdatePickingMode(true);
});

document.getElementById("updateMapSearchBtn").addEventListener("click", async function () {
  const query = document.getElementById("updateMapSearch").value.trim();
  if (!query) return;
  const result = await searchLocationNominatim(query);
  if (result) await setUpdateLocation(parseFloat(result.lat), parseFloat(result.lon));
  else alert("Location not found.");
});

document.getElementById("updateMapSearch").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); document.getElementById("updateMapSearchBtn").click(); }
});

// =====================================================
// OWNER STATS
// =====================================================
async function fetchOwnerStats() {
  const ownerId = localStorage.getItem("id");
  if (!ownerId) return;
  try {
    const [pRes, bRes] = await Promise.all([
      fetch(`${API_BASE}/Properties/GetByOwner?ownerId=${ownerId}`),
      fetch(`${API_BASE}/Booking/owner/${ownerId}`)
    ]);
    const pData = await pRes.json(), bData = await bRes.json();
    const props = Array.isArray(pData) ? pData : pData.properties || [];
    const books = bData.bookings || [];
    const el = (id) => document.getElementById(id);
    if (el("total-props")) el("total-props").innerText = props.length;
    if (el("approved-count")) el("approved-count").innerText = props.filter(p => p.propertyStatusID === 2).length;
    if (el("rejected-count")) el("rejected-count").innerText = props.filter(p => p.propertyStatusID === 3).length;
    if (el("pending-booking")) el("pending-booking").innerText = books.filter(b => b.statusName === "In-Process").length;
    if (el("booked-count")) el("booked-count").innerText = books.filter(b => b.statusName === "Booked").length;
  } catch (err) { console.error("Stats error:", err); }
}
fetchOwnerStats();

// =====================================================
// UPDATE SECTION OPEN
// =====================================================
let newPropertyFiles = [], newVideoFile = null;

function openUpdateSection(prop) {
  document.getElementById("oneProperti").classList.add("d-none");
  document.getElementById("sectionUpdateProperties").classList.remove("d-none");
  window.scrollTo(0, 0);
  newPropertyFiles = [];
  newVideoFile = null;

  const get = (id) => document.getElementById(id);
  get("propertyIdUpdate").value = prop.propertyID;
  get("titleUpdate").value = prop.title || "";
  get("priceUpdate").value = prop.price || "";
  get("roomsUpdate").value = prop.rooms || "";
  get("descriptionUpdate").value = prop.description || "";

  if (prop.propertyType && prop.propertyType.toLowerCase() === "apartment") get("apartmentUpdate").checked = true;
  else get("roomUpdate").checked = true;

  ["wifiUpdate", "parkingUpdate", "gymUpdate", "acUpdate"].forEach(id => get(id).checked = false);
  if (prop.services) {
    prop.services.forEach(s => {
      const n = s.name.toLowerCase();
      if (n.includes("wifi")) get("wifiUpdate").checked = true;
      if (n.includes("air")) get("parkingUpdate").checked = true;
      if (n.includes("washing")) get("gymUpdate").checked = true;
      if (n.includes("water")) get("acUpdate").checked = true;
    });
  }

  const loc = prop.location || {};
  const existingLat = loc.latitude || null;
  const existingLng = loc.longitude || null;
  const existingAddr = [loc.street, loc.area, loc.city].filter(Boolean).join(", ");

  get("updateLat").value = existingLat || "";
  get("updateLng").value = existingLng || "";
  get("updateAddress").value = existingAddr || "";

  if (existingLat && existingLng) {
    get("updateSelectedAddress").textContent = existingAddr;
    const nearest = findNearestUniversity(existingLat, existingLng);
    if (nearest) {
      get("updateUniversityId").value = nearest.university.universityId;
      get("updateSelectedUni").textContent = `📍 Nearest: ${nearest.university.name} (${nearest.distance} km)`;
    }
    get("updateLocationInfo").classList.remove("d-none");
  } else {
    get("updateLocationInfo").classList.add("d-none");
  }

  setTimeout(() => initUpdateMap(existingLat, existingLng), 200);

  // Media
  const mediaContainer = get("allImg");
  mediaContainer.innerHTML = `
    <div class="upload-wrapper w-100">
      <div class="row g-3">
        <div class="col-lg-9 col-12 border-end-divider">
          <div class="mb-3">
            <button type="button" id="addImageBtn" class="add-btn-yellow" onclick="document.getElementById('newImagesInput').click()">+ Add Image</button>
            <input type="file" id="newImagesInput" multiple accept="image/*" class="d-none" onchange="previewNewImages(this)">
          </div>
          <div id="imagesGrid" class="images-grid-layout"></div>
        </div>
        <div class="col-lg-3 col-12 ps-lg-4">
          <div class="mb-3">
            <button type="button" id="addVideoBtn" class="add-btn-yellow w-100" onclick="document.getElementById('newVideoInput').click()">+ Add Video</button>
            <input type="file" id="newVideoInput" accept="video/*" class="d-none" onchange="previewNewVideo(this)">
          </div>
          <div id="videoPreviewContainer"></div>
        </div>
      </div>
    </div>`;

  const imagesGrid = get("imagesGrid");
  if (prop.images && prop.images.length > 0) prop.images.forEach(img => imagesGrid.appendChild(createMediaCard(img.imageUrl, "image")));
  const vpc = get("videoPreviewContainer");
  if (prop.video && prop.video.videoUrl) {
    vpc.appendChild(createMediaCard(prop.video.videoUrl, "video"));
    get("addVideoBtn").style.display = "none";
  }
  checkImageLimit();
}

function createMediaCard(url, type, isNew = false, fileName = "") {
  const div = document.createElement("div");
  div.className = "thumb-wrapper";
  if (isNew) div.dataset.fileName = fileName;
  const mediaContent = type === "image"
    ? `<div class="thumb-img" style="background-image:url('${url}')"></div>`
    : `<div class="thumb-img video-preview-wrapper"><video src="${url}" controls class="w-100 h-100 rounded-3"></video></div>`;
  div.innerHTML = `${mediaContent}<button type="button" class="delete-btn-yellow mt-2" onclick="removeMediaItem(this,'${type}')"><i class="fa fa-trash-alt"></i> Delete</button>`;
  return div;
}

function previewNewImages(input) {
  const grid = document.getElementById("imagesGrid");
  Array.from(input.files).forEach(f => {
    if (grid.querySelectorAll(".thumb-wrapper").length >= 6) return;
    newPropertyFiles.push(f);
    grid.appendChild(createMediaCard(URL.createObjectURL(f), "image", true, f.name));
  });
  checkImageLimit();
  input.value = "";
}

function previewNewVideo(input) {
  const f = input.files[0];
  if (f) {
    newVideoFile = f;
    const vpc = document.getElementById("videoPreviewContainer");
    vpc.innerHTML = "";
    vpc.appendChild(createMediaCard(URL.createObjectURL(f), "video", true));
    document.getElementById("addVideoBtn").style.display = "none";
  }
  input.value = "";
}

function removeMediaItem(btn, type) {
  const parent = btn.parentElement;
  if (type === "image" && parent.dataset.fileName) newPropertyFiles = newPropertyFiles.filter(f => f.name !== parent.dataset.fileName);
  if (type === "video") { newVideoFile = null; const b = document.getElementById("addVideoBtn"); if (b) b.style.display = "block"; }
  parent.remove();
  checkImageLimit();
}

function checkImageLimit() {
  const count = document.getElementById("imagesGrid")?.querySelectorAll(".thumb-wrapper").length || 0;
  const btn = document.getElementById("addImageBtn");
  if (btn) btn.style.display = count >= 6 ? "none" : "inline-block";
}

// =====================================================
// UPDATE PROPERTY SUBMIT
// =====================================================
document.getElementById("updatePropertyForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  let isValid = true;

  function showError(input, id, cond, msg) {
    const el = document.getElementById(id);
    if (!cond) { input.classList.add("is-invalid"); if (el) { el.style.display = "block"; el.textContent = msg; } isValid = false; }
    else { input.classList.remove("is-invalid"); if (el) { el.style.display = "none"; el.textContent = ""; } }
  }

  const get = (id) => document.getElementById(id);
  const title = get("titleUpdate"), price = get("priceUpdate"), rooms = get("roomsUpdate");
  showError(title, "titleErrorUpdate", title.value.trim().length >= 5 && title.value.trim().length <= 100, "Title must be between 5 and 100 characters.");
  showError(price, "priceErrorUpdate", price.value && parseFloat(price.value) >= 100, "Price must be at least 100.");
  showError(rooms, "roomsErrorUpdate", rooms.value && parseInt(rooms.value) >= 1 && parseInt(rooms.value) <= 10, "Rooms must be between 1 and 10.");
  if (!isValid) return;

  showLoader();
  try {
    const propId = Number(get("propertyIdUpdate").value);
    const uLat = get("updateLat").value;
    const uLng = get("updateLng").value;
    const uAddr = get("updateAddress").value;
    const uUniId = get("updateUniversityId").value;

    // Update location separately
    if (uLat && uLng && uUniId) {
      await fetch(`${API_BASE}/Location/UpdatePropertyLocation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "accept": "*/*" },
        body: JSON.stringify({ propertyId: propId, universityId: parseInt(uUniId), address: uAddr, lat: parseFloat(uLat), lng: parseFloat(uLng) })
      }).catch(err => console.warn("Location update:", err));
    }

    const fd = new FormData();
    fd.append("PropertyID", propId);
    fd.append("Title", title.value.trim());
    fd.append("Description", get("descriptionUpdate").value.trim());
    fd.append("Price", parseFloat(price.value));
    fd.append("Rooms", parseInt(rooms.value));
    fd.append("LocationID", 1);

    const sel = document.querySelector('input[name="propertyType"]:checked');
    let typeVal = "Apartment";
    if (sel) typeVal = sel.value === "on" ? (sel.id === "apartmentUpdate" ? "Apartment" : "Room") : sel.value;
    fd.append("PropertyType", typeVal);

    newPropertyFiles.forEach(f => fd.append("NewImages", f));

    if (newVideoFile) { fd.append("NewVideo", newVideoFile); fd.append("DeleteVideo", "false"); }
    else { fd.append("DeleteVideo", (document.querySelector(".video-preview-wrapper") === null).toString()); }

    [{ id: "wifiUpdate", val: 1 }, { id: "parkingUpdate", val: 2 }, { id: "gymUpdate", val: 3 }, { id: "acUpdate", val: 4 }]
      .forEach(s => { if (get(s.id)?.checked) fd.append("Services", s.val); });

    const res = await fetch(`${API_BASE}/Properties/UpdateFullProperty`, { method: "PUT", body: fd });
    const resData = await res.json();

    if (res.ok) {
      await Swal.fire({ icon: "success", title: "Updated!", text: "Property updated successfully." });
      sections.updateProperties.classList.add("d-none");
      sections.properties.classList.remove("d-none");
      menuItems.properties.classList.add("active");
      menuItems.addProperties.classList.remove("active");
      fetchProperties();
      fetchOwnerStats();
    } else {
      console.error("Update failed:", resData);
      alert("Failed: " + (resData.message || "Check your inputs."));
    }
  } catch (err) { console.error(err); alert("Connection error."); }
  finally { hideLoader(); }
});

document.getElementById("cancelUpdate").onclick = () => {
  sections.updateProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
  menuItems.properties.classList.add("active");
};

// =====================================================
// FETCH PROPERTIES LIST (FIXED: address + gold price + button style)
// =====================================================
async function fetchProperties() {
  const container = document.getElementById("propertiesContainer");
  const ownerId = localStorage.getItem("id");
  if (!ownerId) { container.innerHTML = "<p class='text-center py-5 text-warning'>Please login.</p>"; return; }
  showLoader();
  try {
    const res = await fetch(`${API_BASE}/Properties/GetByOwner?ownerId=${ownerId}`);
    const data = await res.json();
    container.innerHTML = "";
    const properties = Array.isArray(data) ? data : data.properties || [];

    if (properties.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="mb-3"><img src="../img/icone-add-is-blank.svg" style="width:150px;"></div>
          <h2 class="fw-bold" style="color:#FFC107;">No properties yet.</h2>
          <p class="fw-bold" style="color:#212E43;font-size:1.2rem;">Click here to add your first property</p>
          <button id="addPropertyy" class="btn mt-3 px-5 py-2 fw-bold" style="background-color:#212E43;color:#FFC107;border-radius:8px;font-size:1.2rem;">+Add</button>
        </div>`;
      return;
    }

    properties.forEach(prop => {
      let statusText = "In Progress", statusClass = "bg-warning text-dark";
      if (prop.propertyStatusID === 2) { statusText = "Approved"; statusClass = "bg-success text-white"; }
      else if (prop.propertyStatusID === 3) { statusText = "Rejected"; statusClass = "bg-danger text-white"; }

      const imgUrl = prop.images && prop.images.length > 0 ? prop.images[0].imageUrl : "https://via.placeholder.com/150";
      const loc = prop.location || {};
      const addressDisplay = [loc.street, loc.area, loc.city].filter(Boolean).join(", ") || "Location not set";
      const propJson = JSON.stringify(prop).replace(/"/g, "&quot;");

      container.innerHTML += `
        <div class="col-12 mb-3">
          <div class="property-card p-3 shadow-sm border rounded-3 bg-white">
            <div class="d-flex d-flex-mobile align-items-start gap-3">
              <img src="${imgUrl}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;" alt="property">
              <div class="flex-grow-1">
                <h4 class="mb-1 h6 fw-bold text-dark">${prop.title}</h4>
                <p class="mb-1 text-muted small"><i class="fas fa-location-dot me-1"></i>${addressDisplay}</p>
                <p class="mb-0 fw-bold" style="color:#efb81e;">$${prop.price} / month</p>
              </div>
              <div class="d-flex align-items-center gap-2 mt-2 flex-wrap justify-content-end">
                <span class="badge ${statusClass}" style="font-size:10px;padding:5px 10px;">${statusText}</span>
                <button class="btn btn-sm px-4 fw-bold"
                  style="background:transparent;color:#1e293b;border:2px solid #000;border-radius:20px;transition:0.2s;"
                  onmouseover="this.style.backgroundColor='#212e43';this.style.color='#efb81e';this.style.borderColor='#212e43';"
                  onmouseout="this.style.backgroundColor='transparent';this.style.color='#1e293b';this.style.borderColor='#000';"
                  onclick="showPropertyDetails(${propJson})">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>`;
    });
  } catch (err) { console.error(err); container.innerHTML = "<p class='text-center text-danger py-5'>Error loading properties.</p>"; }
  finally { hideLoader(); }
}
fetchProperties();

document.getElementById("propertiesContainer").addEventListener("click", (e) => {
  if (e.target && e.target.id === "addPropertyy") {
    sections.properties.classList.add("d-none");
    sections.addProperties.classList.remove("d-none");
    menuItems.addProperties.classList.add("active");
    menuItems.properties.classList.remove("active");
    setTimeout(() => initAddMap(), 150);
  }
});

// =====================================================
// DETAILS MAP (FIXED)
// =====================================================
let detailsMap = null;

function initDetailsMap(lat, lng, address, uniName, distanceKm) {
  if (detailsMap) { detailsMap.remove(); detailsMap = null; }

  const mapEl = document.getElementById("detailsMap");
  const noLocEl = document.getElementById("detailsMapNoLocation");
  const mapInfoEl = document.getElementById("detailsMapInfo");
  const uniInfoEl = document.getElementById("detailsUniInfo");

  const latF = lat ? parseFloat(lat) : NaN;
  const lngF = lng ? parseFloat(lng) : NaN;

  if (!lat || !lng || isNaN(latF) || isNaN(lngF)) {
    mapEl.style.display = "none";
    noLocEl.style.display = "flex";
    mapInfoEl.classList.add("d-none");
    uniInfoEl.classList.add("d-none");
    return;
  }

  mapEl.style.display = "block";
  noLocEl.style.display = "none";

  detailsMap = L.map("detailsMap", { zoomControl: true, scrollWheelZoom: false, preferCanvas: true }).setView([latF, lngF], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(detailsMap);

  const marker = L.marker([latF, lngF], { icon: goldIcon() }).addTo(detailsMap);
  if (address) {
    marker.bindPopup(`<b style="color:#212e43">${address.split(",")[0]}</b>`).openPopup();
    document.getElementById("detailsMapAddress").textContent = address;
    mapInfoEl.classList.remove("d-none");
  }

  if (uniName) {
    document.getElementById("detailsUniText").textContent = `Nearest University: ${uniName}${distanceKm ? ` — ${distanceKm} km away` : ""}`;
    uniInfoEl.classList.remove("d-none");
  } else {
    uniInfoEl.classList.add("d-none");
  }

  setTimeout(() => { if (detailsMap) detailsMap.invalidateSize(); }, 150);
}

// =====================================================
// SHOW PROPERTY DETAILS (FIXED: images + map)
// =====================================================
function showPropertyDetails(prop) {
  document.getElementById("oneProperti").classList.remove("d-none");
  sections.properties.classList.add("d-none");

  const images = (prop.images && prop.images.length > 0) ? prop.images : [];
  const getImg = (i) => images[i] ? images[i].imageUrl : (images[0] ? images[0].imageUrl : "https://via.placeholder.com/400");

  // Rebuild gallery to avoid duplication
  const galleryEl = document.getElementById("onePFeaturedGallery");
  galleryEl.innerHTML = "";

  if (images.length >= 2) {
    const lb = document.createElement("div");
    lb.className = "side-img-box left d-none d-md-block";
    lb.innerHTML = `<img src="${images[1].imageUrl}" class="gallery-img" />`;
    galleryEl.appendChild(lb);
  }

  const mb = document.createElement("div");
  mb.className = "main-img-box";
  mb.innerHTML = `<img id="onePMainImg" src="${getImg(0)}" class="gallery-img shadow" />`;
  galleryEl.appendChild(mb);

  if (images.length >= 3) {
    const rb = document.createElement("div");
    rb.className = "side-img-box right d-none d-md-block";
    rb.innerHTML = `<img src="${images[2].imageUrl}" class="gallery-img" />`;
    galleryEl.appendChild(rb);
  }

  // Thumbs
  const t1 = document.getElementById("onePThumb1");
  const t2 = document.getElementById("onePThumb2");
  const t3 = document.getElementById("onePThumb3");
  t1.src = getImg(0); t1.style.display = "block";
  t2.src = images[1] ? images[1].imageUrl : getImg(0); t2.style.display = images.length >= 2 ? "block" : "none";
  t3.src = images[2] ? images[2].imageUrl : getImg(0); t3.style.display = images.length >= 3 ? "block" : "none";

  // Text
  document.getElementById("onePTitle").textContent = prop.title;
  document.getElementById("idPropirtie").value = prop.propertyID;
  const loc = prop.location || {};
  const addrDisplay = [loc.street, loc.area, loc.city].filter(Boolean).join(", ") || "Location not set";
  document.getElementById("onePAddress").textContent = addrDisplay;
  document.getElementById("onePDescription").textContent = prop.description;
  document.getElementById("onePPrice").innerHTML = `<i class="fas fa-diamond"></i> Price $${prop.price} / month`;
  document.getElementById("onePRooms").innerHTML = `<i class="fas fa-diamond"></i> ${prop.rooms} rooms`;

  // Amenities
  const amenitiesList = document.querySelector(".amenities-list");
  amenitiesList.innerHTML = "";
  if (prop.services && prop.services.length > 0) {
    prop.services.forEach(s => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="check-box"></span> ${s.name}`;
      amenitiesList.appendChild(li);
    });
  } else { amenitiesList.innerHTML = "<li>No amenities available</li>"; }

  // Map
  const lat = loc.latitude || null;
  const lng = loc.longitude || null;
  const uniName = loc.university ? loc.university.name : null;
  const distKm = loc.university ? loc.university.distance_km : null;
  setTimeout(() => initDetailsMap(lat, lng, addrDisplay, uniName, distKm), 250);

  document.getElementById("onePBackBtn").onclick = () => {
    document.getElementById("oneProperti").classList.add("d-none");
    sections.properties.classList.remove("d-none");
    if (detailsMap) { detailsMap.remove(); detailsMap = null; }
  };

  document.getElementById("onePBtnUpdate").onclick = () => openUpdateSection(prop);
}

document.getElementById("onePBtnUpdate").onclick = () => {};

// =====================================================
// DELETE PROPERTY
// =====================================================
let propertyIdToDelete = null;

document.getElementById("onePBtnDelete").onclick = () => {
  openDeleteModal(
    document.getElementById("idPropirtie").value,
    document.getElementById("onePTitle").textContent,
    document.getElementById("onePAddress").textContent,
    document.getElementById("onePMainImg")?.src || ""
  );
};

function openDeleteModal(id, title, address, img) {
  propertyIdToDelete = id;
  document.getElementById("deletePropTitle").textContent = title;
  document.getElementById("deletePropAddress").textContent = address;
  document.getElementById("deletePropImg").src = img;
  document.getElementById("deleteModal").classList.remove("d-none");
}

document.getElementById("cancelDeleteBtn").onclick = () => document.getElementById("deleteModal").classList.add("d-none");

document.getElementById("confirmDeleteBtn").onclick = async function () {
  if (!propertyIdToDelete) return;
  this.disabled = true; this.innerHTML = "Deleting...";
  try {
    const res = await fetch(`${API_BASE}/Properties/DeleteProperty?id=${propertyIdToDelete}`, { method: "DELETE" });
    if (res.ok) {
      Swal.fire({ icon: "success", title: "Deleted!", text: "Property deleted successfully." });
      document.getElementById("oneProperti").classList.add("d-none");
      sections.properties.classList.remove("d-none");
      if (detailsMap) { detailsMap.remove(); detailsMap = null; }
      fetchProperties(); fetchOwnerStats();
    } else {
      const err = await res.json();
      alert("Error: " + (err.message || "Could not delete."));
    }
  } catch (e) { console.error(e); alert("Connection Error!"); }
  finally { this.disabled = false; this.innerHTML = "Delete"; document.getElementById("deleteModal").classList.add("d-none"); }
};

// =====================================================
// BOOKING REQUESTS
// =====================================================
const ownerId = localStorage.getItem("id");
const bookingContainer = document.getElementById("bookingMainContent");
const messagesContainer = document.getElementById("messagesList");

async function fetchBookings() {
  try {
    const res = await fetch(`${API_BASE}/Booking/owner/${ownerId}`);
    const data = await res.json();
    const inProcess = (data.bookings || []).filter(b => b.statusName === "In-Process");
    const finished = (data.bookings || []).filter(b => b.statusName === "Booked" || b.statusName === "Cancelled");
    inProcess.length > 0 ? renderTable(inProcess) : renderEmptyBooking();
    finished.length > 0 ? renderMessagesCards(finished) : renderEmptyMessages();
  } catch (e) { console.error(e); renderEmptyBooking(); }
}

async function handleAction(bookingId, type) {
  const url = type === "accept"
    ? `${API_BASE}/Booking/${bookingId}/confirm?OwnerId=${ownerId}`
    : `${API_BASE}/Booking/${bookingId}/cancel`;
  try {
    const res = await fetch(url, { method: "PUT", headers: { accept: "*/*" } });
    const result = await res.json();
    if (res.ok) { Swal.fire({ icon: "success", title: type === "accept" ? "Confirmed!" : "Rejected!", timer: 1500, showConfirmButton: false }); setTimeout(() => fetchBookings(), 1600); }
    else alert("Error: " + (result.message || "Try again"));
  } catch (e) { console.error(e); alert("Connection error"); }
}

function renderTable(bookings) {
  bookingContainer.innerHTML = `
    <div class="custom-table-container">
      <table class="table custom-table mb-0">
        <thead><tr><th>Image</th><th>Student Name</th><th>Property</th><th>Date</th><th class="text-center">Actions</th></tr></thead>
        <tbody>${bookings.map(b => `
          <tr>
            <td><img src="${b.property.imageUrl}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;"></td>
            <td>${b.studentName}</td><td>${b.property.title}</td>
            <td>${new Date(b.createdAt).toLocaleDateString()}</td>
            <td class="text-center">
              <button class="btn-reject me-1" onclick="handleAction(${b.bookingId},'reject')">Reject</button>
              <button class="btn-accept" onclick="handleAction(${b.bookingId},'accept')">Accept</button>
            </td>
          </tr>`).join("")}
        </tbody></table></div>`;
}

function renderMessagesCards(bookings) {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = bookings.map(b => `
    <div class="msg-card mb-3">
      <div class="row align-items-center g-2">
        <div class="col-auto"><div style="width:70px;height:70px;overflow:hidden;border-radius:10px;"><img src="${b.property.imageUrl}" style="width:100%;height:100%;object-fit:cover;"></div></div>
        <div class="col text-start ps-3">
          <div class="fw-bold text-warning">${b.property.title}</div>
          <div class="small text-white">${b.studentName}</div>
          <div class="text-white-50" style="font-size:0.7rem;">Status: ${b.statusName}</div>
        </div>
        <div class="col-auto"><span class="status-btn-mock">${b.statusName === "Cancelled" ? "Rejected" : "Booked"}</span></div>
      </div>
    </div>`).join("");
}

function renderEmptyBooking() {
  bookingContainer.innerHTML = `<div class="col-12 text-center py-5 mt-5"><div class="mb-3"><img src="../img/icone-booking.svg" style="width:120px;"></div><h2 class="fw-bold" style="color:#FFC107;">No bookings yet.</h2></div>`;
}

function renderEmptyMessages() {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = `<div class="text-center mt-5"><h4 class="text-warning mt-3">No messages yet.</h4></div>`;
}

fetchBookings();
