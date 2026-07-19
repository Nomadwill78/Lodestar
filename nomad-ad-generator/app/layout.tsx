import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
