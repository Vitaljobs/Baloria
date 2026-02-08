import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CircleDot } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0F172A" }}>
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full blur-[120px]" style={{ background: "#4D96FF" }} />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 rounded-full blur-[100px]" style={{ background: "#9D4EDD" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md"
      >
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #4D96FF, #9D4EDD)", boxShadow: "0 0 40px rgba(77, 150, 255, 0.3)" }}
        >
          <CircleDot className="w-10 h-10" style={{ color: "#fff" }} />
        </motion.div>

        <h1 className="text-6xl font-display font-extrabold mb-3 text-gradient">404</h1>
        <p className="text-lg font-display font-semibold mb-2" style={{ color: "#F1F5F9" }}>
          Deze bal is verdwenen!
        </p>
        <p className="text-sm mb-8" style={{ color: "#64748B" }}>
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>

        <Button
          onClick={() => navigate("/")}
          className="gap-2 rounded-lg bg-primary hover:bg-primary/90 glow-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Terug naar home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
