"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutElementsProvider } from "@stripe/react-stripe-js/checkout";
import { useTheme } from "next-themes";
import { PaymentForm } from "./PaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutClientProps {
  clientSecret: string;
}

export default function CheckoutClient({ clientSecret }: CheckoutClientProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const appearance = {
    theme: (mounted && resolvedTheme === "dark" ? "night" : "stripe") as "stripe" | "night",
  };

  return (
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{
        clientSecret,
        elementsOptions: { appearance },
      }}
    >
      <PaymentForm />
    </CheckoutElementsProvider>
  );
}
