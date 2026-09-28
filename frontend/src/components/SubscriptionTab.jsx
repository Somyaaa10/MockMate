import { useEffect, useState } from "react";
import { Bot, Building2, FileText, Video, Users } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL, RAZORPAY_KEY_ID } from "../config/config";
import { Alert, Card, Section } from "./dashboard/DashboardPrimitives";
import {
  CurrentPlanBanner,
  PlanFeatureTile,
  PricingCard,
  PricingCardSkeleton,
} from "./dashboard/PricingCard";

const TILE_ACCENT = {
  Bot: "#60A5FA",
  Users: "#34D399",
  FileText: "#C084FC",
  Video: "#FBBF24",
};

const TILE_TINT = {
  Bot: "rgba(59,130,246,0.12)",
  Users: "rgba(16,185,129,0.12)",
  FileText: "rgba(168,85,247,0.12)",
  Video: "rgba(245,158,11,0.12)",
};

function SubscriptionTab() {
  const { user, token, refreshUser } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [quota, setQuota] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const isSubActive =
    subscription?.status === "active" ||
    subscription?.status === "authenticated" ||
    user?.isPremium === true ||
    quota?.isPremium === true;

  const currentPlanName = isSubActive ? "PRO" : "FREE";

  /* ---------------- Data Fetching ---------------- */
  useEffect(() => {
    if (!token) return;

    const fetchSub = async () => {
      try {
        setLoadingSub(true);
        const res = await axios.get(`${API_BASE_URL}/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) setSubscription(res.data.data);
      } catch {
        /* Fallback to user.isPremium */
      } finally {
        setLoadingSub(false);
      }
    };

    const fetchQuota = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.data) setQuota(res.data.data);
      } catch {
        /* Fallback */
      }
    };

    fetchSub();
    fetchQuota();
  }, [token]);

  /* ---------------- Razorpay SDK Loader ---------------- */
  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ---------------- Upgrade Handler ---------------- */
  const handleUpgradePlan = async () => {
    if (!token) {
      setErrorMsg("Please log in to upgrade your subscription.");
      return;
    }

    if (isSubActive) {
      setErrorMsg("You already have an active Pro subscription.");
      return;
    }

    if (!RAZORPAY_KEY_ID) {
      setErrorMsg("Payment configuration is unavailable. Please try again later.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setErrorMsg("Failed to load Razorpay payment SDK. Please check your internet connection.");
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
      if (!subData) throw new Error("Could not initialize payment with server.");

      const isOrder = Boolean(subData.razorpayOrderId);
      const targetId = subData.razorpaySubscriptionId || subData.razorpayOrderId;

      if (!targetId) throw new Error("Payment transaction ID missing.");

      const options = {
        key: RAZORPAY_KEY_ID,
        ...(isOrder
          ? { order_id: subData.razorpayOrderId, amount: subData.amount || 290000, currency: subData.currency || "INR" }
          : { subscription_id: subData.razorpaySubscriptionId }),
        name: "MockMate",
        description: "MockMate Pro Plan Subscription",
        handler: async (paymentResponse) => {
          try {
            const verifyRes = await axios.post(
              `${API_BASE_URL}/subscriptions/verify`,
              {
                razorpayPaymentId: paymentResponse.razorpay_payment_id,
                razorpaySubscriptionId: paymentResponse.razorpay_subscription_id,
                razorpayOrderId: paymentResponse.razorpay_order_id,
                razorpaySignature: paymentResponse.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data?.data) {
              setSubscription(verifyRes.data.data);
              setQuota((prev) => ({ ...prev, isPremium: true, plan: "PRO", aiInterviewsLimit: 20 }));
              if (typeof refreshUser === "function") {
                await refreshUser();
              }
              setSuccessMsg("Payment verified! Your Pro subscription is now active.");
            }
          } catch (err) {
            setErrorMsg(err.response?.data?.message || "Payment verification failed. Please contact support.");
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: { color: "#ec4899" },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            setErrorMsg("Payment checkout was cancelled.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response) {
        setProcessing(false);
        setErrorMsg(response?.error?.description || "Payment failed. Please try again.");
      });

      razorpayInstance.open();
    } catch (err) {
      setProcessing(false);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to create payment session. Please try again.");
    }
  };

  /* ---------------- Dynamic Plan Figures ---------------- */
  const aiLimit = quota?.aiInterviewsLimit ?? (isSubActive ? 1000 : 2);
  const aiUsed = quota?.aiInterviewsUsed ?? 0;

  const planFeatures = [
    {
      icon: Bot,
      accent: TILE_ACCENT.Bot,
      name: "AI Interview",
      quota: isSubActive ? "Unlimited" : aiLimit,
      used: aiUsed,
      unlimited: isSubActive,
    },
    {
      icon: Users,
      accent: TILE_ACCENT.Users,
      name: "One To One Interview",
      quota: "Unlimited",
      used: null,
      unlimited: true,
    },
    {
      icon: FileText,
      accent: TILE_ACCENT.FileText,
      name: "Resume Analyzer",
      quota: isSubActive ? "Unlimited" : 1,
      used: null,
      unlimited: isSubActive,
    },
  ];

  let expiryFormatted = "";
  if (isSubActive && subscription?.currentEnd) {
    const endDate = new Date(subscription.currentEnd);
    expiryFormatted = ` · Active until ${endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* ── Current subscription ── */}
      <CurrentPlanBanner
        planName={currentPlanName}
        isPremium={isSubActive}
        description={
          isSubActive ? (
            <>You have full access to all Pro features.{expiryFormatted}</>
          ) : (
            <>
              You are currently on the{" "}
              <span className="mm-grad-text font-bold">FREE</span> plan
            </>
          )
        }
      />

      {/* Feedback */}
      {successMsg && (
        <Alert tone="success" onDismiss={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert tone="error" onDismiss={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* ── Choose your plan ── */}
      <Section title="Choose Your Plan">
        {loadingSub ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PricingCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <PricingCard
              name="FREE"
              price="$0"
              tagline="Perfect for getting started"
              features={[
                `${aiLimit} AI mock interviews / month`,
                "Peer 1:1 video practice",
                "1 resume analysis",
                "Basic score reports",
              ]}
              actionLabel={isSubActive ? "Free Tier" : "Current Plan"}
              isCurrent={!isSubActive}
              disabled
            />

            <PricingCard
              name="PRO"
              price="$29"
              tagline="For professionals and growing teams"
              features={[
                "1,000 AI mock interviews / month",
                "Unlimited peer practice",
                "Unlimited resume analysis",
                "Detailed performance analytics",
                "WhatsApp notifications",
              ]}
              actionLabel={
                processing
                  ? "Processing…"
                  : isSubActive
                  ? "Current Plan"
                  : "Upgrade to Pro"
              }
              onAction={handleUpgradePlan}
              isCurrent={isSubActive}
              isFeatured
              disabled={processing || isSubActive}
              loadingAction={processing}
            />

            <PricingCard
              name="ENTERPRISE"
              price="Custom"
              tagline="Advanced features for large organizations"
              features={[
                "Custom AI interview questions",
                "Team & cohort analytics",
                "Dedicated support & SLA",
              ]}
              actionLabel="Contact Sales"
              onAction={() => window.open("mailto:support@mockmate.com", "_blank")}
            />
          </div>
        )}
      </Section>

      {/* ── Plan features ── */}
      <Section title="Plan Features">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planFeatures.map((f) => (
            <PlanFeatureTile
              key={f.name}
              name={f.name}
              quota={f.quota}
              unlimited={f.unlimited}
            />
          ))}
        </div>
      </Section>

      {/* ── Notes ── */}
      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="mm-icon-tile h-10 w-10 shrink-0"
              style={{
                color: "#FBBF24",
                backgroundColor: TILE_TINT.Building2,
                borderColor: "rgba(245,158,11,0.28)",
              }}
              aria-hidden="true"
            >
              <Building2 className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-[var(--mm-text)]">
                Need a custom plan?
              </p>
              <p className="mt-0.5 text-[12px] text-[var(--mm-text-3)]">
                We tailor interview tracks and analytics for larger teams.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.open("mailto:support@mockmate.com", "_blank")}
            className="mm-btn mm-btn-ghost shrink-0 px-4 py-2.5 text-[12.5px]"
          >
            Contact Sales
          </button>
        </div>
      </Card>
    </div>
  );
}

export default SubscriptionTab;
