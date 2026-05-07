// ============================================================
// هذا الملف يجمع كود الـ Dashboard الأصلي + كود الشات بوت المعدل
// ============================================================

const BASE_URL  = "https://homunityapiv1.runasp.net/api";
const STUDENT_ID = localStorage.getItem("id");

// ── Auth Guard ──
document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID   = localStorage.getItem("id");
  if (userRole !== "student" || !userID) {
    setTimeout(() => { window.location.href = "../html/form.html"; }, 100);
  }
});

// ── Sections & Menu ──
const sections = {
  properties:       document.getElementById("sectionPropirtie"),
  home:             document.getElementById("sectionHome"),
  browserProperties:document.getElementById("sectionBrowseProperties"),
  notification:     document.getElementById("sectionNotification"),
  booking:          document.getElementById("sectionMyBookings"),
  BookingDetail:    document.getElementById("sectionBookingDetails"),
  profile:          document.getElementById("sectionProfile"),
};

const menuItems = {
  home:             document.getElementById("home"),
  browserProperties:document.getElementById("browser"),
  profile:          document.getElementById("profile"),
  notification:     document.getElementById("notificaion"),
  booking:          document.getElementById("booking"),
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

const cancel = document.getElementById("btn-cancel");
cancel?.addEventListener("click", () => {
  hideAllSections(sections, "add");
  sections.home.classList.remove("d-none");
  menuItems.home.classList.add("active");
});

// Toast using SweetAlert2
const Toast = Swal.mixin({
  toast: true, position: "top-end", showConfirmButton: false,
  timer: 3000, timerProgressBar: true,
});

window.showSection = function (sectionId) {
  ["sectionHome","sectionPropirtie","sectionBrowseProperties","sectionMyBookings"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("d-none");
  });
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("d-none");
  window.scrollTo(0, 0);
};

// ── My Bookings Stats ──
async function fetchMyBookings() {
  try {
    const res  = await fetch(`${BASE_URL}/Booking/student/${STUDENT_ID}`);
    const data = await res.json();

    const totalVal = document.getElementById("total-val");
    if (totalVal) {
      totalVal.innerText = data.length || 0;
      document.getElementById("pending-val").innerText   = data.filter(b => b.statusName === "Pending" || b.statusName === "In-Process").length;
      document.getElementById("confirmed-val").innerText = data.filter(b => b.statusName === "Booked").length;
      document.getElementById("cancelled-val").innerText = data.filter(b => b.statusName === "Cancelled").length;
    }

    const list         = document.getElementById("api-data-list");
    const emptyState   = document.getElementById("empty-placeholder-div");
    const searchMessage= document.getElementById("search-message-div");

    if (!data || data.length === 0) {
      if (searchMessage) searchMessage.classList.remove("d-none");
      return;
    }
    if (emptyState)   emptyState.classList.add("d-none");
    if (searchMessage) searchMessage.classList.add("d-none");

    list.innerHTML = data.map(item => `
      <div class="row align-items-center booking-row mx-0">
        <div class="col-12 col-md-4 d-flex align-items-center mb-3 mb-md-0">
          <div class="img-box me-3">
            <img src="${item.property?.imageUrl || 'assets/placeholder.png'}" style="width:60px;height:60px;object-fit:cover;border-radius:10px;" />
          </div>
          <div>
            <h6 class="mb-0 fw-bold">${item.property?.title || "Unknown Property"}</h6>
            <small class="text-muted" style="color:#efb81e !important;">$${item.property?.price || 0} / month</small>
          </div>
        </div>
        <div class="col-12 col-md-4 text-md-end location-text mb-3 mb-md-0">${item.property?.location || "No Location"}</div>
        <div class="col-12 col-md-4 text-md-end pe-md-4">
          <button class="status-btn">${item.statusName || "N/A"}</button>
        </div>
      </div>`).join("");
  } catch (e) { console.error(e); }
}

// ── Details MAP ──
let studentDetailsMap = null;

