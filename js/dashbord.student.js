document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID = localStorage.getItem("id");
  if (userRole !== "student" || !userID) {
    setTimeout(() => { window.location.href = "../html/form.html"; }, 100);
  }
});

const sections = {
  properties: document.getElementById("sectionPropirtie"),
  home: document.getElementById("sectionHome"),
  browserProperties: document.getElementById("sectionBrowseProperties"),
  notification: document.getElementById("sectionNotification"),
  booking: document.getElementById("sectionMyBookings"),
  BookingDetail: document.getElementById("sectionBookingDetails"),
  profile: document.getElementById("sectionProfile"),
};

const menuItems = {
  home: document.getElementById("home"),
  browserProperties: document.getElementById("browser"),
  profile: document.getElementById("profile"),
  notification: document.getElementById("notificaion"),
  booking: document.getElementById("booking"),
};

function hideAllSections(item, option) {
  for (let key in item) {
    if (option === "add") item[key].classList.add("d-none");
    else item[key].classList.remove("active");
  }
}

for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => { hideAllSections(sections, "add"); });
}
for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => {
    hideAllSections(menuItems, "a");
    sections[key].classList.remove("d-none");
    menuItems[key].classList.add("active");
    // destroy student details map on nav
    if (studentDetailsMap) { studentDetailsMap.remove(); studentDetailsMap = null; }
  });
}

const cancel = document.getElementById("btn-cancel");
cancel.addEventListener("click", () => {
  hideAllSections(sections, "add");
  sections.home.classList.remove("d-none");
  menuItems.home.classList.add("active");
  if (studentDetailsMap) { studentDetailsMap.remove(); studentDetailsMap = null; }
});

// =====================================================
// BASE CONFIG
// =====================================================
const BASE_URL = "https://homunityapiv1.runasp.net/api";
const STUDENT_ID = localStorage.getItem("id");

window.currentPropertyId = null;
window.currentBookingId = null;

window.showSection = function (sectionId) {
  ["sectionHome", "sectionPropirtie", "sectionBrowseProperties", "sectionMyBookings"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("d-none");
  });
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("d-none");
  window.scrollTo(0, 0);
  if (studentDetailsMap) { studentDetailsMap.remove(); studentDetailsMap = null; }
};

// =====================================================
// STUDENT DETAILS MAP
// =====================================================
let studentDetailsMap = null;

function initStudentDetailsMap(lat, lng, address, uniName, distanceKm) {
  if (studentDetailsMap) { studentDetailsMap.remove(); studentDetailsMap = null; }

  const mapEl = document.getElementById("studentDetailsMap");
  const noLocEl = document.getElementById("studentDetailsMapNoLocation");
  const mapInfoEl = document.getElementById("studentDetailsMapInfo");
  const uniInfoEl = document.getElementById("studentDetailsUniInfo");

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

  studentDetailsMap = L.map("studentDetailsMap", { zoomControl: true, scrollWheelZoom: false, preferCanvas: true }).setView([latF, lngF], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 18 }).addTo(studentDetailsMap);

  const goldIcon = L.divIcon({
    className: "",
    html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#efb81e,#d4a017);border:3px solid #212e43;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(33,46,67,0.4);display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-house" style="transform:rotate(45deg);color:#212e43;font-size:0.7rem;"></i></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36]
  });

  const marker = L.marker([latF, lngF], { icon: goldIcon }).addTo(studentDetailsMap);
  if (address) {
    marker.bindPopup(`<b style="color:#212e43">${address.split(",")[0]}</b>`).openPopup();
    const addrEl = document.getElementById("studentDetailsMapAddress");
    if (addrEl) addrEl.textContent = address;
    if (mapInfoEl) mapInfoEl.classList.remove("d-none");
  }

  if (uniName) {
    const uniTextEl = document.getElementById("studentDetailsUniText");
    if (uniTextEl) uniTextEl.textContent = `Nearest University: ${uniName}${distanceKm ? ` — ${distanceKm} km away` : ""}`;
    if (uniInfoEl) uniInfoEl.classList.remove("d-none");
  } else {
    if (uniInfoEl) uniInfoEl.classList.add("d-none");
  }

  setTimeout(() => { if (studentDetailsMap) studentDetailsMap.invalidateSize(); }, 150);
}

