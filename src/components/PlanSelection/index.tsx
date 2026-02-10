"use client";

import {
  Description,
  Field,
  Label,
  Radio,
  RadioGroup,
} from "@headlessui/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "../Notification";

interface Plan {
  billing_plan?: string | null;
  billing_period?: string | null;
  next_billing_date?: string | null;
  auto_renew?: boolean | null;
  status?: string | null;
}

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
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [switchingInterval, setSwitchingInterval] = useState<string | null>(null);

  const isYearly = Boolean(
    subscription.billing_period &&
    (subscription.billing_period === "premium_yearly" ||
      subscription.billing_period === "yearly" ||
      String(subscription.billing_period).toLowerCase().includes("year"))
  );

  const handleSwitchInterval = async (interval: "monthly" | "yearly") => {
    try {
      setSwitchingInterval(interval);
      const { data, error } = await supabase.functions.invoke("update-subscription-interval", {
        body: { interval },
      });
      if (error) throw error;
      toast(Notification, {
        type: "success",
        data: {
          title: "Billing updated",
          message: `You are now on ${interval} billing.`,
          type: "success",
        },
      });
      router.refresh();
    } catch (err) {
      console.error("Switch interval error:", err);
      toast(Notification, {
        type: "error",
        data: {
          title: "Error",
          message: err instanceof Error ? err.message : "Could not change billing interval",
          type: "error",
        },
      });
    } finally {
      setSwitchingInterval(null);
    }
  };

  const handlePaymentUpdate = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Cannot update payment without a valid session");
      }

      const { data, error } = await supabase.functions.invoke("billing-portal");
      if (error) {
        const message = error.message ?? (typeof error === "string" ? error : "Something went wrong");
        if (message.includes("No Stripe subscription found")) {
          toast(Notification, {
            type: "info",
            data: {
              title: "No billing account in this environment",
              message: "Your subscription was set up in a different Stripe environment. Use the upgrade section below to subscribe here, or switch back to the previous environment to manage billing.",
              type: "info",
            },
          });
          return;
        }
        throw error;
      }

      if (data?.url) {
        router.push(data.url);
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      toast(Notification, {
        type: "error",
        data: {
          title: "Error",
          message: error instanceof Error ? error.message : "Could not open billing portal",
          type: "error",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
          <button
            type="button"
            onClick={handlePaymentUpdate}
            disabled={isLoading}
            className="transition duration-200 rounded-md bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-200 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Change on Stripe"}
          </button>
        </div>
      </Field>
      <Field className="grid grid-cols-5">
        <div className="col-span-4">
          <Label className="text-sm/6 font-medium">
            Change to{" "}
            {isYearly ? "Monthly" : "Yearly"}{" "}
            billing
          </Label>
          <Description className="text-sm/6 text-black/50">
            {isYearly
              ? "Switch to monthly billing. Your next invoice will be prorated."
              : "Switch to yearly billing and save. Your next invoice will be prorated."}
          </Description>
        </div>
        <div className="col-span-1 place-self-end">
          <button
            type="button"
            onClick={() => handleSwitchInterval(isYearly ? "monthly" : "yearly")}
            disabled={!!switchingInterval}
            className="transition duration-200 rounded-md bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-200 disabled:opacity-50"
          >
            {switchingInterval
              ? "Updating..."
              : isYearly
                ? "Switch to monthly"
                : "Switch to yearly"}
          </button>
        </div>
      </Field>
      <Field className="grid grid-cols-3">
        <div className="col-span-2">
          <Label className="text-sm/6 font-medium">Auto Renewal</Label>
          <Description className="text-sm/6 text-black/50">
            <span>Auto-renew is {subscription.auto_renew ? "On" : "Off"}. You can stop auto-renewal at any time.</span>
            {subscription.next_billing_date && (
              <span>
                {" "}Will renew on{" "}
                {new Date(subscription.next_billing_date).toLocaleDateString()}
              </span>
            )}
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
        <Link
          href={`/checkout?purchasePrice=${billingPeriod}`}
          className="inline-block transition duration-200 rounded-md bg-slate-100 px-3.5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-200"
        >
          Buy Premium
        </Link>
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
