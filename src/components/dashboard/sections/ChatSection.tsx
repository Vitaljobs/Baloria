import { motion } from "framer-motion";
import {
  Send, Smile, Search, Check, CheckCheck, Loader2, MessageCircle,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { toast } from "sonner";

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  last_message_at: string | null;
  other_name?: string;
  other_id?: string;
  last_preview?: string;
  unread_count?: number;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

const ChatSection = () => {
  const { user } = useAuth();
  const projectId = useBaloriaProject();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!user || !projectId) return;

    const { data } = await supabase
      .from("baloria_conversations")
      .select("*")
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (data && data.length > 0) {
      // Get other participant names
      const otherIds = data.map((c) =>
        c.participant_one === user.id ? c.participant_two : c.participant_one
      );

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, display_name")
        .eq("project_id", projectId)
        .in("user_id", otherIds);

      const nameMap: Record<string, string> = {};
      profiles?.forEach((p) => { nameMap[p.user_id] = p.display_name || "Gebruiker"; });

      setConversations(
        data.map((c) => {
          const otherId = c.participant_one === user.id ? c.participant_two : c.participant_one;
          return { ...c, other_name: nameMap[otherId] || "Gebruiker", other_id: otherId };
        })
      );
    }
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const fetchMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from("baloria_chat_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (data) {
      setMessages(data);
      // Mark unread as read
      const unread = data.filter((m) => !m.is_read && m.sender_id !== user?.id);
      if (unread.length > 0) {
        await supabase
          .from("baloria_chat_messages")
          .update({ is_read: true })
          .in("id", unread.map((m) => m.id));
      }
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [user]);

  useEffect(() => {
    if (activeConv) fetchMessages(activeConv.id);
  }, [activeConv, fetchMessages]);

  // Realtime messages
  useEffect(() => {
    if (!activeConv) return;
    const channel = supabase
      .channel(`chat-${activeConv.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "baloria_chat_messages",
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload) => {
        const newMsg = payload.new as ChatMessage;
        setMessages((prev) => [...prev, newMsg]);
        if (newMsg.sender_id !== user?.id) {
          supabase.from("baloria_chat_messages").update({ is_read: true }).eq("id", newMsg.id);
        }
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConv, user]);

  const handleSend = async () => {
    if (!message.trim() || !activeConv || !user) return;
    setSending(true);
    const { error } = await supabase.from("baloria_chat_messages").insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      content: message.trim(),
    });

    if (error) {
      toast.error("Bericht kon niet verstuurd worden");
    } else {
      // Update last_message_at
      await supabase.from("baloria_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConv.id);
      setMessage("");
    }
    setSending(false);
  };

  const filteredConvs = conversations.filter((c) =>
    !searchQuery || (c.other_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex" style={{ background: "#0F172A" }}>
      {/* LEFT: Conversation List */}
      <div className="w-80 shrink-0 flex flex-col border-r"
        style={{ background: "#0B1120", borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
        <div className="p-4 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.3)" }}>
          <h2 className="text-sm font-display font-bold mb-3" style={{ color: "#F1F5F9" }}>
            Gesprekken <span className="font-mono text-xs font-normal" style={{ color: "#64748B" }}>{conversations.length}</span>
          </h2>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm" style={{ background: "#1E293B", color: "#64748B" }}>
            <Search className="w-3.5 h-3.5" />
            <input placeholder="Zoeken..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none flex-1 text-xs" style={{ color: "#F1F5F9" }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#4D96FF" }} />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: "#475569" }}>
              <MessageCircle className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">Geen gesprekken</p>
            </div>
          ) : (
            filteredConvs.map((c) => (
              <button key={c.id} onClick={() => setActiveConv(c)}
                className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all border-b"
                style={{
                  background: activeConv?.id === c.id ? "hsla(217, 91%, 60%, 0.08)" : "transparent",
                  borderColor: "hsla(215, 25%, 22%, 0.2)",
                  borderLeft: activeConv?.id === c.id ? "3px solid #4D96FF" : "3px solid transparent",
                }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
                  {(c.other_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{c.other_name}</p>
                  {c.last_message_at && (
                    <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
                      {formatDistanceToNow(new Date(c.last_message_at), { locale: nl, addSuffix: true })}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* CENTER: Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <>
            <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
                {(activeConv.other_name || "?").charAt(0).toUpperCase()}
              </div>
              <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{activeConv.other_name}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold mt-1"
                        style={{ background: "hsla(217, 91%, 60%, 0.2)", color: "#4D96FF" }}>
                        {(activeConv.other_name || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="max-w-[65%]">
                      <div className="rounded-2xl px-4 py-2.5"
                        style={{
                          background: isMe ? "#4D96FF" : "#1E293B",
                          borderBottomRightRadius: isMe ? 4 : 16,
                          borderBottomLeftRadius: isMe ? 16 : 4,
                        }}>
                        <p className="text-sm leading-relaxed" style={{ color: isMe ? "#fff" : "#F1F5F9" }}>{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
                          <span className="text-[10px]" style={{ color: isMe ? "rgba(255,255,255,0.5)" : "#475569" }}>
                            {new Date(msg.created_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {isMe && (
                            msg.is_read
                              ? <CheckCheck className="w-3 h-3" style={{ color: "rgba(255,255,255,0.5)" }} />
                              : <Check className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="px-5 py-3 border-t" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
              <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "#1E293B" }}>
                <input placeholder="Type een bericht..." value={message} onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  className="flex-1 bg-transparent outline-none text-sm" style={{ color: "#F1F5F9" }} />
                <button onClick={handleSend} disabled={sending || !message.trim()}
                  className="rounded-lg p-2 transition-all hover:scale-110 disabled:opacity-40"
                  style={{ background: "#4D96FF", color: "#fff" }}>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center" style={{ color: "#475569" }}>
            <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm">Selecteer een gesprek om te chatten</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSection;
