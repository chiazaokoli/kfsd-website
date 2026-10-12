"use client";

import { FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplashScreen from "./components/SplashScreen";
import {
  ArrowDown,
  ArrowUpRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  Compass,
  GlobeHemisphereWest,
  MicrophoneStage,
  Play,
  ShieldCheck,
  Student,
  UsersThree,
} from "@phosphor-icons/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const audience = [
  {
    title: "High school",
    number: "01",
    copy: "Build the confidence to speak up, work in groups, and make your ideas easier to understand.",
    image: `${assetPrefix}/visuals/high-school.svg`,
  },
  {
    title: "Pre-college",
    number: "02",
    copy: "Step into applications, interviews, and new environments with more clarity and self-belief.",
    image: `${assetPrefix}/visuals/pre-college.svg`,
  },
  {
    title: "University",
    number: "03",
    copy: "Strengthen the human skills that make projects, internships, leadership, and early careers work.",
    image: `${assetPrefix}/visuals/university.svg`,
  },
];

const journeyCards = [
  {
    icon: MicrophoneStage,
    title: "Make your ideas land",
    copy: "Learn to organise what you mean, speak with intention, and adjust your message for the people in front of you.",
    accent: "lime",
  },
  {
    icon: UsersThree,
    title: "Work well with different people",
    copy: "Practise listening, contributing, handling disagreement, and becoming the kind of teammate others can rely on.",
    accent: "coral",
  },
  {
    icon: Compass,
    title: "Move towards opportunity",
    copy: "Build the confidence to ask better questions, introduce yourself, respond to feedback, and take your next step.",
    accent: "blue",
  },
];

