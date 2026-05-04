// =====================================================
// AUTH CHECK
// =====================================================
document.addEventListener("DOMContentLoaded", () => {
    const userRole = localStorage.getItem("role");
    const userID = localStorage.getItem("id");
    if (userRole !== "owner" || !userID) {
        Swal.fire({ icon: "error", title: "Error", text: "You cannot access the dashboard without logging in" });
        setTimeout(() => { window.location.href = "../html/form.html"; }, 3000);
    }
});

// =====================================================
// RESPONSIVE SIDEBAR
// =====================================================
document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const toggleBtn = document.getElementById("sidebarToggle");
    if (toggleBtn) toggleBtn.addEventListener("click", () => sidebar.classList.toggle("active"));
    document.querySelectorAll(".sidebar nav ul li").forEach(item => {
        item.addEventListener("click", () => { if (window.innerWidth < 992) sidebar.classList.remove("active"); });
    });
});

// =====================================================
// SECTIONS & MENU
// =====================================================
const sections = {
    properties: document.getElementById("sectionProperties"),
    oneProperti: document.getElementById("oneProperti"),
    addProperties: document.getElementById("sectionAddProperties"),
    updateProperties: document.getElementById("sectionUpdateProperties"),
    booking: document.getElementById("sectionBooking"),
    settingProperties: document.getElementById("sectionSettingProperties"),
    massageProperties: document.getElementById("sectionMassageProperties"),
};
const menuItems = {
    properties: document.getElementById("properties"),
    addProperties: document.getElementById("addProperties"),
    booking: document.getElementById("BookingButton"),
    settingProperties: document.getElementById("settingProperties"),
    massageProperties: document.getElementById("massageProperties"),
};
function hideAllSections(item, option) {
    for (let key in item) {
        if (option === "add") item[key].classList.add("d-none");
        else item[key].classList.remove("active");
    }
}
const laoding = document.getElementById("homunityLoader");
function showLoader() { laoding.classList.remove("d-none"); }
function hideLoader() { laoding.classList.add("d-none"); }
for (let key in menuItems) menuItems[key].addEventListener("click", () => hideAllSections(sections, "add"));
for (let key in menuItems) {
    menuItems[key].addEventListener("click", () => {
        hideAllSections(menuItems, "a");
        sections[key].classList.remove("d-none");
        menuItems[key].classList.add("active");
    });
}

// =====================================================
// UTILITIES
// =====================================================
const API_BASE = "https://homunityapiv1.runasp.net/api";
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

