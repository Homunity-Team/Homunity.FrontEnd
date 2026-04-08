document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID = localStorage.getItem("id");

  if (userRole !== "student" || !userID) {
    setTimeout(() => {
      window.location.href = "../html/form.html";
    }, 100);
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
    if (option == "add") {
      item[key].classList.add("d-none");
    } else {
      item[key].classList.remove("active");
    }
  }
}

for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => {
    hideAllSections(sections, "add");
  });
}

for (let key in menuItems) {
  menuItems[key].addEventListener("click", (ele) => {
    hideAllSections(menuItems, "a");
    sections[key].classList.remove("d-none");
    menuItems[key].classList.add("active");
  });
}


const cancel = document.getElementById("btn-cancel");
cancel.addEventListener("click", () => {
  hideAllSections(sections, "add");
  sections.browserProperties.classList.remove("d-none");
  menuItems.browserProperties.classList.add("active");
});

// start home
const BASE_URL = "https://homunityapiv1.runasp.net/api";
const STUDENT_ID = localStorage.getItem("id");

window.currentPropertyId = null;
window.currentBookingId = null;

// دالة التنبيهات (Toasts)
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `custom-toast ${type}`;
  toast.style.cssText = `
        background: #1a237e; color: #ffca28; padding: 15px 25px;
        border-radius: 8px; margin-bottom: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        border-left: 5px solid ${type === "success" ? "#ffca28" : "#ff5252"};
        animation: slideIn 0.5s ease-out; font-family: sans-serif; font-weight: bold;
    `;

  toast.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"} me-2"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

window.showSection = function (sectionId) {
  const sections = [
    "sectionHome",
    "sectionPropirtie",
    "sectionBrowseProperties",
    "sectionMyBookings",
  ];
  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.classList.add("d-none");
  });
  const target = document.getElementById(sectionId);
  if (target) target.classList.remove("d-none");
  window.scrollTo(0, 0);
};

