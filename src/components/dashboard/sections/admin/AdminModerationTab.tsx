import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Flag, MessageCircle, Eye, CheckCircle2, XCircle,
  Clock, AlertTriangle, Shield, User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Report {
  id: string;
  reporter_id: string;
  reported_profile_id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  reported_name?: string;
  resolved_by?: string | null;
}

interface FlaggedContent {
  id: string;
  content: string;
  category_id: string;
  sentiment: string | null;
  is_flagged: boolean | null;
  status: string | null;
  created_at: string | null;
}

const AdminModerationTab = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<"reports" | "flagged">("reports");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: projectId } = await supabase.rpc("get_project_id_by_slug", { slug_param: "baloria" });
      if (!projectId) return;

      const [reportsRes, flaggedRes] = await Promise.all([
        supabase.from("profile_reports").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("anonymous_feedback").select("id, content, category_id, sentiment, is_flagged, status, created_at").eq("project_id", projectId).eq("is_flagged", true).order("created_at", { ascending: false }).limit(50),
      ]);

      const rawReports = reportsRes.data ?? [];
      const enrichedReports: Report[] = rawReports.map((r) => ({
        ...r,
        description: r.description ?? null,
        resolved_at: r.resolved_at ?? null,
        resolved_by: r.resolved_by ?? null,
      }));

      if (enrichedReports.length > 0) {
        const profileIds = [...new Set(enrichedReports.map((r) => r.reported_profile_id))];
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, display_name")
          .in("id", profileIds);

        const nameMap = new Map(profiles?.map((p) => [p.id, p.display_name]) ?? []);
        enrichedReports.forEach((r) => {
          r.reported_name = nameMap.get(r.reported_profile_id) ?? "Onbekend";
        });
      }

      setReports(enrichedReports);
      setFlaggedContent(flaggedRes.data ?? []);
    } catch (err) {
      console.error("Moderation fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (id: string, action: "resolved" | "dismissed") => {
    try {
      await supabase
        .from("profile_reports")
        .update({
          status: action,
          resolved_at: new Date().toISOString(),
          resolved_by: user?.id,
        })
        .eq("id", id);

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: action, resolved_at: new Date().toISOString() } : r))
      );
      toast.success(action === "resolved" ? "Melding opgelost" : "Melding afgewezen");
    } catch {
      toast.error("Kon melding niet verwerken");
    }
  };

  const handleUnflagContent = async (id: string) => {
    try {
      await supabase.from("anonymous_feedback").update({ is_flagged: false }).eq("id", id);
      setFlaggedContent((prev) => prev.filter((c) => c.id !== id));
      toast.success("Vlag verwijderd");
    } catch {
      toast.error("Kon vlag niet verwijderen");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      pending: { bg: "#F59E0B20", color: "#F59E0B" },
      resolved: { bg: "#10B98120", color: "#10B981" },
      dismissed: { bg: "#64748B20", color: "#64748B" },
    };
    const s = styles[status] ?? styles.pending;
    return (
      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize" style={s}>
        {status === "pending" ? "In behandeling" : status === "resolved" ? "Opgelost" : "Afgewezen"}
      </span>
    );
  };

  return (
    <>
      {/* Sub tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "reports" as const, label: "Profiel Meldingen", icon: Flag, count: reports.filter((r) => r.status === "pending").length },
          { id: "flagged" as const, label: "Gemarkeerde Content", icon: AlertTriangle, count: flaggedContent.length },
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Open Meldingen", value: reports.filter((r) => r.status === "pending").length, color: "#F59E0B" },
          { label: "Opgelost", value: reports.filter((r) => r.status === "resolved").length, color: "#10B981" },
          { label: "Gemarkeerd", value: flaggedContent.length, color: "#EF4444" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
            <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: "#64748B" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="p-8 text-center" style={{ color: "#64748B" }}>Laden...</div>
      ) : activeSubTab === "reports" ? (
        <div className="space-y-2">
          {reports.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
              <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: "#10B981" }} />
              <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Geen meldingen</p>
              <p className="text-xs mt-1" style={{ color: "#64748B" }}>Alles is rustig!</p>
            </div>
          ) : (
            reports.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl p-4"
                style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#F59E0B20" }}>
                    <Flag className="w-4 h-4" style={{ color: "#F59E0B" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>
                        Melding over: {r.reported_name}
                      </p>
                      {getStatusBadge(r.status)}
                    </div>
                    <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>Reden: {r.reason}</p>
                    {r.description && (
                      <p className="text-xs mt-1" style={{ color: "#64748B" }}>{r.description}</p>
                    )}
                    <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: "#475569" }}>
                      <Clock className="w-3 h-3" /> {new Date(r.created_at).toLocaleString("nl-NL")}
                    </p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <Button onClick={() => handleResolveReport(r.id, "resolved")} size="sm" variant="ghost" className="text-xs" style={{ color: "#10B981" }}>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Oplossen
                      </Button>
                      <Button onClick={() => handleResolveReport(r.id, "dismissed")} size="sm" variant="ghost" className="text-xs" style={{ color: "#64748B" }}>
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Afwijzen
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {flaggedContent.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#10B981" }} />
              <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Geen gemarkeerde content</p>
            </div>
          ) : (
            flaggedContent.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EF444420" }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: "#EF4444" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "#F1F5F9" }}>{c.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: "#475569" }}>
                    {c.sentiment && <span>Sentiment: {c.sentiment}</span>}
                    {c.created_at && <span>{new Date(c.created_at).toLocaleString("nl-NL")}</span>}
                  </div>
                </div>
                <Button onClick={() => handleUnflagContent(c.id)} size="sm" variant="ghost" className="text-xs shrink-0" style={{ color: "#10B981" }}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Goedkeuren
                </Button>
              </motion.div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default AdminModerationTab;