// =====================================================
// SETTINGS
// =====================================================
menuItems.settingProperties.addEventListener("click", () => {
    const userId = localStorage.getItem("id");
    if (!userId) return;
    fetch(`${API_BASE}/Users/Get Profile By ID?id=${userId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (!data) return;
            const fn = document.getElementById("firstName");
            const ln = document.getElementById("lastName");
            const ph = document.getElementById("phone");
            if (fn) fn.value = data.firstName || "";
            if (ln) ln.value = data.lastName || "";
            if (ph) ph.value = data.phone || "";
        }).catch(e => console.warn("Profile:", e));
});
document.addEventListener("DOMContentLoaded", () => {
    const phoneInput = document.getElementById("phone");
    const firstInput = document.getElementById("firstName");
    const lastInput = document.getElementById("lastName");
    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (phoneInput) phoneInput.addEventListener("input", () => {
        document.getElementById("phoneError").innerText = !phoneInput.value.trim() ? "" : !phoneRegex.test(phoneInput.value.trim()) ? "Phone number is not valid!" : "";
    });
    if (firstInput) firstInput.addEventListener("input", () => {
        const v = firstInput.value.trim();
        document.getElementById("firstNameError").innerText = !v ? "" : (v.length<2||v.length>10) ? "First Name must be between 2 and 10 characters" : "";
    });
    if (lastInput) lastInput.addEventListener("input", () => {
        const v = lastInput.value.trim();
        document.getElementById("lastNameError").innerText = !v ? "" : (v.length<2||v.length>10) ? "Last Name must be between 2 and 10 characters" : "";
    });
});

// =====================================================
// MAP UTILITIES
// =====================================================
let allUniversities = [], universitiesLoaded = false;
async function fetchUniversities() {
    if (universitiesLoaded) return;
    try {
        const res = await fetch(`${API_BASE}/Universities/GetAll`);
        const data = await res.json();
        allUniversities = data.universities || [];
        universitiesLoaded = true;
    } catch (e) { console.warn("Universities:", e); }
}
fetchUniversities();

function calcDist(lat1,lon1,lat2,lon2) {
    const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
    const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(2);
}
function findNearest(lat,lng) {
    if (!allUniversities.length) return null;
    let nearest=null, minDist=Infinity;
    allUniversities.forEach(u => { const d=parseFloat(calcDist(lat,lng,u.latitude,u.longitude)); if(d<minDist){minDist=d;nearest=u;} });
    return nearest ? {university:nearest, distance:minDist.toFixed(2)} : null;
}
function goldIcon() {
    return L.divIcon({
        className:"",
        html:`<div style="width:36px;height:36px;background:linear-gradient(135deg,#efb81e,#d4a017);border:3px solid #212e43;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 3px 10px rgba(33,46,67,0.4);display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-house" style="transform:rotate(45deg);color:#212e43;font-size:0.7rem;"></i></div>`,
        iconSize:[36,36], iconAnchor:[18,36], popupAnchor:[0,-36]
    });
}
async function reverseGeocode(lat,lng) {
    try { const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`); const d=await r.json(); return d.display_name||`${lat.toFixed(5)},${lng.toFixed(5)}`; }
    catch { return `${lat.toFixed(5)},${lng.toFixed(5)}`; }
}
async function nominatimSearch(q) {
    try { const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=eg&limit=1`); const d=await r.json(); return d.length>0?d[0]:null; }
    catch { return null; }
}
function applyLocUI(lat,lng,address,nearest,prefix) {
    document.getElementById(`${prefix}Lat`).value=lat;
    document.getElementById(`${prefix}Lng`).value=lng;
    document.getElementById(`${prefix}Address`).value=address;
    document.getElementById(`${prefix}SelectedAddress`).textContent=address;
    const uniEl=document.getElementById(`${prefix}SelectedUni`);
    if (nearest) {
        document.getElementById(`${prefix}UniversityId`).value=nearest.university.universityId;
        uniEl.textContent=`Nearest: ${nearest.university.name} (${nearest.distance} km)`;
    } else { document.getElementById(`${prefix}UniversityId`).value=""; uniEl.textContent=""; }
    document.getElementById(`${prefix}LocationInfo`).classList.remove("d-none");
    const errEl=document.getElementById(`${prefix}LocationError`);
    if (errEl) errEl.style.display="none";
}

// =====================================================
// ADD MAP
// =====================================================
let addMap=null, addMarker=null, addPickingMode=false;
function initAddMap() {
    if (addMap) { setTimeout(()=>addMap.invalidateSize(),200); return; }
    addMap=L.map("addMap",{preferCanvas:true}).setView([30.04,31.23],11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:18}).addTo(addMap);
    const banner=document.createElement("div"); banner.id="addPickingBanner"; banner.className="map-picking-banner"; banner.textContent="Click on map to set location";
    document.getElementById("addMapContainer").appendChild(banner);
    addMap.on("click",async(e)=>{ if(!addPickingMode)return; await setAddLoc(e.latlng.lat,e.latlng.lng); setAddPick(false); });
    setTimeout(()=>addMap.invalidateSize(),300);
}
function setAddPick(active) {
    addPickingMode=active;
    const banner=document.getElementById("addPickingBanner"), btn=document.getElementById("addManualBtn"), wrap=document.getElementById("addMapContainer");
    if(active){banner&&banner.classList.add("show");btn&&btn.classList.add("active");wrap&&wrap.classList.add("map-picking-mode");}
    else{banner&&banner.classList.remove("show");btn&&btn.classList.remove("active");wrap&&wrap.classList.remove("map-picking-mode");}
}
async function setAddLoc(lat,lng) {
    if(addMarker) addMap.removeLayer(addMarker);
    addMarker=L.marker([lat,lng],{icon:goldIcon()}).addTo(addMap);
    addMap.setView([lat,lng],15);
    const address=await reverseGeocode(lat,lng);
    const nearest=findNearest(lat,lng);
    applyLocUI(lat,lng,address,nearest,"add");
    if(nearest) addMarker.bindPopup(`<b>${address.split(",")[0]}</b><br><small>Near ${nearest.university.name} (${nearest.distance} km)</small>`).openPopup();
}

document.getElementById("addGpsBtn").addEventListener("click", function() {
    if(!navigator.geolocation){alert("Geolocation not supported.");return;}
    this.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Locating...`; this.disabled=true;
    const btn=this;
    initAddMap();
    // maximumAge:0 forces device to get FRESH location — never cached
    navigator.geolocation.getCurrentPosition(
        async(pos)=>{ await fetchUniversities(); await setAddLoc(pos.coords.latitude,pos.coords.longitude); btn.innerHTML=`<i class="fa-solid fa-location-crosshairs"></i> Use My Location`; btn.disabled=false; },
        (err)=>{ alert("Could not get location.\n"+err.message); btn.innerHTML=`<i class="fa-solid fa-location-crosshairs"></i> Use My Location`; btn.disabled=false; },
        {enableHighAccuracy:true, timeout:12000, maximumAge:0}
    );
});
document.getElementById("addManualBtn").addEventListener("click",()=>{ initAddMap(); addPickingMode?setAddPick(false):setAddPick(true); });
document.getElementById("addMapSearchBtn").addEventListener("click",async()=>{ const q=document.getElementById("addMapSearch").value.trim(); if(!q)return; initAddMap(); await fetchUniversities(); const r=await nominatimSearch(q); if(r) await setAddLoc(parseFloat(r.lat),parseFloat(r.lon)); else alert("Not found."); });
document.getElementById("addMapSearch").addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();document.getElementById("addMapSearchBtn").click();} });
menuItems.addProperties.addEventListener("click",()=>setTimeout(async()=>{await fetchUniversities();initAddMap();},150));

