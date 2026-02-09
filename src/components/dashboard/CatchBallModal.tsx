import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { BALL_CATEGORIES, SPECIAL_BALLS } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { toast } from "sonner";

interface CatchBallModalProps {
    isOpen: boolean;
    onClose: () => void;
    onQuestionSelected: (questionId: string) => void;
}

const allCategories = [...BALL_CATEGORIES, ...SPECIAL_BALLS];

const CatchBallModal = ({ isOpen, onClose, onQuestionSelected }: CatchBallModalProps) => {
    const projectId = useBaloriaProject();
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        if (isOpen && projectId) {
            fetchCounts();
        }
    }, [isOpen, projectId]);

    const fetchCounts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("baloria_questions")
                .select("theme")
                .eq("project_id", projectId)
                .eq("status", "open");

            if (error) throw error;

            const newCounts: Record<string, number> = {};
            data?.forEach((q) => {
                newCounts[q.theme] = (newCounts[q.theme] || 0) + 1;
            });
            setCounts(newCounts);
        } catch (err) {
            console.error("Error fetching counts:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySelect = async (category: typeof allCategories[number]) => {
        if (!projectId) return;

        let queryCategory: string = category.name;
        const currentCount = counts[category.name] || 0;

        // Fallback logic: If less than 3 questions in category, pick random from any category
        if (currentCount < 3) {
            toast.info(`Weinig vragen in ${category.name}, we hebben een verrassing voor je!`);
            queryCategory = ""; // Empty string for all categories
        }

        try {
            let query = supabase
                .from("baloria_questions")
                .select("id, theme")
                .eq("project_id", projectId)
                .eq("status", "open");

            if (queryCategory) {
                query = query.eq("theme", queryCategory);
            }

            const { data, error } = await query.limit(100);

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.info("Geen open vragen meer gevonden.");
                fetchCounts(); // Refresh counts
                return;
            }

            const randomQuestion = data[Math.floor(Math.random() * data.length)];
            onQuestionSelected(randomQuestion.id);
            onClose();
        } catch (err) {
            console.error("Error fetching question:", err);
            toast.error("Fout bij ophalen vraag");
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
                    style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
                        <div>
                            <h2 className="text-lg font-display font-bold" style={{ color: "#F1F5F9" }}>
                                Vang een Bal
                            </h2>
                            <p className="text-sm" style={{ color: "#94A3B8" }}>Kies een categorie om een vraag te beantwoorden</p>
                        </div>
                        <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5" style={{ color: "#64748B" }}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <>
                                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#475569" }}>Thema's</p>
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    {BALL_CATEGORIES.map((cat) => (
                                        <button key={cat.id} onClick={() => handleCategorySelect(cat)}
                                            className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.02] group relative overflow-hidden"
                                            style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}20` }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                                style={{ background: `${cat.color}15` }}>{cat.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{cat.name}</p>
                                                <p className="text-[11px] truncate" style={{ color: "#64748B" }}>
                                                    {counts[cat.name] || 0} open vragen
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "#64748B" }} />
                                            {/* Progress bar background equivalent ?? Maybe too much */}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#475569" }}>Speciale Ballen</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {SPECIAL_BALLS.map((cat) => (
                                        <button key={cat.id} onClick={() => handleCategorySelect(cat)}
                                            className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.02] group"
                                            style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}20` }}>
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                                                style={{ background: `${cat.color}15` }}>{cat.icon}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{cat.name}</p>
                                                <p className="text-[11px] truncate" style={{ color: "#64748B" }}>
                                                    {counts[cat.name] || 0} open vragen
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "#64748B" }} />
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CatchBallModal;
