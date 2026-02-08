import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Send, Eye, EyeOff, MapPin, Users, Calendar, ChevronRight, ImageIcon, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BALL_CATEGORIES, SPECIAL_BALLS, QUESTION_FILTERS } from "@/lib/categories";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { useDailyQuota } from "@/hooks/useDailyQuota";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { useBadges } from "@/hooks/useBadges";
import { useTags } from "@/hooks/useTags";
import TagInput from "./TagInput";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionPosted?: () => void;
}

const allCategories = [...BALL_CATEGORIES, ...SPECIAL_BALLS];

const AskQuestionModal = ({ isOpen, onClose, onQuestionPosted }: AskQuestionModalProps) => {
  const { user } = useAuth();
  const projectId = useBaloriaProject();
  const { canAskQuestion, refetch: refetchQuota } = useDailyQuota();
  const { checkAction } = useDailyChallenges();
  const { checkBadges } = useBadges();
  const { createTag } = useTags();
  const [step, setStep] = useState<"category" | "compose">("category");
  const [selectedCategory, setSelectedCategory] = useState<typeof allCategories[number] | null>(null);
  const [question, setQuestion] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleCategorySelect = (cat: typeof allCategories[number]) => {
    setSelectedCategory(cat);
    setStep("compose");
  };

  const handleSubmit = async () => {
    if (!user || !projectId || !selectedCategory || !question.trim()) return;
    if (!canAskQuestion) {
      toast.error("Je dagelijks limiet is bereikt (3 vragen per dag)");
      return;
    }
    setSubmitting(true);
    try {
      let imageUrl = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("question-images")
          .upload(filePath, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("question-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase.from("baloria_questions").insert({
        author_id: user.id,
        project_id: projectId,
        question: question.trim().slice(0, 3000),
        theme: selectedCategory.name,
        theme_color: selectedCategory.color,
        is_anonymous: isAnonymous,
        status: "open",
        image_url: imageUrl,
      }).select().single();

      if (error) throw error;

      // Handle tags
      if (tags.length > 0 && data) {
        // Create tags if needed and get IDs
        const tagPromises = tags.map(async (tagName) => {
          const tag = await createTag(tagName);
          return tag?.id;
        });

        const tagIds = (await Promise.all(tagPromises)).filter(Boolean);

        if (tagIds.length > 0) {
          const tagRelations = tagIds.map(tagId => ({
            question_id: data.id,
            tag_id: tagId
          }));
          // @ts-ignore
          await supabase.from("baloria_question_tags").insert(tagRelations);
        }
      }

      toast.success("Bal gegooid! 🎾");
      refetchQuota();
      onQuestionPosted?.();
      onClose();
      setStep("category");
      setSelectedCategory(null);
      setQuestion("");
      setTags([]);
      setIsAnonymous(false);
      removeImage();
    } catch (err: any) {
      console.error("Error posting question:", err);
      toast.error("Kon vraag niet plaatsen. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep("category");
    setSelectedCategory(null);
  };

  if (!isOpen) return null;

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
          className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
            <div className="flex items-center gap-3">
              {step === "compose" && selectedCategory && (
                <button onClick={handleBack} className="text-sm" style={{ color: "#64748B" }}>
                  ← Terug
                </button>
              )}
              <h2 className="text-lg font-display font-bold" style={{ color: "#F1F5F9" }}>
                {step === "category" ? "Kies een categorie" : "Stel je vraag"}
              </h2>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white/5" style={{ color: "#64748B" }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === "category" ? (
              <>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#475569" }}>Thema's</p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {BALL_CATEGORIES.map((cat) => (
                    <button key={cat.id} onClick={() => handleCategorySelect(cat)}
                      className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.02] group"
                      style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}20` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${cat.color}15` }}>{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{cat.name}</p>
                        <p className="text-[11px] truncate" style={{ color: "#64748B" }}>{cat.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "#64748B" }} />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#475569" }}>Speciale Ballen</p>
                <div className="grid grid-cols-2 gap-2">
                  {SPECIAL_BALLS.map((cat) => (
                    <button key={cat.id} onClick={() => handleCategorySelect(cat)}
                      className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.02] group"
                      style={{ background: `${cat.color}08`, border: `1px solid ${cat.color}20` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${cat.color}15` }}>{cat.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#F1F5F9" }}>{cat.name}</p>
                        <p className="text-[11px] truncate" style={{ color: "#64748B" }}>{cat.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "#64748B" }} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              selectedCategory && (
                <>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                      style={{ background: `${selectedCategory.color}15`, color: selectedCategory.color }}>
                      <span>{selectedCategory.icon}</span>{selectedCategory.name}
                    </div>
                    {!canAskQuestion && (
                      <span className="text-xs px-2 py-1 rounded-md" style={{ background: "#EF444420", color: "#EF4444" }}>
                        Dagelijks limiet bereikt
                      </span>
                    )}
                  </div>
                  <div className="mb-5">
                    <label className="text-xs font-medium mb-2 block" style={{ color: "#94A3B8" }}>Je vraag</label>
                    <div className="bg-[#0F172A] rounded-xl overflow-hidden border border-slate-700/50">
                      <ReactQuill
                        theme="snow"
                        value={question}
                        onChange={setQuestion}
                        placeholder="Typ je vraag hier..."
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['clean']
                          ]
                        }}
                        className="text-slate-200"
                      />
                    </div>
                    {/* <p className="text-[11px] mt-1 text-right" style={{ color: "#475569" }}>{question.length} / 500</p> */}
                  </div>

                  {/* Image Upload */}
                  <div className="mb-5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-700/50 inline-block">
                        <img src={imagePreview} alt="Preview" className="max-h-40 object-cover" />
                        <button
                          onClick={removeImage}
                          className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2 border-slate-700/50 hover:bg-slate-800 text-slate-300"
                        style={{ background: "#1E293B" }}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Afbeelding toevoegen (max 2MB)
                      </Button>
                    )}
                  </div>

                  <div className="mb-5">
                    <label className="text-xs font-medium mb-2 block" style={{ color: "#94A3B8" }}>Tags (optioneel)</label>
                    <TagInput selectedTags={tags} onChange={setTags} />
                  </div>

                  {/* Anonymous toggle */}
                  <div className="flex items-center justify-between rounded-xl p-3 mb-6" style={{ background: "#0F172A" }}>
                    <div className="flex items-center gap-2">
                      {isAnonymous ? <EyeOff className="w-4 h-4" style={{ color: "#9D4EDD" }} /> : <Eye className="w-4 h-4" style={{ color: "#64748B" }} />}
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>Anoniem plaatsen</p>
                        <p className="text-[11px]" style={{ color: "#64748B" }}>Je identiteit wordt verborgen</p>
                      </div>
                    </div>
                    <button onClick={() => setIsAnonymous(!isAnonymous)}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ background: isAnonymous ? "#9D4EDD" : "#334155" }}>
                      <div className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
                        style={{ background: "#fff", left: 2, transform: isAnonymous ? "translateX(20px)" : "translateX(0)" }} />
                    </button>
                  </div>

                  <Button onClick={handleSubmit} disabled={!question.trim() || submitting || !canAskQuestion}
                    className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90 glow-primary gap-2 disabled:opacity-40">
                    <Send className="w-4 h-4" />
                    {submitting ? "Bezig..." : "Bal gooien!"}
                  </Button>
                </>
              )
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence >
  );
};

export default AskQuestionModal;
