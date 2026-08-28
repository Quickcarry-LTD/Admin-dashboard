// ===============================================
// File: formatCurrency.ts
//
// Purpose:
// Formats a raw number into a Naira currency string, matching the
// Customer/Rider apps' formatting so figures look consistent
// across every QuickCarry surface.
// ===============================================

export function formatCurrency(amount: number): string {
  const hasDecimals = amount % 1 !== 0;
  const formatted = amount.toLocaleString("en-NG", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `₦${formatted}`;
}
