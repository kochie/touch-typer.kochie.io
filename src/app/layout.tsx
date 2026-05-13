import { ReactNode } from "react";
import type { Metadata } from "next";

import "@/styles/main.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

import { Inter, JetBrains_Mono } from "next/font/google";
import Fathom from "./Fathom";
import Providers from "./Providers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://touch-typer.kochie.io",
  ),
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head></head>
      <body className="min-h-screen grid grid-rows-[auto_1fr_auto] font-sans antialiased text-fg bg-bg">
        <Fathom />
        <Providers>
          <Header />
          <div>{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
