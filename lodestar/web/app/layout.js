import "./globals.css";
import { palette } from "../theme";

export const metadata = {
  title: "Lodestar — Manifesting for people who actually do the work",
  description:
    "Lodestar is an AI guide that turns your goals into daily focus, rewires limiting beliefs, and maps the path. Grounded in cognitive science, not mysticism.",
  metadataBase: new URL("https://lodestar.app"),
  openGraph: {
    title: "Lodestar — Manifesting for people who actually do the work",
    description:
      "An AI guide that turns goals into daily focus, rewires limiting beliefs, and maps the path. Grounded in cognitive science.",
    type: "website",
    images: ["/vega/splash.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodestar",
    description: "Manifesting for people who actually do the work.",
    images: ["/vega/splash.png"],
  },
};

export const viewport = {
  themeColor: palette.night,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