// =====================================================
// ADD PROPERTY SUBMIT
// =====================================================
document.getElementById("addPropertyForm").addEventListener("submit", async(e)=>{
    e.preventDefault();
    const get=id=>document.getElementById(id);
    const title=get("titleAdd"),price=get("priceAdd"),rooms=get("roomsAdd"),images=get("images"),video=get("video");
    const lat=get("addLat").value, lng=get("addLng").value, address=get("addAddress").value, universityId=get("addUniversityId").value;
    let isValid=true;
    const toggleErr=(id,show)=>{ const el=get(id); if(el) el.style.display=show?"block":"none"; };
    if(title.value.length<5){toggleErr("titleError",true);isValid=false;}else toggleErr("titleError",false);
    if(!price.value||parseFloat(price.value)<100){toggleErr("priceError",true);isValid=false;}else toggleErr("priceError",false);
    if(!rooms.value||parseInt(rooms.value)<1||parseInt(rooms.value)>10){toggleErr("roomsError",true);isValid=false;}else toggleErr("roomsError",false);
    if(!lat||!lng){get("addLocationError").style.display="block";isValid=false;}else get("addLocationError").style.display="none";
    if(images.files.length>6){alert("Max 6 images.");isValid=false;}
    for(let f of images.files){if(f.size>2*1024*1024){alert(`${f.name} too large.`);isValid=false;break;}}
    if(video.files.length>0&&video.files[0].size>30*1024*1024){alert("Video too large.");isValid=false;}
    if(!isValid) return;
    showLoader();
    try {
        const fd=new FormData(), ownerId=localStorage.getItem("id");
        fd.append("OwnerID",parseInt(ownerId));
        fd.append("Title",title.value.trim());
        fd.append("Description",get("descreptionAdd").value||"");
        fd.append("Price",parseFloat(price.value));
        fd.append("Rooms",parseInt(rooms.value));
        fd.append("PropertyType",get("apartmentApp").checked?"Apartment":"Room");
        fd.append("City","Cairo"); fd.append("Area","General"); fd.append("Street",address);
        fd.append("Latitude",parseFloat(lat)); fd.append("Longitude",parseFloat(lng));
        fd.append("Address",address);
        if(universityId) fd.append("UniversityId",parseInt(universityId));
        for(let i=0;i<images.files.length;i++) fd.append("Images",images.files[i]);
        if(video.files.length>0) fd.append("Video",video.files[0]);
        [{id:"wifi",val:1},{id:"parking",val:2},{id:"gym",val:3},{id:"ac",val:4}].forEach(s=>{ const el=get(s.id); if(el&&el.checked) fd.append("Services",s.val); });
        const res=await fetch(`${API_BASE}/Properties/CreateFullProperty`,{method:"POST",body:fd});
        if(res.ok){
            Swal.fire({icon:"success",title:"Success!",text:"Property added successfully!"});
            document.getElementById("addPropertyForm").reset();
            get("addLocationInfo").classList.add("d-none");
            ["addLat","addLng","addAddress","addUniversityId"].forEach(id=>{const el=get(id);if(el)el.value="";});
            if(addMarker){addMap.removeLayer(addMarker);addMarker=null;}
            sections.addProperties.classList.add("d-none"); sections.properties.classList.remove("d-none");
            menuItems.addProperties.classList.remove("active"); menuItems.properties.classList.add("active");
            fetchProperties(); fetchOwnerStats();
        } else { const err=await res.json().catch(()=>{}); Swal.fire({icon:"error",title:"Error",text:err?.message||"Please try again."}); }
    } catch(err){ console.error(err); Swal.fire({icon:"error",title:"Connection Error"}); }
    finally { hideLoader(); }
});
document.getElementById("cancelAdd").addEventListener("click",()=>{ sections.addProperties.classList.add("d-none"); sections.properties.classList.remove("d-none"); menuItems.addProperties.classList.remove("active"); menuItems.properties.classList.add("active"); });

// =====================================================
// UPDATE MAP
// =====================================================
let updateMap=null, updateMarker=null, updatePickingMode=false;
function initUpdateMap(lat,lng) {
    if(updateMap){updateMap.remove();updateMap=null;updateMarker=null;}
    const center=(lat&&lng)?[parseFloat(lat),parseFloat(lng)]:[30.04,31.23], zoom=(lat&&lng)?15:11;
    updateMap=L.map("updateMap",{preferCanvas:true}).setView(center,zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:18}).addTo(updateMap);
    const old=document.getElementById("updatePickingBanner"); if(old) old.remove();
    const banner=document.createElement("div"); banner.id="updatePickingBanner"; banner.className="map-picking-banner"; banner.textContent="Click on map to set location";
    document.getElementById("updateMapContainer").appendChild(banner);
    if(lat&&lng) updateMarker=L.marker([parseFloat(lat),parseFloat(lng)],{icon:goldIcon()}).addTo(updateMap);
    updateMap.on("click",async(e)=>{ if(!updatePickingMode)return; await setUpdateLoc(e.latlng.lat,e.latlng.lng); setUpdatePick(false); });
    setTimeout(()=>updateMap.invalidateSize(),300);
}
function setUpdatePick(active) {
    updatePickingMode=active;
    const banner=document.getElementById("updatePickingBanner"), btn=document.getElementById("updateManualBtn"), wrap=document.getElementById("updateMapContainer");
    if(active){banner&&banner.classList.add("show");btn&&btn.classList.add("active");wrap&&wrap.classList.add("map-picking-mode");}
    else{banner&&banner.classList.remove("show");btn&&btn.classList.remove("active");wrap&&wrap.classList.remove("map-picking-mode");}
}
async function setUpdateLoc(lat,lng) {
    if(updateMarker) updateMap.removeLayer(updateMarker);
    updateMarker=L.marker([lat,lng],{icon:goldIcon()}).addTo(updateMap);
    updateMap.setView([lat,lng],15);
    const address=await reverseGeocode(lat,lng);
    const nearest=findNearest(lat,lng);
    applyLocUI(lat,lng,address,nearest,"update");
    if(nearest) updateMarker.bindPopup(`<b>${address.split(",")[0]}</b><br><small>Near ${nearest.university.name} (${nearest.distance} km)</small>`).openPopup();
}
document.getElementById("updateGpsBtn").addEventListener("click",function(){
    if(!navigator.geolocation){alert("Geolocation not supported.");return;}
    this.innerHTML=`<i class="fa-solid fa-spinner fa-spin"></i> Locating...`; this.disabled=true;
    const btn=this;
    navigator.geolocation.getCurrentPosition(
        async(pos)=>{ await fetchUniversities(); await setUpdateLoc(pos.coords.latitude,pos.coords.longitude); btn.innerHTML=`<i class="fa-solid fa-location-crosshairs"></i> Use My Location`; btn.disabled=false; },
        (err)=>{ alert("Could not get location.\n"+err.message); btn.innerHTML=`<i class="fa-solid fa-location-crosshairs"></i> Use My Location`; btn.disabled=false; },
        {enableHighAccuracy:true, timeout:12000, maximumAge:0}
    );
});
document.getElementById("updateManualBtn").addEventListener("click",()=>{ updatePickingMode?setUpdatePick(false):setUpdatePick(true); });
document.getElementById("updateMapSearchBtn").addEventListener("click",async()=>{ const q=document.getElementById("updateMapSearch").value.trim(); if(!q)return; await fetchUniversities(); const r=await nominatimSearch(q); if(r) await setUpdateLoc(parseFloat(r.lat),parseFloat(r.lon)); else alert("Not found."); });
document.getElementById("updateMapSearch").addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();document.getElementById("updateMapSearchBtn").click();} });

