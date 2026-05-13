"use client"

import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const tiers = [
  {
    name: "Basic",
    id: "tier-basic",
    href: "#",
    price: { monthly: "Free" },
    description: "Core functionality for all users",
    features: [
      "Sync of settings and results across devices",
      "Access to global leaderboards",
    ],
  },
  {
    name: "Professional",
    id: "tier-pro",
    href: "/checkout?purchasePrice=monthly",
    price: { monthly: "$2", annually: "$20" },
    description: "Everything in Basic, plus essential insights for powerusers.",
    features: [
      "AI Tutor",
      "More metrics and insights",
      "Monthly/weekly reports",
      "MacOS widgets",
    ],
  },
];

const frequencies = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/year' },
]

export default function BuyPlansStage() {

  const [frequency, setFrequency] = useState(frequencies[0])
  return (
    <main>
      <Section tone="paper-soft" density="default">
        <Container width="default">
          <div className="mx-auto max-w-4xl text-center">
            <Eyebrow tone="accent">Pricing</Eyebrow>
            <p className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Choose your plan
            </p>
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink/70 text-center">
            Distinctio et nulla eum soluta et neque labore quibusdam. Saepe et
            quasi iusto modi velit ut non voluptas in. Explicabo id ut laborum.
          </p>
          <div className="mt-16 flex justify-center">
            <fieldset aria-label="Payment frequency">
              <RadioGroup
                value={frequency}
                onChange={setFrequency}
                className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-line"
              >
                {frequencies.map((option) => (
                  <Radio
                    key={option.value}
                    value={option}
                    className="cursor-pointer rounded-full px-2.5 py-1 text-ink/60 data-[checked]:bg-accent data-[checked]:text-paper"
                  >
                    {option.label}
                  </Radio>
                ))}
              </RadioGroup>
            </fieldset>
          </div>
          <div className="mt-20 flow-root max-w-4xl mx-auto">
            <div className="isolate -mt-16 grid max-w-sm grid-cols-1 gap-y-16 divide-y divide-line sm:mx-auto lg:-mx-8 lg:mt-0 lg:max-w-none lg:grid-cols-2 lg:divide-x lg:divide-y-0 xl:-mx-4">
              {tiers.map((tier) => (
                <div key={tier.id} className="pt-16 lg:px-8 lg:pt-0 xl:px-14">
                  <h3
                    id={tier.id}
                    className="text-base font-semibold leading-7 text-ink"
                  >
                    {tier.name}
                  </h3>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-5xl font-bold tracking-tight text-ink">
                      {tier.price.monthly}
                    </span>
                    {tier.price.monthly === "Free" ? null : (
                      <span className="text-sm font-semibold leading-6 text-ink/60">
                        /month
                      </span>
                    )}
                  </p>
                  {tier.price.monthly === "Free" ? (
                    <p className="mt-3 text-sm leading-6 text-ink/60">No cost, free forever.</p>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-ink/60">
                      {tier.price.annually} per month if paid annually
                    </p>
                  )}
                  <Button
                    href={tier.href}
                    variant="accent"
                    size="md"
                    aria-describedby={tier.id}
                    className="mt-10 w-full justify-center"
                  >
                    Buy plan
                  </Button>
                  <p className="mt-10 text-sm font-semibold leading-6 text-ink">
                    {tier.description}
                  </p>
                  <ul
                    role="list"
                    className="mt-6 space-y-3 text-sm leading-6 text-ink/70"
                  >
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <CheckCircleIcon
                          aria-hidden="true"
                          className="h-6 w-5 flex-none text-accent"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
