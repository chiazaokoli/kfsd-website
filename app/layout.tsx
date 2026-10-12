import type { Metadata } from "next";
import "@fontsource-variable/outfit";
import "./globals.css";

export const metadata: Metadata = {
  title: "Future in Practice | Virtual Soft Skills Training",
  description:
    "A two-day virtual soft skills experience for high school, pre-college, and university students. November 25–26, 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
