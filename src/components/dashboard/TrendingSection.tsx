import { motion } from "framer-motion";
import { TrendingUp, Flame, Heart, MessageCircle, Clock, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { getTrendingQuestions } from "@/lib/trending";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import PublicProfileModal from "./PublicProfileModal";

interface TrendingQuestion {
    id: string;
    question: string;
    theme: string;
    theme_color: string;
    hearts_count: number;
    answers_count: number;
    created_at: string;
    author_profile?: {
        display_name: string;
        avatar_url: string;
    };
}

interface TrendingSectionProps {
    onQuestionClick: (questionId: string) => void;
}

const TrendingSection = ({ onQuestionClick }: TrendingSectionProps) => {
    const projectId = useBaloriaProject();
    const [trending, setTrending] = useState<TrendingQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

    const handleProfileClick = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation(); // Prevent opening question
        setSelectedProfileId(userId);
    };

    const fetchTrending = useCallback(async () => {
        if (!projectId) return;

        try {
            // Fetch recent questions (last 24 hours) with engagement
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);

            const { data, error } = await supabase
                .from("baloria_questions")
                .select("id, question, theme, theme_color, hearts_count, answers_count, created_at, author_id, is_anonymous")
                .eq("project_id", projectId)
                .eq("status", "open")
                .gte("created_at", yesterday.toISOString())
                .or(`hearts_count.gte.3,answers_count.gte.2`) // Min engagement threshold
                .limit(20);

            if (error) throw error;

            if (data && data.length > 0) {
                // Calculate trending scores
                const trendingIds = getTrendingQuestions(data, 5);

                // Get unique author IDs for non-anonymous questions that are trending
                const trendingData = trendingIds
                    .map((id) => data.find((q) => q.id === id))
                    .filter((q): q is TrendingQuestion & { author_id: string, is_anonymous: boolean } => q !== undefined);

                const authorIds = [...new Set(trendingData
                    .filter(q => !q.is_anonymous && q.author_id)
                    .map(q => q.author_id))];

                let profilesMap: Record<string, { display_name: string, avatar_url: string }> = {};

                if (authorIds.length > 0) {
                    const { data: profiles } = await supabase
                        .from("user_profiles")
                        .select("user_id, display_name, avatar_url")
                        .in("user_id", authorIds);

                    if (profiles) {
                        profiles.forEach(p => {
                            profilesMap[p.user_id] = {
                                display_name: p.display_name || "Onbekend",
                                avatar_url: p.avatar_url || ""
                            };
                        });
                    }
                }

                const trendingQuestionsWithAuthors = trendingData.map(q => ({
                    ...q,
                    author_profile: (!q.is_anonymous && q.author_id && profilesMap[q.author_id])
                        ? profilesMap[q.author_id]
                        : undefined
                }));

                setTrending(trendingQuestionsWithAuthors);
            } else {
                setTrending([]);
            }
        } catch (err) {
            console.error("Error fetching trending:", err);
            setTrending([]);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchTrending();
        // Refresh every 5 minutes
        const interval = setInterval(fetchTrending, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchTrending]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#4D96FF" }} />
            </div>
        );
    }

    if (trending.length === 0) {
        return null; // Don't show section if no trending questions
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 mb-6"
            style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1.5">
                    <Flame className="w-5 h-5" style={{ color: "#FF6B00" }} />
                    <h3 className="font-display font-bold" style={{ color: "#F1F5F9" }}>
                        Trending Nu
                    </h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FF6B0020", color: "#FF9F43" }}>
                    {trending.length} hot {trending.length === 1 ? "vraag" : "vragen"}
                </span>
            </div>

            <div className="space-y-2">
                {trending.map((q, i) => (
                    <motion.button
                        key={q.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onQuestionClick(q.id)}
                        className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.01]"
                        style={{ background: "#0F172A", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 overflow-hidden cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-[#0F172A] hover:ring-slate-700 transition-all"
                            style={{ background: `${q.theme_color}20` }}
                            onClick={(e) => q.author_id && !q.is_anonymous ? handleProfileClick(e, q.author_id) : undefined}
                        >
                            {q.author_profile?.avatar_url ? (
                                <img src={q.author_profile.avatar_url} alt={q.author_profile.display_name} className="w-full h-full object-cover" />
                            ) : q.author_profile ? (
                                <span className="text-xs font-bold" style={{ color: q.theme_color }}>
                                    {q.author_profile.display_name.charAt(0).toUpperCase()}
                                </span>
                            ) : (
                                <span className="text-xs font-bold" style={{ color: q.theme_color }}>
                                    {i + 1}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-medium truncate pr-2" style={{ color: "#F1F5F9" }}>
                                    {q.question.replace(/(<([^>]+)>)/gi, "")}
                                </p>
                                {q.author_profile && (
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                        by {q.author_profile.display_name}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs" style={{ color: q.theme_color }}>{q.theme}</span>
                                <span className="flex items-center gap-1 text-xs" style={{ color: "#64748B" }}>
                                    <Heart className="w-3 h-3" /> {q.hearts_count}
                                </span>
                                <span className="flex items-center gap-1 text-xs" style={{ color: "#64748B" }}>
                                    <MessageCircle className="w-3 h-3" /> {q.answers_count}
                                </span>
                            </div>
                        </div>
                        <Flame className="w-4 h-4 shrink-0" style={{ color: "#FF6B00" }} />
                    </motion.button>
                ))}
            </div>

            <p className="text-xs mt-3 text-center" style={{ color: "#475569" }}>
                Updates elke 5 minuten
            </p>

            <PublicProfileModal
                isOpen={!!selectedProfileId}
                onClose={() => setSelectedProfileId(null)}
                userId={selectedProfileId}
            />
        </motion.div>
    );
};

export default TrendingSection;
