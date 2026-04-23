import { Cinzel } from "next/font/google";
import "../globals.css";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
});

export const metadata = {
  title: "Sisi Arundathee",
  description: "A time-travel themed musical experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cinzel.variable}>
      <body className="bg-[#000511] text-white antialiased">
        {/* Background glow layer */}
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#0ff3,_transparent_70%)]" />

        {/* Navbar */}
        <Navbar />

        {/*Main Content */}
        <main className="min-h-screen px-6 md:px-12 lg:px-20">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}