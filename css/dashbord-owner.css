const API_BASE = "https://homunityapiv1.runasp.net/api";
let addMap, addMarker;

// =====================================================
// GPS FIX (الفيوم مش البكاري)
// =====================================================
async function handleGPS(btnId, type) {
    const btn = document.getElementById(btnId);
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;
    
    const geoOptions = {
        enableHighAccuracy: true, // إجباري لجلب موقع دقيق
        timeout: 10000,
        maximumAge: 0 // منع الكاش تماماً
    };

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const { latitude, longitude } = pos.coords;
            if (type === 'add') {
                updateAddLocation(latitude, longitude);
            }
            btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
        },
        (err) => {
            Swal.fire("Error", "Could not get your precise location. Please allow GPS.", "error");
            btn.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> Use My Location`;
        },
        geoOptions
    );
}

// =====================================================
// PROPERTY DETAILS (Modern Gallery & Data Sync)
// =====================================================
async function showDetails(propertyId) {
    showLoader();
    try {
        const res = await fetch(`${API_BASE}/Properties/GetByIDV2?id=${propertyId}`);
        const data = await res.json();
        const prop = data.property;

        hideAllSections();
        document.getElementById("oneProperti").classList.remove("d-none");

        // UI Mapping
        document.getElementById("onePTitle").innerText = prop.title;
        document.getElementById("onePAddress").innerText = prop.fullAddress || "No address provided";
        
        // Gallery logic
        const stage = document.getElementById("onePMainStage");
        const thumbs = document.getElementById("onePThumbs");
        stage.innerHTML = ""; thumbs.innerHTML = "";

        const media = [];
        if (prop.images) prop.images.forEach(i => media.push({url: i.imageUrl, type: 'img'}));
        if (prop.video) media.push({url: prop.video.videoUrl, type: 'video'});

        media.forEach((item, idx) => {
            const thumb = document.createElement("img");
            thumb.src = item.type === 'img' ? item.url : '../assets/video-placeholder.png';
            thumb.className = `thumb-item ${idx === 0 ? 'active' : ''}`;
            thumb.onclick = () => {
                document.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                renderMainMedia(item);
            };
            thumbs.appendChild(thumb);
        });

        if (media.length > 0) renderMainMedia(media[0]);

        // Services
        const sList = document.getElementById("onePServices");
        sList.innerHTML = prop.services.map(s => `<li><i class="fa-solid fa-circle-check gold-text"></i> ${s.name}</li>`).join("");

        // Map
        initDetailsMap(prop.location.latitude, prop.location.longitude);

    } catch (e) { console.error(e); }
    finally { hideLoader(); }
}

function renderMainMedia(item) {
    const stage = document.getElementById("onePMainStage");
    if (item.type === 'img') {
        stage.innerHTML = `<img src="${item.url}" class="animate__animated animate__fadeIn">`;
    } else {
        stage.innerHTML = `<video src="${item.url}" controls autoplay class="w-100 h-100"></video>`;
    }
}

// =====================================================
// UTILS
// =====================================================
function hideAllSections() {
    document.querySelectorAll('section').forEach(s => s.classList.add('d-none'));
}

function showLoader() { document.getElementById("homunityLoader").classList.remove("d-none"); }
function hideLoader() { document.getElementById("homunityLoader").classList.add("d-none"); }

// Navigation
document.getElementById("addProperties").addEventListener("click", () => {
    hideAllSections();
    document.getElementById("sectionAddProperties").classList.remove("d-none");
    setTimeout(initAddMap, 200); // تأخير بسيط لضمان رندر الخريطة
});

// باقي الدوال الخاصة بـ fetchProperties و AddPropertyForm موجودة في الكود الأصلي وتعمل مع الـ API V2 المذكورة.