function initStudentDetailsMap(lat, lng, uniLat, uniLng, uniName) {
  if (studentDetailsMap) { studentDetailsMap.remove(); studentDetailsMap = null; }
  studentDetailsMap = L.map("studentDetailsMap").setView([lat, lng], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OSM" }).addTo(studentDetailsMap);
  L.marker([lat, lng]).addTo(studentDetailsMap).bindPopup("📍 Property Location").openPopup();
  if (uniLat && uniLng) {
    L.marker([uniLat, uniLng], {
      icon: L.divIcon({
        className: "",
        html: `<div style="background:#efb81e;border:2px solid #212e43;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:13px;">🎓</div>`,
        iconSize: [24, 24]
      })
    }).addTo(studentDetailsMap).bindPopup(`🎓 ${uniName}`);
  }
}

// ── Load Property Details (V2) ──
window.currentPropertyId = null;
window.currentBookingId  = null;

window.loadPropertyDetails = async function (propId, bookId = null) {
  if (!propId) return;
  window.currentPropertyId = propId;
  window.currentBookingId  = bookId;

  try {
    const res  = await fetch(`${BASE_URL}/Properties/GetByIDV2?id=${propId}`);
    const data = await res.json();
    if (data?.property) {
      renderPropertyPage(data.property);
      window.showSection("sectionPropirtie");
    }
  } catch (e) {
    console.error(e);
    Toast.fire({ icon: "error", title: "Failed to load property details" });
  }
};

function renderPropertyPage(prop) {
  const sec = document.getElementById("sectionPropirtie");
  if (!sec) return;

  sec.querySelector(".card-title").innerText   = prop.title || "No Title";
  const loc  = prop.location || {};
  const addr = [loc.street, loc.area, loc.city].filter(Boolean).join(", ");
  sec.querySelector(".card-address").innerText = addr || "No address";
  sec.querySelector(".card-desc").innerText    = prop.description || "No description.";

  // Images
  const images  = prop.images || [];
  const gallery = sec.querySelector(".gallery-wrapper");
  const thumbs  = sec.querySelector(".gallery-thumbs");

  if (gallery) {
    if (images.length === 0) {
      gallery.innerHTML = '<div class="gallery-img-box"><img src="https://via.placeholder.com/400" /></div>';
    } else {
      gallery.innerHTML = images.slice(0, 3).map(img =>
        `<div class="gallery-img-box"><img src="${img.imageUrl}" /></div>`).join("");
    }
  }

  if (thumbs) {
    thumbs.innerHTML = images.map((img, i) => `
      <img src="${img.imageUrl}" class="${i === 0 ? 'active' : ''}" onclick="syncGallery(${i}, this)">`).join("");
  }

  // Services
  const services     = prop.services || [];
  const servicesList = sec.querySelector(".amenities-list");
  if (servicesList) {
    servicesList.innerHTML = services.length
      ? services.map(s => `<li><span class="amenity-icon"><i class="fa-solid fa-${(s.icon || 'star').toLowerCase()}"></i></span> ${s.name}</li>`).join("")
      : "<li>No services listed</li>";
  }

  // Details list
  const detailsList = sec.querySelector(".details-list");
  if (detailsList) {
    const uniHtml = loc.university
      ? `<li><i class="fa-solid fa-diamond"></i> 🎓 ${loc.university.name}${loc.university.distance_km ? ` (${loc.university.distance_km} km)` : ""}</li>`
      : "";
    detailsList.innerHTML = `
      <li><i class="fa-solid fa-diamond"></i> Price <span style="color:#efb81e;font-weight:700;">$${prop.price || 0} / month</span></li>
      <li><i class="fa-solid fa-diamond"></i> ${prop.rooms || 0} rooms</li>
      <li><i class="fa-solid fa-diamond"></i> Type: ${prop.propertyType || "N/A"}</li>
      ${uniHtml}`;
  }

  // MAP
  const mapSection = document.getElementById("studentMapSection");
  if (loc.latitude && loc.longitude) {
    mapSection.classList.remove("d-none");
    const uniLat  = loc.university ? loc.university.latitude : null;
    const uniLng  = loc.university ? loc.university.longitude : null;
    const uniName = loc.university?.name || "";
    setTimeout(() => initStudentDetailsMap(loc.latitude, loc.longitude, uniLat, uniLng, uniName), 200);
  } else {
    mapSection.classList.add("d-none");
  }
}

window.syncGallery = function (index, thumbEl) {
  const gallery   = document.querySelector(".gallery-wrapper");
  const allThumbs = document.querySelectorAll(".gallery-thumbs img");
  if (gallery) gallery.scrollTo({ left: gallery.clientWidth * index, behavior: "smooth" });
  allThumbs.forEach(img => img.classList.remove("active"));
  if (thumbEl) thumbEl.classList.add("active");
};

// ── Book Property ──
window.confirmBooking = async function () {
  const userRole = localStorage.getItem("role");
  if (userRole !== "student") { Toast.fire({ icon: "warning", title: "You are not a student" }); return; }
  if (!window.currentPropertyId) return;
  const btn = document.getElementById("btnBook");
  btn.disabled = true; btn.innerText = "Booking...";
  try {
    const res = await fetch(`${BASE_URL}/Booking?PropertyId=${window.currentPropertyId}&StudentId=${STUDENT_ID}`, { method: "POST" });
    if (res.ok) {
      Toast.fire({ icon: "success", title: "Booking request sent!" });
      setTimeout(() => { window.location.reload(); }, 1500);
    } else {
      Toast.fire({ icon: "warning", title: "Could not complete booking." });
    }
  } catch { Toast.fire({ icon: "error", title: "Connection error" }); }
  finally { btn.disabled = false; btn.innerText = "Book Now"; }
};

window.cancelBooking = async function () {
  if (!window.currentBookingId) return Toast.fire({ icon: "error", title: "Booking ID not found" });
  if (!confirm("Cancel this booking?")) return;
  try {
    const res = await fetch(`${BASE_URL}/Booking/${window.currentBookingId}/cancel`, { method: "PUT" });
    if (res.ok) { Toast.fire({ icon: "success", title: "Booking cancelled!" }); setTimeout(() => window.location.reload(), 1500); }
  } catch { Toast.fire({ icon: "error", title: "Connection error" }); }
};

document.addEventListener("DOMContentLoaded", () => {
  const btnBook   = document.querySelector(".btn-book");
  const btnCancel = document.querySelector(".btn-cancel");
  if (btnBook)   btnBook.onclick   = window.confirmBooking;
  if (btnCancel) btnCancel.onclick = window.cancelBooking;
  fetchMyBookings();
});

// ── Search / Browse ──
async function initSearchFilters() {
  const citySelect = document.getElementById("citySelectSearch");
  const areaSelect = document.getElementById("areaSelectSearch");
  try {
    const res   = await fetch(`${BASE_URL}/Location/cities`);
    const cities = await res.json();
    cities.forEach(city => citySelect.add(new Option(city, city)));
    citySelect.addEventListener("change", async () => {
      areaSelect.innerHTML = "<option disabled selected>Select Area</option>";
      const resArea = await fetch(`${BASE_URL}/Location/areas?city=${encodeURIComponent(citySelect.value)}`);
      const areas   = await resArea.json();
      areas.forEach(a => areaSelect.add(new Option(a.area, a.area)));
    });
  } catch (e) { console.error(e); }
}

function displayProperties(properties) {
  const grid = document.getElementById("properties-grid");
  if (!grid) return;
  const bookedIds = JSON.parse(localStorage.getItem("bookedProperties") || "[]");
  const filtered  = properties.filter(p => !bookedIds.includes(p.propertyID));

  if (!filtered.length) {
    grid.innerHTML = `<div class="col-12 text-center p-5"><h3>No properties available for booking right now.</h3></div>`;
    return;
  }

  grid.innerHTML = filtered.map(prop => {
    const loc     = prop.location || {};
    const uniInfo = loc.university ? `<div class="small mt-1" style="color:#efb81e;">🎓 ${loc.university.name}${loc.university.distance_km ? ` · ${loc.university.distance_km} km` : ""}</div>` : "";
    return `
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="property-card">
          <div class="card-img-wrapper">
            <span class="status-badge badge-available">Available</span>
            <img src="${prop.images?.[0]?.imageUrl || '../img/img.4.jpeg'}" alt="${prop.title}" />
          </div>
          <div class="card-body-custom">
            <div class="prop-name">${prop.title}</div>
            <div class="prop-meta">
              <span>${loc.area || loc.city || ""}</span>
              <span class="price" style="color:#efb81e;font-weight:700;">$${prop.price} / month</span>
            </div>
            ${uniInfo}
            <div class="prop-details mt-2">
              <div class="bed-bath"><span><i class="fa-solid fa-bed"></i></span> ${prop.rooms} Rooms</div>
              <button class="btn-action btn-view"
                style="border:2px solid #1e283c;background:transparent;color:#1e283c;font-weight:700;"
                onmouseover="this.style.backgroundColor='#1e283c';this.style.color='#fff';"
                onmouseout="this.style.backgroundColor='transparent';this.style.color='#1e283c';"
                onclick="loadPropertyDetails(${prop.propertyID})">View Details</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}

async function performSearch() {
  const city = document.getElementById("citySelectSearch").value;
  const area = document.getElementById("areaSelectSearch").value;
  const minP = document.getElementById("minPriceInput").value || 0;
  const maxP = document.getElementById("maxPriceInput").value || 999999;
  let url = `${BASE_URL}/Properties/GetAllV2`;
  if (city !== "City•") {
    url = `${BASE_URL}/Properties/Search?city=${encodeURIComponent(city)}&area=${encodeURIComponent(area !== "Area•" ? area : "")}&minPrice=${minP}&maxPrice=${maxP}`;
  }
  try {
    const res  = await fetch(url);
    const data = await res.json();
    displayProperties(data.properties || []);
  } catch (e) { console.error(e); }
}

async function loadAllProperties() {
  try {
    const res  = await fetch(`${BASE_URL}/Properties/GetAllV2`);
    const data = await res.json();
    displayProperties(data.properties || []);
  } catch (e) { console.error(e); }
}

document.addEventListener("DOMContentLoaded", () => {
  initSearchFilters();
  loadAllProperties();
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) searchBtn.onclick = performSearch;
});

// ── My Bookings List ──
async function loadMyBookings() {
  const listContainer  = document.getElementById("bookings-dynamic-list");
  const emptyWrapper   = document.getElementById("emptyStateWrapperr");
  if (!listContainer || !emptyWrapper) return;
  listContainer.innerHTML = '<div class="text-center text-gold-custom py-5">Loading...</div>';
  emptyWrapper.classList.add("d-none");

  try {
    const res      = await fetch(`${BASE_URL}/Booking/student/${STUDENT_ID}`);
    const data     = await res.json();
    const bookings = Array.isArray(data) ? data : [];

    if (!bookings.length) {
      document.getElementById("rowBookings").classList.add("d-none");
      listContainer.classList.add("d-none");
      emptyWrapper.classList.remove("d-none");
      return;
    }
    document.getElementById("rowBookings").classList.remove("d-none");
    listContainer.classList.remove("d-none");
    emptyWrapper.classList.add("d-none");

    listContainer.innerHTML = bookings.map(book => {
      const prop     = book.property || {};
      const bDate    = book.createdAt  ? new Date(book.createdAt).toLocaleDateString("en-GB")  : "N/A";
      const cDate    = book.confirmedAt? new Date(book.confirmedAt).toLocaleDateString("en-GB") : "----------";
      const safeData = encodeURIComponent(JSON.stringify(book));
      return `
        <div class="row text-center mb-2 gx-2 align-items-stretch">
          <div class="col-3-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center gap-3 text-start">
              <img src="${prop.imageUrl || '../img/room1.1.jpg'}" class="booking-img-sm rounded-2 shadow-sm" style="width:50px;height:50px;object-fit:cover" />
              <div>
                <div class="text-gold-custom fs-6">${prop.title || "Property"}</div>
                <div class="small text-white-50">${prop.location || ""}</div>
              </div>
            </div>
          </div>
          <div class="col-2-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-center">
              <span class="status-badge-custom w-75">${book.statusName || "N/A"}</span>
            </div>
          </div>
          <div class="col-2-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-center fs-13 text-white">${bDate}</div>
          </div>
          <div class="col-3-half">
            <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-between fs-13 text-white">
              <span>${cDate}</span>
              <button class="btn-gold-action py-1 px-3 shadow-sm" onclick="renderBookingDetails('${safeData}')">View Details</button>
            </div>
          </div>
        </div>`;
    }).join("");
  } catch {
    document.getElementById("rowBookings").classList.add("d-none");
    listContainer.classList.add("d-none");
    emptyWrapper.classList.remove("d-none");
  }
}

function renderBookingDetails(encodedData) {
  const book          = JSON.parse(decodeURIComponent(encodedData));
  const detailsSection= document.getElementById("sectionBookingDetails");
  const listSection   = document.getElementById("sectionMyBookings");
  const cancelBtn     = document.querySelector(".btn-cancel-custom");

  if (!detailsSection || !listSection) return;

  if (book.statusName === "In-Process") {
    cancelBtn.disabled = false; cancelBtn.style.opacity = "1"; cancelBtn.style.cursor = "pointer"; cancelBtn.innerText = "Cancel Booking";
  } else {
    cancelBtn.disabled = true; cancelBtn.style.opacity = "0.5"; cancelBtn.style.cursor = "not-allowed"; cancelBtn.innerText = "Processing...";
  }

  listSection.classList.add("d-none");
  detailsSection.classList.remove("d-none");

  document.getElementById("idCansel").value  = book.bookingId;
  document.getElementById("idProprty").value = book.property?.propertyId || "";

  const prop = book.property || {};
  detailsSection.querySelector(".main-details-img").src      = prop.imageUrl || "../img/room1.jpg";
  detailsSection.querySelector("h5.text-gold-custom").innerText = prop.title || "Property";
  detailsSection.querySelector("p.mb-1").innerText           = prop.location || "Location";

  const priceEl = detailsSection.querySelector("h5:not(.text-gold-custom)");
  if (priceEl) priceEl.innerHTML = `$${prop.price || 0} <small class="fs-5">/ month</small>`;

  const infoRows = detailsSection.querySelectorAll(".white-info-row span:last-child");
  if (infoRows.length >= 3) {
    infoRows[0].innerText = book.statusName || "Pending";
    infoRows[1].innerText = book.createdAt   ? new Date(book.createdAt).toLocaleDateString("en-GB")   : "N/A";
    infoRows[2].innerText = book.confirmedAt ? new Date(book.confirmedAt).toLocaleDateString("en-GB") : "----------";
  }

  detailsSection.dataset.currentBookingId = book.bookingId;
  window.scrollTo(0, 0);
}

document.addEventListener("DOMContentLoaded", loadMyBookings);
document.addEventListener("click", e => {
  if (e.target.closest('[onclick*="sectionMyBookings"]') || e.target.closest("#linkMyBookings")) {
    setTimeout(loadMyBookings, 50);
  }
});

// ── Profile ──
async function loadUserProfile() {
  try {
    const res      = await fetch(`${BASE_URL}/Users/Get Profile By ID?id=${STUDENT_ID}`);
    const userData = await res.json();
    const fn = document.getElementById("firstName");
    const ln = document.getElementById("lastName");
    const ph = document.getElementById("phone");
    if (fn) fn.value = userData.firstName || "";
    if (ln) ln.value = userData.lastName  || "";
    if (ph) ph.value = userData.phone     || "";
    const radios = document.getElementsByName("status");
    if (radios.length >= 2) {
      if (userData.isActive === true) radios[0].checked = true;
      else radios[1].checked = true;
    }
  } catch (e) { console.error(e); }
}

document.addEventListener("click", e => {
  if (e.target.closest('[onclick*="sectionProfile"]') || e.target.closest("#linkProfile")) {
    setTimeout(loadUserProfile, 100);
  }
});
loadUserProfile();

// ── Notifications ──
async function fetchNotifications() {
  const container = document.getElementById("notifications-container");
  try {
    const res  = await fetch(`${BASE_URL}/Booking/student/${STUDENT_ID}`);
    const data = await res.json();
    if (!data?.length) {
      container.innerHTML = `<div class="empty-notif-wrapper text-center"><div class="mb-4"><i class="fa-regular fa-bell-slash fa-3x text-gold-custom"></i></div><h5 class="text-gold-custom">No Notifications yet!</h5></div>`;
      return;
    }
    container.innerHTML = data.map(notif => {
      let badgeClass = "", message = "";
      if (notif.statusName === "Cancelled") {
        badgeClass = "bg-danger";
        message = `Your booking for <strong>${notif.property.title}</strong> has been cancelled.`;
      } else if (notif.statusName === "In-Process") {
        badgeClass = "bg-warning text-dark";
        message = `Your booking for <strong>${notif.property.title}</strong> is waiting for approval.`;
      } else {
        badgeClass = "bg-success";
        message = `Update on <strong>${notif.property.title}</strong>: ${notif.statusName}`;
      }
      return `
        <div class="notification-card d-flex justify-content-between align-items-center p-5 mb-3 shadow-sm"
          style="background:#1e2738;border-radius:12px;border-left:5px solid ${notif.statusName === 'Cancelled' ? '#dc3545' : '#f1b42f'}">
          <div class="text-white">
            <p class="mb-1" style="font-size:.9rem;">${message}</p>
            <small class="text-secondary">${new Date(notif.createdAt).toLocaleString("en-GB")}</small>
          </div>
          <span class="badge ${badgeClass} p-2 px-4" style="border-radius:8px;">${notif.statusName}</span>
        </div>`;
    }).join("");
  } catch {
    container.innerHTML = `<div class="empty-notif-wrapper text-center"><h5 class="empty-text text-gold-custom">No Notifications yet!</h5></div>`;
  }
}
fetchNotifications();

// ==================================================================
// ============= كود الشات بوت ======================================
// ==================================================================
let chatOpen = false;
let isTyping = false;

function getStudentId() {
  return parseInt(localStorage.getItem("id") || "0");
}

function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById("homunity-chat-window");
  const icon = document.querySelector("#homunity-chat-fab i");
  const badge = document.getElementById("chatBadge");
  win.classList.toggle("open", chatOpen);
  if (icon) icon.className = chatOpen ? "fa-solid fa-xmark" : "fa-solid fa-robot";
  if (badge) badge.style.display = "none";
  if (chatOpen) {
    loadChatHistory();
    setTimeout(() => document.getElementById("chatInput").focus(), 300);
  }
}

async function loadChatHistory() {
  const studentId = getStudentId();
  if (!studentId) return;
  try {
    const res = await fetch(`${BASE_URL}/Chat/history/${studentId}`);
    const data = await res.json();
    if (data.messages && data.messages.length > 0) {
      const container = document.getElementById("chatMessages");
      container.innerHTML = "";
      data.messages.forEach(m => appendChatMessage(m.role, m.content, false));
      scrollToChatBottom();
    }
  } catch (e) { console.warn("History load:", e); }
}

async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg || isTyping) return;
  const studentId = getStudentId();
  if (!studentId) {
    appendChatMessage("assistant", "⚠️ يرجى تسجيل الدخول أولاً للاستخدام المساعد.");
    return;
  }
  // Remove welcome screen if exists
  const welcome = document.querySelector("#chatMessages .chat-welcome");
  if (welcome) welcome.remove();
  // Hide quick suggestions after first message
  const suggestionsDiv = document.getElementById("quickSuggestions");
  if (suggestionsDiv) suggestionsDiv.style.display = "none";
  input.value = "";
  autoResizeChat(input);
  appendChatMessage("user", msg);
  showChatTyping();
  isTyping = true;
  const sendBtn = document.getElementById("chatSendBtn");
  if (sendBtn) sendBtn.disabled = true;
  try {
    const res = await fetch(`${BASE_URL}/Chat/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, message: msg })
    });
    const data = await res.json();
    hideChatTyping();
    appendChatMessage("assistant", data.reply);
    if (data.suggestions && data.suggestions.length > 0) renderChatSuggestions(data.suggestions);
  } catch (e) {
    hideChatTyping();
    appendChatMessage("assistant", "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.");
  } finally {
    isTyping = false;
    if (sendBtn) sendBtn.disabled = false;
    document.getElementById("chatInput").focus();
  }
}

