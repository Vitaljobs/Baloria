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
        if (streak >= 30) return "#FF6B00"; // Orange fire
        if (streak >= 7) return "#FF9F43"; // Yellow fire
        return "#FFD93D"; // Light yellow
    };

    const getStreakMessage = () => {
        if (streak === 0) return "Start je streak!";
        if (streak === 1) return "Eerste dag!";
        if (streak < 7) return `${streak} dagen!`;
        if (streak < 30) return `${streak} dagen streak! 🔥`;
        return `${streak} dagen! Je bent on fire! 🔥🔥`;
    };

    return (
        <div className="flex items-center gap-2">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                className={`${sizeClasses[size]} rounded-full flex items-center justify-center relative`}
                style={{
                    background: streak > 0
                        ? `linear-gradient(135deg, ${getStreakColor()}, #FF6B8B)`
                        : "linear-gradient(135deg, #475569, #64748B)",
                    boxShadow: streak > 0 ? `0 0 20px ${getStreakColor()}40` : "none",
                }}
            >
                {streak > 0 ? (
                    <Flame className={iconSizes[size]} style={{ color: "#fff" }} />
                ) : (
                    <TrendingUp className={iconSizes[size]} style={{ color: "#94A3B8" }} />
                )}
                {streak > 0 && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${getStreakColor()}40, transparent)`,
                        }}
                    />
                )}
            </motion.div>
            {showLabel && (
                <div className="flex flex-col">
                    <span className="text-sm font-bold" style={{ color: "#F1F5F9" }}>
                        {streak > 0 ? `${streak} 🔥` : "0"}
                    </span>
                    <span className="text-xs" style={{ color: "#64748B" }}>
                        {streak > 0 ? "dag streak" : "Geen streak"}
                    </span>
                </div>
            )}
        </div>
    );
};

export default StreakBadge;
