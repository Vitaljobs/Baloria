import { motion } from "framer-motion";
import { Trophy, Medal, Star, Flame, Crown } from "lucide-react";
import { useLeaderboard, LeaderboardEntry } from "@/hooks/useLeaderboard";
import { useAuth } from "@/hooks/useAuth";

const LeaderboardSection = () => {
    const { user } = useAuth();
    const { leaderboard, loading, period, setPeriod } = useLeaderboard();

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-slate-300 fill-slate-300/20" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-700 fill-amber-700/20" />;
        return <span className="font-bold text-slate-500 w-5 text-center">{rank}</span>;
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return "bg-yellow-500/10 border-yellow-500/30";
        if (rank === 2) return "bg-slate-300/10 border-slate-300/30";
        if (rank === 3) return "bg-amber-700/10 border-amber-700/30";
        return "bg-[#0F172A] border-slate-800";
    };

    return (
        <div className="h-full flex flex-col p-6" style={{ background: "#0F172A" }}>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-display font-bold flex items-center gap-3" style={{ color: "#F1F5F9" }}>
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        Leaderboard
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#64748B" }}>
                        Top contributors van de community
                    </p>
                </div>

                <div className="flex bg-[#1E293B] rounded-lg p-1 border border-slate-800">
                    {(["all_time", "weekly"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${period === p
                                ? "bg-[#4D96FF] text-white shadow-lg"
                                : "text-slate-400 hover:text-slate-200"
                                }`}
                        >
                            {p === "all_time" ? "All-Time" : "Deze Week"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-20 rounded-xl bg-[#1E293B] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    leaderboard.map((entry, i) => (
                        <motion.div
                            key={entry.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${getRankStyle(entry.rank)} ${user?.id === entry.userId ? "ring-2 ring-[#4D96FF] ring-offset-2 ring-offset-[#0F172A]" : ""
                                }`}
                        >
                            <div className="flex items-center justify-center w-8 h-8 shrink-0">
                                {getRankIcon(entry.rank)}
                            </div>

                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 shadow-lg"
                                style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
                                {entry.avatarUrl ? (
                                    <img src={entry.avatarUrl} alt={entry.displayName} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    entry.displayName.charAt(0).toUpperCase()
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-[#F1F5F9] truncate">{entry.displayName}</h3>
                                    {user?.id === entry.userId && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4D96FF]/20 text-[#4D96FF]">JIJ</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500" /> Level {entry.level}
                                    </span>
                                    {entry.streak > 0 && (
                                        <span className="flex items-center gap-1 text-orange-400">
                                            <Flame className="w-3 h-3" /> {entry.streak} dagen
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-mono font-bold text-xl text-[#F1F5F9]">{entry.points.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Karma</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeaderboardSection;
