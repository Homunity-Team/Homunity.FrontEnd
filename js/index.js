const sections = {
  properties: document.getElementById("sectionProperties"),
  addProperties: document.getElementById("sectionAddProperties"),
  deleteProperties: document.getElementById("sectionDeleteProperties"),
  updateProperties: document.getElementById("sectionUpdateProperties"),
  massageProperties: document.getElementById("sectionMassageProperties"),
  settingProperties: document.getElementById("sectionSettingProperties"),
};

const menuItems = {
  properties: document.getElementById("properties"),
  addProperties: document.getElementById("addProperties"),
  updateProperties: document.getElementById("updateProperties"),
  deleteProperties: document.getElementById("deleteProperties"),
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
