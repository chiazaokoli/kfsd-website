"use client";

import { useLayoutEffect } from "react";

const targets = [
  ".brand-mark",
  ".topbar-cta",
  ".primary-cta",
  ".event-dock > a",
  ".event-dock",
  ".skill-card",
  ".learning-step",
  ".local-time-card",
  ".schedule-panel",
  ".day-tabs",
  ".day-tabs-highlight",
  ".day-tabs button",
  ".speaker-grid article",
  ".registration-form",
  ".registration-form input:not([type=hidden])",
  ".registration-form select",
  ".registration-form button",
  ".form-select-panel",
  ".form-select-options",
  ".form-select-option",
  ".form-select-search input",
  ".registration-toast",
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

function designRadii(style: CSSStyleDeclaration) {
  const values = style.getPropertyValue("--smooth-radius").trim().split(/\s+/).map(cornerRadius);
  const [a = 0, b = a, c = a, d = b] = values;
  return [a, b, c, d];
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

    const elements = new Set<HTMLElement>();
    let nextId = 0;
    const originals = new Map<HTMLElement, { clipPath: string; position: string; borderColor: string; zIndex: string }>();
    const entries = new Map<HTMLElement, { clip: SVGPathElement; border: SVGPathElement; overlay: SVGSVGElement; borderColor: string; borderWidth: number; shadow?: SVGSVGElement; shadowPath?: SVGPathElement; shadowFilter?: SVGFilterElement; outline?: SVGPathElement }>();

    const parents = new Map<HTMLElement, string>();
    const shadowFrames = new Map<HTMLElement, number>();
    const updateShadow = (element: HTMLElement) => {
      const entry = entries.get(element);
      if (!entry) return;
      const style = getComputedStyle(element);
      const shadow = style.boxShadow.match(/^(rgba?\([^)]+\))\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px(?:\s+([-\d.]+)px)?$/);
      const focusVisible = element.matches(":focus-visible") && !element.matches("input, select, .form-select-trigger");
      if (!shadow && !focusVisible) { if (entry.shadow) entry.shadow.style.display = "none"; return; }
      const parent = element.parentElement;
      if (!parent) return;
      if (style.position !== "fixed" && getComputedStyle(parent).position === "static") {
        if (!parents.has(parent)) parents.set(parent, parent.style.position);
        parent.style.position = "relative";
      }
      if (style.zIndex === "auto") element.style.zIndex = "1";
      if (!entry.shadow) {
        const svg = svgElement("svg");
        svg.classList.add("smooth-corner-shadow");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.setAttribute("preserveAspectRatio", "none");
        const filter = svgElement("filter");
        filter.id = `smooth-shadow-${nextId++}`;
        filter.setAttribute("x", "-100%"); filter.setAttribute("y", "-100%");
        filter.setAttribute("width", "300%"); filter.setAttribute("height", "300%");
        filter.setAttribute("color-interpolation-filters", "sRGB");
        for (const tag of ["feMorphology", "feGaussianBlur", "feOffset", "feFlood", "feComposite"] as const) filter.append(svgElement(tag));
        const path = svgElement("path");
        path.setAttribute("fill", "white"); path.setAttribute("filter", `url(#${filter.id})`);
        const outline = svgElement("path");
        outline.setAttribute("fill", "none"); outline.setAttribute("stroke", "#22db79"); outline.setAttribute("stroke-width", "3");
        svg.append(filter, path, outline);
        entry.outline = outline;
        entry.shadow = svg; entry.shadowPath = path; entry.shadowFilter = filter;
        element.after(svg);
      }
      const width = Number.parseFloat(style.width) || element.offsetWidth, height = Number.parseFloat(style.height) || element.offsetHeight;
      const rect = element.getBoundingClientRect();
      const color = shadow?.[1] || "transparent", x = Number(shadow?.[2] || 0), y = Number(shadow?.[3] || 0), blur = Number(shadow?.[4] || 0), spread = Number(shadow?.[5] || 0);
      const [morphology, gaussian, offset, flood, composite] = [...entry.shadowFilter!.children];
      morphology.setAttribute("in", "SourceAlpha"); morphology.setAttribute("operator", spread < 0 ? "erode" : "dilate"); morphology.setAttribute("radius", String(Math.abs(spread)));
      gaussian.setAttribute("stdDeviation", String(blur / 2));
      offset.setAttribute("dx", String(x)); offset.setAttribute("dy", String(y)); offset.setAttribute("result", "shadow");
      flood.setAttribute("flood-color", color); flood.setAttribute("result", "color");
      composite.setAttribute("in", "color"); composite.setAttribute("in2", "shadow"); composite.setAttribute("operator", "in");
      entry.shadow!.style.cssText = `position:${style.position === "fixed" ? "fixed" : "absolute"};left:${style.position === "fixed" ? rect.left : element.offsetLeft}px;top:${style.position === "fixed" ? rect.top : element.offsetTop}px;width:${width}px;height:${height}px;z-index:${(Number.parseInt(getComputedStyle(element).zIndex) || 1) - 1};transform:${style.transform};transform-origin:${style.transformOrigin}`;
      entry.shadow!.setAttribute("viewBox", `0 0 ${width} ${height}`);
      const radii = designRadii(style);
      entry.shadowPath!.setAttribute("d", smoothPath(width, height, radii));
      const padding = (Number.parseFloat(style.outlineOffset) || 0) + 1.5;
      entry.outline!.setAttribute("d", smoothPath(width + padding * 2, height + padding * 2, radii.map((radius) => radius + padding)));
      entry.outline!.setAttribute("transform", `translate(${-padding} ${-padding})`);
      entry.outline!.style.display = focusVisible ? "" : "none";
    };
    const followShadow = (event: Event) => {
      const element = event.target;
      if (!(element instanceof HTMLElement) || !elements.has(element)) return;
      cancelAnimationFrame(shadowFrames.get(element) || 0);
      const started = performance.now();
      const draw = () => {
        updateShadow(element);
        if (performance.now() - started < 450) shadowFrames.set(element, requestAnimationFrame(draw));
        else shadowFrames.delete(element);
      };
      draw();
    };

    const register = (element: HTMLElement) => {
      if (elements.has(element)) {
        if (!element.classList.contains("smooth-corner-fallback")) element.classList.add("smooth-corner-fallback");
        const overlay = entries.get(element)?.overlay;
        if (overlay && element.tagName !== "INPUT" && element.tagName !== "SELECT" && !element.contains(overlay)) element.append(overlay);
        updateShadow(element);
        return;
      }
      elements.add(element);
      const style = getComputedStyle(element);
      const borderWidth = cornerRadius(style.borderTopWidth);
      const borderColor = style.borderTopColor;
      const clip = svgElement("clipPath");
      const id = `smooth-corner-${nextId++}`;
      clip.id = id;
      clip.setAttribute("clipPathUnits", "userSpaceOnUse");
      const clipPath = svgElement("path");
      clip.append(clipPath);
      defs.append(clip);

      const overlay = svgElement("svg");
      overlay.classList.add("smooth-corner-overlay");
      overlay.setAttribute("aria-hidden", "true");
      overlay.setAttribute("focusable", "false");
      overlay.setAttribute("preserveAspectRatio", "none");
      const border = svgElement("path");
      border.classList.add("smooth-corner-border");
      border.setAttribute("fill", "none");
      border.setAttribute("stroke", borderWidth ? borderColor : "none");
      border.setAttribute("stroke-width", String(borderWidth));
      overlay.append(border);

      originals.set(element, { clipPath: element.style.clipPath, position: element.style.position, borderColor: element.style.borderColor, zIndex: element.style.zIndex });
      if (style.position === "static") element.style.position = "relative";
      element.style.clipPath = `url(#${id})`;
      if (borderWidth) element.style.borderColor = "transparent";
      element.style.setProperty("--smooth-border-width", `${borderWidth}px`);
      element.classList.add("smooth-corner-fallback");
      if (element.tagName !== "INPUT" && element.tagName !== "SELECT") element.append(overlay);
      entries.set(element, { clip: clipPath, border, overlay, borderColor, borderWidth });
      observer.observe(element);
      update(element);
    };

    const update = (element: HTMLElement) => {
      const entry = entries.get(element);
      if (!entry) return;
      const style = getComputedStyle(element);
      const width = Number.parseFloat(style.width) || element.offsetWidth;
      const height = Number.parseFloat(style.height) || element.offsetHeight;
      if (!width || !height) return;
      const radii = designRadii(style);
      entry.clip.setAttribute("d", smoothPath(width, height, radii));
      if (element.tagName === "INPUT" || element.tagName === "SELECT") {
        const path = smoothPath(width, height, radii, Math.max(0.5, entry.borderWidth / 2));
        const borderImage = (color: string) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="${svgNamespace}" width="${width}" height="${height}"><path d="${path}" fill="none" stroke="${color}" stroke-width="${entry.borderWidth}"/></svg>`)}")`;
        element.style.setProperty("--smooth-border", borderImage(entry.borderColor));
        element.style.setProperty("--smooth-focus-border", borderImage("#22db79"));
      }
      entry.overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
      entry.border.setAttribute("d", smoothPath(width, height, radii, Math.max(0.5, entry.borderWidth / 2)));
      updateShadow(element);
    };
    const observer = new ResizeObserver((resizeEntries) => resizeEntries.forEach(({ target }) => update(target as HTMLElement)));
    const scan = () => {
      elements.forEach((element) => {
        if (element.isConnected) return;
        observer.unobserve(element);
        entries.get(element)?.clip.parentElement?.remove();
        entries.get(element)?.overlay.remove();
        entries.get(element)?.shadow?.remove();
        cancelAnimationFrame(shadowFrames.get(element) || 0);
        shadowFrames.delete(element);
        entries.delete(element);
        originals.delete(element);
        elements.delete(element);
      });
      parents.forEach((_, parent) => { if (!parent.isConnected) parents.delete(parent); });
      document.querySelectorAll<HTMLElement>(targets).forEach(register);
    };
    scan();
    const mutations = new MutationObserver((records) => {
      const learningStepOnly = records.length > 0 && records.every(({ type, target }) => type === "attributes" && target instanceof HTMLElement && target.matches(".learning-step"));
      if (learningStepOnly) {
        records.forEach(({ target }) => register(target as HTMLElement));
        return;
      }
      scan();
    });
    document.addEventListener("focusin", followShadow);
    document.addEventListener("focusout", followShadow);
    document.addEventListener("transitionrun", followShadow);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      document.removeEventListener("focusin", followShadow);
      document.removeEventListener("focusout", followShadow);
      document.removeEventListener("transitionrun", followShadow);
      shadowFrames.forEach(cancelAnimationFrame);
      parents.forEach((position, parent) => { parent.style.position = position; });
      elements.forEach((element) => {
        const original = originals.get(element);
        if (!original) return;
        element.style.clipPath = original.clipPath;
        element.style.position = original.position;
        element.style.borderColor = original.borderColor;
        element.style.zIndex = original.zIndex;
        element.classList.remove("smooth-corner-fallback");
        element.style.removeProperty("--smooth-border-width");
        element.style.removeProperty("--smooth-border");
        element.style.removeProperty("--smooth-focus-border");
        entries.get(element)?.overlay.remove();
        entries.get(element)?.shadow?.remove();
        cancelAnimationFrame(shadowFrames.get(element) || 0);
      });
      defsSvg.remove();
    };
  }, []);

  return null;
}
