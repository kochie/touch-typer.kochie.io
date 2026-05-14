import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { BuyPlansClient } from "@/components/BuyPlans/BuyPlansClient";
import { PricingMatrix } from "@/components/marketing/PricingMatrix";
import { PricingFAQ } from "@/components/marketing/PricingFAQ";
import { getUserAndSubscription } from "@/lib/get-user-and-subscription";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PriceLite } from "@/components/BuyPlans/cta";

export const metadata: Metadata = {
  title: "Pricing — Touch Typer",
  description:
    "Free 7-day trial. Premium starts at $2.99/month. Cancel anytime.",
  alternates: { canonical: "https://touch-typer.kochie.io/buy/plans" },
};

interface PageProps {
  searchParams: Promise<{ cancelled?: string }>;
}

export default async function BuyPlansPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const cancelled = sp.cancelled === "true";

  const { subscription } = await getUserAndSubscription();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.functions.invoke("list-prices", {
    body: { lookup_keys: ["premium_monthly", "premium_yearly"] },
  });

  const prices: PriceLite[] = error
    ? []
    : ((data?.prices as PriceLite[]) ?? []);

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="default">
          <div className="text-center max-w-2xl mx-auto">
            <Eyebrow>Pricing</Eyebrow>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
              Free to download. Affordable to upgrade.
            </h1>
            <p className="mt-6 text-lg text-fg/70">
              Pick a plan when you&apos;re ready. No trial games, no manipulative pricing.
            </p>
          </div>

          <div className="mt-12">
            <BuyPlansClient
              prices={prices}
              subscription={subscription}
              cancelled={cancelled}
            />
          </div>
        </Container>
      </Section>

      <PricingMatrix />
      <PricingFAQ />
    </main>
  );
}
