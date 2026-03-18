document.addEventListener("DOMContentLoaded", () => {
  const userRole = localStorage.getItem("role");
  const userID = localStorage.getItem("id");


  if (userRole !== "student" || !userID) {
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


// Search/filter functionality
    document.querySelector('.btn-search').addEventListener('click', function () {
      const city = document.querySelectorAll('.search-bar-wrapper select')[0].value;
      const area = document.querySelectorAll('.search-bar-wrapper select')[1].value;
      const minPrice = parseFloat(document.querySelectorAll('.search-bar-wrapper input')[0].value) || 0;
      const maxPrice = parseFloat(document.querySelectorAll('.search-bar-wrapper input')[1].value) || Infinity;

      const cards = document.querySelectorAll('#properties-grid > div');
      cards.forEach(card => {
        const areaText = card.querySelector('.prop-meta span:first-child').textContent.trim();
        const priceText = card.querySelector('.price').textContent.replace(/[^0-9]/g, '');
        const price = parseFloat(priceText);

        const areaMatch = (area === 'Area•' || areaText === area);
        const priceMatch = (price >= minPrice && price <= maxPrice);

        card.style.display = (areaMatch && priceMatch) ? '' : 'none';
      });
    });
