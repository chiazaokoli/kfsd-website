"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Brain,
  ChatCircleDots,
  Ear,
  HandHeart,
  Megaphone,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";

gsap.registerPlugin(useGSAP);

const moments: Array<{ verb: string; icon: Icon }> = [
  { verb: "Thinking", icon: Brain },
  { verb: "Listening", icon: Ear },
  { verb: "Speaking", icon: Megaphone },
  { verb: "Communicating", icon: ChatCircleDots },
  { verb: "Empathizing", icon: HandHeart },
  { verb: "Collaborating", icon: UsersThree },
];

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      const main = document.querySelector("main");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (main instanceof HTMLElement) main.inert = true;
      document.body.classList.add("splash-active");

      const finish = () => {
        if (main instanceof HTMLElement) main.inert = false;
        document.body.classList.remove("splash-active");
        setVisible(false);
        onComplete();
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

      timeline
        .fromTo(".splash-brand", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0)
        .fromTo(".splash-progress-fill", { scaleX: 0 }, { scaleX: 1, duration: 3.75, ease: "power1.inOut" }, 0.05);

      items.forEach((item, index) => {
        const start = 0.12 + index * 0.58;
        const icon = item.querySelector(".splash-icon");

        timeline
          .to(item, { autoAlpha: 1, y: 0, duration: 0.2, ease: "power3.out" }, start)
          .fromTo(icon, { scale: 0.96 }, { scale: 1.06, duration: 0.28, repeat: 1, yoyo: true, ease: "sine.inOut" }, start)
          .to(item, { autoAlpha: 0, y: -14, duration: 0.18, ease: "power2.in" }, start + 0.48);
      });

      timeline
        .to(".splash-brand, .splash-footer", { opacity: 0, y: -10, duration: 0.25, ease: "power2.in" }, 3.68)
        .to(".splash-curtain", { yPercent: -100, borderBottomLeftRadius: "46vw", borderBottomRightRadius: "46vw", duration: 0.82, ease: "power4.inOut" }, 3.82)
        .to(".splash-underlay", { yPercent: -100, duration: 0.72, ease: "power4.inOut" }, 3.9);

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
          {moments.map(({ verb, icon: SkillIcon }, index) => (
            <div className="splash-moment" key={verb}>
              <SkillIcon className="splash-icon" weight="light" aria-hidden="true" />
              <span>{verb}</span>
              <small>{String(index + 1).padStart(2, "0")}</small>
            </div>
          ))}
        </div>

        <div className="splash-footer">
          <span>Preparing the room</span>
          <div className="splash-progress"><span className="splash-progress-fill" /></div>
        </div>
      </div>
    </div>
  );
}
