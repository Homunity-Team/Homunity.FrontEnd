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