// =====================================================
// OWNER STATS
// =====================================================
async function fetchOwnerStats() {
    const ownerId=localStorage.getItem("id"); if(!ownerId) return;
    try {
        const [pRes,bRes]=await Promise.all([fetch(`${API_BASE}/Properties/GetByOwnerV2?ownerId=${ownerId}`),fetch(`${API_BASE}/Booking/owner/${ownerId}`)]);
        const pData=await pRes.json(), bData=await bRes.json();
        const props=pData.properties||[], books=bData.bookings||[];
        const el=id=>document.getElementById(id);
        if(el("total-props")) el("total-props").innerText=props.length;
        if(el("approved-count")) el("approved-count").innerText=props.filter(p=>p.propertyStatusID===2).length;
        if(el("rejected-count")) el("rejected-count").innerText=props.filter(p=>p.propertyStatusID===3).length;
        if(el("pending-booking")) el("pending-booking").innerText=books.filter(b=>b.statusName==="In-Process").length;
        if(el("booked-count")) el("booked-count").innerText=books.filter(b=>b.statusName==="Booked").length;
    } catch(e){ console.error(e); }
}
fetchOwnerStats();

// =====================================================
// UPDATE SECTION OPEN
// =====================================================
let newPropertyFiles=[], newVideoFile=null;
function openUpdateSection(prop) {
    document.getElementById("oneProperti").classList.add("d-none");
    document.getElementById("sectionUpdateProperties").classList.remove("d-none");
    window.scrollTo(0,0);
    newPropertyFiles=[]; newVideoFile=null;
    const get=id=>document.getElementById(id);
    get("propertyIdUpdate").value=prop.propertyID;
    get("titleUpdate").value=prop.title||"";
    get("priceUpdate").value=prop.price||"";
    get("roomsUpdate").value=prop.rooms||"";
    get("descriptionUpdate").value=prop.description||"";
    if(prop.propertyType&&prop.propertyType.toLowerCase()==="apartment") get("apartmentUpdate").checked=true;
    else get("roomUpdate").checked=true;
    ["wifiUpdate","parkingUpdate","gymUpdate","acUpdate"].forEach(id=>get(id).checked=false);
    if(prop.services) prop.services.forEach(s=>{
        const n=s.name.toLowerCase();
        if(n.includes("wifi")) get("wifiUpdate").checked=true;
        if(n.includes("air")) get("parkingUpdate").checked=true;
        if(n.includes("washing")) get("gymUpdate").checked=true;
        if(n.includes("water")) get("acUpdate").checked=true;
    });
    const loc=prop.location||{};
    const existingLat=loc.latitude||null, existingLng=loc.longitude||null;
    const existingAddr=prop.fullAddress||loc.address||[loc.street,loc.area,loc.city].filter(Boolean).join(", ")||"";
    get("updateLat").value=existingLat||""; get("updateLng").value=existingLng||""; get("updateAddress").value=existingAddr;
    if(existingLat&&existingLng){
        get("updateSelectedAddress").textContent=existingAddr||`${existingLat},${existingLng}`;
        const nearest=findNearest(existingLat,existingLng);
        if(nearest){get("updateUniversityId").value=nearest.university.universityId;get("updateSelectedUni").textContent=`Nearest: ${nearest.university.name} (${nearest.distance} km)`;}
        else get("updateSelectedUni").textContent="";
        get("updateLocationInfo").classList.remove("d-none");
    } else get("updateLocationInfo").classList.add("d-none");
    setTimeout(async()=>{ await fetchUniversities(); initUpdateMap(existingLat,existingLng); },200);
    const mediaContainer=get("allImg");
    mediaContainer.innerHTML=`<div class="upload-wrapper w-100"><div class="row g-3"><div class="col-lg-9 col-12 border-end-divider"><div class="mb-3"><button type="button" id="addImageBtn" class="add-btn-yellow" onclick="document.getElementById('newImagesInput').click()">+ Add Image</button><input type="file" id="newImagesInput" multiple accept="image/*" class="d-none" onchange="previewNewImages(this)"></div><div id="imagesGrid" class="images-grid-layout"></div></div><div class="col-lg-3 col-12 ps-lg-4"><div class="mb-3"><button type="button" id="addVideoBtn" class="add-btn-yellow w-100" onclick="document.getElementById('newVideoInput').click()">+ Add Video</button><input type="file" id="newVideoInput" accept="video/*" class="d-none" onchange="previewNewVideo(this)"></div><div id="videoPreviewContainer"></div></div></div></div>`;
    const imagesGrid=get("imagesGrid");
    if(prop.images&&prop.images.length>0) prop.images.forEach(img=>imagesGrid.appendChild(createMediaCard(img.imageUrl,"image")));
    const vpc=get("videoPreviewContainer");
    if(prop.video&&prop.video.videoUrl){vpc.appendChild(createMediaCard(prop.video.videoUrl,"video"));get("addVideoBtn").style.display="none";}
    checkImageLimit();
}
function createMediaCard(url,type,isNew=false,fileName=""){
    const div=document.createElement("div"); div.className="thumb-wrapper"; if(isNew) div.dataset.fileName=fileName;
    const mc=type==="image"?`<div class="thumb-img" style="background-image:url('${url}')"></div>`:`<div class="thumb-img video-preview-wrapper"><video src="${url}" controls class="w-100 h-100 rounded-3"></video></div>`;
    div.innerHTML=`${mc}<button type="button" class="delete-btn-yellow mt-2" onclick="removeMediaItem(this,'${type}')"><i class="fa fa-trash-alt"></i> Delete</button>`;
    return div;
}
function previewNewImages(input){
    const grid=document.getElementById("imagesGrid");
    Array.from(input.files).forEach(f=>{ if(grid.querySelectorAll(".thumb-wrapper").length>=6)return; newPropertyFiles.push(f); grid.appendChild(createMediaCard(URL.createObjectURL(f),"image",true,f.name)); });
    checkImageLimit(); input.value="";
}
function previewNewVideo(input){
    const f=input.files[0]; if(f){ newVideoFile=f; const vpc=document.getElementById("videoPreviewContainer"); vpc.innerHTML=""; vpc.appendChild(createMediaCard(URL.createObjectURL(f),"video",true)); document.getElementById("addVideoBtn").style.display="none"; } input.value="";
}
function removeMediaItem(btn,type){
    const parent=btn.parentElement;
    if(type==="image"&&parent.dataset.fileName) newPropertyFiles=newPropertyFiles.filter(f=>f.name!==parent.dataset.fileName);
    if(type==="video"){newVideoFile=null;const b=document.getElementById("addVideoBtn");if(b)b.style.display="block";}
    parent.remove(); checkImageLimit();
}
function checkImageLimit(){
    const count=document.getElementById("imagesGrid")?.querySelectorAll(".thumb-wrapper").length||0;
    const btn=document.getElementById("addImageBtn"); if(btn) btn.style.display=count>=6?"none":"inline-block";
}

