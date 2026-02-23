const sections = {
  properties: document.getElementById("sectionProperties"),
  addProperties: document.getElementById("sectionAddProperties"),
  deleteProperties: document.getElementById("sectionDeleteProperties"),
  updateProperties: document.getElementById("sectionUpdateProperties"),
  booking: document.getElementById("sectionBooking"),
  massageProperties: document.getElementById("sectionMassageProperties"),
  settingProperties: document.getElementById("sectionSettingProperties"),
};

const menuItems = {
  properties: document.getElementById("properties"),
  addProperties: document.getElementById("addProperties"),
  updateProperties: document.getElementById("updateProperties"),
  deleteProperties: document.getElementById("deleteProperties"),
  booking: document.getElementById("BookingButton"),
  massageProperties: document.getElementById("massageProperties"),
  settingProperties: document.getElementById("settingProperties"),
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

citySelect.addEventListener("change", () => {
  const selectedCity = citySelect.value;

  areaSelect.innerHTML = "<option selected disabled>اختر المنطقة</option>";

  fetch(
    `https://homunityapiv1.runasp.net/api/Location/areas?city=${selectedCity}`,
    {
      headers: {
        accept: "*/*",
        Authorization: "Bearer YOUR_TOKEN_HERE",
      },
    },
  )
    .then((res) => res.json())
    .then((data) => {
      data.forEach((area) => {
        const option = document.createElement("option");
        option.value = area;
        option.textContent = area;
        areaSelect.appendChild(option);
      });
    })
    .catch((err) => console.error("Error fetching areas:", err));
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#sectionAddProperties form");
  const titleInput = document.getElementById("titleAdd");
  const priceInput = document.getElementById("priceAdd");
  const roomsInput = document.getElementById("roomsAdd");
  const descriptionInput = document.getElementById("descreptionAdd");
  const citySelect = document.getElementById("citySelect");
  const areaSelect = document.getElementById("areaSelect");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // منع الفورم من إعادة تحميل الصفحة

    // تحديد نوع العقار
    const propertyType = document.getElementById("apartmentApp").checked
      ? "Apartment"
      : "Room";

    // الخدمات (checkboxes)
    const services = {
      wifi: document.getElementById("wifi").checked,
      parking: document.getElementById("parking").checked,
      gym: document.getElementById("gym").checked,
      ac: document.getElementById("ac").checked,
    };

    // بناء جسم الطلب
    const requestBody = {
      propertyID: 0,
      ownerID: 22,
      title: titleInput.value,
      description: descriptionInput.value,
      price: Number(priceInput.value),
      rooms: Number(roomsInput.value),
      locationID: 2,
      propertyStatusID: 1,
      propertyType: propertyType,
      rejectReason: "",
    };

    fetch("https://homunityapiv1.runasp.net/api/Properties/AddProperty", {
      method: "POST",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_TOKEN_HERE",
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Property added:", data);
        alert("Property submitted successfully!");
        form.reset();
      })
      .catch((err) => {
        console.error("Error adding property:", err);
        alert("Failed to submit property");
      });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const updateForm = document.getElementById("updatePropertyForm");

  updateForm.addEventListener("submit", (e) => {
    e.preventDefault(); // منع إعادة تحميل الصفحة

    // جمع القيم من الفورم
    const propertyID = 17; // عدل حسب الحاجة
    const ownerID = 22; // عدل حسب المستخدم
    const title = document.getElementById("titleUpdate").value;
    const description = document.getElementById("descriptionUpdate").value;
    const price = Number(document.getElementById("priceUpdate").value);
    const rooms = Number(document.getElementById("roomsUpdate").value);
    const locationID = 1; //Number(document.getElementById("areaUpdate").value); // مثال
    const propertyStatusID = 1; // ثابت
    const propertyType = document.getElementById("apartmentUpdate").checked
      ? "Apartment"
      : "Room";
    const rejectReason = ""; // أو اجمعه من input لو موجود

    const requestBody = {
      propertyID,
      ownerID,
      title,
      description,
      price,
      rooms,
      locationID,
      propertyStatusID,
      propertyType,
      rejectReason,
    };

    fetch("https://homunityapiv1.runasp.net/api/Properties/UpdateProperty", {
      method: "PUT",
      headers: {
        accept: "*/*",
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_TOKEN_HERE", // ضع التوكن هنا
      },
      body: JSON.stringify(requestBody),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Property updated:", data);
        alert("Property updated successfully!");
      })
      .catch((err) => {
        console.error("Error updating property:", err);
        alert("Failed to update property");
      });
  });
});
