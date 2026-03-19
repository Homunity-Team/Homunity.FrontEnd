<<<<<<< HEAD
const userId = localStorage.getItem("Id");

if (userId !== null) {
  const tagLogout = document.getElementById("tagLogout");
  tagLogout.classList.remove("d-none");

  const apiUrl = `https://homunityapiv1.runasp.net/api/Users/Get Profile By ID?id=${userId}`;
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((user) => {
      // بناء بطاقة المستخدم
      const container = document.getElementById("iconeText");
      container.innerHTML = `
        <div class="user-card">
          <h4 class="text-warning"><span class="text-black ">hello</span> ${user.firstName}</h4>
        </div>
      `;
    });
} else {
}

document.getElementById("buttonLogout").addEventListener("click", function () {
  localStorage.removeItem("userId");
  window.location.href = "index.html";
});
document.addEventListener("DOMContentLoaded", function () {
  const searchbtn = document.getElementById("searchbtn");
  const resultsContainer = document.getElementById("resultsContainer");

  searchbtn.addEventListener("click", async function () {
    const loc = document.getElementById("Locationinput").value;
    const type = document.getElementById("typeSelect").value;
    const Budget = document.getElementById("Budgetinput").value;

    resultsContainer.innerHTML =
      "<p class='text-center'>Searching for properties...</p>";

    try {
      const response = await fetch(
        `https://api.example.com/filter?location=${loc}&type=${type}&price=${budget}`,
      );

      const data = await response.json();

      displayResults(data);
    } catch (error) {
      console.error("Error:", error);
      resultsContainer.innerHTML =
        "<p class='text-danger'>Something went wrong. Please try again.</p>";
    }
  });
  function displayResults(properties) {
    resultsContainer.innerHTML = "";

    if (properties.length === 0) {
      resultsContainer.innerHTML =
        "<p class='text-center'>No properties found!</p>";
      return;
    }
    properties.forEach((prop) => {
      const card = `
                <div class="col-md-4">
                    <div class="property-card">
                        <img src="${prop.image}" class="img-fluid rounded mb-2" alt="property">
                        <h6>${prop.title}</h6>
                        <p class="text-muted">${prop.location}</p>
                        <strong style="color: #c9a333;">$${prop.price}</strong>
                    </div>
                </div>
            `;
      resultsContainer.innerHTML += card;
    });
  }
});


const titleInp = document.getElementById('titleUpdate');
const priceInp = document.getElementById('priceUpdate');
const roomsInp = document.getElementById('roomsUpdate');

titleInp.addEventListener('input', function() {
  const error = document.getElementById('titleError');
  if (titleInp.value.length < 5 || titleInp.value.length > 15) {
    error.style.display = 'block'; 
    titleInp.style.borderColor = '#d93025'; 
  } else {
    error.style.display = 'none';
    titleInp.style.borderColor = '#ced4da';
  }
});

priceInp.addEventListener('input', function() {
  const error = document.getElementById('priceError');
  if (priceInp.value < 100 && priceInp.value !== "") {
    error.style.display = 'block';
    priceInp.style.borderColor = '#d93025';
  } else {
    error.style.display = 'none';
    priceInp.style.borderColor = '#ced4da';
  }
});

roomsInp.addEventListener('input', function() {
  const error = document.getElementById('roomsError');
  const val = parseInt(roomsInp.value);
  if (val < 1 || val > 10) {
    error.style.display = 'block';
    roomsInp.style.borderColor = '#d93025';
  } else {
    error.style.display = 'none';
    roomsInp.style.borderColor = '#ced4da';
  }
=======
console.log("hello");


document.addEventListener("DOMContentLoaded", function () {

    const links = document.querySelectorAll('.sidebar .nav-link');
    const sections = document.querySelectorAll('.content-section');
    function hideAllSections() {
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }
    function showSection(id) {
        const target = document.getElementById(id);
        if (target) {
            target.style.display = 'block';
        }
    }
    hideAllSections();
    showSection("main-dashboard-section");

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.dataset.section;
            if (!targetId) return;

            hideAllSections();
            showSection(targetId);
        });
    });

>>>>>>> origin/property-details-hagar
});
