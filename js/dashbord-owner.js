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
  const navItems = document.querySelectorAll(".sidebar nav ul li");
  navItems.forEach((item) => {
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
// MAP PICKER — SHARED LOGIC
// =====================================================
const API_BASE = "https://homunityapiv1.runasp.net/api";
let allUniversities = [];

async function fetchUniversities() {
  try {
    const res = await fetch(`${API_BASE}/Universities/GetAll`);
    const data = await res.json();
    allUniversities = data.universities || [];
  } catch (err) {
    console.warn("Could not load universities:", err);
  }
}
fetchUniversities();

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

function findNearestUniversity(lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  allUniversities.forEach(u => {
    const d = calculateDistance(lat, lng, u.latitude, u.longitude);
    if (parseFloat(d) < minDist) { minDist = parseFloat(d); nearest = u; }
  });
  return nearest ? { university: nearest, distance: minDist.toFixed(2) } : null;
}

function goldIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#efb81e,#d4a017);border:3px solid #212e43;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(33,46,67,0.4);display:flex;align-items:center;justify-content:center;">
             <i class="fa-solid fa-house" style="transform:rotate(45deg);color:#212e43;font-size:0.7rem;"></i>
           </div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
  });
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

async function searchLocationNominatim(query) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=eg&limit=1`);
  const data = await res.json();
  return data.length > 0 ? data[0] : null;
}

// =====================================================
// MAP PICKER — ADD PROPERTY
// =====================================================
let addMap = null;
let addMarker = null;
let addPickingMode = false;

function initAddMap() {
  if (addMap) return;
  addMap = L.map("addMap").setView([30.04, 31.23], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(addMap);

  // Add picking banner
  const banner = document.createElement("div");
  banner.id = "addPickingBanner";
  banner.className = "map-picking-banner";
  banner.textContent = "🖱️ Click anywhere on the map to set location";
  document.getElementById("addMapContainer").appendChild(banner);

  addMap.on("click", async function (e) {
    if (!addPickingMode) return;
    const { lat, lng } = e.latlng;
    await setAddLocation(lat, lng);
    setAddPickingMode(false);
  });
}

function setAddPickingMode(active) {
  addPickingMode = active;
  const banner = document.getElementById("addPickingBanner");
  const btn = document.getElementById("addManualBtn");
  const mapWrapper = document.getElementById("addMapContainer");
  if (active) {
    banner && banner.classList.add("show");
    btn && btn.classList.add("active");
    mapWrapper && mapWrapper.classList.add("map-picking-mode");
  } else {
    banner && banner.classList.remove("show");
    btn && btn.classList.remove("active");
    mapWrapper && mapWrapper.classList.remove("map-picking-mode");
  }
}

async function setAddLocation(lat, lng) {
  // Place marker
  if (addMarker) addMap.removeLayer(addMarker);
  addMarker = L.marker([lat, lng], { icon: goldIcon() }).addTo(addMap);
  addMap.flyTo([lat, lng], 15);

  // Reverse geocode
  const address = await reverseGeocode(lat, lng);

  // Find nearest university
  const nearest = findNearestUniversity(lat, lng);

  // Set hidden inputs
  document.getElementById("addLat").value = lat;
  document.getElementById("addLng").value = lng;
  document.getElementById("addAddress").value = address;

  // Update info box
  document.getElementById("addSelectedAddress").textContent = address;
  const uniEl = document.getElementById("addSelectedUni");

  if (nearest) {
    document.getElementById("addUniversityId").value = nearest.university.universityId;
    uniEl.textContent = `📍 Nearest: ${nearest.university.name} (${nearest.distance} km)`;
    addMarker.bindPopup(`<b style="color:#212e43">${address.split(",")[0]}</b><br><small>Near ${nearest.university.name}</small>`).openPopup();
  } else {
    document.getElementById("addUniversityId").value = "";
    uniEl.textContent = "";
  }

  document.getElementById("addLocationInfo").classList.remove("d-none");
  document.getElementById("addLocationError").style.display = "none";
}

// GPS Button — Add
document.getElementById("addGpsBtn").addEventListener("click", function () {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }
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
    (err) => {
      alert("Could not get your location. Please pick manually.");
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
      btn.disabled = false;
    }
  );
});

// Manual Pick Button — Add
document.getElementById("addManualBtn").addEventListener("click", function () {
  initAddMap();
  if (addPickingMode) {
    setAddPickingMode(false);
  } else {
    setAddPickingMode(true);
  }
});

// Search Button — Add
document.getElementById("addMapSearchBtn").addEventListener("click", async function () {
  const query = document.getElementById("addMapSearch").value.trim();
  if (!query) return;
  initAddMap();
  const result = await searchLocationNominatim(query);
  if (result) {
    await setAddLocation(parseFloat(result.lat), parseFloat(result.lon));
  } else {
    alert("Location not found. Try a different search.");
  }
});

document.getElementById("addMapSearch").addEventListener("keydown", async function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("addMapSearchBtn").click();
  }
});

// Init map when Add section becomes visible
menuItems.addProperties.addEventListener("click", () => {
  setTimeout(() => { initAddMap(); }, 200);
});

// =====================================================
// ADD PROPERTY — FORM SUBMIT
// =====================================================
const addPropertyForm = document.getElementById("addPropertyForm");

addPropertyForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("titleAdd");
  const price = document.getElementById("priceAdd");
  const rooms = document.getElementById("roomsAdd");
  const images = document.getElementById("images");
  const video = document.getElementById("video");
  const lat = document.getElementById("addLat").value;
  const lng = document.getElementById("addLng").value;
  const address = document.getElementById("addAddress").value;
  const universityId = document.getElementById("addUniversityId").value;

  let isValid = true;

  const toggleError = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? "block" : "none";
  };

  if (title.value.length < 5) { toggleError("titleError", true); isValid = false; }
  else { toggleError("titleError", false); }

  if (parseFloat(price.value) < 100 || !price.value) { toggleError("priceError", true); isValid = false; }
  else { toggleError("priceError", false); }

  if (parseInt(rooms.value) < 1 || parseInt(rooms.value) > 10 || !rooms.value) { toggleError("roomsError", true); isValid = false; }
  else { toggleError("roomsError", false); }

  if (!lat || !lng) {
    document.getElementById("addLocationError").style.display = "block";
    isValid = false;
  } else {
    document.getElementById("addLocationError").style.display = "none";
  }

  if (images.files.length > 6) { alert("Max 6 images allowed."); isValid = false; }
  for (let file of images.files) {
    if (file.size > 2 * 1024 * 1024) { alert(`Image ${file.name} is too large (Max 2MB).`); isValid = false; break; }
  }
  if (video.files.length > 0 && video.files[0].size > 30 * 1024 * 1024) { alert("Video size must be less than 30MB."); isValid = false; }

  if (!isValid) return;

  showLoader();

  try {
    const formData = new FormData();
    const ownerId = localStorage.getItem("id");

    formData.append("OwnerID", parseInt(ownerId));
    formData.append("Title", title.value);
    formData.append("Description", document.getElementById("descreptionAdd").value || "");
    formData.append("Price", parseFloat(price.value));
    formData.append("Rooms", parseInt(rooms.value));

    const propertyType = document.getElementById("apartmentApp").checked ? "Apartment" : "Room";
    formData.append("PropertyType", propertyType);

    // LocationID = 1 as default (backend will update it via SetPropertyLocation)
    formData.append("LocationID", 1);

    // GPS / Map data
    formData.append("Latitude", parseFloat(lat));
    formData.append("Longitude", parseFloat(lng));
    formData.append("Address", address);
    if (universityId) formData.append("UniversityId", parseInt(universityId));

    if (images.files.length > 0) {
      for (let i = 0; i < images.files.length; i++) formData.append("Images", images.files[i]);
    }
    if (video.files.length > 0) formData.append("Video", video.files[0]);

    const servicesMap = { wifi: 1, parking: 2, gym: 3, ac: 4 };
    Object.keys(servicesMap).forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.checked) formData.append("Services", parseInt(servicesMap[id]));
    });

    const response = await fetch(`${API_BASE}/Properties/CreateFullProperty`, { method: "POST", body: formData });

    if (response.ok) {
      await response.json();
      Swal.fire({ icon: "success", title: "Success!", text: "Property added successfully!" });
      addPropertyForm.reset();
      document.getElementById("addLocationInfo").classList.add("d-none");
      document.getElementById("addLat").value = "";
      document.getElementById("addLng").value = "";
      document.getElementById("addAddress").value = "";
      document.getElementById("addUniversityId").value = "";
      if (addMarker) { addMap.removeLayer(addMarker); addMarker = null; }
      sections.addProperties.classList.add("d-none");
      sections.properties.classList.remove("d-none");
      menuItems.addProperties.classList.remove("active");
      menuItems.properties.classList.add("active");
      fetchProperties();
      fetchOwnerStats();
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(errorData);
      alert("An error occurred while connecting to the server.");
    }
  } catch (error) {
    console.error(error);
    alert("An error occurred while connecting to the server.");
  } finally {
    hideLoader();
  }
});

document.getElementById("cancelAdd").addEventListener("click", () => {
  sections.addProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
  menuItems.addProperties.classList.remove("active");
  menuItems.properties.classList.add("active");
});

// =====================================================
// MAP PICKER — UPDATE PROPERTY
// =====================================================
let updateMap = null;
let updateMarker = null;
let updatePickingMode = false;

function initUpdateMap(lat, lng) {
  const center = (lat && lng) ? [lat, lng] : [30.04, 31.23];
  const zoom = (lat && lng) ? 15 : 11;

  if (updateMap) {
    updateMap.remove();
    updateMap = null;
    updateMarker = null;
  }

  updateMap = L.map("updateMap").setView(center, zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(updateMap);

  const banner = document.createElement("div");
  banner.id = "updatePickingBanner";
  banner.className = "map-picking-banner";
  banner.textContent = "🖱️ Click anywhere on the map to set location";
  document.getElementById("updateMapContainer").appendChild(banner);

  // If existing location, show marker
  if (lat && lng) {
    updateMarker = L.marker([lat, lng], { icon: goldIcon() }).addTo(updateMap);
  }

  updateMap.on("click", async function (e) {
    if (!updatePickingMode) return;
    const { lat, lng } = e.latlng;
    await setUpdateLocation(lat, lng);
    setUpdatePickingMode(false);
  });
}

function setUpdatePickingMode(active) {
  updatePickingMode = active;
  const banner = document.getElementById("updatePickingBanner");
  const btn = document.getElementById("updateManualBtn");
  const mapWrapper = document.getElementById("updateMapContainer");
  if (active) {
    banner && banner.classList.add("show");
    btn && btn.classList.add("active");
    mapWrapper && mapWrapper.classList.add("map-picking-mode");
  } else {
    banner && banner.classList.remove("show");
    btn && btn.classList.remove("active");
    mapWrapper && mapWrapper.classList.remove("map-picking-mode");
  }
}

async function setUpdateLocation(lat, lng) {
  if (updateMarker) updateMap.removeLayer(updateMarker);
  updateMarker = L.marker([lat, lng], { icon: goldIcon() }).addTo(updateMap);
  updateMap.flyTo([lat, lng], 15);

  const address = await reverseGeocode(lat, lng);
  const nearest = findNearestUniversity(lat, lng);

  document.getElementById("updateLat").value = lat;
  document.getElementById("updateLng").value = lng;
  document.getElementById("updateAddress").value = address;
  document.getElementById("updateSelectedAddress").textContent = address;

  const uniEl = document.getElementById("updateSelectedUni");
  if (nearest) {
    document.getElementById("updateUniversityId").value = nearest.university.universityId;
    uniEl.textContent = `📍 Nearest: ${nearest.university.name} (${nearest.distance} km)`;
    updateMarker.bindPopup(`<b style="color:#212e43">${address.split(",")[0]}</b><br><small>Near ${nearest.university.name}</small>`).openPopup();
  } else {
    document.getElementById("updateUniversityId").value = "";
    uniEl.textContent = "";
  }

  document.getElementById("updateLocationInfo").classList.remove("d-none");
}

// GPS Button — Update
document.getElementById("updateGpsBtn").addEventListener("click", function () {
  if (!navigator.geolocation) { alert("Geolocation is not supported by your browser."); return; }
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
      alert("Could not get your location. Please pick manually.");
      btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
      btn.disabled = false;
    }
  );
});

// Manual Pick Button — Update
document.getElementById("updateManualBtn").addEventListener("click", function () {
  if (updatePickingMode) setUpdatePickingMode(false);
  else setUpdatePickingMode(true);
});

// Search Button — Update
document.getElementById("updateMapSearchBtn").addEventListener("click", async function () {
  const query = document.getElementById("updateMapSearch").value.trim();
  if (!query) return;
  const result = await searchLocationNominatim(query);
  if (result) {
    await setUpdateLocation(parseFloat(result.lat), parseFloat(result.lon));
  } else {
    alert("Location not found. Try a different search.");
  }
});

document.getElementById("updateMapSearch").addEventListener("keydown", async function (e) {
  if (e.key === "Enter") { e.preventDefault(); document.getElementById("updateMapSearchBtn").click(); }
});

// =====================================================
// OWNER STATS
// =====================================================
async function fetchOwnerStats() {
  const ownerId = localStorage.getItem("id");
  if (!ownerId) return;
  try {
    const propResponse = await fetch(`${API_BASE}/Properties/GetByOwner?ownerId=${ownerId}`);
    const propData = await propResponse.json();
    const properties = Array.isArray(propData) ? propData : propData.properties || [];

    const bookingResponse = await fetch(`${API_BASE}/Booking/owner/${ownerId}`);
    const bookingData = await bookingResponse.json();
    const bookings = bookingData.bookings || [];

    const totalProps = document.getElementById("total-props");
    if (totalProps) totalProps.innerText = properties.length || 0;

    const approvedCount = document.getElementById("approved-count");
    const rejectedCount = document.getElementById("rejected-count");
    if (approvedCount) approvedCount.innerText = properties.filter(p => p.propertyStatusID === 2).length;
    if (rejectedCount) rejectedCount.innerText = properties.filter(p => p.propertyStatusID === 3).length;

    const pendingBooking = document.getElementById("pending-booking");
    const bookedCount = document.getElementById("booked-count");
    if (pendingBooking) pendingBooking.innerText = bookings.filter(b => b.statusName === "In-Process").length;
    if (bookedCount) bookedCount.innerText = bookings.filter(b => b.statusName === "Booked").length;
  } catch (error) {
    console.error("Error fetching owner stats:", error);
  }
}
fetchOwnerStats();

// =====================================================
// UPDATE PROPERTY — openUpdateSection
// =====================================================
let newPropertyFiles = [];
let newVideoFile = null;

function openUpdateSection(prop) {
  document.getElementById("oneProperti").classList.add("d-none");
  document.getElementById("sectionUpdateProperties").classList.remove("d-none");
  window.scrollTo(0, 0);

  newPropertyFiles = [];
  newVideoFile = null;

  document.getElementById("propertyIdUpdate").value = prop.propertyID;
  document.getElementById("titleUpdate").value = prop.title;
  document.getElementById("priceUpdate").value = prop.price;
  document.getElementById("roomsUpdate").value = prop.rooms;
  document.getElementById("descriptionUpdate").value = prop.description;

  if (prop.propertyType && prop.propertyType.toLowerCase() === "apartment") {
    document.getElementById("apartmentUpdate").checked = true;
  } else {
    document.getElementById("roomUpdate").checked = true;
  }

  // Services
  const checkboxes = ["wifiUpdate", "parkingUpdate", "gymUpdate", "acUpdate"];
  checkboxes.forEach(id => (document.getElementById(id).checked = false));
  if (prop.services) {
    prop.services.forEach(s => {
      const name = s.name.toLowerCase();
      if (name.includes("wifi")) document.getElementById("wifiUpdate").checked = true;
      if (name.includes("air")) document.getElementById("parkingUpdate").checked = true;
      if (name.includes("washing")) document.getElementById("gymUpdate").checked = true;
      if (name.includes("water")) document.getElementById("acUpdate").checked = true;
    });
  }

  // Init map with existing location
  const existingLat = prop.location && prop.location.latitude ? prop.location.latitude : null;
  const existingLng = prop.location && prop.location.longitude ? prop.location.longitude : null;

  setTimeout(() => {
    initUpdateMap(existingLat, existingLng);

    // Pre-fill location fields if existing
    if (existingLat && existingLng) {
      document.getElementById("updateLat").value = existingLat;
      document.getElementById("updateLng").value = existingLng;

      const existingAddress = prop.location.street
        ? `${prop.location.street}, ${prop.location.area}, ${prop.location.city}`
        : `${prop.location.area}, ${prop.location.city}`;

      document.getElementById("updateAddress").value = existingAddress;
      document.getElementById("updateSelectedAddress").textContent = existingAddress;

      const nearest = findNearestUniversity(existingLat, existingLng);
      if (nearest) {
        document.getElementById("updateUniversityId").value = nearest.university.universityId;
        document.getElementById("updateSelectedUni").textContent =
          `📍 Nearest: ${nearest.university.name} (${nearest.distance} km)`;
      }
      document.getElementById("updateLocationInfo").classList.remove("d-none");
    }
  }, 300);

  // Media
  const mediaContainer = document.getElementById("allImg");
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

  const imagesGrid = document.getElementById("imagesGrid");
  if (prop.images) {
    prop.images.forEach(img => { imagesGrid.appendChild(createMediaCard(img.imageUrl, "image")); });
  }
  const videoPreviewContainer = document.getElementById("videoPreviewContainer");
  if (prop.video && prop.video.videoUrl) {
    videoPreviewContainer.appendChild(createMediaCard(prop.video.videoUrl, "video"));
    document.getElementById("addVideoBtn").style.display = "none";
  }
  checkImageLimit();
}

function createMediaCard(url, type, isNew = false, fileName = "") {
  const div = document.createElement("div");
  div.className = "thumb-wrapper";
  if (isNew) div.dataset.fileName = fileName;
  let mediaContent = type === "image"
    ? `<div class="thumb-img" style="background-image: url('${url}')"></div>`
    : `<div class="thumb-img video-preview-wrapper"><video src="${url}" controls class="w-100 h-100 rounded-3"></video></div>`;
  div.innerHTML = `${mediaContent}<button type="button" class="delete-btn-yellow mt-2" onclick="removeMediaItem(this,'${type}')"><i class="fa fa-trash-alt"></i> Delete</button>`;
  return div;
}

function previewNewImages(input) {
  const imagesGrid = document.getElementById("imagesGrid");
  const files = Array.from(input.files);
  files.forEach(file => {
    if (imagesGrid.querySelectorAll(".thumb-wrapper").length >= 6) return;
    newPropertyFiles.push(file);
    const objectUrl = URL.createObjectURL(file);
    imagesGrid.appendChild(createMediaCard(objectUrl, "image", true, file.name));
  });
  checkImageLimit();
  input.value = "";
}

function previewNewVideo(input) {
  const container = document.getElementById("videoPreviewContainer");
  const file = input.files[0];
  if (file) {
    newVideoFile = file;
    const objectUrl = URL.createObjectURL(file);
    container.innerHTML = "";
    container.appendChild(createMediaCard(objectUrl, "video", true));
    document.getElementById("addVideoBtn").style.display = "none";
  }
  input.value = "";
}

function removeMediaItem(btn, type) {
  const parent = btn.parentElement;
  if (type === "image" && parent.dataset.fileName) {
    newPropertyFiles = newPropertyFiles.filter(f => f.name !== parent.dataset.fileName);
  } else if (type === "video") {
    newVideoFile = null;
    document.getElementById("addVideoBtn").style.display = "block";
  }
  parent.remove();
  checkImageLimit();
}

function checkImageLimit() {
  const count = document.getElementById("imagesGrid")?.querySelectorAll(".thumb-wrapper").length || 0;
  const btn = document.getElementById("addImageBtn");
  if (btn) btn.style.display = count >= 6 ? "none" : "inline-block";
}

// =====================================================
// UPDATE PROPERTY — FORM SUBMIT
// =====================================================
const updatePropertyForm = document.getElementById("updatePropertyForm");
updatePropertyForm?.addEventListener("submit", async function (e) {
  e.preventDefault();
  let isValid = true;

  function showError(input, messageId, isValidCondition, message) {
    const errorEl = document.getElementById(messageId);
    if (!isValidCondition) {
      input.classList.add("is-invalid");
      if (errorEl) { errorEl.style.display = "block"; errorEl.textContent = message; }
      isValid = false;
    } else {
      input.classList.remove("is-invalid");
      if (errorEl) { errorEl.style.display = "none"; errorEl.textContent = ""; }
    }
  }

  const title = document.getElementById("titleUpdate");
  const price = document.getElementById("priceUpdate");
  const rooms = document.getElementById("roomsUpdate");

  showError(title, "titleErrorUpdate", title.value.trim().length >= 5 && title.value.trim().length <= 100, "Title must be between 5 and 100 characters.");
  showError(price, "priceErrorUpdate", price.value && parseFloat(price.value) >= 100, "Price must be at least 100.");
  showError(rooms, "roomsErrorUpdate", rooms.value && parseInt(rooms.value) >= 1 && parseInt(rooms.value) <= 10, "Rooms must be between 1 and 10.");

  if (!isValid) return;

  showLoader();

  try {
    const formData = new FormData();

    formData.append("PropertyID", Number(document.getElementById("propertyIdUpdate").value));
    formData.append("Title", document.getElementById("titleUpdate").value);
    formData.append("Description", document.getElementById("descriptionUpdate").value);
    formData.append("Price", Number(document.getElementById("priceUpdate").value));
    formData.append("Rooms", Number(document.getElementById("roomsUpdate").value));

    // LocationID default
    formData.append("LocationID", 1);

    // Map data
    const updateLat = document.getElementById("updateLat").value;
    const updateLng = document.getElementById("updateLng").value;
    const updateAddress = document.getElementById("updateAddress").value;
    const updateUniId = document.getElementById("updateUniversityId").value;

    if (updateLat && updateLng) {
      formData.append("Latitude", parseFloat(updateLat));
      formData.append("Longitude", parseFloat(updateLng));
      formData.append("Address", updateAddress);
      if (updateUniId) formData.append("UniversityId", parseInt(updateUniId));
    }

    const selectedType = document.querySelector('input[name="propertyType"]:checked');
    let typeValue = "Apartment";
    if (selectedType) {
      typeValue = selectedType.value === "on"
        ? (selectedType.id === "apartmentUpdate" ? "Apartment" : "Room")
        : selectedType.value;
    }
    formData.append("PropertyType", typeValue);

    if (newPropertyFiles.length > 0) {
      newPropertyFiles.forEach(file => formData.append("NewImages", file));
    }

    if (newVideoFile) {
      formData.append("NewVideo", newVideoFile);
      formData.append("DeleteVideo", false);
    } else {
      const isVideoDeleted = document.querySelector(".video-preview-wrapper") === null;
      formData.append("DeleteVideo", isVideoDeleted);
    }

    const servicesList = [
      { id: "wifiUpdate", val: 1 },
      { id: "parkingUpdate", val: 2 },
      { id: "gymUpdate", val: 3 },
      { id: "acUpdate", val: 4 }
    ];
    servicesList.forEach(s => {
      if (document.getElementById(s.id).checked) formData.append("Services", s.val);
    });

    // Also call UpdatePropertyLocation if location changed
    const propId = Number(document.getElementById("propertyIdUpdate").value);
    if (updateLat && updateLng && updateUniId) {
      await fetch(`${API_BASE}/Location/UpdatePropertyLocation`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "accept": "*/*" },
        body: JSON.stringify({
          propertyId: propId,
          universityId: parseInt(updateUniId),
          address: updateAddress,
          lat: parseFloat(updateLat),
          lng: parseFloat(updateLng)
        })
      });
    }

    const response = await fetch(`${API_BASE}/Properties/UpdateFullProperty`, { method: "PUT", body: formData });
    const responseData = await response.json();

    if (response.ok) {
      Swal.fire({ icon: "success", title: "Updated!", text: "Property updated successfully." });
      sections.updateProperties.classList.add("d-none");
      sections.properties.classList.remove("d-none");
      fetchProperties();
      fetchOwnerStats();
    } else {
      console.error("Server Error:", responseData);
      alert("Failed: " + (responseData.message || "Check Console"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Connection Error.");
  } finally {
    hideLoader();
  }
});

document.getElementById("cancelUpdate").onclick = () => {
  sections.updateProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
};

// =====================================================
// GET PROPERTIES BY OWNER
// =====================================================
async function fetchProperties() {
  const container = document.getElementById("propertiesContainer");
  const ownerId = localStorage.getItem("id");

  if (!ownerId) {
    container.innerHTML = "<p class='text-center py-5 text-warning'>Please login to see your properties.</p>";
    return;
  }

  showLoader();

  try {
    const response = await fetch(`${API_BASE}/Properties/GetByOwner?ownerId=${ownerId}`);
    const data = await response.json();
    container.innerHTML = "";

    const properties = Array.isArray(data) ? data : data.properties || [];

    if (properties.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="mb-3"><img src="../img/icone-add-is-blank.svg" alt="No properties" style="width:150px;"></div>
          <h2 class="fw-bold" style="color:#FFC107;">No properties yet.</h2>
          <p class="fw-bold" style="color:#212E43;font-size:1.2rem;">Click here to add your first property</p>
          <button id="addPropertyy" class="btn mt-3 px-5 py-2 fw-bold" style="background-color:#212E43;color:#FFC107;border-radius:8px;font-size:1.2rem;">+Add</button>
        </div>`;
      return;
    }

    properties.forEach(prop => {
      let statusText = "In Progress";
      let statusClass = "bg-warning text-dark";
      if (prop.propertyStatusID === 2) { statusText = "Approved"; statusClass = "bg-success text-white"; }
      else if (prop.propertyStatusID === 3) { statusText = "Rejected"; statusClass = "bg-danger text-white"; }

      const imgUrl = prop.images && prop.images.length > 0 ? prop.images[0].imageUrl : "https://via.placeholder.com/150";

      container.innerHTML += `
        <div class="col-12 mb-3">
          <div class="property-card p-3 shadow-sm border rounded-3 bg-white">
            <div class="d-flex d-flex-mobile align-items-start gap-3">
              <img src="${imgUrl}" class="property-img" alt="property" style="width:120px;height:90px;object-fit:cover;border-radius:8px;">
              <div class="flex-grow-1">
                <h4 class="property-title mb-1 h6 fw-bold text-dark">${prop.title}</h4>
                <p class="property-info mb-1 text-muted small">
                  <i class="fas fa-location-dot me-1"></i> ${prop.location.street || ""}, ${prop.location.area}
                </p>
                <p class="property-price mb-0 fw-bold text-primary">$${prop.price} / month</p>
              </div>
              <div class="d-flex align-items-center justify-content-between h-100 gap-2 mt-3">
                <span class="badge ${statusClass}" style="font-size:10px;padding:5px 10px;">${statusText}</span>
                <button class="btn btn-outline-primary btn-sm rounded-5 px-4"
                  onclick="showPropertyDetails(${JSON.stringify(prop).replace(/"/g, "&quot;")})">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>`;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = "<p class='text-center text-danger py-5'>Error loading your properties.</p>";
  } finally {
    hideLoader();
  }
}

