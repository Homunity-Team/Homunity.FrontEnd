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