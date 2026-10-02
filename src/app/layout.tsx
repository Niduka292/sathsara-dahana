import type { Metadata } from "next";
import { Cinzel } from "next/font/google";
import "./globals.css";
import StarCursor from "../components/ui/StarCursor";
import LoadingScreen from "../components/ui/LoadingScreen";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const metadata: Metadata = {
  title: "Sathsara Dahana",
  description: "A time-travel themed musical experience",
  icons: {
    icon: "/favicon.ico",
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
        <StarCursor />
        {children}
      </body>
    </html>
  );
}
