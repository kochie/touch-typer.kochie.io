"use client";

import { RadioGroup, Radio } from "@headlessui/react";
import clsx from "clsx";

interface FrequencyToggleProps {
  value: "monthly" | "yearly";
  onChange: (next: "monthly" | "yearly") => void;
  yearlyDiscount?: string;
}

export function FrequencyToggle({ value, onChange, yearlyDiscount }: FrequencyToggleProps) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="inline-flex rounded-full border border-border bg-bg-elevated p-1"
      aria-label="Billing frequency"
    >
      <Radio
        value="monthly"
        className={({ checked }) =>
          clsx(
            "rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors",
            checked ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg",
          )
        }
      >
        Monthly
      </Radio>
      <Radio
        value="yearly"
        className={({ checked }) =>
          clsx(
            "rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-colors",
            checked ? "bg-bg text-fg shadow-sm" : "text-fg-muted hover:text-fg",
          )
        }
      >
        Yearly{yearlyDiscount && <span className="ml-1 text-accent">· {yearlyDiscount}</span>}
      </Radio>
    </RadioGroup>
  );
}
