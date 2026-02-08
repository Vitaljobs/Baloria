import { motion } from "framer-motion";
import {
  User, Bell, Shield, Palette, ChevronRight, Save, Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBaloriaProject } from "@/hooks/useBaloriaProject";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingToggleProps {
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}

const SettingToggle = ({ label, desc, enabled, onToggle }: SettingToggleProps) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{label}</p>
      <p className="text-xs" style={{ color: "#64748B" }}>{desc}</p>
    </div>
    <button onClick={onToggle} className="relative w-11 h-6 rounded-full transition-colors"
      style={{ background: enabled ? "#4D96FF" : "#334155" }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
        style={{ background: "#fff", left: 2, transform: enabled ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  </div>
);

const InstellingenSection = () => {
  const { user } = useAuth();
  const projectId = useBaloriaProject();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Account fields from DB
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  // Local preferences
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotif, setPushNotif] = useState(() => localStorage.getItem("bal-push") !== "false");
  const [emailNotif, setEmailNotif] = useState(() => localStorage.getItem("bal-email") === "true");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("bal-sound") !== "false");
  const [anonMode, setAnonMode] = useState(() => localStorage.getItem("bal-anon") === "true");

  const fetchProfile = useCallback(async () => {
    if (!user || !projectId) return;
    const { data } = await supabase
      .from("user_profiles")
      .select("id, display_name, bio, location, phone")
      .eq("user_id", user.id)
      .eq("project_id", projectId)
      .maybeSingle();

    if (data) {
      setProfileId(data.id);
      setDisplayName(data.display_name || "");
      setBio(data.bio || "");
      setLocation(data.location || "");
      setPhone(data.phone || "");
    }
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSaveAccount = async () => {
    if (!profileId) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_profiles")
      .update({
        display_name: displayName.trim().slice(0, 100) || null,
        bio: bio.trim().slice(0, 300) || null,
        location: location.trim().slice(0, 100) || null,
        phone: phone.trim().slice(0, 20) || null,
      })
      .eq("id", profileId);

    setSaving(false);
    if (error) {
      toast.error("Opslaan mislukt");
    } else {
      toast.success("Instellingen opgeslagen!");
    }
  };

  const togglePref = (key: string, value: boolean, setter: (v: boolean) => void) => {
    setter(value);
    localStorage.setItem(key, String(value));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{ background: "#0F172A" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#4D96FF" }} />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6" style={{ background: "#0F172A" }}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-display font-bold mb-1" style={{ color: "#F1F5F9" }}>Instellingen</h1>
        <p className="text-sm mb-8" style={{ color: "#64748B" }}>Beheer je account en voorkeuren</p>

        {/* Account Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 mb-4"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5" style={{ color: "#4D96FF" }} />
            <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Account</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>Weergavenaam</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100}
                className="h-10 rounded-lg border-0" style={{ background: "#0F172A", color: "#F1F5F9" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>Bio</label>
              <Input value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300}
                className="h-10 rounded-lg border-0" style={{ background: "#0F172A", color: "#F1F5F9" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>Locatie</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100}
                className="h-10 rounded-lg border-0" style={{ background: "#0F172A", color: "#F1F5F9" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>E-mailadres</label>
              <Input value={user?.email || ""} disabled
                className="h-10 rounded-lg border-0 opacity-60" style={{ background: "#0F172A", color: "#94A3B8" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#94A3B8" }}>Telefoon (optioneel)</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20}
                className="h-10 rounded-lg border-0" style={{ background: "#0F172A", color: "#F1F5F9" }} />
            </div>
            <Button onClick={handleSaveAccount} disabled={saving} size="sm"
              className="gap-2 rounded-lg bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4" /> {saving ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-4"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" style={{ color: "#FFD93D" }} />
            <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Meldingen</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
            <SettingToggle label="Push meldingen" desc="Ontvang meldingen op je apparaat" enabled={pushNotif}
              onToggle={() => togglePref("bal-push", !pushNotif, setPushNotif)} />
            <SettingToggle label="E-mail meldingen" desc="Dagelijkse samenvatting via e-mail" enabled={emailNotif}
              onToggle={() => togglePref("bal-email", !emailNotif, setEmailNotif)} />
            <SettingToggle label="Geluid" desc="Geluidseffecten bij meldingen" enabled={soundEnabled}
              onToggle={() => togglePref("bal-sound", !soundEnabled, setSoundEnabled)} />
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-4"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5" style={{ color: "#9D4EDD" }} />
            <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Weergave</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
            <SettingToggle label="Donker thema" desc="Gebruik het donkere kleurenschema" enabled={darkMode}
              onToggle={() => setDarkMode(!darkMode)} />
            <SettingToggle label="Anonieme modus" desc="Verberg je identiteit standaard in de ballebak" enabled={anonMode}
              onToggle={() => togglePref("bal-anon", !anonMode, setAnonMode)} />
          </div>
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 mb-4"
          style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" style={{ color: "#10B981" }} />
            <h3 className="font-display font-semibold" style={{ color: "#F1F5F9" }}>Privacy</h3>
          </div>
          <div className="divide-y" style={{ borderColor: "hsla(215, 25%, 22%, 0.5)" }}>
            <div className="flex items-center justify-between py-3 cursor-pointer group">
              <p className="text-sm" style={{ color: "#94A3B8" }}>Profiel zichtbaarheid</p>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "#F1F5F9" }}>Publiek</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#64748B" }} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstellingenSection;
