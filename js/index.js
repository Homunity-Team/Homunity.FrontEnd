   document.addEventListener('DOMContentLoaded', function () {
        const allSidebarItems = document.querySelectorAll('.sidebar nav ul li');
        let bookingBtn, propertiesBtn;
        allSidebarItems.forEach(item => {
            if (item.textContent.includes('Booking Request')) bookingBtn = item;
            if (item.textContent.includes('Properties')) propertiesBtn = item;
        });

        const propertySection = document.querySelector('.property-list-section');
        const statsContainer = document.querySelector('.stats-container');
        const bookingSection = document.getElementById('booking-requests-section');

        if (bookingBtn) {
            bookingBtn.addEventListener('click', function () {
                if (propertySection) propertySection.style.display = 'none';
                if (statsContainer) statsContainer.style.display = 'none';
        
                if (bookingSection) {
                    bookingSection.style.display = 'block';
                }
                allSidebarItems.forEach(li => li.classList.remove('active'));
                bookingBtn.classList.add('active');
            });
        }
        if (propertiesBtn) {
            propertiesBtn.addEventListener('click', function () {
                if (propertySection) propertySection.style.display = 'block';
                if (statsContainer) statsContainer.style.display = 'flex';
                
                if (bookingSection) {
                    bookingSection.style.display = 'none';
                }
                allSidebarItems.forEach(li => li.classList.remove('active'));
                propertiesBtn.classList.add('active');
            });
        }
    });