"use client"

import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeCheckout({options}: {options: {clientSecret: string}}) {
  return (
    <div id="checkout" className="my-16">
      {/* NOTE: Stripe Embedded Checkout’s appearance (including dark/light theme) must be
          configured server-side during Stripe Session creation, not client-side. See
          docs/superpowers/notes/project-b-billing-bugs.md for the Project B follow-up. */}
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
