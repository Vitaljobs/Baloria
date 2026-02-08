import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";

const Contact = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const projectId = useBaloriaProject();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast({ title: t("contact.fillAll"), variant: "destructive" });
      return;
    }
    if (!projectId) {
      toast({ title: "Project niet gevonden", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: form.name.trim().slice(0, 100),
        email: form.email.trim().slice(0, 255),
        subject: form.subject.trim().slice(0, 200),
        message: form.message.trim().slice(0, 2000),
        project_id: projectId,
        project_source: "baloria",
      });
      if (error) throw error;

      // Send confirmation email via edge function
      supabase.functions.invoke("send-email", {
        body: {
          type: "contact_confirmation",
          to: form.email.trim(),
          data: { name: form.name.trim(), subject: form.subject.trim() },
        },
      }).catch(() => {/* non-critical */});

      toast({ title: t("contact.success") });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({ title: t("contact.error"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "#0F172A" }}>
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 gap-2" style={{ color: "#94A3B8" }}>
          <ArrowLeft className="w-4 h-4" /> {t("pages.back")}
        </Button>
        <h1 className="text-3xl font-display font-extrabold mb-2" style={{ color: "#F1F5F9" }}>{t("contact.title")}</h1>
        <p className="text-sm mb-8" style={{ color: "#94A3B8" }}>{t("contact.subtitle")}</p>

        <div className="rounded-2xl p-6 mb-8" style={{ background: "#1E293B", border: "1px solid #334155" }}>
          <div className="flex items-center gap-3 mb-1">
            <Mail className="w-5 h-5" style={{ color: "hsl(217, 91%, 60%)" }} />
            <span className="text-sm font-medium" style={{ color: "#F1F5F9" }}>voidezss@gmail.com</span>
          </div>
          <p className="text-xs ml-8" style={{ color: "#64748B" }}>{t("contact.emailNote")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>{t("contact.name")}</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="border-0 rounded-lg" style={{ background: "#1E293B", color: "#F1F5F9" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>{t("contact.email")}</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={255} className="border-0 rounded-lg" style={{ background: "#1E293B", color: "#F1F5F9" }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>{t("contact.subject")}</label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={200} className="border-0 rounded-lg" style={{ background: "#1E293B", color: "#F1F5F9" }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>{t("contact.message")}</label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={2000} rows={6} className="border-0 rounded-lg resize-none" style={{ background: "#1E293B", color: "#F1F5F9" }} />
          </div>
          <Button type="submit" disabled={loading} className="w-full gap-2 rounded-lg bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" /> {loading ? "..." : t("contact.send")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
