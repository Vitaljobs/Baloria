import { motion } from "framer-motion";
import { Check, Target, Zap, Lock } from "lucide-react";
import { useDailyChallenges, UserChallenge } from "@/hooks/useDailyChallenges";

const DailyChallenges = () => {
    const { challenges, loading } = useDailyChallenges();

    if (loading) return null;

    if (challenges.length === 0) {
        return (
            <div className="rounded-xl p-5 border border-dashed border-slate-700 bg-slate-800/20 text-center">
                <p className="text-sm text-slate-500">Geen challenges vandaag</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {challenges.map((challenge, i) => {
                const percent = Math.min(100, (challenge.progress / challenge.target_value) * 100);

                return (
                    <motion.div
                        key={challenge.challenge_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`relative overflow-hidden rounded-xl p-3 border transition-all ${challenge.completed
                                ? "bg-[#10B981]/10 border-[#10B981]/30"
                                : "bg-[#1E293B] border-slate-700 hover:border-slate-600"
                            }`}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${challenge.completed ? "bg-[#10B981]/20 text-[#10B981]" : "bg-slate-700/50 text-slate-400"
                                }`}>
                                {challenge.completed ? <Check className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${challenge.completed ? "text-[#10B981]" : "text-[#F1F5F9]"}`}>
                                    {challenge.description}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-slate-400">
                                        {challenge.progress} / {challenge.target_value}
                                    </span>

                                    {/* Progress bar */}
                                    <div className="h-1.5 w-24 bg-slate-700/50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            className={`h-full rounded-full ${challenge.completed ? "bg-[#10B981]" : "bg-[#4D96FF]"}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 bg-[#FFD93D]/10 px-2 py-1 rounded-full border border-[#FFD93D]/20">
                                <Zap className="w-3 h-3 text-[#FFD93D]" />
                                <span className="text-xs font-bold text-[#FFD93D]">+{challenge.karma_reward}</span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default DailyChallenges;
