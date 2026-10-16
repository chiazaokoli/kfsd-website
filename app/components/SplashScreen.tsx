"use client";

import { useRef, useState } from "react";
import Image from "next/image";
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
const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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

      gsap.set(items, { autoAlpha: 0, y: 12 });

      timeline
        .fromTo(".splash-brand", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0)
        .fromTo(".splash-progress-fill", { scaleX: 0 }, { scaleX: 1, duration: 4.9, ease: "power1.inOut" }, 0.05);

      items.forEach((item, index) => {
        const start = 0.15 + index * 0.76;
        const icon = item.querySelector(".splash-icon");

        timeline
          .call(() => item.classList.add("is-active"), [], start)
          .to(item, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out" }, start)
          .fromTo(icon, { scale: 0.98 }, { scale: 1.03, duration: 0.38, repeat: 1, yoyo: true, ease: "sine.inOut" }, start)
          .to(item, { autoAlpha: 0, y: -8, duration: 0.38, ease: "power2.inOut" }, start + 0.58);
      });

      timeline
        .to(".splash-brand, .splash-footer", { opacity: 0, y: -10, duration: 0.3, ease: "power2.in" }, 4.95)
        .to(".splash-curtain", { yPercent: -100, borderBottomLeftRadius: "46vw", borderBottomRightRadius: "46vw", duration: 0.82, ease: "power4.inOut" }, 5.12)
        .to(".splash-underlay", { yPercent: -100, duration: 0.72, ease: "power4.inOut" }, 5.2);

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
          <Image className="splash-logo" src={`${assetPrefix}/images/kfsd-logo-mark.webp`} alt="" width={25} height={25} unoptimized />
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
