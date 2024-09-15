"use client";

import {
  Button,
  Description,
  Field,
  Label,
  Radio,
  RadioGroup,
} from "@headlessui/react";
import Link from "next/link";
import { Plan } from "@/generated/graphql";
import { useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

const plans = [
  {
    title: "Basic",
    price: 0,
    features: [
      "Sync settings and results across devices",
      "Feature 2",
      "Feature 3",
    ],
  },
  {
    title: "Pro",
    price: 10,
    features: ["Feature 1", "Feature 2", "Feature 3"],
  },
];

enum PurchaseLength {
  Monthly = "monthly",
  Annually = "annually",
}

const billingPeriods = [
  { label: "Monthly", value: PurchaseLength.Monthly },
  { label: "Annually", value: PurchaseLength.Annually },
];

export default function PricingPlans({ subscription }: { subscription: Plan }) {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm/6 font-medium">Subscription</p>
          <p className="text-sm/6 text-black/50">
            Your current plan is -{" "}
            <span className="font-bold">{subscription.billing_plan}</span>
          </p>
        </div>
        {subscription.billing_plan === "free" ? <UpgradeSection /> : null}
        {subscription.billing_plan === "premium" ? (
          <ModifyPlanSection subscription={subscription} />
        ) : null}
      </div>
    </div>
  );
}

interface ModifyPlanSectionProps {
  subscription: Plan;
}

function ModifyPlanSection({ subscription }: ModifyPlanSectionProps) {

  const router = useRouter();
  
  const handlePaymentUpdate = async () => {

    const token = await fetchAuthSession().then((session) => session.tokens?.idToken?.toString());
    if (!token) {
      throw new Error("Cannot update payment without a valid token");
    }

    const data = await fetch(`${process.env.NEXT_PUBLIC_REST_URL}/update-payment-redirect`, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    }).then((res) => res.json());


    router.push(data.url);
  }
  
  return (
    <div className="flex flex-col gap-4">
      <Field className="grid grid-cols-5">
        <div className="col-span-4">
        <Label className="text-sm/6 font-medium">Current Plan</Label>
        <Description className="text-sm/6 text-black/50">
          <span>You are currently subscribed to the Pro plan on a{" "}
          {subscription.billing_period} basis.</span>
        </Description>
        </div>
        <div className="col-span-1 place-self-end">
          <Button onClick={handlePaymentUpdate} className="transition duration-200 rounded-md bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-200">
            Change on Stripe
          </Button>
        </div>
      </Field>
      <Field className="grid grid-cols-5">
        <div className="col-span-4">
          <Label className="text-sm/6 font-medium">
            Change to{" "}
            {subscription.billing_period === "month" ? "Yearly" : "Monthly"}{" "}
            billing
          </Label>
          <Description className="text-sm/6 text-black/50">
            Change your subscription plan.
          </Description>
        </div>

      </Field>
      <Field className="grid grid-cols-3">
        <div className="col-span-2">
          <Label className="text-sm/6 font-medium">Auto Renewal</Label>
          <Description className="text-sm/6 text-black/50">
            <span>Auto-renew is {subscription.auto_renew ? "On" : "Off"}. You can stop auto-renewal at any time.</span>
            <span>
               Will renew on{" "}
              {new Date(subscription.next_billing_date!).toLocaleDateString()}
            </span>
          </Description>
        </div>

      </Field>
    </div>
  );
}

function UpgradeSection() {
  const [billingPeriod, setBillingPeriod] = useState(PurchaseLength.Monthly);
  return (
    <Field className="grid grid-cols-6">
      <div className="col-span-5">
        <div>
          <Label className="text-sm/6 font-medium">Upgrade to Premium</Label>
          <Description className="text-sm/6 text-black/50">
            Subscribe for more features and benefits.
          </Description>
          <div className="my-3">
            {billingPeriod === PurchaseLength.Monthly ? (
              <PriceOption price={2} label="per month, billed monthly" />
            ) : null}
            {billingPeriod === PurchaseLength.Annually ? (
              <PriceOption price={20} label="per month, billed annually" />
            ) : null}
          </div>
          <div className="w-48">
            <RadioGroup
              value={billingPeriod}
              onChange={setBillingPeriod}
              className="my-3 grid grid-cols-2 gap-x-1 rounded-md p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200 "
            >
              {billingPeriods.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  className="cursor-pointer rounded-md px-2.5 py-1 text-gray-500 data-[checked]:bg-slate-600 data-[checked]:text-white"
                >
                  {option.label}
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
      <div>
        <Button className="transition duration-200 rounded-md bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-200">
          <Link href={`/checkout?purchasePrice=${billingPeriod}`}>
            Buy Premium
          </Link>
        </Button>
      </div>
    </Field>
  );
}

function PriceOption({ price, label }: { price: number; label: string }) {
  return (
    <div>
      <div>
        <span className="font-bold text-lg text-black/80">${price}</span>{" "}
        <span className="font-bold text-xs text-black/50">USD</span>
      </div>
      <div className="text-sm text-black/50">{label}</div>
    </div>
  );
}
