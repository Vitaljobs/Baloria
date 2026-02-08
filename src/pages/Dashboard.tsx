import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardWorkspace from "@/components/dashboard/DashboardWorkspace";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0F172A" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4D96FF" }} />
      </div>
    );
  }

  if (!user) return null;

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    if (isMobile) setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0F172A" }}>
      {/* Mobile header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 border-b"
          style={{ background: "#0B1120", borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-white/5" style={{ color: "#94A3B8" }}>
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-gradient">BALORIA</h1>
          <div className="w-9" />
        </div>
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-[280px] border-0" style={{ background: "#0B1120" }}>
            <SheetTitle className="sr-only">Navigatie</SheetTitle>
            <DashboardSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              collapsed={false}
              onToggleCollapse={() => { }}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop sidebar */}
      {!isMobile && (
        <DashboardSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <main className={`flex-1 overflow-hidden ${isMobile ? "pt-14" : ""}`}>
        <DashboardWorkspace activeSection={activeSection} onSectionChange={setActiveSection} />
      </main>
    </div>
  );
};

export default Dashboard;
