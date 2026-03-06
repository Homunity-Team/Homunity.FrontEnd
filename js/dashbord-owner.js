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

function dis(aItem, rItem, aActive, rActive) {
  aItem.classList.add("d-none");
  rItem.classList.remove("d-none");
  aActive.classList.add("active");
  rActive.classList.remove("active");
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

citySelect.addEventListener("change", async () => {
  const cityId = citySelect.value; // <-- هنا نجيب القيمة الصحيحة

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
      areaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching areas:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#sectionAddProperties form");
  const titleInput = document.getElementById("titleAdd");
  const priceInput = document.getElementById("priceAdd");
  const roomsInput = document.getElementById("roomsAdd");
  const descriptionInput = document.getElementById("descreptionAdd");
  const areaSelect = document.getElementById("areaSelect");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const propertyType = document.getElementById("apartmentApp").checked
      ? "Apartment"
      : "Room";

    const requestBody = {
      propertyID: 0,
      ownerID: Number(localStorage.getItem("id")),
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim(),
      price: Number(priceInput.value),
      rooms: Number(roomsInput.value),
      locationID: Number(areaSelect.value),
      propertyStatusID: 1,
      propertyType: propertyType,
      rejectReason: "",
    };

    try {
      const response = await fetch(
        "https://homunityapiv1.runasp.net/api/Properties/AddProperty",
        {
          method: "POST",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            Authorization: "Bearer YOUR_TOKEN_HERE",
          },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        Swal.fire("Error", data.message || "Failed to add property", "error");
        submitBtn.disabled = false;
        return;
      }

      console.log("Property added:", data);

      // رفع الصورة
      const imgFile = document.querySelector(
        "#addPropertyForm input[name='img']",
      )?.files[0];

      if (imgFile && data.propertyID) {
        const formData = new FormData();
        formData.append("file", imgFile);
        try {
          const uploadRes = await fetch(
            `https://homunityapiv1.runasp.net/api/PropertyImages/UploadImage?propertyId=${data.propertyID}`,
            {
              method: "POST",
              headers: {
                Authorization: "Bearer YOUR_TOKEN_HERE",
              },
              body: formData,
            },
          );

          const uploadData = await uploadRes.json();
          console.log("Image uploaded:", uploadData);
          Swal.fire("Success", "Image added successfully", "success");
        } catch (err) {
          console.error("Image upload error:", err);
          Swal.fire("Error", "Failed to upload image", "error");
        }
      } else {
        Swal.fire("Success", "Property added successfully!", "success");
      }

      form.reset();
    } catch (error) {
      console.error("Error adding property:", error);
      Swal.fire("Error", "Failed to add property", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const ownerId = localStorage.getItem("id");
  if (!ownerId) {
    Swal.fire("Error", "Owner ID not found", "error");
    return;
  }

  const container = document.getElementById("propertiesContainer");
  const sectionProperties = document.getElementById("sectionProperties");
  const sectionUpdate = document.getElementById("sectionUpdateProperties");

  let allProperties = [];

  // ================= FETCH ALL PROPERTIES =================

  async function getProperties() {
    try {
      const res = await fetch(
        `https://homunityapiv1.runasp.net/api/Properties/GetByOwner?ownerId=${ownerId}`,
      );

      if (!res.ok) {
        renderNoProperties();
        return;
      }

      const data = await res.json();
      // نتحقق إذا فيه array حقيقية
      allProperties = Array.isArray(data.properties)
        ? data.properties
        : Array.isArray(data.data)
          ? data.data
          : [];

      if (allProperties.length === 0) {
        renderNoProperties();
        return;
      }

      displayProperties(allProperties);
    } catch (err) {
      console.error("Error fetching properties:", err);
      container.innerHTML = `<h2 class="text-center">Error loading properties</h2>`;
    }
  }
  getProperties();
  // ================= DISPLAY NO PROPERTIES =================
  function renderNoProperties() {
    container.innerHTML = `
    <h2 class="text-center">No properties found</h2>
    <div class="container center-box">
      <div class="text-center">
        <div class="mb-4">
          <h2 class="fw-bold">إضافة عقار جديد</h2>
          <p class="text-muted">يمكنك إضافة عقار جديد إلى الموقع</p>
        </div>
        <button id="addPropertyBtn" class="btn add-property-btn">
          <i class="fa-solid fa-house-circle-plus"></i>
          إضافة عقار
        </button>
      </div>
    </div>
  `;

    const addPropertyBtn = document.getElementById("addPropertyBtn");
    if (addPropertyBtn) {
      addPropertyBtn.addEventListener("click", () => {
        if (sectionProperties && sections && menuItems) {
          sectionProperties.classList.add("d-none");
          sections.addProperties.classList.remove("d-none");
          menuItems.addProperties.classList.add("active");
          menuItems.properties.classList.remove("active");
        }
      });
    }
  }

  // ================= DISPLAY PROPERTIES =================
  function displayProperties(properties) {
    const container = document.getElementById("propertiesContainer");
    const defaultImage = "../img/img.5.jpeg";

    container.innerHTML = properties
      .map((p) => {
        const imgSrc = p.images?.[0]?.imageUrl || defaultImage;
        return `<div   class="property-horizontal-card mb-3 " data-id="${p.propertyID}" 
     style=" cursor: pointer; border: 1px solid #edb42d; background: #fff; min-height: 120px; display: flex; align-items: center; padding: 10px;">
    
  <div class="img-box" style="width: 160px; height: 100px; flex-shrink: 0; overflow: hidden;">
    <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;" />
  </div>

  <div  data-id="${p.propertyID}"  class="info-box" style="flex-grow: 1; padding-left: 20px; display: flex; flex-direction: column; justify-content: center;>
    <h4 style="color: #232f41; font-weight: 700; margin: 0; font-size: 1.4rem;">${p.title}</h4>
    <p style="color: #555; margin: 5px 0; font-size: 1.1rem;">1234 Sample St, ${p.location?.city || "city"}</p>
    <h5 style="color: #232f41; font-weight: 700; margin: 0; font-size: 1.3rem;">$${p.price} / month</h5>
  </div>



  <div class="action-box" style="display: flex;  gap: 8px;">
    <button class="btn edit-btn" data-id="${p.propertyID}" 
            style="background-color: #232f41; color: white; border: none; border-radius: 12px; padding: 8px 25px; min-width: 130px; font-weight: 500;">
        Edit
    </button>
    <button class="btn delete-btn" data-id="${p.propertyID}" 
            style="background: transparent; color: #dc3545; border: 1px solid #dc3545; border-radius: 12px; padding: 8px 25px; min-width: 130px; font-weight: 500;">
        Delete
    </button>
  </div>

</div>`;
      })
      .join("");
    const viwePropertyButtons = container.querySelectorAll(".info-box");
    viwePropertyButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const propertyID = btn.dataset.id;
        console.log(propertyID);

        if (sectionProperties && sections && menuItems) {
          sectionProperties.classList.add("d-none");
          sections.oneProperti.classList.remove("d-none");
          menuItems.properties.classList.remove("active");
          getPropertyAndFill(propertyID);
        }
      });
    });

    const deleteButtons = container.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const propertyID = btn.dataset.id;
        deleteProperty(propertyID, container);
      });
    });
  }

  // ================= EDIT BUTTON =================
  document.addEventListener("click", async (e) => {
    if (!e.target.closest(".edit-btn")) return;

    const id = Number(e.target.closest(".edit-btn").dataset.id);
    console.log("Editing property ID:", id);

    // البحث في allProperties
    const property = allProperties.find((p) => p.propertyID === id);
    if (!property) {
      console.error("Property not found in local data");
      return;
    }

    dis(
      sections.properties,
      sectionUpdate,
      menuItems.properties,
      menuItems.properties,
    );

    fillUpdateForm(property);
    loadPropertyImages(property.propertyID);
  });

  // ================= CANCEL =================
  const cancelAdd = document.getElementById("cancelAdd");
  cancelAdd.addEventListener("click", () => {
    dis(
      sections.addProperties,
      sections.updateProperties,
      menuItems.properties,
      menuItems.addProperties,
    );
  });

  // ================= UPDATE SUBMIT =================

  const cancelUpdate = document.getElementById("cancelUpdateBtn");
  cancelUpdate.addEventListener("click", () => {
    dis(
      sections.updateProperties,
      sections.properties,
      menuItems.properties,
      menuItems.properties,
    );
  });
  document
    .getElementById("updatePropertyForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const propertyID = document.getElementById("propertyIdUpdate").value;
      const ownerID = Number(localStorage.getItem("id"));
      const title = document.getElementById("titleUpdate").value;
      const price = Number(document.getElementById("priceUpdate").value);
      const rooms = Number(document.getElementById("roomsUpdate").value);
      const description = document.getElementById("descriptionUpdate").value;
      const propertyType = document.querySelector(
        "input[name='propertyTypeUpdate']:checked",
      ).value;
      const videoUpdate = document.getElementById("videoUpdate").value;

      const locationID = Number(
        document.getElementById("cityUpdate").dataset.locationid || 3,
      );

      const updatedData = {
        propertyID,
        ownerID,
        title,
        description,
        price,
        rooms,
        locationID,
        propertyStatusID: 1,
        propertyType,
        rejectReason: "",
      };

      const imgUpdate = document.querySelector(
        "#updatePropertyForm input[name='image']",
      ).files[0];

      if (imgUpdate) {
        const propertyID = document.getElementById("propertyIdUpdate").value;
        const formData = new FormData();
        formData.append("file", imgUpdate);

        fetch(
          `https://homunityapiv1.runasp.net/api/PropertyImages/UploadImage?propertyId=${propertyID}`,
          {
            method: "POST",
            headers: {},
            body: formData,
          },
        )
          .then((res) => res.json())
          .then((data) => {
            console.log("Image uploaded:", data);
            Swal.fire("Success", "Image uploaded successfully", "success");
          })
          .catch((err) => {
            console.error("Image upload error:", err);
            Swal.fire("Error", "Failed to upload image", "error");
          });
      }

      try {
        const res = await fetch(
          "https://homunityapiv1.runasp.net/api/Properties/UpdateProperty",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          },
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Update failed");

        Swal.fire("Success", "Property updated successfully!", "success");

        dis(
          sections.updateProperties,
          sections.properties,
          menuItems.properties,
          menuItems.properties,
        );

        getProperties();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", error.message, "error");
      }
    });
});