// =====================================================
// HOME — MY BOOKINGS SUMMARY
// =====================================================
async function fetchMyBookings() {
  try {
    const res = await fetch(`${BASE_URL}/Booking/student/${STUDENT_ID}`);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    const totalVal = document.getElementById("total-val");
    if (totalVal) {
      totalVal.innerText = data.length || 0;
      document.getElementById("pending-val").innerText = data.filter(b => b.statusName === "Pending" || b.statusName === "In-Process").length;
      document.getElementById("confirmed-val").innerText = data.filter(b => b.statusName === "Booked").length;
      document.getElementById("cancelled-val").innerText = data.filter(b => b.statusName === "Cancelled").length;
    }

    const list = document.getElementById("api-data-list");
    const emptyState = document.getElementById("empty-placeholder-div");
    const searchMessage = document.getElementById("search-message-div");

    if (!data || data.length === 0) {
      if (searchMessage) searchMessage.classList.remove("d-none");
      return;
    }
    if (emptyState) emptyState.classList.add("d-none");
    if (searchMessage) searchMessage.classList.add("d-none");

    list.innerHTML = data.map(item => `
      <div class="row align-items-center booking-row mx-0">
        <div class="col-12 col-md-4 d-flex align-items-center mb-3 mb-md-0">
          <div class="img-box me-3">
            <img src="${item.property?.imageUrl || '../img/placeholder.png'}" style="width:60px;height:60px;object-fit:cover;border-radius:10px;" />
          </div>
          <div>
            <h6 class="mb-0 fw-bold">${item.property?.title || "Unknown Property"}</h6>
            <small class="text-muted">$${item.property?.price || 0} / month</small>
          </div>
        </div>
        <div class="col-12 col-md-4 text-md-end location-text mb-3 mb-md-0">${item.property?.location || "No Location"}</div>
        <div class="col-12 col-md-4 text-md-end pe-md-4">
          <button class="status-btn">${item.statusName || "N/A"}</button>
        </div>
      </div>`).join("");
  } catch (e) { console.error("Home fetch error:", e); }
}

// =====================================================
// LOAD PROPERTY DETAILS (FIXED with map)
// =====================================================
window.loadPropertyDetails = async function (propId, bookId = null) {
  if (!propId) return;
  window.currentPropertyId = propId;
  window.currentBookingId = bookId;

  try {
    // Use GetByIDV2 to get lat/lng/university data
    const res = await fetch(`${BASE_URL}/Properties/GetByIDV2?id=${propId}`);
    const data = await res.json();
    if (data && data.property) {
      renderPropertyPage(data.property);
      window.showSection("sectionPropirtie");
    }
  } catch (e) {
    console.error("Details fetch error:", e);
  }
};

