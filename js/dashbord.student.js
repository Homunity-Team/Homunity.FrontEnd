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
  sections.home.classList.remove("d-none");
  menuItems.home.classList.add("active");
});

// start home
const BASE_URL = "https://homunityapiv1.runasp.net/api";
const STUDENT_ID = localStorage.getItem("id");

window.currentPropertyId = null;
window.currentBookingId = null;

// دالة التنبيهات (Toasts)

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
        (b) => b.statusName === "Pending" || b.statusName === "In-Process",
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
                    ${item.property?.address}
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
    const response = await fetch(
      `${BASE_URL}/Properties/GetByIDV2?id=${propId}`,
    );
    const data = await response.json();

    if (data && data.property) {
      renderPropertyPage(data.property);
      window.showSection("sectionPropirtie");
    }
  } catch (error) {
    console.error("Details Fetch Error:", error);
    Toast.fire({ icon: "error", title: "عذراً، معرف العقار غير موجود" });
  }
};

function renderPropertyPage(prop) {
  const sec = document.getElementById("sectionPropirtie");
  const infoCard = document.getElementById("info-card-map");

  if (!sec) return;

  const googleMapsUrl = `https://maps.google.com/maps?q=${prop.location?.latitude},${prop.location?.longitude}&z=15&output=embed`;

  infoCard.innerHTML = `

    <style>
        .mapContainer {
            width: 100%;
            max-width: 1000px; /* يمكنك زيادة هذا الرقم لتكبير الكارت كله */
            margin: auto;
        }
        #map-frame {
            width: 100%;
            height: 300px; /* هنا نتحكم في طول الخريطة (كبر الرقم كما تحب) */
            border: 0;
            border-radius: 8px;
        }
        .details {
            padding: 15px;
            background: #fff;
        }
    </style>

    <div class = "mapContainer">
          <iframe 
          id="map-frame"
          src="${googleMapsUrl}">
      </iframe>

      <!-- جزء البيانات النصية -->
      <div class="d-flex justify-content-end  w-100">
       <div class="details text-end ">
          <h3>${prop.location?.university.name || "Unknown University"}</h3>
          <p> ${prop.location?.address || ""}<strong>:العنوان</strong></p>
          <p><strong>المسافة:</strong> ${prop.location?.university.distance_km || 0} كم</p>
      </div>
      </div>
    </div>
        `;

  sec.querySelector(".card-title").innerText =
    prop.title || "No Title Provided";
  sec.querySelector(".card-address").innerText =
    `${prop.location?.address || ""} ${prop.location?.area || ""}`;
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
            <li><i class="fa-solid fa-diamond"></i> ${prop.rooms || 0} rooms</li>
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

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});
window.confirmBooking = async function () {
  try {
    const res = await fetch(
      `${BASE_URL}/Booking?PropertyId=${window.currentPropertyId}&StudentId=${STUDENT_ID}`,
      { method: "POST" },
    );
    if (res.ok) {
      Toast.fire({ icon: "success", title: "تم الحجز بنجاح  " });
      setTimeout(() => {
        window.location.reload();
        fetchMyBookings();
      }, 1500);
      const currentSaved = JSON.parse(
        localStorage.getItem("bookedProperties") || "[]",
      );
      currentSaved.push(window.currentPropertyId);
      localStorage.setItem("bookedProperties", JSON.stringify(currentSaved));
    }
  } catch (e) {
    Toast.fire({ icon: "error", title: "عذراً، معرف العقار غير موجود" });
  }
};