function attachEditButtons() {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const propertyID = btn.dataset.id;

      Object.values(menuItems).forEach((item) => {
        item.classList.remove("active");
      });

      Object.values(sections).forEach((section) => {
        if (section !== sections.updateProperties) {
          section.classList.add("d-none");
        } else {
          section.classList.remove("d-none");
        }
      });

      loadPropertyForUpdate(propertyID);
    });
  });
}

async function loadPropertyForUpdate(propertyID) {
  try {
    const res = await fetch(
      `https://homunityapiv1.runasp.net/api/Properties/GetPropertyById?id=${propertyID}`,
      {
        headers: { accept: "*/*" },
      },
    );
    const data = await res.json();

    // املاً الفورم في updateProperties بالبيانات
    document.getElementById("updateTitle").value = data.title;
    document.getElementById("updatePrice").value = data.price;
    document.getElementById("updateRooms").value = data.rooms;
    document.getElementById("updateDescription").value = data.description;

    // ... وباقي الحقول حسب الفورم
  } catch (err) {
    console.error("Error loading property:", err);
  }
}
async function loadPropertyImages(propertyID) {
  const allImg = document.getElementById("allImg");
  allImg.innerHTML = ""; // تنظيف أي محتوى سابق

  try {
    const res = await fetch(
      `https://homunityapiv1.runasp.net/api/PropertyImages/GetByPropertyId?propertyId=${propertyID}`,
      { headers: { accept: "*/*" } },
    );

    if (!res.ok) throw new Error("Failed to fetch property images");

    const data = await res.json();

    const images = Array.isArray(data) ? data : data.images || [];

    images.forEach((img) => {
      const div = document.createElement("div");
      div.classList.add("media-card");
      div.innerHTML = `
        <img src="${img.imageUrl || img.image}" alt="">
        <button class="replace-btn">Replace <span class="text-warning">🗑</span></button>
      `;
      allImg.appendChild(div);
    });
  } catch (err) {
    console.error("Error loading images:", err);
    allImg.innerHTML = "<p class='text-danger'>Failed to load images</p>";
  }
}

