import { useEffect, useState } from "react";
import {
  Check,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bot,
  Users,
  FileText,
  Video,
  Zap,
  Building2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, RAZORPAY_KEY_ID } from "../config/config";

/* ------------------------------------------------------------------
   Usage Row
   ------------------------------------------------------------------ */
function UsageRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="h-3.5 w-3.5 text-[#71717A] flex-shrink-0" />
        <span className="text-[13px] font-medium text-[#F5F5F5]">{label}</span>
      </div>
      <span className="text-[12px] font-medium text-[#A1A1AA] font-mono">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------
   Plan Card
   ------------------------------------------------------------------ */
function PlanCard({ name, price, sub, features, actionLabel, onAction, isActive, isRecommended, disabled }) {
  return (
    <div
      className={`relative rounded-2xl p-5 flex flex-col gap-5 ${
        isRecommended
          ? "bg-[#101010] border-2 border-[#8B5CF6] shadow-[0_0_30px_rgba(139,92,246,0.12)]"
          : "saas-card"
      }`}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-5 btn-primary rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Recommended
        </div>
      )}

      <div className="space-y-1">
        <h3 className="text-[14px] font-bold text-[#F5F5F5]">{name}</h3>
        <p className="text-[12px] text-[#71717A]">{sub}</p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#F5F5F5] font-mono">{price}</span>
        {price !== "Custom" && (
          <span className="text-[12px] text-[#71717A]">/ month</span>
        )}
      </div>

      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-[12px] text-[#A1A1AA]">
            <Check className="h-3.5 w-3.5 text-[#8B5CF6] flex-shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onAction}
        disabled={disabled || isActive}
        className={`w-full rounded-xl py-2.5 text-[13px] font-semibold transition-all disabled:cursor-not-allowed ${
          isActive
            ? "border border-[rgba(255,255,255,0.08)] bg-[#151515] text-[#71717A] cursor-default"
            : isRecommended
            ? "btn-primary"
            : "btn-secondary"
        }`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------
   Main Component
   ------------------------------------------------------------------ */
function SubscriptionTab() {
  const { user, token } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const isSubActive =
    subscription?.status === "active" ||
    subscription?.status === "authenticated" ||
    user?.isPremium === true;

  const currentPlanName = isSubActive ? "PRO" : "FREE";

  useEffect(() => {
    if (!token) return;
    const fetchSub = async () => {
      try {
        setLoadingSub(true);
        const res = await axios.get(`${API_BASE_URL}/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) setSubscription(res.data.data);
      } catch (err) {
        console.error("Subscription fetch error:", err);
      } finally {
        setLoadingSub(false);
      }
    };
    fetchSub();
  }, [token]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleUpgradePlan = async () => {
    if (!token) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setErrorMsg("Failed to load payment SDK. Please check your internet connection.");
      return;
    }

    setProcessing(true);

    try {
      const createRes = await axios.post(
        `${API_BASE_URL}/subscriptions/create`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const subData = createRes.data?.data;
      const razorpaySubId = subData?.razorpaySubscriptionId;
      if (!razorpaySubId) throw new Error("Razorpay subscription ID not generated");

      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: razorpaySubId,
        name: "MockMate",
        description: "MockMate Pro Monthly Subscription",
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/subscriptions/verify`,
              {
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySubscriptionId: paymentResponse.razorpay_subscription_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (verifyRes.data?.data) {
              setSubscription(verifyRes.data.data);
              setSuccessMsg("Payment verified! Your Pro subscription is now active.");
            }
          } catch (verifyErr) {
            setErrorMsg(verifyErr.response?.data?.message || "Payment verification failed.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: { name: user?.fullName || "", email: user?.email || "" },
        theme: { color: "#8b5cf6" },
        modal: { ondismiss: () => setProcessing(false) },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Subscription creation failed. Please try again.");
      setProcessing(false);
    }
  };

  const usageRows = [
    { label: "AI Interviews", value: isSubActive ? "20 / month" : "2 / month", icon: Bot },
    { label: "Peer Interviews", value: isSubActive ? "Unlimited" : "100 / month", icon: Users },
    { label: "Resume Analysis", value: isSubActive ? "Unlimited" : "1 / month", icon: FileText },
    { label: "Session Recordings", value: isSubActive ? "Unlimited" : "5 stored", icon: Video },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5]">Plan</h1>
          <p className="text-[13px] text-[#A1A1AA] mt-0.5">
            {isSubActive
              ? "You have full access to all Pro features."
              : "You're currently on the Free plan."}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
            isSubActive
              ? "border-[#22C55E]/25 bg-[#22C55E]/08 text-[#22C55E]"
              : "border-[rgba(255,255,255,0.08)] bg-[#101010] text-[#A1A1AA]"
          }`}
        >
          <Crown className="h-3 w-3" />
          {currentPlanName}
        </span>
      </div>

      {/* Feedback Messages */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/08 px-4 py-3 text-[13px] text-[#22C55E]">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/08 px-4 py-3 text-[13px] text-[#EF4444]">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PlanCard
          name="FREE"
          price="$0"
          sub="For getting started"
          features={[
            "2 AI Mock Interviews / mo",
            "Peer 1:1 Video Practice",
            "1 Resume Analysis",
            "Basic Score Reports",
          ]}
          actionLabel={isSubActive ? "Free Tier" : "Current Plan"}
          isActive={!isSubActive}
          disabled
        />
        <PlanCard
          name="PRO"
          price="$29"
          sub="For serious preparation"
          features={[
            "20 AI Mock Interviews / mo",
            "Unlimited Peer Practice",
            "Unlimited Resume Analysis",
            "Detailed Performance Analytics",
            "WhatsApp Notifications",
          ]}
          actionLabel={processing ? "Processing..." : isSubActive ? "Current Plan" : "Upgrade to Pro"}
          onAction={handleUpgradePlan}
          isActive={isSubActive}
          isRecommended
          disabled={processing}
        />
        <PlanCard
          name="ENTERPRISE"
          price="Custom"
          sub="For organizations & teams"
          features={[
            "Custom AI Interview Questions",
            "Team & Cohort Analytics",
            "Dedicated Support & SLA",
          ]}
          actionLabel="Contact Sales"
          onAction={() => window.open("mailto:support@mockmate.com", "_blank")}
        />
      </div>

      {/* Plan Usage */}
      <div className="saas-card rounded-2xl p-6">
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#71717A] mb-4">
          Plan Usage & Limits
        </h3>
        {usageRows.map((row, i) => (
          <UsageRow key={i} icon={row.icon} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

export default SubscriptionTab;
