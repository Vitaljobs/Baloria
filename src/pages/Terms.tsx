import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Terms = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: "#0F172A" }}>
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-8 gap-2" style={{ color: "#94A3B8" }}>
          <ArrowLeft className="w-4 h-4" /> {t("pages.back")}
        </Button>
        <h1 className="text-3xl font-display font-extrabold mb-8" style={{ color: "#F1F5F9" }}>{t("terms.title")}</h1>
        <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed" style={{ color: "#94A3B8" }}>
          <p>{t("terms.intro")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("terms.usage.title")}</h2>
          <p>{t("terms.usage.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("terms.accounts.title")}</h2>
          <p>{t("terms.accounts.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("terms.content.title")}</h2>
          <p>{t("terms.content.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("terms.liability.title")}</h2>
          <p>{t("terms.liability.text")}</p>

          <h2 className="text-xl font-display font-bold mt-8" style={{ color: "#F1F5F9" }}>{t("terms.changes.title")}</h2>
          <p>{t("terms.changes.text")}</p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
