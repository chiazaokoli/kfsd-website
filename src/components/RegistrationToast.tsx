"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";

export default function RegistrationToast({ message, kind, onClose }: { message: string; kind: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 9000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return createPortal(<>
    <div className={`registration-toast${kind === "error" ? " is-error" : ""}`} role={kind === "error" ? "alert" : "status"} aria-live={kind === "error" ? "assertive" : "polite"} aria-atomic="true">
      {kind === "error" ? <WarningCircle size={28} weight="fill" aria-hidden="true" /> : <CheckCircle size={28} weight="fill" aria-hidden="true" />}
      <div><strong>{kind === "error" ? "Check your answers" : "Your details are saved"}</strong><p>{message.replace(/^You're registered!\s*/, "")}</p></div>
      <button type="button" onClick={onClose} aria-label="Dismiss registration message"><X size={18} /></button>
    </div>
  </>, document.body);
}