function renderPropertyPage(prop) {
  const sec = document.getElementById("sectionPropirtie");
  if (!sec) return;

  sec.querySelector(".card-title").innerText = prop.title || "No Title";
  const loc = prop.location || {};
  const addrDisplay = [loc.street, loc.area, loc.city].filter(Boolean).join(", ") || `${loc.city || ""}, ${loc.area || ""}`;
  sec.querySelector(".card-address").innerText = addrDisplay;
  sec.querySelector(".card-desc").innerText = prop.description || "No description.";

  const images = prop.images || [];
  const gallery = sec.querySelector(".gallery-wrapper");
  const thumbs = sec.querySelector(".gallery-thumbs");

  if (gallery) {
    gallery.innerHTML = images.length > 0
      ? images.map(img => `<div class="gallery-img-box"><img src="${img.imageUrl}" /></div>`).join("")
      : '<div class="text-center p-5 w-100">No images available</div>';
  }

  if (thumbs) {
    thumbs.innerHTML = images.map((img, i) => `
      <img src="${img.imageUrl}" class="${i === 0 ? 'active' : ''}" onclick="syncGallery(${i}, this)">`).join("");
  }

  const services = prop.services || [];
  const servicesList = sec.querySelector(".amenities-list");
  if (servicesList) {
    servicesList.innerHTML = services.length > 0
      ? services.map(s => `<li><span class="amenity-icon"><i class="fa-solid fa-${(s.icon || "star").toLowerCase()}"></i></span> ${s.name || "Service"}</li>`).join("")
      : "<li>No services listed</li>";
  }

  const detailsList = sec.querySelector(".details-list");
  if (detailsList) {
    detailsList.innerHTML = `
      <li><i class="fa-solid fa-diamond"></i> Price $${prop.price || 0} / month</li>
      <li><i class="fa-solid fa-diamond"></i> ${prop.rooms || 0} rooms</li>
      <li><i class="fa-solid fa-diamond"></i> Type: ${prop.propertyType || "N/A"}</li>`;
  }

  // Map
  const lat = loc.latitude || null;
  const lng = loc.longitude || null;
  const uniName = loc.university ? loc.university.name : null;
  const distKm = loc.university ? loc.university.distance_km : null;

  setTimeout(() => initStudentDetailsMap(lat, lng, addrDisplay, uniName, distKm), 250);
}

window.syncGallery = function (index, thumbEl) {
  const gallery = document.querySelector(".gallery-wrapper");
  if (gallery) gallery.scrollTo({ left: gallery.clientWidth * index, behavior: "smooth" });
  document.querySelectorAll(".gallery-thumbs img").forEach(img => img.classList.remove("active"));
  if (thumbEl) thumbEl.classList.add("active");
};

// =====================================================
// TOAST
// =====================================================
const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true,
});

// =====================================================
// BOOK / CANCEL
// =====================================================
window.confirmBooking = async function () {
  const userId = localStorage.getItem("id");
  const userRole = localStorage.getItem("role");
  if (userRole !== "student") { Toast.fire({ icon: "warning", title: "⚠️ You are not a student" }); return; }
  if (!window.currentPropertyId) return;
  const btn = document.getElementById("btnBook") || document.querySelector(".btn-book");
  if (btn) { btn.disabled = true; btn.innerText = "Booking..."; }
  try {
    const res = await fetch(`${BASE_URL}/Booking?PropertyId=${window.currentPropertyId}&StudentId=${userId}`, { method: "POST" });
    if (res.ok) {
      Toast.fire({ icon: "success", title: "Booking request sent!" });
      const saved = JSON.parse(localStorage.getItem("bookedProperties") || "[]");
      saved.push(window.currentPropertyId);
      localStorage.setItem("bookedProperties", JSON.stringify(saved));
      setTimeout(() => { window.showSection("sectionHome"); fetchMyBookings(); }, 1800);
    } else { Toast.fire({ icon: "warning", title: "Could not complete booking." }); }
  } catch (e) { Toast.fire({ icon: "error", title: "Server connection error" }); }
  finally { if (btn) { btn.disabled = false; btn.innerText = "Book Now"; } }
};

window.cancelBooking = async function () {
  if (!window.currentBookingId) return Toast.fire({ icon: "error", title: "Booking ID not found" });
  if (!confirm("Are you sure you want to cancel this booking?")) return;
  try {
    const res = await fetch(`${BASE_URL}/Booking/${window.currentBookingId}/cancel`, { method: "PUT" });
    if (res.ok) {
      Toast.fire({ icon: "success", title: "Booking cancelled successfully" });
      setTimeout(() => { window.location.reload(); fetchMyBookings(); }, 1500);
    } else { Toast.fire({ icon: "warning", title: "Could not cancel booking." }); }
  } catch (e) { Toast.fire({ icon: "error", title: "Server connection error" }); }
};

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("toast-container")) {
    const tc = document.createElement("div");
    tc.id = "toast-container";
    document.body.appendChild(tc);
  }
  const btnBook = document.querySelector(".btn-book");
  const btnCancel = document.querySelector(".btn-cancel");
  if (btnBook) btnBook.onclick = window.confirmBooking;
  if (btnCancel) btnCancel.onclick = window.cancelBooking;
  fetchMyBookings();
});

