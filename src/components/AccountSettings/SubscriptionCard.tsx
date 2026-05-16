import type { SubscriptionResolved } from "@/lib/subscription-resolved";
import { FreeCard } from "./subscription-states/FreeCard";
import { PendingCard } from "./subscription-states/PendingCard";
import { TrialingCard } from "./subscription-states/TrialingCard";
import { ActiveCard } from "./subscription-states/ActiveCard";
import { CanceledCard } from "./subscription-states/CanceledCard";
import { PastDueCard } from "./subscription-states/PastDueCard";
import { ExpiredCard } from "./subscription-states/ExpiredCard";
import { MasManagedCard } from "./subscription-states/MasManagedCard";

interface SubscriptionCardProps {
  subscription: SubscriptionResolved | null;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  if (subscription?.billing_service === "APPLE") {
    return <MasManagedCard subscription={subscription} />;
  }

  const status = subscription?.status ?? "free";
  switch (status) {
    case "free":     return <FreeCard />;
    case "pending":  return <PendingCard />;
    case "trialing": return <TrialingCard subscription={subscription!} />;
    case "active":   return <ActiveCard subscription={subscription!} />;
    case "canceled": return <CanceledCard subscription={subscription!} />;
    case "past_due": return <PastDueCard subscription={subscription!} />;
    case "expired":  return <ExpiredCard />;
  }
}