function sendQuickChat(text) {
  document.getElementById("chatInput").value = text;
  sendChatMessage();
}

function appendChatMessage(role, content, animate = true) {
  const container = document.getElementById("chatMessages");
  const isUser = role === "user";
  const time = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  const row = document.createElement("div");
  row.className = `msg-row ${isUser ? "user" : ""}`;
  row.innerHTML = `
    <div class="msg-avatar ${isUser ? "user" : "bot"}">${isUser ? "أنت" : "AI"}</div>
    <div>
      <div class="msg-bubble ${isUser ? "user" : "bot"}">${formatChatMessage(content)}</div>
      <span class="msg-time">${time}</span>
    </div>`;
  if (!animate) row.style.animation = "none";
  container.appendChild(row);
  scrollToChatBottom();
}

function formatChatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

function renderChatSuggestions(suggestions) {
  if (!suggestions.length) return;
  const container = document.getElementById("chatMessages");
  const cardsDiv = document.createElement("div");
  cardsDiv.className = "msg-row";
  const inner = document.createElement("div");
  inner.innerHTML = `<div class="chat-prop-cards">${suggestions.map(p => `
    <div class="chat-prop-card" onclick="openPropertyFromChat(${p.propertyID})">
      <img src="${p.imageUrl || 'https://via.placeholder.com/54x44'}" onerror="this.src='https://via.placeholder.com/54x44'" />
      <div class="chat-prop-info">
        <div class="chat-prop-title">${p.title}</div>
        <div class="chat-prop-price">$${p.price} / شهر</div>
        <div class="chat-prop-addr">${p.address || "عنوان غير متاح"}</div>
      </div>
    </div>`).join("")}</div>`;
  cardsDiv.appendChild(inner);
  container.appendChild(cardsDiv);
  scrollToChatBottom();
}

