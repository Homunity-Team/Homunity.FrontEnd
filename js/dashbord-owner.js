document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID = localStorage.getItem("id");

  // شرط الدخول

  if (userRole !== "owner" || !userID) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "You cannot access the dashboard without logging in",
    });
    setTimeout(() => {
      window.location.href = "../html/form.html";
    }, 3000);
  }
});

// start responsive sidebar
document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      sidebar.classList.toggle("active");
    });
  }

  const navItems = document.querySelectorAll(".sidebar nav ul li");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      if (window.innerWidth < 992) {
        sidebar.classList.remove("active");
      }
    });
  });
});
// end responsive sidebar
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
    if (option == "add") {
      item[key].classList.add("d-none");
    } else {
      item[key].classList.remove("active");
    }
  }
}

const laoding = document.getElementById("homunityLoader");
function showLoader() {
  laoding.classList.remove("d-none");
}
function hideLoader() {
  laoding.classList.add("d-none");
}

// function dis(aItem, rItem, aActive, rActive) {
//   aItem.classList.add("d-none");
//   rItem.classList.remove("d-none");
//   aActive.classList.add("active");
//   rActive.classList.remove("active");
// }

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

// start get location

fetch("https://homunityapiv1.runasp.net/api/Location/cities", {
  headers: {
    accept: "*/*",
  },
})
  .then((res) => res.json())
  .then((data) => {
    const select = document.getElementById("citySelect");
    data.forEach((city) => {
      const option = document.createElement("option");
      option.value = city || city;
      option.textContent = city;
      select.appendChild(option);
    });
  })
  .catch((err) => console.error(err));

const citySelect = document.getElementById("citySelect");
const areaSelect = document.getElementById("areaSelect");
const streetAdd = document.getElementById("streetAdd");

