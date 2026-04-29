document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID = localStorage.getItem("id");
  if (userRole !== "admin" || !userID) {
    setTimeout(() => { window.location.href = "../html/form.html"; }, 100);
  }
});

const sections = {
  home: document.getElementById("sectionHome"),
  pending: document.getElementById("sectionPending"),
  rejected: document.getElementById("sectionRejected"),
  properties: document.getElementById("propertyDetails"),
};

const menuItems = {
  home: document.getElementById("home"),
  pending: document.getElementById("Pending"),
  rejected: document.getElementById("Rejected"),
};

function hideAllSections() {
  for (let key in sections) { if (sections[key]) sections[key].classList.add("d-none"); }
  for (let key in menuItems) { if (menuItems[key]) menuItems[key].classList.remove("active"); }
}

for (let key in menuItems) {
  if (menuItems[key]) {
    menuItems[key].addEventListener("click", () => {
      hideAllSections();
      if (sections[key]) sections[key].classList.remove("d-none");
      menuItems[key].classList.add("active");
      // destroy details map when navigating away
      if (adminDetailsMap) { adminDetailsMap.remove(); adminDetailsMap = null; }
    });
  }
}

// =====================================================
// REJECT POPUP
// =====================================================
function countChars() {
  const text = document.getElementById("reasonInput").value;
  document.getElementById("charCount").innerText = text.length + " / 300";
}

function closePopup() {
  document.getElementById("rejectPopupSection").classList.add("d-none");
  document.getElementById("reasonInput").value = "";
  document.getElementById("charCount").innerText = "0 / 300";
}

// =====================================================
// DASHBOARD STATS
// =====================================================
const statsElements = {
  totalProperties: document.getElementById("totalProperties"),
  pendingProperties: document.getElementById("pendingProperties"),
  approvedProperties: document.getElementById("approvedProperties"),
  rejectedProperties: document.getElementById("rejectedProperties"),
  totalBookings: document.getElementById("totalBookings"),
  totalUsers: document.getElementById("totalUsers"),
};

async function fetchDashboardStats() {
  try {
    const res = await fetch("https://homunityapiv1.runasp.net/api/AdminActions/dashboard/stats", { headers: { accept: "*/*" } });
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    const s = data.stats;
    statsElements.totalProperties.innerText = s.totalProperties;
    statsElements.pendingProperties.innerText = s.pendingProperties;
    statsElements.approvedProperties.innerText = s.approvedProperties;
    statsElements.rejectedProperties.innerText = s.rejectedProperties;
    statsElements.totalBookings.innerText = s.totalBookings;
    statsElements.totalUsers.innerText = s.totalUsers;
  } catch (e) { console.error("Stats error:", e); }
}
document.addEventListener("DOMContentLoaded", fetchDashboardStats);

// =====================================================
// RECENT ACTIONS TABLE
// =====================================================
const tableWrapper = document.getElementById("tableWrapper");
const emptyState = document.getElementById("emptyState");
const tableBody = document.getElementById("recentActionsBody");

async function fetchRecentActions() {
  try {
    const res = await fetch("https://homunityapiv1.runasp.net/api/AdminActions/dashboard/recent-actions?pageSize=10", { headers: { accept: "*/*" } });
    const data = await res.json();
    if (data.properties && data.properties.length > 0) {
      renderRecentTable(data.properties);
      tableWrapper.classList.remove("d-none");
      emptyState.classList.add("d-none");
    } else {
      tableWrapper.classList.add("d-none");
      emptyState.classList.remove("d-none");
    }
  } catch (e) { console.error(e); tableWrapper.classList.add("d-none"); emptyState.classList.remove("d-none"); }
}

function renderRecentTable(properties) {
  tableBody.innerHTML = "";
  properties.forEach(prop => {
    const date = prop.createdAt.split("T")[0];
    tableBody.innerHTML += `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <img src="${prop.thumbnail}" class="rounded" style="width:40px;height:40px;object-fit:cover;">
            <span>${prop.title}</span>
          </div>
        </td>
        <td>${prop.ownerName}</td>
        <td>${prop.location.city}, ${prop.location.area}</td>
        <td>${date}</td>
        <td class="text-center">
          <button class="btn btn-gold-action px-5 py-2 fw-bold shadow-sm" style="min-width:140px;border-radius:12px;font-size:14px;">${prop.actionType}</button>
        </td>
      </tr>`;
  });
}
document.addEventListener("DOMContentLoaded", fetchRecentActions);

// =====================================================
// PENDING PROPERTIES
// =====================================================
let currentPage = 1;
const pageSize = 9;
let totalPages = 1;
let allProperties = [];