// =================== GET ONE PROPERTY AND FILL DOM ===================
async function getPropertyAndFill(propertyID) {
  // =================== Property Details DOM References ===================
  const onePSection = document.getElementById("oneProperti");

  // قسم التفاصيل الرئيسي
  const onePPropertyDetailsSection = document.getElementById(
    "onePProperty-details-section",
  );

  // الصور الرئيسية في المعرض
  const onePSideImgLeft = document.getElementById("onePSideImgLeft");
  const onePMainImg = document.getElementById("onePMainImg");
  const onePSideImgRight = document.getElementById("onePSideImgRight");

  // Thumbnails الصور الصغيرة
  const onePThumb1 = document.getElementById("onePThumb1");
  const onePThumb2 = document.getElementById("onePThumb2");
  const onePThumb3 = document.getElementById("onePThumb3");

  // البيانات الأساسية
  const onePTitle = document.getElementById("onePTitle");
  const onePAddress = document.getElementById("onePAddress");
  const onePDescription = document.getElementById("onePDescription");

  // تفاصيل العقار
  const onePPrice = document.getElementById("onePPrice");
  const onePRooms = document.getElementById("onePRooms");
  const onePKitchen = document.getElementById("onePKitchen");
  const onePBathroom = document.getElementById("onePBathroom");

  // الخدمات / Amenities
  const onePAmenity1 = document.getElementById("onePAmenity1");
  const onePAmenity2 = document.getElementById("onePAmenity2");
  const onePAmenity3 = document.getElementById("onePAmenity3");
  const onePAmenity4 = document.getElementById("onePAmenity4");

  // جدول الحجز
  const onePReservationsTable = document.getElementById(
    "onePReservationsTable",
  );

  // أزرار Update / Delete
  const onePBtnUpdate = document.getElementById("onePBtnUpdate");
  const onePBtnDelete = document.getElementById("onePBtnDelete");

  // زر العودة
  const onePBackBtn = document.getElementById("onePBackBtn");

  // =================== Gallery & Utility Arrays ===================
  const onePMainImages = [onePSideImgLeft, onePMainImg, onePSideImgRight];
  const onePThumbs = [onePThumb1, onePThumb2, onePThumb3];
  const onePAmenities = [
    onePAmenity1,
    onePAmenity2,
    onePAmenity3,
    onePAmenity4,
  ];

  try {
    const res = await fetch(
      `https://homunityapiv1.runasp.net/api/Properties/GetByID?id=${propertyID}`,
      { headers: { accept: "*/*" } },
    );

    if (!res.ok) throw new Error("Failed to fetch property");

    const data = await res.json();
    const property = data.property;

    // =================== FILL DOM ELEMENTS ===================
    if (!property) return;

    // عرض الـ section الخاص بالتفاصيل وإخفاء section العقارات
    document.getElementById("sectionProperties")?.classList.add("d-none");
    onePSection.classList.remove("d-none");
    onePBtnUpdate.dataset.id = property.id;
    // الصور
    if (property.images && property.images.length > 0) {
      onePMainImages.forEach((img, idx) => {
        if (property.images[idx]?.imageUrl)
          img.src = property.images[idx].imageUrl;
      });
      onePThumbs.forEach((thumb, idx) => {
        if (property.images[idx]?.imageUrl)
          thumb.src = property.images[idx].imageUrl;
      });
    }

    // البيانات الأساسية
    onePTitle.textContent = property.title || onePTitle.textContent;
    onePAddress.textContent =
      `${property.location?.street || ""}, ${property.location?.city || ""}` ||
      onePAddress.textContent;
    onePDescription.textContent =
      property.description || onePDescription.textContent;

    // تفاصيل العقار
    onePPrice.textContent = `$${property.price || "N/A"} / month`;
    onePRooms.textContent = `${property.rooms || "N/A"} Bedroom`;
    // المطابخ والحمامات غير موجودة في الـ API لذلك نتركها كما هي
    // onePKitchen.textContent = ...
    // onePBathroom.textContent = ...

    // الخدمات / Amenities
    if (property.services && Array.isArray(property.services)) {
      onePAmenities.forEach((el, idx) => {
        if (property.services[idx]) el.textContent = property.services[idx];
      });
    }

    onePBtnUpdate.onclick = () => {
      onePSection.classList.add("d-none");
      sections.updateProperties.classList.remove("d-none");
      fillUpdateForm(property);
    };
    onePBtnDelete.onclick = () => {
      deleteProperty(property.propertyID, onePSection);
    };

    onePBackBtn.onclick = () => {
      onePSection.classList.add("d-none");
      document.getElementById("sectionProperties")?.classList.remove("d-none");
    };
  } catch (err) {
    console.error("Error loading property details:", err);
    alert("Failed to load property details.");
  }
}
async function deleteProperty(propertyID, container = null) {
  async function safeDelete(url) {
    try {
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok && res.status !== 404) {
        console.warn("Delete failed:", res.status);
      }
    } catch {
      console.log("ignored delete error");
    }
  }

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to undo this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#374761",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    await safeDelete(
      `https://homunityapiv1.runasp.net/api/PropertyVideo/DeleteVideo?id=${propertyID}`,
    );

    await safeDelete(
      `https://homunityapiv1.runasp.net/api/PropertyImages/DeleteImage?id=${propertyID}`,
    );

    const res = await fetch(
      `https://homunityapiv1.runasp.net/api/Properties/DeleteProperty?id=${propertyID}`,
      { method: "DELETE" },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    if (container) {
      container
        .querySelector(`.property-horizontal-card[data-id="${propertyID}"]`)
        ?.remove();
    }

    Swal.fire({
      icon: "success",
      title: "Deleted Successfully",
      text: "The property has been removed ✔",
      confirmButtonColor: "#212e43",
    });
    window.location.reload();
  } catch (error) {
    console.error(error);

    Swal.fire({
      icon: "error",
      title: "Failed to Delete Property",
      text: "Something went wrong",
      confirmButtonColor: "#dc3545",
    });
  }
}