// =====================================================
// SEARCH / BROWSE
// =====================================================
const API_BASE = "https://homunityapiv1.runasp.net/api";

async function initSearchFilters() {
  const citySelect = document.getElementById("citySelectSearch");
  const areaSelect = document.getElementById("areaSelectSearch");
  try {
    const res = await fetch(`${API_BASE}/Location/cities`);
    const cities = await res.json();
    cities.forEach(city => citySelect.add(new Option(city, city)));
    citySelect.addEventListener("change", async () => {
      areaSelect.innerHTML = "<option disabled selected>Select Area</option>";
      const resArea = await fetch(`${API_BASE}/Location/areas?city=${encodeURIComponent(citySelect.value)}`);
      const areas = await resArea.json();
      areas.forEach(a => areaSelect.add(new Option(a.area, a.area)));
    });
  } catch (e) { console.error("Filter error:", e); }
}

function displayProperties(properties) {
  const grid = document.getElementById("properties-grid");
  if (!grid) return;
  const bookedIds = JSON.parse(localStorage.getItem("bookedProperties") || "[]");
  const filtered = properties.filter(p => !bookedIds.includes(p.propertyID));

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center p-5"><h3>No properties available for booking right now.</h3></div>`;
    return;
  }

  grid.innerHTML = filtered.map(prop => `
    <div class="col-12 col-sm-6 col-lg-4">
      <div class="property-card">
        <div class="card-img-wrapper">
          <span class="status-badge badge-available">Available</span>
          <img src="${prop.images?.[0]?.imageUrl || '../img/img.4.jpeg'}" alt="${prop.title}" />
        </div>
        <div class="card-body-custom">
          <div class="prop-name">${prop.title}</div>
          <div class="prop-meta">
            <span>${prop.location?.area || prop.location?.city || ''}</span>
            <span class="price">$${prop.price} / month</span>
          </div>
          <div class="prop-details">
            <div class="bed-bath"><span><i class="fa-solid fa-bed"></i></span> ${prop.rooms} Rooms</div>
            <button class="btn-action btn-view" onclick="loadPropertyDetails(${prop.propertyID})">View Details</button>
          </div>
        </div>
      </div>
    </div>`).join("");
}

async function performSearch() {
  const city = document.getElementById("citySelectSearch").value;
  const area = document.getElementById("areaSelectSearch").value;
  const minP = document.getElementById("minPriceInput").value || 0;
  const maxP = document.getElementById("maxPriceInput").value || 999999;
  let url = `${API_BASE}/Properties/GetAll`;
  if (city !== "City•") {
    url = `${API_BASE}/Properties/Search?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area !== "Area•" ? area : "")}&minPrice=${minP}&maxPrice=${maxP}`;
  }
  try {
    const res = await fetch(url);
    const data = await res.json();
    displayProperties(data.properties || []);
  } catch (e) { console.error("Search error:", e); }
}

async function loadAllProperties() {
  try {
    const res = await fetch(`${API_BASE}/Properties/GetAll`);
    const data = await res.json();
    displayProperties(data.properties || []);
  } catch (e) { console.error("Load error:", e); }
}

document.addEventListener("DOMContentLoaded", () => {
  initSearchFilters();
  loadAllProperties();
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.onclick = performSearch;
});