// =====================================================
// UPDATE PROPERTY SUBMIT
// =====================================================
document.getElementById("updatePropertyForm")?.addEventListener("submit", async function(e){
    e.preventDefault(); let isValid=true;
    function showErr(input,id,cond,msg){ const el=document.getElementById(id); if(!cond){input.classList.add("is-invalid");if(el){el.style.display="block";el.textContent=msg;}isValid=false;} else{input.classList.remove("is-invalid");if(el){el.style.display="none";el.textContent="";}} }
    const get=id=>document.getElementById(id);
    const title=get("titleUpdate"),price=get("priceUpdate"),rooms=get("roomsUpdate");
    showErr(title,"titleErrorUpdate",title.value.trim().length>=5&&title.value.trim().length<=100,"Title must be 5-100 chars.");
    showErr(price,"priceErrorUpdate",price.value&&parseFloat(price.value)>=100,"Price must be at least 100.");
    showErr(rooms,"roomsErrorUpdate",rooms.value&&parseInt(rooms.value)>=1&&parseInt(rooms.value)<=10,"Rooms must be 1-10.");
    if(!isValid) return;
    showLoader();
    try {
        const propId=Number(get("propertyIdUpdate").value);
        const uLat=get("updateLat").value, uLng=get("updateLng").value, uAddr=get("updateAddress").value, uUniId=get("updateUniversityId").value;
        const fd=new FormData();
        fd.append("PropertyID",propId); fd.append("Title",title.value.trim()); fd.append("Description",get("descriptionUpdate").value.trim());
        fd.append("Price",parseFloat(price.value)); fd.append("Rooms",parseInt(rooms.value));
        const sel=document.querySelector('input[name="propertyType"]:checked');
        let typeVal="Apartment"; if(sel) typeVal=sel.value==="on"?(sel.id==="apartmentUpdate"?"Apartment":"Room"):sel.value;
        fd.append("PropertyType",typeVal);
        fd.append("City","Cairo"); fd.append("Area","General"); fd.append("Street",uAddr);
        fd.append("Latitude",parseFloat(uLat||0)); fd.append("Longitude",parseFloat(uLng||0));
        fd.append("Address",uAddr); fd.append("UniversityId",parseInt(uUniId||0));
        newPropertyFiles.forEach(f=>fd.append("NewImages",f));
        if(newVideoFile){fd.append("NewVideo",newVideoFile);fd.append("DeleteVideo","false");}
        else fd.append("DeleteVideo",(document.querySelector(".video-preview-wrapper")===null).toString());
        [{id:"wifiUpdate",val:1},{id:"parkingUpdate",val:2},{id:"gymUpdate",val:3},{id:"acUpdate",val:4}].forEach(s=>{ if(get(s.id)?.checked) fd.append("Services",s.val); });
        const res=await fetch(`${API_BASE}/Properties/UpdateFullProperty`,{method:"PUT",body:fd});
        const resData=await res.json();
        if(res.ok){
            await Swal.fire({icon:"success",title:"Updated!",text:"Property updated successfully."});
            sections.updateProperties.classList.add("d-none"); sections.properties.classList.remove("d-none");
            menuItems.properties.classList.add("active");
            fetchProperties(); fetchOwnerStats();
        } else Swal.fire({icon:"error",title:"Failed",text:resData.message||"Check your inputs."});
    } catch(err){ console.error(err); Swal.fire({icon:"error",title:"Connection Error"}); }
    finally { hideLoader(); }
});
document.getElementById("cancelUpdate").onclick=()=>{ sections.updateProperties.classList.add("d-none"); sections.properties.classList.remove("d-none"); menuItems.properties.classList.add("active"); };

