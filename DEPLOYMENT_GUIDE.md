# دليل النشر والاستضافة السحابية لمنظومة GPSWOX (Production 24/7)

تم إعداد المشروع بكافة ملفات الإنتاج السحابية ليعمل كمنظومة مستقلة بالكامل متضمنة الواجهة، الخادم الخلفي، وبوابات اتصالات أجهزة التتبع، وقاعدة بيانات PostgreSQL.

---

## 🚀 الطريقة الأولى: النشر بأمر واحد عبر Docker Compose (الخيار الأفضل للـ VPS)

هذه الطريقة مثالية عند استئجار سيرفر افتراضي VPS (مثل **Hetzner** بقيمة 4.5€ شهرياً أو **Contabo** أو **DigitalOcean**).

### 1. المتطلبات على السيرفر:
تثبيت Docker و Docker Compose على سيرفر Ubuntu:
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### 2. رفع كود المشروع إلى السيرفر:
يمكنك رفع المشروع عبر Git:
```bash
git clone <رابط_مستودعك_على_GitHub>
cd clone
```

### 3. تشغيل المنظومة بالكامل:
نفّذ أمراً واحداً فقط:
```bash
docker compose up -d --build
```

**ما الذي يحدث الآن؟**
- يتم تشغيل حاوية قاعدة بيانات PostgreSQL 17 وتهيئة الجداول وحسابات الديمو تلقائياً.
- يتم عمل Build للواجهة الأمامية وتشغيل الخادم الخلفي على المنفذ `3001`.
- تصبح المنظومة متاحة فوراً عبر المتصفح: `http://<IP_السيرفر>:3001`

---

## 🌐 الطريقة الثانية: النشر المجاني/السريع عبر منصة سحابية (Railway.app / Render)

إذا لم تكن ترغب في إدارة سيرفر Linux بنفسك:

### 1. النشر على [Railway.app](https://railway.app):
1. سجّل دخولك إلى Railway عبر حساب GitHub.
2. انقر على **New Project** ثم اختر **Provision PostgreSQL**.
3. أضف خدمة جديدة **GitHub Repo** واختر مستودع هذا المشروع.
4. اربط المتغير `DATABASE_URL` الخاص بخدمة الـ Postgres بالـ App.
5. سيقوم Railway بتشغيل المنظومة تلقائياً وإعطائك رابط دومين HTTPS دائم ومجاني.

---

## 📱 كيف يجرب الزبائن المنظومة كأجهزة تتبع حية (Live GPS Tracking)؟

يمكنك أنت أو زبائنك تحويل أي هاتف ذكي (Android أو iPhone) إلى جهاز تتبع حقيقي يرسل إحداثياته وسرعته مباشرة إلى المنظومة:

1. حمّل تطبيق **Traccar Client** (مجاني من Google Play أو App Store).
2. افتح إعدادات التطبيق في الهاتف:
   - **معرّف الجهاز (Device Identifier):** أدخل رقم IMEI الموجود في المنظومة (مثال: `864201049281745`).
   - **عنوان الخادم (Server URL):**
     `http://<IP_السيرفر_أو_الدومين>:5055`
   - **فترة التحديث (Frequency):** 5 ثوانٍ.
3. فعّل مفتاح **Status / تشغيل الخدمة**.
4. افتح شاشة المنظومة: ستشاهد المركبة تتحرك وتحدّث موقعها وسرعتها ومسارها على الخريطة في الوقت الفعلي!

---

## 🔒 تأمين الدومين بشهادة SSL (HTTPS) عبر Nginx (للـ VPS)

1. تم إنشاء ملف الإعداد الجاهز في: `nginx/gpswox.conf`.
2. انسخ الملف إلى إعدادات Nginx في السيرفر:
   ```bash
   sudo cp nginx/gpswox.conf /etc/nginx/sites-available/gpswox.conf
   sudo ln -s /etc/nginx/sites-available/gpswox.conf /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
3. ثبّت شهادة SSL مجانية بنقرة واحدة عبر Certbot:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d demo.yourdomain.com
   ```