async function fetchProperties(page = 1) {
  try {
    const res = await fetch(`https://homunityapiv1.runasp.net/api/AdminActions/properties/pending?page=${page}&pageSize=${pageSize}`, { headers: { accept: "*/*" } });
    const data = await res.json();
    totalPages = data.totalPages || 1;
    currentPage = data.page || 1;
    allProperties = data.properties || [];
    renderUI(allProperties);
    updatePagination();
  } catch (e) { renderUI([]); }
}

function renderUI(list) {
  const grid = document.getElementById("properties-grid");
  const empty = document.getElementById("emptyState");
  const paginBox = document.getElementById("pagination-wrapper");
  const infoBox = document.getElementById("pageInfo");
  grid.innerHTML = "";
  if (list.length === 0) {
    grid.classList.add("d-none"); paginBox.classList.add("d-none"); infoBox.classList.add("d-none"); empty.classList.remove("d-none");
    return;
  }
  grid.classList.remove("d-none"); empty.classList.add("d-none"); paginBox.classList.remove("d-none"); infoBox.classList.remove("d-none");
  list.forEach(prop => {
    grid.insertAdjacentHTML("beforeend", `
      <div class="col-12 col-sm-6 col-lg-4 mb-4">
        <div class="property-card">
          <div class="card-img-wrapper">
            <span class="status-badge badge-Pending">Pending</span>
            <img src="${prop.thumbnail}" alt="${prop.title}" onerror="this.src='../img/placeholder.jpg'" />
          </div>
          <div class="card-body-custom">
            <div class="prop-name text-truncate">${prop.title}</div>
            <div class="prop-meta">
              <span>${prop.location.area}</span>
              <span class="price">$${prop.price} / month</span>
            </div>
            <div class="prop-details">
              <div class="bed-bath"><span><i class="fa-solid fa-bed"></i></span> ${prop.rooms} Rooms</div>
              <button class="btn-action btn-view" onclick="showPropertyDetails(${prop.propertyID})">View Details</button>
            </div>
          </div>
        </div>
      </div>`);
  });
}

function updatePagination() {
  document.getElementById("currentPageNum").innerText = currentPage;
  document.getElementById("totalPageNum").innerText = totalPages;
  const nums = document.getElementById("pageNumbers");
  nums.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.className = `btn btn-sm rounded-circle ${i === currentPage ? "btn-gold-action" : "btn-light"}`;
    btn.style.cssText = "width:35px;height:35px;";
    btn.onclick = () => fetchProperties(i);
    nums.appendChild(btn);
  }
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

document.getElementById("searchBtn").onclick = () => {
  const city = document.getElementById("cityFilter").value;
  const area = document.getElementById("areaFilter").value;
  const min = parseFloat(document.getElementById("minPrice").value) || 0;
  const max = parseFloat(document.getElementById("maxPrice").value) || Infinity;
  const filtered = allProperties.filter(p => {
    const cMatch = city === "City•" || city === "" || p.location.city === city;
    const aMatch = area === "Area•" || area === "" || p.location.area === area;
    return cMatch && aMatch && p.price >= min && p.price <= max;
  });
  renderUI(filtered);
};

document.getElementById("prevPage").onclick = () => { if (currentPage > 1) fetchProperties(currentPage - 1); };
document.getElementById("nextPage").onclick = () => { if (currentPage < totalPages) fetchProperties(currentPage + 1); };
document.addEventListener("DOMContentLoaded", () => fetchProperties(1));

// =====================================================
// REJECTED PROPERTIES
// =====================================================
const rejectedContainer = document.getElementById("rejectedPropertiesContainer");

async function fetchRejectedProperties() {
  try {
    const res = await fetch("https://homunityapiv1.runasp.net/api/AdminActions/properties/rejected", { headers: { accept: "*/*" } });
    const data = await res.json();
    renderRejectedCards(data.properties && data.properties.length > 0 ? data.properties : []);
  } catch (e) { console.error(e); renderRejectedCards([]); }
}

