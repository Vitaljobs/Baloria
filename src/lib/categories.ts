export const BALL_CATEGORIES = [
  // 8 Main themes
  { id: "relaties", name: "Relaties & Liefde", icon: "❤️", color: "#FF6B8B", desc: "Daten, relaties, vriendschappen, familie" },
  { id: "carriere", name: "Carrière & Werk", icon: "🟠", color: "#FF9F43", desc: "Banen, sollicitaties, werkproblemen, groei" },
  { id: "financien", name: "Financiën & Welvaart", icon: "💰", color: "#FFD93D", desc: "Geld, sparen, investeren, schulden" },
  { id: "gezondheid", name: "Gezondheid & Lichaam", icon: "💚", color: "#6BCF7F", desc: "Fitness, mentale gezondheid, voeding" },
  { id: "spiritualiteit", name: "Spiritualiteit & Zingeving", icon: "🔵", color: "#4D96FF", desc: "Levensvragen, meditatie, filosofie" },
  { id: "creativiteit", name: "Creativiteit & Passie", icon: "🟣", color: "#9D4EDD", desc: "Kunst, muziek, hobby's, projecten" },
  { id: "praktisch", name: "Praktisch & Dagelijks", icon: "🟤", color: "#A1785F", desc: "Huishouden, tips, klussen, recepten" },
  { id: "existentieel", name: "Existentieel & Diep", icon: "⚫", color: "#3A3A3A", desc: "Levenskeuzes, toekomst, diepe gesprekken" },
  // Extra themes
  { id: "gevoelens", name: "Gevoelens & Emoties", icon: "💜", color: "#E879F9", desc: "Verdriet, blijdschap, frustratie — je hart luchten" },
  { id: "random", name: "Random / Algemeen", icon: "🎱", color: "#94A3B8", desc: "Alles wat nergens anders past" },
] as const;

export const SPECIAL_BALLS = [
  { id: "vacature", name: "Vacatures", icon: "🟦", color: "#36B5FF", desc: "Werkgevers plaatsen vacatures" },
  { id: "woning", name: "Woningen", icon: "🟩", color: "#2ECC71", desc: "Huur/koop woningen aanbieden" },
  { id: "opleiding", name: "Opleidingen", icon: "🟨", color: "#F1C40F", desc: "Cursussen en opleidingen" },
  { id: "samenwerking", name: "Samenwerking", icon: "🟪", color: "#9B59B6", desc: "Zoek partners voor projecten" },
] as const;

export const QUESTION_FILTERS = {
  geslacht: ["Iedereen", "Man", "Vrouw", "Non-binair"],
  leeftijd: ["Alle leeftijden", "13-17", "18-25", "26-35", "36-50", "50+"],
} as const;

export type BallCategory = typeof BALL_CATEGORIES[number];
export type SpecialBall = typeof SPECIAL_BALLS[number];
