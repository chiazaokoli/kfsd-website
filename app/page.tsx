"use client";

import { type CSSProperties, FormEvent, Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDown, ArrowRight, ArrowUpRight, Brain, CalendarBlank, ChatCircleDots,
  Check, Clock, CrownSimple, GlobeHemisphereWest, HandHeart, Lightning,
  ListChecks, MicrophoneStage, Mountains, Play, Question, ShieldCheck,
  Sparkle, Student, UsersThree, Medal,
} from "@phosphor-icons/react";
import { siteConfig } from "../src/config/site";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const heroLeadWords = ["Learn", "the", "soft", "skills", "that", "set", "you", "apart", "in"];
const heroEnding = "2 days.";
const heroEndingStart = heroLeadWords.join("").length;

function heroLetters(text: string, startIndex: number) {
  return [...text].map((letter, index) => letter === " " ? " " : (
    <span className="hero-letter" key={index} style={{ "--letter-delay": `${180 + (startIndex + index) * 18}ms` } as CSSProperties}>{letter}</span>
  ));
}

const questions = [
  "Do you struggle with rallying your friends around a task?",
  "Do you want to be liked more by people?",
  "Do you want to keep to deadlines and manage your time better?",
  "Do you want people to listen when you speak?",
  "Do you want to speak publicly without feeling nervous?",
];

const skills = [
  { title: "Lead with Confidence", copy: "Learn how to lead yourself and others, take responsibility, show initiative and positively influence the people around you.", icon: CrownSimple, className: "skill-wide skill-blue", image: "/images/student-speaker.webp" },
  { title: "Think Critically", copy: "Learn to analyse information, question assumptions, see different perspectives and make smart decisions.", icon: Brain, className: "skill-wide skill-photo", image: "/images/collaboration.webp" },
  { title: "Communicate Clearly", copy: "Express your ideas clearly, listen well and speak with confidence to any audience.", icon: ChatCircleDots, className: "skill-third skill-lime" },
  { title: "Build Resilience", copy: "Handle setbacks, challenges and pressure while keeping a positive, solution-focused mindset.", icon: Mountains, className: "skill-third skill-cream" },
  { title: "Act with Integrity", copy: "Understand why honesty, accountability and doing the right thing matter in your personal and professional life.", icon: ShieldCheck, className: "skill-third skill-dark" },
];