citySelect.addEventListener("change", async () => {
  const cityId = citySelect.value;

  try {
    const response = await fetch(
      `https://homunityapiv1.runasp.net/api/Location/areas?city=${cityId}`,
    );
    const areas = await response.json();

    areaSelect.innerHTML = "<option selected disabled>Choose Area</option>";
    areas.forEach((area) => {
      const option = document.createElement("option");
      option.value = area.locationId;
      option.textContent = area.area;
      option.dataset.street = area.street;
      areaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
  }
});

areaSelect.addEventListener("change", () => {
  const selectedOption = areaSelect.options[areaSelect.selectedIndex];

  const streetName = selectedOption.dataset.street;

  if (streetName) {
    streetAdd.value = streetName;
  }
});

// end get location

// start add property
const addPropertyForm = document.getElementById("addPropertyForm");

addPropertyForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("titleAdd");
  const price = document.getElementById("priceAdd");
  const rooms = document.getElementById("roomsAdd");
  const city = document.getElementById("citySelect");
  const area = document.getElementById("areaSelect");
  const images = document.getElementById("images");
  const video = document.getElementById("video");

  let isValid = true;

  const toggleError = (id, show) => {
    const errorEl = document.getElementById(id);
    if (errorEl) {
      errorEl.style.display = show ? "block" : "none";
    }
  };

  if (title.value.length < 5 || title.value.length > 15) {
    toggleError("titleError", true);
    isValid = false;
  } else {
    toggleError("titleError", false);
  }

  if (parseFloat(price.value) < 100 || !price.value) {
    toggleError("priceError", true);
    isValid = false;
  } else {
    toggleError("priceError", false);
  }

  if (parseInt(rooms.value) < 1 || parseInt(rooms.value) > 10 || !rooms.value) {
    toggleError("roomsError", true);
    isValid = false;
  } else {
    toggleError("roomsError", false);
  }

  if (city.selectedIndex <= 0 || area.selectedIndex <= 0) {
    alert("Please select both City and Area.");
    isValid = false;
  }

  if (images.files.length > 6) {
    alert("Max 6 images allowed.");
    isValid = false;
  }

  for (let file of images.files) {
    if (file.size > 2 * 1024 * 1024) {
      alert(`Image ${file.name} is too large (Max 2MB).`);
      isValid = false;
      break;
    }
  }

  if (video.files.length > 0 && video.files[0].size > 30 * 1024 * 1024) {
    alert("Video size must be less than 30MB.");
    isValid = false;
  }

  if (!isValid) return;

  showLoader();
  const formData = new FormData();
  const ownerId = localStorage.getItem("id");
  try {
    formData.append("OwnerID", parseInt(ownerId));
    formData.append("Title", title.value);
    formData.append(
      "Description",
      document.getElementById("descreptionAdd").value || "",
    );
    formData.append("Price", parseFloat(price.value));
    formData.append("Rooms", parseInt(rooms.value));

    const propertyType = document.getElementById("apartmentApp").checked
      ? "Apartment"
      : "Room";
    formData.append("PropertyType", propertyType);

    const locId = parseInt(area.value);
    formData.append("LocationID", isNaN(locId) ? 0 : locId);

    if (images.files.length > 0) {
      for (let i = 0; i < images.files.length; i++) {
        formData.append("Images", images.files[i]);
      }
    }

    if (video.files.length > 0) {
      formData.append("Video", video.files[0]);
    }

    const servicesMap = { wifi: 1, parking: 2, gym: 3, ac: 4 };
    Object.keys(servicesMap).forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.checked) {
        formData.append("Services", parseInt(servicesMap[id]));
      }
    });

    const response = await fetch(
      "https://homunityapiv1.runasp.net/api/Properties/CreateFullProperty",
      {
        method: "POST",
        body: formData,
      },
    );

    if (response.ok) {
      alert("Property Added Successfully!");
      window.location.reload();
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

const cancelAdd = document.getElementById("cancelAdd");
cancelAdd.addEventListener("click", () => {
  sections.addProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
  menuItems.addProperties.classList.remove("active");
  menuItems.properties.classList.add("active");
});
// end add property

// start update property

let newPropertyFiles = [];
let newVideoFile = null;

function showPropertyDetails(prop) {
  const listSection = document.getElementById("propertiesListSection");
  const detailsSection = document.getElementById("oneProperti");
  if (listSection) listSection.classList.add("d-none");
  if (detailsSection) detailsSection.classList.remove("d-none");
  const images =
    prop.images && prop.images.length > 0
      ? prop.images
      : [{ imageUrl: "https://via.placeholder.com/400" }];
  document.getElementById("onePMainImg").src = images[0].imageUrl;
  document.getElementById("onePSideImgLeft").src = images[1]
    ? images[1].imageUrl
    : images[0].imageUrl;
  document.getElementById("onePSideImgRight").src = images[2]
    ? images[2].imageUrl
    : images[0].imageUrl;
  document.getElementById("onePTitle").textContent = prop.title || "No Title";
  document.getElementById("onePTitleHeader").textContent =
    prop.title || "Details";
  document.getElementById("onePDescription").textContent =
    prop.description || "No Description";
  if (prop.location) {
    document.getElementById("onePAddress").textContent =
      `${prop.location.street || ""}, ${prop.location.area || ""}, ${prop.location.city || ""}`;
  }
  document.getElementById("onePPrice").innerHTML =
    `<i class="fas fa-diamond"></i> Price $${prop.price} / month`;
  document.getElementById("onePRooms").innerHTML =
    `<i class="fas fa-diamond"></i> ${prop.rooms} Bedrooms`;
  document.getElementById("onePBackBtn").onclick = () => {
    detailsSection.classList.add("d-none");
    listSection.classList.remove("d-none");
  };
  document.getElementById("onePBtnUpdate").onclick = () => {
    openUpdateSection(prop);
  };
}

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

  if (prop.location) {
    const citySelect = document.getElementById("cityUpdate");
    const areaSelect = document.getElementById("areaUpdate");
    citySelect.innerHTML = `<option value="${prop.location.locationId}" selected>${prop.location.city}</option>`;
    areaSelect.innerHTML = `<option value="${prop.location.locationId}" selected>${prop.location.area}</option>`;
    document.getElementById("streetUpdate").value = prop.location.street || "";
  }

  const checkboxes = ["wifiUpdate", "parkingUpdate", "gymUpdate", "acUpdate"];
  checkboxes.forEach((id) => (document.getElementById(id).checked = false));
  if (prop.services) {
    prop.services.forEach((s) => {
      const name = s.name.toLowerCase();
      if (name.includes("wifi"))
        document.getElementById("wifiUpdate").checked = true;
      if (name.includes("air"))
        document.getElementById("parkingUpdate").checked = true;
      if (name.includes("washing"))
        document.getElementById("gymUpdate").checked = true;
      if (name.includes("water"))
        document.getElementById("acUpdate").checked = true;
    });
  }

  const mediaContainer = document.getElementById("allImg");
  mediaContainer.innerHTML = `
        <div class="upload-wrapper w-100">
            <div class="row g-3">
                <div class="col-lg-9 col-12 border-end-divider">
                    <div class="mb-3">
                        <button type="button" id="addImageBtn" class="add-btn-yellow" onclick="document.getElementById('newImagesInput').click()">+Add Image</button>
                        <input type="file" id="newImagesInput" multiple accept="image/*" class="d-none" onchange="previewNewImages(this)">
                    </div>
                    <div id="imagesGrid" class="images-grid-layout"></div>
                </div>
                <div class="col-lg-3 col-12 ps-lg-4">
                    <div class="mb-3">
                        <button type="button" id="addVideoBtn" class="add-btn-yellow w-100" onclick="document.getElementById('newVideoInput').click()">+Add Video</button>
                        <input type="file" id="newVideoInput" accept="video/*" class="d-none" onchange="previewNewVideo(this)">
                    </div>
                    <div id="videoPreviewContainer"></div>
                </div>
            </div>
        </div>`;

  const imagesGrid = document.getElementById("imagesGrid");
  if (prop.images) {
    prop.images.forEach((img) => {
      imagesGrid.appendChild(createMediaCard(img.imageUrl, "image"));
    });
  }
  const videoPreviewContainer = document.getElementById(
    "videoPreviewContainer",
  );
  if (prop.video && prop.video.videoUrl) {
    videoPreviewContainer.appendChild(
      createMediaCard(prop.video.videoUrl, "video"),
    );
    document.getElementById("addVideoBtn").style.display = "none";
  }
  checkImageLimit();
}

