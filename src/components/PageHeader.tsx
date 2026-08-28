// ===============================================
// File: PageHeader.tsx
//
// Purpose:
// Consistent page title + subtitle + optional action button,
// reused at the top of every admin page (Orders, Riders,
// Customers, etc.) so headers look uniform across the app.
// ===============================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
