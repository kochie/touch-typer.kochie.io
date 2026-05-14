// src/lib/get-user-and-subscription.ts
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export interface UserAndSubscription {
  user: { id: string; email: string } | null;
  subscription: SubscriptionResolved | null;
}

/**
 * Request-scoped fetch of the current user + their subscription_resolved row.
 * Deduped across server components via React's `cache()`.
 * Header, PastDueBanner, and pages can all call this without triggering
 * multiple Supabase round trips.
 */
export const getUserAndSubscription = cache(async (): Promise<UserAndSubscription> => {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, subscription: null };
  }

  const { data: subscription } = await (
    supabase
      .from("subscriptions_resolved" as unknown as never)
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle() as unknown as Promise<{ data: SubscriptionResolved | null; error: any }>
  );

  return {
    user: { id: user.id, email: user.email ?? "" },
    subscription: subscription as SubscriptionResolved | null,
  };
});
