// ============================================================
// HOMUNITY — Owner Dashboard JS
// ============================================================

const API = "https://homunityapiv1.runasp.net/api";

// ── Auth Guard ──
document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID   = localStorage.getItem("id");
  if (userRole !== "owner" || !userID) {
    Swal.fire({ icon: "error", title: "Error", text: "You cannot access the dashboard without logging in" });
    setTimeout(() => { window.location.href = "../html/form.html"; }, 3000);
  }
});

// ── Responsive Sidebar ──
document.addEventListener("DOMContentLoaded", function () {
  const sidebar   = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => sidebar.classList.toggle("active"));
  }
  document.querySelectorAll(".sidebar nav ul li").forEach(item => {
    item.addEventListener("click", () => {
      if (window.innerWidth < 992) sidebar.classList.remove("active");
    });
  });
});

// ── Sections & Menu ──
const sections = {
  properties:       document.getElementById("sectionProperties"),
  oneProperti:      document.getElementById("oneProperti"),
  addProperties:    document.getElementById("sectionAddProperties"),
  updateProperties: document.getElementById("sectionUpdateProperties"),
  booking:          document.getElementById("sectionBooking"),
  settingProperties:document.getElementById("sectionSettingProperties"),
  massageProperties:document.getElementById("sectionMassageProperties"),
};

const menuItems = {
  properties:       document.getElementById("properties"),
  addProperties:    document.getElementById("addProperties"),
  booking:          document.getElementById("BookingButton"),
  settingProperties:document.getElementById("settingProperties"),
  massageProperties:document.getElementById("massageProperties"),
};

function hideAllSections(item, option) {
  for (let key in item) {
    if (option === "add") item[key].classList.add("d-none");
    else item[key].classList.remove("active");
  }
}

for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => hideAllSections(sections, "add"));
}
for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => {
    hideAllSections(menuItems, "a");
    sections[key].classList.remove("d-none");
    menuItems[key].classList.add("active");
  });
}

// ── Loader ──
const laoding = document.getElementById("homunityLoader");
function showLoader() { laoding.classList.remove("d-none"); }
function hideLoader() { laoding.classList.add("d-none"); }

// ── MAP variables ──
let addMap = null, addMarker = null;
let addUniversities = [];
let addSelectedLat = null, addSelectedLng = null;
let addSelectedAddress = "";
let addSelectedUniversityId = null;

let updateMap = null, updateMarker = null;
let updateUniversities = [];
let updateSelectedLat = null, updateSelectedLng = null;
let updateSelectedAddress = "";
let updateSelectedUniversityId = null;

// ── Haversine ──
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371, toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(2);
}

function findNearestUniversity(lat, lng, unis) {
  let nearest = null, minDist = Infinity;
  unis.forEach(u => {
    const d = parseFloat(haversine(lat, lng, u.latitude, u.longitude));
    if (d < minDist) { minDist = d; nearest = u; }
  });
  return { university: nearest, distance: minDist.toFixed(2) };
}

// ── Fetch Universities once ──
async function fetchUniversities() {
  const res  = await fetch(`${API}/Universities/GetAll`);
  const data = await res.json();
  return data.universities || [];
}

