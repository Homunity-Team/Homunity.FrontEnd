const API_URL = "https://homunityapiv1.runasp.net/api";
let currentOwnerId = localStorage.getItem("ownerId") || 1; // افترضنا 1 للتجربة
let addMap, detailsMap, addMarker;

// =====================================================
// 1. Precise GPS Fix (إجبار الموقع الحالي)
// =====================================================
function forceGPS(type) {
    const options = {
        enableHighAccuracy: true, // تفعيل الدقة العالية (GPS الحقيقي)
        timeout: 15000,
        maximumAge: 0 // منع استلام نتائج مخزنة (Cache)
    };

    if (navigator.geolocation) {
        Swal.fire({ title: 'Locating...', text: 'Getting precise GPS coordinates', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                updateMapLocation(latitude, longitude, type);
                Swal.close();
            },
            (err) => {
                Swal.fire('GPS Error', 'Please enable location permissions', 'error');
            },
            options
        );
    }
}

async function updateMapLocation(lat, lng, type) {
    if (type === 'add') {
        addMap.setView([lat, lng], 16);
        if (addMarker) addMap.removeLayer(addMarker);
        addMarker = L.marker([lat, lng], { draggable: true }).addTo(addMap);
        
        // Reverse Geocode (لجلب العنوان النصي من الإحداثيات)
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await response.json();
        document.getElementById('add-fullAddress').value = data.display_name;
        document.getElementById('add-address-display').innerText = data.display_name;
        document.getElementById('add-lat').value = lat;
        document.getElementById('add-lng').value = lng;
    }
}

// =====================================================
// 2. Fetch Properties V2
// =====================================================
async function loadMyProperties() {
    showLoader();
    try {
        const res = await fetch(`${API_URL}/Properties/GetByOwnerV2?ownerId=${currentOwnerId}`);
        const data = await res.json();
        renderGrid(data.properties);
        document.getElementById('stat-total').innerText = data.count;
    } catch (err) {
        console.error("API Error", err);
    } finally {
        hideLoader();
    }
}

function renderGrid(props) {
    const grid = document.getElementById('propertiesGrid');
    grid.innerHTML = props.map(p => `
        <div class="col-md-4">
            <div class="card property-card shadow-sm border-0" onclick="showPropertyDetails(${p.propertyID})">
                <img src="${p.images[0]?.imageUrl || '../img/placeholder.jpg'}" class="card-img-top" style="height:200px; object-fit:cover;">
                <div class="card-body">
                    <h5 class="fw-bold">${p.title}</h5>
                    <p class="text-muted small"><i class="fa-solid fa-location-dot"></i> ${p.fullAddress}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="gold-text fw-bold">${p.price} EGP</span>
                        <span class="badge bg-success">${p.status || 'Active'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// =====================================================
// 3. Modern Gallery & Details Sync
// =====================================================
async function showPropertyDetails(id) {
    showLoader();
    try {
        const res = await fetch(`${API_URL}/Properties/GetByIDV2?id=${id}`);
        const data = await res.json();
        const p = data.property;

        showSection('details');
        document.getElementById('det-title').innerText = p.title;
        document.getElementById('det-address').innerText = p.fullAddress;
        
        // Render Services
        document.getElementById('det-services').innerHTML = p.services.map(s => `
            <span class="service-badge"><i class="fa-solid fa-check"></i> ${s.name}</span>
        `).join('');

        // Render Gallery
        initGallery(p.images, p.video);
        
        // Mini Map
        if (detailsMap) detailsMap.remove();
        detailsMap = L.map('map-details').setView([p.location.latitude, p.location.longitude], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(detailsMap);
        L.marker([p.location.latitude, p.location.longitude]).addTo(detailsMap);

    } catch (err) {
        console.error(err);
    } finally { hideLoader(); }
}

function initGallery(images, video) {
    const stage = document.getElementById('main-media-box');
    const strip = document.getElementById('thumbnails-strip');
    
    stage.innerHTML = `<img src="${images[0].imageUrl}" id="main-active-media">`;
    strip.innerHTML = images.map((img, i) => `
        <img src="${img.imageUrl}" class="thumb-item ${i===0?'active':''}" onclick="changeMedia('${img.imageUrl}', 'img', this)">
    `).join('');

    if (video && video.videoUrl) {
        strip.innerHTML += `<div class="thumb-item video-thumb" onclick="changeMedia('${video.videoUrl}', 'video', this)"><i class="fa-solid fa-play"></i></div>`;
    }
}

window.changeMedia = (url, type, el) => {
    document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const stage = document.getElementById('main-media-box');
    stage.innerHTML = type === 'img' ? `<img src="${url}" class="animate-fade">` : `<video src="${url}" controls autoplay></video>`;
};

// =====================================================
// Navigation & Lifecycle
// =====================================================
function showSection(id) {
    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.add('d-none'));
    document.getElementById(`section-${id}`).classList.remove('d-none');
    
    // Reset Active Menu
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    document.getElementById(`menu-${id}`)?.classList.add('active');

    if (id === 'add' && !addMap) {
        setTimeout(() => {
            addMap = L.map('map-add').setView([30.0444, 31.2357], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(addMap);
        }, 300);
    }
}

document.getElementById('menu-list').onclick = () => { showSection('list'); loadMyProperties(); };
document.getElementById('menu-add').onclick = () => showSection('add');

function showLoader() { document.getElementById('homunityLoader').classList.remove('d-none'); }
function hideLoader() { document.getElementById('homunityLoader').classList.add('d-none'); }

// Start
document.addEventListener("DOMContentLoaded", () => {
    loadMyProperties();
});
