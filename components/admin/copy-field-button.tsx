"use client";

import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

type CopyFieldButtonProps = {
  value: string;
  label: string;
};

export function CopyFieldButton({ value, label }: CopyFieldButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 border border-line bg-background px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-text-soft transition-colors hover:border-accent hover:text-foreground"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <FiCheck className="text-[13px] text-accent" /> : <FiCopy className="text-[13px]" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
