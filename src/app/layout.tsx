import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pronostics Football 2026",
  description: "Application experte de pronostics sportifs pour les 5 grands championnats européens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
          {children}
        </main>
        <footer className="border-t border-white/5 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-gray-600">
            <p>Pronostics générés par IA • Données basées sur analyses statistiques • Jouez responsablement</p>
            <p className="mt-1">⚠️ Les paris sportifs comportent des risques. Ne pariez jamais plus que ce que vous pouvez perdre.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