function createMediaCard(url, type, isNew = false, fileName = "") {
  const div = document.createElement("div");
  div.className = "thumb-wrapper";
  if (isNew) div.dataset.fileName = fileName;
  let mediaContent =
    type === "image"
      ? `<div class="thumb-img" style="background-image: url('${url}')"></div>`
      : `<div class="thumb-img video-preview-wrapper"><video src="${url}" controls class="w-100 h-100 rounded-3"></video></div>`;
  div.innerHTML = `${mediaContent}<button type="button" class="delete-btn-yellow mt-2" onclick="removeMediaItem(this, '${type}')"><i class="fa fa-trash-alt"></i> Delete</button>`;
  return div;
}

function previewNewImages(input) {
  const imagesGrid = document.getElementById("imagesGrid");
  const files = Array.from(input.files);
  files.forEach((file) => {
    if (imagesGrid.querySelectorAll(".thumb-wrapper").length >= 6) return;
    newPropertyFiles.push(file);
    const objectUrl = URL.createObjectURL(file);
    imagesGrid.appendChild(
      createMediaCard(objectUrl, "image", true, file.name),
    );
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
    newPropertyFiles = newPropertyFiles.filter(
      (f) => f.name !== parent.dataset.fileName,
    );
  } else if (type === "video") {
    newVideoFile = null;
    document.getElementById("addVideoBtn").style.display = "block";
  }
  parent.remove();
  checkImageLimit();
}

function checkImageLimit() {
  const count =
    document.getElementById("imagesGrid")?.querySelectorAll(".thumb-wrapper")
      .length || 0;
  const btn = document.getElementById("addImageBtn");
  if (btn) btn.style.display = count >= 6 ? "none" : "inline-block";
}

const updatePropertyForm = document.getElementById("updatePropertyForm");
updatePropertyForm?.addEventListener("submit", async function (e) {
  e.preventDefault();
  showLoader();

  try {
    const formData = new FormData();

    formData.append(
      "PropertyID",
      Number(document.getElementById("propertyIdUpdate").value),
    );
    formData.append("Title", document.getElementById("titleUpdate").value);
    formData.append(
      "Description",
      document.getElementById("descriptionUpdate").value,
    );
    formData.append(
      "Price",
      Number(document.getElementById("priceUpdate").value),
    );
    formData.append(
      "Rooms",
      Number(document.getElementById("roomsUpdate").value),
    );
    formData.append(
      "LocationID",
      Number(document.getElementById("areaUpdate").value),
    );

    const selectedType = document.querySelector(
      'input[name="propertyType"]:checked',
    );
    let typeValue = "Apartment";
    if (selectedType) {
      typeValue =
        selectedType.value === "on"
          ? selectedType.id === "apartmentUpdate"
            ? "Apartment"
            : "Room"
          : selectedType.value;
    }
    formData.append("PropertyType", typeValue);

    if (newPropertyFiles.length > 0) {
      newPropertyFiles.forEach((file) => formData.append("NewImages", file));
    }

    if (newVideoFile) {
      formData.append("NewVideo", newVideoFile);
      formData.append("DeleteVideo", false);
    } else {
      const isVideoDeleted =
        document.querySelector(".video-preview-wrapper") === null;
      formData.append("DeleteVideo", isVideoDeleted);
    }

    const servicesList = [
      { id: "wifiUpdate", val: 1 },
      { id: "parkingUpdate", val: 2 },
      { id: "gymUpdate", val: 3 },
      { id: "acUpdate", val: 4 },
    ];
    servicesList.forEach((s) => {
      if (document.getElementById(s.id).checked) {
        formData.append("Services", s.val);
      }
    });

    const response = await fetch(
      "https://homunityapiv1.runasp.net/api/Properties/UpdateFullProperty",
      {
        method: "PUT",
        body: formData,
      },
    );

    const responseData = await response.json();

    if (response.ok) {
      alert("Updated Successfully!");
      location.reload();
    } else {
      console.error("❌ SERVER ERROR:", responseData);
      alert("Failed: " + (responseData.message || "Check Console"));
    }
  } catch (error) {
    console.error("Critical Error:", error);
    alert("Connection Error.");
  } finally {
    hideLoader();
  }
});

// end update property

// start function cansel update
document.getElementById("cancelUpdate").onclick = () => {
  sections.updateProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
};
// end function cansel update

// start get propertesByOwner
async function fetchProperties() {
  const container = document.getElementById("propertiesContainer");
  const ownerId = localStorage.getItem("id");

  if (!ownerId) {
    container.innerHTML =
      "<p class='text-center py-5 text-warning'>Please login to see your properties.</p>";
    return;
  }

  showLoader();

  try {
    const response = await fetch(
      `https://homunityapiv1.runasp.net/api/Properties/GetByOwner?ownerId=${ownerId}`,
    );

    const data = await response.json();
    container.innerHTML = "";

    const properties = Array.isArray(data) ? data : data.properties || [];

    if (properties.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="mb-3">
                <img src="../img/icone-add-is-blank.svg" alt="No properties" style="width: 150px; opacity: 0.8;">
            </div>
            <h2 class="fw-bold" style="color: #FFC107;">No properties yet.</h2>
            <p class="fw-bold" style="color: #2D3E50; font-size: 1.2rem;">Click here to add your first property</p>
            <button id="addPropertyy" class="btn mt-3 px-5 py-2 fw-bold" 
                    style="background-color: #2D3E50; color: #FFC107; border-radius: 8px; font-size: 1.2rem;" 
                    >
                +Add
            </button>
        </div>`;
      return;
    }

    properties.forEach((prop) => {
      let statusText = "In Progress";
      let statusClass = "bg-warning text-dark";

      if (prop.propertyStatusID === 2) {
        statusText = "Approved";
        statusClass = "bg-success text-white";
      } else if (prop.propertyStatusID === 3) {
        statusText = "Rejected";
        statusClass = "bg-danger text-white";
      }

      const imgUrl =
        prop.images && prop.images.length > 0
          ? prop.images[0].imageUrl
          : "https://via.placeholder.com/150";

      const cardHtml = `
                <div class="col-12 mb-3">
                    <div class="property-card p-3 shadow-sm border rounded-3 bg-white">
                        <div class="d-flex d-flex-mobile align-items-start gap-3">
                            <img src="${imgUrl}" class="property-img" alt="property" style="width:120px; height:90px; object-fit:cover; border-radius:8px;">
                            
                            <div class="flex-grow-1">
                                <h4 class="property-title mb-1 h6 fw-bold text-dark">${prop.title}</h4>
                                <p class="property-info mb-1 text-muted small">
                                    <i class="fas fa-location-dot me-1"></i> ${prop.location.street}, ${prop.location.area}
                                </p>
                                <p class="property-price mb-0 fw-bold text-primary">$${prop.price} / month</p>
                            </div>

                            <div class="d-flex  align-items-center justify-content-between h-100 gap-2 mt-3">
                                <span class="badge ${statusClass}" style="font-size: 10px; padding: 5px 10px;">
                                    ${statusText}
                                </span>
                                <button class="btn btn-outline-primary btn-sm rounded-5 px-4 " 
                                        onclick="showPropertyDetails(${JSON.stringify(prop).replace(/"/g, "&quot;")})">
                                    View Details
                                </button>                            
                            </div>
                        </div>
                    </div>
                </div>
            `;
      container.innerHTML += cardHtml;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      "<p class='text-center text-danger py-5'>Error loading your properties.</p>";
  } finally {
    hideLoader();
  }
}

fetchProperties();

document
  .getElementById("propertiesContainer")
  .addEventListener("click", (e) => {
    if (e.target && e.target.id === "addPropertyy") {
      sections.properties.classList.add("d-none");
      sections.addProperties.classList.remove("d-none");
      menuItems.addProperties.classList.add("active");
      menuItems.properties.classList.remove("active");
    }
  });
// end get propertesByOwner

//start get one propirti
function showPropertyDetails(prop) {
  document.getElementById("oneProperti").classList.remove("d-none");
  sections.properties.classList.add("d-none");

  const images =
    prop.images && prop.images.length > 0
      ? prop.images
      : [{ imageUrl: "https://via.placeholder.com/150" }];

  document.getElementById("onePMainImg").src = images[0].imageUrl;
  document.getElementById("onePSideImgLeft").src = images[1]
    ? images[1].imageUrl
    : images[0].imageUrl;
  document.getElementById("onePSideImgRight").src = images[2]
    ? images[2].imageUrl
    : images[0].imageUrl;

  // ملئ الصور المصغرة (Thumbs)
  document.getElementById("onePThumb1").src = images[0].imageUrl;
  document.getElementById("onePThumb2").src = images[1]
    ? images[1].imageUrl
    : images[0].imageUrl;
  document.getElementById("onePThumb3").src = images[2]
    ? images[2].imageUrl
    : images[0].imageUrl;

  // 3. ملئ النصوص الأساسية
  document.getElementById("onePTitle").textContent = prop.title;
  document.getElementById("idPropirtie").value = prop.propertyID;
  document.getElementById("onePTitleHeader").textContent = prop.title;
  document.getElementById("onePAddress").textContent =
    `${prop.location.street}, ${prop.location.area}, ${prop.location.city}`;
  document.getElementById("onePDescription").textContent = prop.description;

  // التفاصيل (السعر والغرف)
  document.getElementById("onePPrice").innerHTML =
    `<i class="fas fa-diamond"></i> Price $${prop.price} / month`;
  document.getElementById("onePRooms").innerHTML =
    `<i class="fas fa-diamond"></i> ${prop.rooms} Bedrooms`;

  // 4. ملئ الخدمات (Amenities)
  const amenitiesList = document.querySelector(".amenities-list");
  amenitiesList.innerHTML = ""; // مسح القديم

  if (prop.services && prop.services.length > 0) {
    prop.services.forEach((service) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="check-box"></span> ${service.name}`;
      amenitiesList.appendChild(li);
    });
  } else {
    amenitiesList.innerHTML = "<li>No amenities available</li>";
  }

  // 5. زرار الرجوع
  document.getElementById("onePBackBtn").onclick = () => {
    document.getElementById("oneProperti").classList.add("d-none");
    sections.properties.classList.remove("d-none");
  };

  document.getElementById("onePBtnUpdate").onclick = () => {
    openUpdateSection(prop);
  };
}

