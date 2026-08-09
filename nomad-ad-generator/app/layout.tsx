import type { Metadata } from "next";
import { Big_Shoulders, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bigShoulders = Big_Shoulders({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-big-shoulders",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nomad Consulting — Meta Ad Copy Generator",
  description:
    "AI-powered Meta ad copy that converts. Generate scroll-stopping Facebook & Instagram ads for every funnel stage in seconds.",
  openGraph: {
    title: "Nomad Consulting — Meta Ad Copy Generator",
    description: "AI-powered Meta ad copy that converts.",
    siteName: "Nomad Consulting",
  },
  twitter: {
    card: "summary",
    title: "Nomad Consulting — Meta Ad Copy Generator",
    description: "AI-powered Meta ad copy that converts.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${bigShoulders.variable} ${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
