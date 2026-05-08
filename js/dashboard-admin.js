document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID = localStorage.getItem("id");

  if (userRole !== "admin" || !userID) {
    setTimeout(() => {
      window.location.href = "../html/form.html";
    }, 100);
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
  for (let key in sections) {
    if (sections[key]) sections[key].classList.add("d-none");
  }
  for (let key in menuItems) {
    if (menuItems[key]) menuItems[key].classList.remove("active");
  }
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
//start rejected properties pop-up//
function countChars() {
  let text = document.getElementById("reasonInput").value;
  document.getElementById("charCount").innerText = text.length + " / 300";
}

function closePopup() {
  document.querySelector(".popup-overlay").style.display = "none";
}

function confirmAction() {
  let text = document.getElementById("reasonInput").value;

  if (text.trim() === "") {
    alert("Please write a reason first!");
    return;
  }

  alert("Submitted Successfully!");
}

// end rejected properties pop-up

// star dashboard
// start status btn
const statsElements = {
  totalProperties: document.getElementById("totalProperties"),
  pendingProperties: document.getElementById("pendingProperties"),
  approvedProperties: document.getElementById("approvedProperties"),
  rejectedProperties: document.getElementById("rejectedProperties"),
  totalBookings: document.getElementById("totalBookings"),
  totalUsers: document.getElementById("totalUsers"),
};

async function fetchDashboardStats() {
  const url =
    "https://homunityapiv1.runasp.net/api/AdminActions/dashboard/stats";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
      },
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    updateDashboardUI(data.stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
  }
}

function updateDashboardUI(stats) {
  statsElements.totalProperties.innerText = stats.totalProperties;
  statsElements.pendingProperties.innerText = stats.pendingProperties;
  statsElements.approvedProperties.innerText = stats.approvedProperties;
  statsElements.rejectedProperties.innerText = stats.rejectedProperties;
  statsElements.totalBookings.innerText = stats.totalBookings;
  statsElements.totalUsers.innerText = stats.totalUsers;
}

document.addEventListener("DOMContentLoaded", fetchDashboardStats);
// end status btn
// start properties btn
const tableWrapper = document.getElementById("tableWrapper");
const emptyState = document.getElementById("emptyState");
const tableBody = document.getElementById("recentActionsBody");

async function fetchRecentActions() {
  const url =
    "https://homunityapiv1.runasp.net/api/AdminActions/dashboard/recent-actions?pageSize=10";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "*/*" },
    });

    const data = await response.json();

    if (data.properties && data.properties.length > 0) {
      renderTable(data.properties);
      tableWrapper.classList.remove("d-none");
      emptyState.classList.add("d-none");
    } else {
      tableWrapper.classList.add("d-none");
      emptyState.classList.remove("d-none");
    }
  } catch (error) {
    console.error("Error:", error);
    tableWrapper.classList.add("d-none");
    emptyState.classList.remove("d-none");
  }
}

function renderTable(properties) {
  tableBody.innerHTML = "";

  properties.forEach((prop) => {
    const date = prop.createdAt.split("T")[0];
    const row = `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <img src="${prop.thumbnail}" class="rounded" style="width: 40px; height: 40px; object-fit: cover;">
                        <span>${prop.title}</span>
                    </div>
                </td>
                <td>${prop.ownerName}</td>
                <td>${prop.location.city}, ${prop.location.area}</td>
                <td>${date}</td>
                <td class="text-center">
                   <button class="btn btn-gold-action px-5 py-2 fw-bold  shadow-sm" 
                            style="min-width: 140px; border-radius: 12px; font-size: 14px;">
                        ${prop.actionType}
                    </button>
                </td>
            </tr>
        `;
    tableBody.innerHTML += row;
  });
}

document.addEventListener("DOMContentLoaded", fetchRecentActions);
// end properties btn
// end dashboard

// start pending properties
let currentPage = 1;
const pageSize = 9;
let totalPages = 1;
let allProperties = [];

