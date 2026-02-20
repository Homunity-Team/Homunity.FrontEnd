const sections = {
  properties: document.getElementById("sectionProperties"),
  addProperties: document.getElementById("sectionAddProperties"),
  updateProperties: document.getElementById("sectionUpdateProperties"),
  deleteProperties: document.getElementById("sectionDeleteProperties"),
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

function hideAllSections() {
  for (let key in sections) {
    sections[key].classList.add("d-none");
  }
}
for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => {
    hideAllSections();
  });
}

for (let key in menuItems) {
  menuItems[key].addEventListener("click", () => {
    sections[key].classList.remove("d-none");
  });
}
