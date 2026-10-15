"use client";

import { type CSSProperties, FormEvent, Fragment, type KeyboardEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown, ArrowRight, Brain, CalendarBlank, CaretDown, ChatCircleDots,
  Clock, CrownSimple, GlobeHemisphereWest, Lightning,
  ListChecks, RocketLaunch, Mountains, Play, Question, ShieldCheck,
  Student, UsersThree, Medal,
} from "@phosphor-icons/react";
import { siteConfig } from "../src/config/site";
import GradeSketch, { paintRuns, paintRunPath } from "../src/components/GradeSketch";
import SmoothCorners from "../src/components/SmoothCorners";
import LearningFlow from "../src/components/LearningFlow";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const heroLeadWords = ["Learn", "the", "soft", "skills", "that", "set", "you", "apart", "in"];
const heroEnding = "2 days.";
const heroEndingStart = heroLeadWords.join("").length;
const sectionColors = [
  [".hook-section", [251, 250, 246]],
  [".matter-section", [11, 16, 28]],
  [".skills-section", [242, 240, 232]],
  [".learning-section", [11, 16, 28]],
  [".schedule-section", [251, 250, 246]],
  [".proof-section", [242, 240, 232]],
  [".organiser-section", [49, 92, 255]],
  [".two-days-section", [34, 219, 121]],
  [".registration-section", [11, 16, 28]],
  [".faq-section-new", [251, 250, 246]],
] as const;

function heroLetters(text: string, startIndex: number) {
  return [...text].map((letter, index) => letter === " " ? " " : (
    <span className="hero-letter" key={index} style={{ "--letter-delay": `${180 + (startIndex + index) * 18}ms` } as CSSProperties}>{letter}</span>
  ));
}

const questions = [
  "You struggle with rallying your friends around a task.",
  "You find it hard to say no.",
  "You want to keep to deadlines and manage your time better.",
  "You struggle to express yourself clearly.",
  "Leading feels unnatural to you.",
];

const skills = [
  { title: "Lead with Confidence", copy: "Learn how to lead yourself and others, take responsibility, show initiative and positively influence the people around you.", icon: CrownSimple, className: "skill-wide skill-blue", image: "/images/student-speaker.webp" },
  { title: "Think Critically", copy: "Learn to analyse information, question assumptions, see different perspectives and make smart decisions.", icon: Brain, className: "skill-wide skill-photo", image: "/images/collaboration.webp" },
  { title: "Communicate Clearly", copy: "Express your ideas clearly, listen well and speak with confidence to any audience.", icon: ChatCircleDots, className: "skill-third skill-lime" },
  { title: "Build Resilience", copy: "Handle setbacks, challenges and pressure while keeping a positive, solution-focused mindset.", icon: Mountains, className: "skill-third skill-cream" },
  { title: "Act with Integrity", copy: "Understand why honesty, accountability and doing the right thing matter in your personal and professional life.", icon: ShieldCheck, className: "skill-third skill-dark" },
];

const learningSteps = [
  { title: "Learn", copy: "Hear practical lessons from experienced professionals.", icon: Student },
  { title: "Ask questions", copy: "Bring your questions and get answers live.", icon: Question },
  { title: "Interact", copy: "Join group activities and polls with other students.", icon: UsersThree },
  { title: "Reflect", copy: "Connect each idea to your own experiences.", icon: Brain },
  { title: "Practice", copy: "Try the skills in realistic scenarios, not just in theory.", icon: Lightning },
  { title: "Apply", copy: "Take what you learn into school, work and life.", icon: ListChecks },
];

const speakers = [
  { name: "Adaeze Okafor", topic: "Communication" },
  { name: "Tunde Adeyemi", topic: "Leadership" },
  { name: "Zainab Bello", topic: "Critical thinking" },
  { name: "Chidi Nwosu", topic: "Resilience" },
  { name: "Amara Eze", topic: "Integrity" },
];

const faqs = [
  ["Is it really free?", "Yes, completely free."],
  ["Who can join?", "Students in high school, university, technical or vocational colleges and other educational institutions."],
  ["Where is it held?", "Live on Zoom. You’ll get the link by email after registering."],
  ["Do I need to attend both days?", "We strongly recommend it, as the sessions build on each other."],
  ["Will I get a certificate?", "Details will be shared after registration."],
];

type Countdown = { days: number; hours: number; minutes: number; seconds: number };

