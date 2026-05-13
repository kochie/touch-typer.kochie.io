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
    a: "There's no time-limited trial, but the Free tier is generous — you get PvP, heatmaps, full stats, multi-layout, and Code Mode forever. Premium adds AI Coach, custom drills, AI insights, and streak freezes.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from the billing portal at any time and you keep Premium access until the end of your current billing period. No questions asked.",
  },
  {
    q: "What's the difference between buying on the Mac App Store and subscribing here?",
    a: "Both unlock the same Premium features. Mac App Store purchases are billed through Apple and managed in your Apple ID settings. Subscribing here goes through Stripe and is managed at /account. Pick whichever feels easier.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Through Stripe: Visa, Mastercard, American Express, Apple Pay, Google Pay, and Link. Through the Mac App Store: whatever's on file with your Apple ID.",
  },
  {
    q: "Is Touch Typer open source?",
    a: "Yes. The desktop app is MIT-licensed. The repository is at github.com/kochie/touch-type — contributions welcome.",
  },
  {
    q: "What's your refund policy?",
    a: "If you subscribed within the last 14 days and Premium isn't working for you, email me and I'll refund — no friction. After 14 days, you can still cancel anytime; you just won't be refunded retroactively.",
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

        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <Disclosure key={f.q} as="div" className="py-4">
              {({ open }) => (
                <>
                  <DisclosureButton className="flex w-full items-center justify-between text-left">
                    <span className="font-medium">{f.q}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`text-mute transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-3 text-sm text-ink/70 leading-relaxed">
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
