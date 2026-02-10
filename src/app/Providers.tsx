"use client";

import { SupabaseProvider } from "@/lib/supabase-provider";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: React.PropsWithChildren<{}>) {
  return (
    <SupabaseProvider>
      <ToastContainer />
      {children}
    </SupabaseProvider>
  );
}