function renderRejectedCards(properties) {
  rejectedContainer.innerHTML = "";
  if (properties.length === 0) { return; }
  properties.forEach(prop => {
    const date = prop.createdAt ? prop.createdAt.split("T")[0] : "N/A";
    rejectedContainer.insertAdjacentHTML("beforeend", `
      <div class="property-card-wrapper mb-4 shadow-sm">
        <div class="property-main-box d-flex flex-wrap align-items-center p-3 border-bottom">
          <div class="property-img">
            <img src="${prop.thumbnail}" alt="${prop.title}" style="width:200px;height:130px;object-fit:cover;" onerror="this.src='../img/placeholder.jpg'">
          </div>
          <div class="property-info fw-bold ms-3">
            <p class="mb-1 text-dark fs-5">${prop.title}</p>
            <p class="mb-1 text-muted small"><i class="fa-solid fa-location-dot me-1"></i>${prop.location.city}, ${prop.location.area}</p>
            <p class="mb-1 text-primary">Price: ${prop.price.toLocaleString()} EGP</p>
            <p class="mb-0 text-muted small" style="font-size:12px;">Created: ${date}</p>
          </div>
          <button class="btn-rejected border-0 px-4 fw-bold ms-auto">Rejected</button>
        </div>
        <div class="property-footer-box d-flex justify-content-between align-items-center p-3 bg-light">
          <span class="fw-bold text-danger"><i class="fa-solid fa-circle-xmark me-2"></i>Reject Reason: <span class="text-dark fw-normal">${prop.rejectReason || "No reason provided"}</span></span>
        </div>
      </div>`);
  });
}
document.addEventListener("DOMContentLoaded", fetchRejectedProperties);

// =====================================================
// DETAILS MAP (Admin)
// =====================================================
let adminDetailsMap = null;
let currentPropertyId = null;

function initAdminDetailsMap(lat, lng, address, uniName, distanceKm) {
  if (adminDetailsMap) { adminDetailsMap.remove(); adminDetailsMap = null; }

  const mapEl = document.getElementById("adminDetailsMap");
  const noLocEl = document.getElementById("adminDetailsMapNoLocation");
  const mapInfoEl = document.getElementById("adminDetailsMapInfo");
  const uniInfoEl = document.getElementById("adminDetailsUniInfo");

  if (!mapEl) return;

  const latF = lat ? parseFloat(lat) : NaN;
  const lngF = lng ? parseFloat(lng) : NaN;

  if (!lat || !lng || isNaN(latF) || isNaN(lngF)) {
    mapEl.style.display = "none";
    if (noLocEl) noLocEl.style.display = "flex";
    if (mapInfoEl) mapInfoEl.classList.add("d-none");
    if (uniInfoEl) uniInfoEl.classList.add("d-none");
    return;
  }

  mapEl.style.display = "block";
  if (noLocEl) noLocEl.style.display = "none";

  adminDetailsMap = L.map("adminDetailsMap", { zoomControl: true, scrollWheelZoom: false, preferCanvas: true }).setView([latF, lngF], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(adminDetailsMap);

  const goldIcon = L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#efb81e,#d4a017);border:3px solid #212e43;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(33,46,67,0.4);display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-house" style="transform:rotate(45deg);color:#212e43;font-size:0.7rem;"></i></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
  });

  const marker = L.marker([latF, lngF], { icon: goldIcon }).addTo(adminDetailsMap);
  if (address) {
    marker.bindPopup(`<b style="color:#212e43">${address.split(",")[0]}</b>`).openPopup();
    const addrEl = document.getElementById("adminDetailsMapAddress");
    if (addrEl) addrEl.textContent = address;
    if (mapInfoEl) mapInfoEl.classList.remove("d-none");
  }

  if (uniName) {
    const uniTextEl = document.getElementById("adminDetailsUniText");
    if (uniTextEl) uniTextEl.textContent = `Nearest University: ${uniName}${distanceKm ? ` — ${distanceKm} km away` : ""}`;
    if (uniInfoEl) uniInfoEl.classList.remove("d-none");
  } else {
    if (uniInfoEl) uniInfoEl.classList.add("d-none");
  }

  setTimeout(() => { if (adminDetailsMap) adminDetailsMap.invalidateSize(); }, 150);
}

