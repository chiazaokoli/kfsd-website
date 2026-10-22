"use client";

import { useEffect, useRef } from "react";

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  angle: number;
  spin: number;
  color: string;
};

const colors = ["#22db79", "#315cff", "#e5ae35", "#8f86ff", "#43a9d6", "#f07891"];
const duration = 5400;

export default function WelcomeConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let pieces: Piece[] = [];
    let frame = 0;
    let previous = 0;
    const started = performance.now();

    const resize = () => {
      const oldWidth = width;
      const oldHeight = height;
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      if (pieces.length) {
        for (const piece of pieces) {
          piece.x *= width / oldWidth;
          piece.y *= height / oldHeight;
        }
        return;
      }

      const count = Math.min(260, Math.max(130, Math.round(width * height / 7000)));
      pieces = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * 54,
        vy: 80 + Math.random() * 100,
        width: 4 + Math.random() * 5,
        height: 7 + Math.random() * 7,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - .5) * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    const draw = (now: number) => {
      const elapsed = now - started;
      if (elapsed >= duration) {
        context.clearRect(0, 0, width, height);
        return;
      }

      const step = Math.min((now - (previous || now)) / 1000, .04);
      previous = now;
      context.clearRect(0, 0, width, height);
      context.globalAlpha = Math.min(.95, (duration - elapsed) / 650);

      for (const piece of pieces) {
        piece.x += piece.vx * step;
        piece.y += piece.vy * step;
        piece.angle += piece.spin * step;
        if (piece.y > height + 20) {
          piece.y = -20;
          piece.x = Math.random() * width;
        }
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.angle);
        context.fillStyle = piece.color;
        context.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
        context.restore();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="welcome-confetti" aria-hidden="true" />;
}
