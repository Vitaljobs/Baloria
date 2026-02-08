import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Globe, Flag, Crown, TrendingUp } from "lucide-react";
import AdminUsersTab from "./admin/AdminUsersTab";
import AdminSecurityTab from "./admin/AdminSecurityTab";
import AdminSEOTab from "./admin/AdminSEOTab";
import AdminModerationTab from "./admin/AdminModerationTab";
import AdminAnalyticsTab from "./admin/AdminAnalyticsTab";

const tabs = [
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "users", label: "Gebruikers", icon: Users },
  { id: "security", label: "Security", icon: Shield },
  { id: "seo", label: "SEO", icon: Globe },
  { id: "moderation", label: "Moderatie", icon: Flag },
] as const;

type TabId = typeof tabs[number]["id"];

const AdminSection = () => {
  const [activeTab, setActiveTab] = useState<TabId>("analytics");

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0F172A" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EF444420" }}>
            <Crown className="w-5 h-5" style={{ color: "#EF4444" }} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold" style={{ color: "#F1F5F9" }}>Admin Panel</h1>
            <p className="text-sm" style={{ color: "#64748B" }}>Beheer platform, gebruikers en beveiliging</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all flex-1 justify-center"
            style={{ color: activeTab === tab.id ? "#F1F5F9" : "#64748B" }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="admin-tab-active"
                className="absolute inset-0 rounded-lg"
                style={{ background: "#4D96FF15", border: "1px solid #4D96FF30" }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "analytics" && <AdminAnalyticsTab />}
      {activeTab === "users" && <AdminUsersTab />}
      {activeTab === "security" && <AdminSecurityTab />}
      {activeTab === "seo" && <AdminSEOTab />}
      {activeTab === "moderation" && <AdminModerationTab />}
    </div>
  );
};

export default AdminSection;
