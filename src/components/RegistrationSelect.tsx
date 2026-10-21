"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CaretDown } from "@phosphor-icons/react";

export type SelectOption = string | { value: string; label: string; shortLabel?: string };
type Props = {
  label: string; name: string; options: readonly SelectOption[]; placeholder: string;
  value: string; error?: string; searchable?: boolean; inlineSearch?: boolean; compact?: boolean; disabled?: boolean;
  onChange: (value: string) => void;
};

export default function RegistrationSelect({ label, name, options, placeholder, value, error, searchable = false, inlineSearch = false, compact = false, disabled = false, onChange }: Props) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const keyboardOpen = useRef(false);
  const [position, setPosition] = useState<{ left: number; top: number; width: number; maxHeight: number; above: boolean } | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const items = options.map((option) => typeof option === "string" ? { value: option === "-" ? "" : option, label: option, shortLabel: option } : option);
  const shown = items.filter((option) => `${option.label} ${option.value}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const selected = items.find((option) => option.value === value);
  const panelReady = Boolean(position);

  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => {
      const trigger = inlineSearch ? inputRef.current : triggerRef.current;
      if (!trigger) return;
      const anchor = compact ? trigger.closest(".phone-input-row") || trigger : trigger;
      const rect = anchor.getBoundingClientRect();
      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportLeft = viewport?.offsetLeft || 0;
      const viewportWidth = viewport?.width || window.innerWidth;
      const viewportHeight = viewport?.height || window.innerHeight;
      const below = viewportTop + viewportHeight - rect.bottom - 16;
      const aboveSpace = rect.top - viewportTop - 16;
      const above = below < 160 && aboveSpace > below;
      const width = Math.min(rect.width, viewportWidth - 24);
      const maxHeight = Math.max(64, Math.min(310, viewportHeight - 24, above ? aboveSpace : below));
      const top = above
        ? Math.min(viewportTop + viewportHeight - 12, Math.max(viewportTop + maxHeight + 12, rect.top - 6))
        : Math.max(viewportTop + 12, Math.min(rect.bottom + 6, viewportTop + viewportHeight - maxHeight - 12));
      const next = { left: Math.max(viewportLeft + 12, Math.min(rect.left, viewportLeft + viewportWidth - width - 12)), top, width, maxHeight, above };
      setPosition((current) => current && Object.keys(next).every((key) => current[key as keyof typeof next] === next[key as keyof typeof next]) ? current : next);
    };
    const schedule = (event: Event) => {
      if (event.target instanceof Node && panelRef.current?.contains(event.target)) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule, true); window.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("scroll", schedule); };
  }, [open, compact, inlineSearch]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!fieldRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnFocusMove = (event: FocusEvent) => {
      if (!fieldRef.current?.contains(event.target as Node) && !panelRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnUserScroll = (event: Event) => {
      if (event.target instanceof Node && panelRef.current?.contains(event.target)) return;
      setOpen(false);
      inputRef.current?.blur();
      searchRef.current?.blur();
    };
    document.addEventListener("pointerdown", close, true);
    document.addEventListener("focusin", closeOnFocusMove);
    window.addEventListener("wheel", closeOnUserScroll, { passive: true, capture: true });
    window.addEventListener("touchmove", closeOnUserScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener("pointerdown", close, true);
      document.removeEventListener("focusin", closeOnFocusMove);
      window.removeEventListener("wheel", closeOnUserScroll, true);
      window.removeEventListener("touchmove", closeOnUserScroll, true);
    };
  }, [open]);
  useEffect(() => {
    if (open && panelReady && (keyboardOpen.current || window.matchMedia("(pointer: fine)").matches)) searchRef.current?.focus({ preventScroll: true });
  }, [open, panelReady]);
  useEffect(() => {
    if (!open) return;
    const list = panelRef.current?.querySelector<HTMLElement>("[role=listbox]");
    const option = panelRef.current?.querySelector<HTMLElement>(`#${name}-option-${active}`);
    if (!list || !option) return;
    const bounds = list.getBoundingClientRect(), item = option.getBoundingClientRect();
    if (item.top < bounds.top) list.scrollTop -= bounds.top - item.top;
    else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom;
  }, [active, name, open, query, panelReady]);

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
    if (inlineSearch && window.matchMedia("(pointer: coarse)").matches) inputRef.current?.blur();
    else (inlineSearch ? inputRef.current : triggerRef.current)?.focus({ preventScroll: true });
  }
  function openList() {
    if (open) return;
    setPosition(null);
    setQuery("");
    setActive(Math.max(0, items.findIndex((item) => item.value === value)));
    setOpen(true);
  }
  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    keyboardOpen.current = true;
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
      (inlineSearch ? inputRef.current : triggerRef.current)?.focus({ preventScroll: true });
    } else if (event.key === "Tab" && event.target !== triggerRef.current) setOpen(false);
  }

  return <div className={`form-select-field${compact ? " phone-country" : ""}`} ref={fieldRef}>
    <label className={compact ? "visually-hidden" : undefined} id={`${name}-label`} htmlFor={`${name}-trigger`}>{compact && selected ? `${label}: ${selected.label}` : label}</label>
    <input type="hidden" name={name} value={value} />
    {inlineSearch ? <div className={`form-select-inline${open ? " is-open" : ""}`}>
      <input id={`${name}-trigger`} ref={inputRef} className={`form-select-trigger${value || query ? " is-selected" : ""}`} type="text" role="combobox" autoComplete="off" spellCheck={false} disabled={disabled} aria-labelledby={`${name}-label`} aria-autocomplete="list" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${name}-options`} aria-activedescendant={open && shown[active] ? `${name}-option-${active}` : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} placeholder={open ? `Search ${name === "country" ? "countries" : name === "profession" ? "professions" : "states or regions"}…` : placeholder} value={open ? query : selected?.label || ""} onFocus={openList} onClick={() => { if (!open) openList(); }} onChange={(event) => { if (!open) setPosition(null); setQuery(event.target.value); setActive(0); setOpen(true); }} onKeyDown={onKeyDown} />
      <CaretDown className="form-select-inline-caret" size={16} weight="bold" aria-hidden="true" />
    </div> : <button id={`${name}-trigger`} ref={triggerRef} className={`form-select-trigger${value ? " is-selected" : ""}`} type="button" role="combobox" title={selected?.label} disabled={disabled} aria-labelledby={`${name}-label`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${name}-options`} aria-activedescendant={open && !searchable && shown[active] ? `${name}-option-${active}` : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} onPointerDown={() => { keyboardOpen.current = false; }} onClick={() => open ? setOpen(false) : openList()} onKeyDown={onKeyDown}>
      <span>{selected ? (compact ? selected.shortLabel || selected.label : selected.label) : placeholder}</span><CaretDown size={16} weight="bold" aria-hidden="true" />
    </button>}
    {open && position && createPortal(<div ref={panelRef} className="form-select-panel form-select-overlay" style={{ left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, transform: position.above ? "translateY(-100%)" : undefined }}>
      {searchable && !inlineSearch && <div className="form-select-search"><input ref={searchRef} type="search" role="combobox" aria-label={`Search ${label.toLowerCase()}`} aria-autocomplete="list" aria-expanded={true} aria-controls={`${name}-options`} aria-activedescendant={shown[active] ? `${name}-option-${active}` : undefined} placeholder="Search…" value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} onKeyDown={onKeyDown} /></div>}
      <div id={`${name}-options`} className="form-select-options" role="listbox" aria-labelledby={`${name}-label`}>
        {shown.map((option, index) => <div id={`${name}-option-${index}`} className={`form-select-option${index === active ? " is-active" : ""}`} role="option" aria-selected={option.value === value} key={option.value} onPointerMove={() => setActive(index)} onPointerDown={(event) => event.preventDefault()} onClick={() => select(option.value)}>{option.label}</div>)}
        {!shown.length && <p className="form-select-empty">No matches found.</p>}
      </div>
    </div>, document.body)}
    {error && <small id={`${name}-error`}>{error}</small>}
  </div>;
}
