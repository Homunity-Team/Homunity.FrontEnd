توثيق ميزة حذف العقار 
يهدف هذا الفصل إلى توثيق آلية حذف العقارات داخل لوحة تحكم المالك في مشروع Homunity، مع شرح بنية نافذة التأكيد، وتسلسل التنفيذ، وطريقة التواصل مع واجهة برمجة التطبيقات (API).
تم تصميم هذه الميزة لضمان عدم حذف أي عقار بشكل غير مقصود، وذلك من خلال نافذة تأكيد تعرض معلومات العقار وتحذيرًا بشأن البيانات المرتبطة به قبل تنفيذ عملية الحذف.

1. التقنيات المستخدمة
تم الاعتماد على التقنيات التالية لتنفيذ الميزة:
SweetAlert2: لعرض رسائل النجاح أو الخطأ.
RESTful API: لتنفيذ عملية الحذف على مستوى الخادم.

2. بنية الميزة
تعتمد ميزة حذف العقار على عنصرين أساسيين:
2.1 بطاقات العقارات (Property Cards)
يتم عرض كل عقار داخل بطاقة تحتوي على زر حذف.
 يحمل زر الحذف مجموعة من الخصائص المخصصة (data attributes)، مثل:
data-id: معرف العقار
data-title: عنوان العقار
data-location: موقع العقار
data-img: صورة العقار
تُستخدم هذه البيانات لملء محتوى نافذة التأكيد قبل عرضها للمستخدم.
2.2 نافذة التأكيد (Delete Confirmation Modal)
تظهر النافذة عند الضغط على زر الحذف، وتحتوي على:
صورة العقار
عنوان العقار
موقع العقار
رسالة تحذير بعدد الحجوزات المرتبطة
رسالة تحذير بعدد الرسائل المرتبطة
زر "Delete"
زر "Cancel"
زر إغلاق (×)
طبقة Overlay لتعطيل التفاعل مع باقي الصفحة

3. آلية عرض نافذة التأكيد
عند الضغط على زر الحذف، يتم تنفيذ الخطوات التالية:
منع السلوك الافتراضي للرابط.
قراءة بيانات العقار من خصائص data-id.
تعبئة عناصر نافذة التأكيد بالبيانات المستخرجة.
إظهار طبقة Overlay والنافذة المنبثقة.
مثال على الكود المستخدم:
trigger.addEventListener('click', (e) => {
    e.preventDefault();

    propertyIdToDelete = trigger.dataset.id;
    modalTitle.innerText = trigger.dataset.title;
    modalLocation.innerText = trigger.dataset.location;
    modalImg.src = trigger.dataset.img;

    overlay.style.display = 'flex';
});


2. Owner Dashboard Page
تعتبر هذه الصفحة هي لوحة التحكم الخاصة بمالك العقارات، حيث تمكنه من إدارة وحداته السكنية ومتابعة حالتها وطلبات الحجز بشكل مركزي.

#1. Overview (نظرة عامة)
الهدف من الصفحة: توفير واجهة مستخدم شاملة لمالك العقار لمراقبة إحصائيات عقاراته (المقبولة، المرفوضة، وتحت المراجعة) وإدارة الطلبات الجديدة.

المستخدم المستهدف: مالك العقار (Property Owner).

#2. UI Elements (عناصر واجهة المستخدم)
تنقسم الصفحة إلى ثلاثة أجزاء رئيسية:

Sidebar (الشريط الجانبي): يحتوي على روابط التنقل الأساسية (Properties, Add Property, Messages, Settings, Booking Request) وزر تسجيل الخروج.

Stats Cards (كروت الإحصائيات):

Total Properties: إجمالي عدد العقارات المضافة.

Properties Status: تفصيل لحالة العقارات (Approved / Rejected).

Booking: حالة الحجوزات (In Progress / Booked).

Property List (قائمة العقارات): عرض أفقي (Horizontal Cards) للعقارات يحتوي على:

صورة العقار، العنوان، والسعر الشهري.

Badge Status: يوضح حالة العقار (In Progress, Approved, Rejected).

Action Buttons: أزرار لعرض تفاصيل الحجز أو تفاصيل العقار.

#3. Logic & Flow (الكواليس وسير العمل)
Navigation: عند الضغط على أي عنصر في الـ Sidebar، يتم توجيه المستخدم للقسم المطلوب (مثل صفحة إضافة عقار جديد).

Dynamic Badges: تظهر الحالات المختلفة للعقارات (Approved, Rejected, In Progress) بستايل موحد يعتمد على ألوان الهوية البصرية (Gold & Blue)، مع تخصيص كلاسات منفصلة لكل حالة لسهولة تغيير الألوان برمجياً لاحقاً عند ربطها بقواعد البيانات.
Stats Updates: يتم عرض الأرقام المسجلة في الـ IDs التالية: total-props, approved-count, rejected-count لجعل الأرقام سهلة التحديث برمجياً.

#4. Technical Specifications (المواصفات التقنية)
Layout: تم استخدام Flexbox و Grid لتنظيم لوحة التحكم لضمان استجابتها مع الشاشات المختلفة.

External Files:

bootstrap.min.css: للتنسيقات الجاهزة والـ Grid System.

main.css: للتنسيقات المخصصة للألوان والـ Sidebar.

all.min.css: لمكتبة FontAwesome الخاصة بالأيقونات.

JavaScript: يعتمد الملف على index.js للتحكم في عرض البيانات والديناميكية.

#5. Notes (ملاحظات)
الصفحة مصممة لتكون Sticky Sidebar بحيث تظل قائمة التنقل ثابتة أثناء التمرير في قائمة العقارات الطويلة.

