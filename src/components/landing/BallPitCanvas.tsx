import { useEffect, useRef, useCallback } from "react";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

const BALL_COLORS = [
  "#7C3AFF", "#00FF87", "#FF3D71", "#FFD60A", "#00C9FF",
  "#FF6B8B", "#FF9F43", "#A855F7", "#34D399", "#3B82F6", "#F472B6",
];

interface BallPitCanvasProps {
  className?: string;
  ballCount?: number;
  gravity?: number;
  friction?: number;
  wallBounce?: number;
  ballSize?: "small" | "medium" | "large";
}

const BallPitCanvas = ({
  className = "",
  ballCount = 60,
  gravity = 0,
  friction = 0.974,
  wallBounce = 0.7,
  ballSize = "medium",
}: BallPitCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initBalls = useCallback((width: number, height: number) => {
    const sizeRange = ballSize === "small" ? [4, 10] : ballSize === "large" ? [20, 48] : [10, 24];
    const balls: Ball[] = [];
    for (let i = 0; i < ballCount; i++) {
      const radius = sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]);
      balls.push({
        x: radius + Math.random() * (width - radius * 2),
        y: radius + Math.random() * (height - radius * 2),
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius,
        color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
        opacity: 0.8 + Math.random() * 0.2,
      });
    }
    ballsRef.current = balls;
  }, [ballCount, ballSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (ballsRef.current.length === 0) {
        initBalls(canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const balls = ballsRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        // Mouse repulsion
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120 && dist > 0) {
          const force = (120 - dist) / 120 * 2;
          b.vx += (dx / dist) * force;
          b.vy += (dy / dist) * force;
        }

        b.vy += gravity;
        b.vx *= friction;
        b.vy *= friction;
        b.x += b.vx;
        b.y += b.vy;

        // Wall bounce
        if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -wallBounce; }
        if (b.x + b.radius > canvas.width) { b.x = canvas.width - b.radius; b.vx *= -wallBounce; }
        if (b.y - b.radius < 0) { b.y = b.radius; b.vy *= -wallBounce; }
        if (b.y + b.radius > canvas.height) { b.y = canvas.height - b.radius; b.vy *= -wallBounce; }

        // Ball-ball collision
        for (let j = i + 1; j < balls.length; j++) {
          const b2 = balls[j];
          const cdx = b2.x - b.x;
          const cdy = b2.y - b.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          const minDist = b.radius + b2.radius;
          if (cdist < minDist && cdist > 0) {
            const nx = cdx / cdist;
            const ny = cdy / cdist;
            const overlap = minDist - cdist;
            b.x -= nx * overlap * 0.5;
            b.y -= ny * overlap * 0.5;
            b2.x += nx * overlap * 0.5;
            b2.y += ny * overlap * 0.5;
            const dvx = b.vx - b2.vx;
            const dvy = b.vy - b2.vy;
            const dvn = dvx * nx + dvy * ny;
            if (dvn > 0) {
              b.vx -= dvn * nx * 0.5;
              b.vy -= dvn * ny * 0.5;
              b2.vx += dvn * nx * 0.5;
              b2.vy += dvn * ny * 0.5;
            }
          }
        }

        // Draw ball with glow
        ctx.save();
        ctx.globalAlpha = b.opacity;

        // Outer glow - brighter
        const glow = ctx.createRadialGradient(b.x, b.y, b.radius * 0.3, b.x, b.y, b.radius * 2);
        glow.addColorStop(0, b.color + "70");
        glow.addColorStop(0.5, b.color + "25");
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Main ball - more vivid
        const grad = ctx.createRadialGradient(
          b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1,
          b.x, b.y, b.radius
        );
        grad.addColorStop(0, b.color + "FF");
        grad.addColorStop(0.5, b.color + "EE");
        grad.addColorStop(1, b.color + "99");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.globalAlpha = b.opacity * 0.6;
        const highlight = ctx.createRadialGradient(
          b.x - b.radius * 0.25, b.y - b.radius * 0.25, b.radius * 0.05,
          b.x - b.radius * 0.1, b.y - b.radius * 0.1, b.radius * 0.5
        );
        highlight.addColorStop(0, "rgba(255,255,255,0.8)");
        highlight.addColorStop(1, "transparent");
        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [gravity, friction, wallBounce, initBalls]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 ${className}`}
      style={{ pointerEvents: "auto" }}
    />
  );
};

export default BallPitCanvas;
