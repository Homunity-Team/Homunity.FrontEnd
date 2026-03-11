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
  e.preventDefault(); // منع الصفحة من التحميل

  // 1. تجهيز الـ FormData
  const formData = new FormData();

  // 2. سحب البيانات الأساسية من المدخلات
  formData.append("OwnerID", 1); // ملحوظة: غير الـ ID ده حسب المستخدم اللي عامل login
  formData.append("Title", document.getElementById("titleAdd").value);
  formData.append(
    "Description",
    document.getElementById("descreptionAdd").value,
  );
  formData.append(
    "Price",
    parseFloat(document.getElementById("priceAdd").value),
  );
  formData.append("Rooms", parseInt(document.getElementById("roomsAdd").value));

  // تحديد نوع العقار من الـ Radio Buttons
  const propertyType = document.getElementById("apartmentApp").checked
    ? "Apartment"
    : "Room";
  formData.append("PropertyType", propertyType);

  // سحب الـ LocationID من الـ Select اللي عملناه في الخطوة اللي فاتت
  formData.append(
    "LocationID",
    parseInt(document.getElementById("areaSelect").value),
  );

  // 3. التعامل مع الخدمات (Services) - بنبعتها كـ Array من الـ IDs
  // هفترض إن الـ IDs هي: wifi=1, parking=2, gym=3, ac=4 (تأكد من الـ API documentation)
  const servicesMap = {
    wifi: 1,
    parking: 2,
    gym: 3,
    ac: 4,
  };

  Object.keys(servicesMap).forEach((id) => {
    if (document.getElementById(id).checked) {
      formData.append("Services", servicesMap[id]);
    }
  });

  // 4. التعامل مع الصور (Images) - مصفوفة ملفات
  const imageInput = document.getElementById("images");
  if (imageInput.files.length > 0) {
    for (let i = 0; i < imageInput.files.length; i++) {
      formData.append("Images", imageInput.files[i]);
    }
  }

  // 5. التعامل مع الفيديو (Video) - ملف واحد
  const videoInput = document.getElementById("video");
  if (videoInput.files.length > 0) {
    formData.append("Video", videoInput.files[0]);
  }

  // 6. إرسال الطلب للـ API
  try {
    const response = await fetch(
      "https://homunityapiv1.runasp.net/api/Properties/CreateFullProperty",
      {
        method: "POST",
        body: formData, // الـ browser هيحط الـ Content-Type: multipart/form-data تلقائياً
      },
    );

    if (response.ok) {
      const result = await response.json();
      alert("Property Added Successfully!");
      addPropertyForm.reset(); // تصفير الفورم بعد النجاح
    } else {
      const errorData = await response.json();
      console.error("Server Error:", errorData);
      alert("Failed to add property. Check console for details.");
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    alert("An error occurred while connecting to the server.");
  }
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
  setLoading(true);

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

    // تصحيح مشكلة "on": إذا لم يجد قيمة، نرسل القيمة المختارة يدوياً
    const selectedType = document.querySelector(
      'input[name="propertyType"]:checked',
    );
    let typeValue = "Apartment"; // القيمة الافتراضية
    if (selectedType) {
      // لو القيمة "on" ده معناه إن الـ HTML ناقصه value، فهنصلحها برمجياً هنا
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
    setLoading(false);
  }
});

function setLoading(isLoading) {
  const btn = document.querySelector(".btn-submit");
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading
    ? `<span class="spinner-border spinner-border-sm"></span> Loading...`
    : `Submit Property`;
}
// end update property

// start function cansel update
document.getElementById("cancelUpdate").onclick = () => {
  sections.updateProperties.classList.add("d-none");
  sections.properties.classList.remove("d-none");
};
// end function cansel update

// start get all propirties
async function fetchProperties() {
  try {
    const response = await fetch(
      "https://homunityapiv1.runasp.net/api/Properties/GetAll",
    );
    const data = await response.json();
    const container = document.getElementById("propertiesContainer");
    container.innerHTML = ""; // مسح اللودينج

    data.properties.forEach((prop) => {
      // تحديد حالة العقار بناءً على الـ ID
      let statusText = "In Progress";
      if (prop.propertyStatusID === 2) statusText = "Approved";
      if (prop.propertyStatusID === 3) statusText = "Rejected";

      // تحديد الصورة (لو مفيش صورة بنحط واحدة placeholder)
      const imgUrl =
        prop.images && prop.images.length > 0
          ? prop.images[0].imageUrl
          : "https://via.placeholder.com/150";

      const cardHtml = `
                <div class="col-12">
                    <div class="property-card p-3 shadow-sm">
                        <div class="d-flex d-flex-mobile align-items-start gap-3">
                            <img src="${imgUrl}" class="property-img" alt="property">
                            
                            <div class="flex-grow-1">
                                <h4 class="property-title">${prop.title}</h4>
                                <p class="property-info mb-1">${prop.location.street}, ${prop.location.area}</p>
                                <p class="property-price mb-0">$${prop.price} / month</p>
                            </div>

                            <div class="d-flex  align-items-end justify-content-between h-100 gap-3">
                                <span class="statuss-badge badge-in-progress ">${statusText}</span>
                                <button class="btn btn-action rounded-5 ps-3" onclick="showPropertyDetails(${JSON.stringify(prop).replace(/"/g, "&quot;")})">
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
    console.error("Error fetching properties:", error);
  }
}

fetchProperties();
// end get all propirties

//start get one propirti
function showPropertyDetails(prop) {
  // افترضنا إن سكشن القائمة اسمه propertiesListSection
  document.getElementById("oneProperti").classList.remove("d-none");
  sections.properties.classList.add("d-none");

  // 2. توزيع الصور في الجاليري
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
// متغير لتخزين الـ ID الخاص بالعقار المراد حذفه حالياً
let propertyIdToDelete = null;

// تعديل بسيط داخل فانكشن showPropertyDetails (تأكد من وجود هذا السطر)
document.getElementById("onePBtnDelete").onclick = () => {
  // جلب البيانات من الصفحة الحالية لعرضها في الـ Modal
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

// زر الإلغاء
document.getElementById("cancelDeleteBtn").onclick = () => {
  document.getElementById("deleteModal").classList.add("d-none");
};

// زر الحذف النهائي (الربط مع الـ API)
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
      location.reload(); // إعادة تحميل الصفحة لتحديث القائمة
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
// end delete propirti
