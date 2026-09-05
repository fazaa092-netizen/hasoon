# Project TODO

- [x] نقل صفحات الواجهة الأمامية (Home, Memberships, Benefits, Register, Address, Payment, BankAuth, Otp, Pin, Review, Success, Rejected, Admin)
- [x] نقل المكونات المخصصة (Header, Footer, SiteLayout, DashboardLayout, MembershipCard, CategoryIcons, GalleryStudio, WaitingScreen, Map, AIChatBox)
- [x] نقل نظام الطلبات الحية (liveOrders) مع جميع حقول قاعدة البيانات
- [x] تطبيق migrations على قاعدة البيانات (0000-0003 + حقل location)
- [x] نقل خادم tRPC مع مسارات الطلبات (upsert, get, list, direct, remove, detectBank)
- [x] نقل نظام كشف البنك (binLookup) ومنطق التنبيهات (alertLogic)
- [x] نقل السياقات (LanguageContext, OrderContext, ThemeContext)
- [x] نقل ملفات الأنماط (index.css بتصميم العاج الذهبي) والثوابت (shared/types, shared/const, lib/data)
- [x] نقل نظام المزامنة الحية (liveOrders) بين الزائر ولوحة تحكم المشرف
- [x] نقل ملفات الاختبار (vitest) - جميع الاختبارات 27/27 ناجحة
- [x] إصلاح توافق shared/const.ts مع نظام OAuth الجديد (decodeOAuthState)
- [x] إصلاح توافق const.ts (إضافة startLogin + getLoginUrl)
- [x] إصلاح ctx.req.socket?.remoteAddress في routers.ts للاختبارات
- [x] إصلاح ctx.req.socket?.remoteAddress في routers.ts للاختبارات
- [x] إصلاح جميع الصور والشعارات المكسورة في الموقع (رفع 16 صورة أصلية وتحديث المسارات في data.ts و GalleryStudio و CategoryIcons و Payment — جميع الصور الـ19 تعمل بكود 200)
