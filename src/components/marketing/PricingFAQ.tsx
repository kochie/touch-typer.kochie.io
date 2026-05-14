"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/pro-solid-svg-icons";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

const faqs = [
  {
    q: "Is there a free trial of Premium?",
    a: "Yearly plans include a 7-day free trial — you get full Premium for a week and won't be charged if you cancel before the trial ends. Monthly plans don't include a trial. The Free tier is also generous on its own: PvP, heatmaps, full stats, multi-layout, and Code Mode forever.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from the billing portal at any time and you keep Premium access until the end of your current billing period. No questions asked.",
  },
  {
    q: "What's the difference between buying on the Mac App Store and subscribing here?",
    a: "Both unlock the same Premium features. Apple's App Store rules require purchases inside the Mac App Store build to go through Apple's payment system — so MAS subscriptions are billed by Apple and managed in your Apple ID. Subscribing here on the web instead goes through Stripe, which lets us offer the 7-day yearly trial and is managed from /account.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Through Stripe: Visa, Mastercard, American Express, Apple Pay, Google Pay, and Link. Through the Mac App Store: whatever's on file with your Apple ID.",
  },
  {
    q: "Is Touch Typer open source?",
    a: (
      <>
        Yes. The desktop app is MIT-licensed. The repository is at{" "}
        <a
          href="https://github.com/kochie/touch-type"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-fg"
        >
          github.com/kochie/touch-type
        </a>
        {" "}— contributions welcome.
      </>
    ),
  },
  {
    q: "What's your refund policy?",
    a: "Refunds within 7 days of purchase: for Stripe subscriptions, request via the Stripe customer portal from your account page; for Mac App Store purchases, request via Apple at reportaproblem.apple.com. After 7 days you can still cancel anytime to stop future charges, but past charges aren't refunded retroactively.",
  },
];

export function PricingFAQ() {
  return (
    <Section tone="paper" density="default">
      <Container width="narrow">
        <div className="text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-3 text-3xl font-semibold">Common questions.</h2>
        </div>

        <div className="mt-10 divide-y divide-border border-y border-border">
          {faqs.map((f) => (
            <Disclosure key={f.q} as="div" className="py-4">
              {({ open }) => (
                <>
                  <DisclosureButton className="flex w-full items-center justify-between text-left">
                    <span className="font-medium">{f.q}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-fg-muted transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-3 text-sm text-fg/70 leading-relaxed">
                    {f.a}
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
