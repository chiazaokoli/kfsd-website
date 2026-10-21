"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Brain,
  ChatCircleDots,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";

gsap.registerPlugin(useGSAP);

const moments: Array<{ verb: string; icon: Icon }> = [
  { verb: "Thinking", icon: Brain },
  { verb: "Communicating", icon: ChatCircleDots },
  { verb: "Collaborating", icon: UsersThree },
];
const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function SplashScreen({ onRevealStart }: { onRevealStart: () => void }) {
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
      };

      if (reduceMotion) {
        const timer = window.setTimeout(() => { onRevealStart(); finish(); }, 180);
        return () => {
          window.clearTimeout(timer);
          if (main instanceof HTMLElement) main.inert = false;
          document.body.classList.remove("splash-active");
        };
      }

      const items = gsap.utils.toArray<HTMLElement>(".splash-moment");
      const timeline = gsap.timeline({ onComplete: finish });

      gsap.set(items, { autoAlpha: 0, y: 12 });

      timeline
        .fromTo(".splash-brand", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0)
        .fromTo(".splash-progress-fill", { scaleX: 0 }, { scaleX: 1, duration: 2.25, ease: "power1.inOut" }, 0.05);

      items.forEach((item, index) => {
        const start = 0.1 + index * 0.64;
        const icon = item.querySelector(".splash-icon");

        timeline
          .call(() => item.classList.add("is-active"), [], start)
          .to(item, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" }, start)
          .fromTo(icon, { scale: 0.98 }, { scale: 1.03, duration: 0.32, repeat: 1, yoyo: true, ease: "sine.inOut" }, start)
          .to(item, { autoAlpha: 0, y: -8, duration: 0.32, ease: "power2.inOut" }, start + 0.5);
      });

      timeline
        .to(".splash-brand, .splash-footer", { opacity: 0, y: -10, duration: 0.25, ease: "power2.in" }, 2.15)
        .to(".splash-curtain", { yPercent: -100, borderBottomLeftRadius: "46vw", borderBottomRightRadius: "46vw", filter: "blur(18px)", duration: 0.68, ease: "power4.inOut", onStart: onRevealStart }, 2.3)
        .to(".splash-underlay", { yPercent: -100, filter: "blur(12px)", duration: 0.58, ease: "power4.inOut" }, 2.4);

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
          <Image className="splash-logo" src={`${assetPrefix}/images/kfsd-logo-mark.webp`} alt="" width={25} height={25} loading="eager" unoptimized />
          KFSD Soft Skills Training
        </div>

        <div className="splash-stage">
          {moments.map(({ verb, icon: SkillIcon }) => (
            <div className="splash-moment" key={verb}>
              <SkillIcon className="splash-icon" weight="light" aria-hidden="true" />
              <span>{verb}</span>
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
