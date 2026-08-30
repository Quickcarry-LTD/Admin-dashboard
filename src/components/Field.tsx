import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Every field in the app shares this control shape, so the ring, the disabled
// treatment and the dark-mode surface are defined exactly once.
const control = cn(
  "mt-1.5 w-full rounded-lg border border-input bg-card px-3 text-base text-foreground",
  "placeholder:text-muted-foreground",
  "transition-[box-shadow,border-color] focus:border-primary focus:ring-3 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-baseline justify-between gap-3 text-base font-medium text-foreground"
    >
      <span>{children}</span>
      {hint && <span className="text-sm font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

function Wrapper({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  );
}

export function Input({
  id,
  label,
  hint,
  error,
  className,
  ...rest
}: ComponentProps<"input"> & { id: string; label: string; hint?: string; error?: string }) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <input id={id} className={cn(control, "h-9", className)} {...rest} />
    </Wrapper>
  );
}

export function Textarea({
  id,
  label,
  hint,
  error,
  className,
  ...rest
}: ComponentProps<"textarea"> & { id: string; label: string; hint?: string; error?: string }) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <textarea id={id} className={cn(control, "resize-none py-2", className)} {...rest} />
    </Wrapper>
  );
}

export function Select({
  id,
  label,
  hint,
  error,
  className,
  children,
  ...rest
}: ComponentProps<"select"> & { id: string; label: string; hint?: string; error?: string }) {
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <select id={id} className={cn(control, "h-9 cursor-pointer", className)} {...rest}>
        {children}
      </select>
    </Wrapper>
  );
}
