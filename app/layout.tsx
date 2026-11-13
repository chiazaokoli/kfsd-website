import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "./globals.css";

const sfUiDisplay = localFont({
  src: [
    { path: "./fonts/sf-ui-display-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/sf-ui-display-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/sf-ui-display-bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sf-ui-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KFSD Soft Skills Training | Live Online, 25–26 November 2026",
  description:
    "A free two-day virtual soft skills training for students. Build leadership, communication, critical thinking, resilience and integrity.",
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/kfsd-icon.png` },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sfUiDisplay.variable}>
      <body>
        {children}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);
          t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
          }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1696383641865786');
          fbq('track','PageView');
        `}</Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element -- Meta requires a raw image for its no-JS fallback. */}
          <img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=1696383641865786&ev=PageView&noscript=1" alt="" />
        </noscript>
      </body>
    </html>
  );
}