// =====================================================
// MY BOOKINGS PAGE
// =====================================================
async function loadMyBookings() {
  const studentID = localStorage.getItem("id") || 10;
  const listContainer = document.getElementById("bookings-dynamic-list");
  const emptyWrapper = document.getElementById("emptyStateWrapperr");
  if (!listContainer || !emptyWrapper) return;

  listContainer.innerHTML = '<div class="text-center text-gold-custom py-5">Loading your bookings...</div>';
  emptyWrapper.classList.add("d-none");

  try {
    const res = await fetch(`https://homunityapiv1.runasp.net/api/Booking/student/${studentID}`);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    const bookings = Array.isArray(data) ? data : [];

    if (bookings.length === 0) {
      document.getElementById("rowBookings").classList.add("d-none");
      listContainer.classList.add("d-none");
      emptyWrapper.classList.remove("d-none");
      return;
    }

    document.getElementById("rowBookings").classList.remove("d-none");
    listContainer.classList.remove("d-none");
    emptyWrapper.classList.add("d-none");

    listContainer.innerHTML = bookings.map(book => {
      const status = book.statusName || "N/A";
      const property = book.property || {};
      const title = property.title || "Property";
      const location = property.location || "Location";
      const img = property.imageUrl || "../img/room1.1.jpg";
      const bDate = book.createdAt ? new Date(book.createdAt).toLocaleDateString("en-GB") : "N/A";
      const cDate = book.confirmedAt ? new Date(book.confirmedAt).toLocaleDateString("en-GB") : "----------";
      const safeBookData = encodeURIComponent(JSON.stringify(book));

      return `
        <div class="row text-center mb-2 gx-2 align-items-stretch">
          <div class="col-3-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center gap-3 text-start">
              <img src="${img}" class="booking-img-sm rounded-2 shadow-sm" style="width:50px;height:50px;object-fit:cover" />
              <div>
                <div class="text-gold-custom fs-6">${title}</div>
                <div class="small text-white-50">${location}</div>
              </div>
            </div>
          </div>
          <div class="col-2-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-center">
              <span class="status-badge-custom w-75 ${status.toLowerCase().replace(/\s+/g, '-')}">${status}</span>
            </div>
          </div>
          <div class="col-2-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-center fs-13 text-white">${bDate}</div>
          </div>
          <div class="col-3-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-between fs-13 text-white">
              <span>${cDate}</span>
              <button class="btn-gold-action py-1 px-3 shadow-sm" onclick="renderBookingDetails('${safeBookData}')">View Details</button>
            </div>
          </div>
        </div>`;
    }).join("");
  } catch (e) {
    document.getElementById("rowBookings").classList.add("d-none");
    listContainer.classList.add("d-none");
    emptyWrapper.classList.remove("d-none");
  }
}

function renderBookingDetails(encodedData) {
  const book = JSON.parse(decodeURIComponent(encodedData));
  const detailsSection = document.getElementById("sectionBookingDetails");
  const listSection = document.getElementById("sectionMyBookings");
  const cancelBtn = document.querySelector(".btn-cancel-custom");

  if (!detailsSection || !listSection) return;

  if (book.statusName === "In-Process") {
    cancelBtn.disabled = false;
    cancelBtn.style.opacity = "1";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.innerText = "Cancel Booking";
  } else {
    cancelBtn.disabled = true;
    cancelBtn.style.opacity = "0.5";
    cancelBtn.style.cursor = "not-allowed";
    cancelBtn.innerText = "Processing...";
  }

  listSection.classList.add("d-none");
  detailsSection.classList.remove("d-none");

  document.getElementById("idCansel").value = book.bookingId;
  document.getElementById("idProprty").value = book.property.propertyId;

  const prop = book.property || {};
  detailsSection.querySelector(".main-details-img").src = prop.imageUrl || "../img/room1.jpg";
  detailsSection.querySelector("h5.text-gold-custom").innerText = prop.title || "Property";
  detailsSection.querySelector("p.mb-1").innerText = prop.location || "Location";

  const priceEl = detailsSection.querySelector("h5:not(.text-gold-custom)");
  if (priceEl) priceEl.innerHTML = `$${prop.price || 0} <small class="fs-5">/ month</small>`;

  const infoRows = detailsSection.querySelectorAll(".white-info-row span:last-child");
  if (infoRows.length >= 3) {
    infoRows[0].innerText = book.statusName || "Pending";
    infoRows[1].innerText = book.createdAt ? new Date(book.createdAt).toLocaleDateString("en-GB") : "N/A";
    infoRows[2].innerText = book.confirmedAt ? new Date(book.confirmedAt).toLocaleDateString("en-GB") : "----------";
  }

  detailsSection.dataset.currentBookingId = book.bookingId;
  window.scrollTo(0, 0);
}

