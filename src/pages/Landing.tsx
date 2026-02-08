import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import BallPitCanvas from "@/components/landing/BallPitCanvas";
import AnimatedTitle from "@/components/landing/AnimatedTitle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, Zap, Users, Sparkles, ArrowRight, Globe, Heart } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: MessageCircle, title: t("feature.questions"), desc: t("feature.questionsDesc"), color: "hsl(var(--ball-blue))" },
    { icon: Shield, title: t("feature.privacy"), desc: t("feature.privacyDesc"), color: "hsl(var(--ball-green))" },
    { icon: Zap, title: t("feature.fast"), desc: t("feature.fastDesc"), color: "hsl(var(--ball-yellow))" },
    { icon: Users, title: t("feature.connect"), desc: t("feature.connectDesc"), color: "hsl(var(--ball-purple))" },
  ];

  const stats = [
    { value: "8", label: t("stat.themes"), icon: Sparkles },
    { value: "15min", label: t("stat.responseTime"), icon: Zap },
    { value: "∞", label: t("stat.possibilities"), icon: Globe },
    { value: "100%", label: t("stat.anonymous"), icon: Shield },
  ];

  const ballTypes = [
    { name: t("ball.vacancies"), color: "hsl(var(--ball-vacature))", icon: "🟦" },
    { name: t("ball.housing"), color: "hsl(var(--ball-woning))", icon: "🟩" },
    { name: t("ball.education"), color: "hsl(var(--ball-opleiding))", icon: "🟨" },
    { name: t("ball.collaboration"), color: "hsl(var(--ball-samenwerking))", icon: "🟪" },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#0F172A" }}>
      <LanguageSwitcher />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <BallPitCanvas ballCount={50} gravity={0} friction={0.974} wallBounce={0.7} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0F172A] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="mb-4">
            <AnimatedTitle />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }} className="mb-4 text-lg sm:text-xl font-body font-light tracking-wide" style={{ color: "#94A3B8" }}>
            {t("landing.subtitle")}
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.6 }} className="mb-10 max-w-md text-sm sm:text-base font-body" style={{ color: "#64748B" }}>
            {t("landing.desc")}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" onClick={() => navigate("/register")} className="min-w-[200px] h-13 rounded-pill text-base font-semibold bg-primary hover:bg-primary/90 glow-primary transition-all duration-300 gap-2">
              {t("landing.cta")}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="min-w-[200px] h-13 rounded-pill text-base font-semibold border-2 transition-all duration-300 hover:scale-105" style={{ borderColor: "hsl(217, 91%, 60%)", color: "hsl(217, 91%, 60%)", background: "transparent" }}>
              {t("landing.login")}
            </Button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-8 flex flex-col items-center gap-2">
          <span className="text-xs tracking-widest uppercase" style={{ color: "#475569" }}>{t("landing.scroll")}</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: "#475569" }}>
            <div className="w-1 h-1.5 rounded-full" style={{ background: "#94A3B8" }} />
          </motion.div>
        </motion.div>
      </section>

      {/* ===== WAT IS BALORIA ===== */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-sm font-body font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "hsl(var(--ball-blue))" }}>
            {t("landing.whatIs")}
          </motion.p>
          <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold mb-6 tracking-tight" style={{ color: "#F1F5F9" }}>
            {t("landing.whereLive")}
            <br />
            <span className="text-gradient"> {t("landing.whereLive2")}</span>
          </motion.h2>
          <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} className="text-base sm:text-lg max-w-2xl mx-auto font-body leading-relaxed" style={{ color: "#94A3B8" }}>
            {t("landing.whatIsDesc")}
          </motion.p>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="group relative p-8 rounded-2xl border transition-all duration-300 hover:scale-[1.02]" style={{ background: "#1E293B", borderColor: "#334155" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}22` }}>
                <f.icon className="w-6 h-6" style={{ color: f.color }} />
              </div>
              <h3 className="text-xl font-display font-bold mb-3" style={{ color: "#F1F5F9" }}>{f.title}</h3>
              <p className="text-sm font-body leading-relaxed" style={{ color: "#94A3B8" }}>{f.desc}</p>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 0 1px ${f.color}33, 0 0 30px ${f.color}11` }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className="relative py-16 px-4">
        <div className="max-w-4xl mx-auto rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-4 gap-6" style={{ background: "#1E293B", border: "1px solid #334155" }}>
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="flex flex-col items-center text-center gap-2">
              <s.icon className="w-5 h-5" style={{ color: "hsl(var(--ball-blue))" }} />
              <span className="text-3xl sm:text-4xl font-display font-extrabold" style={{ color: "#F1F5F9" }}>{s.value}</span>
              <span className="text-xs font-body tracking-wider uppercase" style={{ color: "#64748B" }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== HOE WERKT HET ===== */}
      <section className="relative py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-sm font-body font-semibold tracking-[0.2em] uppercase mb-4 text-center" style={{ color: "hsl(var(--ball-purple))" }}>
            {t("landing.howItWorks")}
          </motion.p>
          <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-3xl sm:text-5xl font-display font-extrabold mb-16 text-center tracking-tight" style={{ color: "#F1F5F9" }}>
            {t("landing.threeSteps")}
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: t("landing.step1"), desc: t("landing.step1Desc"), color: "hsl(var(--ball-orange))" },
              { step: "02", title: t("landing.step2"), desc: t("landing.step2Desc"), color: "hsl(var(--ball-blue))" },
              { step: "03", title: t("landing.step3"), desc: t("landing.step3Desc"), color: "hsl(var(--ball-green))" },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="text-center">
                <span className="text-6xl font-display font-extrabold block mb-4 opacity-20" style={{ color: item.color }}>{item.step}</span>
                <h3 className="text-xl font-display font-bold mb-3" style={{ color: "#F1F5F9" }}>{item.title}</h3>
                <p className="text-sm font-body leading-relaxed" style={{ color: "#94A3B8" }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SPECIALE BALLEN ===== */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="text-sm font-body font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "hsl(var(--ball-yellow))" }}>
            {t("landing.moreThanQA")}
          </motion.p>
          <motion.h2 variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} className="text-3xl sm:text-5xl font-display font-extrabold mb-12 tracking-tight" style={{ color: "#F1F5F9" }}>
            {t("landing.specialBalls")}
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ballTypes.map((b, i) => (
              <motion.div key={b.name} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i} className="p-6 rounded-2xl border text-center transition-all hover:scale-105" style={{ background: "#1E293B", borderColor: `${b.color}33` }}>
                <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: `${b.color}22`, boxShadow: `0 0 20px ${b.color}22` }}>{b.icon}</div>
                <span className="text-sm font-body font-semibold" style={{ color: "#F1F5F9" }}>{b.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative py-24 px-4">
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} className="max-w-3xl mx-auto text-center rounded-3xl p-12 relative overflow-hidden" style={{ background: "#1E293B", border: "1px solid #334155" }}>
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, hsl(217, 91%, 60%) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <Heart className="w-10 h-10 mx-auto mb-6" style={{ color: "hsl(var(--ball-red))" }} />
            <h2 className="text-3xl sm:text-4xl font-display font-extrabold mb-4 tracking-tight" style={{ color: "#F1F5F9" }}>{t("landing.readyToPlay")}</h2>
            <p className="text-base font-body mb-8 max-w-md mx-auto" style={{ color: "#94A3B8" }}>{t("landing.readyDesc")}</p>
            <Button size="lg" onClick={() => navigate("/register")} className="h-13 px-10 rounded-pill text-base font-semibold bg-primary hover:bg-primary/90 glow-primary transition-all duration-300 gap-2">
              {t("landing.startNow")}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 px-4 text-center space-y-4" style={{ borderTop: "1px solid #1E293B" }}>
        <div className="flex justify-center gap-6 text-xs font-body" style={{ color: "#64748B" }}>
          <Link to="/about" className="hover:underline">{t("footer.about")}</Link>
          <Link to="/privacy" className="hover:underline">{t("footer.privacy")}</Link>
          <Link to="/terms" className="hover:underline">{t("footer.terms")}</Link>
          <Link to="/contact" className="hover:underline">{t("footer.contact")}</Link>
        </div>
        <p className="text-xs font-body tracking-widest uppercase" style={{ color: "#475569" }}>{t("landing.footer")}</p>
      </footer>
    </div>
  );
};

export default Landing;
