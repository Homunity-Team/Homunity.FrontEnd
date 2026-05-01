const API = "https://homunityapiv1.runasp.net/api";

// ── Auth Guard ──
document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID   = localStorage.getItem("id");
  if (userRole !== "admin" || !userID) {
    setTimeout(() => { window.location.href = "../html/form.html"; }, 100);
  }
});

// ── Sections & Menu ──
const sections = {
  home:       document.getElementById("sectionHome"),
  pending:    document.getElementById("sectionPending"),
  rejected:   document.getElementById("sectionRejected"),
  properties: document.getElementById("propertyDetails"),
};

const menuItems = {
  home:     document.getElementById("home"),
  pending:  document.getElementById("Pending"),
  rejected: document.getElementById("Rejected"),
};

function hideAllSections() {
  for (let key in sections)   if (sections[key])   sections[key].classList.add("d-none");
  for (let key in menuItems)  if (menuItems[key])  menuItems[key].classList.remove("active");
}

for (let key in menuItems) {
  if (menuItems[key]) {
    menuItems[key].addEventListener("click", () => {
      hideAllSections();
      if (sections[key]) sections[key].classList.remove("d-none");
      menuItems[key].classList.add("active");
    });
  }
}

// ── Dashboard Stats ──
async function fetchDashboardStats() {
  try {
    const res  = await fetch(`${API}/AdminActions/dashboard/stats`, { headers: { accept: "*/*" } });
    const data = await res.json();
    updateDashboardUI(data.stats);
  } catch (e) { console.error(e); }
}

function updateDashboardUI(stats) {
  document.getElementById("totalProperties").innerText    = stats.totalProperties;
  document.getElementById("pendingProperties").innerText  = stats.pendingProperties;
  document.getElementById("approvedProperties").innerText = stats.approvedProperties;
  document.getElementById("rejectedProperties").innerText = stats.rejectedProperties;
  document.getElementById("totalBookings").innerText      = stats.totalBookings;
  document.getElementById("totalUsers").innerText         = stats.totalUsers;
}

document.addEventListener("DOMContentLoaded", fetchDashboardStats);

// ── Recent Actions Table ──
const tableWrapper = document.getElementById("tableWrapper");
const emptyState   = document.getElementById("emptyState");
const tableBody    = document.getElementById("recentActionsBody");

async function fetchRecentActions() {
  try {
    const res  = await fetch(`${API}/AdminActions/dashboard/recent-actions?pageSize=10`, { headers: { accept: "*/*" } });
    const data = await res.json();
    if (data.properties?.length > 0) {
      renderTable(data.properties);
      tableWrapper.classList.remove("d-none");
      emptyState.classList.add("d-none");
    } else {
      tableWrapper.classList.add("d-none");
      emptyState.classList.remove("d-none");
    }
  } catch (e) {
    tableWrapper.classList.add("d-none");
    emptyState.classList.remove("d-none");
  }
}

function renderTable(properties) {
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
          <button class="btn btn-gold-action px-5 py-2 fw-bold shadow-sm"
            style="min-width:140px;border-radius:12px;font-size:14px;">${prop.actionType}</button>
        </td>
      </tr>`;
  });
}

document.addEventListener("DOMContentLoaded", fetchRecentActions);

// ── Pending Properties ──
let currentPage = 1, pageSize = 9, totalPages = 1, allProperties = [];

async function fetchProperties(page = 1) {
  try {
    const res  = await fetch(`${API}/AdminActions/properties/pending?page=${page}&pageSize=${pageSize}`, { headers: { accept: "*/*" } });
    const data = await res.json();
    totalPages    = data.totalPages || 1;
    currentPage   = data.page || 1;
    allProperties = data.properties || [];
    renderUI(allProperties);
    updatePagination();
  } catch { renderUI([]); }
}

function renderUI(list) {
  const grid      = document.getElementById("properties-grid");
  const empty     = document.getElementById("emptyState");
  const paginBox  = document.getElementById("pagination-wrapper");
  const infoBox   = document.getElementById("pageInfo");
  grid.innerHTML  = "";

  if (!list.length) {
    grid.classList.add("d-none"); paginBox.classList.add("d-none");
    infoBox.classList.add("d-none"); empty.classList.remove("d-none");
    return;
  }

  grid.classList.remove("d-none"); empty.classList.add("d-none");
  paginBox.classList.remove("d-none"); infoBox.classList.remove("d-none");

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
              <span class="price" style="color:#efb81e;font-weight:700;">$${prop.price} / month</span>
            </div>
            <div class="prop-details">
              <div class="bed-bath"><span><i class="fa-solid fa-bed"></i></span> ${prop.rooms} Rooms</div>
              <button class="btn-action btn-view"
                style="border:2px solid #1e283c;background:transparent;color:#1e283c;font-weight:700;"
                onmouseover="this.style.backgroundColor='#1e283c';this.style.color='#fff';"
                onmouseout="this.style.backgroundColor='transparent';this.style.color='#1e283c';"
                onclick="showPropertyDetails(${prop.propertyID})">View Details</button>
            </div>
          </div>
        </div>
      </div>`);
  });
}

