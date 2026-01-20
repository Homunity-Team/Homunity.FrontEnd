🌐 Homunity Frontend Starter Kit

بيئة عمل احترافية لتطوير واجهات المستخدم باستخدام HTML, CSS, JavaScript و Bootstrap — مصممة خصيصًا لتسهيل التعاون داخل فريق Homunity.

📌 نظرة عامة على المشروع

هذا المشروع يمثل قالب جاهز (Starter Template) لبناء واجهات Frontend منظمة وقابلة للتوسع، مع فصل واضح للملفات والمجلدات لتسهيل الصيانة والعمل الجماعي.

الهدف الأساسي:

توحيد طريقة العمل داخل الفريق

تسريع بدء أي مشروع جديد

تقليل الأخطاء الناتجة عن العشوائية في تنظيم الملفات

جعل أي مطور جديد يفهم المشروع بسرع

📁 هيكل المشروع

📦 project-root
│
├── .vscode/                → إعدادات بيئة العمل
│
├── css/
│   ├── bootstrap.min.css   → مكتبة Bootstrap الرسمية
│   ├── all.min.css         → Font Awesome Icons
│   ├── normalize.css       → توحيد العرض بين المتصفحات
│   └── main.css            → ملف التصميم الأساسي (نشتغل عليه فقط)
│
├── html/
│   └── form.html           → صفحات إضافية
│
├── img/
│   ├── screenshots/        → صور الشرح للـ README
│   └── باقي الصور
│
├── js/
│   ├── bootstrap.bundle.min.js → جافاسكربت Bootstrap
│   └── index.js                 → كود المشروع الخاص
│
├── webfonts/              → خطوط Font Awesome
│
├── index.html             → الصفحة الرئيسية
└── README.md              → هذا الملف

⚙️ طريقة التشغيل محليًا

افتح المشروع في VS Code

ثبت إضافة Live Server

افتح index.html

اضغط Right Click → Open with Live Server

أو افتح الملف مباشرة في المتصفح.

🧠 قواعد العمل داخل الفريق

✅ المسموح التعديل عليه:

css/main.css

js/index.js

أي ملف داخل html/

❌ يمنع التعديل على:

bootstrap.min.css

bootstrap.bundle.min.js

all.min.css
إلا بعد الرجوع للفريق

🧱 أفضل الممارسات داخل الكود

استخدم أسماء واضحة للكلاسات:

.user-card {}
.main-navbar {}
.login-form {}

قسم الكود داخل main.css:

/* ========== Layout ========== */
/* ========== Components ======= */
/* ========== Pages ============ */

أي Function جديدة في JS يجب توثيقها:

/**
 * Handle login form submit
 */
function handleLogin() {}

🔄 Git Workflow المعتمد للفريق

📌 الفكرة الأساسية:

لا أحد يعمل مباشرة على main

كل شخص يعمل على فرع خاص به

الدمج يتم عن طريق Pull Request فقط

🧭 خطوات العمل اليومية

1. أخذ نسخة من آخر تحديث

git pull origin main

2. إنشاء فرع جديد باسم واضح

git checkout -b feature/navbar

أمثلة:

feature/login-page

fix/button-style

update/home-layout

3. بعد الانتهاء من الشغل

git add .
git commit -m "Add responsive navbar"
git push origin feature/navbar

4. فتح Pull Request على GitHub

اختار الفرع بتاعك

قارن مع main

اكتب شرح واضح للتعديلات

✅ قواعد كتابة Commit Message

صيغة احترافية:

نوع التغيير: وصف مختصر

أمثلة:

feat: add login page UI

fix: resolve navbar responsive issue

style: improve button hover effect

refactor: organize CSS structure

🚀 التقنيات المستخدمة

HTML5

CSS3

JavaScript (Vanilla)

Bootstrap 5

Font Awesome

Git & GitHub

👥 الفريق

هذا المشروع يتم تطويره بواسطة:
Homunity Team

أي مساهمة يجب أن تمر عبر Pull Request.

📌 ملاحظات مهمة

أي Feature جديدة يجب توثيقها في README

أي صفحة جديدة يجب إضافة Screenshot لها

الالتزام بالهيكل يسهّل الصيانة والتطوير

🔥 هذا المشروع مصمم ليكون أساس قوي لأي مشروع Frontend احترافي داخل الفريق.

