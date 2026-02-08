import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield, Users, Search, MoreVertical, Crown, UserCheck,
  CheckCircle2, XCircle, UserX,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  visible_id: string | null;
}

const AdminUsersTab = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: projectId } = await supabase.rpc("get_project_id_by_slug", { slug_param: "baloria" });
      if (!projectId) return;

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name, is_active, created_at, visible_id")
        .eq("project_id", projectId);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("project_id", projectId);

      if (!profiles) return;
      const roleMap = new Map(roles?.map((r) => [r.user_id, r.role]) ?? []);

      setUsers(
        profiles.map((p) => ({
          user_id: p.user_id,
          display_name: p.display_name,
          role: roleMap.get(p.user_id) ?? "user",
          is_active: p.is_active ?? true,
          created_at: p.created_at ?? "",
          visible_id: p.visible_id,
        }))
      );
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { data: projectId } = await supabase.rpc("get_project_id_by_slug", { slug_param: "baloria" });
      if (!projectId) return;

      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .maybeSingle();

      if (existing) {
        await supabase.from("user_roles")
          .update({ role: newRole as "user" | "admin" | "moderator" })
          .eq("user_id", userId)
          .eq("project_id", projectId);
      } else {
        await supabase.from("user_roles").insert({
          user_id: userId,
          project_id: projectId,
          role: newRole as "user" | "admin" | "moderator",
        });
      }

      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
      setOpenMenuId(null);
      toast.success(`Rol gewijzigd naar ${newRole}`);
    } catch {
      toast.error("Kon rol niet wijzigen");
    }
  };

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    try {
      const { data: projectId } = await supabase.rpc("get_project_id_by_slug", { slug_param: "baloria" });
      if (!projectId) return;

      await supabase
        .from("user_profiles")
        .update({ is_active: !currentlyActive })
        .eq("user_id", userId)
        .eq("project_id", projectId);

      setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, is_active: !currentlyActive } : u)));
      setOpenMenuId(null);
      toast.success(currentlyActive ? "Gebruiker gedeactiveerd" : "Gebruiker geactiveerd");
    } catch {
      toast.error("Kon status niet wijzigen");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !searchQuery ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.visible_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    const styles: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
      admin: { bg: "#EF444420", color: "#EF4444", icon: Crown },
      moderator: { bg: "#F59E0B20", color: "#F59E0B", icon: Shield },
      user: { bg: "#4D96FF20", color: "#4D96FF", icon: UserCheck },
    };
    const s = styles[role] ?? styles.user;
    const Icon = s.icon;
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: s.bg, color: s.color }}>
        <Icon className="w-3 h-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Totaal", value: users.length, color: "#4D96FF" },
          { label: "Admins", value: users.filter((u) => u.role === "admin").length, color: "#EF4444" },
          { label: "Moderators", value: users.filter((u) => u.role === "moderator").length, color: "#F59E0B" },
          { label: "Inactief", value: users.filter((u) => !u.is_active).length, color: "#64748B" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
            <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: "#64748B" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <Search className="w-4 h-4" style={{ color: "#64748B" }} />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Zoek op naam of ID..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: "#F1F5F9" }} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer" style={{ background: "#1E293B", color: "#F1F5F9", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <option value="all">Alle rollen</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* User List */}
      <div className="rounded-xl overflow-hidden" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
        <div className="grid grid-cols-[1fr_120px_100px_60px] gap-4 px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "#475569", borderBottom: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <span>Gebruiker</span>
          <span>Rol</span>
          <span>Status</span>
          <span></span>
        </div>

        {loading ? (
          <div className="p-8 text-center" style={{ color: "#64748B" }}>Laden...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center" style={{ color: "#64748B" }}>Geen gebruikers gevonden</div>
        ) : (
          filteredUsers.map((u, i) => (
            <motion.div
              key={u.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_120px_100px_60px] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition-colors"
              style={{ borderBottom: i < filteredUsers.length - 1 ? "1px solid hsla(215, 25%, 22%, 0.3)" : undefined }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
                  {(u.display_name ?? "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{u.display_name ?? "Onbekend"}</p>
                  <p className="text-[11px] truncate" style={{ color: "#64748B" }}>{u.visible_id ?? "—"}</p>
                </div>
              </div>

              {getRoleBadge(u.role)}

              <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: u.is_active ? "#10B981" : "#EF4444" }}>
                {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {u.is_active ? "Actief" : "Inactief"}
              </span>

              <div className="relative">
                {u.user_id !== user?.id && (
                  <>
                    <button onClick={() => setOpenMenuId(openMenuId === u.user_id ? null : u.user_id)} className="rounded-lg p-1.5 hover:bg-white/5 transition-colors" style={{ color: "#64748B" }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === u.user_id && (
                      <div className="absolute right-0 top-full mt-1 rounded-xl py-1.5 z-50 min-w-[180px]" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.6)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                        <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#475569" }}>Rol wijzigen</p>
                        {["admin", "moderator", "user"].map((r) => (
                          <button key={r} onClick={() => handleRoleChange(u.user_id, r)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors text-left" style={{ color: u.role === r ? "#4D96FF" : "#94A3B8", fontWeight: u.role === r ? 600 : 400 }}>
                            {r === "admin" && <Crown className="w-3.5 h-3.5" />}
                            {r === "moderator" && <Shield className="w-3.5 h-3.5" />}
                            {r === "user" && <UserCheck className="w-3.5 h-3.5" />}
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                            {u.role === r && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                          </button>
                        ))}
                        <div className="my-1" style={{ borderTop: "1px solid hsla(215, 25%, 22%, 0.5)" }} />
                        <button onClick={() => handleToggleActive(u.user_id, u.is_active)} className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors text-left" style={{ color: u.is_active ? "#EF4444" : "#10B981" }}>
                          {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          {u.is_active ? "Deactiveren" : "Activeren"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );
};

export default AdminUsersTab;
