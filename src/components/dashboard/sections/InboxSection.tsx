import { motion } from "framer-motion";
import {
  Inbox, Send, Archive, Star, Search, Plus, Users,
  Mail, MailOpen, Loader2, Smile,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";

interface InboxMessage {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  message_type: string;
  priority: string;
  sender_name?: string;
}

type Folder = "inbox" | "sent";

const InboxSection = () => {
  const { user } = useAuth();
  const projectId = useBaloriaProject();
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [selectedMsg, setSelectedMsg] = useState<InboxMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!user || !projectId) return;

    let query = supabase
      .from("messages")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (activeFolder === "inbox") {
      query = query.or(`recipient_id.eq.${user.id},recipient_id.is.null`);
    } else {
      query = query.eq("sender_id", user.id);
    }

    const { data } = await query;

    if (data) {
      // Fetch sender names
      const senderIds = [...new Set(data.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .eq("project_id", projectId)
        .in("user_id", senderIds);

      const nameMap: Record<string, string> = {};
      profiles?.forEach((p) => {
        nameMap[p.user_id] = p.display_name || "Gebruiker";
      });

      setMessages(
        data.map((m) => ({
          ...m,
          sender_name: nameMap[m.sender_id] || "Systeem",
        }))
      );
    }
    setLoading(false);
  }, [user, projectId, activeFolder]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (msg: InboxMessage) => {
    if (msg.is_read || msg.sender_id === user?.id) return;
    await supabase.from("messages").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", msg.id);
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m)));
  };

  const handleSelectMsg = (msg: InboxMessage) => {
    setSelectedMsg(msg);
    markAsRead(msg);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMsg || !user || !projectId) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: selectedMsg.sender_id,
      project_id: projectId,
      subject: `Re: ${selectedMsg.subject}`,
      content: replyText.trim(),
      message_type: "reply",
      priority: "normal",
    });
    setSending(false);
    if (error) {
      toast.error("Bericht kon niet verstuurd worden");
    } else {
      toast.success("Antwoord verstuurd!");
      setReplyText("");
      fetchMessages();
    }
  };

  const filtered = messages.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.subject.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      (m.sender_name || "").toLowerCase().includes(q)
    );
  });

  const unreadCount = messages.filter((m) => !m.is_read && m.sender_id !== user?.id).length;

  const folders = [
    { id: "inbox" as Folder, label: "Inbox", icon: Inbox, count: unreadCount },
    { id: "sent" as Folder, label: "Verzonden", icon: Send },
  ];

  return (
    <div className="h-full flex" style={{ background: "#0F172A" }}>
      {/* LEFT: Navigation */}
      <div className="w-56 shrink-0 flex flex-col border-r p-4"
        style={{ background: "#0B1120", borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
        <h2 className="text-lg font-display font-bold mb-4" style={{ color: "#F1F5F9" }}>Berichten</h2>
        <div className="space-y-1 mb-6">
          {folders.map((f) => (
            <button key={f.id} onClick={() => { setActiveFolder(f.id); setSelectedMsg(null); }}
              className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all text-left"
              style={{
                background: activeFolder === f.id ? "hsla(217, 91%, 60%, 0.1)" : "transparent",
                color: activeFolder === f.id ? "#F1F5F9" : "#94A3B8",
              }}>
              <f.icon className="w-4 h-4" />
              <span className="flex-1">{f.label}</span>
              {f.count && f.count > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#EF4444", color: "#fff" }}>{f.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER: Message List */}
      <div className="flex-1 flex flex-col min-w-0 border-r" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.3)" }}>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#1E293B", color: "#64748B" }}>
            <Search className="w-4 h-4" />
            <input placeholder="Zoek berichten..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-sm" style={{ color: "#F1F5F9" }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4D96FF" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: "#475569" }}>
              <Mail className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Geen berichten</p>
            </div>
          ) : (
            filtered.map((msg, i) => (
              <motion.button key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                onClick={() => handleSelectMsg(msg)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-b"
                style={{
                  background: selectedMsg?.id === msg.id ? "hsla(217, 91%, 60%, 0.08)" : msg.is_read ? "transparent" : "#0F172A",
                  borderColor: "hsla(215, 25%, 22%, 0.2)",
                  borderLeft: selectedMsg?.id === msg.id ? "3px solid #4D96FF" : "3px solid transparent",
                }}>
                <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
                  {(msg.sender_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm truncate ${!msg.is_read ? "font-semibold" : "font-medium"}`}
                      style={{ color: !msg.is_read ? "#F1F5F9" : "#94A3B8" }}>{msg.sender_name}</span>
                    <span className="text-[10px] shrink-0 ml-2" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(msg.created_at), { locale: nl, addSuffix: false })}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: !msg.is_read ? "#E2E8F0" : "#64748B" }}>{msg.subject}</p>
                </div>
                {!msg.is_read && msg.sender_id !== user?.id && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: "#EF4444", color: "#fff" }}>!</span>
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Message Detail */}
      <div className="w-96 shrink-0 flex flex-col" style={{ background: "#0B1120" }}>
        {selectedMsg ? (
          <>
            <div className="px-5 py-4 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.3)" }}>
              <h3 className="text-sm font-semibold mb-1" style={{ color: "#F1F5F9" }}>{selectedMsg.subject}</h3>
              <p className="text-xs" style={{ color: "#64748B" }}>
                Van: {selectedMsg.sender_name} · {new Date(selectedMsg.created_at).toLocaleString("nl-NL")}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#E2E8F0" }}>{selectedMsg.content}</p>
            </div>
            <div className="px-4 py-3 border-t" style={{ borderColor: "hsla(215, 25%, 22%, 0.3)" }}>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "#1E293B" }}>
                <input placeholder="Antwoord..." value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                  className="flex-1 bg-transparent outline-none text-xs" style={{ color: "#F1F5F9" }} />
                <button onClick={handleSendReply} disabled={sending || !replyText.trim()}
                  className="rounded-md p-1.5 disabled:opacity-40" style={{ background: "#4D96FF", color: "#fff" }}>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ color: "#475569" }}>
            <MailOpen className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">Selecteer een bericht</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxSection;
