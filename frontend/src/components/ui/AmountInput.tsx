"use client";

import type { CSSProperties } from "react";

interface AmountInputProps {
  value: string; // raw digits only, e.g. "1500000"
  onChange: (raw: string) => void;
  placeholder?: string;
  style?: CSSProperties;
  id?: string;
}

function formatWithSeparators(raw: string): string {
  if (!raw) return "";
  const n = parseInt(raw, 10);
  if (isNaN(n)) return "";
  return n.toLocaleString("id-ID");
}

export function AmountInput({
  value,
  onChange,
  placeholder = "0",
  style,
  id,
}: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    // strip leading zeros unless the whole value is "0"
    const cleaned = digits.replace(/^0+(\d)/, "$1");
    onChange(cleaned);
  };

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      value={formatWithSeparators(value)}
      onChange={handleChange}
      style={style}
    />
  );
}
