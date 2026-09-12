import type { Metadata, Viewport } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | REP 1",
    default: "REP 1 — Athlete Recruiting & Education Platform",
  },
  description:
    "Next-generation athlete recruiting, Student Academy, and AI mock interview preparation platform.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} dark h-full`}
    >
      <body className="min-h-full bg-[#070707] text-[#F5F5F5] antialiased selection:bg-[#F21717] selection:text-white">
        {children}
      </body>
    </html>
  );
}
