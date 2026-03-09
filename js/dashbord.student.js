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

