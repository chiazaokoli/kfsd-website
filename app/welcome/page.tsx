import type { Metadata } from "next";
import Image from "next/image";
import { CalendarBlank, CheckCircle, Clock, GlobeHemisphereWest } from "@phosphor-icons/react/dist/ssr";
import WelcomeConfetti from "../../src/components/WelcomeConfetti";

const assetPrefix = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Registration confirmed | KFSD Soft Skills Training",
  description: "Your place at the KFSD Soft Skills Training has been reserved.",
};

export default function WelcomePage() {
  return (
    <main className="welcome-page">
      <WelcomeConfetti />
      <header className="welcome-brand">
        <Image src={`${assetPrefix}/images/kfsd-icon.png`} width={34} height={34} alt="KFSD" priority />
        <span>KFSD Soft Skills Training</span>
      </header>
      <section className="welcome-card" aria-labelledby="welcome-heading">
        <CheckCircle className="welcome-check" size={54} weight="fill" aria-hidden="true" />
        <p className="welcome-kicker">Registration confirmed</p>
        <h1 id="welcome-heading">Your spot is reserved.</h1>
        <div className="welcome-event-details">
          <div><CalendarBlank size={24} aria-hidden="true" /><span><strong>25–26 November 2026</strong><small>Two live sessions</small></span></div>
          <div><Clock size={24} aria-hidden="true" /><span><strong>10:00 AM–12:00 PM WAT</strong><small>Each day</small></span></div>
          <div><GlobeHemisphereWest size={24} aria-hidden="true" /><span><strong>Live on Zoom</strong><small>Joining details will be sent by email</small></span></div>
        </div>
        <p className="welcome-note">We’ll send access instructions to the email address you registered with closer to the training.</p>
        <a className="welcome-home" href={`${assetPrefix}/`}>Return to the event page</a>
      </section>
    </main>
  );
}
