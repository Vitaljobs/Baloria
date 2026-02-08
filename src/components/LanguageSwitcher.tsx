import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed top-6 right-6 z-50 flex rounded-full p-1"
      style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.6)", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
    >
      <button
        onClick={() => setLang("nl")}
        className="relative rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
        style={{ color: lang === "nl" ? "#F1F5F9" : "#64748B" }}
      >
        {lang === "nl" && (
          <motion.div
            layoutId="lang-indicator"
            className="absolute inset-0 rounded-full"
            style={{ background: "#4D96FF20", border: "1px solid #4D96FF40" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10">🇳🇱 NL</span>
      </button>
      <button
        onClick={() => setLang("en")}
        className="relative rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
        style={{ color: lang === "en" ? "#F1F5F9" : "#64748B" }}
      >
        {lang === "en" && (
          <motion.div
            layoutId="lang-indicator"
            className="absolute inset-0 rounded-full"
            style={{ background: "#4D96FF20", border: "1px solid #4D96FF40" }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <span className="relative z-10">🇬🇧 EN</span>
      </button>
    </motion.div>
  );
};

export default LanguageSwitcher;