async function fetchMyBookings() {
  try {
    const response = await fetch(`${BASE_URL}/Booking/student/${STUDENT_ID}`);
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();

    const totalVal = document.getElementById("total-val");
    if (totalVal) {
      totalVal.innerText = data.length || 0;
      document.getElementById("pending-val").innerText = data.filter(
        (b) => b.statusName === "Pending" || b.statusName === "In Progress",
      ).length;
      document.getElementById("confirmed-val").innerText = data.filter(
        (b) => b.statusName === "Booked",
      ).length;
      document.getElementById("cancelled-val").innerText = data.filter(
        (b) => b.statusName === "Cancelled",
      ).length;
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

    list.innerHTML = data
      .map(
        (item) => `
            <div class="row align-items-center booking-row mx-0"  
                 >
                <div class="col-12 col-md-4 d-flex align-items-center mb-3 mb-md-0">
                    <div class="img-box me-3">
                        <img src="${item.property?.imageUrl || "assets/placeholder.png"}" style="width:60px; height:60px; object-fit:cover; border-radius:10px;" />
                    </div>
                    <div>
                        <h6 class="mb-0 fw-bold">${item.property?.title || "Unknown Property"}</h6>
                        <small class="text-muted">$${item.property?.price || 0} / month</small>
                    </div>
                </div>
                <div class="col-12 col-md-4 text-md-end location-text mb-3 mb-md-0">
                    ${item.property?.location || "No Location"}
                </div>
                <div class="col-12 col-md-4 text-md-end pe-md-4">
                    <button class="status-btn">${item.statusName || "N/A"}</button>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Home Fetch Error:", error);
  }
}

window.loadPropertyDetails = async function (propId, bookId = null) {
  if (!propId) return;
  window.currentPropertyId = propId;
  window.currentBookingId = bookId;

  try {
    const response = await fetch(`${BASE_URL}/Properties/GetByID?id=${propId}`);
    const data = await response.json();

    if (data && data.property) {
      renderPropertyPage(data.property);
      window.showSection("sectionPropirtie");
    }
  } catch (error) {
    console.error("Details Fetch Error:", error);
    showToast("تعذر تحميل بيانات العقار", "error");
  }
};

function renderPropertyPage(prop) {
  const sec = document.getElementById("sectionPropirtie");
  if (!sec) return;

  sec.querySelector(".card-title").innerText =
    prop.title || "No Title Provided";
  sec.querySelector(".card-address").innerText =
    `${prop.location?.city || ""} ${prop.location?.area || ""}`;
  sec.querySelector(".card-desc").innerText =
    prop.description || "No description available.";

  const images = prop.images || [];
  const gallery = sec.querySelector(".gallery-wrapper");
  const thumbs = sec.querySelector(".gallery-thumbs");

  if (gallery) {
    gallery.innerHTML =
      images.length > 0
        ? images
            .map(
              (img) =>
                `<div class="gallery-img-box"><img src="${img.imageUrl}" /></div>`,
            )
            .join("")
        : '<div class="text-center p-5 w-100">No images available</div>';
  }

  if (thumbs) {
    thumbs.innerHTML = images
      .map(
        (img, index) => `
            <img src="${img.imageUrl}" 
                 class="${index === 0 ? "active" : ""}" 
                 onclick="syncGallery(${index}, this)">
        `,
      )
      .join("");
  }

  const services = prop.services || [];
  const servicesList = sec.querySelector(".amenities-list");
  if (servicesList) {
    servicesList.innerHTML =
      services.length > 0
        ? services
            .map(
              (s) =>
                `<li><span class="amenity-icon"><i class="fa-solid fa-${(s.icon || "star").toLowerCase()}"></i></span> ${s.name || "Service"}</li>`,
            )
            .join("")
        : "<li>No services listed</li>";
  }

  // التفاصيل الأساسية
  const detailsList = sec.querySelector(".details-list");
  if (detailsList) {
    detailsList.innerHTML = `
            <li><i class="fa-solid fa-diamond"></i> Price $${prop.price || 0} / month</li>
            <li><i class="fa-solid fa-diamond"></i> ${prop.rooms || 0} Bedrooms</li>
            <li><i class="fa-solid fa-diamond"></i> Type: ${prop.propertyType || "N/A"}</li>
        `;
  }
}

window.syncGallery = function (index, thumbEl) {
  const gallery = document.querySelector(".gallery-wrapper");
  const allThumbs = document.querySelectorAll(".gallery-thumbs img");

  if (gallery) {
    const scrollAmount = gallery.clientWidth * index;
    gallery.scrollTo({
      left: scrollAmount,
      behavior: "smooth",
    });
  }

  allThumbs.forEach((img) => img.classList.remove("active"));
  if (thumbEl) {
    thumbEl.classList.add("active");
  }
};

window.confirmBooking = async function () {
  try {
    const res = await fetch(
      `${BASE_URL}/Booking?PropertyId=${window.currentPropertyId}&StudentId=${STUDENT_ID}`,
      { method: "POST" },
    );
    if (res.ok) {
      showToast("تم الحجز بنجاح!");
      setTimeout(() => {
        window.showSection("sectionHome");
        fetchMyBookings();
      }, 1500);
    }
  } catch (e) {
    showToast("فشل في إتمام الحجز", "error");
  }
};

window.cancelBooking = async function () {
  if (!window.currentBookingId) return showToast("لا يوجد حجز محدد", "error");
  if (!confirm("هل تريد إلغاء الحجز؟")) return;

  try {
    const res = await fetch(`${BASE_URL}/Booking/${window.currentBookingId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      showToast("تم إلغاء الحجز بنجاح", "success");
      setTimeout(() => {
        window.showSection("sectionHome");
        fetchMyBookings();
      }, 1500);
    }
  } catch (e) {
    showToast("خطأ في عملية الإلغاء", "error");
  }
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
// end home

// start search
const API_BASE = "https://homunityapiv1.runasp.net/api";

async function initSearchFilters() {
  const citySelect = document.getElementById("citySelectSearch");
  const areaSelect = document.getElementById("areaSelectSearch");

  try {
    const res = await fetch(`${API_BASE}/Location/cities`);
    const cities = await res.json();
    cities.forEach((city) => {
      const opt = new Option(city, city);
      citySelect.add(opt);
    });

    citySelect.addEventListener("change", async () => {
      areaSelect.innerHTML = "<option disabled selected>Select Area</option>";
      const resArea = await fetch(
        `${API_BASE}/Location/areas?city=${encodeURIComponent(citySelect.value)}`,
      );
      const areas = await resArea.json();
      areas.forEach((a) => {
        const opt = new Option(a.area, a.area);
        areaSelect.add(opt);
      });
    });
  } catch (e) {
    console.error("Filter Error:", e);
  }
}

function displayProperties(properties) {
  const grid = document.getElementById("properties-grid");
  if (!grid) return;

  if (properties.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center p-5"><h3>No properties found match your search.</h3></div>`;
    return;
  }

  grid.innerHTML = properties
    .map(
      (prop) => `
        <div class="col-12 col-sm-6 col-lg-4">
            <div class="property-card">
                <div class="card-img-wrapper">
                    <span class="status-badge badge-available">Available</span>
                    <img src="${prop.images?.[0]?.imageUrl || "../img/img.4.jpeg"}" alt="${prop.title}" />
                </div>
                <div class="card-body-custom">
                    <div class="prop-name">${prop.title}</div>
                    <div class="prop-meta">
                        <span>${prop.location?.area || prop.location?.city}</span>
                        <span class="price">$${prop.price} / month</span>
                    </div>
                    <div class="prop-details">
                        <div class="bed-bath"><span><i class="fa-solid fa-bed"></i></span> ${prop.rooms} Rooms</div>
                        <button class="btn-action btn-view" onclick="loadPropertyDetails(${prop.propertyID})">View Details</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
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
  } catch (e) {
    console.error("Search Error:", e);
  }
}

async function loadAllProperties() {
  try {
    const res = await fetch(`${API_BASE}/Properties/GetAll`);
    const data = await res.json();
    displayProperties(data.properties || []);
  } catch (e) {
    console.error("Load Error:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initSearchFilters();
  loadAllProperties();

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.onclick = performSearch;
  }
});

//end search

// srart booking request
async function loadMyBookings() {
  const studentID = localStorage.getItem("id") || 10;
  const listContainer = document.getElementById("bookings-dynamic-list");
  const emptyWrapper = document.getElementById("emptyStateWrapper");

  if (!listContainer) return;

  listContainer.innerHTML =
    '<div class="text-center text-gold-custom py-5">Loading your bookings...</div>';

  try {
    const response = await fetch(
      `https://homunityapiv1.runasp.net/api/Booking/student/${studentID}`,
    );
    if (!response.ok) throw new Error("API Error");

    const bookings = await response.json();

    if (!bookings || bookings.length === 0) {
      if (emptyWrapper) emptyWrapper.classList.remove("d-none");
      listContainer.innerHTML = "";
      return;
    }

    if (emptyWrapper) emptyWrapper.classList.add("d-none");

    listContainer.innerHTML = bookings
      .map((book) => {
        const status = book.statusName || "N/A";
        const title = book.property?.title || "Property";
        const location = book.property?.location || "Location";
        const img = book.property?.imageUrl || "../img/room1.1.jpg";
        const bDate = book.createdAt;
        const cDate = book.confirmedAt;
        const statusClass = status.toLowerCase().replace(/\s+/g, "-");

        const bookData = JSON.stringify(book).replace(/'/g, "&apos;");

        return `
                <div class="row text-center mb-2 gx-2 align-items-stretch">
                    <div class="col-3-half">
                        <div class="p-3 h-100 bg-navy-custom d-flex align-items-center gap-3 text-start">
                            <img src="${img}" class="booking-img-sm rounded-2 shadow-sm" style="width:50px; height:50px; object-fit:cover" />
                            <div>
                                <div class="text-gold-custom fs-6">${title}</div>
                                <div class="small text-white-50">${location}</div>
                            </div>
                        </div>
                    </div>
                    <div class="col-2-half">
                        <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-center">
                            <span class="status-badge-custom w-75 ${statusClass}">${status}</span>
                        </div>
                    </div>
                    <div class="col-2-half">
                        <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-center fs-13 text-white">
                            ${bDate ? new Date(bDate).toLocaleDateString("en-GB") : "N/A"}
                        </div>
                    </div>
                    <div class="col-3-half">
                        <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-between fs-13 text-white">
                            <span>${cDate ? new Date(cDate).toLocaleDateString("en-GB") : "----------"}</span>
                            <button class="btn-gold-action py-1 px-3 shadow-sm" onclick='renderBookingDetails(${bookData})'>
                                View Details
                            </button>
                        </div>
                    </div>
                </div>`;
      })
      .join("");
  } catch (error) {
    console.error("Load Error:", error);
    listContainer.innerHTML =
      '<div class="text-center text-danger py-5">Failed to load data.</div>';
  }
}

function renderBookingDetails(book) {
  const detailsSection = document.getElementById("sectionBookingDetails");
  const listSection = document.getElementById("sectionMyBookings");

  if (!detailsSection || !listSection) return;

  listSection.classList.add("d-none");
  detailsSection.classList.remove("d-none");

  const prop = book.property || {};

  detailsSection.querySelector(".main-details-img").src =
    prop.imageUrl || "../img/room1.jpg";
  detailsSection.querySelector("h5.text-gold-custom").innerText =
    prop.title || "Property";
  detailsSection.querySelector("p.mb-1").innerText =
    prop.location || "Location";
  detailsSection.querySelector("h5:not(.text-gold-custom)").innerHTML =
    `$${prop.price || 0} <small class="fs-5">/ month</small>`;

  const infoRows = detailsSection.querySelectorAll(
    ".white-info-row span:last-child",
  );
  if (infoRows.length >= 3) {
    infoRows[0].innerText = book.statusName || "Pending";
    infoRows[1].innerText = book.createdAt
      ? new Date(book.createdAt).toLocaleDateString("en-GB")
      : "N/A";
    infoRows[2].innerText = book.confirmedAt
      ? new Date(book.confirmedAt).toLocaleDateString("en-GB")
      : "----------";
  }

  detailsSection.dataset.currentBookingId = book.bookingId;
  window.scrollTo(0, 0);
}

loadMyBookings();
document.addEventListener("click", function (e) {
  const btn =
    e.target.closest('[onclick*="sectionMyBookings"]') ||
    e.target.closest("#linkMyBookings");
  if (btn) {
    setTimeout(loadMyBookings, 50);
  }
});
// end booking request

// start profile
async function loadUserProfile() {
  const studentID = localStorage.getItem("id") || 10;

  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const phoneInput = document.getElementById("phone");
  const statusRadios = document.getElementsByName("status");

  try {
    const response = await fetch(
      `https://homunityapiv1.runasp.net/api/Users/Get Profile By ID?id=${studentID}`,
    );

    if (!response.ok) throw new Error("Could not fetch profile");

    const userData = await response.json();

    if (firstNameInput) firstNameInput.value = userData.firstName || "";
    if (lastNameInput) lastNameInput.value = userData.lastName || "";
    if (phoneInput) phoneInput.value = userData.phone || "";

    if (statusRadios.length >= 2) {
      if (userData.isActive === true) {
        statusRadios[0].checked = true; // Active
      } else {
        statusRadios[1].checked = true; // Inactive
      }
    }

    console.log("Profile loaded for:", userData.firstName);
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

document.addEventListener("click", function (e) {
  const profileBtn =
    e.target.closest('[onclick*="sectionProfile"]') ||
    e.target.closest("#linkProfile");
  if (profileBtn) {
    setTimeout(loadUserProfile, 100);
  }
});

loadUserProfile();
// end profile