const marqueeWords = [
  "COMMUNICATE",
  "LISTEN",
  "COLLABORATE",
  "ADAPT",
  "PRESENT",
  "LEAD",
];

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);
  const [activeAudience, setActiveAudience] = useState(0);
  const [formStatus, setFormStatus] = useState("");
  const [pageReady, setPageReady] = useState(false);

  useGSAP(
    () => {
      if (!pageReady) return;

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const revealWords = gsap.utils.toArray<HTMLElement>(".reveal-word");
      const stackCards = gsap.utils.toArray<HTMLElement>(".stack-card");

      if (reduceMotion) {
        gsap.set(revealWords, { opacity: 1 });
        gsap.set(stackCards, { opacity: 1, scale: 1, y: 0 });
        return;
      }

      gsap.from(".hero-reveal", {
        y: 38,
        opacity: 0,
        duration: 1.05,
        stagger: 0.12,
        ease: "power3.out",
      });

      gsap.fromTo(
        revealWords,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: ".reveal-copy",
            start: "top 76%",
            end: "bottom 45%",
            scrub: 0.6,
          },
        },
      );

      stackCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { y: 72, opacity: 0.5, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1 - index * 0.012,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              end: "top 28%",
              scrub: 0.7,
            },
          },
        );
      });
    },
    { scope: pageRef, dependencies: [pageReady], revertOnUpdate: true },
  );

  function handleWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormStatus(
      "Your details are ready. The live waitlist connection will be added before launch.",
    );
  }

  return (
    <>
      <SplashScreen onComplete={() => setPageReady(true)} />
      <main ref={pageRef} className="overflow-x-hidden w-full max-w-full">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Future in Practice home">
          <span className="wordmark-dot" aria-hidden="true" />
          Future in Practice
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#outcomes">What you’ll gain</a>
          <a href="#format">How it works</a>
          <a href="#trust">Why trust us</a>
        </nav>
        <a className="nav-cta" href="#waitlist">
          Join the waitlist
          <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-ambient" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow hero-reveal">Live online · Built for students everywhere</p>
          <h1 className="hero-title max-w-6xl hero-reveal">
            The skills that make everything else <span>work.</span>
          </h1>
          <p className="hero-intro hero-reveal">
            Two focused mornings to communicate with clarity, work better with
            people, and step into your future with more confidence.
          </p>
          <div className="hero-actions hero-reveal">
            <a className="button button-primary" href="#waitlist">
              Join the waitlist
              <ArrowUpRight size={19} weight="bold" aria-hidden="true" />
            </a>
            <a className="button button-secondary" href="#format">
              See how it works
              <ArrowDown size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="hero-visual hero-reveal">
          <div className="hero-image-wrap group">
            <Image
              src={`${assetPrefix}/visuals/hero-collaboration.svg`}
              alt=""
              fill
              priority
              unoptimized
              sizes="(max-width: 900px) 88vw, 38vw"
              className="hero-image group-hover:scale-105"
            />
            <div className="image-wash" aria-hidden="true" />
            <span className="play-button" aria-label="Program film coming soon">
              <Play size={20} weight="fill" aria-hidden="true" />
              Film coming soon
            </span>
          </div>
          <div className="date-card">
            <CalendarBlank size={25} weight="duotone" aria-hidden="true" />
            <div>
              <strong>25–26 November 2026</strong>
              <span>10:00–12:00 WAT · each day</span>
            </div>
          </div>
        </div>

        <a className="scroll-cue" href="#outcomes" aria-label="Explore the program">
          <span>Explore</span>
          <ArrowDown size={17} aria-hidden="true" />
        </a>
      </section>

      <section className="marquee" aria-label="Skills covered">
        <div className="marquee-track">
          {[...marqueeWords, ...marqueeWords].map((word, index) => (
            <span key={`${word}-${index}`}>
              {word}
              <span className="marquee-mark" aria-hidden="true" />
            </span>
          ))}
        </div>
      </section>

      <section className="outcomes-section" id="outcomes">
        <div className="section-heading split-heading">
          <p className="eyebrow dark">Real life rarely gives you a script</p>
          <h2>
            Learn how to show up when the answer isn’t in a textbook.
          </h2>
        </div>

        <div className="bento-grid grid-flow-dense">
          <article className="bento-card bento-lead group">
            <div className="bento-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="bento-copy">
              <MicrophoneStage size={32} weight="duotone" aria-hidden="true" />
              <h3>Turn thoughts into words people can follow.</h3>
              <p>
                Whether it’s a class presentation, an interview, or a difficult
                conversation, clarity changes what happens next.
              </p>
            </div>
          </article>

          <article className="bento-card bento-coral group">
            <div className="bento-copy">
              <UsersThree size={29} weight="duotone" aria-hidden="true" />
              <h3>Become better to build with.</h3>
              <p>Listen well, contribute clearly, and navigate difference.</p>
            </div>
          </article>

          <article className="bento-card bento-image group">
            <Image
              src={`${assetPrefix}/visuals/opportunity.svg`}
              alt=""
              fill
              unoptimized
              sizes="(max-width: 800px) 100vw, 42vw"
              className="card-image group-hover:scale-105"
            />
            <div className="bento-image-overlay" />
            <div className="bento-copy">
              <Compass size={29} weight="duotone" aria-hidden="true" />
              <h3>See opportunity—and meet it prepared.</h3>
            </div>
          </article>
        </div>
      </section>

      <section className="reveal-section">
        <p className="reveal-copy">
          {"Your grades can open a door. Your human skills help you walk through it, connect with the room, and make the opportunity count."
            .split(" ")
            .map((word, index) => (
              <span className="reveal-word" key={`${word}-${index}`}>
                {word}{" "}
              </span>
            ))}
        </p>
      </section>

      <section className="audience-section" id="audience">
        <div className="section-heading audience-heading">
          <p className="eyebrow">Made for where you are now</p>
          <h2>
            Your next chapter is different. The need to connect is universal.
          </h2>
        </div>

        <div className="audience-accordion">
          {audience.map((item, index) => {
            const isActive = activeAudience === index;
            return (
              <button
                className={`audience-panel group ${isActive ? "active" : ""}`}
                key={item.title}
                type="button"
                aria-expanded={isActive}
                onClick={() => setActiveAudience(index)}
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  unoptimized
                  sizes="(max-width: 800px) 100vw, 60vw"
                  className="audience-image group-hover:scale-105"
                />
                <span className="audience-shade" aria-hidden="true" />
                <span className="audience-number">{item.number}</span>
                <span className="audience-content">
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="format-section" id="format">
        <div className="format-intro">
          <p className="eyebrow dark">Four hours. Designed to travel with you.</p>
          <h2>
            Two mornings of useful ideas, active practice, and room to think.
          </h2>
          <p>
            This is a live virtual experience for students in Nigeria and around
            the world. Join from a quiet space with a stable connection and come
            ready to participate.
          </p>
        </div>

        <div className="schedule-card">
          <div className="schedule-topline">
            <span>Live online</span>
            <GlobeHemisphereWest size={28} weight="duotone" aria-hidden="true" />
          </div>
          <div className="schedule-row">
            <div>
              <strong>Wednesday</strong>
              <span>25 November 2026</span>
            </div>
            <b>10:00–12:00</b>
          </div>
          <div className="schedule-row">
            <div>
              <strong>Thursday</strong>
              <span>26 November 2026</span>
            </div>
            <b>10:00–12:00</b>
          </div>
          <div className="timezone-note">
            <Clock size={20} weight="duotone" aria-hidden="true" />
            <p>
              Times are in West Africa Time (WAT, UTC+1). That’s 09:00–11:00 UTC
              each day.
            </p>
          </div>
        </div>
      </section>

      <section className="journey-section">
        <div className="journey-heading">
          <p className="eyebrow">What you’ll practise</p>
          <h2>
            Less watching from the sidelines. More skills you can actually use.
          </h2>
        </div>

        <div className="journey-stack">
          {journeyCards.map(({ icon: Icon, title, copy, accent }, index) => (
            <article
              className={`stack-card stack-${accent}`}
              style={{ top: `${110 + index * 22}px` }}
              key={title}
            >
              <span className="stack-index">0{index + 1}</span>
              <div className="stack-icon">
                <Icon size={34} weight="duotone" aria-hidden="true" />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
              <CheckCircle size={30} weight="fill" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="trust-section" id="trust">
        <div className="trust-heading">
          <p className="eyebrow dark">Trust should be earned in public</p>
          <h2>
            Know who is behind the room before you step into it.
          </h2>
          <p>
            Facilitator biographies, relevant affiliations, program footage, and
            participant stories will be added here only after they are verified.
            No borrowed credibility. No made-up proof.
          </p>
        </div>

        <div className="trust-grid">
          <article className="trust-card">
            <span className="trust-icon">
              <Student size={29} weight="duotone" aria-hidden="true" />
            </span>
            <div>
              <h3>Meet the facilitators</h3>
              <p>Names, photographs, experience, and relevant links will appear here.</p>
            </div>
            <span className="verification-state">Awaiting verified details</span>
          </article>
          <article className="trust-card">
            <span className="trust-icon">
              <Play size={27} weight="duotone" aria-hidden="true" />
            </span>
            <div>
              <h3>See the work</h3>
              <p>Real clips and evidence from previous programs will be published when supplied.</p>
            </div>
            <span className="verification-state">Evidence slot reserved</span>
          </article>
          <article className="trust-card">
            <span className="trust-icon">
              <ShieldCheck size={29} weight="duotone" aria-hidden="true" />
            </span>
            <div>
              <h3>Share with confidence</h3>
              <p>Clear logistics and verified organizer details make it easier to involve a parent or educator.</p>
            </div>
            <span className="verification-state">Transparency first</span>
          </article>
        </div>
      </section>

      <section className="faq-section">
        <div className="faq-heading">
          <p className="eyebrow">Before you join</p>
          <h2>Useful answers, upfront.</h2>
        </div>
        <div className="faq-list">
          <details>
            <summary>Who is this training for?</summary>
            <p>
              High school, pre-college, and university students who want to
              communicate, collaborate, and navigate opportunities with more confidence.
            </p>
          </details>
          <details>
            <summary>Can I join from outside Nigeria?</summary>
            <p>
              Yes. The sessions are virtual and open internationally. Use 09:00–11:00
              UTC to convert the schedule to your local time.
            </p>
          </details>
          <details>
            <summary>How much time should I set aside?</summary>
            <p>
              Two hours on Wednesday, 25 November and two hours on Thursday, 26
              November 2026. Plan for four hours in total.
            </p>
          </details>
          <details>
            <summary>Is joining the waitlist the same as registering?</summary>
            <p>
              No. The waitlist lets you hear when registration opens and receive
              confirmed program details before places are released.
            </p>
          </details>
        </div>
      </section>

      <section className="waitlist-section" id="waitlist">
        <div className="waitlist-ambient" aria-hidden="true" />
        <div className="waitlist-copy">
          <p className="eyebrow">Start before the room opens</p>
          <h2>
            Put your future skills into{" "}
            <span
              className="inline-image"
              role="img"
              aria-label="Students learning together"
              style={{
                backgroundImage: `linear-gradient(rgba(17,18,15,.08), rgba(17,18,15,.08)), url("${assetPrefix}/visuals/inline-learning.svg")`,
              }}
            />{" "}
            practice.
          </h2>
          <p>
            Join the waitlist for registration updates, confirmed facilitator
            details, and everything you need to arrive ready.
          </p>
        </div>

        <form className="waitlist-form" onSubmit={handleWaitlist}>
          <div className="field-row">
            <label>
              First name
              <input name="name" type="text" autoComplete="given-name" required placeholder="Your first name" />
            </label>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </label>
          </div>
          <label>
            Where are you in your journey?
            <select name="studentStage" defaultValue="" required>
              <option value="" disabled>Select one</option>
              <option value="high-school">High school</option>
              <option value="pre-college">Pre-college</option>
              <option value="university">University</option>
              <option value="other">Something else</option>
            </select>
          </label>
          <button className="button form-submit" type="submit">
            Join the waitlist
            <ArrowUpRight size={20} weight="bold" aria-hidden="true" />
          </button>
          <p className="form-note">
            By joining, you agree to receive updates about this program. You can unsubscribe at any time.
          </p>
          {formStatus && <p className="form-status" role="status">{formStatus}</p>}
        </form>
      </section>

      <footer>
        <a className="wordmark footer-mark" href="#top">
          <span className="wordmark-dot" aria-hidden="true" />
          Future in Practice
        </a>
        <p>Virtual soft skills training for the next generation.</p>
        <div className="footer-meta">
          <span>25–26 November 2026</span>
          <span>10:00–12:00 WAT</span>
          <a href="#waitlist">Join the waitlist</a>
        </div>
      </footer>
      </main>
    </>
  );
}