// جوه فانكشن showPropertyDetails ضيف السطر ده:
document.getElementById("onePBtnUpdate").onclick = () => {
  openUpdateSection(prop);
};
// end get one propirti

// start delete propirti
let propertyIdToDelete = null;

document.getElementById("onePBtnDelete").onclick = () => {
  const title = document.getElementById("onePTitle").textContent;
  const address = document.getElementById("onePAddress").textContent;
  const img = document.getElementById("onePMainImg").src;
  const propId = document.getElementById("idPropirtie").value;
  console.log(propId);

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
  console.log(propertyIdToDelete);
  if (!propertyIdToDelete) return;

  this.disabled = true;
  this.innerHTML = "Deleting...";

  try {
    const response = await fetch(
      `https://homunityapiv1.runasp.net/api/Properties/DeleteProperty?id=${propertyIdToDelete}`,
      {
        method: "DELETE",
      },
    );

    if (response.ok) {
      alert("Property Deleted Successfully!");
      location.reload();
    } else {
      const error = await response.json();
      alert(
        "Error: " +
          (error.message ||
            "Could not delete property. It might have active bookings."),
      );
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
// end delete property

// start booking request
const ownerId = localStorage.getItem("id");
const bookingContainer = document.getElementById("bookingMainContent");
const messagesContainer = document.getElementById("messagesList");

async function fetchBookings() {
  try {
    const response = await fetch(
      `https://homunityapiv1.runasp.net/api/Booking/owner/${ownerId}`,
    );
    const data = await response.json();

    const inProcess = (data.bookings || []).filter(
      (b) => b.statusName === "In-Process",
    );
    const finished = (data.bookings || []).filter(
      (b) => b.statusName === "Booked" || b.statusName === "Cancelled",
    );

    if (inProcess.length > 0) {
      renderTable(inProcess);
    } else {
      renderEmptyBooking();
    }

    if (finished.length > 0) {
      renderMessagesCards(finished);
    } else {
      renderEmptyMessages();
    }
  } catch (error) {
    console.error("Error:", error);
    renderEmptyBooking();
  }
}

async function handleAction(bookingId, type) {
  const url =
    type === "accept"
      ? `https://homunityapiv1.runasp.net/api/Booking/${bookingId}/confirm?OwnerId=${ownerId}`
      : `https://homunityapiv1.runasp.net/api/Booking/${bookingId}/cancel`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { accept: "*/*" },
    });

    const result = await response.json();

    if (response.ok) {
      let history = JSON.parse(localStorage.getItem("booking_history")) || [];
      history.push(result);
      localStorage.setItem("booking_history", JSON.stringify(history));

      alert(type === "accept" ? "Booking Confirmed!" : "Booking Cancelled!");
      location.reload();
    } else {
      alert("حدث خطأ: " + (result.message || "حاول مرة أخرى"));
    }
  } catch (error) {
    console.error("Action Error:", error);
    alert("فشل الاتصال بالسيرفر");
  }
}

