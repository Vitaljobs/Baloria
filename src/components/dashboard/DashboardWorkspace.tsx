import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, MessageCircle, CircleDot, Bell,
  ArrowUpRight, ArrowDownRight, Activity, Zap, Star,
  Award, Flame, Crown, Target, Plus, Loader2,
} from "lucide-react";
import BallPitCanvas from "@/components/landing/BallPitCanvas";
import BallebakSection from "./sections/BallebakSection";
import InboxSection from "./sections/InboxSection";
import ChatSection from "./sections/ChatSection";
import ContactenSection from "./sections/ContactenSection";
import ProfielSection from "./sections/ProfielSection";
import InstellingenSection from "./sections/InstellingenSection";
import AdminSection from "./sections/AdminSection";
import LeaderboardSection from "./sections/LeaderboardSection";
import AskQuestionModal from "./AskQuestionModal";
import NotificationBell from "./NotificationBell";
import GlobalSearch from "./GlobalSearch";
import QuestionDetailModal from "./QuestionDetailModal";
import CatchBallModal from "./CatchBallModal";
import { toast } from "sonner";
import OnboardingModal from "@/components/onboarding/OnboardingModal";
import { Button } from "@/components/ui/button";
import { useKarma } from "@/hooks/useKarma";
import { useDailyQuota } from "@/hooks/useDailyQuota";
import { useAuth } from "@/hooks/useAuth";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useNotifications } from "@/hooks/useNotifications";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, change, positive, icon: Icon, color }: StatCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className="rounded-xl p-4 transition-all duration-300 cursor-pointer"
    style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
  >
    <div className="flex items-start justify-between mb-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${color}20` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <span
        className="flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5"
        style={{ color: positive ? "#10B981" : "#EF4444", background: positive ? "#10B98115" : "#EF444415" }}
      >
        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {change}
      </span>
    </div>
    <p className="text-xl font-bold font-display" style={{ color: "#F1F5F9" }}>{value}</p>
    <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>{title}</p>
  </motion.div>
);

