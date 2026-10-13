"use client";

import { useLayoutEffect, useRef } from "react";

const smoothstep = (value: number) => {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
};

export default function LearningFlow({ activeStep }: { activeStep: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const list = svg?.parentElement;
    const track = svg?.querySelector<SVGPathElement>(".learning-flow-track");
    const pulse = svg?.querySelector<SVGPathElement>(".learning-flow-pulse");
    const glow = svg?.querySelector<SVGPathElement>(".learning-flow-glow");
    if (!svg || !list || !track || !pulse || !glow) return;

    let frame = 0;
    let geometryFrame = 0;
    let visible = false;
    const phaseStart = performance.now();
    let length = 0;
    let entry = 0;
    let exit = 0;
    let duration = 1;
    let times: number[] = [];
    const segments = 160;
    pulse.style.opacity = "0";
    glow.style.opacity = "0";
    const revealPulse = window.setTimeout(() => {
      pulse.style.opacity = "";
      glow.style.opacity = "";
    }, 220);

    const draw = () => {
      const listRect = list.getBoundingClientRect();
      const steps = [...list.querySelectorAll<HTMLElement>(".learning-step")];
      const icons = steps.map((step) => step.querySelector<HTMLElement>(".learning-step-icon")?.getBoundingClientRect());
      const firstIcon = icons[0];
      const activeRect = steps[activeStep]?.getBoundingClientRect();
      if (!firstIcon || !steps.length) return;

      const x = firstIcon.left + firstIcon.width / 2 - listRect.left;
      const iconY = (index: number) => {
        const icon = icons[index];
        return icon ? icon.top + icon.height / 2 - listRect.top : 0;
      };
      let route = `M ${x} ${iconY(0)}`;
      let entryRoute = "";
      let exitRoute = "";
      if (activeRect) {
        const left = activeRect.left - listRect.left;
        const right = activeRect.right - listRect.left;
        const top = activeRect.top - listRect.top;
        const bottom = activeRect.bottom - listRect.top;
        const activeElement = steps[activeStep];
        const scale = activeRect.width / activeElement.offsetWidth;
        const radius = Math.min(Number.parseFloat(getComputedStyle(activeElement).borderTopRightRadius) * scale, activeRect.height / 4);
        if (activeStep === 0) route = `M ${left + radius} ${top}`;
        const corner = (plot: (sin: number, cos: number) => [number, number]) => {
          for (let point = 1; point <= 12; point++) {
            const angle = point / 12 * Math.PI / 2;
            const [cornerX, cornerY] = plot(Math.sqrt(Math.sin(angle)), Math.sqrt(Math.cos(angle)));
            route += ` L ${cornerX} ${cornerY}`;
          }
        };
        steps.forEach((_, index) => {
          if (index !== activeStep) {
            if (index > 0) route += ` L ${x} ${iconY(index)}`;
            return;
          }
          if (index > 0) route += ` L ${x} ${top - 17} Q ${x} ${top} ${left + radius} ${top}`;
          entryRoute = route;
          route += ` L ${right - radius} ${top}`;
          corner((sin, cos) => [right - radius + radius * sin, top + radius * (1 - cos)]);
          route += ` L ${right} ${bottom - radius}`;
          corner((sin, cos) => [right - radius * (1 - cos), bottom - radius + radius * sin]);
          route += ` L ${left + radius} ${bottom}`;
          exitRoute = route;
          route += ` Q ${x} ${bottom + 4} ${x} ${bottom + 17}`;
        });
      } else {
        steps.forEach((_, index) => { if (index > 0) route += ` L ${x} ${iconY(index)}`; });
      }

      svg.setAttribute("viewBox", `0 0 ${listRect.width} ${listRect.height}`);
      if (entryRoute) { track.setAttribute("d", entryRoute); entry = track.getTotalLength(); }
      if (exitRoute) { track.setAttribute("d", exitRoute); exit = track.getTotalLength(); }
      track.setAttribute("d", route);
      length = track.getTotalLength();
      times = [0];
      for (let i = 1; i <= segments; i++) {
        const midpoint = length * (i - .5) / segments;
        // The pulse accelerates toward the card, races around it, then eases away.
        const pull = activeRect ? smoothstep((midpoint - entry + 95) / 95) * (1 - smoothstep((midpoint - exit) / 110)) : 0;
        times.push(times[i - 1] + length / segments / (175 * (1 + 2.9 * pull)));
      }
      duration = times[segments];
    };

    const animate = (now: number) => {
      if (!visible || !length) { frame = 0; return; }
      const elapsed = ((now - phaseStart) / 1000) % duration;
      let low = 0;
      let high = segments;
      while (low < high) {
        const middle = (low + high) >> 1;
        if (times[middle] < elapsed) low = middle + 1;
        else high = middle;
      }
      const index = Math.max(1, low);
      const fraction = (elapsed - times[index - 1]) / (times[index] - times[index - 1]);
      const distance = Math.min(length, length * (index - 1 + fraction) / segments);
      const left: string[] = [];
      const right: string[] = [];
      const halfLength = 24;
      const samples = 12;
      for (let i = 0; i <= samples; i++) {
        const offset = (i / samples * 2 - 1) * halfLength;
        const position = Math.max(0, Math.min(length, distance + offset));
        const point = track.getPointAtLength(position);
        const before = track.getPointAtLength(Math.max(0, position - 2));
        const after = track.getPointAtLength(Math.min(length, position + 2));
        const tangent = Math.hypot(after.x - before.x, after.y - before.y) || 1;
        const width = 3.5 * Math.pow(Math.max(0, 1 - Math.abs(offset) / halfLength), .65);
        const nx = -(after.y - before.y) / tangent * width;
        const ny = (after.x - before.x) / tangent * width;
        left.push(`${point.x + nx} ${point.y + ny}`);
        right.unshift(`${point.x - nx} ${point.y - ny}`);
      }
      const shape = `M ${left.join(" L ")} L ${right.join(" L ")} Z`;
      pulse.setAttribute("d", shape);
      glow.setAttribute("d", shape);
      frame = requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(draw);
    observer.observe(list);
    list.querySelectorAll<HTMLElement>(".learning-step").forEach((step) => observer.observe(step));
    const intersection = new IntersectionObserver(([item]) => {
      visible = item.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(animate);
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    });
    intersection.observe(list);
    const started = performance.now();
    const followScale = (now: number) => {
      draw();
      if (now - started < 480) geometryFrame = requestAnimationFrame(followScale);
    };
    geometryFrame = requestAnimationFrame(followScale);
    window.addEventListener("resize", draw);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(geometryFrame);
      window.clearTimeout(revealPulse);
      observer.disconnect();
      intersection.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [activeStep]);

  return <svg ref={svgRef} className="learning-flow" aria-hidden="true" preserveAspectRatio="none">
    <path className="learning-flow-track" fill="none" />
    <path className="learning-flow-glow" />
    <path className="learning-flow-pulse" />
  </svg>;
}