function fillUpdateForm(property) {
  document.getElementById("propertyIdUpdate").value = property.propertyID;
  document.getElementById("titleUpdate").value = property.title;
  document.getElementById("priceUpdate").value = property.price;
  document.getElementById("roomsUpdate").value = property.rooms;
  document.getElementById("descriptionUpdate").value = property.description;

  document.getElementById("apartmentUpdate").checked =
    property.propertyType === "Apartment";
  document.getElementById("roomUpdate").checked =
    property.propertyType === "Room";

  function populateCityAndArea(city, area) {
    const citySelect = document.getElementById("cityUpdate");
    const areaSelect = document.getElementById("areaUpdate");

    // مسح أي خيارات سابقة
    citySelect.innerHTML = "";
    areaSelect.innerHTML = "";

    // إضافة المدينة
    const cityOption = document.createElement("option");
    cityOption.value = city;
    cityOption.text = city;
    cityOption.selected = true;
    citySelect.appendChild(cityOption);

    // إضافة المنطقة
    const areaOption = document.createElement("option");
    areaOption.value = area;
    areaOption.text = area;
    areaOption.selected = true;
    areaSelect.appendChild(areaOption);
  }

  populateCityAndArea(property.location.city, property.location.area);
  document.getElementById("streetUpdate").value =
    property.location.street || "";

  document.getElementById("wifiUpdate").checked =
    property.services?.wifi || false;
  document.getElementById("parkingUpdate").checked =
    property.services?.parking || false;
  document.getElementById("gymUpdate").checked =
    property.services?.gym || false;
  document.getElementById("acUpdate").checked = property.services?.ac || false;

  // dataset id للفورم
  document.getElementById("updatePropertyForm").dataset.id =
    property.propertyID;
}
