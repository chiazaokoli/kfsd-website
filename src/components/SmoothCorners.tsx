"use client";

import { useLayoutEffect } from "react";

const targets = [
  ".brand-mark",
  ".topbar-cta",
  ".primary-cta",
  ".event-dock",
  ".event-dock > a",
  ".skill-card",
  ".learning-panel",
  ".local-time-card",
  ".schedule-panel",
  ".day-tabs",
  ".day-tabs button",
  ".speaker-placeholder-grid article",
  ".story-carousel article",
  ".registration-form",
  ".registration-form button",
  ".footer-lead > a:last-child",
].join(", ");

const svgNamespace = "http://www.w3.org/2000/svg";
const steps = 16;

function cornerRadius(value: string) {
  return Number.parseFloat(value) || 0;
}

// A fourth-order superellipse has a flat join with each straight edge.
// Sampling it keeps the same corner size on cards with very different ratios.
function smoothPath(width: number, height: number, radii: number[], inset = 0) {
  const w = Math.max(0, width - 2 * inset);
  const h = Math.max(0, height - 2 * inset);
  const [tl, tr, br, bl] = radii.map((radius) => Math.max(0, Math.min(radius - inset, w / 2, h / 2)));
  const commands: string[] = [];
  const point = (x: number, y: number, first = false) => commands.push(`${first ? "M" : "L"}${(x + inset).toFixed(2)} ${(y + inset).toFixed(2)}`);
  const sweep = (radius: number, plot: (a: number, b: number) => [number, number]) => {
    if (!radius) return;
    for (let i = 1; i <= steps; i++) {
      const theta = (i / steps) * Math.PI / 2;
      const a = Math.sqrt(Math.sin(theta));
      const b = Math.sqrt(Math.cos(theta));
      const [x, y] = plot(a, b);
      point(x, y);
    }
  };

  point(tl, 0, true);
  point(w - tr, 0);
  sweep(tr, (a, b) => [w - tr + tr * a, tr * (1 - b)]);
  point(w, h - br);
  sweep(br, (a, b) => [w - br * (1 - b), h - br + br * a]);
  point(bl, h);
  sweep(bl, (a, b) => [bl * (1 - a), h - bl * (1 - b)]);
  point(0, tl);
  sweep(tl, (a, b) => [tl * (1 - b), tl * (1 - a)]);
  commands.push("Z");
  return commands.join(" ");
}

function svgElement<K extends keyof SVGElementTagNameMap>(name: K) {
  return document.createElementNS(svgNamespace, name);
}

export default function SmoothCorners() {
  useLayoutEffect(() => {
    if (CSS.supports("corner-shape", "squircle")) return;

    const defsSvg = svgElement("svg");
    defsSvg.setAttribute("aria-hidden", "true");
    defsSvg.setAttribute("width", "0");
    defsSvg.setAttribute("height", "0");
    defsSvg.style.cssText = "position:absolute;pointer-events:none;overflow:hidden";
    const defs = svgElement("defs");
    defsSvg.append(defs);
    document.body.append(defsSvg);

    const elements = Array.from(document.querySelectorAll<HTMLElement>(targets));
    const originals = new Map<HTMLElement, { clipPath: string; position: string; borderColor: string }>();
    const entries = new Map<HTMLElement, { clip: SVGPathElement; border: SVGPathElement; focus: SVGPathElement; halo: SVGPathElement; overlay: SVGSVGElement; borderColor: string; borderWidth: number }>();

    elements.forEach((element, index) => {
      const style = getComputedStyle(element);
      const borderWidth = cornerRadius(style.borderTopWidth);
      const borderColor = style.borderTopColor;
      const clip = svgElement("clipPath");
      const id = `smooth-corner-${index}`;
      clip.id = id;
      clip.setAttribute("clipPathUnits", "userSpaceOnUse");
      const clipPath = svgElement("path");
      clip.append(clipPath);
      defs.append(clip);

      const overlay = svgElement("svg");
      overlay.classList.add("smooth-corner-overlay");
      overlay.setAttribute("aria-hidden", "true");
      overlay.setAttribute("focusable", "false");
      const border = svgElement("path");
      border.classList.add("smooth-corner-border");
      border.setAttribute("fill", "none");
      border.setAttribute("stroke", borderWidth ? borderColor : "none");
      border.setAttribute("stroke-width", String(borderWidth));
      const halo = svgElement("path");
      halo.classList.add("smooth-corner-focus-ring");
      halo.setAttribute("fill", "none");
      halo.setAttribute("stroke", "rgba(11, 16, 28, .9)");
      halo.setAttribute("stroke-width", "6");
      const focus = svgElement("path");
      focus.classList.add("smooth-corner-focus-ring");
      focus.setAttribute("fill", "none");
      focus.setAttribute("stroke", "#d9ff63");
      focus.setAttribute("stroke-width", "3");
      overlay.append(border, halo, focus);

      originals.set(element, { clipPath: element.style.clipPath, position: element.style.position, borderColor: element.style.borderColor });
      if (style.position === "static") element.style.position = "relative";
      element.style.clipPath = `url(#${id})`;
      if (borderWidth) element.style.borderColor = "transparent";
      element.classList.add("smooth-corner-fallback");
      element.append(overlay);
      entries.set(element, { clip: clipPath, border, focus, halo, overlay, borderColor, borderWidth });
    });

    const update = (element: HTMLElement) => {
      const entry = entries.get(element);
      if (!entry) return;
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      if (!width || !height) return;
      const style = getComputedStyle(element);
      const radii = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius].map(cornerRadius);
      entry.clip.setAttribute("d", smoothPath(width, height, radii));
      entry.overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
      entry.border.setAttribute("d", smoothPath(width, height, radii, Math.max(0.5, entry.borderWidth / 2)));
      const ring = smoothPath(width, height, radii, 4);
      entry.halo.setAttribute("d", ring);
      entry.focus.setAttribute("d", ring);
    };
    const observer = new ResizeObserver((resizeEntries) => resizeEntries.forEach(({ target }) => update(target as HTMLElement)));
    elements.forEach((element) => { observer.observe(element); update(element); });

    return () => {
      observer.disconnect();
      elements.forEach((element) => {
        const original = originals.get(element);
        if (!original) return;
        element.style.clipPath = original.clipPath;
        element.style.position = original.position;
        element.style.borderColor = original.borderColor;
        element.classList.remove("smooth-corner-fallback");
        entries.get(element)?.overlay.remove();
      });
      defsSvg.remove();
    };
  }, []);

  return null;
}
