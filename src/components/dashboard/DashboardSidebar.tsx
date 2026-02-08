import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MessageCircle, Inbox, Users, CircleDot,
  User, Settings, LogOut, ChevronLeft, ChevronRight, Search,
  Crown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const DashboardSidebar = ({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();

  const mainItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ballebak", label: "Ballebak", icon: CircleDot },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "contacten", label: "Contacten", icon: Users },
  ];

  const bottomItems: SidebarItem[] = [
    { id: "profiel", label: "Profiel", icon: User },
    { id: "instellingen", label: "Instellingen", icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const renderItem = (item: SidebarItem) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => onSectionChange(item.id)}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
          ${isActive ? "text-primary-foreground" : "hover:bg-white/5"}`}
        style={{
          color: isActive ? "#F1F5F9" : "#94A3B8",
          background: isActive ? "hsla(217, 91%, 60%, 0.15)" : undefined,
        }}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 rounded-lg"
            style={{ background: "hsla(217, 91%, 60%, 0.12)", border: "1px solid hsla(217, 91%, 60%, 0.2)" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Icon className="w-5 h-5 shrink-0 relative z-10" />
        {!collapsed && (
          <span className="relative z-10 truncate">{item.label}</span>
        )}
        {!collapsed && item.badge && item.badge > 0 && (
          <span
            className="relative z-10 ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
            style={{ background: "#4D96FF", color: "#fff" }}
          >
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex h-full flex-col border-r"
      style={{ background: "#0B1120", borderColor: "hsla(215, 25%, 22%, 0.5)" }}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        {!collapsed && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display text-lg font-bold text-gradient"
          >
            BALORIA
          </motion.h1>
        )}
        <button
          onClick={onToggleCollapse}
          className="rounded-lg p-1.5 transition-colors hover:bg-white/5"
          style={{ color: "#64748B" }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="mx-3 mb-3">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
            style={{ background: "#1E293B", color: "#64748B" }}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Zoeken...</span>
            <kbd className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-mono" style={{ background: "#0F172A" }}>
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        <p className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${collapsed ? "text-center" : "px-3"}`} style={{ color: "#475569" }}>
          {collapsed ? "•" : "Menu"}
        </p>
        {mainItems.map(renderItem)}
        {isAdmin && renderItem({ id: "admin", label: "Admin", icon: Crown })}
      </nav>

      {/* Bottom nav */}
      <div className="border-t px-3 py-3 space-y-1" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
        {bottomItems.map(renderItem)}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 w-full"
          style={{ color: "#EF4444" }}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Uitloggen</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;
