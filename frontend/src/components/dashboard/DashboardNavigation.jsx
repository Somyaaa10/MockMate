import { Crown, Edit2, FileText, User } from "lucide-react";
import { cx } from "./cx";

/* ------------------------------------------------------------------
   Primary tabs — Overview, Profile, Plan, Reports
   ------------------------------------------------------------------ */
const PRIMARY_TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "profile", label: "Profile", icon: Edit2 },
  { id: "plan", label: "Plan", icon: Crown },
  { id: "reports", label: "Reports", icon: FileText },
];

/* ------------------------------------------------------------------
   Centered navigation pill.
   Horizontally scrollable on small screens.
   ------------------------------------------------------------------ */
function DashboardNavigation({ activeTab, onSelect }) {
  return (
    <div className="border-b border-[var(--mm-border)] bg-[var(--mm-bg)]">
      <div className="mx-auto w-full max-w-[1340px] px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Primary pill */}
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="Dashboard sections"
            className="mm-nav-pill mm-scroll-x max-w-full"
          >
            {PRIMARY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => onSelect(tab.id)}
                  className={cx("mm-nav-item", isActive && "mm-nav-item-active")}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardNavigation;

