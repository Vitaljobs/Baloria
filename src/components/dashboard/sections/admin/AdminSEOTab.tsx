import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Search, FileText, Image, Link2, CheckCircle2,
  AlertTriangle, BarChart3, ExternalLink, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SEOPage {
  path: string;
  title: string;
  description: string;
  status: "good" | "warning" | "error";
  issues: string[];
}

const seoPages: SEOPage[] = [
  {
    path: "/",
    title: "Baloria – Anoniem vragen stellen & verbinden",
    description: "Het platform waar je anoniem vragen kunt stellen, eerlijke antwoorden krijgt en echte connecties maakt.",
    status: "good",
    issues: [],
  },
  {
    path: "/login",
    title: "Inloggen – Baloria",
    description: "Log in op je Baloria account om vragen te stellen en te beantwoorden.",
    status: "good",
    issues: [],
  },
  {
    path: "/register",
    title: "Registreren – Baloria",
    description: "Maak een gratis Baloria account aan en begin met het stellen van vragen.",
    status: "good",
    issues: [],
  },
  {
    path: "/dashboard",
    title: "Dashboard – Baloria",
    description: "Je persoonlijk dashboard met statistieken, vragen en antwoorden.",
    status: "warning",
    issues: ["Meta description kan specifieker", "Canonical tag ontbreekt"],
  },
];

const seoChecklist = [
  { label: "Title tags < 60 tekens", done: true },
  { label: "Meta descriptions < 160 tekens", done: true },
  { label: "Semantic HTML (header, main, section)", done: true },
  { label: "Open Graph tags", done: false },
  { label: "Twitter Card tags", done: false },
  { label: "Structured Data (JSON-LD)", done: false },
  { label: "Sitemap.xml", done: false },
  { label: "Robots.txt", done: true },
  { label: "Canonical URLs", done: false },
  { label: "Alt teksten op afbeeldingen", done: true },
  { label: "Lazy loading images", done: true },
  { label: "Mobile responsive", done: true },
];

const AdminSEOTab = () => {
  const [selectedPage, setSelectedPage] = useState<SEOPage | null>(null);

  const completedCount = seoChecklist.filter((c) => c.done).length;
  const seoScore = Math.round((completedCount / seoChecklist.length) * 100);

  return (
    <>
      {/* SEO Score */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-5 col-span-1" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: seoScore >= 70 ? "#10B98120" : "#F59E0B20" }}>
              <BarChart3 className="w-5 h-5" style={{ color: seoScore >= 70 ? "#10B981" : "#F59E0B" }} />
            </div>
            <div>
              <p className="text-3xl font-bold font-display" style={{ color: seoScore >= 70 ? "#10B981" : "#F59E0B" }}>{seoScore}%</p>
              <p className="text-xs" style={{ color: "#64748B" }}>SEO Score</p>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#0F172A" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${seoScore}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: seoScore >= 70 ? "linear-gradient(90deg, #10B981, #6BCF7F)" : "linear-gradient(90deg, #F59E0B, #FFD93D)" }}
            />
          </div>
          <p className="text-[11px] mt-2" style={{ color: "#64748B" }}>{completedCount}/{seoChecklist.length} checks</p>
        </div>

        <div className="rounded-xl p-5 col-span-2" style={{ background: "#1E293B", border: "1px solid hsla(215, 25%, 22%, 0.5)" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "#F1F5F9" }}>SEO Checklist</p>
          <div className="grid grid-cols-2 gap-1.5">
            {seoChecklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs py-1">
                {item.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#10B981" }} />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: "#F59E0B" }} />
                )}
                <span style={{ color: item.done ? "#94A3B8" : "#F1F5F9" }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pages Overview */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
        Pagina's
      </p>
      <div className="space-y-2">
        {seoPages.map((page, i) => (
          <motion.div
            key={page.path}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedPage(selectedPage?.path === page.path ? null : page)}
            className="rounded-xl p-4 cursor-pointer transition-all hover:bg-white/[0.02]"
            style={{
              background: selectedPage?.path === page.path ? "#1E293B" : "#1E293B",
              border: `1px solid ${selectedPage?.path === page.path ? "#4D96FF30" : "hsla(215, 25%, 22%, 0.5)"}`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: page.status === "good" ? "#10B98120" : page.status === "warning" ? "#F59E0B20" : "#EF444420" }}>
                {page.status === "good" ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: "#10B981" }} />
                ) : (
                  <AlertTriangle className="w-4 h-4" style={{ color: page.status === "warning" ? "#F59E0B" : "#EF4444" }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium" style={{ color: "#F1F5F9" }}>{page.path}</p>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize" style={{
                    background: page.status === "good" ? "#10B98120" : page.status === "warning" ? "#F59E0B20" : "#EF444420",
                    color: page.status === "good" ? "#10B981" : page.status === "warning" ? "#F59E0B" : "#EF4444",
                  }}>
                    {page.status === "good" ? "OK" : page.status === "warning" ? "Let op" : "Probleem"}
                  </span>
                </div>
                <p className="text-xs font-medium" style={{ color: "#94A3B8" }}>{page.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#64748B" }}>{page.description}</p>
              </div>
            </div>

            {/* Expanded details */}
            {selectedPage?.path === page.path && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4"
                style={{ borderTop: "1px solid hsla(215, 25%, 22%, 0.5)" }}
              >
                {page.issues.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold" style={{ color: "#F59E0B" }}>Aandachtspunten:</p>
                    {page.issues.map((issue) => (
                      <div key={issue} className="flex items-center gap-2 text-xs" style={{ color: "#F59E0B" }}>
                        <AlertTriangle className="w-3 h-3" />
                        {issue}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#10B981" }}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Alles ziet er goed uit!
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs gap-1.5"
                    style={{ color: "#94A3B8" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(page.title);
                      toast.success("Title gekopieerd");
                    }}
                  >
                    <Copy className="w-3 h-3" /> Title kopiëren
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs gap-1.5"
                    style={{ color: "#94A3B8" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(page.description);
                      toast.success("Description gekopieerd");
                    }}
                  >
                    <Copy className="w-3 h-3" /> Description kopiëren
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default AdminSEOTab;
