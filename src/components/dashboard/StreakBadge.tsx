import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";

interface StreakBadgeProps {
    streak: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

const StreakBadge = ({ streak, size = "md", showLabel = true }: StreakBadgeProps) => {
    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-12 h-12 text-sm",
        lg: "w-16 h-16 text-base",
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-6 h-6",
    };

    const getStreakColor = () => {
        if (streak >= 14) return "#EF4444"; // Red (High)
        if (streak >= 7) return "#F59E0B"; // Orange (Medium)
        if (streak >= 3) return "#3B82F6"; // Blue (Starting)
        return "#64748B"; // Gray (Low)
    };

    const getFlameCount = () => {
        if (streak >= 14) return 3;
        if (streak >= 7) return 2;
        if (streak >= 1) return 1;
        return 0;
    };

    const flames = Array.from({ length: getFlameCount() });

    return (
        <div className="flex items-center gap-3">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center relative overflow-hidden`}
                style={{
                    background: streak > 0
                        ? `linear-gradient(135deg, ${getStreakColor()}20, ${getStreakColor()}10)`
                        : "rgba(30, 41, 59, 0.5)",
                    border: `1px solid ${streak > 0 ? getStreakColor() + '40' : 'rgba(71, 85, 105, 0.2)'}`,
                    boxShadow: streak > 0 ? `0 0 15px ${getStreakColor()}20` : "none",
                }}
            >
                {streak > 0 ? (
                    <div className="flex gap-0.5">
                        {flames.map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    y: [0, -2, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            >
                                <Flame className={iconSizes[size]} style={{ color: getStreakColor() }} fill={getStreakColor()} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <TrendingUp className={iconSizes[size]} style={{ color: "#475569" }} />
                )}
            </motion.div>
            {showLabel && (
                <div className="flex flex-col">
                    <span className="text-sm font-bold flex items-center gap-1" style={{ color: "#F1F5F9" }}>
                        {streak} {streak > 0 && Array.from({ length: getFlameCount() }).map((_, i) => <span key={i}>🔥</span>)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: streak > 0 ? getStreakColor() : "#475569" }}>
                        {streak === 1 ? "Dag" : "Dagen"} Streak
                    </span>
                </div>
            )}
        </div>
    );
};

export default StreakBadge;
