const userId = localStorage.getItem("userId");

if (userId !== null) {
  const tagLogout = document.getElementById("tagLogout");
  tagLogout.classList.remove("d-none");

  const apiUrl = `https://homunityapiv1.runasp.net/api/Users/Get Profile By ID?id=${userId}`;
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) throw new Error("حدث خطأ أثناء جلب البيانات");
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
