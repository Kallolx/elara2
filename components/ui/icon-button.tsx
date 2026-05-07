import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const baseClasses =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-foreground transition-colors hover:border-accent/40";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

type IconButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  label: string;
};

export function IconButton({ label, className, type = "button", children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={[baseClasses, className].filter(Boolean).join(" ")}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButtonLink({ label, className, children, ...props }: IconButtonLinkProps) {
  return (
    <a
      aria-label={label}
      className={[baseClasses, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </a>
  );
}
