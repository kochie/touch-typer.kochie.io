import { StripeCheckout } from "@/components/Payment";
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { cookies } from "next/headers";

export default async function PaymentsPage() {
  const token = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) =>
      fetchAuthSession(contextSpec).then(
        (session) => session.tokens?.idToken?.toString() ?? ""
      ),
  });

  const response = await fetch(
    "https://rzm8iuf9z5.execute-api.ap-southeast-2.amazonaws.com/create-checkout-session",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    }
  ).then((res) => res.json());

  return <StripeCheckout options={{ clientSecret: response.clientSecret }} />;
}
