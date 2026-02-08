import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BALL_CATEGORIES } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { toast } from "sonner";

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
    const { user } = useAuth();
    const projectId = useBaloriaProject();
    const [step, setStep] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [completing, setCompleting] = useState(false);

    const toggleCategory = (categoryId: string) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
        } else if (selectedCategories.length < 3) {
            setSelectedCategories([...selectedCategories, categoryId]);
        }
    };

    const handleComplete = async () => {
        if (!user || !projectId) return;
        setCompleting(true);

        try {
            // Save preferences
            await supabase
                .from("user_profiles")
                .update({
                    onboarding_completed: true,
                    favorite_categories: selectedCategories,
                })
                .eq("user_id", user.id)
                .eq("project_id", projectId);

            toast.success("Welkom bij Baloria! 🎉");
            onComplete();
        } catch (err) {
            console.error("Error completing onboarding:", err);
            toast.error("Er ging iets mis");
        } finally {
            setCompleting(false);
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
                style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-2xl rounded-2xl overflow-hidden"
                    style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                >
                    {/* Header */}
                    <div className="p-6 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-6 h-6" style={{ color: "#FFD93D" }} />
                                <h2 className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>
                                    Welkom bij Baloria!
                                </h2>
                            </div>
                            <button
                                onClick={onComplete}
                                className="rounded-lg p-1.5 hover:bg-white/5"
                                style={{ color: "#64748B" }}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-sm" style={{ color: "#94A3B8" }}>
                            Laten we je account personaliseren
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="px-6 pt-4">
                        <div className="flex items-center gap-2">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className="flex-1 h-1 rounded-full transition-all"
                                    style={{ background: step >= s ? "#4D96FF" : "#334155" }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {step === 1 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: "#F1F5F9" }}>
                                    Kies je interesses
                                </h3>
                                <p className="text-sm mb-4" style={{ color: "#64748B" }}>
                                    Selecteer 3 categorieën die je interesseren
                                </p>
                                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                    {BALL_CATEGORIES.map((cat) => {
                                        const isSelected = selectedCategories.includes(cat.id);
                                        return (
                                            <button
                                                key={cat.id}
                                                onClick={() => toggleCategory(cat.id)}
                                                disabled={!isSelected && selectedCategories.length >= 3}
                                                className="flex items-center gap-3 rounded-xl p-4 text-left transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                                                style={{
                                                    background: isSelected ? `${cat.color}15` : "#0F172A",
                                                    border: `2px solid ${isSelected ? cat.color : "transparent"}`,
                                                }}
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                                                    style={{ background: `${cat.color}20` }}
                                                >
                                                    {cat.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>
                                                        {cat.name}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: "#64748B" }}>
                                                        {cat.desc}
                                                    </p>
                                                </div>
                                                {isSelected && <Check className="w-5 h-5 shrink-0" style={{ color: cat.color }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs mt-3 text-center" style={{ color: "#475569" }}>
                                    {selectedCategories.length}/3 geselecteerd
                                </p>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)" }}>
                                    <Sparkles className="w-10 h-10" style={{ color: "#fff" }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: "#F1F5F9" }}>
                                    Hoe werkt Baloria?
                                </h3>
                                <div className="space-y-4 mt-6 text-left max-w-md mx-auto">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: "#4D96FF20", color: "#4D96FF" }}>
                                            1
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Stel vragen</p>
                                            <p className="text-xs" style={{ color: "#64748B" }}>
                                                Gooi je vraag als een bal in de Ballebak
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: "#10B98120", color: "#10B981" }}>
                                            2
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Vang ballen</p>
                                            <p className="text-xs" style={{ color: "#64748B" }}>
                                                Klik op een categorie om een vraag te beantwoorden
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: "#FF6B8B20", color: "#FF6B8B" }}>
                                            3
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Verdien karma</p>
                                            <p className="text-xs" style={{ color: "#64748B" }}>
                                                Krijg hearts en bouw je reputatie op
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #10B981, #6BCF7F)" }}>
                                    <Check className="w-10 h-10" style={{ color: "#fff" }} />
                                </div>
                                <h3 className="text-lg font-semibold mb-2" style={{ color: "#F1F5F9" }}>
                                    Je bent er klaar voor!
                                </h3>
                                <p className="text-sm" style={{ color: "#64748B" }}>
                                    Begin met vragen stellen of beantwoorden
                                </p>
                                <div className="mt-6 p-4 rounded-xl" style={{ background: "#0F172A" }}>
                                    <p className="text-xs font-semibold mb-2" style={{ color: "#94A3B8" }}>
                                        Dagelijkse limieten:
                                    </p>
                                    <div className="flex items-center justify-center gap-6">
                                        <div>
                                            <p className="text-2xl font-bold" style={{ color: "#4D96FF" }}>3</p>
                                            <p className="text-xs" style={{ color: "#64748B" }}>Vragen per dag</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold" style={{ color: "#10B981" }}>3</p>
                                            <p className="text-xs" style={{ color: "#64748B" }}>Antwoorden per dag</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 flex items-center justify-between">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={() => setStep(step - 1)}
                                className="gap-2"
                                style={{ borderColor: "#334155", color: "#94A3B8" }}
                            >
                                Terug
                            </Button>
                        )}
                        <div className="flex-1" />
                        {step < 3 ? (
                            <Button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 1 && selectedCategories.length < 3}
                                className="gap-2 bg-primary hover:bg-primary/90"
                            >
                                Volgende <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleComplete}
                                disabled={completing}
                                className="gap-2 bg-primary hover:bg-primary/90"
                            >
                                {completing ? "Bezig..." : "Start met Baloria"} <Sparkles className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingModal;
