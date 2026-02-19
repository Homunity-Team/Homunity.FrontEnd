document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.overlay');
    const modalClose = document.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelBtn');
    const deleteBtn = document.getElementById('confirmDeleteBtn');

    const modalImg = document.querySelector('.property-card img');
    const modalTitle = document.querySelector('.property-info h3');
    const modalLocation = document.querySelector('.property-info p');
    const bookingWarning = document.getElementById('booking-warning');
    const messageWarning = document.getElementById('message-warning');

    let propertyIdToDelete = null;
    let currentDeleteButton = null;

    overlay.style.display = 'none';

    document.querySelectorAll('.delete-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();

            currentDeleteButton = trigger;
            propertyIdToDelete = trigger.dataset.id;
            modalTitle.innerText = trigger.dataset.title;
            modalLocation.innerText = trigger.dataset.location;
            modalImg.src = trigger.dataset.img;

            bookingWarning.innerText = `${Math.floor(Math.random() * 5) + 1} bookings related to this property will be deleted`;
            messageWarning.innerText = `${Math.floor(Math.random() * 5) + 3} messages related to this property will be deleted`;

            overlay.style.display = 'flex';
        });
    });

    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    function closeModal() {
        overlay.style.display = 'none';
        propertyIdToDelete = null;
        currentDeleteButton = null;
        deleteBtn.disabled = false;
        deleteBtn.innerText = 'Delete';
    }

    // تنفيذ الحذف
    deleteBtn.addEventListener('click', async () => {
        if (!propertyIdToDelete || !currentDeleteButton) {
            // sweetaletr not defaut alert
            Swal.fire({
                icon: 'warning',
                title: 'No property selected',
                text: 'Please select a property to delete.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        const apiUrl = `https://homunityapiv1.runasp.net/api/Properties/DeleteProperty?id=${propertyIdToDelete}`;

        const originalText = deleteBtn.innerText;
        deleteBtn.innerText = "Deleting...";
        deleteBtn.disabled = true;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'accept': '*/*' }
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Property deleted successfully!',
                    timer: 2000,
                    showConfirmButton: true
                });

                closeModal();

                const propertyCard = currentDeleteButton.closest('.property-horizontal-card');
                if (propertyCard) {
                    propertyCard.remove();
                }

                const totalPropsElem = document.getElementById('total-props');
                if (totalPropsElem) {
                    let currentTotal = parseInt(totalPropsElem.innerText, 10);
                    if (!isNaN(currentTotal) && currentTotal > 0) {
                        totalPropsElem.innerText = currentTotal - 1;
                    }
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Could not delete property. Please try again.',
                    confirmButtonColor: '#d33'
                });
                resetDeleteButton();
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Connection Error',
                text: 'Failed to connect to server. Check your internet connection.',
                confirmButtonColor: '#d33'
            });
            resetDeleteButton();
        }
    });

    function resetDeleteButton() {
        deleteBtn.innerText = "Delete";
        deleteBtn.disabled = false;
    }

    overlay.addEventListener('click', (e) => {
        if (e.target == overlay) {
            closeModal();
        }
    });
});
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

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.querySelector('.sidebar ul li:nth-child(6)'); 
    const mainArea = document.querySelector('.main-content');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            Array.from(mainArea.children).forEach(child => child.style.display = 'none');

            const settingsTemplate = `
                <div class="settings-container animate-fade">
               <header class="dashboard-top-bar d-flex justify-content-between align-items-center">
     <div class="brand-section d-flex align-items-center">
                            <img src="img/Homunity_Logo.png" alt="Logo" class="brand-logo-large">
                            <h1 class="brand-text-gold">Owner Dashbaord</h1>
                        </div>
                        <div class="profile-avatar-area">
                            <i class="fa-solid fa-circle-user"></i>
                            <div class="back-navigation">
    <a href="javascript:history.back()" class="circle-arrow-btn">
        <span class="arrow-full-shape"></span>
    </a>
</div>
                        </div>
</header>
                    <h2 class="section-main-title">Setting</h2>
                    
                    <div class="main-form-card">
                        <h4 class="form-sub-heading">Update Profile</h4>
                        <div class="row g-4 mt-2">
                            <div class="col-md-6">
                                <label class="field-label">First Name</label>
                                <input type="text" class="form-control field-input" placeholder="Enter your First Name">
                            </div>
                            <div class="col-md-6">
                                <label class="field-label">Last Name</label>
                                <input type="text" class="form-control field-input" placeholder="Enter your Last Name">
                            </div>
                            <div class="col-md-6">
                                <label class="field-label">Phone</label>
                                <input type="text" class="form-control field-input" placeholder="Enter your Number">
                            </div>
                            <div class="col-12 mt-4">
                                <button class="btn btn-save-data">Save Change</button>
                            </div>
                        </div>
                    </div>

                    <div class="action-bar-item mt-3">
                        <div class="d-flex align-items-center">
                            <i class="fa-solid fa-arrows-rotate me-3 gold-accent-icon"></i> 
                            <span>Change Password</span>
                        </div>
                        <i class="fa-solid fa-chevron-down opacity-50"></i>
                    </div>

                    <div class="action-bar-item mt-2">
                        <div class="d-flex align-items-center">
                            <i class="fa-solid fa-users me-3 gold-accent-icon"></i> 
                            <span>Users</span>
                        </div>
                        <i class="fa-solid fa-chevron-down opacity-50"></i>
                    </div>
                </div>
            `;
            mainArea.insertAdjacentHTML('beforeend', settingsTemplate);
        });
    }
});