// =====================================================
// SHOW PROPERTY DETAILS (Admin) — FIXED with map
// =====================================================
async function showPropertyDetails(id) {
  hideAllSections();
  currentPropertyId = id;

  try {
    const res = await fetch(`https://homunityapiv1.runasp.net/api/AdminActions/properties/${id}`, { headers: { accept: "*/*" } });
    const data = await res.json();

    if (!data.property) return;
    const prop = data.property;
    const detailsSection = document.getElementById("propertyDetails");
    detailsSection.classList.remove("d-none");

    detailsSection.querySelector(".card-title").innerText = prop.title;
    const loc = prop.location || {};
    const addrDisplay = [loc.street, loc.area, loc.city].filter(Boolean).join(", ") || `${loc.city || ""}, ${loc.area || ""}`;
    detailsSection.querySelector(".card-address").innerText = addrDisplay;
    detailsSection.querySelector(".card-desc").innerText = prop.description;

    detailsSection.querySelector(".details-list").innerHTML = `
      <li><i class="fa-solid fa-diamond"></i> Price $${prop.price} / month</li>
      <li><i class="fa-solid fa-diamond"></i> ${prop.rooms} rooms</li>`;

    // Services
    const amenitiesList = detailsSection.querySelector(".amenities-list");
    if (amenitiesList) {
      if (prop.services && prop.services.length > 0) {
        amenitiesList.innerHTML = prop.services.map(s => `
          <li>
            <span class="amenity-icon"><i class="fa-solid fa-${(s.icon || "star").toLowerCase()}"></i></span>
            ${s.name}
          </li>`).join("");
      } else {
        amenitiesList.innerHTML = "<li>No services listed</li>";
      }
    }

    // Gallery
    const galleryWrapper = detailsSection.querySelector(".gallery-wrapper");
    const galleryThumbs = detailsSection.querySelector(".gallery-thumbs");
    const images = prop.images || [];

    galleryWrapper.innerHTML = images.map((img, i) => `
      <div class="gallery-img-box" data-index="${i}" style="${i < 3 ? '' : 'display:none;'}">
        <img src="${img.imageUrl}" alt="image ${i + 1}" onclick="changeSlide(${i})" />
      </div>`).join("") || `<div class="gallery-img-box"><img src="https://via.placeholder.com/400" /></div>`;

    galleryThumbs.innerHTML = images.map((img, i) => `
      <img src="${img.imageUrl}" alt="thumb ${i + 1}" class="${i === 0 ? 'active' : ''}" onclick="changeSlide(${i})" />`).join("");

    // Map
    const lat = loc.latitude || null;
    const lng = loc.longitude || null;
    const uniName = loc.university ? loc.university.name : null;
    const distKm = loc.university ? loc.university.distance_km : null;

    setTimeout(() => initAdminDetailsMap(lat, lng, addrDisplay, uniName, distKm), 250);

  } catch (e) { console.error("Details error:", e); }
}

function changeSlide(index) {
  const slides = document.querySelectorAll(".gallery-img-box");
  const thumbs = document.querySelectorAll(".gallery-thumbs img");
  const total = slides.length;
  slides.forEach(s => { s.style.display = "none"; s.classList.remove("show"); });
  [index % total, (index + 1) % total, (index + 2) % total].forEach(i => {
    if (slides[i]) { slides[i].style.display = "block"; slides[i].classList.add("show"); }
  });
  thumbs.forEach(t => t.classList.remove("active"));
  if (thumbs[index]) thumbs[index].classList.add("active");
  const thumbsContainer = document.querySelector(".gallery-thumbs");
  if (thumbsContainer && thumbs[index]) {
    thumbsContainer.scrollTo({ left: index * (thumbs[index].offsetWidth + 10) - (thumbs[index].offsetWidth + 10), behavior: "smooth" });
  }
}

// =====================================================
// APPROVE / REJECT
// =====================================================
async function handleApprove() {
  const adminId = localStorage.getItem("id") || 91;
  try {
    const res = await fetch(`https://homunityapiv1.runasp.net/api/AdminActions/properties/${currentPropertyId}/approve?adminId=${adminId}`, { method: "PUT", headers: { accept: "*/*" } });
    if (res.ok) { alert("Property approved successfully!"); location.reload(); }
    else { const e = await res.json().catch(() => ({})); alert("Error: " + (e.message || "Could not approve.")); }
  } catch (e) { console.error(e); }
}

function openRejectPopup() {
  document.getElementById("rejectPopupSection").classList.remove("d-none");
}

async function confirmAction() {
  const adminId = localStorage.getItem("id") || 91;
  const reason = document.getElementById("reasonInput").value;
  if (!reason) { alert("Please provide a reason"); return; }
  if (reason.length < 10) { alert("Reason must be at least 10 characters"); return; }
  try {
    const res = await fetch(`https://homunityapiv1.runasp.net/api/AdminActions/properties/${currentPropertyId}/reject?adminId=${adminId}&reason=${encodeURIComponent(reason)}`, { method: "PUT", headers: { accept: "*/*" } });
    if (res.ok) { alert("Property rejected!"); location.reload(); }
    else { const e = await res.json().catch(() => ({})); alert("Error: " + (e.message || "Could not reject.")); }
  } catch (e) { console.error(e); }
}

// =====================================================
// LOGOUT
// =====================================================
document.addEventListener("click", (e) => {
  if (e.target.id === "logoutBtn") { localStorage.clear(); window.location.href = "../index.html"; }
});
