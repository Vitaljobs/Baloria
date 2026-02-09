import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { X, MapPin, Calendar, CircleDot, MessageCircle, Heart, Star, Users, Check, Copy, Hash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/hooks/useAuth";
import { useBadges } from "@/hooks/useBadges";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import BadgeDisplay from "./BadgeDisplay";

interface PublicProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

interface PublicProfile {
    id: string; // profile id
    user_id: string;
    display_name: string | null;
    bio: string | null;
    location: string | null;
    visible_id: string | null;
    avatar_url: string | null;
    created_at: string | null;
    is_verified?: boolean;
}

interface CategoryStat {
    category_name: string;
    level: number;
    points: number;
}

interface ProfileStats {
    questions_count: number;
    answers_count: number;
    hearts_received: number;
    points: number;
    level: number;
}

const PublicProfileModal = ({ isOpen, onClose, userId }: PublicProfileModalProps) => {
    const { user } = useAuth();
    const projectId = useBaloriaProject();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

    // We only use the hook if userId is present, otherwise pass undefined to avoid errors
    const { isFollowing, toggleFollow, followersCount, followingCount } = useFollows(userId || undefined);
    const { badges, loading: badgesLoading } = useBadges();

    const fetchProfile = useCallback(async () => {
        if (!userId || !projectId) return;
        setLoading(true);

        try {
            // Fetch profile
            const { data: profileData, error: profileError } = await supabase
                .from("user_profiles")
                .select("*")
                .eq("user_id", userId)
                .eq("project_id", projectId)
                .maybeSingle();

            if (profileError) throw profileError;
            setProfile(profileData);

            // Fetch stats (using baloria_user_stats)
            const { data: statsData, error: statsError } = await supabase
                .from("baloria_user_stats")
                .select("questions_count, answers_count, hearts_received, points, level")
                .eq("user_id", userId)
                .eq("project_id", projectId)
                .maybeSingle();

            if (!statsError && statsData) {
                setStats(statsData);
            } else {
                // Defaults if no stats record yet
                setStats({
                    questions_count: 0,
                    answers_count: 0,
                    hearts_received: 0,
                    points: 0,
                    level: 1
                });
            }

            // Fetch category expertise stats
            const { data: catStats, error: catError } = await supabase
                .from("baloria_user_category_stats" as any)
                .select("category_name, level, points")
                .eq("user_id", userId)
                .order("level", { ascending: false });

            if (!catError && catStats) {
                setCategoryStats(catStats as CategoryStat[]);
            }

        } catch (err) {
            console.error("Error fetching public profile:", err);
            toast.error("Kon profiel niet laden");
        } finally {
            setLoading(false);
        }
    }, [userId, projectId]);

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
        } else {
            setProfile(null);
            setStats(null);
        }
    }, [isOpen, userId, fetchProfile]);

    const handleCopyId = () => {
        if (!profile?.visible_id) return;
        navigator.clipboard.writeText(profile.visible_id);
        setCopied(true);
        toast.success("ID gekopieerd!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    const isOwnProfile = user?.id === userId;
    const displayName = profile?.display_name || "Gebruiker";

    const statItems = [
        { label: "Vragen", value: stats?.questions_count ?? 0, icon: CircleDot, color: "#FF6B8B" },
        { label: "Antwoorden", value: stats?.answers_count ?? 0, icon: MessageCircle, color: "#4D96FF" },
        { label: "Hearts", value: stats?.hearts_received ?? 0, icon: Heart, color: "#FF6B8B" },
        { label: "Karma", value: stats?.points ?? 0, icon: Star, color: "#FFD93D" },
        { label: "Volgers", value: followersCount, icon: Users, color: "#10B981" },
        { label: "Volgend", value: followingCount, icon: Users, color: "#9D4EDD" },
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-lg rounded-2xl overflow-hidden"
                    style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4D96FF" }} />
                        </div>
                    ) : profile ? (
                        <>
                            {/* Header Gradient */}
                            <div className="h-24 w-full relative">
                                <div className="absolute inset-0"
                                    style={{ background: "linear-gradient(135deg, #4D96FF40, #9D4EDD40)" }} />
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="px-6 pb-6 -mt-12 relative">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-display font-bold shadow-xl space-y-2 ring-4 ring-[#1E293B]"
                                        style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            displayName.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    {!isOwnProfile && (
                                        <Button
                                            onClick={toggleFollow}
                                            className={`gap-2 rounded-lg transition-all ${isFollowing
                                                ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                                                : "bg-primary hover:bg-primary/90 text-white"
                                                }`}
                                        >
                                            {isFollowing ? (
                                                <>
                                                    <Check className="w-4 h-4" /> Volgend
                                                </>
                                            ) : (
                                                <>
                                                    <Users className="w-4 h-4" /> Volgen
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>
                                            {displayName}
                                        </h2>
                                        {profile.is_verified && (
                                            <div className="bg-blue-500 rounded-full p-0.5" title="Geverifieerd">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        {stats && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                                style={{ background: "#FFD93D20", color: "#FFD93D" }}>
                                                Lvl {stats.level}
                                            </span>
                                        )}
                                    </div>

                                    {profile.bio && (
                                        <p className="text-sm mb-3" style={{ color: "#94A3B8" }}>
                                            {profile.bio}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#64748B" }}>
                                        {profile.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {profile.location}
                                            </span>
                                        )}
                                        {profile.created_at && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Lid sinds {new Date(profile.created_at).toLocaleDateString("nl-NL", { month: "short", year: "numeric" })}
                                            </span>
                                        )}
                                        {profile.visible_id && (
                                            <div className="flex items-center gap-1 cursor-pointer hover:text-slate-400" onClick={handleCopyId}>
                                                <Hash className="w-3 h-3" />
                                                {profile.visible_id}
                                                {copied && <Check className="w-3 h-3 text-emerald-500" />}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {statItems.map((s) => (
                                        <div key={s.label} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                                            <s.icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                                            <p className="text-lg font-bold text-slate-100">{s.value}</p>
                                            <p className="text-[10px] text-slate-500">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Badges */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3" style={{ color: "#F1F5F9" }}>Badges</h3>
                                    <BadgeDisplay badges={badges} loading={badgesLoading} />
                                </div>

                                {/* Category Expertise */}
                                {categoryStats.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#F1F5F9" }}>
                                            <Star className="w-4 h-4 text-yellow-500" /> Expertise
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {categoryStats.map((cs) => (
                                                <div key={cs.category_name}
                                                    className="px-3 py-1.5 rounded-lg bg-slate-800/40 border border-slate-700/50 flex items-center gap-2">
                                                    <span className="text-xs font-medium text-slate-300">{cs.category_name}</span>
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold">Lvl {cs.level}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            Gebruiker niet gevonden
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PublicProfileModal;
