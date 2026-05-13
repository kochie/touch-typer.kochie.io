import { StripeCheckout } from "@/components/Payment";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

const lookupKeyMap: { [key: string]: string } = {
  monthly: "premium_monthly",
  annually: "premium_yearly",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = await searchParams;

  if (typeof params.purchasePrice !== "string") {
    return (
      <main>
        <Section tone="paper" density="compact">
          <Container width="narrow">
            <p className="text-fg/70">Invalid purchase price {params.purchasePrice}</p>
          </Container>
        </Section>
      </main>
    );
  }

  const lookupKey = lookupKeyMap[params.purchasePrice];
  if (!lookupKey) {
    return (
      <main>
        <Section tone="paper" density="compact">
          <Container width="narrow">
            <p className="text-fg/70">Invalid purchase option</p>
          </Container>
        </Section>
      </main>
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin");
  }

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { lookup_key: lookupKey },
  });

  if (error) {
    return (
      <main>
        <Section tone="paper" density="compact">
          <Container width="narrow">
            <p className="text-fg/70">Error: {error.message}</p>
          </Container>
        </Section>
      </main>
    );
  }

  return (
    <main>
      <Section tone="paper" density="compact">
        <Container width="narrow">
          <Eyebrow>Checkout</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold text-fg">Complete your purchase</h1>
          <div className="mt-8">
            <StripeCheckout options={{ clientSecret: data.clientSecret }} />
          </div>
        </Container>
      </Section>
    </main>
  );
}
