"use client";

import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/finance";

function parseMoneyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) / 100 : 0;
}

export function MoneyInput({
  disabled,
  onValueChange,
  placeholder = "$0.00",
  value,
}: {
  disabled?: boolean;
  onValueChange: (value: number) => void;
  placeholder?: string;
  value?: number;
}) {
  return (
    <Input
      disabled={disabled}
      inputMode="numeric"
      placeholder={placeholder}
      value={value ? formatCurrency(value) : ""}
      onChange={(event) => onValueChange(parseMoneyInput(event.target.value))}
    />
  );
}