document.addEventListener("DOMContentLoaded", loadMyBookings);
document.addEventListener("click", function (e) {
  const btn = e.target.closest('[onclick*="sectionMyBookings"]') || e.target.closest("#linkMyBookings");
  if (btn) setTimeout(loadMyBookings, 50);
});

// =====================================================
// PROFILE
// =====================================================
async function loadUserProfile() {
  const studentID = localStorage.getItem("id") || 10;
  try {
    const res = await fetch(`https://homunityapiv1.runasp.net/api/Users/Get Profile By ID?id=${studentID}`);
    if (!res.ok) throw new Error("Could not fetch profile");
    const userData = await res.json();
    const fn = document.getElementById("firstName");
    const ln = document.getElementById("lastName");
    const ph = document.getElementById("phone");
    const radios = document.getElementsByName("status");
    if (fn) fn.value = userData.firstName || "";
    if (ln) ln.value = userData.lastName || "";
    if (ph) ph.value = userData.phone || "";
    if (radios.length >= 2) {
      if (userData.isActive === true) radios[0].checked = true;
      else radios[1].checked = true;
    }
  } catch (e) { console.error("Profile error:", e); }
}

document.addEventListener("click", function (e) {
  const profileBtn = e.target.closest('[onclick*="sectionProfile"]') || e.target.closest("#linkProfile");
  if (profileBtn) setTimeout(loadUserProfile, 100);
});
loadUserProfile();

// =====================================================
// NOTIFICATIONS
// =====================================================
async function fetchNotifications() {
  const container = document.getElementById("notifications-container");
  const studentId = localStorage.getItem("id");
  if (!studentId) return;

  try {
    const res = await fetch(`https://homunityapiv1.runasp.net/api/Booking/student/${studentId}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <div class="mb-3"><i class="fa-regular fa-bell-slash fa-3x text-gold-custom"></i></div>
          <h5 class="text-gold-custom">No Notifications yet!</h5>
        </div>`;
      return;
    }

    container.innerHTML = data.map(notif => {
      let badgeClass = "", message = "";
      if (notif.statusName === "Cancelled") {
        badgeClass = "bg-danger";
        message = `Your booking for <strong>${notif.property.title}</strong> has been cancelled.`;
      } else if (notif.statusName === "In-Process") {
        badgeClass = "bg-warning text-dark";
        message = `Your booking request for <strong>${notif.property.title}</strong> is waiting for approval.`;
      } else {
        badgeClass = "bg-success";
        message = `Update on your booking for <strong>${notif.property.title}</strong>: ${notif.statusName}`;
      }

      return `
        <div class="notification-card d-flex justify-content-between align-items-center p-5 mb-3 shadow-sm"
             style="background-color:#1e2738;border-radius:12px;border-left:5px solid ${notif.statusName === 'Cancelled' ? '#dc3545' : '#f1b42f'}">
          <div class="text-white">
            <p class="mb-1" style="font-size:0.9rem;">${message}</p>
            <small class="text-secondary">${new Date(notif.createdAt).toLocaleString("en-GB")}</small>
          </div>
          <span class="badge ${badgeClass} p-2 px-4" style="border-radius:8px;">${notif.statusName}</span>
        </div>`;
    }).join("");
  } catch (e) {
    container.innerHTML = `
      <div class="empty-notif-wrapper text-center">
        <img src="../img/no-notification.svg" class="no-notif-img" alt="No Notifications">
        <h5 class="empty-text text-gold-custom">No Notifications yet!</h5>
      </div>`;
  }
}
fetchNotifications();
