"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, X } from "@phosphor-icons/react";

export default function RegistrationSuccess({ message, celebrate, onClose }: { message: string; celebrate: boolean; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 9000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return createPortal(<>
    {celebrate && <div className="registration-confetti" aria-hidden="true">{Array.from({ length: 54 }, (_, index) => <i key={index} style={{ left: `${(index * 37) % 100}%`, backgroundColor: ["#22db79", "#f5d76e", "#8f86ff", "#ffffff", "#75c9f1"][index % 5], width: `${5 + index % 4}px`, height: `${8 + index % 6}px`, borderRadius: index % 3 === 0 ? "50%" : "1px", animationDelay: `${index % 9 * 60}ms`, animationDuration: `${2600 + index % 7 * 180}ms`, "--confetti-drift": `${(index % 2 ? -1 : 1) * (30 + index % 8 * 15)}px`, "--confetti-turn": `${(index % 2 ? -1 : 1) * (360 + index % 5 * 90)}deg` } as React.CSSProperties} />)}</div>}
    <div className="registration-toast" role="status" aria-live="polite" aria-atomic="true">
      <CheckCircle size={28} weight="fill" aria-hidden="true" />
      <div><strong>{celebrate ? "You're registered!" : "Your details are saved"}</strong><p>{message.replace(/^You're registered!\s*/, "")}</p></div>
      <button type="button" onClick={onClose} aria-label="Dismiss registration confirmation"><X size={18} /></button>
    </div>
  </>, document.body);
}
