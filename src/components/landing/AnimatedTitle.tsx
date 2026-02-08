import { motion } from "framer-motion";

const AnimatedTitle = () => {
  const letters = "BALORIA".split("");

  const colors = [
    "hsl(var(--ball-blue))",
    "hsl(var(--ball-purple))",
    "hsl(var(--ball-red))",
    "hsl(var(--ball-orange))",
    "hsl(var(--ball-yellow))",
    "hsl(var(--ball-green))",
    "hsl(var(--ball-blue))",
  ];

  return (
    <motion.div
      className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold select-none tracking-tighter"
          style={{
            display: "inline-block",
            color: colors[i],
            textShadow: `0 0 40px ${colors[i]}44, 0 0 80px ${colors[i]}22`,
          }}
          variants={{
            hidden: { opacity: 0, y: 80, rotateZ: -15, scale: 0.3 },
            visible: {
              opacity: 1,
              y: 0,
              rotateZ: 0,
              scale: 1,
              transition: {
                type: "spring",
                damping: 10,
                stiffness: 80,
                duration: 1,
              },
            },
          }}
          whileHover={{
            scale: 1.15,
            y: -15,
            color: "#fff",
            textShadow: `0 0 60px ${colors[i]}88, 0 0 120px ${colors[i]}44`,
            transition: { type: "spring", stiffness: 400 },
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default AnimatedTitle;