// =====================================================
// FETCH PROPERTIES LIST
// =====================================================
async function fetchProperties(){
    const container=document.getElementById("propertiesContainer");
    const ownerId=localStorage.getItem("id"); if(!ownerId){container.innerHTML="<p class='text-center py-5 text-warning'>Please login.</p>";return;}
    showLoader();
    try {
        const res=await fetch(`${API_BASE}/Properties/GetByOwnerV2?ownerId=${ownerId}`);
        const data=await res.json(); container.innerHTML="";
        const properties=data.properties||[];
        if(properties.length===0){
            container.innerHTML=`<div class="col-12 text-center py-5"><div class="mb-3"><img src="../img/icone-add-is-blank.svg" style="width:150px;"></div><h2 class="fw-bold" style="color:#FFC107;">No properties yet.</h2><p class="fw-bold" style="color:#212E43;font-size:1.2rem;">Click here to add your first property</p><button id="addPropertyy" class="btn mt-3 px-5 py-2 fw-bold" style="background-color:#212E43;color:#FFC107;border-radius:8px;font-size:1.2rem;">+Add</button></div>`;
            return;
        }
        properties.forEach(prop=>{
            let statusText="In Progress", statusClass="bg-warning text-dark";
            if(prop.propertyStatusID===2){statusText="Approved";statusClass="bg-success text-white";}
            else if(prop.propertyStatusID===3){statusText="Rejected";statusClass="bg-danger text-white";}
            const imgUrl=prop.images?.length>0?prop.images[0].imageUrl:"https://via.placeholder.com/150";
            let addrDisplay=prop.fullAddress;
            if(!addrDisplay||addrDisplay.includes("Default")){const loc=prop.location||{};addrDisplay=loc.address||[loc.street,loc.area,loc.city].filter(Boolean).join(", ");}
            if(!addrDisplay||!addrDisplay.trim()) addrDisplay="Location not set";
            const propJson=JSON.stringify(prop).replace(/"/g,"&quot;");
            container.innerHTML+=`<div class="col-12 mb-3"><div class="property-card p-3 shadow-sm border rounded-3 bg-white"><div class="d-flex d-flex-mobile align-items-start gap-3"><img src="${imgUrl}" style="width:120px;height:90px;object-fit:cover;border-radius:8px;" alt="property" onerror="this.src='https://via.placeholder.com/120x90'"><div class="flex-grow-1"><h4 class="mb-1 h6 fw-bold text-dark">${escapeHtml(prop.title)}</h4><p class="mb-1 text-muted small"><i class="fas fa-location-dot me-1"></i>${escapeHtml(addrDisplay)}</p><p class="mb-0 fw-bold" style="color:#efb81e;">$${prop.price} / month</p></div><div class="d-flex align-items-center gap-2 mt-2 flex-wrap justify-content-end"><span class="badge ${statusClass}" style="font-size:10px;padding:5px 10px;">${statusText}</span><button class="btn btn-sm px-4 fw-bold" style="background:transparent;color:#1e293b;border:2px solid #000;border-radius:20px;transition:0.2s;" onmouseover="this.style.backgroundColor='#212e43';this.style.color='#efb81e';this.style.borderColor='#212e43';" onmouseout="this.style.backgroundColor='transparent';this.style.color='#1e293b';this.style.borderColor='#000';" onclick='showPropertyDetails(${propJson})'>View Details</button></div></div></div></div>`;
        });
    } catch(err){ console.error(err); container.innerHTML="<p class='text-center text-danger py-5'>Error loading properties.</p>"; }
    finally { hideLoader(); }
}
fetchProperties();
document.getElementById("propertiesContainer").addEventListener("click",e=>{ if(e.target?.id==="addPropertyy"){ sections.properties.classList.add("d-none"); sections.addProperties.classList.remove("d-none"); menuItems.addProperties.classList.add("active"); menuItems.properties.classList.remove("active"); setTimeout(async()=>{await fetchUniversities();initAddMap();},150); } });

// =====================================================
// DETAILS MAP
// =====================================================
let detailsMap=null;
function initDetailsMap(lat,lng,address,uniName,distKm){
    if(detailsMap){detailsMap.remove();detailsMap=null;}
    const mapEl=document.getElementById("detailsMap"), noLocEl=document.getElementById("detailsMapNoLocation"), mapInfoEl=document.getElementById("detailsMapInfo"), uniInfoEl=document.getElementById("detailsUniInfo");
    const latF=lat?parseFloat(lat):NaN, lngF=lng?parseFloat(lng):NaN;
    if(!lat||!lng||isNaN(latF)||isNaN(lngF)){mapEl.style.display="none";noLocEl.style.display="flex";mapInfoEl.classList.add("d-none");uniInfoEl.classList.add("d-none");return;}
    mapEl.style.display="block"; noLocEl.style.display="none";
    detailsMap=L.map("detailsMap",{zoomControl:true,scrollWheelZoom:false,preferCanvas:true}).setView([latF,lngF],15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:18}).addTo(detailsMap);
    const marker=L.marker([latF,lngF],{icon:goldIcon()}).addTo(detailsMap);
    if(address){marker.bindPopup(`<b style="color:#212e43">${address.split(",")[0]}</b>`).openPopup();document.getElementById("detailsMapAddress").textContent=address;mapInfoEl.classList.remove("d-none");}
    if(uniName){document.getElementById("detailsUniText").textContent=`Nearest University: ${uniName}${distKm?` — ${distKm} km away`:""}`;uniInfoEl.classList.remove("d-none");}
    else uniInfoEl.classList.add("d-none");
    setTimeout(()=>{if(detailsMap)detailsMap.invalidateSize();},150);
}

