import { useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardHeader from "../components/DashboardHeader";
import OverviewTab from "../components/OverviewTab";
import ProfileTab from "../components/ProfileTab";
import SubscriptionTab from "../components/SubscriptionTab";
import ReportTab from "../components/ReportTab";
import PeerTab from "../components/PeerTab";
import AnalyticsTab from "../components/AnalyticsTab";
import ResumeTab from "../components/ResumeTab";

function UserDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const handleTabChange = (tabId) => {
    if (tabId === "interview") {
      navigate("/interview/new");
      return;
    }
    if (tabId === "peer") {
      setActiveTab("peer");
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
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] selection:bg-purple-500/30 selection:text-white ambient-bg-glow">
      <DashboardHeader activeTab={activeTab} setActiveTab={handleTabChange} />
      <main className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="page-enter">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
