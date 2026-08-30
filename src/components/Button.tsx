import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Variants are declared once with cva and shared by both the <button> and the
// <Link> flavour, so a "primary" action looks identical whether it submits a
// form or navigates.
const buttonVariants = cva(
  cn(
    "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg border font-medium transition-colors outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border-input bg-card text-foreground hover:bg-card-muted",
        ghost: "border-transparent bg-transparent text-secondary-foreground hover:bg-card-muted hover:text-foreground",
        danger: "border-transparent bg-danger text-white hover:brightness-95",
        // For destructive actions that are not the primary path — reads as a
        // warning without shouting like a solid red button.
        "danger-soft": "border-transparent bg-danger-soft text-danger hover:brightness-95",
        link: "border-transparent bg-transparent text-primary-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm [&_svg]:size-3.5",
        md: "h-9 px-4 text-base [&_svg]:size-4",
        lg: "h-10 px-5 text-base [&_svg]:size-4",
        icon: "size-9 [&_svg]:size-4",
        "icon-sm": "size-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export default function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: ComponentProps<"button"> & Variants & { children: ReactNode }) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...rest
}: ComponentProps<typeof Link> & Variants & { children: ReactNode }) {
  return (
    <Link className={cn(buttonVariants({ variant, size }), className)} {...rest}>
      {children}
    </Link>
  );
}

export { buttonVariants };
