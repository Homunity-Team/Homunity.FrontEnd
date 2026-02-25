const sections = {
  properties: document.getElementById("sectionProperties"),
  addProperties: document.getElementById("sectionAddProperties"),
  deleteProperties: document.getElementById("sectionDeleteProperties"),
  updateProperties: document.getElementById("sectionUpdateProperties"),
  booking: document.getElementById("sectionBooking"),
  settingProperties: document.getElementById("sectionSettingProperties"),
  massageProperties: document.getElementById("sectionMassageProperties"),
};

const menuItems = {
  properties: document.getElementById("properties"),
  addProperties: document.getElementById("addProperties"),
  updateProperties: document.getElementById("updateProperties"),
  deleteProperties: document.getElementById("deleteProperties"),
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
    Authorization: "Bearer YOUR_TOKEN_HERE",
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
      ownerID: 22,
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
    console.error("No owner ID in localStorage!");
    return;
  }

  const container = document.getElementById("propertiesContainer");
  const sectionProperties = document.getElementById("sectionProperties");
  const sectionUpdate = document.getElementById("sectionUpdateProperties");
  const defaultImage = "./img/imag1.jpg";

  let allProperties = [];

  // ================= FETCH ALL PROPERTIES =================
  async function getProperties() {
    try {
      const res = await fetch(
        `https://homunityapiv1.runasp.net/api/Properties/GetByOwner?ownerId=${ownerId}`,
      );
      const data = await res.json();
      allProperties = data.properties || [];
      displayProperties(allProperties);
      console.log("Fetched properties:", allProperties);
    } catch (err) {
      console.error("Error fetching properties:", err);
    }
  }

  getProperties();

  // ================= DISPLAY PROPERTIES =================
  function displayProperties(properties) {
    container.innerHTML = properties
      .map((p) => {
        const imgSrc = p.images?.[0]?.imageUrl || defaultImage;
        return `
      <div class="property-horizontal-card shadow-sm mb-3">
        <div class="card-body-flex">
          <div class="left-side">
            <div class="img-box">
              <img src="${imgSrc}" />
            </div>
            <div class="info-box">
              <h5>${p.title}</h5>
              <p>${p.location.city} - ${p.location.area}</p>
              <h6>$${p.price} / month</h6>
            </div>
          </div>
          <div class="right-side">
            <button class="btn btn-outline-primary edit-btn" data-id="${p.propertyID}">Edit</button>
          </div>
        </div>
      </div>`;
      })
      .join("");
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

    // اخفاء عرض العقارات واظهار التعديل
    sectionProperties.classList.add("d-none");
    sectionUpdate.classList.remove("d-none");

    fillUpdateForm(property);
  });

  // ================= FILL FORM =================
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
    document.getElementById("acUpdate").checked =
      property.services?.ac || false;

    // dataset id للفورم
    document.getElementById("updatePropertyForm").dataset.id =
      property.propertyID;
  }

  // ================= CANCEL =================
  document.querySelector(".btn-cancel").addEventListener("click", () => {
    sectionUpdate.classList.add("d-none");
    sectionProperties.classList.remove("d-none");
  });

  // ================= UPDATE SUBMIT =================
  document
    .getElementById("updatePropertyForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const ownerID = Number(localStorage.getItem("id") || 22); // لو انت مخزن الـ id في localStorage
      const title = document.getElementById("titleUpdate").value;
      const price = Number(document.getElementById("priceUpdate").value);
      const rooms = Number(document.getElementById("roomsUpdate").value);
      const description = document.getElementById("descriptionUpdate").value;
      const propertyType = document.querySelector(
        "input[name='propertyTypeUpdate']:checked",
      ).value; // Apartment أو Room
      const videoUpdate = document.getElementById("videoUpdate").value;

      // لو عندك locationID موجود مسبقاً في الـ property object
      const locationID = Number(
        document.getElementById("cityUpdate").dataset.locationid || 3,
      );

      const updatedData = {
        ownerID,
        title,
        description,
        price,
        rooms,
        locationID,
        propertyStatusID: 1, // أو القيمة اللي انت عايزها
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
            headers: {
              Authorization: "Bearer YOUR_TOKEN_HERE", // لو الـ API يحتاج توكن
              // لاحظ: Content-Type لا تضبط هنا عند استخدام FormData، سيضبطه المتصفح تلقائيًا
            },
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
              Accept: "*/*",
              Authorization: "Bearer YOUR_TOKEN_HERE", // لو محتاج توكن
            },
            body: JSON.stringify(updatedData),
          },
        );

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Update failed");

        Swal.fire("Success", "Property updated successfully!", "success");

        // ارجع لعرض الخصائص بعد التعديل
        sectionUpdate.classList.add("d-none");
        sectionProperties.classList.remove("d-none");

        // حدث قائمة الخصائص
        getProperties();
      } catch (error) {
        console.error(error);
        Swal.fire("Error", error.message, "error");
      }
    });
});

// استدعاء الفورم