function updatePagination() {
  document.getElementById("currentPageNum").innerText = currentPage;
  document.getElementById("totalPageNum").innerText   = totalPages;
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
  const min  = parseFloat(document.getElementById("minPrice").value) || 0;
  const max  = parseFloat(document.getElementById("maxPrice").value) || Infinity;
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

// ── Rejected Properties ──
const container  = document.getElementById("rejectedPropertiesContainer");
const emptyState2 = document.getElementById("emptyState");

async function fetchRejectedProperties() {
  try {
    const res  = await fetch(`${API}/AdminActions/properties/rejected`, { headers: { accept: "*/*" } });
    const data = await res.json();
    renderRejectedCards(data.properties?.length > 0 ? data.properties : []);
  } catch { renderRejectedCards([]); }
}

function renderRejectedCards(properties) {
  container.innerHTML = "";
  if (!properties.length) { emptyState2.classList.remove("d-none"); return; }
  emptyState2.classList.add("d-none");
  properties.forEach(prop => {
    const date = prop.createdAt ? prop.createdAt.split("T")[0] : "N/A";
    container.insertAdjacentHTML("beforeend", `
      <div class="property-card-wrapper mb-4 shadow-sm">
        <div class="property-main-box d-flex flex-wrap align-items-center p-3 border-bottom">
          <img src="${prop.thumbnail}" style="width:200px;height:130px;object-fit:cover;" onerror="this.src='../img/placeholder.jpg'">
          <div class="property-info fw-bold ms-3">
            <p class="mb-1 text-dark fs-5">${prop.title}</p>
            <p class="mb-1 text-muted small"><i class="fa-solid fa-location-dot me-1"></i>${prop.location.city}, ${prop.location.area}</p>
            <p class="mb-1" style="color:#efb81e;font-weight:700;">Price: ${prop.price.toLocaleString()} EGP / month</p>
            <p class="mb-0 text-muted small">Created: ${date}</p>
          </div>
          <button class="btn-rejected border-0 px-4 fw-bold ms-auto">Rejected</button>
        </div>
        <div class="property-footer-box d-flex justify-content-between align-items-center p-3 bg-light">
          <span class="fw-bold text-danger">
            <i class="fa-solid fa-circle-xmark me-2"></i>
            Reject Reason: <span class="text-dark fw-normal">${prop.rejectReason || "No reason provided"}</span>
          </span>
        </div>
      </div>`);
  });
}

document.addEventListener("DOMContentLoaded", fetchRejectedProperties);

// ── Details MAP ──
let detailsMap = null;

function initAdminDetailsMap(lat, lng) {
  if (detailsMap) { detailsMap.remove(); detailsMap = null; }
  detailsMap = L.map("adminDetailsMap").setView([lat, lng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM" }).addTo(detailsMap);
  L.marker([lat, lng]).addTo(detailsMap).bindPopup("📍 Property Location").openPopup();
}

// ── Property Details ──
let currentPropertyId = null;

async function showPropertyDetails(id) {
  hideAllSections();
  currentPropertyId = id;

  try {
    const res  = await fetch(`${API}/AdminActions/properties/${id}`, { headers: { accept: "*/*" } });
    const data = await res.json();
    if (!data.property) return;

    const prop    = data.property;
    const details = document.getElementById("propertyDetails");
    details.classList.remove("d-none");

    // Title + address
    details.querySelector(".card-title").innerText   = prop.title;
    const loc = prop.location || {};
    const addr = [loc.street, loc.area, loc.city].filter(Boolean).join(", ");
    details.querySelector(".card-address").innerText = addr || "No address";
    details.querySelector(".card-desc").innerText    = prop.description || "";

    details.querySelector(".details-list").innerHTML = `
      <li><i class="fa-solid fa-diamond"></i> Price <span style="color:#efb81e;font-weight:700;">$${prop.price} / month</span></li>
      <li><i class="fa-solid fa-diamond"></i> ${prop.rooms} rooms</li>
      ${loc.university ? `<li><i class="fa-solid fa-diamond"></i> 🎓 ${loc.university.name}${loc.university.distance_km ? ` (${loc.university.distance_km} km)` : ""}</li>` : ""}`;

    // Gallery
    const galleryWrapper = details.querySelector(".gallery-wrapper");
    const galleryThumbs  = details.querySelector(".gallery-thumbs");
    const images         = prop.images || [];

    if (images.length === 0) {
      galleryWrapper.innerHTML = `<div class="gallery-img-box"><img src="https://via.placeholder.com/400" /></div>`;
      galleryThumbs.innerHTML  = "";
    } else {
      // Show first 3 images (no repeating)
      const display = images.slice(0, 3);
      galleryWrapper.innerHTML = display.map((img, i) => `
        <div class="gallery-img-box" style="${i > 0 && display.length < 2 ? 'display:none;' : ''}">
          <img src="${img.imageUrl}" alt="img ${i+1}" onclick="changeSlide(${i})" />
        </div>`).join("");

      galleryThumbs.innerHTML = images.map((img, i) => `
        <img src="${img.imageUrl}" alt="thumb ${i+1}"
          class="${i === 0 ? 'active' : ''}"
          onclick="changeSlide(${i})" />`).join("");
    }

    // Services
    const amenities = details.querySelector(".amenities-list");
    if (amenities) {
      amenities.innerHTML = prop.services?.length
        ? prop.services.map(s => `<li><span class="amenity-icon"><i class="fa-solid fa-${s.icon || 'star'}"></i></span> ${s.name}</li>`).join("")
        : "<li>No services listed</li>";
    }

    // Map
    const mapSection = document.getElementById("adminMapSection");
    if (loc.latitude && loc.longitude) {
      mapSection.classList.remove("d-none");
      setTimeout(() => initAdminDetailsMap(loc.latitude, loc.longitude), 200);
    } else {
      mapSection.classList.add("d-none");
    }

  } catch (e) { console.error(e); }
}

function changeSlide(index) {
  const slides = document.querySelectorAll(".gallery-img-box");
  const thumbs = document.querySelectorAll(".gallery-thumbs img");
  const total  = slides.length;

  slides.forEach(s => { s.style.display = "none"; s.classList.remove("show"); });

  [index % total, (index+1) % total, (index+2) % total].forEach(i => {
    if (slides[i]) { slides[i].style.display = "block"; slides[i].classList.add("show"); }
  });

  thumbs.forEach(t => t.classList.remove("active"));
  if (thumbs[index]) thumbs[index].classList.add("active");
}

// ── Approve ──
async function handleApprove() {
  const adminId = localStorage.getItem("id") || 91;
  try {
    const res = await fetch(`${API}/AdminActions/properties/${currentPropertyId}/approve?adminId=${adminId}`, { method: "PUT", headers: { accept: "*/*" } });
    if (res.ok) { alert("Property approved successfully!"); location.reload(); }
  } catch (e) { console.error(e); }
}

// ── Reject Popup ──
function openRejectPopup() { document.getElementById("rejectPopupSection").classList.remove("d-none"); }

function closePopup() {
  document.getElementById("rejectPopupSection").classList.add("d-none");
  document.getElementById("reasonInput").value = "";
  document.getElementById("charCount").innerText = "0 / 300";
}

async function confirmAction() {
  const adminId = localStorage.getItem("id") || 91;
  const reason  = document.getElementById("reasonInput").value;
  if (!reason)           { alert("Please provide a reason"); return; }
  if (reason.length < 10){ alert("Reason must be at least 10 characters"); return; }
  try {
    const res = await fetch(`${API}/AdminActions/properties/${currentPropertyId}/reject?adminId=${adminId}&reason=${encodeURIComponent(reason)}`, { method: "PUT", headers: { accept: "*/*" } });
    if (res.ok) { alert("Property rejected!"); location.reload(); }
  } catch (e) { console.error(e); }
}

function countChars() {
  document.getElementById("charCount").innerText = `${document.getElementById("reasonInput").value.length} / 300`;
}

// ── Logout ──
document.addEventListener("click", e => {
  if (e.target.id === "logoutBtn") { localStorage.clear(); window.location.href = "../index.html"; }
});
