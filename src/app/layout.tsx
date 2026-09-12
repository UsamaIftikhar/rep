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
  metadataBase: new URL("https://www.rep1exposure.com"),
  title: {
    template: "%s | REP 1",
    default: "REP 1 — Athlete Recruiting & Education Platform",
  },
  description:
    "REP 1 connects student-athletes with college recruiters through combine-testing data, verified performance metrics, and Student Academy training progress.",
  keywords: [
    "REP 1",
    "Athlete Recruiting",
    "College Recruiting",
    "Sports Combine",
    "Elite Pacific Sports",
    "Student Academy",
    "Mock AI Interview",
  ],
  openGraph: {
    title: "REP 1 — Athlete Recruiting & Education Platform",
    description:
      "REP 1 connects student-athletes with college recruiters through combine-testing data, verified performance metrics, and Student Academy training progress.",
    url: "https://www.rep1exposure.com",
    siteName: "REP 1",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REP 1 — Athlete Recruiting & Education Platform",
    description:
      "REP 1 connects student-athletes with college recruiters through combine-testing data, verified performance metrics, and Student Academy training progress.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

import { AuthProvider } from "@/lib/auth-context";

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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
