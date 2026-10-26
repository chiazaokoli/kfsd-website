import type { Metadata } from "next";
import localFont from "next/font/local";
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
      <body>{children}</body>
    </html>
  );
}