// ── Nominatim reverse geocode ──
async function reverseGeocode(lat, lng) {
  try {
    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
}

// ── Init Add Map ──
function initAddMap() {
  if (addMap) return;
  addMap = L.map("addMap").setView([30.04, 31.23], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM" }).addTo(addMap);

  addMap.on("click", async e => {
    const { lat, lng } = e.latlng;
    if (addMarker) addMap.removeLayer(addMarker);
    addMarker = L.marker([lat, lng]).addTo(addMap);
    addSelectedLat = lat; addSelectedLng = lng;

    const addr = await reverseGeocode(lat, lng);
    addSelectedAddress = addr;
    document.getElementById("addMapAddress").value = addr;

    const { university, distance } = findNearestUniversity(lat, lng, addUniversities);
    if (university) {
      addSelectedUniversityId = university.universityId;
      document.getElementById("addMapUni").value = `${university.name} — ${distance} km`;
    }
  });

  // Search box
  document.getElementById("addMapSearch").addEventListener("keydown", async e => {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    if (!q) return;
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=eg`);
    const data = await res.json();
    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
      addMap.flyTo([latlng.lat, latlng.lng], 15);
      if (addMarker) addMap.removeLayer(addMarker);
      addMarker = L.marker([latlng.lat, latlng.lng]).addTo(addMap);
      addSelectedLat = latlng.lat; addSelectedLng = latlng.lng;
      addSelectedAddress = display_name;
      document.getElementById("addMapAddress").value = display_name;
      const { university, distance } = findNearestUniversity(latlng.lat, latlng.lng, addUniversities);
      if (university) {
        addSelectedUniversityId = university.universityId;
        document.getElementById("addMapUni").value = `${university.name} — ${distance} km`;
      }
    }
  });

  // Auto-detect
  document.getElementById("addDetectBtn").addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      addMap.flyTo([lat, lng], 15);
      if (addMarker) addMap.removeLayer(addMarker);
      addMarker = L.marker([lat, lng]).addTo(addMap);
      addSelectedLat = lat; addSelectedLng = lng;
      const addr = await reverseGeocode(lat, lng);
      addSelectedAddress = addr;
      document.getElementById("addMapAddress").value = addr;
      const { university, distance } = findNearestUniversity(lat, lng, addUniversities);
      if (university) {
        addSelectedUniversityId = university.universityId;
        document.getElementById("addMapUni").value = `${university.name} — ${distance} km`;
      }
    }, () => alert("Could not get location"));
  });
}

// ── Init Update Map ──
function initUpdateMap(initLat, initLng) {
  const center = (initLat && initLng) ? [initLat, initLng] : [30.04, 31.23];
  const zoom   = (initLat && initLng) ? 15 : 11;

  if (updateMap) {
    updateMap.setView(center, zoom);
    if (initLat && initLng) {
      if (updateMarker) updateMap.removeLayer(updateMarker);
      updateMarker = L.marker([initLat, initLng]).addTo(updateMap);
    }
    updateMap.invalidateSize();
    return;
  }

  updateMap = L.map("updateMap").setView(center, zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM" }).addTo(updateMap);

  if (initLat && initLng) {
    updateMarker = L.marker([initLat, initLng]).addTo(updateMap);
    updateSelectedLat = initLat; updateSelectedLng = initLng;
  }

  updateMap.on("click", async e => {
    const { lat, lng } = e.latlng;
    if (updateMarker) updateMap.removeLayer(updateMarker);
    updateMarker = L.marker([lat, lng]).addTo(updateMap);
    updateSelectedLat = lat; updateSelectedLng = lng;
    const addr = await reverseGeocode(lat, lng);
    updateSelectedAddress = addr;
    document.getElementById("updateMapAddress").value = addr;
    const { university, distance } = findNearestUniversity(lat, lng, updateUniversities);
    if (university) {
      updateSelectedUniversityId = university.universityId;
      document.getElementById("updateMapUni").value = `${university.name} — ${distance} km`;
    }
  });

  document.getElementById("updateMapSearch").addEventListener("keydown", async e => {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    if (!q) return;
    const res  = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=eg`);
    const data = await res.json();
    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
      updateMap.flyTo([latlng.lat, latlng.lng], 15);
      if (updateMarker) updateMap.removeLayer(updateMarker);
      updateMarker = L.marker([latlng.lat, latlng.lng]).addTo(updateMap);
      updateSelectedLat = latlng.lat; updateSelectedLng = latlng.lng;
      updateSelectedAddress = display_name;
      document.getElementById("updateMapAddress").value = display_name;
      const { university, distance } = findNearestUniversity(latlng.lat, latlng.lng, updateUniversities);
      if (university) {
        updateSelectedUniversityId = university.universityId;
        document.getElementById("updateMapUni").value = `${university.name} — ${distance} km`;
      }
    }
  });

  document.getElementById("updateDetectBtn").addEventListener("click", () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      updateMap.flyTo([lat, lng], 15);
      if (updateMarker) updateMap.removeLayer(updateMarker);
      updateMarker = L.marker([lat, lng]).addTo(updateMap);
      updateSelectedLat = lat; updateSelectedLng = lng;
      const addr = await reverseGeocode(lat, lng);
      updateSelectedAddress = addr;
      document.getElementById("updateMapAddress").value = addr;
      const { university, distance } = findNearestUniversity(lat, lng, updateUniversities);
      if (university) {
        updateSelectedUniversityId = university.universityId;
        document.getElementById("updateMapUni").value = `${university.name} — ${distance} km`;
      }
    }, () => alert("Could not get location"));
  });
}

