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

});
