import { motion } from "framer-motion";
import {
  Star, Heart, MessageCircle, CircleDot, Award, Flame,
  Edit3, MapPin, Calendar, Clock, TrendingUp, Shield,
  Copy, Check, Camera, Save, X, Hash, Loader2, Users,
} from "lucide-react";
import QuestionDetailModal from "../QuestionDetailModal";
import StreakBadge from "../StreakBadge";
import BadgeDisplay from "../BadgeDisplay";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useKarma } from "@/hooks/useKarma";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { useStreak } from "@/hooks/useStreak";
import { useBadges } from "@/hooks/useBadges";
import { useFollows } from "@/hooks/useFollows";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

interface UserProfile {
  id: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  visible_id: string | null;
  avatar_url: string | null;
  created_at: string | null;
}

const ProfielSection = () => {
  const { user, signOut } = useAuth();
  const { stats: karmaStats, getLevelName } = useKarma();
  const projectId = useBaloriaProject();
  const { currentStreak, loading: streakLoading } = useStreak();
  const { badges, loading: badgesLoading } = useBadges();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // For own profile, we just want counts, targetUserId = user?.id (will need to wrap in effect once user is loaded)
  // But useFollows expects a string, so we can conditionally use it
  const { followersCount, followingCount } = useFollows(user?.id);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: "", bio: "", location: "", avatarUrl: "" });
  const [activity, setActivity] = useState<Array<{ text: string; time: string; color: string }>>([]);
  const [myQuestions, setMyQuestions] = useState<any[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);
  const [questionsTab, setQuestionsTab] = useState<"asked" | "answered">("asked");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user || !projectId) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("id, display_name, bio, location, visible_id, avatar_url, created_at")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setEditForm({
        displayName: data.display_name || "",
        bio: data.bio || "",
        location: data.location || "",
        avatarUrl: data.avatar_url || "",
      });
    }

    // Fetch recent notifications as activity
    const { data: notifs } = await supabase
      .from("notifications")
      .select("title, created_at, type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    if (notifs) {
      const typeColors: Record<string, string> = {
        heart: "#FF6B8B", answer: "#4D96FF", question: "#FF9F43",
        karma: "#FFD93D", badge: "#9D4EDD", new_poll: "#10B981",
      };
      setActivity(notifs.map((n) => ({
        text: n.title,
        time: formatDistanceToNow(new Date(n.created_at!), { addSuffix: true, locale: nl }),
        color: typeColors[n.type] || "#94A3B8",
      })));
    }
    setLoading(false);
  }, [user, projectId]);

  const fetchMyQuestions = useCallback(async () => {
    if (!user || !projectId) return;

    // Fetch questions I asked
    const { data: asked } = await supabase
      .from("baloria_questions")
      .select("id, question, theme, theme_color, status, answers_count, created_at")
      .eq("author_id", user.id)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(10);

    setMyQuestions(asked || []);

    // Fetch questions I answered
    const { data: answered } = await supabase
      .from("baloria_answers")
      .select("question_id, created_at")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (answered && answered.length > 0) {
      const questionIds = answered.map((a) => a.question_id);
      const { data: questions } = await supabase
        .from("baloria_questions")
        .select("id, question, theme, theme_color, status, answers_count, created_at")
        .in("id", questionIds)
        .eq("project_id", projectId);

      setAnsweredQuestions(questions || []);
    }
  }, [user, projectId]);

  useEffect(() => {
    fetchProfile();
    fetchMyQuestions();
  }, [fetchProfile, fetchMyQuestions]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setEditForm((prev) => ({ ...prev, avatarUrl: publicUrl }));
      toast.success("Afbeelding geüpload!");
    } catch (error) {
      toast.error("Error uploading avatar!");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !projectId) return;

    const profileData = {
      user_id: user.id,
      project_id: projectId,
      display_name: editForm.displayName.trim().slice(0, 100) || null,
      bio: editForm.bio.trim().slice(0, 300) || null,
      location: editForm.location.trim().slice(0, 100) || null,
      avatar_url: editForm.avatarUrl || null,
    };

    const { error } = await supabase
      .from("user_profiles")
      // @ts-ignore - Supabase types might imply update needs ID, but upsert works with onConflict
      .upsert(profileData, { onConflict: "user_id" });

    if (error) {
      console.error("Error saving profile:", error);
      toast.error("Opslaan mislukt");
      return;
    }
    toast.success("Profiel bijgewerkt!");
    setEditing(false);
    fetchProfile();
  };

  const handleCopyId = () => {
    if (!profile?.visible_id) return;
    navigator.clipboard.writeText(profile.visible_id);
    setCopied(true);
    toast.success("ID gekopieerd!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0F172A" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4D96FF" }} />
      </div>
    );
  }

  const displayName = profile?.display_name || user?.user_metadata?.full_name || "Gebruiker";
  const levelName = karmaStats ? getLevelName(karmaStats.level) : "Nieuweling";

  const statItems = [
    { label: "Vragen gesteld", value: karmaStats?.questions_count ?? 0, icon: CircleDot, color: "#FF6B8B" },
    { label: "Antwoorden", value: karmaStats?.answers_count ?? 0, icon: MessageCircle, color: "#4D96FF" },
    { label: "Hearts", value: karmaStats?.hearts_received ?? 0, icon: Heart, color: "#FF6B8B" },
    { label: "Karma", value: karmaStats?.points ?? 0, icon: Star, color: "#FFD93D" },
    { label: "Volgers", value: followersCount, icon: Users, color: "#10B981" },
    { label: "Volgend", value: followingCount, icon: Users, color: "#9D4EDD" },
  ];

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0F172A" }}>
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle at 80% 20%, #4D96FF 0%, transparent 50%), radial-gradient(circle at 20% 80%, #9D4EDD 0%, transparent 50%)" }} />
        <div className="relative z-10 flex items-start gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-display font-bold relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", color: "#fff" }}>
              {editForm.avatarUrl ? (
                <img src={editForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )
              )}
              {editing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => document.getElementById("avatar-upload")?.click()}>
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            {editing && (
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: "#475569" }}>
                    Naam <span className="text-[10px] lowercase italic ml-1 opacity-70">(niet aanpasbaar)</span>
                  </label>
                  <Input value={editForm.displayName} disabled
                    className="h-10 rounded-lg border-0 text-sm opacity-50 cursor-not-allowed"
                    style={{ background: "#0F172A", color: "#94A3B8" }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: "#475569" }}>Bio</label>
                  <Input value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    maxLength={300} className="h-10 rounded-lg border-0 text-sm" style={{ background: "#0F172A", color: "#F1F5F9" }} />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider mb-1 block" style={{ color: "#475569" }}>Locatie</label>
                  <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    maxLength={100} className="h-10 rounded-lg border-0 text-sm" style={{ background: "#0F172A", color: "#F1F5F9" }} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={uploading} className="gap-1 rounded-lg bg-primary hover:bg-primary/90">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Opslaan
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="gap-1 rounded-lg" style={{ color: "#94A3B8" }}>
                    <X className="w-3 h-3" /> Annuleren
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>{displayName}</h1>
                  <span className="rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: "#FFD93D20", color: "#FFD93D" }}>{levelName}</span>
                </div>
                {profile?.bio && <p className="text-sm mb-2" style={{ color: "#94A3B8" }}>"{profile.bio}"</p>}
                {profile?.visible_id && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md" style={{ background: "#0F172A", color: "#4D96FF" }}>
                      <Hash className="w-3 h-3" /> {profile.visible_id}
                    </span>
                    <button onClick={handleCopyId} className="p-1 rounded hover:bg-white/5 transition-colors" style={{ color: "#64748B" }}>
                      {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#10B981" }} /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#64748B" }}>
                  {profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>}
                  {profile?.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Lid sinds {new Date(profile.created_at).toLocaleDateString("nl-NL", { month: "short", year: "numeric" })}
                    </span>
                  )}
                  {karmaStats && karmaStats.streak_days > 0 && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {karmaStats.streak_days} dagen streak 🔥</span>
                  )}
                </div>
              </>
            )}
          </div>
          {!editing && (
            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-0"
                style={{ background: "#0F172A", color: "#94A3B8" }} onClick={() => setEditing(true)}>
                <Edit3 className="w-4 h-4" /> Bewerken
              </Button>
              <Button variant="outline" size="sm" className="gap-2 rounded-lg border-0"
                style={{ background: "#0F172A", color: "#EF4444" }} onClick={() => signOut()}>
                Uitloggen
              </Button>
            </div>
          )}
        </div>
        <div className="relative z-10 mt-4 pt-4" style={{ borderTop: "1px solid hsla(215, 25%, 22%, 0.4)" }}>
          <span className="text-xs" style={{ color: "#475569" }}>E-mail: </span>
          <span className="text-xs font-mono" style={{ color: "#94A3B8" }}>{user?.email || "—"}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {statItems.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-xl p-5 text-center" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
            <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>{s.value.toLocaleString()}</p>
            <p className="text-xs mt-1" style={{ color: "#64748B" }}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="rounded-2xl p-6" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Recente Activiteit</h3>
          <TrendingUp className="w-4 h-4" style={{ color: "#64748B" }} />
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: "#475569" }}>Nog geen activiteit</p>
        ) : (
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                <div>
                  <p className="text-sm" style={{ color: "#E2E8F0" }}>{a.text}</p>
                  <p className="text-[11px]" style={{ color: "#475569" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mijn Vragen */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-6 mt-6" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Mijn Vragen</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setQuestionsTab("asked")}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: questionsTab === "asked" ? "#4D96FF20" : "transparent",
                color: questionsTab === "asked" ? "#4D96FF" : "#64748B",
              }}
            >
              Gesteld ({myQuestions.length})
            </button>
            <button
              onClick={() => setQuestionsTab("answered")}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: questionsTab === "answered" ? "#10B98120" : "transparent",
                color: questionsTab === "answered" ? "#10B981" : "#64748B",
              }}
            >
              Beantwoord ({answeredQuestions.length})
            </button>
          </div>
        </div>
        {questionsTab === "asked" ? (
          myQuestions.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "#475569" }}>Nog geen vragen gesteld</p>
          ) : (
            <div className="space-y-3">
              {myQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className="flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ background: "#0F172A", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${q.theme_color}15` }}>
                    <CircleDot className="w-4 h-4" style={{ color: q.theme_color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{q.question.replace(/(<([^>]+)>)/gi, "")}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: q.theme_color }}>{q.theme}</span>
                      <span className="text-xs" style={{ color: "#475569" }}>•</span>
                      <span className="text-xs" style={{ color: "#64748B" }}>
                        {q.status === "open" ? "Open" : "Gesloten"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs shrink-0" style={{ color: "#64748B" }}>
                    <MessageCircle className="w-3 h-3" />
                    {q.answers_count}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          answeredQuestions.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: "#475569" }}>Nog geen vragen beantwoord</p>
          ) : (
            <div className="space-y-3">
              {answeredQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className="flex items-center gap-3 rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ background: "#0F172A", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${q.theme_color}15` }}>
                    <CircleDot className="w-4 h-4" style={{ color: q.theme_color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{q.question.replace(/(<([^>]+)>)/gi, "")}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: q.theme_color }}>{q.theme}</span>
                      <span className="text-xs" style={{ color: "#475569" }}>•</span>
                      <span className="text-xs" style={{ color: "#64748B" }}>
                        {q.status === "open" ? "Open" : "Gesloten"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs shrink-0" style={{ color: "#64748B" }}>
                    <MessageCircle className="w-3 h-3" />
                    {q.answers_count}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </motion.div>

      <QuestionDetailModal
        isOpen={!!selectedQuestionId}
        onClose={() => setSelectedQuestionId(null)}
        questionId={selectedQuestionId}
      />
    </div>
  );
};

export default ProfielSection;
