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
  fallSpeed: number;
  flutter: number;
  sway: number;
  color: string;
};

const colors = ["#22db79", "#176836", "#e5ae35", "#8f86ff", "#43a9d6", "#f07891"];
const duration = 9500;
const burstDrag = 4;

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

      const originX = width / 2;
      const originY = height * .3;
      const count = width <= 560 ? 150 : 240;
      pieces = Array.from({ length: count }, () => {
        const fallSpeed = 55 + Math.random() * 45;
        // One expansive pop, followed by a slow, air-resistant descent.
        const targetX = width * (.03 + Math.random() * .94);
        const targetY = height * (.02 + Math.random() * .68);
        return {
          x: originX,
          y: originY,
          vx: (targetX - originX) * burstDrag,
          vy: (targetY - originY) * burstDrag + fallSpeed,
          width: 4 + Math.random() * 5,
          height: 7 + Math.random() * 7,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - .5) * 7,
          fallSpeed,
          flutter: Math.random() * Math.PI * 2,
          sway: 10 + Math.random() * 16,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
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
      context.globalAlpha = Math.min(.95, (duration - elapsed) / 1400);
      const decay = Math.exp(-burstDrag * step);
      const travel = (1 - decay) / burstDrag;

      for (const piece of pieces) {
        piece.x += piece.vx * travel;
        piece.y += piece.fallSpeed * step + (piece.vy - piece.fallSpeed) * travel;
        piece.vx *= decay;
        piece.vy = piece.fallSpeed + (piece.vy - piece.fallSpeed) * decay;
        piece.angle += piece.spin * step;
        if (piece.y > height + 20 || piece.x < -20 || piece.x > width + 20) continue;
        context.save();
        const flutter = elapsed / 1000 * 3 + piece.flutter;
        context.translate(piece.x + Math.sin(flutter) * piece.sway, piece.y);
        context.rotate(piece.angle);
        context.scale(1, .3 + Math.abs(Math.cos(flutter)) * .7);
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
