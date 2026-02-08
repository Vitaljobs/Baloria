import { motion } from "framer-motion";
import { Badge } from "@/hooks/useBadges";
import { Award, Lock } from "lucide-react";

interface BadgeDisplayProps {
    badges: Badge[];
    loading: boolean;
}

const BadgeDisplay = ({ badges, loading }: BadgeDisplayProps) => {
    if (loading) {
        return <div className="h-24 animate-pulse bg-slate-800/50 rounded-xl" />;
    }

    // Placeholder slots for unearned badges
    const totalSlots = Math.max(badges.length + 3, 5);
    const emptySlots = Array.from({ length: totalSlots - badges.length });

    return (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {badges.map((badge, i) => (
                <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all hover:bg-slate-800/80"
                    style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                >
                    <div className="text-3xl mb-2 drop-shadow-md transition-transform group-hover:scale-110">
                        {badge.icon}
                    </div>
                    <p className="text-[10px] text-center font-medium truncate w-full" style={{ color: "#F1F5F9" }}>
                        {badge.name}
                    </p>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-32 bg-black/90 text-white text-xs p-2 rounded-lg text-center backdrop-blur-sm border border-slate-700">
                        <p className="font-bold mb-0.5">{badge.name}</p>
                        <p className="text-[10px] text-slate-300">{badge.description}</p>
                        <p className="text-[9px] text-slate-500 mt-1">
                            Verdiend: {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                    </div>
                </motion.div>
            ))}

            {emptySlots.map((_, i) => (
                <div
                    key={`empty-${i}`}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-slate-800 bg-slate-900/30 opacity-50"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                        <Lock className="w-3 h-3 text-slate-600" />
                    </div>
                    <p className="text-[10px] text-slate-600">Locked</p>
                </div>
            ))}
        </div>
    );
};

export default BadgeDisplay;