async function fetchProperties(page = 1) {
  const url = `https://homunityapiv1.runasp.net/api/AdminActions/properties/pending?page=${page}&pageSize=${pageSize}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "*/*" },
    });

    const data = await response.json();

    totalPages = data.totalPages || 1;
    currentPage = data.page || 1;
    allProperties = data.properties || [];

    renderUI(allProperties);
    updatePagination();
  } catch (error) {
    renderUI([]);
  }
}

function renderUI(list) {
  const grid = document.getElementById("properties-grid");
  const empty = document.getElementById("emptyState");
  const paginBox = document.getElementById("pagination-wrapper");
  const infoBox = document.getElementById("pageInfo");

  grid.innerHTML = "";

  if (list.length === 0) {
    grid.classList.add("d-none");
    paginBox.classList.add("d-none");
    infoBox.classList.add("d-none");
    empty.classList.remove("d-none");
    return;
  }

  grid.classList.remove("d-none");
  empty.classList.add("d-none");
  paginBox.classList.remove("d-none");
  infoBox.classList.remove("d-none");

  list.forEach((prop) => {
    const card = `
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
                    <button class="btn-action btn-view" onclick="showPropertyDetails(${prop.propertyID})">View Details</button>                        </div>
                    </div>
                </div>
            </div>`;
    grid.insertAdjacentHTML("beforeend", card);
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
    btn.style.width = "35px";
    btn.style.height = "35px";
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

  const filtered = allProperties.filter((p) => {
    const cMatch = city === "City•" || city === "" || p.location.city === city;
    const aMatch = area === "Area•" || area === "" || p.location.area === area;
    const pMatch = p.price >= min && p.price <= max;
    return cMatch && aMatch && pMatch;
  });

  renderUI(filtered);
};

document.getElementById("prevPage").onclick = () => {
  if (currentPage > 1) fetchProperties(currentPage - 1);
};

document.getElementById("nextPage").onclick = () => {
  if (currentPage < totalPages) fetchProperties(currentPage + 1);
};

document.addEventListener("DOMContentLoaded", () => fetchProperties(1));
// end pending properties

// start rejected properties

const container = document.getElementById("rejectedPropertiesContainer");
const emptyState2 = document.getElementById("emptyState");

async function fetchRejectedProperties() {
  const url =
    "https://homunityapiv1.runasp.net/api/AdminActions/properties/rejected";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "*/*" },
    });

    const data = await response.json();

    if (data.properties && data.properties.length > 0) {
      renderRejectedCards(data.properties);
    } else {
      renderRejectedCards([]);
    }
  } catch (error) {
    console.error("Error fetching rejected properties:", error);
    renderRejectedCards([]);
  }
}

function renderRejectedCards(properties) {
  container.innerHTML = "";

  if (properties.length === 0) {
    emptyState2.classList.remove("d-none");
    return;
  }

  emptyState2.classList.add("d-none");

  properties.forEach((prop) => {
    const date = prop.createdAt ? prop.createdAt.split("T")[0] : "N/A";

    const cardHTML = `
            <div class="property-card-wrapper mb-4 shadow-sm">
                <div class="property-main-box d-flex flex-wrap align-items-center p-3 border-bottom">
                    <div class="property-img">
                        <img src="${prop.thumbnail}" alt="${prop.title}"
                             style="width: 200px; height: 130px; object-fit: cover;"
                             onerror="this.src='../img/placeholder.jpg'">
                    </div>
                    <div class="property-info fw-bold ms-3">
                        <p class="mb-1 text-dark fs-5">${prop.title}</p>
                        <p class="mb-1 text-muted small">
                            <i class="fa-solid fa-location-dot me-1"></i>
                            ${prop.location.city}, ${prop.location.area}
                        </p>
                        <p class="mb-1 text-primary">Price: ${prop.price.toLocaleString()} EGP</p>
                        <p class="mb-0 text-muted small" style="font-size: 12px;">Created: ${date}</p>
                    </div>
                    <button class=" btn-rejected border-0  px-4 fw-bold ms-auto">Rejected</button>
                </div>
                <div class="property-footer-box d-flex justify-content-between align-items-center p-3 bg-light">
                    <span class="fw-bold text-danger">
                        <i class="fa-solid fa-circle-xmark me-2"></i>
                        Reject Reason: <span class="text-dark fw-normal">${prop.rejectReason || "No reason provided"}</span>
                    </span>
                </div>
            </div>
        `;
    container.insertAdjacentHTML("beforeend", cardHTML);
  });
}

document.addEventListener("DOMContentLoaded", fetchRejectedProperties);

// end rejected properties

// start deteails propertie

let currentPropertyId = null;

async function showPropertyDetails(id) {
  // تأكد من إخفاء الأقسام الأخرى وإظهار قسم التفاصيل
  hideAllSections();
  currentPropertyId = id;

  // تصحيح الرابط بإضافة علامة "="
  const url = `https://homunityapiv1.runasp.net/api/Properties/GetByIDV2?id=${id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "*/*" },
    });
    const data = await response.json();

    // السيرفر يرجع كائن يحتوي على property
    if (data.property) {
      const prop = data.property;
      const detailsSection = document.getElementById("propertyDetails");

      detailsSection.classList.remove("d-none");

      // تعبئة البيانات الأساسية مع استخدام Optional Chaining لتجنب الأخطاء
      detailsSection.querySelector(".card-title").innerText =
        prop.title || "No Title";

      // التعامل مع اختلاف بنية الموقع (Location)
      const city = prop.location?.city || "Unknown City";
      const area = prop.location?.area || "Unknown Area";
      detailsSection.querySelector(".card-address").innerText =
        `${city}, ${area}`;

      detailsSection.querySelector(".card-desc").innerText =
        prop.description || "No description provided.";

      // تحديث قائمة التفاصيل (السعر والغرف)
      detailsSection.querySelector(".details-list").innerHTML = `
                <li><i class="fa-solid fa-money-bill"></i> Price: $${prop.price} / month</li>
                <li><i class="fa-solid fa-door-open"></i> ${prop.rooms} rooms</li>
                <li><i class="fa-solid fa-house-user"></i> Type: ${prop.propertyType}</li>
            `;

      // تحديث المعرض (Gallery)
      const galleryWrapper = detailsSection.querySelector(".gallery-wrapper");
      const galleryThumbs = detailsSection.querySelector(".gallery-thumbs");

      if (prop.images && prop.images.length > 0) {
        galleryWrapper.innerHTML = prop.images
          .map((img, index) => {
            const isInitialVisible =
              index < 3 ? "display: block;" : "display: none;";
            return `
              <div class="gallery-img-box" data-index="${index}" style="${isInitialVisible}">
                  <img src="${img.imageUrl}" alt="property image ${index + 1}" onclick="changeSlide(${index})" />
              </div>`;
          })
          .join("");

        galleryThumbs.innerHTML = prop.images
          .map(
            (img, index) => `
              <img src="${img.imageUrl}" alt="thumb ${index + 1}" 
                   class="${index === 0 ? "active" : ""}" 
                   onclick="changeSlide(${index})" />`,
          )
          .join("");
      } else {
        galleryWrapper.innerHTML = "<p>No images available</p>";
        galleryThumbs.innerHTML = "";
      }

      if (prop.location?.latitude && prop.location?.longitude) {
        const googleMapsUrl = `https://maps.google.com/maps?q=${prop.location.latitude},${prop.location.longitude}&z=15&output=embed`;
        // افترضنا وجود div بـ id="mapContainer" في الـ HTML الخاص بك
        const mapContainer = document.getElementById("info-card-map");
        const addressContainer = document.getElementById("info-card-address");

        if (mapContainer) {
          mapContainer.innerHTML = `
          
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

    </div>

          `;
          addressContainer.innerHTML = `
      <div class="d-flex justify-content-end  w-100">
       <div class="details text-end ">
          <h3>${prop.location?.university.name || "Unknown University"}</h3>
          <p> ${prop.location?.address || ""}<strong> : العنوان</strong></p>
          <p><strong>المسافة : </strong> ${prop.location?.university.distance_km || 0} كم</p>
      </div>
      </div>
          `;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching property details:", error);
  }
}
function changeSlide(index) {
  const slides = document.querySelectorAll(".gallery-img-box");
  const thumbs = document.querySelectorAll(".gallery-thumbs img");
  const total = slides.length;

  slides.forEach((s) => {
    s.style.display = "none";
    s.classList.remove("show");
  });

  const first = index % total;
  const second = (index + 1) % total;
  const third = (index + 2) % total;

  [first, second, third].forEach((i) => {
    if (slides[i]) {
      slides[i].style.display = "block";
      slides[i].classList.add("show");
    }
  });

  thumbs.forEach((t) => t.classList.remove("active"));
  thumbs[index].classList.add("active");

  const thumbsContainer = document.querySelector(".gallery-thumbs");
  if (thumbsContainer) {
    const thumbWidth = thumbs[index].offsetWidth + 10;
    thumbsContainer.scrollTo({
      left: index * thumbWidth - thumbWidth,
      behavior: "smooth",
    });
  }
}

async function handleApprove() {
  const adminId = localStorage.getItem("id") || 91;
  const url = `https://homunityapiv1.runasp.net/api/AdminActions/properties/${currentPropertyId}/approve?adminId=${adminId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { accept: "*/*" },
    });
    if (response.ok) {
      alert("Property approved successfully!");
      location.reload();
    }
  } catch (error) {
    console.error("Approve error:", error);
  }
}

function openRejectPopup() {
  document.getElementById("rejectPopupSection").classList.remove("d-none");
}

function closePopup() {
  document.getElementById("rejectPopupSection").classList.add("d-none");

  document.getElementById("reasonInput").value = "";
  document.getElementById("charCount").innerText = "0 / 300";
}

async function confirmAction() {
  const adminId = localStorage.getItem("id") || 91;
  const reason = document.getElementById("reasonInput").value;

  if (!reason) {
    alert("Please provide a reason");
    return;
  }
  if (reason.length < 10) {
    alert("Reason must be at least 10 characters long");
    return;
  }

  const url = `https://homunityapiv1.runasp.net/api/AdminActions/properties/${currentPropertyId}/reject?adminId=${adminId}&reason=${encodeURIComponent(reason)}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { accept: "*/*" },
    });
    if (response.ok) {
      alert("Property rejected!");
      location.reload();
    }
  } catch (error) {
    console.error("Reject error:", error);
  }
}

function countChars() {
  const len = document.getElementById("reasonInput").value.length;
  document.getElementById("charCount").innerText = `${len} / 300`;
}

// end deteails propertie

// start logout
document.addEventListener("click", (e) => {
  if (e.target.id === "logoutBtn") {
    localStorage.clear();
    window.location.href = "../index.html";
  }
});
// end logout