function renderTable(bookings) {
  let tableHtml = `
    <div class="custom-table-container">
      <table class="table custom-table mb-0">
        <thead>
          <tr>
            <th>Image</th>
            <th>Student Name</th>
            <th>Property</th>
            <th>Date</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>`;

  bookings.forEach((item) => {
    tableHtml += `
          <tr>
            <td><img src="${item.property.imageUrl}" class="prop-img" style="width:50px; height:50px; border-radius:8px; object-fit:cover;"></td>
            <td>${item.studentName}</td>
            <td>${item.property.title}</td>
            <td>${new Date(item.createdAt).toLocaleDateString()}</td>
            <td class="text-center">
              <button class="btn-reject me-1" onclick="handleAction(${item.bookingId}, 'reject')">Reject</button>
              <button class="btn-accept" onclick="handleAction(${item.bookingId}, 'accept')">Accept</button>
            </td>
          </tr>`;
  });
  tableHtml += `</tbody></table></div>`;
  bookingContainer.innerHTML = tableHtml;
}

function renderMessagesCards(bookings) {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = bookings
    .map(
      (item) => `
        <div class="msg-card mb-3">
            <div class="row align-items-center g-2">
                <div class="col-auto">
                    <div class="msg-img-container" style="width:70px; height:70px; overflow:hidden; border-radius:10px;">
                        <img src="${item.property.imageUrl}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                </div>
                <div class="col text-start ps-3">
                    <div class="fw-bold text-warning">${item.property.title}</div>
                    <div class="small text-white">${item.studentName}</div>
                    <div class="text-white-50" style="font-size: 0.7rem;">Status: ${item.statusName}</div>
                </div>
                <div class="col-auto">
                    <span class="status-btn-mock">${item.statusName === "Cancelled" ? "Rejected" : "Booked"}</span>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

function renderEmptyBooking() {
  bookingContainer.innerHTML = `
        <div class="col-12 text-center py-5 mt-5">
            <div class="mb-3"><img src="../img/icone-booking.svg" style="width: 120px;"></div>
            <h2 class="fw-bold" style="color: #FFC107; font-size: 2.5rem;">Sorry!</h2>
            <p class="fw-bold mt-3" style="color: #2D3E50;">No bookings yet. Start by making your first reservation</p>
        </div>`;
}

function renderEmptyMessages() {
  if (!messagesContainer) return;
  messagesContainer.innerHTML = `
        <div class="text-center mt-5">
            <img src="../img/Vector-removebg-preview.png" class="w-25 opacity-50" />
            <h4 class="text-warning mt-3">Messages (Future)</h4>
            <p class="text-muted small">Placeholder for now <br /> Ready for future Chat Module</p>
        </div>`;
}

fetchBookings();
// end booking request