// =====================================================
// SHOW PROPERTY DETAILS
// =====================================================
async function showPropertyDetails(prop){
    document.getElementById("oneProperti").classList.remove("d-none");
    sections.properties.classList.add("d-none");
    const images=(prop.images&&prop.images.length>0)?prop.images:[];
    const galleryContainer=document.getElementById("onePFeaturedGallery");
    galleryContainer.innerHTML="";
    if(images.length===0){
        galleryContainer.innerHTML=`<div style="width:100%;height:320px;background:#f1f5f9;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#94a3b8;flex-direction:column;"><i class="fa-solid fa-image" style="font-size:3rem;margin-bottom:10px;"></i><p>No images available</p></div>`;
    } else {
        galleryContainer.innerHTML=`
        <div style="position:relative;width:100%;overflow:hidden;border-radius:16px;background:#1a2535;">
            <div id="galleryTrack" style="display:flex;transition:transform 0.4s ease;height:340px;">
                ${images.map(img=>`<div style="min-width:100%;height:340px;overflow:hidden;"><img src="${img.imageUrl}" style="width:100%;height:100%;object-fit:cover;" /></div>`).join("")}
            </div>
            ${images.length>1?`
            <button onclick="slideGallery(-1)" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);background:rgba(33,46,67,0.85);color:#efb81e;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;font-size:1rem;"><i class="fa-solid fa-chevron-left"></i></button>
            <button onclick="slideGallery(1)" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:rgba(33,46,67,0.85);color:#efb81e;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;font-size:1rem;"><i class="fa-solid fa-chevron-right"></i></button>
            <div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);display:flex;gap:8px;z-index:10;">
                ${images.map((_,i)=>`<span id="gDot_${i}" style="width:10px;height:10px;border-radius:50%;background:${i===0?'#efb81e':'rgba(255,255,255,0.5)'};cursor:pointer;display:inline-block;" onclick="goToSlide(${i})"></span>`).join("")}
            </div>`:""}
        </div>
        <div style="display:flex;gap:10px;margin-top:12px;overflow-x:auto;padding:4px 2px;">
            ${images.map((img,i)=>`<img src="${img.imageUrl}" id="gThumb_${i}" onclick="goToSlide(${i})" style="width:72px;height:52px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid ${i===0?'#efb81e':'transparent'};transition:0.2s;flex-shrink:0;" />`).join("")}
        </div>`;
    }
    window._gIdx=0; window._gTotal=images.length;
    window.slideGallery=dir=>{ if(window._gTotal<=1)return; window._gIdx=(window._gIdx+dir+window._gTotal)%window._gTotal; goToSlide(window._gIdx); };
    window.goToSlide=idx=>{ window._gIdx=idx; const t=document.getElementById("galleryTrack"); if(t) t.style.transform=`translateX(-${idx*100}%)`; images.forEach((_,i)=>{ const dot=document.getElementById(`gDot_${i}`); if(dot) dot.style.background=i===idx?'#efb81e':'rgba(255,255,255,0.5)'; const th=document.getElementById(`gThumb_${i}`); if(th) th.style.borderColor=i===idx?'#efb81e':'transparent'; }); };

    document.getElementById("onePTitle").textContent=prop.title;
    document.getElementById("idPropirtie").value=prop.propertyID;
    const loc=prop.location||{};
    let addrDisplay=prop.fullAddress;
    if(!addrDisplay||addrDisplay.includes("Default")) addrDisplay=loc.address||[loc.street,loc.area,loc.city].filter(Boolean).join(", ");
    if(!addrDisplay||!addrDisplay.trim()) addrDisplay="Location not set";
    document.getElementById("onePAddress").textContent=addrDisplay;
    document.getElementById("onePDescription").textContent=prop.description||"";
    document.getElementById("onePPrice").innerHTML=`<i class="fas fa-diamond"></i> Price <span style="color:#efb81e;font-weight:700;">$${prop.price} / month</span>`;
    document.getElementById("onePRooms").innerHTML=`<i class="fas fa-diamond"></i> ${prop.rooms} rooms`;

    const amenitiesList=document.getElementById("onePAmenitiesList"); amenitiesList.innerHTML="";
    if(prop.services&&prop.services.length>0){
        prop.services.forEach(s=>{
            const li=document.createElement("li"); let icon="fa-solid fa-circle-check"; const n=s.name.toLowerCase();
            if(n.includes("wifi")) icon="fa-solid fa-wifi";
            else if(n.includes("air")) icon="fa-regular fa-snowflake";
            else if(n.includes("washing")) icon="fa-solid fa-jug-detergent";
            else if(n.includes("water")) icon="fa-solid fa-fire-flame-simple";
            li.style.cssText="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:1rem;font-weight:600;color:#212e43;";
            li.innerHTML=`<i class="${icon}" style="color:#efb81e;font-size:1.1rem;width:20px;text-align:center;"></i>${escapeHtml(s.name)}`;
            amenitiesList.appendChild(li);
        });
    } else amenitiesList.innerHTML=`<li style="color:#94a3b8;">No services listed</li>`;

    const lat=loc.latitude||null, lng=loc.longitude||null;
    const uniName=loc.university?loc.university.name:null, distKm=loc.university?loc.university.distance_km:null;
    setTimeout(()=>initDetailsMap(lat,lng,addrDisplay,uniName,distKm),300);

    const tableBody=document.querySelector("#onePReservationsTable tbody");
    tableBody.innerHTML='<tr><td colspan="3" class="text-center text-muted">Loading...</td></tr>';
    try {
        const res=await fetch(`${API_BASE}/Booking/property/${prop.propertyID}`);
        const data=await res.json(); const bookings=data.bookings||[];
        if(!bookings.length){ tableBody.innerHTML='<tr><td colspan="3" class="text-center text-muted">No bookings yet.</td></tr>'; }
        else {
            tableBody.innerHTML=bookings.map(b=>{
                const sColor=b.statusName==="Booked"?"#28a745":b.statusName==="In-Process"?"#856404":"#dc3545";
                const sBg=b.statusName==="Booked"?"#d4edda":b.statusName==="In-Process"?"#fff3cd":"#f8d7da";
                const btns=b.statusName==="In-Process"?`<div class="mt-1"><button style="background:#efb81e;color:#212e43;border:none;border-radius:20px;padding:3px 12px;font-size:12px;margin:2px;cursor:pointer;" onclick="handleBookingAction(${b.bookingId},'accept',${prop.propertyID})">Accept</button><button style="background:#212e43;color:#efb81e;border:none;border-radius:20px;padding:3px 12px;font-size:12px;margin:2px;cursor:pointer;" onclick="handleBookingAction(${b.bookingId},'reject',${prop.propertyID})">Reject</button></div>`:"";
                return `<tr><td>${escapeHtml(b.studentName)}</td><td>${b.checkInDate||new Date(b.createdAt||Date.now()).toLocaleDateString()}</td><td><span style="background:${sBg};color:${sColor};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${b.statusName}</span>${btns}</td></tr>`;
            }).join("");
        }
    } catch(err){ console.error(err); tableBody.innerHTML='<tr><td colspan="3" class="text-danger text-center">Error loading bookings.</td></tr>'; }

    document.getElementById("onePBackBtn").onclick=()=>{ document.getElementById("oneProperti").classList.add("d-none"); sections.properties.classList.remove("d-none"); if(detailsMap){detailsMap.remove();detailsMap=null;} };
    document.getElementById("onePBtnUpdate").onclick=()=>openUpdateSection(prop);
}
window.handleBookingAction=async(bookingId,action,propertyId)=>{
    const ownerId=localStorage.getItem("id");
    const url=action==="accept"?`${API_BASE}/Booking/${bookingId}/confirm?OwnerId=${ownerId}`:`${API_BASE}/Booking/${bookingId}/cancel`;
    try {
        const res=await fetch(url,{method:"PUT",headers:{accept:"*/*"}});
        if(res.ok){ Swal.fire({icon:"success",title:action==="accept"?"Accepted!":"Rejected!",timer:1500,showConfirmButton:false}); setTimeout(async()=>{ const r=await fetch(`${API_BASE}/Properties/GetByIDV2?id=${propertyId}`); const d=await r.json(); if(d.property) showPropertyDetails(d.property); },1600); }
        else Swal.fire({icon:"error",title:"Error updating booking."});
    } catch(err){ console.error(err); Swal.fire({icon:"error",title:"Connection error."}); }
};

