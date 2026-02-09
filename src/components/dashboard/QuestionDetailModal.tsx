import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X, Heart, Send, Clock, MessageCircle, Loader2, Check, Star, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useDailyAnswerQuota } from "@/hooks/useDailyAnswerQuota";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useFollows } from "@/hooks/useFollows";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useBadges } from "@/hooks/useBadges";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import RichTextDisplay from "./RichTextDisplay";
import PublicProfileModal from "./PublicProfileModal";

interface Question {
    id: string;
    question: string;
    theme: string;
    theme_color: string;
    hearts_count: number;
    answers_count: number;
    created_at: string;
    author_id: string;
    is_anonymous: boolean;
    image_url?: string;
    baloria_question_tags?: {
        baloria_tags: {
            name: string;
        };
    }[];
    author_profile?: {
        display_name: string;
        avatar_url: string;
        is_verified?: boolean;
        category_stats?: {
            category_name: string;
            level: number;
        }[];
    };
    is_ai_generated?: boolean;
}

interface Answer {
    id: string;
    content: string;
    hearts_count: number;
    created_at: string;
    author_id: string;
    is_accepted: boolean;
    image_url?: string;
}

interface QuestionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: string | null;
}

const QuestionDetailModal = ({ isOpen, onClose, questionId }: QuestionDetailModalProps) => {
    const { user } = useAuth();
    const { canAnswer, answersLeft, refetch: refetchQuota } = useDailyAnswerQuota();
    const { checkAction } = useDailyChallenges();
    const { checkBadges } = useBadges();
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState(true);
    const [answerText, setAnswerText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Afbeelding mag maximaal 2MB zijn");
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Alleen afbeeldingen zijn toegestaan");
            return;
        }

        setSelectedImage(file);
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const [userHearted, setUserHearted] = useState(false);
    const { isFollowing, toggleFollow } = useFollows(question?.author_id);
    const [isSuccessView, setIsSuccessView] = useState(false);

    useEffect(() => {
        if (isOpen && questionId) {
            setIsSuccessView(false);
            fetchQuestionDetails();
        }
    }, [isOpen, questionId]);

    const fetchQuestionDetails = async () => {
        if (!questionId) return;
        setLoading(true);

        try {
            // Fetch question with tags and author
            const { data: questionData, error: qError } = await supabase
                .from("baloria_questions")
                .select(`
                    *,
                    baloria_question_tags (
                        baloria_tags (
                            name
                        )
                    )
                `)
                .eq("id", questionId)
                .single();

            if (qError) throw qError;

            // Fetch author profile if not anonymous
            let authorProfile = null;
            if (!questionData.is_anonymous && questionData.author_id) {
                const { data: profileData } = await supabase
                    .from("user_profiles")
                    .select("display_name, avatar_url, is_verified")
                    .eq("user_id", questionData.author_id)
                    .maybeSingle();

                if (profileData) {
                    // Use any bypass for potential missing table in types
                    const { data: statsData } = await (supabase
                        .from("baloria_user_category_stats" as any) as any)
                        .select("category_name, level")
                        .eq("user_id", questionData.author_id)
                        .eq("category_name", questionData.theme);

                    const profileObj = (profileData as unknown) as { display_name: string; avatar_url: string; is_verified: boolean };

                    authorProfile = {
                        ...profileObj,
                        category_stats: (statsData as any) || []
                    };
                }
            }

            setQuestion({
                ...questionData,
                author_profile: authorProfile,
                // @ts-ignore - Handle nested relation
                baloria_question_tags: (questionData as any).baloria_question_tags
            } as any);

            // Fetch answers
            const { data: answersData, error: aError } = await supabase
                .from("baloria_answers")
                .select("*")
                .eq("question_id", questionId)
                .order("created_at", { ascending: false });

            if (aError) throw aError;
            setAnswers(answersData || []);

            // Check if user hearted this question
            if (user) {
                const { data: heartData } = await supabase
                    .from("baloria_hearts")
                    .select("id")
                    .eq("target_id", questionId)
                    .eq("target_type", "question")
                    .eq("user_id", user.id)
                    .maybeSingle();

                setUserHearted(!!heartData);
            }
        } catch (err) {
            console.error("Error fetching question details:", err);
            toast.error("Kon vraag niet laden");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!user || !questionId || !answerText.trim() || !canAnswer) return;

        setSubmitting(true);
        try {
            let imageUrl = null;

            if (selectedImage) {
                const fileExt = selectedImage.name.split(".").pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `answers/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from("question-images")
                    .upload(filePath, selectedImage);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("question-images")
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            const { error } = await supabase.from("baloria_answers").insert({
                question_id: questionId,
                author_id: user.id,
                content: answerText.trim().slice(0, 5000),
                image_url: imageUrl,
            });

            if (error) throw error;

            // toast.success("Antwoord geplaatst! 🚀");
            setAnswerText("");
            removeImage();
            refetchQuota();
            fetchQuestionDetails();
            setIsSuccessView(true);

            // Track Daily Challenge & Badges
            checkAction('answer_question');
            checkBadges('answer_question');

        } catch (err: any) {
            console.error("Error submitting answer:", err);
            toast.error("Kon antwoord niet plaatsen");
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleHeart = async () => {
        if (!user || !questionId) return;

        try {
            if (userHearted) {
                // Remove heart
                await supabase
                    .from("baloria_hearts")
                    .delete()
                    .eq("target_id", questionId)
                    .eq("target_type", "question")
                    .eq("user_id", user.id);

                setUserHearted(false);
                if (question) {
                    setQuestion({ ...question, hearts_count: question.hearts_count - 1 });
                }
            } else {
                // Add heart
                await supabase.from("baloria_hearts").insert({
                    target_id: questionId,
                    target_type: "question",
                    user_id: user.id,
                });

                setUserHearted(true);
                if (question) {
                    setQuestion({ ...question, hearts_count: question.hearts_count + 1 });
                }

                // Track daily challenge
                checkAction('give_hearts');
                checkBadges('give_heart');
            }
        } catch (err) {
            console.error("Error toggling heart:", err);
            toast.error("Kon hartje niet plaatsen");
        }
    };

    const handleAcceptAnswer = async (answerId: string) => {
        if (!user || user.id !== question?.author_id) return;

        try {
            const answer = answers.find(a => a.id === answerId);
            if (!answer) return;

            const newIsAccepted = !answer.is_accepted;

            // Optimistic update
            setAnswers(prev => prev.map(a =>
                a.id === answerId ? { ...a, is_accepted: newIsAccepted } : a
            ));

            const { error } = await supabase
                .from("baloria_answers")
                .update({ is_accepted: newIsAccepted })
                .eq("id", answerId);

            if (error) throw error;

            if (newIsAccepted) {
                toast.success("Antwoord gemarkeerd als beste antwoord! 🌟");
                // TODO: Award karma via Edge Function (later)
            }
        } catch (err) {
            console.error("Error accepting answer:", err);
            toast.error("Kon actie niet uitvoeren");
            // Revert on error
            fetchQuestionDetails();
        }
    };

    if (!isOpen || !questionId) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl"
                    style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4D96FF" }} />
                        </div>
                    ) : isSuccessView && question ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2" style={{ color: "#F1F5F9" }}>
                                Bedankt voor je antwoord! 🙏
                            </h2>
                            <p className="text-slate-400 max-w-md mb-8">
                                Je hebt zojuist bijgedragen aan de community. Je antwoord staat nu live.
                            </p>

                            <div className="flex flex-col gap-3 w-full max-w-xs">
                                {!question.is_anonymous && question.author_profile && question.author_id !== user?.id && (
                                    <Button
                                        onClick={() => question.author_id && setSelectedProfileId(question.author_id)}
                                        variant="outline"
                                        className="gap-2 w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200"
                                    >
                                        {question.author_profile.avatar_url && (
                                            <img
                                                src={question.author_profile.avatar_url}
                                                alt="Avatar"
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                        )}
                                        Bekijk profiel van {question.author_profile.display_name}
                                    </Button>
                                )}
                                <Button
                                    onClick={onClose}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                    Sluiten
                                </Button>
                            </div>
                        </div>
                    ) : question ? (
                        <>
                            {/* Header */}
                            <div className="flex items-start justify-between p-6 pb-4 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span
                                            className="rounded-full px-3 py-1 text-xs font-semibold"
                                            style={{ background: `${question.theme_color}20`, color: question.theme_color }}
                                        >
                                            {question.theme}
                                        </span>
                                        {question.is_ai_generated && (
                                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                AI Generated
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-xs" style={{ color: "#64748B" }}>
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(question.created_at), { locale: nl, addSuffix: true })}
                                        </span>
                                    </div>

                                    {/* Author & Follow */}
                                    {!question.is_anonymous && question.author_profile && user?.id !== question.author_id && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <button
                                                onClick={() => question.author_id && setSelectedProfileId(question.author_id)}
                                                className="text-sm font-medium hover:underline flex items-center gap-2"
                                                style={{ color: "#F1F5F9" }}
                                            >
                                                {question.author_profile.avatar_url && (
                                                    <img
                                                        src={question.author_profile.avatar_url}
                                                        alt="Avatar"
                                                        className="w-5 h-5 rounded-full object-cover"
                                                    />
                                                )}
                                                {question.author_profile.display_name}
                                                {question.author_profile.is_verified && (
                                                    <div className="bg-blue-500 rounded-full p-0.5">
                                                        <Check className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                                {question.author_profile.category_stats && question.author_profile.category_stats.length > 0 && (
                                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded ml-1">
                                                        Lvl {question.author_profile.category_stats[0].level} Expert
                                                    </span>
                                                )}
                                            </button>
                                            <button
                                                onClick={toggleFollow}
                                                className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors"
                                                style={{
                                                    background: isFollowing ? "transparent" : "#4D96FF20",
                                                    color: isFollowing ? "#64748B" : "#4D96FF",
                                                    border: isFollowing ? "1px solid #64748B" : "none"
                                                }}
                                            >
                                                {isFollowing ? "Volgend" : "Volgen"}
                                            </button>
                                        </div>
                                    )}

                                    <h2 className="text-xl font-display font-bold mb-3" style={{ color: "#F1F5F9" }}>
                                        <RichTextDisplay content={question.question} />
                                    </h2>

                                    {question.image_url && (
                                        <div className="mb-4 rounded-xl overflow-hidden border border-slate-700/50 max-w-md">
                                            <img src={question.image_url} alt="Question attachment" className="w-full h-auto" />
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {question.baloria_question_tags && question.baloria_question_tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {question.baloria_question_tags.map((tagRef, i) => (
                                                <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300">
                                                    #{tagRef.baloria_tags.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleToggleHeart}
                                            className="flex items-center gap-1.5 text-sm transition-all hover:scale-105"
                                            style={{ color: userHearted ? "#FF6B8B" : "#64748B" }}
                                        >
                                            <Heart className="w-4 h-4" fill={userHearted ? "#FF6B8B" : "none"} />
                                            {question.hearts_count}
                                        </button>
                                        <span className="flex items-center gap-1.5 text-sm" style={{ color: "#64748B" }}>
                                            <MessageCircle className="w-4 h-4" />
                                            {question.answers_count} antwoorden
                                        </span>
                                    </div>
                                </div>
                                <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5" style={{ color: "#64748B" }}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Answers */}
                            <div className="p-6">
                                {answers.length > 0 ? (
                                    <div className="space-y-4 mb-6">
                                        <h3 className="text-sm font-semibold" style={{ color: "#94A3B8" }}>
                                            Antwoorden ({answers.length})
                                        </h3>
                                        {answers.map((answer) => (
                                            <div
                                                key={answer.id}
                                                className="rounded-xl p-4"
                                                style={{ background: "#0F172A", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
                                            >
                                                <div className="text-sm mb-2 text-slate-200">
                                                    <RichTextDisplay content={answer.content} />
                                                </div>
                                                {answer.image_url && (
                                                    <div className="mb-2 rounded-lg overflow-hidden border border-slate-700/50 max-w-xs">
                                                        <img src={answer.image_url} alt="Answer attachment" className="w-full h-auto" />
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 text-xs" style={{ color: "#64748B" }}>
                                                    <span className="flex items-center gap-1">
                                                        <Heart className="w-3 h-3" />
                                                        {answer.hearts_count}
                                                    </span>
                                                    <span>
                                                        {formatDistanceToNow(new Date(answer.created_at), { locale: nl, addSuffix: true })}
                                                    </span>
                                                </div>

                                                {/* Best Answer Badge or Button */}
                                                <div className="absolute top-4 right-4 flex gap-2">
                                                    {answer.is_accepted && (
                                                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50 gap-1 hover:bg-yellow-500/30">
                                                            <Star className="w-3 h-3 fill-yellow-500" /> Beste Antwoord
                                                        </Badge>
                                                    )}

                                                    {user?.id === question.author_id && !question.is_anonymous && (
                                                        <button
                                                            onClick={() => handleAcceptAnswer(answer.id)}
                                                            className={`p-1.5 rounded-lg transition-colors ${answer.is_accepted
                                                                ? "text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20"
                                                                : "text-slate-600 hover:text-slate-400 hover:bg-slate-800"
                                                                }`}
                                                            title={answer.is_accepted ? "Markering verwijderen" : "Markeer als beste antwoord"}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 mb-6">
                                        <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "#64748B" }} />
                                        <p className="text-sm" style={{ color: "#64748B" }}>
                                            Nog geen antwoorden. Wees de eerste!
                                        </p>
                                    </div>
                                )}

                                {/* Answer Form */}
                                <div className="rounded-xl p-4" style={{ background: "#0F172A" }}>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                                            Jouw antwoord
                                        </label>
                                        <span className="text-xs" style={{ color: canAnswer ? "#10B981" : "#EF4444" }}>
                                            {answersLeft} antwoorden over vandaag
                                        </span>
                                    </div>
                                    <div className="bg-[#1E293B] rounded-lg overflow-hidden border border-slate-700/50 mb-3">
                                        <ReactQuill
                                            theme="snow"
                                            value={answerText}
                                            onChange={setAnswerText}
                                            placeholder="Deel je antwoord..."
                                            modules={{
                                                toolbar: [
                                                    ['bold', 'italic', 'underline'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['clean']
                                                ]
                                            }}
                                            className="text-slate-200"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {/* <p className="text-[11px]" style={{ color: "#475569" }}>
                                            {answerText.length} / 1000
                                        </p> */}
                                        <div />
                                        <Button
                                            onClick={handleSubmitAnswer}
                                            disabled={(!answerText.trim() && !selectedImage) || submitting || !canAnswer}
                                            className="gap-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-40"
                                            size="sm"
                                        >
                                            <Send className="w-3 h-3" />
                                            {submitting ? "Bezig..." : "Antwoorden"}
                                        </Button>
                                    </div>

                                    <div className="mt-2">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageSelect}
                                            accept="image/png, image/jpeg, image/webp"
                                            className="hidden"
                                        />

                                        {imagePreview ? (
                                            <div className="relative rounded-lg overflow-hidden border border-slate-700/50 inline-block">
                                                <img src={imagePreview} alt="Preview" className="max-h-24 object-cover" />
                                                <button
                                                    onClick={removeImage}
                                                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-xs flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                                                style={{ color: "#64748B" }}
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                Afbeelding toevoegen
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-6 text-center">
                            <p style={{ color: "#64748B" }}>Vraag niet gevonden</p>
                        </div>
                    )}
                </motion.div>
                <PublicProfileModal
                    isOpen={!!selectedProfileId}
                    onClose={() => setSelectedProfileId(null)}
                    userId={selectedProfileId}
                />
            </motion.div>
        </AnimatePresence>
    );
};

export default QuestionDetailModal;
