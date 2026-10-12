"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

type SkillIcon =
  | "thinking"
  | "listening"
  | "speaking"
  | "communicating"
  | "empathizing"
  | "collaborating";

const moments: Array<{ verb: string; icon: SkillIcon }> = [
  { verb: "Thinking", icon: "thinking" },
  { verb: "Listening", icon: "listening" },
  { verb: "Speaking", icon: "speaking" },
  { verb: "Communicating", icon: "communicating" },
  { verb: "Empathizing", icon: "empathizing" },
  { verb: "Collaborating", icon: "collaborating" },
];

function LineIcon({ name }: { name: SkillIcon }) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.65,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <svg className="splash-icon" viewBox="0 0 96 96" aria-hidden="true">
      {name === "thinking" && (
        <>
          <path {...commonProps} pathLength="1" d="M58 76H35c0-8-8-11-8-25 0-16 11-28 28-28 14 0 25 8 28 21l-8 8v12H61" />
          <path {...commonProps} pathLength="1" d="M43 75v8h17v-8" />
          <path {...commonProps} pathLength="1" d="M45 47c2-7 10-11 17-7 6 4 5 12 0 16-3 3-8 3-11 0-3-3-2-8 2-10 3-2 7 0 7 3" />
        </>
      )}
      {name === "listening" && (
        <>
          <path {...commonProps} pathLength="1" d="M61 72c-5 7-11 11-18 8-9-3-10-11-10-21V43c0-14 9-23 22-23 12 0 21 8 21 20 0 17-16 17-16 29 0 7-4 11-10 11" />
          <path {...commonProps} pathLength="1" d="M44 49c0-8 4-14 11-14 6 0 10 4 10 10 0 8-9 10-11 17" />
          <path {...commonProps} pathLength="1" d="M46 63c0 4 2 7 6 7" />
        </>
      )}
      {name === "speaking" && (
        <>
          <path {...commonProps} pathLength="1" d="M54 75H31V63c-6-5-10-12-10-20 0-15 12-27 27-27 13 0 24 9 27 21l-8 9v11H55" />
          <path {...commonProps} pathLength="1" d="M67 32c6 1 11 6 12 12" />
          <path {...commonProps} pathLength="1" d="M71 23c10 3 17 11 18 21" />
          <path {...commonProps} pathLength="1" d="M44 49c5-3 10-3 15 0" />
        </>
      )}
      {name === "communicating" && (
        <>
          <path {...commonProps} pathLength="1" d="M11 21h49v34H31L19 65V55h-8V21Z" />
          <path {...commonProps} pathLength="1" d="M37 65h25l15 11V65h8V36H68" />
          <path {...commonProps} pathLength="1" d="M23 34h25M23 43h17" />
          <path {...commonProps} pathLength="1" d="M56 48h17M56 56h10" />
        </>
      )}
      {name === "empathizing" && (
        <>
          <path {...commonProps} pathLength="1" d="M48 78C21 62 16 49 21 37c5-12 21-13 27-1 6-12 22-11 27 1 5 12 0 25-27 41Z" />
          <path {...commonProps} pathLength="1" d="M8 62c9 0 14 5 21 12l9 9" />
          <path {...commonProps} pathLength="1" d="M88 62c-9 0-14 5-21 12l-9 9" />
        </>
      )}
      {name === "collaborating" && (
        <>
          <circle {...commonProps} pathLength="1" cx="28" cy="31" r="10" />
          <circle {...commonProps} pathLength="1" cx="68" cy="31" r="10" />
          <path {...commonProps} pathLength="1" d="M10 73V62c0-10 8-17 18-17 8 0 14 4 17 10" />
          <path {...commonProps} pathLength="1" d="M86 73V62c0-10-8-17-18-17-8 0-14 4-17 10" />
          <path {...commonProps} pathLength="1" d="m31 64 11 10c4 4 8 4 12 0l11-10" />
        </>
      )}
    </svg>
  );
}

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      const main = document.querySelector("main");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (main instanceof HTMLElement) main.inert = true;
      document.body.classList.add("splash-active");

      let pageReleased = false;

      const releasePage = () => {
        if (pageReleased) return;
        pageReleased = true;
        onComplete();
      };

      const finish = () => {
        releasePage();
        if (main instanceof HTMLElement) {
          gsap.set(main, { clearProps: "opacity,filter,transform,textShadow" });
        }
        if (main instanceof HTMLElement) main.inert = false;
        document.body.classList.remove("splash-active");
        setVisible(false);
      };

      if (reduceMotion) {
        const timer = window.setTimeout(finish, 180);
        return () => {
          window.clearTimeout(timer);
          if (main instanceof HTMLElement) main.inert = false;
          document.body.classList.remove("splash-active");
        };
      }

      const items = gsap.utils.toArray<HTMLElement>(".splash-moment");
      const timeline = gsap.timeline({ onComplete: finish });

      gsap.set(items, { autoAlpha: 0, y: 22 });
      gsap.set(".splash-icon [pathLength]", { strokeDasharray: 1, strokeDashoffset: 1 });

      timeline
        .fromTo(".splash-brand", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0)
        .fromTo(".splash-progress-fill", { scaleX: 0 }, { scaleX: 1, duration: 2.18, ease: "power1.inOut" }, 0.05);

      items.forEach((item, index) => {
        const start = 0.08 + index * 0.35;
        const strokes = item.querySelectorAll("[pathLength]");

        timeline
          .to(item, { autoAlpha: 1, y: 0, duration: 0.18, ease: "power3.out" }, start)
          .to(strokes, { strokeDashoffset: 0, duration: 0.28, stagger: 0.018, ease: "power2.out" }, start)
          .to(item, { autoAlpha: 0, y: -18, duration: 0.16, ease: "power2.in" }, start + 0.27);
      });

      timeline
        .to(".splash-brand, .splash-footer", { opacity: 0, y: -10, duration: 0.25, ease: "power2.in" }, 2.12)
        .set(main, {
          opacity: 0.08,
          scale: 1.012,
          filter: "blur(20px) saturate(2.4) contrast(1.35) brightness(0.52)",
          textShadow: "7px 0 rgba(61, 93, 255, .72), -7px 0 rgba(255, 79, 96, .62)",
        }, 2.12)
        .call(releasePage, [], 2.13)
        .to(".splash-glitch", { opacity: 0.9, duration: 0.08, ease: "steps(2)" }, 2.13)
        .to(".splash-stage", {
          x: -5,
          opacity: 0.32,
          filter: "blur(2px)",
          color: "#a9c7ff",
          textShadow: "8px 0 #ff775f, -8px 0 #496bff",
          duration: 0.15,
          ease: "steps(3)",
        }, 2.13)
        .to(".splash-curtain", {
          opacity: 0.04,
          scale: 1.018,
          filter: "blur(22px) brightness(0.22) saturate(1.8)",
          duration: 0.55,
          ease: "power2.inOut",
        }, 2.23)
        .to(".splash-underlay", { opacity: 0, duration: 0.7, ease: "power2.inOut" }, 2.29)
        .to(main, {
          opacity: 1,
          scale: 1,
          filter: "blur(0px) saturate(1) contrast(1) brightness(1)",
          textShadow: "0 0 rgba(61, 93, 255, 0), 0 0 rgba(255, 79, 96, 0)",
          duration: 1.02,
          ease: "power3.out",
        }, 2.24)
        .to(".splash-glitch", { opacity: 0, duration: 0.68, ease: "power2.out" }, 2.3)
        .set(".splash-shell", { pointerEvents: "none" });

      return () => {
        timeline.kill();
        if (main instanceof HTMLElement) main.inert = false;
        document.body.classList.remove("splash-active");
      };
    },
    { scope: shellRef },
  );

  if (!visible) return null;

  return (
    <div ref={shellRef} className="splash-shell" aria-hidden="true">
      <div className="splash-underlay" />
      <div className="splash-curtain">
        <div className="splash-brand">
          <span className="wordmark-dot" />
          Future in Practice
        </div>

        <div className="splash-stage">
          {moments.map(({ verb, icon }, index) => (
            <div className="splash-moment" key={verb}>
              <LineIcon name={icon} />
              <span>{verb}</span>
              <small>{String(index + 1).padStart(2, "0")}</small>
            </div>
          ))}
        </div>

        <div className="splash-footer">
          <span>Preparing the room</span>
          <span>{String(moments.length).padStart(2, "0")} moments</span>
          <div className="splash-progress"><span className="splash-progress-fill" /></div>
        </div>
      </div>
      <div className="splash-glitch" />
    </div>
  );
}
