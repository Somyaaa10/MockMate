import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardNavigation from "../components/dashboard/DashboardNavigation";

import OverviewTab from "../components/OverviewTab";
import ProfileTab from "../components/ProfileTab";
import SubscriptionTab from "../components/SubscriptionTab";
import ReportTab from "../components/ReportTab";
import AnalyticsTab from "../components/AnalyticsTab";
import PeerTab from "../components/PeerTab";
import ResumeTab from "../components/ResumeTab";

import "../components/dashboard/dashboard.css";

/* ------------------------------------------------------------------
   Dashboard shell: sticky header → navigation pill → active panel.
   `interview` is a route, not a tab, so it navigates away.
   ------------------------------------------------------------------ */
const ROUTE_TABS = new Set(["interview"]);

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
        return <AnalyticsTab onNavigateSetup={() => navigate("/interview/new")} />;
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
      <DashboardHeader onOpenSettings={() => handleTabChange("profile")} />

      <DashboardNavigation activeTab={activeTab} onSelect={handleTabChange} />

      <main
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={-1}
        className="mx-auto w-full max-w-[1340px] flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-8"
      >
        <div key={activeTab} className="page-enter">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
