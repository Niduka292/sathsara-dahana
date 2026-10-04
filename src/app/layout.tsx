import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import LoadingScreen from "../components/ui/LoadingScreen";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sathsaradahana.live"),
  title: "Sathsara Dahana",
  description: "Sathsara Dahana 2026 — a celebration of music, dance, and creativity at the Faculty of Applied Sciences, University of Sri Jayewardenepura.",
  applicationName: "Sathsara Dahana",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/branding/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/branding/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: "https://www.sathsaradahana.live/",
    siteName: "Sathsara Dahana",
    title: "Sathsara Dahana 2026",
    description: "A musical journey through time. Celebrating music, dance, and creativity at the University of Sri Jayewardenepura.",
    locale: "en_US",
    images: [{
      url: "/branding/homepage-preview.jpg",
      width: 1192,
      height: 626,
      alt: "Sathsara Dahana homepage with the event logo, title, and a blue vortex background",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sathsara Dahana 2026",
    description: "A musical journey through time. Celebrating music, dance, and creativity at the University of Sri Jayewardenepura.",
    images: [{ url: "/branding/homepage-preview.jpg", alt: "Sathsara Dahana homepage with the event logo, title, and a blue vortex background" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cinzel.variable} suppressHydrationWarning>
      <body className="bg-transparent text-white antialiased" suppressHydrationWarning>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
