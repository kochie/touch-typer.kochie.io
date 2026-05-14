import type { SubscriptionResolved } from "@/lib/subscription-resolved";

export interface PriceLite {
  lookup_key: string;
  unit_amount: number | null;
  currency: string;
  interval: string | null;
  interval_count: number | null;
}

export interface CtaProps {
  label: string;
  href: string;
  variant: "accent" | "primary" | "secondary" | "ghost";
  disabled?: boolean;
}

export function getPremiumCta(
  sub: SubscriptionResolved | null,
  price: PriceLite,
): CtaProps {
  if (!sub || sub.status === "free") {
    return {
      label: "Start 7-day free trial",
      href: `/checkout?price=${price.lookup_key}`,
      variant: "accent",
    };
  }
  if (sub.billing_service === "APPLE") {
    return {
      label: "Manage in App Store",
      href: "/account",
      variant: "secondary",
    };
  }
  switch (sub.status) {
    case "trialing":
    case "active":
      return { label: "You're already Premium", href: "/account", variant: "ghost", disabled: true };
    case "canceled":
      return { label: "Resume subscription", href: "/account#reactivate", variant: "accent" };
    case "past_due":
      return { label: "Update payment", href: "/account#recover", variant: "accent" };
    case "expired":
      return { label: "Resubscribe", href: `/checkout?price=${price.lookup_key}`, variant: "accent" };
    case "pending":
      return { label: "Resume checkout", href: "/checkout", variant: "secondary" };
  }
}

export function formatPrice(price: PriceLite): string {
  if (price.unit_amount == null) return "—";
  const amount = (price.unit_amount / 100).toFixed(2);
  const interval = price.interval === "year" ? "yr" : "mo";
  return `$${amount}/${interval}`;
}
