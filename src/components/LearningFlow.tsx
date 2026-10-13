"use client";

import { useLayoutEffect, useRef } from "react";

export default function LearningFlow({ activeStep }: { activeStep: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const list = svg?.parentElement;
    const track = svg?.querySelector<SVGPathElement>(".learning-flow-track");
    if (!svg || !list || !track) return;

    let geometryFrame = 0;
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
      if (activeRect) {
        const left = activeRect.left - listRect.left;
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
          corner((sin, cos) => [left + radius * (1 - sin), top + radius * (1 - cos)]);
          route += ` L ${left} ${bottom - radius}`;
          corner((sin, cos) => [left + radius * (1 - cos), bottom - radius + radius * sin]);
          if (index < steps.length - 1) route += ` Q ${x} ${bottom + 4} ${x} ${bottom + 17}`;
        });
      } else {
        steps.forEach((_, index) => { if (index > 0) route += ` L ${x} ${iconY(index)}`; });
      }

      svg.setAttribute("viewBox", `0 0 ${listRect.width} ${listRect.height}`);
      track.setAttribute("d", route);
    };

    const observer = new ResizeObserver(draw);
    observer.observe(list);
    list.querySelectorAll<HTMLElement>(".learning-step").forEach((step) => observer.observe(step));
    const started = performance.now();
    const followScale = (now: number) => {
      draw();
      if (now - started < 480) geometryFrame = requestAnimationFrame(followScale);
    };
    geometryFrame = requestAnimationFrame(followScale);
    window.addEventListener("resize", draw);
    return () => {
      cancelAnimationFrame(geometryFrame);
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [activeStep]);

  return <svg ref={svgRef} className="learning-flow" aria-hidden="true" preserveAspectRatio="none">
    <path className="learning-flow-track" fill="none" />
  </svg>;
}
