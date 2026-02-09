# 🌐 Homunity Frontend Starter Kit

---

### 📝 وصف المشروع
بيئة عمل احترافية لتطوير واجهات المستخدم باستخدام **HTML, CSS, JavaScript و Bootstrap** — مصممة خصيصًا لتسهيل التعاون داخل فريق **Homunity**.

#### 🎯 الأهداف الأساسية:
- [x] **توحيد** طريقة العمل داخل الفريق.
- [x] **تسريع** بدء أي مشروع جديد.
- [x] **تقليل الأخطاء** الناتجة عن العشوائية في تنظيم الملفات.
- [x] **تسهيل الفهم** لأي مطور جديد ينضم للمشروع.

---

### 📁 هيكل المشروع (Project Structure)

```bash
📦 project-root
│
├── .vscode/                # ⚙️ إعدادات بيئة العمل
├── css/
│   ├── bootstrap.min.css   # 🟦 مكتبة Bootstrap الرسمية
│   ├── all.min.css         # 🚩 Font Awesome Icons
│   ├── normalize.css       # 📏 توحيد العرض بين المتصفحات
│   └── main.css            # 🎨 ملف التصميم الأساسي (نشتغل عليه فقط)
├── html/                   # ➕ اي صفحات جديده هتتنشي هنا       
│   └── form.html           # 📄 صفحات إضافية
├── img/
│   ├── screenshots/        # 📸 صور الشرح للـ README
│   └── ...                 # 🖼️ باقي الصور
├── js/
│   ├── bootstrap.bundle.js # ⚡ جافاسكربت Bootstrap
│   └── index.js            # 🧠 كود المشروع الخاص
├── webfonts/              # 🔡 خطوط Font Awesome
├── index.html             # 🏠 الصفحة الرئيسية
└── README.md              # 📝 هذا الملف

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