// ── Init Details Map (read-only) ──
let detailsMap = null;
function initDetailsMap(lat, lng, uniLat, uniLng, uniName) {
  if (detailsMap) {
    detailsMap.remove();
    detailsMap = null;
  }
  detailsMap = L.map("detailsMap").setView([lat, lng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM" }).addTo(detailsMap);
  L.marker([lat, lng]).addTo(detailsMap).bindPopup("📍 Property Location").openPopup();
  if (uniLat && uniLng) {
    L.marker([uniLat, uniLng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="background:#efb81e;border:2px solid #212e43;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:12px;">🎓</div>`,
        iconSize: [22, 22]
      })
    }).addTo(detailsMap).bindPopup(`🎓 ${uniName}`);
  }
}

// ── Owner Stats ──
async function fetchOwnerStats() {
  const ownerId = localStorage.getItem("id");
  if (!ownerId) return;
  try {
    const [propRes, bookRes] = await Promise.all([
      fetch(`${API}/Properties/GetByOwnerV2?ownerId=${ownerId}`),
      fetch(`${API}/Booking/owner/${ownerId}`)
    ]);
    const propData  = await propRes.json();
    const bookData  = await bookRes.json();
    const props     = Array.isArray(propData) ? propData : propData.properties || [];
    const bookings  = bookData.bookings || [];

    document.getElementById("total-props").innerText    = props.length;
    document.getElementById("approved-count").innerText = props.filter(p => p.propertyStatusID === 2).length;
    document.getElementById("rejected-count").innerText = props.filter(p => p.propertyStatusID === 3).length;
    document.getElementById("pending-booking").innerText = bookings.filter(b => b.statusName === "In-Process").length;
    document.getElementById("booked-count").innerText    = bookings.filter(b => b.statusName === "Booked").length;
  } catch (e) { console.error(e); }
}
fetchOwnerStats();

// ── Fetch Properties By Owner (V2) ──
async function fetchProperties() {
  const container = document.getElementById("propertiesContainer");
  const ownerId   = localStorage.getItem("id");
  if (!ownerId) { container.innerHTML = "<p class='text-center py-5 text-warning'>Please login.</p>"; return; }

  showLoader();
  try {
    const res  = await fetch(`${API}/Properties/GetByOwnerV2?ownerId=${ownerId}`);
    const data = await res.json();
    container.innerHTML = "";
    const properties = Array.isArray(data) ? data : data.properties || [];

    if (properties.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <img src="../img/icone-add-is-blank.svg" style="width:150px;">
          <h2 class="fw-bold" style="color:#FFC107;">No properties yet.</h2>
          <button id="addPropertyy" class="btn mt-3 px-5 py-2 fw-bold"
            style="background:#212E43;color:#FFC107;border-radius:8px;font-size:1.2rem;">+Add</button>
        </div>`;
      return;
    }

    properties.forEach(prop => {
      const statusText  = prop.propertyStatusID === 2 ? "Approved" : prop.propertyStatusID === 3 ? "Rejected" : "In Progress";
      const statusClass = prop.propertyStatusID === 2 ? "bg-success text-white" : prop.propertyStatusID === 3 ? "bg-danger text-white" : "bg-warning text-dark";
      const imgUrl      = prop.images?.[0]?.imageUrl || "https://via.placeholder.com/150";
      const loc         = prop.location || {};
      const address     = loc.street ? `${loc.street}, ${loc.area}` : loc.area || "No address";
      const uniInfo     = loc.university ? `<div class="small text-muted mt-1">🎓 ${loc.university.name}${loc.university.distance_km ? ` — ${loc.university.distance_km} km` : ""}</div>` : "";

      container.innerHTML += `
        <div class="col-12 mb-3">
          <div class="property-card p-3 shadow-sm border rounded-3 bg-white">
            <div class="d-flex align-items-start gap-3">
              <img src="${imgUrl}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/120x90'">
              <div class="flex-grow-1">
                <h4 class="h6 fw-bold text-dark mb-1">${prop.title}</h4>
                <p class="text-muted small mb-1"><i class="fas fa-location-dot me-1"></i>${address}</p>
                ${uniInfo}
                <p class="fw-bold mb-0" style="color:#efb81e;">$${prop.price} / month</p>
              </div>
              <div class="d-flex flex-column align-items-end gap-2 mt-1">
                <span class="badge ${statusClass}" style="font-size:10px;padding:5px 10px;">${statusText}</span>
                <button class="btn btn-sm fw-bold"
                  style="border:2px solid #1e283c;color:#1e283c;border-radius:20px;padding:4px 16px;"
                  onmouseover="this.style.backgroundColor='#1e283c';this.style.color='#fff';"
                  onmouseout="this.style.backgroundColor='transparent';this.style.color='#1e283c';"
                  onclick='showPropertyDetails(${JSON.stringify(prop).replace(/"/g,"&quot;")})'>
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>`;
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = "<p class='text-center text-danger py-5'>Error loading properties.</p>";
  } finally { hideLoader(); }
}
fetchProperties();

document.getElementById("propertiesContainer").addEventListener("click", e => {
  if (e.target?.id === "addPropertyy") {
    sections.properties.classList.add("d-none");
    sections.addProperties.classList.remove("d-none");
    menuItems.addProperties.classList.add("active");
    menuItems.properties.classList.remove("active");
  }
});

// ── Show Property Details (Owner) ──
function showPropertyDetails(prop) {
  document.getElementById("oneProperti").classList.remove("d-none");
  sections.properties.classList.add("d-none");

  const images = prop.images?.length ? prop.images : [{ imageUrl: "https://via.placeholder.com/400" }];
  document.getElementById("onePMainImg").src       = images[0].imageUrl;
  document.getElementById("onePSideImgLeft").src   = images[1]?.imageUrl || images[0].imageUrl;
  document.getElementById("onePSideImgRight").src  = images[2]?.imageUrl || images[0].imageUrl;
  document.getElementById("onePThumb1").src = images[0].imageUrl;
  document.getElementById("onePThumb2").src = images[1]?.imageUrl || images[0].imageUrl;
  document.getElementById("onePThumb3").src = images[2]?.imageUrl || images[0].imageUrl;

  document.getElementById("onePTitle").textContent       = prop.title || "";
  document.getElementById("idPropirtie").value            = prop.propertyID;
  const loc = prop.location || {};
  const addr = [loc.street, loc.area, loc.city].filter(Boolean).join(", ");
  document.getElementById("onePAddress").textContent     = addr || "No address";
  document.getElementById("onePDescription").textContent = prop.description || "";
  document.getElementById("onePPrice").innerHTML  = `<i class="fas fa-diamond"></i> Price $${prop.price} / month`;
  document.getElementById("onePRooms").innerHTML  = `<i class="fas fa-diamond"></i> ${prop.rooms} rooms`;

  // Services
  const amenitiesList = document.querySelector("#oneProperti .amenities-list");
  if (amenitiesList) {
    amenitiesList.innerHTML = prop.services?.length
      ? prop.services.map(s => `<li><span class="check-box"></span> ${s.name}</li>`).join("")
      : "<li>No amenities available</li>";
  }

  // Map
  const mapSection = document.getElementById("onePMapSection");
  if (loc.latitude && loc.longitude) {
    mapSection.classList.remove("d-none");
    setTimeout(() => {
      const uniLat  = loc.university ? null : null; // uni coords not in V2 response directly
      initDetailsMap(loc.latitude, loc.longitude, null, null, "");
    }, 200);
    // University info row
    const uniRow = document.getElementById("onePUniRow");
    if (uniRow && loc.university) {
      uniRow.style.display = "";
      document.getElementById("onePUni").innerHTML =
        `<i class="fas fa-diamond"></i> 🎓 ${loc.university.name}${loc.university.distance_km ? ` (${loc.university.distance_km} km)` : ""}`;
    }
  } else {
    mapSection.classList.add("d-none");
  }

  document.getElementById("onePBackBtn").onclick = () => {
    document.getElementById("oneProperti").classList.add("d-none");
    sections.properties.classList.remove("d-none");
  };
  document.getElementById("onePBtnUpdate").onclick = () => openUpdateSection(prop);
}

// ── Add Property ──

// Load universities for Add map when section opens
menuItems.addProperties.addEventListener("click", async () => {
  await new Promise(r => setTimeout(r, 100)); // wait for DOM
  if (addUniversities.length === 0) addUniversities = await fetchUniversities();
  initAddMap();
  setTimeout(() => addMap && addMap.invalidateSize(), 300);
});

const addPropertyForm = document.getElementById("addPropertyForm");
addPropertyForm.addEventListener("submit", async e => {
  e.preventDefault();
  const title  = document.getElementById("titleAdd");
  const price  = document.getElementById("priceAdd");
  const rooms  = document.getElementById("roomsAdd");
  let isValid  = true;

  const toggleError = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.style.display = show ? "block" : "none";
  };

  if (title.value.length < 5) { toggleError("titleError", true); isValid = false; } else toggleError("titleError", false);
  if (parseFloat(price.value) < 100 || !price.value) { toggleError("priceError", true); isValid = false; } else toggleError("priceError", false);
  if (parseInt(rooms.value) < 1 || parseInt(rooms.value) > 10 || !rooms.value) { toggleError("roomsError", true); isValid = false; } else toggleError("roomsError", false);

  const images = document.getElementById("images");
  const video  = document.getElementById("video");
  if (images.files.length > 6) { alert("Max 6 images."); isValid = false; }
  for (let f of images.files) if (f.size > 2*1024*1024) { alert(`Image ${f.name} too large.`); isValid = false; break; }
  if (video.files.length > 0 && video.files[0].size > 30*1024*1024) { alert("Video too large."); isValid = false; }

  if (!isValid) return;

  showLoader();
  const ownerId  = localStorage.getItem("id");
  const formData = new FormData();
  formData.append("OwnerID", parseInt(ownerId));
  formData.append("Title", title.value);
  formData.append("Description", document.getElementById("descreptionAdd").value || "");
  formData.append("Price", parseFloat(price.value));
  formData.append("Rooms", parseInt(rooms.value));
  formData.append("PropertyType", document.getElementById("apartmentApp").checked ? "Apartment" : "Room");

  // Location — use default locationId=1 as placeholder, will be updated via SetPropertyLocation
  formData.append("LocationID", 1);

  if (images.files.length > 0)
    for (let i = 0; i < images.files.length; i++) formData.append("Images", images.files[i]);
  if (video.files.length > 0) formData.append("Video", video.files[0]);

  const servicesMap = { wifi: 1, parking: 2, gym: 3, ac: 4 };
  Object.keys(servicesMap).forEach(id => {
    const el = document.getElementById(id);
    if (el?.checked) formData.append("Services", servicesMap[id]);
  });

  try {
    const res    = await fetch(`${API}/Properties/CreateFullProperty`, { method: "POST", body: formData });
    const result = await res.json();
    if (res.ok) {
      const propId = result.propertyID;
      // Save location if selected
      if (addSelectedLat && addSelectedUniversityId) {
        await fetch(`${API}/Location/SetPropertyLocation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId:   propId,
            universityId: addSelectedUniversityId,
            address:      addSelectedAddress,
            lat:          addSelectedLat,
            lng:          addSelectedLng
          })
        });
      }
      Swal.fire({ icon: "success", title: "Property added successfully!" });
      addPropertyForm.reset();
      // reset map state
      addSelectedLat = null; addSelectedLng = null; addSelectedUniversityId = null;
      if (addMarker) { addMap.removeLayer(addMarker); addMarker = null; }
      document.getElementById("addMapAddress").value = "";
      document.getElementById("addMapUni").value     = "";
      hideAllSections(sections, "add");
      sections.properties.classList.remove("d-none");
      menuItems.properties.classList.add("active");
      menuItems.addProperties.classList.remove("active");
      fetchProperties();
    } else {
      Swal.fire({ icon: "error", title: "Failed", text: result.message || "Error" });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Connection Error" });
  } finally { hideLoader(); }
});

document.getElementById("cancelAdd").addEventListener("click", () => {
  sections.addProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
  menuItems.addProperties.classList.remove("active");
  menuItems.properties.classList.add("active");
});

// ── Update Property ──
let newPropertyFiles = [];
let newVideoFile     = null;
let currentUpdateProp = null;

function openUpdateSection(prop) {
  currentUpdateProp = prop;
  document.getElementById("oneProperti").classList.add("d-none");
  document.getElementById("sectionUpdateProperties").classList.remove("d-none");
  window.scrollTo(0, 0);
  newPropertyFiles = []; newVideoFile = null;

  document.getElementById("propertyIdUpdate").value = prop.propertyID;
  document.getElementById("titleUpdate").value       = prop.title;
  document.getElementById("priceUpdate").value       = prop.price;
  document.getElementById("roomsUpdate").value       = prop.rooms;
  document.getElementById("descriptionUpdate").value = prop.description;

  if (prop.propertyType?.toLowerCase() === "apartment")
    document.getElementById("apartmentUpdate").checked = true;
  else document.getElementById("roomUpdate").checked = true;

  const checkboxes = ["wifiUpdate","parkingUpdate","gymUpdate","acUpdate"];
  checkboxes.forEach(id => document.getElementById(id).checked = false);
  if (prop.services) {
    prop.services.forEach(s => {
      const n = s.name.toLowerCase();
      if (n.includes("wifi"))    document.getElementById("wifiUpdate").checked    = true;
      if (n.includes("air"))     document.getElementById("parkingUpdate").checked = true;
      if (n.includes("washing")) document.getElementById("gymUpdate").checked     = true;
      if (n.includes("water"))   document.getElementById("acUpdate").checked      = true;
    });
  }

  // Media
  const mediaContainer = document.getElementById("allImg");
  mediaContainer.innerHTML = `
    <div class="upload-wrapper w-100">
      <div class="row g-3">
        <div class="col-lg-9 col-12 border-end-divider">
          <div class="mb-3">
            <button type="button" id="addImageBtn" class="add-btn-yellow"
              onclick="document.getElementById('newImagesInput').click()">+Add Image</button>
            <input type="file" id="newImagesInput" multiple accept="image/*" class="d-none" onchange="previewNewImages(this)">
          </div>
          <div id="imagesGrid" class="images-grid-layout"></div>
        </div>
        <div class="col-lg-3 col-12 ps-lg-4">
          <div class="mb-3">
            <button type="button" id="addVideoBtn" class="add-btn-yellow w-100"
              onclick="document.getElementById('newVideoInput').click()">+Add Video</button>
            <input type="file" id="newVideoInput" accept="video/*" class="d-none" onchange="previewNewVideo(this)">
          </div>
          <div id="videoPreviewContainer"></div>
        </div>
      </div>
    </div>`;

  const imagesGrid = document.getElementById("imagesGrid");
  if (prop.images) prop.images.forEach(img => imagesGrid.appendChild(createMediaCard(img.imageUrl, "image")));
  const videoPreviewContainer = document.getElementById("videoPreviewContainer");
  if (prop.video?.videoUrl) {
    videoPreviewContainer.appendChild(createMediaCard(prop.video.videoUrl, "video"));
    document.getElementById("addVideoBtn").style.display = "none";
  }
  checkImageLimit();

  // Init update map
  const loc = prop.location || {};
  const initLat = loc.latitude  || null;
  const initLng = loc.longitude || null;

  // Reset update map state
  updateSelectedLat = initLat; updateSelectedLng = initLng;
  updateSelectedAddress = loc.street || "";
  updateSelectedUniversityId = loc.university?.universityId || null;

  fetchUniversities().then(unis => {
    updateUniversities = unis;
    setTimeout(() => {
      initUpdateMap(initLat, initLng);
      updateMap && updateMap.invalidateSize();
    }, 300);
  });

  // Prefill address & uni
  if (initLat) {
    document.getElementById("updateMapAddress").value = loc.street || `${initLat.toFixed(5)}, ${initLng.toFixed(5)}`;
  }
  if (loc.university) {
    document.getElementById("updateMapUni").value = `${loc.university.name}${loc.university.distance_km ? ` — ${loc.university.distance_km} km` : ""}`;
  }
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
  const imagesGrid = document.getElementById("imagesGrid");
  Array.from(input.files).forEach(file => {
    if (imagesGrid.querySelectorAll(".thumb-wrapper").length >= 6) return;
    newPropertyFiles.push(file);
    imagesGrid.appendChild(createMediaCard(URL.createObjectURL(file), "image", true, file.name));
  });
  checkImageLimit();
  input.value = "";
}

function previewNewVideo(input) {
  const container = document.getElementById("videoPreviewContainer");
  const file = input.files[0];
  if (file) {
    newVideoFile = file;
    container.innerHTML = "";
    container.appendChild(createMediaCard(URL.createObjectURL(file), "video", true));
    document.getElementById("addVideoBtn").style.display = "none";
  }
  input.value = "";
}

function removeMediaItem(btn, type) {
  const parent = btn.parentElement;
  if (type === "image" && parent.dataset.fileName)
    newPropertyFiles = newPropertyFiles.filter(f => f.name !== parent.dataset.fileName);
  else if (type === "video") {
    newVideoFile = null;
    document.getElementById("addVideoBtn").style.display = "block";
  }
  parent.remove();
  checkImageLimit();
}

function checkImageLimit() {
  const count = document.getElementById("imagesGrid")?.querySelectorAll(".thumb-wrapper").length || 0;
  const btn   = document.getElementById("addImageBtn");
  if (btn) btn.style.display = count >= 6 ? "none" : "inline-block";
}

const updatePropertyForm = document.getElementById("updatePropertyForm");
updatePropertyForm?.addEventListener("submit", async function (e) {
  e.preventDefault();
  let isValid = true;

  function showError(input, msgId, condition, msg) {
    const el = document.getElementById(msgId);
    if (!condition) {
      input.classList.add("is-invalid");
      if (el) { el.style.display = "block"; el.textContent = msg; }
      isValid = false;
    } else {
      input.classList.remove("is-invalid");
      if (el) { el.style.display = "none"; el.textContent = ""; }
    }
  }

  const title = document.getElementById("titleUpdate");
  const price = document.getElementById("priceUpdate");
  const rooms = document.getElementById("roomsUpdate");
  showError(title, "titleErrorUpdate", title.value.trim().length >= 5 && title.value.trim().length <= 100, "Title must be 5–100 chars.");
  showError(price, "priceErrorUpdate", price.value && parseFloat(price.value) >= 100, "Price must be ≥ 100.");
  showError(rooms, "roomsErrorUpdate", rooms.value && parseInt(rooms.value) >= 1 && parseInt(rooms.value) <= 10, "Rooms must be 1–10.");
  if (!isValid) return;

  showLoader();
  try {
    const formData = new FormData();
    formData.append("PropertyID", Number(document.getElementById("propertyIdUpdate").value));
    formData.append("Title",       title.value);
    formData.append("Description", document.getElementById("descriptionUpdate").value);
    formData.append("Price",       Number(price.value));
    formData.append("Rooms",       Number(rooms.value));
    formData.append("LocationID",  currentUpdateProp?.location?.locationId || 1);

    const selectedType = document.querySelector('input[name="propertyType"]:checked');
    let typeValue = "Apartment";
    if (selectedType) {
      typeValue = selectedType.value === "on"
        ? (selectedType.id === "apartmentUpdate" ? "Apartment" : "Room")
        : selectedType.value;
    }
    formData.append("PropertyType", typeValue);

    if (newPropertyFiles.length > 0) newPropertyFiles.forEach(f => formData.append("NewImages", f));

    if (newVideoFile) {
      formData.append("NewVideo", newVideoFile);
      formData.append("DeleteVideo", false);
    } else {
      formData.append("DeleteVideo", document.querySelector(".video-preview-wrapper") === null);
    }

    [{ id: "wifiUpdate", val: 1 }, { id: "parkingUpdate", val: 2 }, { id: "gymUpdate", val: 3 }, { id: "acUpdate", val: 4 }]
      .forEach(s => { if (document.getElementById(s.id).checked) formData.append("Services", s.val); });

    const res = await fetch(`${API}/Properties/UpdateFullProperty`, { method: "PUT", body: formData });
    const responseData = await res.json();

    if (res.ok) {
      const propId = Number(document.getElementById("propertyIdUpdate").value);
      // Save location if changed
      if (updateSelectedLat && updateSelectedUniversityId) {
        await fetch(`${API}/Location/UpdatePropertyLocation`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId:   propId,
            universityId: updateSelectedUniversityId,
            address:      updateSelectedAddress,
            lat:          updateSelectedLat,
            lng:          updateSelectedLng
          })
        });
      }
      Swal.fire({ icon: "success", title: "Updated Successfully!" });
      sections.updateProperties.classList.add("d-none");
      sections.properties.classList.remove("d-none");
      fetchProperties();
    } else {
      Swal.fire({ icon: "error", title: "Failed", text: responseData.message || "Check console" });
    }
  } catch (err) {
    console.error(err);
    Swal.fire({ icon: "error", title: "Connection Error" });
  } finally { hideLoader(); }
});

document.getElementById("cancelUpdate").onclick = () => {
  sections.updateProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
};

// ── Delete ──
let propertyIdToDelete = null;

document.getElementById("onePBtnDelete").onclick = () => {
  const title   = document.getElementById("onePTitle").textContent;
  const address = document.getElementById("onePAddress").textContent;
  const img     = document.getElementById("onePMainImg").src;
  const propId  = document.getElementById("idPropirtie").value;
  openDeleteModal(propId, title, address, img);
};

function openDeleteModal(id, title, address, img) {
  propertyIdToDelete = id;
  document.getElementById("deletePropTitle").textContent   = title;
  document.getElementById("deletePropAddress").textContent = address;
  document.getElementById("deletePropImg").src             = img;
  document.getElementById("deleteModal").classList.remove("d-none");
}

document.getElementById("cancelDeleteBtn").onclick = () => document.getElementById("deleteModal").classList.add("d-none");

document.getElementById("confirmDeleteBtn").onclick = async function () {
  if (!propertyIdToDelete) return;
  this.disabled = true; this.innerHTML = "Deleting...";
  try {
    const res = await fetch(`${API}/Properties/DeleteProperty?id=${propertyIdToDelete}`, { method: "DELETE" });
    if (res.ok) {
      Swal.fire({ icon: "success", title: "Property Deleted!" });
      document.getElementById("oneProperti").classList.add("d-none");
      sections.properties.classList.remove("d-none");
      fetchProperties();
    } else {
      const err = await res.json();
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Cannot delete — may have active bookings." });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "Connection Error" });
  } finally {
    this.disabled = false; this.innerHTML = "Delete";
    document.getElementById("deleteModal").classList.add("d-none");
  }
};

// ── Booking ──
const ownerId         = localStorage.getItem("id");
const bookingContainer = document.getElementById("bookingMainContent");
const messagesContainer = document.getElementById("messagesList");

async function fetchBookings() {
  try {
    const res  = await fetch(`${API}/Booking/owner/${ownerId}`);
    const data = await res.json();
    const inProcess = (data.bookings || []).filter(b => b.statusName === "In-Process");
    const finished  = (data.bookings || []).filter(b => b.statusName === "Booked" || b.statusName === "Cancelled");
    if (inProcess.length > 0) renderTable(inProcess); else renderEmptyBooking();
    if (finished.length > 0)  renderMessagesCards(finished); else renderEmptyMessages();
  } catch (e) { renderEmptyBooking(); }
}

async function handleAction(bookingId, type) {
  const url = type === "accept"
    ? `${API}/Booking/${bookingId}/confirm?OwnerId=${ownerId}`
    : `${API}/Booking/${bookingId}/cancel`;
  try {
    const res = await fetch(url, { method: "PUT", headers: { accept: "*/*" } });
    const result = await res.json();
    if (res.ok) { alert(type === "accept" ? "Booking Confirmed!" : "Booking Cancelled!"); location.reload(); }
    else alert("Error: " + (result.message || "Try again"));
  } catch (e) { alert("Connection error"); }
}

function renderTable(bookings) {
  bookingContainer.innerHTML = `
    <div class="custom-table-container">
      <table class="table custom-table mb-0">
        <thead><tr><th>Image</th><th>Student Name</th><th>Property</th><th>Date</th><th class="text-center">Actions</th></tr></thead>
        <tbody>
          ${bookings.map(item => `
            <tr>
              <td><img src="${item.property.imageUrl}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;"></td>
              <td>${item.studentName}</td>
              <td>${item.property.title}</td>
              <td>${new Date(item.createdAt).toLocaleDateString()}</td>
              <td class="text-center">
                <button class="btn-reject me-1" onclick="handleAction(${item.bookingId},'reject')">Reject</button>
                <button class="btn-accept" onclick="handleAction(${item.bookingId},'accept')">Accept</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function renderMessagesCards(bookings) {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = bookings.map(item => `
    <div class="msg-card mb-3">
      <div class="row align-items-center g-2">
        <div class="col-auto"><div style="width:70px;height:70px;overflow:hidden;border-radius:10px;"><img src="${item.property.imageUrl}" style="width:100%;height:100%;object-fit:cover;"></div></div>
        <div class="col text-start ps-3">
          <div class="fw-bold text-warning">${item.property.title}</div>
          <div class="small text-white">${item.studentName}</div>
          <div class="text-white-50" style="font-size:0.7rem;">Status: ${item.statusName}</div>
        </div>
        <div class="col-auto"><span class="status-btn-mock">${item.statusName === "Cancelled" ? "Rejected" : "Booked"}</span></div>
      </div>
    </div>`).join("");
}

function renderEmptyBooking() {
  bookingContainer.innerHTML = `
    <div class="col-12 text-center py-5 mt-5">
      <img src="../img/icone-booking.svg" style="width:120px;">
      <h2 class="fw-bold" style="color:#FFC107;font-size:2.5rem;">Sorry!</h2>
      <p class="fw-bold mt-3" style="color:#2D3E50;">No bookings yet.</p>
    </div>`;
}

function renderEmptyMessages() {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = `<div class="text-center mt-5"><img src="../img/Vector-removebg-preview.png" class="w-25"/><h4 class="text-warning mt-3">Messages (Future)</h4></div>`;
}

fetchBookings();

// ── Settings Validation ──
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phoneError");
const firstInput = document.getElementById("firstName");
const firstError = document.getElementById("firstNameError");
const lastInput  = document.getElementById("lastName");
const lastError  = document.getElementById("lastNameError");
const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;

phoneInput?.addEventListener("input", () => {
  phoneError.innerText = !phoneInput.value.trim() ? "" : !phoneRegex.test(phoneInput.value.trim()) ? "Phone number is not valid!" : "";
});
firstInput?.addEventListener("input", () => {
  const v = firstInput.value.trim();
  firstError.innerText = !v ? "" : (v.length < 2 || v.length > 10) ? "First Name must be 2–10 chars" : "";
});
lastInput?.addEventListener("input", () => {
  const v = lastInput.value.trim();
  lastError.innerText = !v ? "" : (v.length < 2 || v.length > 10) ? "Last Name must be 2–10 chars" : "";
});
