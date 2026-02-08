import { motion } from "framer-motion";
import { CircleDot, Filter, Plus, Clock, Heart, MessageCircle, Loader2, TrendingUp, HelpCircle, Target } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import BallPitCanvas from "@/components/landing/BallPitCanvas";
import AskQuestionModal from "../AskQuestionModal";
import QuestionDetailModal from "../QuestionDetailModal";
import CatchBallModal from "../CatchBallModal";
import TrendingSection from "../TrendingSection";
import DailyChallenges from "../DailyChallenges";
import { BALL_CATEGORIES, SPECIAL_BALLS } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { useDailyAnswerQuota } from "@/hooks/useDailyAnswerQuota";
import { useDailyQuota } from "@/hooks/useDailyQuota";
import { toast } from "sonner";

const allCategories = [...BALL_CATEGORIES, ...SPECIAL_BALLS];

interface CategoryStats {
  theme: string;
  theme_color: string;
  open_count: number;
  closed_count: number;
}

const BallebakSection = () => {
  const projectId = useBaloriaProject();
  const { answersLeft } = useDailyAnswerQuota();
  const { quota } = useDailyQuota();
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [catchModalOpen, setCatchModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalActive, setTotalActive] = useState(0);

  const fetchCategoryStats = useCallback(async () => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from("baloria_questions")
        .select("theme, theme_color, status")
        .eq("project_id", projectId);

      if (error) throw error;

      // Group by theme and count open/closed
      const statsMap = new Map<string, CategoryStats>();

      data?.forEach((q) => {
        const key = q.theme;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            theme: q.theme,
            theme_color: q.theme_color,
            open_count: 0,
            closed_count: 0,
          });
        }
        const stats = statsMap.get(key)!;
        if (q.status === "open") {
          stats.open_count++;
        } else {
          stats.closed_count++;
        }
      });

      const statsArray = Array.from(statsMap.values());
      setCategoryStats(statsArray);

      const totalOpen = statsArray.reduce((sum, s) => sum + s.open_count, 0);
      setTotalActive(totalOpen);
    } catch (err) {
      console.error("Error fetching category stats:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCategoryStats();
  }, [fetchCategoryStats]);

  const handleCategoryClick = async (themeName: string) => {
    if (!projectId) return;

    try {
      // Fetch random question from this category
      const { data, error } = await supabase
        .from("baloria_questions")
        .select("id")
        .eq("project_id", projectId)
        .eq("theme", themeName)
        .eq("status", "open")
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info("Geen openstaande vragen in deze categorie");
        return;
      }

      // Pick random question
      const randomQuestion = data[Math.floor(Math.random() * data.length)];
      setSelectedQuestionId(randomQuestion.id);
    } catch (err) {
      console.error("Error fetching random question:", err);
      toast.error("Kon vraag niet laden");
    }
  };

  const handleQuestionSelected = (id: string) => {
    setSelectedQuestionId(id);
  };

  const getCategoryStats = (themeName: string) => {
    return categoryStats.find((s) => s.theme === themeName) || { open_count: 0, closed_count: 0 };
  };

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0F172A" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>Ballebak</h1>
          <p className="text-sm mt-1" style={{ color: "#64748B" }}>Vang een bal of gooi er eentje in!</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
            <HelpCircle className="w-4 h-4" style={{ color: "#FF9F43" }} />
            <span className="text-sm font-medium" style={{ color: "#F1F5F9" }}>
              {quota.questionsRemaining} vragen over
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#10B981" }} />
            <span className="text-sm font-medium" style={{ color: "#F1F5F9" }}>
              {answersLeft} antwoorden over
            </span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setCatchModalOpen(true)}>
              <Target className="w-4 h-4" /> Vang Bal
            </Button>
            <Button size="sm" className="gap-2 rounded-lg bg-primary hover:bg-primary/90" onClick={() => setAskModalOpen(true)}>
              <Plus className="w-4 h-4" /> Nieuwe Bal
            </Button>
          </div>
        </div>
      </div>

      {/* Ball Pit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden mb-6"
        style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)", height: 280 }}>
        <BallPitCanvas ballCount={18} gravity={0.005} friction={0.995} wallBounce={0.6} ballSize="large" />
        <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent pointer-events-none">
          <div>
            <h3 className="font-display font-bold text-lg" style={{ color: "#F1F5F9" }}>
              {totalActive} actieve ballen
            </h3>
            <p className="text-sm" style={{ color: "#94A3B8" }}>Klik op een categorie om een vraag te vangen</p>
          </div>
        </div>
      </motion.div>

      {/* Trending Questions */}
      <TrendingSection onQuestionClick={(id) => setSelectedQuestionId(id)} />

      {/* Daily Challenges */}
      <div className="mb-6">
        <h3 className="font-display font-semibold mb-4" style={{ color: "#F1F5F9" }}>Daily Challenges</h3>
        <DailyChallenges />
      </div>

      {/* Daily Challenges */}
      <div className="mb-6">
        <h3 className="font-display font-semibold mb-4" style={{ color: "#F1F5F9" }}>Daily Challenges</h3>
        <DailyChallenges />
      </div>

      {/* Category Statistics */}
      <div>
        <h3 className="font-display font-semibold mb-4" style={{ color: "#F1F5F9" }}>Categorieën</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4D96FF" }} />
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#475569" }}>Thema's</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {BALL_CATEGORIES.map((cat, i) => {
                const stats = getCategoryStats(cat.name);
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="flex items-center gap-3 rounded-xl p-4 text-left transition-all hover:scale-[1.02] group"
                    style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}20` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: `${cat.color}15` }}>{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{cat.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs" style={{ color: cat.color }}>
                          {stats.open_count} open
                        </span>
                        <span className="text-xs" style={{ color: "#475569" }}>•</span>
                        <span className="text-xs" style={{ color: "#64748B" }}>
                          {stats.closed_count} gesloten
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#475569" }}>Speciale Ballen</p>
            <div className="grid grid-cols-2 gap-3">
              {SPECIAL_BALLS.map((cat, i) => {
                const stats = getCategoryStats(cat.name);
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (BALL_CATEGORIES.length + i) * 0.04 }}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="flex items-center gap-3 rounded-xl p-4 text-left transition-all hover:scale-[1.02] group"
                    style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}20` }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: `${cat.color}15` }}>{cat.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{cat.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs" style={{ color: cat.color }}>
                          {stats.open_count} open
                        </span>
                        <span className="text-xs" style={{ color: "#475569" }}>•</span>
                        <span className="text-xs" style={{ color: "#64748B" }}>
                          {stats.closed_count} gesloten
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <AskQuestionModal isOpen={askModalOpen} onClose={() => setAskModalOpen(false)} onQuestionPosted={fetchCategoryStats} />
      <QuestionDetailModal
        isOpen={!!selectedQuestionId}
        onClose={() => setSelectedQuestionId(null)}
        questionId={selectedQuestionId}
      />
      <CatchBallModal isOpen={catchModalOpen} onClose={() => setCatchModalOpen(false)} onQuestionSelected={handleQuestionSelected} />
    </div>
  );
};

export default BallebakSection;
