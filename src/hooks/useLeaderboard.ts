import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBaloriaProject } from "./useBaloriaProject";

export interface LeaderboardEntry {
    userId: string;
    rank: number;
    displayName: string;
    avatarUrl?: string;
    points: number;
    level: number;
    streak: number;
    badgesCount: number;
}

export const useLeaderboard = () => {
    const projectId = useBaloriaProject();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<"all_time" | "weekly">("all_time");

    const fetchLeaderboard = useCallback(async () => {
        if (!projectId) return;
        setLoading(true);

        try {
            // For now, simpler implementation: fetching top users by karma points
            // In a real scenario with "weekly", we would need a separate karma_history table or column

            // @ts-ignore - View not yet in types
            const { data, error } = await supabase
                .from("leaderboard_view")
                .select("*")
                .order("rank", { ascending: true })
                .limit(50);

            if (error) throw error;

            if (data) {
                const entries: LeaderboardEntry[] = data.map((item: any) => ({
                    userId: item.user_id,
                    rank: item.rank,
                    displayName: item.display_name || "Anoniem",
                    avatarUrl: item.avatar_url,
                    points: item.points,
                    level: item.level,
                    streak: item.streak_days,
                    badgesCount: 0,
                }));

                setLeaderboard(entries);
            }
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
        } finally {
            setLoading(false);
        }
    }, [projectId, period]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    return { leaderboard, loading, period, setPeriod, refetch: fetchLeaderboard };
};
