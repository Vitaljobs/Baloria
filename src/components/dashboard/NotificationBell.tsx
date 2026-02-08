import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, X, Heart, MessageCircle, CircleDot, Award, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

const typeIcons: Record<string, React.ElementType> = {
  heart: Heart,
  answer: MessageCircle,
  question: CircleDot,
  karma: Star,
  badge: Award,
  new_poll: CircleDot,
};

const typeColors: Record<string, string> = {
  heart: "#FF6B8B",
  answer: "#4D96FF",
  question: "#FF9F43",
  karma: "#FFD93D",
  badge: "#9D4EDD",
  new_poll: "#10B981",
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 transition-colors hover:bg-white/5"
        style={{ color: "#94A3B8" }}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold"
            style={{ background: "#EF4444", color: "#fff" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
            style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.6)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.4)" }}>
              <h3 className="text-sm font-display font-bold" style={{ color: "#F1F5F9" }}>Meldingen</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-[10px] font-medium" style={{ color: "#4D96FF" }}>
                    Alles gelezen
                  </button>
                )}
                <button onClick={() => setOpen(false)} style={{ color: "#64748B" }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: "#334155" }} />
                  <p className="text-xs" style={{ color: "#64748B" }}>Geen meldingen</p>
                </div>
              ) : (
                notifications.slice(0, 20).map((n) => {
                  const Icon = typeIcons[n.type] || Bell;
                  const color = typeColors[n.type] || "#94A3B8";
                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/5"
                      style={{ background: n.is_read ? "transparent" : "hsla(217, 91%, 60%, 0.04)" }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium" style={{ color: n.is_read ? "#94A3B8" : "#F1F5F9" }}>{n.title}</p>
                        {n.message && <p className="text-[11px] mt-0.5 truncate" style={{ color: "#64748B" }}>{n.message}</p>}
                        <p className="text-[10px] mt-1" style={{ color: "#475569" }}>
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: nl })}
                        </p>
                      </div>
                      {!n.is_read && (
                        <div className="w-2 h-2 rounded-full shrink-0 mt-2" style={{ background: "#4D96FF" }} />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
