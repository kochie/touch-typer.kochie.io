"use client";

import { ThemeProvider } from "next-themes";
import { SupabaseProvider } from "@/lib/supabase-provider";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: React.PropsWithChildren<{}>) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SupabaseProvider>
        <ToastContainer />
        {children}
      </SupabaseProvider>
    </ThemeProvider>
  );
}
