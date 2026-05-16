// src/lib/subscription-resolved.ts
// Types matching the subscriptions_resolved view added in the backend.

export type SubscriptionStatus =
  | "free"
  | "pending"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type BillingService = "STRIPE" | "APPLE" | null;

export interface SubscriptionResolved {
  user_id: string;
  billing_plan: "free" | "premium";
  billing_period: string | null;
  status: SubscriptionStatus;
  billing_service: BillingService;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  next_billing_date: string | null; // ISO date
  auto_renew: boolean;
  payment_status: string | null;
  session_id: string | null;
  updated_at: string;

  // Derived from the view:
  is_premium: boolean;
  is_in_trial: boolean;
  is_past_due: boolean;
  is_canceled: boolean;
  effective_end_date: string | null;
  display_billing_period: "monthly" | "yearly" | null;
}
