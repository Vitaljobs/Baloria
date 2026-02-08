import { motion } from "framer-motion";
import { Search, Filter, MessageCircle, Star, MoreVertical, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";

interface Contact {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  is_active: boolean | null;
  visible_id: string | null;
}

const ContactenSection = () => {
  const { user } = useAuth();
  const projectId = useBaloriaProject();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchContacts = useCallback(async () => {
    if (!projectId || !user) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("id, user_id, display_name, bio, location, is_active, visible_id")
      .eq("project_id", projectId)
      .neq("user_id", user.id)
      .order("display_name", { ascending: true })
      .limit(100);

    if (data) setContacts(data);
    setLoading(false);
  }, [projectId, user]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const filtered = contacts.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (c.display_name || "").toLowerCase().includes(q) || (c.visible_id || "").toLowerCase().includes(q);
  });

  // Group by first letter
  const grouped = filtered.reduce<Record<string, Contact[]>>((acc, c) => {
    const letter = (c.display_name || "?").charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(c);
    return acc;
  }, {});

  const sortedLetters = Object.keys(grouped).sort();

  const colors = ["#FF6B8B", "#4D96FF", "#9D4EDD", "#10B981", "#FF9F43", "#FFD93D", "#A1785F", "#E879F9"];
  const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0F172A" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>Contacten</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>{contacts.length} contacten</p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: "#1E293B" }}>
        <Search className="w-4 h-4" style={{ color: "#64748B" }} />
        <input placeholder="Zoek contacten..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent outline-none flex-1 text-sm" style={{ color: "#F1F5F9" }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4D96FF" }} />
        </div>
      ) : sortedLetters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: "#475569" }}>
          <Users className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm">Geen contacten gevonden</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedLetters.map((letter) => (
            <div key={letter}>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3 px-1" style={{ color: "#475569" }}>{letter}</p>
              <div className="space-y-2">
                {grouped[letter].map((c, i) => {
                  const name = c.display_name || "Gebruiker";
                  const color = getColor(name);
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.005]"
                      style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.3)" }}>
                      <div className="relative">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ background: `${color}25`, color }}>
                          {name.charAt(0).toUpperCase()}{name.split(" ")[1]?.charAt(0).toUpperCase() || ""}
                        </div>
                        {c.is_active && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                            style={{ background: "#10B981", borderColor: "#1E293B" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{name}</p>
                        <p className="text-xs" style={{ color: "#64748B" }}>
                          {c.visible_id || ""}{c.location ? ` · ${c.location}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="rounded-lg p-2 transition-colors hover:bg-white/5" style={{ color: "#64748B" }}>
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactenSection;
