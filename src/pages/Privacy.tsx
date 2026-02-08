import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "#0F172A" }}>
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 gap-2" style={{ color: "#94A3B8" }}>
          <ArrowLeft className="w-4 h-4" /> {t("pages.back")}
        </Button>
        <h1 className="text-3xl font-display font-extrabold mb-8" style={{ color: "#F1F5F9" }}>{t("privacy.title")}</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
          <p>{t("privacy.intro")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("privacy.collect.title")}</h2>
          <p>{t("privacy.collect.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("privacy.use.title")}</h2>
          <p>{t("privacy.use.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("privacy.share.title")}</h2>
          <p>{t("privacy.share.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("privacy.cookies.title")}</h2>
          <p>{t("privacy.cookies.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("privacy.rights.title")}</h2>
          <p>{t("privacy.rights.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("privacy.contact.title")}</h2>
          <p>{t("privacy.contact.text")}</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
