import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useBaloriaProject } from "./useBaloriaProject";
import { toast } from "sonner";

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    earned_at: string;
}

export const useBadges = () => {
    const { user } = useAuth();
    const projectId = useBaloriaProject();
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBadges = useCallback(async () => {
        if (!user || !projectId) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from("baloria_user_badges")
                .select(`
          earned_at,
          badge:baloria_badges (
            id,
            name,
            description,
            icon,
            category
          )
        `)
                .eq("user_id", user.id)
                .eq("project_id", projectId);

            if (error) throw error;

            if (data) {
                setBadges(
                    data.map((item: any) => ({
                        ...item.badge,
                        earned_at: item.earned_at,
                    }))
                );
            }
        } catch (err) {
            console.error("Error fetching badges:", err);
        } finally {
            setLoading(false);
        }
    }, [user, projectId]);

    const checkBadges = useCallback(async (action: 'ask_question' | 'answer_question' | 'give_heart' | 'streak') => {
        if (!user || !projectId) return;

        try {
            // Define badge criteria
            const criteria = {
                ask_question: [
                    { name: 'Novice Asker', threshold: 1, table: 'baloria_questions', countField: 'author_id', type: 'count' },
                    { name: 'Conversation Starter', threshold: 5, table: 'baloria_questions', countField: 'author_id', type: 'count' }
                ],
                answer_question: [
                    { name: 'Problem Solver', threshold: 1, table: 'baloria_answers', countField: 'author_id', type: 'count' },
                    { name: 'Guru', threshold: 10, table: 'baloria_answers', countField: 'author_id', type: 'count' }
                ],
                give_heart: [
                    { name: 'Heartbeat', threshold: 10, table: 'baloria_hearts', countField: 'user_id', type: 'count' }
                ],
                streak: [
                    { name: 'Streaker', threshold: 3, table: 'baloria_user_stats', countField: 'user_id', type: 'value', valueField: 'streak_days' }
                ]
            };

            const relevantBadges = criteria[action];
            if (!relevantBadges) return;

            // Get current count/value for this action
            const badgeConfig = relevantBadges[0];
            let currentCount = 0;

            if (badgeConfig.type === 'count') {
                // @ts-ignore
                const { count } = await supabase
                    .from(badgeConfig.table)
                    .select('*', { count: 'exact', head: true })
                    .eq(badgeConfig.countField, user.id);
                currentCount = count || 0;
            } else if (badgeConfig.type === 'value' && badgeConfig.valueField) {
                // @ts-ignore
                const { data } = await supabase
                    .from(badgeConfig.table)
                    .select(badgeConfig.valueField)
                    .eq(badgeConfig.countField, user.id)
                    .single();

                if (data) {
                    currentCount = data[badgeConfig.valueField] || 0;
                }
            }

            // Check each badge in this category
            for (const badgeCriteria of relevantBadges) {
                // If we meet threshold
                if (currentCount >= badgeCriteria.threshold) {
                    // Check if we already have it
                    // fast check in local state first (optimization)
                    const alreadyHas = badges.some(b => b.name === badgeCriteria.name);
                    if (alreadyHas) continue;

                    // Double check DB to be safe (and get badge_id)
                    const { data: badgeDef } = await supabase
                        .from('baloria_badges')
                        .select('id, description, icon')
                        .eq('name', badgeCriteria.name)
                        .single();

                    if (!badgeDef) continue;

                    // Insert user badge
                    const { error: insertError } = await supabase
                        .from('baloria_user_badges')
                        .insert({
                            user_id: user.id,
                            project_id: projectId,
                            badge_id: badgeDef.id
                        });

                    if (!insertError) {
                        toast.success(`🏆 Badge Verdiend: ${badgeCriteria.name}!`, {
                            description: badgeDef.description,
                        });
                        // Refresh local badges
                        fetchBadges();
                    }
                }
            }

        } catch (err) {
            console.error("Error checking badges:", err);
        }
    }, [user, projectId, badges, fetchBadges]);

    useEffect(() => {
        fetchBadges();
    }, [fetchBadges]);

    return { badges, loading, refetch: fetchBadges, checkBadges };
};
