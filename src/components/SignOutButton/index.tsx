"use client";

import { useSupabase } from "@/lib/supabase-provider";
import { Button } from "@/components/ui/Button";

export default function SignOutButton() {
  const { signOut } = useSupabase();

  return (
    <Button variant="secondary" size="md" onClick={signOut} type="button">
      Sign Out
    </Button>
  );
}
