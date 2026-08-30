import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * clsx for conditionals, tailwind-merge to resolve conflicts.
 *
 * The merge half matters once components take a `className` override: without
 * it, `<Button className="bg-danger">` renders with both the variant's
 * `bg-primary` and the override, and which one wins depends on stylesheet
 * order rather than on intent.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
