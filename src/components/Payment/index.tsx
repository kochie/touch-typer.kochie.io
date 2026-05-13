"use client"

import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeCheckout({options}: {options: {clientSecret: string}}) {
  const { resolvedTheme } = useTheme();

  const mergedOptions = {
    ...options,
    appearance: {
      theme: (resolvedTheme === "dark" ? "night" : "stripe") as "stripe" | "night",
    },
  };

  return (
    <div id="checkout" className="my-16">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={mergedOptions}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
