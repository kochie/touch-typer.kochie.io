import { ReactNode } from "react";

import "@/styles/main.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import Fathom from "./Fathom";
import Providers from "./Providers";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <Fathom />
        <Header />
        <div>
          <Providers>{children}</Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}