// =====================================================
// DELETE PROPERTY
// =====================================================
let propertyIdToDelete=null;
document.getElementById("onePBtnDelete").onclick=()=>openDeleteModal(document.getElementById("idPropirtie").value,document.getElementById("onePTitle").textContent,document.getElementById("onePAddress").textContent,"");
function openDeleteModal(id,title,address,img){ propertyIdToDelete=id; document.getElementById("deletePropTitle").textContent=title; document.getElementById("deletePropAddress").textContent=address; if(img)document.getElementById("deletePropImg").src=img; document.getElementById("deleteModal").classList.remove("d-none"); }
document.getElementById("cancelDeleteBtn").onclick=()=>document.getElementById("deleteModal").classList.add("d-none");
document.getElementById("confirmDeleteBtn").onclick=async function(){
    if(!propertyIdToDelete) return;
    this.disabled=true; this.innerHTML="Deleting...";
    try {
        const res=await fetch(`${API_BASE}/Properties/DeleteProperty?id=${propertyIdToDelete}`,{method:"DELETE"});
        if(res.ok){ Swal.fire({icon:"success",title:"Deleted!",text:"Property deleted successfully."}); document.getElementById("oneProperti").classList.add("d-none"); sections.properties.classList.remove("d-none"); if(detailsMap){detailsMap.remove();detailsMap=null;} fetchProperties(); fetchOwnerStats(); }
        else { const err=await res.json(); Swal.fire({icon:"error",title:"Error",text:err.message||"Could not delete."}); }
    } catch(e){ Swal.fire({icon:"error",title:"Connection Error"}); }
    finally { this.disabled=false; this.innerHTML="Delete"; document.getElementById("deleteModal").classList.add("d-none"); }
};

// =====================================================
// BOOKING REQUESTS
// =====================================================
const ownerIdBooking=localStorage.getItem("id");
const bookingContainer=document.getElementById("bookingMainContent");
const messagesContainer=document.getElementById("messagesList");
async function fetchBookings(){
    try {
        const res=await fetch(`${API_BASE}/Booking/owner/${ownerIdBooking}`);
        const data=await res.json();
        const inProcess=(data.bookings||[]).filter(b=>b.statusName==="In-Process");
        const finished=(data.bookings||[]).filter(b=>b.statusName==="Booked"||b.statusName==="Cancelled");
        inProcess.length>0?renderTable(inProcess):renderEmptyBooking();
        finished.length>0?renderMessagesCards(finished):renderEmptyMessages();
    } catch(e){ console.error(e); renderEmptyBooking(); }
}
window.handleAction=async(bookingId,type)=>{
    const url=type==="accept"?`${API_BASE}/Booking/${bookingId}/confirm?OwnerId=${ownerIdBooking}`:`${API_BASE}/Booking/${bookingId}/cancel`;
    try { const res=await fetch(url,{method:"PUT",headers:{accept:"*/*"}}); const result=await res.json(); if(res.ok){Swal.fire({icon:"success",title:type==="accept"?"Confirmed!":"Rejected!",timer:1500,showConfirmButton:false});setTimeout(()=>fetchBookings(),1600);}else Swal.fire({icon:"error",title:"Error",text:result.message||"Try again"}); }
    catch(e){ console.error(e); alert("Connection error"); }
};
function renderTable(bookings){ bookingContainer.innerHTML=`<div class="custom-table-container"><table class="table custom-table mb-0"><thead><tr><th>Image</th><th>Student Name</th><th>Property</th><th>Date</th><th class="text-center">Actions</th></tr></thead><tbody>${bookings.map(b=>`<tr><td><img src="${b.property.imageUrl}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;"></td><td>${escapeHtml(b.studentName)}</td><td>${escapeHtml(b.property.title)}</td><td>${new Date(b.createdAt).toLocaleDateString()}</td><td class="text-center"><button class="btn-reject me-1" onclick="handleAction(${b.bookingId},'reject')">Reject</button><button class="btn-accept" onclick="handleAction(${b.bookingId},'accept')">Accept</button></td></tr>`).join("")}</tbody></table></div>`; }
function renderMessagesCards(bookings){ if(!messagesContainer)return; messagesContainer.innerHTML=bookings.map(b=>`<div class="msg-card mb-3"><div class="row align-items-center g-2"><div class="col-auto"><div style="width:70px;height:70px;overflow:hidden;border-radius:10px;"><img src="${b.property.imageUrl}" style="width:100%;height:100%;object-fit:cover;"></div></div><div class="col text-start ps-3"><div class="fw-bold text-warning">${escapeHtml(b.property.title)}</div><div class="small text-white">${escapeHtml(b.studentName)}</div><div class="text-white-50" style="font-size:0.7rem;">Status: ${b.statusName}</div></div><div class="col-auto"><span class="status-btn-mock">${b.statusName==="Cancelled"?"Rejected":"Booked"}</span></div></div></div>`).join(""); }
function renderEmptyBooking(){ bookingContainer.innerHTML=`<div class="col-12 text-center py-5 mt-5"><div class="mb-3"><img src="../img/icone-booking.svg" style="width:120px;"></div><h2 class="fw-bold" style="color:#FFC107;">No bookings yet.</h2></div>`; }
function renderEmptyMessages(){ if(messagesContainer) messagesContainer.innerHTML=`<div class="text-center mt-5"><h4 class="text-warning mt-3">No messages yet.</h4></div>`; }
fetchBookings();
