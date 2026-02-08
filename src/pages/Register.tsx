import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) navigate("/dashboard", { replace: true });
  }, [user, authLoading, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error(t("register.fillAll")); return; }
    if (password.length < 8) { toast.error(t("register.passwordShort")); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      if (error.message.includes("already registered")) {
        toast.error(t("register.exists"));
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(t("register.success"));
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-[100px]" style={{ background: "#9D4EDD" }} />
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full blur-[80px]" style={{ background: "#6BCF7F" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-8 text-sm hover:opacity-80" style={{ color: "#94A3B8" }}>
          <ArrowLeft className="w-4 h-4" /> {t("login.back")}
        </button>

        <Card className="border-0 shadow-high" style={{ background: "#1E293B" }}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-display font-bold" style={{ color: "#F1F5F9" }}>{t("register.title")}</CardTitle>
            <CardDescription style={{ color: "#94A3B8" }}>{t("register.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#94A3B8" }}>{t("register.name")}</label>
                <Input type="text" placeholder={t("register.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-lg border-0" style={{ background: "#0F172A", color: "#F1F5F9" }} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#94A3B8" }}>{t("login.email")}</label>
                <Input type="email" placeholder="jouw@email.nl" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-lg border-0" style={{ background: "#0F172A", color: "#F1F5F9" }} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: "#94A3B8" }}>{t("login.password")}</label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder={t("register.passwordHint")} value={password}
                    onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-lg border-0 pr-12"
                    style={{ background: "#0F172A", color: "#F1F5F9" }} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#64748B" }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-12 rounded-lg text-base font-semibold bg-primary hover:bg-primary/90 glow-primary">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("register.submit")}
              </Button>
            </form>
            <p className="mt-6 text-center text-sm" style={{ color: "#64748B" }}>
              {t("register.hasAccount")}{" "}
              <Link to="/login" className="font-medium hover:underline" style={{ color: "#4D96FF" }}>{t("register.login")}</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
