import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardNavigation from "../components/dashboard/DashboardNavigation";

import "../components/dashboard/dashboard.css";

const OverviewTab = lazy(() => import("../components/OverviewTab"));
const ProfileTab = lazy(() => import("../components/ProfileTab"));
const SubscriptionTab = lazy(() => import("../components/SubscriptionTab"));
const ReportTab = lazy(() => import("../components/ReportTab"));
const AnalyticsTab = lazy(() => import("../components/AnalyticsTab"));
const PeerTab = lazy(() => import("../components/PeerTab"));
const ResumeTab = lazy(() => import("../components/ResumeTab"));

/* ------------------------------------------------------------------
   Dashboard shell: sticky header → navigation pill → active panel.
   `interview` is a route, not a tab, so it navigates away.
   ------------------------------------------------------------------ */
const ROUTE_TABS = new Set(["interview"]);

function DashboardTabLoading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-sm font-medium text-[var(--text-secondary)]">
        Loading...
      </div>
    </div>
  );
}

function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const handleTabChange = (tabId) => {
    if (ROUTE_TABS.has(tabId)) {
      navigate("/interview/new");
      return;
    }

    setActiveTab(tabId);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;

      case "plan":
        return <SubscriptionTab />;

      case "reports":
        return <ReportTab />;

      case "analytics":
        return (
          <AnalyticsTab
            onNavigateSetup={() => navigate("/interview/new")}
          />
        );

      case "peer":
        return <PeerTab />;

      case "resume":
        return <ResumeTab />;

      case "overview":
      default:
        return <OverviewTab onSwitchTab={handleTabChange} />;
    }
  };

  return (
    <div className="mm-dash min-h-screen text-[var(--text-primary)] selection:bg-orange-500/30 selection:text-white">
      <DashboardHeader
        onOpenSettings={() => handleTabChange("profile")}
      />

      <DashboardNavigation
        activeTab={activeTab}
        onSelect={handleTabChange}
      />

      <main
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={-1}
        className="mx-auto w-full max-w-[1340px] flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-8"
      >
        <div key={activeTab} className="page-enter">
          <Suspense fallback={<DashboardTabLoading />}>
            {renderActiveTab()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;