fetchProperties();

document.getElementById("propertiesContainer").addEventListener("click", (e) => {
  if (e.target && e.target.id === "addPropertyy") {
    sections.properties.classList.add("d-none");
    sections.addProperties.classList.remove("d-none");
    menuItems.addProperties.classList.add("active");
    menuItems.properties.classList.remove("active");
    setTimeout(() => { initAddMap(); }, 200);
  }
});

// =====================================================
// DETAILS MAP — read-only display
// =====================================================
let detailsMap = null;
let detailsMarker = null;

function initDetailsMap(lat, lng, address, uniName, distanceKm) {
  if (detailsMap) { detailsMap.remove(); detailsMap = null; detailsMarker = null; }

  const noLocEl = document.getElementById("detailsMapNoLocation");
  const mapInfoEl = document.getElementById("detailsMapInfo");
  const uniInfoEl = document.getElementById("detailsUniInfo");
  const uniTextEl = document.getElementById("detailsUniText");
  const mapAddressEl = document.getElementById("detailsMapAddress");

  if (!lat || !lng) {
    document.getElementById("detailsMap").style.display = "none";
    noLocEl.style.display = "flex";
    mapInfoEl.classList.add("d-none");
    uniInfoEl.classList.add("d-none");
    return;
  }

  document.getElementById("detailsMap").style.display = "block";
  noLocEl.style.display = "none";

  detailsMap = L.map("detailsMap", { zoomControl: true, scrollWheelZoom: false }).setView([lat, lng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(detailsMap);

  detailsMarker = L.marker([lat, lng], { icon: goldIcon() }).addTo(detailsMap);

  if (address) {
    detailsMarker.bindPopup(`<b style="color:#212e43">${address.split(",")[0]}</b>`).openPopup();
    mapAddressEl.textContent = address;
    mapInfoEl.classList.remove("d-none");
  }

  if (uniName) {
    uniTextEl.textContent = `Nearest University: ${uniName}${distanceKm ? ` — ${distanceKm} km away` : ""}`;
    uniInfoEl.classList.remove("d-none");
  } else {
    uniInfoEl.classList.add("d-none");
  }
}

// =====================================================
// SHOW PROPERTY DETAILS
// =====================================================
function showPropertyDetails(prop) {
  document.getElementById("oneProperti").classList.remove("d-none");
  sections.properties.classList.add("d-none");

  const images = prop.images && prop.images.length > 0
    ? prop.images
    : [{ imageUrl: "https://via.placeholder.com/150" }];

  document.getElementById("onePMainImg").src = images[0].imageUrl;
  document.getElementById("onePSideImgLeft").src = images[1] ? images[1].imageUrl : images[0].imageUrl;
  document.getElementById("onePSideImgRight").src = images[2] ? images[2].imageUrl : images[0].imageUrl;
  document.getElementById("onePThumb1").src = images[0].imageUrl;
  document.getElementById("onePThumb2").src = images[1] ? images[1].imageUrl : images[0].imageUrl;
  document.getElementById("onePThumb3").src = images[2] ? images[2].imageUrl : images[0].imageUrl;

  document.getElementById("onePTitle").textContent = prop.title;
  document.getElementById("idPropirtie").value = prop.propertyID;
  document.getElementById("onePAddress").textContent =
    `${prop.location.street || ""}, ${prop.location.area}, ${prop.location.city}`;
  document.getElementById("onePDescription").textContent = prop.description;
  document.getElementById("onePPrice").innerHTML = `<i class="fas fa-diamond"></i> Price $${prop.price} / month`;
  document.getElementById("onePRooms").innerHTML = `<i class="fas fa-diamond"></i> ${prop.rooms} rooms`;

  const amenitiesList = document.querySelector(".amenities-list");
  amenitiesList.innerHTML = "";
  if (prop.services && prop.services.length > 0) {
    prop.services.forEach(service => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="check-box"></span> ${service.name}`;
      amenitiesList.appendChild(li);
    });
  } else {
    amenitiesList.innerHTML = "<li>No amenities available</li>";
  }

  // Init details map
  const lat = prop.location ? prop.location.latitude : null;
  const lng = prop.location ? prop.location.longitude : null;
  const address = prop.location
    ? `${prop.location.street || ""}, ${prop.location.area}, ${prop.location.city}`
    : null;
  const uniName = prop.location && prop.location.university ? prop.location.university.name : null;
  const distKm = prop.location && prop.location.university ? prop.location.university.distance_km : null;

  setTimeout(() => { initDetailsMap(lat, lng, address, uniName, distKm); }, 300);

  document.getElementById("onePBackBtn").onclick = () => {
    document.getElementById("oneProperti").classList.add("d-none");
    sections.properties.classList.remove("d-none");
  };

  document.getElementById("onePBtnUpdate").onclick = () => { openUpdateSection(prop); };
}

document.getElementById("onePBtnUpdate").onclick = () => { };

// =====================================================
// DELETE PROPERTY
// =====================================================
let propertyIdToDelete = null;

document.getElementById("onePBtnDelete").onclick = () => {
  const title = document.getElementById("onePTitle").textContent;
  const address = document.getElementById("onePAddress").textContent;
  const img = document.getElementById("onePMainImg").src;
  const propId = document.getElementById("idPropirtie").value;
  openDeleteModal(propId, title, address, img);
};

function openDeleteModal(id, title, address, img) {
  propertyIdToDelete = id;
  document.getElementById("deletePropTitle").textContent = title;
  document.getElementById("deletePropAddress").textContent = address;
  document.getElementById("deletePropImg").src = img;
  document.getElementById("deleteModal").classList.remove("d-none");
}

document.getElementById("cancelDeleteBtn").onclick = () => {
  document.getElementById("deleteModal").classList.add("d-none");
};

document.getElementById("confirmDeleteBtn").onclick = async function () {
  if (!propertyIdToDelete) return;
  this.disabled = true;
  this.innerHTML = "Deleting...";
  try {
    const response = await fetch(`${API_BASE}/Properties/DeleteProperty?id=${propertyIdToDelete}`, { method: "DELETE" });
    if (response.ok) {
      Swal.fire({ icon: "success", title: "Deleted!", text: "Property deleted successfully." });
      document.getElementById("oneProperti").classList.add("d-none");
      sections.properties.classList.remove("d-none");
      fetchProperties();
      fetchOwnerStats();
    } else {
      const error = await response.json();
      alert("Error: " + (error.message || "Could not delete property. It might have active bookings."));
    }
  } catch (err) {
    console.error("Delete Error:", err);
    alert("Connection Error!");
  } finally {
    this.disabled = false;
    this.innerHTML = "Delete";
    document.getElementById("deleteModal").classList.add("d-none");
  }
};

// =====================================================
// BOOKING REQUESTS
// =====================================================
const ownerId = localStorage.getItem("id");
const bookingContainer = document.getElementById("bookingMainContent");
const messagesContainer = document.getElementById("messagesList");

async function fetchBookings() {
  try {
    const response = await fetch(`${API_BASE}/Booking/owner/${ownerId}`);
    const data = await response.json();
    const inProcess = (data.bookings || []).filter(b => b.statusName === "In-Process");
    const finished = (data.bookings || []).filter(b => b.statusName === "Booked" || b.statusName === "Cancelled");
    if (inProcess.length > 0) renderTable(inProcess);
    else renderEmptyBooking();
    if (finished.length > 0) renderMessagesCards(finished);
    else renderEmptyMessages();
  } catch (error) {
    console.error("Error:", error);
    renderEmptyBooking();
  }
}

async function handleAction(bookingId, type) {
  const url = type === "accept"
    ? `${API_BASE}/Booking/${bookingId}/confirm?OwnerId=${ownerId}`
    : `${API_BASE}/Booking/${bookingId}/cancel`;
  try {
    const response = await fetch(url, { method: "PUT", headers: { accept: "*/*" } });
    const result = await response.json();
    if (response.ok) {
      alert(type === "accept" ? "Booking Confirmed!" : "Booking Cancelled!");
      fetchBookings();
    } else {
      alert("Error: " + (result.message || "Try again"));
    }
  } catch (error) {
    console.error("Action Error:", error);
    alert("Connection error");
  }
}

function renderTable(bookings) {
  let tableHtml = `
    <div class="custom-table-container">
      <table class="table custom-table mb-0">
        <thead><tr><th>Image</th><th>Student Name</th><th>Property</th><th>Date</th><th class="text-center">Actions</th></tr></thead>
        <tbody>`;
  bookings.forEach(item => {
    tableHtml += `
      <tr>
        <td><img src="${item.property.imageUrl}" class="prop-img" style="width:50px;height:50px;border-radius:8px;object-fit:cover;"></td>
        <td>${item.studentName}</td>
        <td>${item.property.title}</td>
        <td>${new Date(item.createdAt).toLocaleDateString()}</td>
        <td class="text-center">
          <button class="btn-reject me-1" onclick="handleAction(${item.bookingId},'reject')">Reject</button>
          <button class="btn-accept" onclick="handleAction(${item.bookingId},'accept')">Accept</button>
        </td>
      </tr>`;
  });
  tableHtml += `</tbody></table></div>`;
  bookingContainer.innerHTML = tableHtml;
}

function renderMessagesCards(bookings) {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = bookings.map(item => `
    <div class="msg-card mb-3">
      <div class="row align-items-center g-2">
        <div class="col-auto">
          <div class="msg-img-container" style="width:70px;height:70px;overflow:hidden;border-radius:10px;">
            <img src="${item.property.imageUrl}" style="width:100%;height:100%;object-fit:cover;">
          </div>
        </div>
        <div class="col text-start ps-3">
          <div class="fw-bold text-warning">${item.property.title}</div>
          <div class="small text-white">${item.studentName}</div>
          <div class="text-white-50" style="font-size:0.7rem;">Status: ${item.statusName}</div>
        </div>
        <div class="col-auto">
          <span class="status-btn-mock">${item.statusName === "Cancelled" ? "Rejected" : "Booked"}</span>
        </div>
      </div>
    </div>`).join("");
}

function renderEmptyBooking() {
  bookingContainer.innerHTML = `
    <div class="col-12 text-center py-5 mt-5">
      <div class="mb-3"><img src="../img/icone-booking.svg" style="width:120px;"></div>
      <h2 class="fw-bold" style="color:#FFC107;font-size:2.5rem;">Sorry!</h2>
      <p class="fw-bold mt-3" style="color:#2D3E50;">No bookings yet. Start by making your first reservation</p>
    </div>`;
}

function renderEmptyMessages() {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = `
    <div class="text-center mt-5">
      <img src="../img/Vector-removebg-preview.png" class="w-25" />
      <h4 class="text-warning mt-3">Messages (Future)</h4>
      <p style="color:#212E43;" class="small">Placeholder for now <br /> Ready for future Chat Module</p>
    </div>`;
}

fetchBookings();
