import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useBaloriaProject } from "./useBaloriaProject";
import { toast } from "sonner";

export const useFollows = (targetUserId?: string) => {
    const { user } = useAuth();
    const projectId = useBaloriaProject();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchFollowStatus = useCallback(async () => {
        if (!user || !projectId || !targetUserId) {
            setLoading(false);
            return;
        }

        try {
            // Check if I follow them
            const { data, error } = await supabase
                .from("baloria_follows")
                .select("id")
                .eq("follower_id", user.id)
                .eq("following_id", targetUserId)
                .eq("project_id", projectId)
                .maybeSingle();

            if (error) throw error;
            setIsFollowing(!!data);

            // Get their counts
            const { count: followers } = await supabase
                .from("baloria_follows")
                .select("id", { count: "exact", head: true })
                .eq("following_id", targetUserId)
                .eq("project_id", projectId);

            setFollowersCount(followers || 0);

            const { count: following } = await supabase
                .from("baloria_follows")
                .select("id", { count: "exact", head: true })
                .eq("follower_id", targetUserId)
                .eq("project_id", projectId);

            setFollowingCount(following || 0);

        } catch (err) {
            console.error("Error fetching follow status:", err);
        } finally {
            setLoading(false);
        }
    }, [user, projectId, targetUserId]);

    const toggleFollow = async () => {
        if (!user || !projectId || !targetUserId) return;

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from("baloria_follows")
                    .delete()
                    .eq("follower_id", user.id)
                    .eq("following_id", targetUserId)
                    .eq("project_id", projectId);

                if (error) throw error;
                setIsFollowing(false);
                setFollowersCount(prev => Math.max(0, prev - 1));
                toast.success("Niet meer volgend");
            } else {
                // Follow
                const { error } = await supabase
                    .from("baloria_follows")
                    .insert({
                        follower_id: user.id,
                        following_id: targetUserId,
                        project_id: projectId
                    });

                if (error) throw error;
                setIsFollowing(true);
                setFollowersCount(prev => prev + 1);
                toast.success("Je volgt nu deze gebruiker");
            }
        } catch (err) {
            console.error("Error toggling follow:", err);
            toast.error("Actie mislukt");
        }
    };

    useEffect(() => {
        if (targetUserId) {
            fetchFollowStatus();
        }
    }, [fetchFollowStatus, targetUserId]);

    return { isFollowing, followersCount, followingCount, loading, toggleFollow };
};