const learningSteps = [
  { title: "Learn", copy: "Hear from experienced professionals.", icon: Student, image: "/images/student-speaker.webp" },
  { title: "Ask questions", copy: "Get answers live.", icon: Question, image: "/images/listening.webp" },
  { title: "Interact", copy: "Join group activities and polls.", icon: UsersThree, image: "/images/collaboration.webp" },
  { title: "Reflect", copy: "Think about what it means for you.", icon: Brain, image: "/images/reflection.webp" },
  { title: "Practice", copy: "Try the skills in real scenarios.", icon: Lightning, image: "/images/student-speaker.webp" },
  { title: "Apply", copy: "Take them into school, work and life.", icon: ListChecks, image: "/images/collaboration.webp" },
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
  const [showNavCta, setShowNavCta] = useState(false);
  const [countdownInView, setCountdownInView] = useState(false);
  const [countdown, setCountdown] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [activeStep, setActiveStep] = useState(0);
  const [activeDay, setActiveDay] = useState(0);
  const [localTime, setLocalTime] = useState("");
  const [formStatus, setFormStatus] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const cta = heroCtaRef.current;
      const topbar = topbarRef.current;
      if (cta && topbar) setShowNavCta(cta.getBoundingClientRect().bottom <= topbar.getBoundingClientRect().bottom);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
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

  useGSAP(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealWords = gsap.utils.toArray<HTMLElement>(".reveal-word");
    const revealItems = gsap.utils.toArray<HTMLElement>(".chapter-reveal");
    const motionImages = gsap.utils.toArray<HTMLElement>(".motion-image");
    const gradeStrokes = gsap.utils.toArray<SVGPathElement>(".grade-stroke");

    if (reducedMotion) {
      gsap.set([...revealWords, ...revealItems, ...motionImages], { opacity: 1, scale: 1, y: 0 });
      gsap.set(gradeStrokes, { strokeDashoffset: 0 });
      gsap.set(".grade-stamp, .grade-splash, .grade-paint, .grade-drip", { opacity: 1, scale: 1, y: 0 });
      return;
    }

    gsap.from(".hero-enter", { opacity: 0, y: 34, duration: 1, stagger: 0.1, ease: "power3.out" });
    gsap.fromTo(revealWords, { opacity: 0.12 }, { opacity: 1, stagger: 0.045, ease: "none", scrollTrigger: { trigger: ".reveal-statement", start: "top 78%", end: "bottom 40%", scrub: 0.55 } });
    revealItems.forEach((item) => gsap.from(item, { opacity: 0, y: 48, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 88%" } }));
    motionImages.forEach((image) => gsap.fromTo(image, { scale: 0.88, opacity: 0.55 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: image, start: "top 92%", end: "center 50%", scrub: 0.6 } }));

    gsap.set(".grade-stamp", { scale: 1.8, rotation: -16, y: -18, transformOrigin: "50% 50%" });
    gsap.utils.toArray<SVGEllipseElement>(".grade-splash").forEach((drop) => {
      gsap.set(drop, { x: (165 - Number(drop.getAttribute("cx"))) * 0.65, y: (105 - Number(drop.getAttribute("cy"))) * 0.65, scale: 0.15, transformOrigin: "50% 50%" });
    });
    gsap.set(".grade-paint", { scale: 0.45, y: -10, transformOrigin: "50% 50%" });
    gsap.set(".grade-drip", { scaleY: 0.08, transformOrigin: "50% 0%" });
    gsap.timeline({ scrollTrigger: { trigger: ".grade-sketch", start: "top 78%", once: true } })
      .to(".grade-score", { strokeDashoffset: 0, duration: 0.27, stagger: 0.055, ease: "power1.inOut" })
      .set(".grade-stamp", { opacity: 1 }, "+=0.08")
      .to(".grade-stamp", { scale: 0.94, rotation: 0, y: 2, duration: 0.16, ease: "power3.in" })
      .addLabel("impact")
      .to(".grade-stamp", { scale: 1, y: 0, duration: 0.13, ease: "power2.out" }, "impact")
      .to(".grade-splash", { x: 0, y: 0, scale: 1, opacity: 0.9, duration: 0.25, ease: "power3.out", stagger: 0.008 }, "impact")
      .to(".grade-paint", { scale: 1, y: 0, opacity: 1, duration: 0.28, ease: "power3.out" }, "impact")
      .to(".grade-drip", { scaleY: 1, opacity: 1, duration: 2.2, ease: "power1.in", stagger: 0.18 }, "impact+=0.16")
      .to(".grade-splash", { opacity: 0.7, duration: 0.35 }, "impact+=0.3");

    const matchMedia = gsap.matchMedia();
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
  }

  const activeSchedule = siteConfig.schedules[activeDay];

  return (
    <>
      <main ref={pageRef} className="site-shell" id="top">
        <header ref={topbarRef} className={`topbar${showNavCta ? " has-cta" : ""}`}>
          <a className="brand" href="#top" aria-label="KFSD Soft Skills Training home"><span className="brand-mark" aria-hidden="true"><Sparkle size={16} weight="fill" /></span><span>KFSD <b>Soft Skills Training</b></span></a>
          <nav aria-label="Main navigation"><a href="#skills">Skills</a><a href="#schedule">Schedule</a><a href="#organiser">About CKL</a></nav>
          <a className="topbar-cta" href="#register" aria-hidden={!showNavCta} tabIndex={showNavCta ? 0 : -1}><span className="cta-copy">Reserve My Free Spot</span><ArrowRight size={17} weight="bold" /></a>
        </header>

        <section className="new-hero" aria-labelledby="hero-title">
          <Image src={`${assetPrefix}/images/hero-editorial.webp`} alt="Students collaborating while one student presents an idea" fill priority unoptimized sizes="100vw" className="hero-photo" />
          <div className="hero-scrim" aria-hidden="true" />
          <div className="hero-content">
            <p className="edition-badge hero-enter"><span className="edition-badge-icon"><Medal size={15} weight="duotone" aria-hidden="true" /></span><span>{siteConfig.edition}</span></p>
            <h1 id="hero-title" aria-label="Learn the soft skills that set you apart in 2 days."><span aria-hidden="true">{heroLeadWords.map((word, index) => <Fragment key={word}>{index > 0 && " "}<span className="hero-word">{heroLetters(word, heroLeadWords.slice(0, index).join("").length)}</span></Fragment>)}{" "}<span className="hero-ending">{heroLetters(heroEnding, heroEndingStart)}</span></span></h1>
            <p className="hero-subhead hero-enter">Learn from experienced professionals and become more career-ready.</p>
            <a ref={heroCtaRef} className="primary-cta hero-enter" href="#register"><span className="cta-copy">Reserve My Free Spot</span><ArrowRight size={20} weight="bold" /></a>
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
            <Image src={`${assetPrefix}/images/student-speaker.webp`} alt="A student speaking confidently to a group" fill unoptimized sizes="(max-width: 800px) 100vw, 46vw" />
            <figcaption><MicrophoneStage size={28} weight="fill" /> Find your voice. Make it count.</figcaption>
          </figure>
        </section>

        <section className="matter-section">
          <div className="matter-heading">
            <h2>Your future needs more than good grades.</h2>
            <svg className="grade-sketch" viewBox="0 0 240 285" role="img" aria-label="95 out of 100, questioned: are good grades enough?">
              <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                <path className="grade-stroke grade-score" pathLength="1" d="M99 42 C87 29 65 36 64 52 C63 72 85 74 98 56 M100 38 C100 58 98 78 82 94" />
                <path className="grade-stroke grade-score" pathLength="1" d="M157 35 L124 37 L120 62 C133 54 154 58 154 75 C154 94 130 101 116 88" />
                <path className="grade-stroke grade-score" pathLength="1" d="M40 114 C82 111 129 113 176 108" />
                <path className="grade-stroke grade-score" pathLength="1" d="M44 151 L58 137 L55 190 M43 191 L69 189" />
                <path className="grade-stroke grade-score" pathLength="1" d="M99 135 C75 136 73 190 93 193 C115 195 122 137 101 135 L99 135" />
                <path className="grade-stroke grade-score" pathLength="1" d="M149 133 C126 135 124 187 144 190 C166 192 172 135 151 133 L149 133" />
              </g>
              <g fill="#ff555f" aria-hidden="true">
                <ellipse className="grade-splash" cx="120" cy="43" rx="2.3" ry="4.8" />
                <ellipse className="grade-splash" cx="151" cy="29" rx="3" ry="4.4" />
                <ellipse className="grade-splash" cx="194" cy="35" rx="2.2" ry="3.8" />
                <ellipse className="grade-splash" cx="219" cy="57" rx="4.8" ry="2.6" />
                <ellipse className="grade-splash" cx="226" cy="92" rx="3.8" ry="2" />
                <ellipse className="grade-splash" cx="213" cy="117" rx="2.6" ry="4.2" />
                <ellipse className="grade-splash" cx="196" cy="153" rx="3.3" ry="4.5" />
                <ellipse className="grade-splash" cx="176" cy="180" rx="2.1" ry="3.7" />
                <ellipse className="grade-splash" cx="136" cy="160" rx="3.7" ry="2.5" />
                <ellipse className="grade-splash" cx="112" cy="101" rx="4.5" ry="2.3" />
                <ellipse className="grade-splash" cx="226" cy="130" rx="1.5" ry="1.8" />
                <ellipse className="grade-splash" cx="131" cy="23" rx="1.6" ry="1.6" />
              </g>
              <g className="grade-stamp">
                <g fill="none" stroke="#ff555f" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" transform="rotate(12 165 115)">
                  <path d="M137 76 C140 48 180 44 195 64 C214 89 187 100 173 111 C165 117 165 125 166 132" />
                  <path d="M166 154 L166 156" />
                </g>
              </g>
              <g fill="#ff555f" aria-hidden="true">
                <path className="grade-drip" d="M75 220 C72 231 73 246 75 263 C76 270 83 270 84 263 C86 250 80 232 82 220 Z" />
                <path className="grade-drip" d="M111 223 C108 235 109 259 112 273 C114 279 121 279 122 272 C123 259 118 239 119 222 Z" />
                <path className="grade-drip" d="M154 219 C150 231 150 247 153 257 C155 264 162 265 164 257 C166 245 160 231 163 219 Z" />
                <path className="grade-drip" d="M193 215 C189 226 191 241 193 249 C195 256 201 255 203 249 C205 240 198 226 200 215 Z" />
                <path className="grade-paint" d="M47 218 C40 213 44 208 54 209 L44 201 C42 197 48 195 53 199 L68 207 C72 200 77 201 80 208 L91 201 C96 198 101 203 99 209 C111 203 117 206 120 211 C128 206 134 208 139 212 L149 204 C156 200 160 204 157 210 C169 205 174 209 178 211 L197 204 C205 200 210 205 203 211 L219 211 C227 212 226 218 217 220 L205 223 C204 230 197 232 191 228 C181 234 170 229 165 226 C157 233 145 231 139 226 C128 233 120 230 113 226 C103 234 92 230 86 226 C74 232 65 228 59 225 L47 225 C39 224 39 219 47 218 Z" />
                <ellipse className="grade-paint" cx="45" cy="237" rx="4" ry="2.5" />
                <ellipse className="grade-paint" cx="63" cy="244" rx="2" ry="3.8" />
                <ellipse className="grade-paint" cx="209" cy="237" rx="3.8" ry="2.2" />
                <ellipse className="grade-paint" cx="221" cy="224" rx="1.8" ry="3" />
              </g>
            </svg>
          </div>
          <p className="reveal-statement">{"Soft skills are what everyone ignores, but they are just as important as technical skills. They help you communicate, lead, work with others, think clearly and handle tough moments. These are the skills that decide who gets noticed and who gets ahead in school, at work and in life.".split(" ").map((word, index) => <span className="reveal-word" key={`${word}-${index}`}>{word}{" "}</span>)}</p>
        </section>

        <section className="skills-section" id="skills">
          <div className="section-heading chapter-reveal"><h2>5 skills you’ll learn that change how people see you</h2></div>
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

        <section className="learning-section">
          <div className="section-heading learning-heading chapter-reveal"><h2>No boring lectures. You’ll actually do things.</h2></div>
          <div className="learning-accordion">
            {learningSteps.map(({ title, copy, icon: Icon, image }, index) => {
              const active = activeStep === index;
              return <button className={`learning-panel ${active ? "active" : ""}`} type="button" key={title} aria-expanded={active} onClick={() => setActiveStep(index)} onMouseEnter={() => setActiveStep(index)}>
                <Image src={`${assetPrefix}${image}`} alt="" fill unoptimized sizes="(max-width: 800px) 100vw, 50vw" /><span className="learning-shade" /><span className="learning-index">0{index + 1}</span><span className="learning-label"><Icon size={24} weight="duotone" /><strong>{title}</strong><small>{copy}</small></span>
              </button>;
            })}
          </div>
        </section>

        <section className="schedule-section" id="schedule">
          <div className="schedule-layout">
            <div className="schedule-intro"><h2>Order of the day</h2><p>Both days run from 10:00AM to 12:00PM West Africa Time.</p><div className="local-time-card"><GlobeHemisphereWest size={25} weight="duotone" /><div><strong>Not in Nigeria?</strong><span>{localTime || "Converting 10:00AM WAT to your local time…"}</span></div></div></div>
            <div className="schedule-panel chapter-reveal">
              <div className="day-tabs" role="tablist" aria-label="Training days">{siteConfig.schedules.map((day, index) => <button key={day.label} role="tab" aria-selected={activeDay === index} onClick={() => setActiveDay(index)}>{day.label}</button>)}</div>
              <div className="schedule-title"><div><span>{activeSchedule.date}</span><h3>{activeSchedule.title}</h3></div><Clock size={31} weight="duotone" /></div>
              <ol className="agenda-list">{activeSchedule.items.map(([time, item]) => <li key={`${time}-${item}`}><time>{time}</time><span>{item}</span></li>)}</ol><p className="schedule-note">Schedule may be adjusted slightly.</p>
            </div>
          </div>
        </section>

        <section className="proof-section">
          <div className="proof-header chapter-reveal"><p className="section-kicker">People and proof</p><h2>Know who is behind the room before you join it.</h2><p>Speaker profiles, verified student stories and real footage will appear here as soon as the organiser approves them.</p></div>
          <div className="speaker-placeholder-grid">{["Leadership", "Communication", "Career readiness", "Youth development"].map((area, index) => <article key={area}><span className="portrait-placeholder"><Student size={42} weight="thin" /></span><div><small>Profile {String(index + 1).padStart(2, "0")}</small><h3>{area} facilitator</h3><p>Verified profile coming soon</p></div></article>)}</div>
          <div className="story-carousel" aria-label="Participant story placeholders">
            <article className="video-story"><Image src={`${assetPrefix}/images/reflection.webp`} alt="Students reflecting together" fill unoptimized sizes="(max-width: 800px) 90vw, 45vw" /><span className="video-shade" /><div><span className="play-icon"><Play size={23} weight="fill" /></span><p>Video stories coming soon</p></div></article>
            {["Confidence", "Time management", "Speaking up"].map((topic) => <article className="story-placeholder" key={topic}><HandHeart size={27} weight="duotone" /><p>{topic}</p><span>Approved participant story coming soon</span></article>)}
          </div>
        </section>

        <section className="organiser-section" id="organiser">
          <div className="organiser-image motion-image"><Image src={`${assetPrefix}/images/listening.webp`} alt="Young people taking part in a thoughtful group conversation" fill unoptimized sizes="(max-width: 800px) 100vw, 48vw" /></div>
          <div className="organiser-copy chapter-reveal"><p className="section-kicker">Organised by CKL</p><h2>Four years of helping young people stand out</h2><p>For four years, CKL has been running sessions that teach young people the skills that set them apart in work, business and life. This is another amazing edition, after 300 days of waiting. We’re excited to bring you this opportunity.</p><p className="organiser-note"><ShieldCheck size={22} weight="duotone" /> Additional organiser links and affiliations will be added after verification.</p></div>
        </section>

        <section className="two-days-section"><div className="two-days-number" aria-hidden="true">2</div><div><p className="section-kicker">Why just two days?</p><h2>2 hours. 2 days. A lifetime of difference.</h2></div><p>We’ve packed the most valuable lessons into 4 focused hours so you get maximum value without wasting your time. These are 4 hours with information that could change how you show up for the rest of your life.</p></section>

        <section className="registration-section" id="register">
          <div className="registration-copy chapter-reveal">
            <p className="section-kicker">Registration</p><h2>Register for the soft skills training and take on a new mindset that will shape your future.</h2><div className="registration-price"><strong>{siteConfig.registration.priceNow}</strong></div>
            <div className="availability"><div><span>Registration window</span><b>Spaces are limited</b></div><div className="availability-track"><span /></div><p>Confirmed availability will be shown here when registration goes live.</p></div>
            <div className="registration-reminder"><Check size={18} weight="bold" /> 2 hours a day <Check size={18} weight="bold" /> 2 days <Check size={18} weight="bold" /> 100% free</div>
          </div>
          <form className="registration-form" onSubmit={handleRegistration} noValidate>
            <label>Full name<input name="fullName" type="text" autoComplete="name" placeholder="Your full name" aria-describedby={formErrors.fullName ? "fullName-error" : undefined} />{formErrors.fullName && <small id="fullName-error">{formErrors.fullName}</small>}</label>
            <div className="form-row">
              <label>Email<input name="email" type="email" autoComplete="email" placeholder="you@example.com" aria-describedby={formErrors.email ? "email-error" : undefined} />{formErrors.email && <small id="email-error">{formErrors.email}</small>}</label>
              <label>WhatsApp number<input name="whatsapp" type="tel" autoComplete="tel" placeholder="+234 800 000 0000" aria-describedby={formErrors.whatsapp ? "whatsapp-error" : undefined} />{formErrors.whatsapp && <small id="whatsapp-error">{formErrors.whatsapp}</small>}</label>
            </div>
            <label>Current level<select name="level" defaultValue="" aria-describedby={formErrors.level ? "level-error" : undefined}><option value="" disabled>Select your level</option>{siteConfig.levels.map((level) => <option key={level}>{level}</option>)}</select>{formErrors.level && <small id="level-error">{formErrors.level}</small>}</label>
            <label>School or institution name<input name="school" type="text" autoComplete="organization" placeholder="Your school or institution" aria-describedby={formErrors.school ? "school-error" : undefined} />{formErrors.school && <small id="school-error">{formErrors.school}</small>}</label>
            <button type="submit">Reserve My Free Spot <ArrowUpRight size={20} weight="bold" /></button><p className="form-reassurance">Your details will only be used for this training.</p>{formStatus && <p className="form-status" role="status">{formStatus}</p>}
          </form>
        </section>

        <section className="faq-section-new"><div><p className="section-kicker">Good to know</p><h2>Questions, answered.</h2></div><div className="faq-list-new">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>

        <footer className="new-footer"><div className="footer-lead"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Sparkle size={16} weight="fill" /></span><span>KFSD <b>Soft Skills Training</b></span></a><h2>Ready to set yourself apart?</h2><a href="#register">Register Free <ArrowRight size={20} weight="bold" /></a></div><div className="footer-bottom"><p>Organised by {siteConfig.organiser}</p><p>{siteConfig.event.dateLabel} · {siteConfig.event.timeLabel}</p><p>Concept imagery shown; verified media coming soon</p><p>© 2026 KFSD</p></div></footer>
      </main>
    </>
  );
}