function getCountdown(): Countdown {
  const distance = Math.max(0, new Date(siteConfig.event.startUtc).getTime() - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const countdownRef = useRef<HTMLElement>(null);
  const learningSectionRef = useRef<HTMLElement>(null);
  const levelFieldRef = useRef<HTMLDivElement>(null);
  const levelTriggerRef = useRef<HTMLButtonElement>(null);
  const videoDialogRef = useRef<HTMLDialogElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const [showNavCta, setShowNavCta] = useState(false);
  const [countdownInView, setCountdownInView] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const [localTime, setLocalTime] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedLevel, setSelectedLevel] = useState("");
  const [levelOpen, setLevelOpen] = useState(false);
  const [activeLevel, setActiveLevel] = useState(0);
  useEffect(() => {
    const closeAfterFullscreen = () => {
      if (!document.fullscreenElement && videoDialogRef.current?.open) videoDialogRef.current.close();
    };
    document.addEventListener("fullscreenchange", closeAfterFullscreen);
    return () => document.removeEventListener("fullscreenchange", closeAfterFullscreen);
  }, []);

  function playIntroVideo() {
    const dialog = videoDialogRef.current;
    const video = introVideoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!dialog || !video) return;
    dialog.showModal();
    if (video.requestFullscreen) void video.requestFullscreen().catch(() => {});
    else video.webkitEnterFullscreen?.();
    void video.play().catch(() => {});
  }

  function closeIntroVideo() {
    introVideoRef.current?.pause();
    if (document.fullscreenElement) void document.exitFullscreen();
    videoDialogRef.current?.close();
  }

  useEffect(() => {
    if (!levelOpen) return;
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!levelFieldRef.current?.contains(event.target as Node)) setLevelOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [levelOpen]);
  useEffect(() => {
    let frame = 0;
    let readyFrame = 0;
    let lastColor = "";
    let lastActiveSection = -1;
    const shell = pageRef.current;
    const sections = sectionColors.map(([selector, color]) => ({ element: shell?.querySelector<HTMLElement>(selector), color }));
    const skillsIndex = sectionColors.findIndex(([selector]) => selector === ".skills-section");
    const skillsHeading = shell?.querySelector<HTMLElement>(".skills-section h2");
    const twoDaysIndex = sectionColors.findIndex(([selector]) => selector === ".two-days-section");
    const twoDaysHeading = shell?.querySelector<HTMLElement>(".two-days-section h2");
    const registrationIndex = sectionColors.findIndex(([selector]) => selector === ".registration-section");
    const registrationHeading = shell?.querySelector<HTMLElement>(".registration-copy h2");
    const faqIndex = sectionColors.findIndex(([selector]) => selector === ".faq-section-new");
    const update = () => {
      frame = 0;
      const cta = heroCtaRef.current;
      const topbar = topbarRef.current;
      topbar?.classList.toggle("is-scrolled", window.scrollY > 0);
      if (cta && topbar) setShowNavCta(cta.getBoundingClientRect().bottom <= topbar.getBoundingClientRect().bottom);
      if (!shell) return;
      const mobile = window.innerWidth <= 800;
      let activeSection = -1;
      sections.forEach(({ element }, index) => {
        const entryLine = index === 0 ? window.innerHeight : window.innerHeight * 0.8;
        const heading = index === skillsIndex ? skillsHeading : index === twoDaysIndex ? twoDaysHeading : index === registrationIndex ? registrationHeading : undefined;
        const boundary = mobile && heading
          ? heading.getBoundingClientRect().bottom
          : element?.getBoundingClientRect().top;
        if (boundary !== undefined && boundary <= entryLine) activeSection = index;
      });
      shell.classList.toggle("skills-background-active", activeSection === skillsIndex);
      shell.classList.toggle("matter-background-active", activeSection === 1);
      shell.classList.toggle("schedule-background-active", activeSection === 4);
      shell.classList.toggle("two-days-background-active", activeSection === twoDaysIndex);
      shell.classList.toggle("registration-background-active", activeSection === registrationIndex);
      const color = activeSection < 0 ? (mobile ? [5, 7, 12] : [34, 219, 121]) : sections[activeSection].color;
      const nextColor = `rgb(${color.join(", ")})`;
      const enteringStory = activeSection === 0 && lastActiveSection < 0;
      const crossingRegistrationFaq = mobile && ((activeSection === faqIndex && lastActiveSection === registrationIndex) || (activeSection === registrationIndex && lastActiveSection === faqIndex));
      lastActiveSection = activeSection;
      if (nextColor === lastColor) return;
      if (!lastColor || enteringStory || crossingRegistrationFaq) {
        window.cancelAnimationFrame(readyFrame);
        shell.style.transitionDuration = "0ms";
        readyFrame = window.requestAnimationFrame(() => { shell.style.transitionDuration = ""; });
      }
      shell.style.setProperty("--section-bg", nextColor);
      lastColor = nextColor;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(readyFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      shell?.style.removeProperty("--section-bg");
      shell?.style.removeProperty("transition-duration");
      shell?.classList.remove("skills-background-active");
      shell?.classList.remove("matter-background-active");
      shell?.classList.remove("schedule-background-active");
      shell?.classList.remove("registration-background-active");
    };
  }, []);
  useEffect(() => {
    const updateCountdown = () => setCountdown(getCountdown());
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1_000);
    const formatter = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
    const localTimeTimer = window.setTimeout(() => {
      setLocalTime(formatter.formatRange(new Date(siteConfig.event.startUtc), new Date(siteConfig.event.endUtc)));
    }, 0);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(localTimeTimer);
    };
  }, []);
  useEffect(() => {
    const section = countdownRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      setCountdownInView(entry.intersectionRatio >= 0.995);
    }, { threshold: [0, 0.995] });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateFocusedStep = () => {
      frame = 0;
      const section = learningSectionRef.current;
      if (!section || window.innerWidth > 800) return;
      const bounds = section.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      const focusLine = window.innerHeight * 0.55;
      const steps = section.querySelectorAll<HTMLElement>(".learning-step");
      let closest = 0;
      let distance = Infinity;
      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const nextDistance = Math.abs(rect.top + rect.height / 2 - focusLine);
        if (nextDistance < distance) { distance = nextDistance; closest = index; }
      });
      setActiveStep((current) => current === closest ? current : closest);
    };
    const scheduleUpdate = () => { if (!frame) frame = window.requestAnimationFrame(updateFocusedStep); };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  useGSAP(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealWords = gsap.utils.toArray<HTMLElement>(".reveal-word");
    const revealItems = gsap.utils.toArray<HTMLElement>(".chapter-reveal").filter((item) =>
      window.innerWidth > 800 || !item.matches(".schedule-panel")
    );
    const motionImages = gsap.utils.toArray<HTMLElement>(".motion-image");
    const gradeStrokes = gsap.utils.toArray<SVGPathElement>(".grade-stroke");

    if (reducedMotion) {
      gsap.set([...revealWords, ...revealItems, ...motionImages], { opacity: 1, scale: 1, y: 0 });
      gsap.set(".organiser-image", { borderRadius: 0 });
      gsap.set(gradeStrokes, { strokeDashoffset: 0 });
      gsap.set(".grade-stamp, .grade-splash, .grade-paint, .grade-drip", { opacity: 1, scale: 1, y: 0 });
      return;
    }

    gsap.from(".hero-enter", { opacity: 0, y: 34, duration: 1, stagger: 0.1, ease: "power3.out" });
    gsap.fromTo(revealWords, { opacity: 0.12 }, {
      opacity: 1, stagger: 0.045, ease: "none",
      scrollTrigger: { trigger: ".reveal-statement", start: "top 78%", end: "bottom 40%", scrub: 0.55 },
    });
    revealItems.forEach((item) => gsap.from(item, { opacity: 0, y: 48, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 88%" } }));
    motionImages.forEach((image) => {
      const organiser = image.matches(".organiser-image");
      gsap.fromTo(image,
        { scale: 0.88, opacity: 0.55, ...(organiser ? { borderRadius: 32 } : {}) },
        { scale: 1, opacity: 1, ...(organiser ? { borderRadius: 0 } : {}), ease: "none", scrollTrigger: { trigger: image, start: "top 92%", end: "center 50%", scrub: 0.6 } },
      );
    });

    gsap.set(".grade-stamp", { scale: 1.8, rotation: -16, y: -18, transformOrigin: "50% 50%" });
    gsap.set(".grade-paint", { scaleX: 0.18, scaleY: 0.12, svgOrigin: "124 110" });
    const paintTimeline = gsap.timeline({ scrollTrigger: { trigger: ".grade-sketch", start: "top 78%", once: true } })
      .to(".grade-score", { strokeDashoffset: 0, duration: 0.42, stagger: 0.085, ease: "power1.inOut" })
      .set(".grade-stamp", { opacity: 1 }, "+=0.08")
      .to(".grade-stamp", { scale: 0.94, rotation: 0, y: 2, duration: 0.16, ease: "power3.in" })
      .addLabel("impact")
      .to(".grade-stamp", { scale: 1, y: 0, duration: 0.13, ease: "power2.out" }, "impact")
      .set(".grade-paint", { opacity: 1 }, "impact")
      .to(".grade-paint", { scaleX: 1.02, scaleY: 0.97, duration: 0.14, ease: "power3.out" }, "impact")
      .to(".grade-paint", { scaleX: 1, scaleY: 1, duration: 0.18, ease: "power1.out" }, "impact+=0.14");

    gsap.utils.toArray<SVGPathElement>(".grade-splash").forEach((drop, index) => {
      const dx = (Number(drop.dataset.x) - 124) * 0.8;
      const dy = (Number(drop.dataset.y) - 110) * 0.8;
      const duration = Number(drop.dataset.flight);
      const gravity = 24 * duration * duration;
      const flight = { progress: 0 };
      gsap.set(drop, { x: -dx, y: -dy, scale: 0.5, transformOrigin: "50% 50%" });
      const departure = `impact+=${0.018 + (index % 4) * 0.012}`;
      paintTimeline.set(drop, { opacity: 1 }, departure).to(flight, {
        progress: 1, duration, ease: "none",
        onUpdate: () => {
          const t = flight.progress;
          // Fast ejection slows through drag; gravity bends the last part of the flight.
          const travel = (1 - Math.exp(-5 * t)) / (1 - Math.exp(-5));
          gsap.set(drop, { x: -dx * (1 - travel), y: -dy * (1 - travel) + gravity * (t * t - travel), scale: 0.5 + 0.5 * travel });
        },
      }, departure);
    });
    gsap.utils.toArray<SVGPathElement>(".grade-drip").forEach((drip, index) => {
      const run = paintRuns[index];
      const flow = { progress: 0.015 };
      drip.setAttribute("d", paintRunPath(run, flow.progress));
      const onset = `impact+=${run.delay}`;
      paintTimeline.set(drip, { opacity: 1 }, onset).to(flow, {
        progress: 1, duration: run.duration, ease: "power1.inOut",
        onUpdate: () => drip.setAttribute("d", paintRunPath(run, flow.progress)),
      }, onset);
    });

    const matchMedia = gsap.matchMedia();
    matchMedia.add("(max-width: 800px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(".skill-card");
      const originalLayers = cards.map((card) => card.style.zIndex);
      cards.forEach((card, index) => {
        const lean = index % 2 === 0 ? -1.4 : 1.4;
        gsap.set(card, { transformOrigin: "50% 50%", willChange: "transform" });
        gsap.timeline({ scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 0.25, onUpdate: (self) => { card.style.zIndex = self.progress > 0.35 && self.progress < 0.65 ? "3" : "1"; } } })
          .fromTo(card, { scale: 0.94, rotationX: 3.5, rotation: lean }, { scale: 1.045, rotationX: 0, rotation: 0, duration: 0.5, ease: "none" })
          .to(card, { scale: 0.94, rotationX: -3.5, rotation: -lean, duration: 0.5, ease: "none" });
      });
      return () => cards.forEach((card, index) => { card.style.zIndex = originalLayers[index]; });
    });
    matchMedia.add("(min-width: 901px)", () => {
      ScrollTrigger.create({ trigger: ".schedule-layout", start: "top 110px", end: "bottom bottom-=80", pin: ".schedule-intro", pinSpacing: false });
    });
    return () => matchMedia.revert();
  }, { scope: pageRef });

  function handleRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const required = ["fullName", "email", "whatsapp", "level", "school"];
    const errors: Record<string, string> = {};
    required.forEach((field) => { if (!String(data.get(field) ?? "").trim()) errors[field] = "Please complete this field."; });
    const email = String(data.get("email") ?? "");
    if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
    const whatsapp = String(data.get("whatsapp") ?? "").replace(/\D/g, "");
    if (whatsapp && whatsapp.length < 7) errors.whatsapp = "Enter a valid WhatsApp number.";
    setFormErrors(errors);
    if (Object.keys(errors).length) { setFormStatus(""); return; }
    setFormStatus("Your details look good. Live registration confirmation will be enabled before launch.");
    form.reset();
    setSelectedLevel("");
    setLevelOpen(false);
  }

  function selectLevel(level: string) {
    setSelectedLevel(level);
    setLevelOpen(false);
    setFormErrors((current) => ({ ...current, level: "" }));
    levelTriggerRef.current?.focus();
  }

  function handleLevelKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = siteConfig.levels.length - 1;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const selectedIndex = siteConfig.levels.findIndex((level) => level === selectedLevel);
      setActiveLevel((current) => levelOpen ? (current + (event.key === "ArrowDown" ? 1 : last)) % (last + 1) : selectedIndex >= 0 ? selectedIndex : event.key === "ArrowDown" ? 0 : last);
      setLevelOpen(true);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveLevel(event.key === "Home" ? 0 : last);
      setLevelOpen(true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (levelOpen) selectLevel(siteConfig.levels[activeLevel]);
      else { setActiveLevel(Math.max(0, siteConfig.levels.findIndex((level) => level === selectedLevel))); setLevelOpen(true); }
    } else if (event.key === "Escape" && levelOpen) {
      event.preventDefault();
      setLevelOpen(false);
    } else if (event.key === "Tab") {
      setLevelOpen(false);
    }
  }

  const activeSchedule = siteConfig.schedules[activeDay];

  return (
    <>
      <main ref={pageRef} className="site-shell" id="top">
        <SmoothCorners />
        <header ref={topbarRef} className={`topbar${showNavCta ? " has-cta" : ""}`}>
          <a className="brand" href="#top" aria-label="KFSD Soft Skills Training home"><span className="brand-mark" aria-hidden="true"><Image src={`${assetPrefix}/images/kfsd-logo-mark.webp`} alt="" width={30} height={30} unoptimized /></span><span>KFSD <b>Soft Skills Training</b></span></a>
          <nav aria-label="Main navigation"><a href="#skills">Skills</a><a href="#schedule">Schedule</a><a href="#organiser">About KFSD</a></nav>
          <a className="topbar-cta" href="#register" aria-hidden={!showNavCta} tabIndex={showNavCta ? 0 : -1}><span className="cta-copy">Reserve my spot</span><ArrowRight size={17} weight="bold" /></a>
        </header>

        <section className="new-hero" aria-labelledby="hero-title">
          <Image src={`${assetPrefix}/images/hero-editorial.webp`} alt="Students collaborating while one student presents an idea" fill priority unoptimized sizes="100vw" className="hero-photo" />
          <div className="hero-scrim" aria-hidden="true" />
          <div className="hero-content">
            <p className="edition-badge hero-enter"><span className="edition-badge-icon"><Medal size={15} weight="duotone" aria-hidden="true" /></span><span>{siteConfig.edition}</span></p>
            <h1 id="hero-title" aria-label="Learn the soft skills that set you apart in 2 days."><span aria-hidden="true">{heroLeadWords.map((word, index) => <Fragment key={word}>{index > 0 && " "}<span className="hero-word">{heroLetters(word, heroLeadWords.slice(0, index).join("").length)}</span></Fragment>)}{" "}<span className="hero-ending">{heroLetters(heroEnding, heroEndingStart)}</span></span></h1>
            <p className="hero-subhead hero-enter">Learn from experienced professionals and become more career-ready.</p>
            <a ref={heroCtaRef} className="primary-cta hero-enter" href="#register"><span className="cta-copy">Reserve my spot</span><ArrowRight size={20} weight="bold" /></a>
          </div>
          <div className="event-dock hero-enter">
            <div><CalendarBlank size={22} weight="duotone" /><span>{siteConfig.event.dateLabel}</span></div>
            <div><Clock size={22} weight="duotone" /><span>{siteConfig.event.timeLabel}</span></div>
            <div><GlobeHemisphereWest size={22} weight="duotone" /><span>{siteConfig.event.venue}</span></div>
            <a href="#story" aria-label="Continue to the program story"><ArrowDown size={21} /></a>
          </div>
        </section>

        <section ref={countdownRef} className={`countdown-band${countdownInView ? " countdown-band-active" : ""}`} aria-label="Countdown to the training">
          <p>We start in</p>
          <div className="countdown-grid">{Object.entries(countdown).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>)}</div>
          <p>25 Nov · 10:00 WAT</p>
        </section>

        <section className="hook-section" id="story">
          <div className="hook-copy chapter-reveal">
            <h2>Does any of this sound like you?</h2>
            <ol className="question-list">{questions.map((question, index) => <li key={question}><span>{String(index + 1).padStart(2, "0")}</span><p>{question}</p></li>)}</ol>
            <p className="hook-answer">Then this is for you.</p>
          </div>
          <figure className="hook-visual motion-image">
            <Image src={`${assetPrefix}/images/kfsd-intro-poster.webp`} alt="A KFSD participant speaking about soft skills" fill unoptimized sizes="(max-width: 800px) 100vw, 46vw" />
            <button className="hook-play" type="button" onClick={playIntroVideo} aria-label="Play the KFSD introduction video fullscreen"><Play size={31} weight="fill" aria-hidden="true" /></button>
            <figcaption><RocketLaunch size={28} weight="fill" /> Equip yourself for the future</figcaption>
          </figure>
        </section>

        <section className="matter-section">
          <div className="matter-heading">
            <h2>Your future needs more than good grades.</h2>
            <GradeSketch />
          </div>
          <p className="reveal-statement">{"Soft skills are what everyone ignores, but they are just as important as technical skills. They help you communicate, lead, work with others, think clearly and handle tough moments. These are the skills that decide who gets noticed and who gets ahead in school, at work and in life.".split(" ").map((word, index) => <span className="reveal-word" key={`${word}-${index}`}>{word}{" "}</span>)}</p>
        </section>

        <section className="skills-section" id="skills">
          <div className="section-heading"><h2>Five skills you’ll learn that change how people see you</h2></div>
          <div className="skills-grid grid-flow-dense">
            {skills.map(({ title, copy, icon: Icon, className, image }) => (
              <article className={`skill-card ${className}`} key={title}>
                {image && <Image src={`${assetPrefix}${image}`} alt="" fill unoptimized sizes="(max-width: 760px) 100vw, 58vw" className="skill-image" />}
                <div className="skill-overlay" aria-hidden="true" />
                <div className="skill-card-content"><div className="skill-meta"><Icon size={30} weight="duotone" /></div><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section ref={learningSectionRef} className="learning-section">
          <div className="section-heading learning-heading chapter-reveal"><h2>Real advice from people who’ve done it. Here’s how to make them stick</h2></div>
          <div className="learning-steps">
            <LearningFlow activeStep={activeStep} />
            {learningSteps.map(({ title, copy, icon: Icon }, index) => {
              const active = activeStep === index;
              return <button className={`learning-step${active ? " active" : ""}`} type="button" key={title} aria-expanded={active} onClick={() => setActiveStep(index)} onMouseEnter={() => { if (window.innerWidth > 800) setActiveStep(index); }} onFocus={() => setActiveStep(index)}>
                <span className="learning-step-icon"><Icon size={26} weight="duotone" /></span>
                <span className="learning-step-text"><strong>{title}</strong><small aria-hidden={!active}>{copy}</small></span>
                <span className="learning-step-index" aria-hidden="true">0{index + 1}</span>
              </button>;
            })}
          </div>
        </section>

        <section className="schedule-section" id="schedule">
          <div className="schedule-layout">
            <div className="schedule-intro"><h2>What happens in each session</h2><p>Both days run from 10:00AM to 12:00PM West Africa Time.</p><div className="local-time-card"><GlobeHemisphereWest size={25} weight="duotone" /><div><strong>Not in Nigeria?</strong><span>{localTime || "Converting 10:00AM WAT to your local time…"}</span></div></div></div>
            <div className="schedule-panel chapter-reveal">
              <div className="day-tabs" data-active-day={activeDay} role="tablist" aria-label="Training days"><span className="day-tabs-highlight" aria-hidden="true" />{siteConfig.schedules.map((day, index) => <button key={day.label} role="tab" aria-selected={activeDay === index} onClick={() => setActiveDay(index)}>{day.label}</button>)}</div>
              <div className="schedule-title"><div><span>{activeSchedule.date}</span><h3>{activeSchedule.title}</h3></div><Clock size={31} weight="duotone" /></div>
              <ol className="agenda-list">{activeSchedule.items.map(([time, item]) => <li key={`${time}-${item}`}><time>{time}</time><span>{item}</span></li>)}</ol>
            </div>
          </div>
        </section>

        <section className="proof-section">
          <div className="proof-header chapter-reveal"><p className="section-kicker">The speakers</p><h2>Five voices. Five skills. A fresh perspective.</h2><p>Meet the faces behind each topic, each led by someone who has lived it</p></div>
          <div className="speaker-placeholder-grid">{speakers.map(({ name, topic }, index) => <article key={topic}><div className="speaker-portrait" aria-hidden="true" style={{ backgroundImage: `url(${assetPrefix}/images/speaker-placeholders.webp)`, backgroundPosition: `${index * 25}% top` }} /><div className="speaker-details"><h3>{name}</h3><p>{topic}</p></div></article>)}</div>
        </section>

        <section className="organiser-section" id="organiser">
          <div className="organiser-image motion-image"><Image src={`${assetPrefix}/images/listening.webp`} alt="Young people taking part in a thoughtful group conversation" fill unoptimized sizes="(max-width: 800px) 100vw, 48vw" /></div>
          <div className="organiser-copy chapter-reveal"><p className="section-kicker">Organised by KFSD</p><h2>Eight years of helping young people stand out</h2><p>For eight years, KFSD has been running sessions that teach young people the skills that set them apart in work, business and life. This is another amazing edition, after a year of waiting. We’re excited to bring you this opportunity.</p></div>
        </section>

        <section className="two-days-section"><div className="two-days-number" aria-hidden="true">2</div><div><h2>Two hours. Two days. A lifetime of difference.</h2></div><p>We’ve packed the most valuable lessons into four focused hours so you get maximum value without wasting your time. These are four hours with information that could change how you show up for the rest of your life.</p></section>

        <section className="registration-section" id="register">
          <div className="registration-copy chapter-reveal">
            <p className="section-kicker">Registration</p>
            <div className="registration-heading">
              <h2>Register for the soft skills training and take on a new mindset that will shape your future.</h2>
              <strong className="registration-free-badge" aria-label="Free">
                <svg viewBox="0 0 144 144" aria-hidden="true">
                  <path d="M 72.00 9.00 L 74.72 9.60 L 77.32 11.23 L 79.70 13.50 L 81.90 15.87 L 84.02 17.78 L 86.24 18.87 L 88.70 19.03 L 91.50 18.44 L 94.58 17.49 L 97.78 16.72 L 100.84 16.59 L 103.50 17.44 L 105.56 19.32 L 106.99 22.03 L 107.92 25.19 L 108.64 28.34 L 109.52 31.05 L 110.89 33.11 L 112.95 34.48 L 115.66 35.36 L 118.81 36.08 L 121.97 37.01 L 124.68 38.44 L 126.56 40.50 L 127.41 43.16 L 127.28 46.22 L 126.51 49.42 L 125.56 52.50 L 124.97 55.30 L 125.13 57.76 L 126.22 59.98 L 128.13 62.10 L 130.50 64.30 L 132.77 66.68 L 134.40 69.28 L 135.00 72.00 L 134.40 74.72 L 132.77 77.32 L 130.50 79.70 L 128.13 81.90 L 126.22 84.02 L 125.13 86.24 L 124.97 88.70 L 125.56 91.50 L 126.51 94.58 L 127.28 97.78 L 127.41 100.84 L 126.56 103.50 L 124.68 105.56 L 121.97 106.99 L 118.81 107.92 L 115.66 108.64 L 112.95 109.52 L 110.89 110.89 L 109.52 112.95 L 108.64 115.66 L 107.92 118.81 L 106.99 121.97 L 105.56 124.68 L 103.50 126.56 L 100.84 127.41 L 97.78 127.28 L 94.58 126.51 L 91.50 125.56 L 88.70 124.97 L 86.24 125.13 L 84.02 126.22 L 81.90 128.13 L 79.70 130.50 L 77.32 132.77 L 74.72 134.40 L 72.00 135.00 L 69.28 134.40 L 66.68 132.77 L 64.30 130.50 L 62.10 128.13 L 59.98 126.22 L 57.76 125.13 L 55.30 124.97 L 52.50 125.56 L 49.42 126.51 L 46.22 127.28 L 43.16 127.41 L 40.50 126.56 L 38.44 124.68 L 37.01 121.97 L 36.08 118.81 L 35.36 115.66 L 34.48 112.95 L 33.11 110.89 L 31.05 109.52 L 28.34 108.64 L 25.19 107.92 L 22.03 106.99 L 19.32 105.56 L 17.44 103.50 L 16.59 100.84 L 16.72 97.78 L 17.49 94.58 L 18.44 91.50 L 19.03 88.70 L 18.87 86.24 L 17.78 84.02 L 15.87 81.90 L 13.50 79.70 L 11.23 77.32 L 9.60 74.72 L 9.00 72.00 L 9.60 69.28 L 11.23 66.68 L 13.50 64.30 L 15.87 62.10 L 17.78 59.98 L 18.87 57.76 L 19.03 55.30 L 18.44 52.50 L 17.49 49.42 L 16.72 46.22 L 16.59 43.16 L 17.44 40.50 L 19.32 38.44 L 22.03 37.01 L 25.19 36.08 L 28.34 35.36 L 31.05 34.48 L 33.11 33.11 L 34.48 31.05 L 35.36 28.34 L 36.08 25.19 L 37.01 22.03 L 38.44 19.32 L 40.50 17.44 L 43.16 16.59 L 46.22 16.72 L 49.42 17.49 L 52.50 18.44 L 55.30 19.03 L 57.76 18.87 L 59.98 17.78 L 62.10 15.87 L 64.30 13.50 L 66.68 11.23 L 69.28 9.60 Z" fill="#d51f30" />
                  <text x="72" y="82" textAnchor="middle" fill="#ffffff" fontFamily="Arial, sans-serif" fontSize="38" fontWeight="900" letterSpacing="-2">FREE</text>
                </svg>
              </strong>
            </div>
          </div>
          <form className="registration-form" onSubmit={handleRegistration} noValidate>
            <label>Full name<input name="fullName" type="text" autoComplete="name" placeholder="Your full name" aria-describedby={formErrors.fullName ? "fullName-error" : undefined} />{formErrors.fullName && <small id="fullName-error">{formErrors.fullName}</small>}</label>
            <div className="form-row">
              <label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-describedby={formErrors.email ? "email-error" : undefined} />{formErrors.email && <small id="email-error">{formErrors.email}</small>}</label>
              <label>WhatsApp number<input name="whatsapp" type="tel" autoComplete="tel" placeholder="+234 800 000 0000" aria-describedby={formErrors.whatsapp ? "whatsapp-error" : undefined} />{formErrors.whatsapp && <small id="whatsapp-error">{formErrors.whatsapp}</small>}</label>
            </div>
            <div className="level-field" ref={levelFieldRef}>
              <label htmlFor="level-trigger">Current level</label>
              <input type="hidden" name="level" value={selectedLevel} />
              <button id="level-trigger" ref={levelTriggerRef} className={`level-trigger${selectedLevel ? " is-selected" : ""}`} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={levelOpen} aria-controls="level-options" aria-activedescendant={levelOpen ? `level-option-${activeLevel}` : undefined} aria-invalid={Boolean(formErrors.level)} aria-describedby={formErrors.level ? "level-error" : undefined} onClick={() => { setActiveLevel(Math.max(0, siteConfig.levels.findIndex((level) => level === selectedLevel))); setLevelOpen((open) => !open); }} onKeyDown={handleLevelKeyDown}>
                <span>{selectedLevel || "Select your level"}</span><CaretDown size={18} weight="bold" aria-hidden="true" />
              </button>
              {levelOpen && <div id="level-options" className="level-options" role="listbox" aria-label="Current level">
                {siteConfig.levels.map((level, index) => <div id={`level-option-${index}`} className={`level-option${index === activeLevel ? " is-active" : ""}`} role="option" aria-selected={level === selectedLevel} key={level} onPointerMove={() => setActiveLevel(index)} onClick={() => selectLevel(level)}>{level}</div>)}
              </div>}
              {formErrors.level && <small id="level-error">{formErrors.level}</small>}
            </div>
            <label>School or institution name<input name="school" type="text" autoComplete="organization" placeholder="Your school or institution" aria-describedby={formErrors.school ? "school-error" : undefined} />{formErrors.school && <small id="school-error">{formErrors.school}</small>}</label>
            <button type="submit">Reserve My Free Spot</button><p className="form-reassurance">Your details will only be used for this training.</p>{formStatus && <p className="form-status" role="status">{formStatus}</p>}
          </form>
        </section>

        <section className="faq-section-new"><div><h2>Questions, answered.</h2></div><div className="faq-list-new">{faqs.map(([question, answer], index) => {
          const open = openFaqs.includes(index);
          return <div className={`faq-item${open ? " is-open" : ""}`} key={question}>
            <h3><button id={`faq-question-${index}`} type="button" aria-expanded={open} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaqs((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])}>{question}<span aria-hidden="true">+</span></button></h3>
            <div id={`faq-answer-${index}`} className="faq-answer" role="region" aria-labelledby={`faq-question-${index}`} aria-hidden={!open}><div className="faq-answer-inner"><p>{answer}</p></div></div>
          </div>;
        })}</div></section>

        <footer className="new-footer"><a className="footer-identity" href="#top" aria-label="KFSD Soft Skills Training home"><span className="footer-logo"><Image src={`${assetPrefix}/images/kfsd-logo-full.webp`} alt="Kaiser Foundation for Social Development logo" width={155} height={155} unoptimized /></span><strong>KFSD Soft Skills Training</strong></a><div className="footer-bottom"><p>Organised by {siteConfig.organiser}</p><p>{siteConfig.event.dateLabel} · {siteConfig.event.timeLabel}</p><p>© 2026 KFSD</p></div></footer>
      </main>
      <dialog ref={videoDialogRef} className="intro-video-dialog" onCancel={(event) => { event.preventDefault(); closeIntroVideo(); }} onClose={() => introVideoRef.current?.pause()}>
        <button className="intro-video-close" type="button" onClick={closeIntroVideo} aria-label="Close video">×</button>
        <video ref={introVideoRef} controls playsInline preload="none" poster={`${assetPrefix}/images/kfsd-intro-poster.webp`} src={`${assetPrefix}/videos/kfsd-intro.mp4`} aria-label="KFSD introduction video" />
      </dialog>
    </>
  );
}
