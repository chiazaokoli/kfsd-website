"use client";

import { useLayoutEffect, useRef } from "react";

export default function LearningFlow({ activeStep }: { activeStep: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const list = svg?.parentElement;
    if (!svg || !list) return;
    let frame = 0;
    const pulse = svg.querySelector<SVGPathElement>(".learning-flow-pulse");
    if (pulse) pulse.style.opacity = "0";
    const revealPulse = window.setTimeout(() => { if (pulse) pulse.style.opacity = ""; }, 220);

    const draw = () => {
      const listRect = list.getBoundingClientRect();
      const steps = [...list.querySelectorAll<HTMLElement>(".learning-step")];
      const icons = steps.map((step) => step.querySelector<HTMLElement>(".learning-step-icon")?.getBoundingClientRect());
      const firstIcon = icons[0];
      const activeRect = steps[activeStep]?.getBoundingClientRect();
      if (!firstIcon || !activeRect) return;

      const x = firstIcon.left + firstIcon.width / 2 - listRect.left;
      const iconY = (index: number) => {
        const icon = icons[index];
        return icon ? icon.top + icon.height / 2 - listRect.top : 0;
      };
      const left = activeRect.left - listRect.left;
      const right = activeRect.right - listRect.left;
      const top = activeRect.top - listRect.top;
      const bottom = activeRect.bottom - listRect.top;
      const activeStepElement = steps[activeStep];
      const scale = activeRect.width / activeStepElement.offsetWidth;
      const radius = Math.min(Number.parseFloat(getComputedStyle(activeStepElement).borderTopRightRadius) * scale, activeRect.height / 4);
      let route = activeStep === 0 ? `M ${left + radius} ${top}` : `M ${x} ${iconY(0)}`;
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
        if (index > 0) {
          route += ` L ${x} ${top - 17}`;
          route += ` Q ${x} ${top} ${left + radius} ${top}`;
        }
        route += ` L ${right - radius} ${top}`;
        corner((sin, cos) => [right - radius + radius * sin, top + radius * (1 - cos)]);
        route += ` L ${right} ${bottom - radius}`;
        corner((sin, cos) => [right - radius * (1 - cos), bottom - radius + radius * sin]);
        route += ` L ${left + radius} ${bottom}`;
        route += ` Q ${x} ${bottom + 4} ${x} ${bottom + 17}`;
      });

      svg.setAttribute("viewBox", `0 0 ${listRect.width} ${listRect.height}`);
      svg.querySelectorAll<SVGPathElement>("path").forEach((path) => path.setAttribute("d", route));
    };

    const observer = new ResizeObserver(draw);
    observer.observe(list);
    list.querySelectorAll<HTMLElement>(".learning-step").forEach((step) => observer.observe(step));
    const started = performance.now();
    const followScale = (now: number) => {
      draw();
      if (now - started < 480) frame = requestAnimationFrame(followScale);
    };
    frame = requestAnimationFrame(followScale);
    window.addEventListener("resize", draw);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(revealPulse);
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [activeStep]);

  return <svg ref={svgRef} className="learning-flow" aria-hidden="true" preserveAspectRatio="none">
    <path className="learning-flow-track" fill="none" />
    <path className="learning-flow-pulse" fill="none" pathLength="1000" />
  </svg>;
}
