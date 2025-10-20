import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

import SiteNav from "@/components/SiteNav";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Curio VFX",
  description: "Funky neon VFX playground powered by Google Gemini",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950">
      <body className={`${spaceGrotesk.className} min-h-screen antialiased text-white`}>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
