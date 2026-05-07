import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

const baseClasses =
  "inline-flex items-center justify-center gap-2 border text-xs font-medium uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-none";

const sizeClasses: Record<"sm" | "md", string> = {
  sm: "px-3 py-2",
  md: "px-5 py-3",
};

const variantClasses: Record<"primary" | "outline" | "ghost", string> = {
  primary: "border-accent bg-accent !text-white hover:bg-accent-deep hover:!text-white",
  outline: "border-line bg-surface text-foreground hover:border-accent/40",
  ghost: "border-transparent bg-transparent text-foreground hover:border-line",
};

type ButtonVariant = keyof typeof variantClasses;

type ButtonSize = keyof typeof sizeClasses;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const buildClassName = (variant: ButtonVariant, size: ButtonSize, className?: string) =>
  [baseClasses, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(" ");

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return <button className={buildClassName(variant, size, className)} type={type} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return <a className={buildClassName(variant, size, className)} {...props} />;
}
