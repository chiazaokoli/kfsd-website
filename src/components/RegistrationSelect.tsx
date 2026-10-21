"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { CaretDown } from "@phosphor-icons/react";

export type SelectOption = string | { value: string; label: string; shortLabel?: string };
type Props = {
  label: string; name: string; options: readonly SelectOption[]; placeholder: string;
  value: string; error?: string; searchable?: boolean; compact?: boolean; disabled?: boolean;
  onChange: (value: string) => void;
};

export default function RegistrationSelect({ label, name, options, placeholder, value, error, searchable = false, compact = false, disabled = false, onChange }: Props) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const items = options.map((option) => typeof option === "string" ? { value: option === "-" ? "" : option, label: option, shortLabel: option } : option);
  const shown = items.filter((option) => `${option.label} ${option.value}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const selected = items.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!fieldRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    searchRef.current?.focus({ preventScroll: true });
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (open) fieldRef.current?.querySelector(`#${name}-option-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, name, open]);

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
    triggerRef.current?.focus({ preventScroll: true });
  }
  function openList() {
    setQuery("");
    setActive(Math.max(0, items.findIndex((item) => item.value === value)));
    setOpen(true);
  }
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openList();
      else setActive((current) => Math.max(0, Math.min(shown.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))));
    } else if ((event.key === "Home" || event.key === "End") && event.target === triggerRef.current) {
      event.preventDefault();
      setActive(event.key === "Home" ? 0 : Math.max(0, shown.length - 1));
      setOpen(true);
    } else if (event.key === "Enter" || (event.key === " " && event.target === triggerRef.current)) {
      event.preventDefault();
      if (open && shown[active]) select(shown[active].value);
      else if (!open) openList();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    } else if (event.key === "Tab" && event.target !== triggerRef.current) setOpen(false);
  }

  return <div className={`form-select-field${compact ? " phone-country" : ""}`} ref={fieldRef} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }}>
    <label className={compact ? "visually-hidden" : undefined} id={`${name}-label`} htmlFor={`${name}-trigger`}>{compact && selected ? `${label}: ${selected.label}` : label}</label>
    <input type="hidden" name={name} value={value} />
    <button id={`${name}-trigger`} ref={triggerRef} className={`form-select-trigger${value ? " is-selected" : ""}`} type="button" role="combobox" title={selected?.label} disabled={disabled} aria-labelledby={`${name}-label`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${name}-options`} aria-activedescendant={open && !searchable && shown[active] ? `${name}-option-${active}` : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} onClick={() => open ? setOpen(false) : openList()} onKeyDown={onKeyDown}>
      <span>{selected ? (compact ? selected.shortLabel || selected.label : selected.label) : placeholder}</span><CaretDown size={16} weight="bold" aria-hidden="true" />
    </button>
    {open && <div className="form-select-panel">
      {searchable && <div className="form-select-search"><input ref={searchRef} type="search" role="combobox" aria-label={`Search ${label.toLowerCase()}`} aria-autocomplete="list" aria-expanded={true} aria-controls={`${name}-options`} aria-activedescendant={shown[active] ? `${name}-option-${active}` : undefined} placeholder="Search…" value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={onKeyDown} /></div>}
      <div id={`${name}-options`} className="form-select-options" role="listbox" aria-labelledby={`${name}-label`}>
        {shown.map((option, index) => <div id={`${name}-option-${index}`} className={`form-select-option${index === active ? " is-active" : ""}`} role="option" aria-selected={option.value === value} key={option.value} onPointerMove={() => setActive(index)} onPointerDown={(event) => event.preventDefault()} onClick={() => select(option.value)}>{option.label}</div>)}
        {!shown.length && <p className="form-select-empty">No matches found.</p>}
      </div>
    </div>}
    {error && <small id={`${name}-error`}>{error}</small>}
  </div>;
}
