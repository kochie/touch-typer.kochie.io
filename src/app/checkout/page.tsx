import { StripeCheckout } from "@/components/Payment";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

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
    return <div>Invalid purchase price {params.purchasePrice}</div>;
  }
  
  const lookupKey = lookupKeyMap[params.purchasePrice];
  if (!lookupKey) {
    return <div>Invalid purchase option</div>;
  }

  const supabase = await createServerSupabaseClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/signin");
  }

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { lookup_key: lookupKey },
  });

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="">
      <StripeCheckout options={{ clientSecret: data.clientSecret }} />
    </div>
  );
}