function openPropertyFromChat(id) {
  if (typeof loadPropertyDetails === "function") loadPropertyDetails(id);
  toggleChat(); // close chat after redirect?
}

function showChatTyping() {
  const container = document.getElementById("chatMessages");
  const row = document.createElement("div");
  row.className = "msg-row"; row.id = "typingRow";
  row.innerHTML = `<div class="msg-avatar bot">AI</div><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  container.appendChild(row);
  scrollToChatBottom();
}

function hideChatTyping() {
  const row = document.getElementById("typingRow");
  if (row) row.remove();
}

async function clearChatHistory() {
  const studentId = getStudentId();
  if (!studentId) return;
  if (!confirm("هل تريد مسح سجل المحادثة؟")) return;
  try {
    await fetch(`${BASE_URL}/Chat/clear/${studentId}`, { method: "DELETE" });
    document.getElementById("chatMessages").innerHTML = `
      <div class="chat-welcome">
        <div class="welcome-icon">🏠</div>
        <h3>أهلاً بك في Homunity!</h3>
        <p>أنا مساعدك الذكي، يمكنني مساعدتك في<br>إيجاد أفضل سكن طلابي مناسب لك.</p>
      </div>`;
    const suggestionsDiv = document.getElementById("quickSuggestions");
    if (suggestionsDiv) suggestionsDiv.style.display = "flex";
  } catch (e) { console.warn("Clear error:", e); }
}

function scrollToChatBottom() {
  const c = document.getElementById("chatMessages");
  if (c) c.scrollTop = c.scrollHeight;
}

function autoResizeChat(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 100) + "px";
}

// Event binding for chat
document.addEventListener("DOMContentLoaded", () => {
  const fab = document.getElementById("homunity-chat-fab");
  if (fab) fab.addEventListener("click", toggleChat);
  const closeBtn = document.getElementById("chatCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", toggleChat);
  const clearBtn = document.getElementById("chatClearBtn");
  if (clearBtn) clearBtn.addEventListener("click", clearChatHistory);
  const sendBtn = document.getElementById("chatSendBtn");
  if (sendBtn) sendBtn.addEventListener("click", sendChatMessage);
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
    chatInput.addEventListener("input", (e) => autoResizeChat(e.target));
  }
  // quick chips
  document.querySelectorAll(".quick-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const msg = chip.getAttribute("data-msg");
      if (msg) sendQuickChat(msg);
    });
  });
  // badge show after 3 sec if chat not open
  setTimeout(() => {
    const badge = document.getElementById("chatBadge");
    if (badge && !chatOpen) badge.style.display = "flex";
  }, 3000);
});
