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
      <body className="bg-transparent text-white antialiased">
        {/* Navbar */}
        <Navbar />

        {/*Main Content */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}