import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import CheckoutClient from "@/components/Payment";

export const metadata: Metadata = {
  title: "Checkout — Touch Typer",
  description: "Start your 7-day free trial.",
};

interface PageProps {
  searchParams: Promise<{ price?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const lookupKey = sp.price === "premium_yearly" ? "premium_yearly" : "premium_monthly";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/signin?redirect=/checkout?price=${lookupKey}`);
  }

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { lookup_key: lookupKey },
  });

  if (error || !data?.clientSecret) {
    return (
      <main>
        <Section tone="paper" density="default">
          <Container width="narrow">
            <Eyebrow>Checkout</Eyebrow>
            <h1 className="mt-3 text-3xl font-bold">Couldn&apos;t start checkout</h1>
            <p className="mt-4 text-fg/70">
              We hit an unexpected error setting up your checkout session. Try again in a minute,
              or contact support if it persists.
            </p>
          </Container>
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section tone="paper" density="default">
        <Container width="narrow">
          <Eyebrow>Checkout</Eyebrow>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
            Start your free trial
          </h1>
          <p className="mt-3 text-fg/70">
            Card required. We won&apos;t charge you until your 7-day trial ends, and you can cancel any
            time.
          </p>
          <div className="mt-8">
            <CheckoutClient clientSecret={data.clientSecret} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