يتم استخدام الـ Local Storage (مستقبلاً) لجلب بيانات المالك المسجل لعرض إحصائياته الخاصة فقط.

4. تنفيذ عملية الحذف
عند ضغط المستخدم على زر "Delete"، يتم تنفيذ التسلسل التالي:
التحقق من وجود معرف العقار.
تعطيل زر الحذف لمنع الضغط المتكرر.
تغيير نص الزر إلى "Deleting..." للإشارة إلى بدء العملية.
إرسال طلب DELETE إلى واجهة البرمجة.
معالجة الاستجابة القادمة من الخادم.
في حالة نجاح الطلب:
عرض رسالة نجاح باستخدام SweetAlert.
إغلاق النافذة المنبثقة.
إزالة بطاقة العقار من الصفحة.
تحديث إجمالي عدد العقارات المعروضة.
في حالة فشل الطلب:
عرض رسالة خطأ.
إعادة تفعيل زر الحذف.
الكود المستخدم لتنفيذ الطلب:
deleteBtn.addEventListener('click', async () => {
    if (!propertyIdToDelete) return;

    const apiUrl = `https://homunityapiv1.runasp.net/api/Properties/DeleteProperty?id=${propertyIdToDelete}`;

    deleteBtn.innerText = "Deleting...";
    deleteBtn.disabled = true;

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: { 'accept': '*/*' }
        });

        if (response.ok) {
            closeModal();
            currentDeleteButton.closest('.property-horizontal-card')?.remove();
        } else {
            resetDeleteButton();
        }
    } catch (error) {
        resetDeleteButton();
    }
});

5. التعامل مع واجهة برمجة التطبيقات (API)
تعتمد عملية الحذف على إرسال طلب HTTP من نوع:
DELETE

إلى نقطة النهاية:
/api/Properties/DeleteProperty?id={propertyId}

يقوم الخادم عند استلام الطلب بحذف العقار وجميع البيانات المرتبطة به من قاعدة البيانات.
من الناحية الأمنية، يُفضل في البيئات الإنتاجية إرسال رمز المصادقة (Token) ضمن ترويسة الطلب (Authorization Header) للتحقق من صلاحيات المستخدم.

6. إغلاق النافذة وإعادة تهيئة الحالة
يمكن إغلاق نافذة التأكيد في الحالات التالية:
الضغط على زر الإغلاق (×)
الضغط على زر "Cancel"
الضغط خارج محتوى النافذة (على Overlay)
عند الإغلاق، يتم:
إخفاء النافذة
تصفير معرف العقار
إعادة تفعيل زر الحذف
إعادة النص الافتراضي للزر
الكود المسؤول عن ذلك:
function closeModal() {
    overlay.style.display = 'none';
    propertyIdToDelete = null;
    currentDeleteButton = null;
    deleteBtn.disabled = false;
    deleteBtn.innerText = 'Delete';
}

7. التحقق من الصلاحيات
يجب التأكد من أن:
المستخدم مسجل الدخول.
المستخدم هو مالك العقار المراد حذفه.
ويتم ذلك من خلال التحقق في الخادم (Server-side validation)، وليس فقط في الواجهة الأمامية.

8. التصميم وتجربة المستخدم
تم تصميم نافذة التأكيد بحيث:
تمنع الحذف غير المقصود.
تعرض معلومات واضحة عن العنصر المراد حذفه.
تستخدم رسائل تنبيه بصرية واضحة (نجاح / خطأ).
تمنع الضغط المتكرر عبر تعطيل زر التنفيذ أثناء المعالجة.

## 🏠 Property Details Page

هذه الصفحة مخصصة لعرض تفاصيل الوحدة العقارية بشكل كامل للمالك (Owner)، وتتكون من عدة أقسام رئيسية مصممة باستخدام **Bootstrap 5** و **CSS3**.

### 📋 مكونات الصفحة (Page Sections):

1. **Header & Navigation**:
   - يحتوي على عنوان الصفحة `Property Details`.
   - زر "العودة" (`back-btn`) للرجوع للصفحة الرئيسية بسهولة.

2. **Featured Gallery**:
   - عرض صور الوحدة العقارية بنظام "Gallery" جذاب.
   - صور مصغرة (Thumbnails) أسفل المعرض لسهولة التنقل البصري.

3. **Studio Details Card**:
   - **Info Card (Left)**: تشمل اسم الوحدة، العنوان، الوصف، وقائمة بالتفاصيل (عدد الغرف، المطبخ، الحمام، والسعر).
   - **Amenities Card (Right)**: تعرض الخدمات المتاحة مثل (WiFi, Parking, Gym, AC) مع Check-boxes.

4. **Reservations Table**:
   - جدول يعرض قائمة الأشخاص الذين قاموا بحجز الوحدة.
   - يشمل البيانات التالية: (الاسم، تاريخ الدخول، وحالة الحجز).
   - استخدام `Status Badges` ملونة للتفريق بين الحجز المؤكد (Confirmed) والمعلق (Pending).

---

### 🛠️ التقنيات المستخدمة (Technologies):
* **HTML5**: لهيكلة محتوى الصفحة.
* **CSS3**: لتنسيق العناصر (Custom styles for cards & tables).
* **FontAwesome**: للأيقونات (Location, Diamonds, Circle-left).
* **Bootstrap 5**: لجعل الصفحة متجاوبة (Responsive) وتنسيق الـ Grid System.

---

### 📸 شكل التصميم (Design Layout):
* توزيع العناصر يعتمد على `flexbox` لضمان المحاذاة الصحيحة.
* استخدام `card-body-flex` و `info-card` لإعطاء مظهر عصري ومنظم.