const DashboardHome = ({ onSectionChange }: { onSectionChange?: (section: string) => void }) => {
  const { user } = useAuth();
  const projectId = useBaloriaProject();
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const { stats: karmaStats, getLevelName, getProgressToNextLevel, getPointsToNextLevel } = useKarma();
  const { quota, canAskQuestion } = useDailyQuota();
  const { notifications } = useNotifications();
  const [totalBalls, setTotalBalls] = useState(0);
  const [trending, setTrending] = useState<Array<{ topic: string; count: number; color: string }>>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [catchModalOpen, setCatchModalOpen] = useState(false);

  const { checkAction } = useDailyChallenges();

  const handleQuestionSelected = (id: string) => {
    setSelectedQuestionId(id);
  };

  // Track daily check-in
  useEffect(() => {
    checkAction('check_in');
  }, [checkAction]);

  // Fetch real stats
  useEffect(() => {
    if (!projectId) return;
    (async () => {
      const { count } = await supabase
        .from("baloria_questions")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)
        .eq("status", "open");
      setTotalBalls(count || 0);

      // Trending themes
      const { data: questions } = await supabase
        .from("baloria_questions")
        .select("theme, theme_color")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (questions) {
        const themeCounts: Record<string, { count: number; color: string }> = {};
        questions.forEach((q) => {
          if (!themeCounts[q.theme]) themeCounts[q.theme] = { count: 0, color: q.theme_color };
          themeCounts[q.theme].count++;
        });
        const sorted = Object.entries(themeCounts)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 5)
          .map(([topic, { count, color }]) => ({ topic, count, color }));
        setTrending(sorted);
      }
    })();

    // Check onboarding status
    const checkOnboarding = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .maybeSingle();

      if (data && !data.onboarding_completed) {
        setOnboardingOpen(true);
      }
    };
    checkOnboarding();
  }, [projectId, user]);

  // Recent activity from notifications
  const recentActivity = notifications.slice(0, 4).map((n) => {
    const typeColors: Record<string, string> = {
      heart: "#FF6B8B", answer: "#4D96FF", question: "#FF9F43", karma: "#FFD93D", badge: "#9D4EDD",
    };
    return {
      text: n.title,
      time: formatDistanceToNow(new Date(n.created_at), { locale: nl, addSuffix: false }),
      color: typeColors[n.type] || "#94A3B8",
    };
  });

  const stats: StatCardProps[] = [
    { title: "Actieve Ballen", value: totalBalls.toLocaleString(), change: "live", positive: true, icon: CircleDot, color: "#4D96FF" },
    { title: "Beantwoord", value: karmaStats ? karmaStats.answers_count.toLocaleString() : "—", change: karmaStats ? `${karmaStats.answers_count}` : "—", positive: true, icon: MessageCircle, color: "#10B981" },
    { title: "Hearts", value: karmaStats ? karmaStats.hearts_received.toLocaleString() : "—", change: karmaStats ? `${karmaStats.hearts_received}` : "—", positive: true, icon: Users, color: "#9D4EDD" },
    { title: "Karma Score", value: karmaStats ? karmaStats.points.toLocaleString() : "—", change: karmaStats && karmaStats.streak_days > 0 ? `🔥 ${karmaStats.streak_days}d` : "—", positive: true, icon: Star, color: "#FFD93D" },
  ];

  const rewards = [
    { label: "Rang", value: karmaStats ? getLevelName(karmaStats.level) : "—", icon: Crown, color: "#FFD93D", sub: karmaStats ? `Level ${karmaStats.level}` : "" },
    { label: "Streak", value: karmaStats ? `${karmaStats.streak_days} dagen` : "—", icon: Flame, color: "#FF9F43", sub: karmaStats && karmaStats.streak_days >= 7 ? "🔥 Op dreef!" : "Blijf actief!" },
    { label: "Volgend Level", value: karmaStats ? `${getPointsToNextLevel()} pts` : "—", icon: Award, color: "#4D96FF", sub: `${Math.round(getProgressToNextLevel())}% klaar` },
    { label: "Dagelijks", value: `${quota.questionsRemaining}Q / ${quota.answersRemaining}A`, icon: Target, color: "#10B981", sub: "Resterend" },
  ];

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-6" style={{ background: "#0F172A" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748B" }}>Welkom terug! Hier is je overzicht.</p>
        </div>
        <div className="flex items-center gap-3">
          <GlobalSearch />
          <Button onClick={() => setAskModalOpen(true)} size="sm" className="gap-2 rounded-lg bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Vraag Stellen
          </Button>
          <NotificationBell />
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
            {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "B"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="relative rounded-xl overflow-hidden cursor-pointer group"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)", height: 200 }}
          onClick={() => setAskModalOpen(true)}>
          <BallPitCanvas ballCount={18} gravity={0.02} friction={0.99} wallBounce={0.8} ballSize="medium" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 bg-gradient-to-t from-[#0F172A]/90 to-transparent pointer-events-none">
            <p className="font-display font-bold text-sm" style={{ color: "#F1F5F9" }}>Ballebak</p>
            <p className="text-[11px]" style={{ color: "#94A3B8" }}>Klik om een bal te gooien</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Beloningen & Status</h3>
            <Award className="w-4 h-4" style={{ color: "#FFD93D" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((r) => (
              <div key={r.label} className="flex items-center gap-3 rounded-lg p-3"
                style={{ background: `${r.color}08`, border: `1px solid ${r.color}15` }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${r.color}20` }}>
                  <r.icon className="w-4 h-4" style={{ color: r.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#F1F5F9" }}>{r.value}</p>
                  <p className="text-[10px]" style={{ color: "#64748B" }}>{r.label} · {r.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl p-5"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm" style={{ color: "#F1F5F9" }}>Activiteit</h3>
            <Activity className="w-4 h-4" style={{ color: "#64748B" }} />
          </div>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#475569" }}>Nog geen activiteit</p>
            ) : (
              recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "#E2E8F0" }}>{item.text}</p>
                    <p className="text-[10px]" style={{ color: "#475569" }}>{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-xl p-5" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <h3 className="font-display font-semibold mb-4" style={{ color: "#F1F5F9" }}>Dagelijks Quotum</h3>
          <div className="space-y-3">
            {[
              { label: "Vragen gesteld", current: `${quota.questionsUsed} / ${quota.questionsMax}`, pct: `${(quota.questionsUsed / quota.questionsMax) * 100}%`, gradient: "linear-gradient(90deg, #4D96FF, #36B5FF)" },
              { label: "Antwoorden gegeven", current: `${quota.answersUsed} / ${quota.answersMax}`, pct: `${(quota.answersUsed / quota.answersMax) * 100}%`, gradient: "linear-gradient(90deg, #10B981, #6BCF7F)" },
              { label: "Karma vandaag", current: karmaStats ? `+${karmaStats.points}` : "—", pct: `${Math.min(100, getProgressToNextLevel())}%`, gradient: "linear-gradient(90deg, #FFD93D, #FF9F43)" },
            ].map((bar, i) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "#94A3B8" }}>{bar.label}</span>
                  <span className="font-mono" style={{ color: "#F1F5F9" }}>{bar.current}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#0F172A" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: bar.pct }} transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                    className="h-full rounded-full" style={{ background: bar.gradient }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="rounded-xl p-5" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Trending</h3>
            <TrendingUp className="w-4 h-4" style={{ color: "#10B981" }} />
          </div>
          <div className="space-y-3">
            {trending.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#475569" }}>Geen data</p>
            ) : (
              trending.map((t) => (
                <div key={t.topic} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                    <span className="text-sm" style={{ color: "#E2E8F0" }}>{t.topic}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: "#64748B" }}>{t.count}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="rounded-xl p-5" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <h3 className="font-display font-semibold mb-4" style={{ color: "#F1F5F9" }}>Snelle Acties</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Vraag Stellen", icon: CircleDot, color: "#FF6B8B", action: () => setAskModalOpen(true) },
              { label: "Chat", icon: MessageCircle, color: "#4D96FF", action: () => onSectionChange?.("chat") },
              { label: "Vang een Bal", icon: Target, color: "#10B981", action: () => setCatchModalOpen(true) },
              { label: "Inbox", icon: Zap, color: "#FFD93D", action: () => onSectionChange?.("inbox") },
            ].map((action) => (
              <button key={action.label} onClick={action.action}
                className="flex flex-col items-center gap-2 rounded-lg p-3 transition-all hover:scale-105"
                style={{ background: `${action.color}10`, border: `1px solid ${action.color}20` }}>
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
                <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      <AskQuestionModal isOpen={askModalOpen} onClose={() => setAskModalOpen(false)} />
      <QuestionDetailModal isOpen={!!selectedQuestionId} onClose={() => setSelectedQuestionId(null)} questionId={selectedQuestionId} />
      <CatchBallModal isOpen={catchModalOpen} onClose={() => setCatchModalOpen(false)} onQuestionSelected={handleQuestionSelected} />
      <OnboardingModal isOpen={onboardingOpen} onComplete={() => setOnboardingOpen(false)} />
    </div>
  );
};

const DashboardWorkspace = ({ activeSection, onSectionChange }: { activeSection: string, onSectionChange: (section: string) => void }) => {
  switch (activeSection) {
    case "ballebak": return <BallebakSection />;
    case "inbox": return <InboxSection />;
    case "chat": return <ChatSection />;
    case "contacten": return <ContactenSection />;
    case "profiel": return <ProfielSection />;
    case "leaderboard": return <LeaderboardSection />;
    case "instellingen": return <InstellingenSection />;
    case "admin": return <AdminSection />;
    case "dashboard":
    default: return <DashboardHome onSectionChange={onSectionChange} />;
  }
};

export default DashboardWorkspace;
