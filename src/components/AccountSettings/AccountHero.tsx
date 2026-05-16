import clsx from "clsx";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { SubscriptionResolved } from "@/lib/subscription-resolved";

interface AccountHeroProps {
  user: { id: string; email: string };
  subscription: SubscriptionResolved | null;
}

function initialsFrom(name: string | null | undefined, fallback: string): string {
  const source = (name ?? "").trim() || fallback;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function planLabel(sub: SubscriptionResolved | null): { label: string; tone: "free" | "trial" | "premium" | "warn" } {
  if (!sub || sub.billing_plan === "free") return { label: "Free plan", tone: "free" };
  if (sub.status === "trialing") return { label: "Premium • Trial", tone: "trial" };
  if (sub.status === "past_due") return { label: "Premium • Past due", tone: "warn" };
  if (sub.status === "canceled") return { label: "Premium • Canceling", tone: "warn" };
  return { label: "Premium", tone: "premium" };
}

export async function AccountHero({ user, subscription }: AccountHeroProps) {
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, preferred_username")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.name?.trim() ||
    profile?.preferred_username?.trim() ||
    user.email.split("@")[0];
  const initials = initialsFrom(profile?.name ?? profile?.preferred_username, user.email);
  const plan = planLabel(subscription);

  const toneClasses: Record<typeof plan.tone, string> = {
    free: "bg-bg-elevated text-fg/70 border border-border",
    trial: "bg-accent/10 text-accent border border-accent/20",
    premium: "bg-accent text-paper border border-accent",
    warn: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30",
  };

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div
        aria-hidden
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-deep text-xl font-semibold text-paper shadow-sm"
      >
        {initials}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{displayName}</h1>
        <p className="truncate text-sm text-fg/60">{user.email}</p>
      </div>
      <div className="sm:self-center">
        <span
          className={clsx(
            "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
            toneClasses[plan.tone]
          )}
        >
          {plan.label}
        </span>
      </div>
    </div>
  );
}