window.cancelBooking = async function () {
  if (!window.currentBookingId)
    return Toast.fire({ icon: "error", title: "عذراً، معرف العقار غير موجود" });

  if (!confirm("هل تريد إلغاء الحجز؟")) return;

  try {
    const res = await fetch(
      `${BASE_URL}/Booking/${window.currentBookingId}/cancel`,
      {
        method: "PUT",
      },
    );
    if (res.ok) {
      Toast.fire({ icon: "success", title: "تم الغاء الحجز بنجاح   " });
      setTimeout(() => {
        // window.showSection("sectionHome");
        window.location.reload();
        fetchMyBookings();
      }, 1500);
    }
  } catch (e) {
    Toast.fire({ icon: "error", title: "عذراً، معرف العقار غير موجود" });
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

async function initSearchFilters() {
  const universitySelect = document.getElementById("universitySelectSearch");
  if (!universitySelect) return;

  try {
    const res = await fetch(`${API_BASE}/Universities/GetAll`);
    const data = await res.json();

    universitySelect.innerHTML =
      '<option value="all">All Universities</option>';

    if (data.universities) {
      data.universities.forEach((uni) => {
        const opt = new Option(uni.name, uni.universityId);
        universitySelect.add(opt);
      });
    }
  } catch (e) {
    console.error("Filter Error:", e);
  }
}

async function performSearch() {
  const uniId = document.getElementById("universitySelectSearch").value;
  const maxP = document.getElementById("maxPriceInput").value || 1000000;
  const grid = document.getElementById("properties-grid");

  let url;
  if (uniId === "all") {
    url = `${API_BASE}/Properties/GetAll`;
  } else {
    url = `${API_BASE}/Properties/SearchByUniversity?universityId=${uniId}&maxPrice=${maxP}`;
  }

  try {
    grid.innerHTML =
      '<div class="col-12 text-center p-5"><h3>Searching...</h3></div>';
    const res = await fetch(url);
    const data = await res.json();

    const properties = data.properties || data;
    displayProperties(Array.isArray(properties) ? properties : []);
  } catch (e) {
    console.error("Search Error:", e);
    grid.innerHTML =
      '<div class="col-12 text-center p-5 text-danger"><h3>Error fetching properties.</h3></div>';
  }
}

function displayProperties(properties) {
  const grid = document.getElementById("properties-grid");
  if (!grid) return;

  const bookedIds = JSON.parse(
    localStorage.getItem("bookedProperties") || "[]",
  );

  const filteredProperties = properties.filter(
    (prop) => !bookedIds.includes(prop.propertyID),
  );

  if (filteredProperties.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center p-5"><h3>No properties available.</h3></div>`;
    return;
  }

  grid.innerHTML = filteredProperties
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
                            <span>${prop.location?.street || prop.location?.address || "Location Details"}</span>
                            <span class="price">$${prop.price} / month</span>
                        </div>
                        <div class="prop-details">
                            <div class="bed-bath"><span><i class="fa-solid fa-bed"></i></span> ${prop.rooms} Rooms</div>
                            <button class="btn-action btn-view" onclick="loadPropertyDetails(${prop.propertyId || prop.propertyID})">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        `,
    )
    .join("");
}

// جلب كل العقارات في البداية
async function loadAllProperties() {
  try {
    const res = await fetch(`${API_BASE}/Properties/GetAll`);
    const data = await res.json();
    displayProperties(data.properties || []);
  } catch (e) {
    console.error("Load Error:", e);
  }
}

// التنسيق عند تشغيل الصفحة
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
  const emptyWrapper = document.getElementById("emptyStateWrapperr");

  if (!listContainer || !emptyWrapper) return;

  listContainer.innerHTML =
    '<div class="text-center text-gold-custom py-5">Loading your bookings...</div>';
  emptyWrapper.classList.add("d-none");

  try {
    const response = await fetch(
      `https://homunityapiv1.runasp.net/api/Booking/student/${studentID}`,
    );
    if (!response.ok) throw new Error("API Error");

    const data = await response.json();
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

    listContainer.innerHTML = bookings
      .map((book) => {
        const status = book.statusName || "N/A";
        const property = book.property || {};
        const title = property.title || "Property";
        const location = property.address || "Location";
        const img = property.imageUrl || "../img/room1.1.jpg";
        const bDate = book.createdAt
          ? new Date(book.createdAt).toLocaleDateString("en-GB")
          : "N/A";
        const cDate = book.confirmedAt
          ? new Date(book.confirmedAt).toLocaleDateString("en-GB")
          : "----------";
        const statusClass = status.toLowerCase().replace(/\s+/g, "-");

        const safeBookData = encodeURIComponent(JSON.stringify(book));

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
                      ${bDate}
                  </div>
              </div>
              <div class="col-3-half">
                  <div class="p-3 h-100 bg-navy-custom d-flex align-items-center justify-content-between fs-13 text-white">
                      <span>${cDate}</span>
                      <button class="btn-gold-action py-1 px-3 shadow-sm" onclick="renderBookingDetails('${safeBookData}')">
                          View Details
                      </button>
                  </div>
              </div>
          </div>`;
      })
      .join("");
  } catch (error) {
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
  const statusText = document.querySelector(".white-info-row span.Pending");

  if (!detailsSection || !listSection) return;

  if (book.statusName === "In-Process") {
    cancelBtn.disabled = false;
    cancelBtn.style.opacity = "1";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.innerText = "Cancel Booking";
    if (statusText) statusText.className = "Pending py-1 px-4";
  } else {
    cancelBtn.disabled = true;
    cancelBtn.style.opacity = "0.5";
    cancelBtn.style.cursor = "not-allowed";
    cancelBtn.innerText = "Processing...";
    if (statusText) statusText.className = "In-Process py-1 px-4";
  }

  listSection.classList.add("d-none");
  detailsSection.classList.remove("d-none");

  document.getElementById("idCansel").value = book.bookingId;
  document.getElementById("idProprty").value = book.property.propertyId;

  const prop = book.property || {};
  console.log(book);

  detailsSection.querySelector(".main-details-img").src =
    prop.imageUrl || "../img/room1.jpg";
  detailsSection.querySelector("h5.text-gold-custom").innerText =
    prop.title || "Property";
  detailsSection.querySelector("p.mb-1").innerText =
    prop.location.address || "Location";

  const priceEl = detailsSection.querySelector("h5:not(.text-gold-custom)");
  if (priceEl)
    priceEl.innerHTML = `$${prop.price || 0} <small class="fs-5">/ month</small>`;

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
document.addEventListener("DOMContentLoaded", loadMyBookings);

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

async function fetchNotifications() {
  const container = document.getElementById("notifications-container");

  const studentId = localStorage.getItem("id");

  if (!studentId) {
    console.error("Student ID not found in localStorage");
    return;
  }

  try {
    const res = await fetch(
      `https://homunityapiv1.runasp.net/api/Booking/student/${studentId}`,
    );
    const data = await res.json();

    if (!data || data.length === 0) {
      container.innerHTML = `
                <div class="text-center py-5">
                    <div class="mb-3">
                         <i class="fa-regular fa-bell-slash fa-3x text-gold-custom"></i>
                    </div>
                    <h5 class="text-gold-custom">No Notification yet!</h5>
                </div>`;
      return;
    }
    container.innerHTML = data
      .map((notif) => {
        let badgeClass = "";
        let message = "";

        if (notif.statusName === "Cancelled") {
          badgeClass = "bg-danger";
          message = `Your booking for <strong>${notif.property.title}</strong> has been cancelled.`;
        } else if (notif.statusName === "In-Process") {
          badgeClass = "bg-warning text-dark";
          message = `Your booking request for <strong>${notif.property.title}</strong> is still waiting for approval.`;
        } else if (notif.statusName === "Booked") {
          badgeClass = "bg-success";
          message = `Your booking request for <strong>${notif.property.title}</strong> is still waiting for approval.`;
        } else {
          badgeClass = "bg-info";
          message = `Update on your booking for <strong>${notif.property.title}</strong>: ${notif.statusName}`;
        }

        if (!data || data.length === 0) {
          container.innerHTML = `
                <div class="empty-notif-wrapper text-center">
                    <div class="icon-circle mb-4">
                        <i class="fa-solid fa-bell-slash"></i>
                        <div class="cross-line">×</div>
                    </div>
                    <h5 class="empty-text">No Notification yet!</h5>
                </div>`;
          return;
        }
        if (badgeClass === "bg-info") {
          return `
                <div class="notification-card d-flex justify-content-between align-items-center p-5 mb-3 shadow-sm" 
                     style="background-color: #1e2738; border-radius: 12px; border-left: 5px solid ${notif.statusName === "Cancelled" ? "#dc3545" : "#f1b42f"}">
                    <div class="text-white">
                        <p class="mb-1" style="font-size: 0.9rem;">${message}</p>
                        <small class="text-secondary">${new Date(notif.createdAt).toLocaleString("en-GB")}</small>
                    </div>
                    <span class="badge ${badgeClass} d-inline-flex align-items-center rounded-pill p-2 ps-4 shadow-sm border border-light">
                        <!-- نص الحالة -->
                        <span class="me-3 fw-bold text-uppercase" style="letter-spacing: 0.5px;">
                            ${notif.statusName}
                        </span>
                        
                        <!-- زر الدفع -->
                        <button onclick="openPayment(${notif.bookingId})" class="btn btn-light btn-sm fw-bold shadow-sm px-3" 
                                style="border-radius: 50px; color: #198754;">
                            <i class="bi bi-wallet2 me-1"></i> Pay Now
                        </button>
                    </span>                
                    </div>
            `;
        }
        return `
                <div class="notification-card d-flex justify-content-between align-items-center p-5 mb-3 shadow-sm" 
                     style="background-color: #1e2738; border-radius: 12px; border-left: 5px solid ${notif.statusName === "Cancelled" ? "#dc3545" : "#f1b42f"}">
                    <div class="text-white">
                        <p class="mb-1" style="font-size: 0.9rem;">${message}</p>
                        <small class="text-secondary">${new Date(notif.createdAt).toLocaleString("en-GB")}</small>
                    </div>
                    <span class="badge ${badgeClass} p-2 px-4" style="border-radius: 8px;">${notif.statusName}  </span>
                </div>
            `;
      })
      .join("");
  } catch (error) {
    container.innerHTML = `
                <div class="empty-notif-wrapper text-center ">
                    <div class="icon-circle mb-4">
                                  <img src="../img/no-notification.svg" class="no-notif-img" alt="No Notifications">

                    </div>
                    <h5 class="empty-text text-gold-custom">No Notification yet!</h5>
                </div>`;
    return;
  }
}
fetchNotifications();
