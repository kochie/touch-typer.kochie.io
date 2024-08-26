import { StripeCheckout } from "@/components/Payment";
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";

const priceMap: { [key: string]: string } = {
  monthly: process.env.MONTHLY_PRICE_ID!,
  annually: process.env.YEARLY_PRICE_ID!,
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  console.log(searchParams);
  if (typeof searchParams.purchasePrice !== "string") {
    return <div>Invalid purchase price {searchParams.purchasePrice}</div>;
  }
  const priceId = priceMap[searchParams.purchasePrice];

  const token = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) =>
      fetchAuthSession(contextSpec).then(
        (session) => session.tokens?.idToken?.toString() ?? ""
      ),
  });

  // console.log(
  //   "LOOKUP",
  //   JSON.stringify({
  //     lookup_key: priceId,
  //   })
  // );

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_REST_URL}/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        lookup_key: priceId,
      }),
    }
  ).then((res) => res.json());

  console.log("RESPONSE", response);

  return (
    <div className="">
      <StripeCheckout options={{ clientSecret: response.clientSecret }} />
    </div>
  );
}
