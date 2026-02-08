import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, Ban, Eye, Clock, Globe,
  CheckCircle2, XCircle, RefreshCw, Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  ip_address: string | null;
  endpoint: string | null;
  reason: string | null;
  blocked: boolean | null;
  created_at: string;
  resolved_at: string | null;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  is_permanent: boolean | null;
  block_count: number | null;
}

const AdminSecurityTab = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"events" | "blocked">("events");
  const [newBlockIP, setNewBlockIP] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: projectId } = await supabase.rpc("get_project_id_by_slug", { slug_param: "baloria" });
      if (!projectId) return;

      const [eventsRes, blockedRes] = await Promise.all([
        supabase.from("security_events").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(50),
        supabase.from("blocked_ips").select("*").order("blocked_at", { ascending: false }).limit(50),
      ]);

      setEvents(eventsRes.data ?? []);
      setBlockedIPs(blockedRes.data ?? []);
    } catch (err) {
      console.error("Security fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockIP = async () => {
    if (!newBlockIP.trim() || !newBlockReason.trim()) {
      toast.error("Vul IP-adres en reden in");
      return;
    }
    try {
      await supabase.from("blocked_ips").insert({
        ip_address: newBlockIP.trim(),
        reason: newBlockReason.trim(),
        is_permanent: true,
      });
      toast.success("IP geblokkeerd");
      setNewBlockIP("");
      setNewBlockReason("");
      fetchData();
    } catch {
      toast.error("Kon IP niet blokkeren");
    }
  };

  const handleUnblockIP = async (id: string) => {
    try {
      await supabase.from("blocked_ips").delete().eq("id", id);
      setBlockedIPs((prev) => prev.filter((b) => b.id !== id));
      toast.success("IP gedeblokkeerd");
    } catch {
      toast.error("Kon IP niet deblokkeren");
    }
  };

  const handleResolveEvent = async (id: string) => {
    try {
      await supabase.from("security_events").update({ resolved_at: new Date().toISOString() }).eq("id", id);
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, resolved_at: new Date().toISOString() } : e)));
      toast.success("Event opgelost");
    } catch {
      toast.error("Kon event niet oplossen");
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "critical": return { bg: "#EF444420", color: "#EF4444" };
      case "high": return { bg: "#F59E0B20", color: "#F59E0B" };
      case "medium": return { bg: "#3B82F620", color: "#3B82F6" };
      default: return { bg: "#64748B20", color: "#64748B" };
    }
  };

  return (
    <>
      {/* Sub tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "events" as const, label: "Security Events", icon: AlertTriangle, count: events.filter((e) => !e.resolved_at).length },
          { id: "blocked" as const, label: "Geblokkeerde IPs", icon: Ban, count: blockedIPs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
            style={{
              background: activeSubTab === tab.id ? "#4D96FF15" : "#1E293B",
              color: activeSubTab === tab.id ? "#4D96FF" : "#94A3B8",
              border: `1px solid ${activeSubTab === tab.id ? "#4D96FF30" : "hsla(215, 25%, 22%, 0.5)"}`,
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "#EF444420", color: "#EF4444" }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
        <Button onClick={fetchData} variant="ghost" size="sm" className="ml-auto gap-1.5" style={{ color: "#64748B" }}>
          <RefreshCw className="w-3.5 h-3.5" /> Vernieuwen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Open Events", value: events.filter((e) => !e.resolved_at).length, color: "#EF4444", icon: AlertTriangle },
          { label: "Geblokkeerd", value: events.filter((e) => e.blocked).length, color: "#F59E0B", icon: Shield },
          { label: "Blocked IPs", value: blockedIPs.length, color: "#9D4EDD", icon: Ban },
          { label: "Opgelost", value: events.filter((e) => e.resolved_at).length, color: "#10B981", icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}20` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: "#64748B" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center" style={{ color: "#64748B" }}>Laden...</div>
      ) : activeSubTab === "events" ? (
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
              <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: "#10B981" }} />
              <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Geen security events</p>
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>Alles ziet er veilig uit!</p>
            </div>
          ) : (
            events.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-xl p-4 flex items-start gap-4"
                style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: getSeverityStyle(e.severity).bg }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: getSeverityStyle(e.severity).color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{e.event_type}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={getSeverityStyle(e.severity)}>
                      {e.severity}
                    </span>
                    {e.blocked && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#EF444420", color: "#EF4444" }}>
                        Geblokkeerd
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "#94A3B8" }}>{e.reason ?? "Geen details"}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: "#475569" }}>
                    {e.ip_address && (
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{e.ip_address}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(e.created_at).toLocaleString("nl-NL")}</span>
                  </div>
                </div>
                {!e.resolved_at && (
                  <Button onClick={() => handleResolveEvent(e.id)} size="sm" variant="ghost" className="shrink-0 text-xs" style={{ color: "#10B981" }}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Oplossen
                  </Button>
                )}
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Add block form */}
          <div className="rounded-xl p-4" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
            <p className="text-sm font-semibold mb-3" style={{ color: "#F1F5F9" }}>
              <Lock className="w-4 h-4 inline mr-2" style={{ color: "#EF4444" }} />
              IP Blokkeren
            </p>
            <div className="flex gap-3">
              <input
                value={newBlockIP}
                onChange={(e) => setNewBlockIP(e.target.value)}
                placeholder="IP-adres (bijv. 192.168.1.1)"
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "#0F172A", color: "#F1F5F9", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
              />
              <input
                value={newBlockReason}
                onChange={(e) => setNewBlockReason(e.target.value)}
                placeholder="Reden"
                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                style={{ background: "#0F172A", color: "#F1F5F9", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
              />
              <Button onClick={handleBlockIP} size="sm" className="bg-red-500 hover:bg-red-600 gap-1.5">
                <Ban className="w-3.5 h-3.5" /> Blokkeren
              </Button>
            </div>
          </div>

          {/* Blocked list */}
          {blockedIPs.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#10B981" }} />
              <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Geen geblokkeerde IPs</p>
            </div>
          ) : (
            blockedIPs.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EF444420" }}>
                  <Ban className="w-4 h-4" style={{ color: "#EF4444" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-mono font-medium" style={{ color: "#F1F5F9" }}>{b.ip_address}</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>{b.reason}</p>
                  <p className="text-[11px] mt-1" style={{ color: "#475569" }}>
                    Geblokkeerd: {new Date(b.blocked_at).toLocaleString("nl-NL")}
                    {b.is_permanent && " · Permanent"}
                    {b.block_count && b.block_count > 1 && ` · ${b.block_count}x`}
                  </p>
                </div>
                <Button onClick={() => handleUnblockIP(b.id)} size="sm" variant="ghost" className="text-xs" style={{ color: "#10B981" }}>
                  Deblokkeren
                </Button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default AdminSecurityTab;
