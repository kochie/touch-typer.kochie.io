"use client"
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  "pk_test_51LYouDIsLeqpVAzJK9MonFdeWzOoVDmYW3FfDcJRbGHt9Nx2Km5FCvC7kPtHedlLTfsgvmmYlxpcsn54Gkfx5ZHT00P73XEu2v"
);

export async function StripeCheckout({options}) {
  // Create a Checkout Session

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
