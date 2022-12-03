import { ReactNode } from "react";

import "@/styles/main.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen grid grid-rows-[auto_1fr_auto]">
        <div>Header</div>
        <div>{children}</div>
        <div className="bg-[#464953] py-12 text-white">
          <div className="max-w-4xl mx-auto flex">
            <div>Hello</div>
          </div>
        </div>
      </body>
    </html>
  );
}
