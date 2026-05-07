import type { ReactNode } from "react";

interface MobileCardStackProps<T> {
  data: T[];
  renderCard: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
}

export function MobileCardStack<T>({ data, renderCard, emptyMessage }: MobileCardStackProps<T>) {
  if (data.length === 0) {
    return (
      <div className="md:hidden text-center text-sm text-muted-foreground py-8">
        {emptyMessage || "No items to display."}
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      {data.map((item, idx) => (
        <div key={idx}>{renderCard(item, idx)}</div>
      ))}
    </div>
  );
}

/** Desktop-only table wrapper — hides on mobile */
export function DesktopTable({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`hidden md:block ${className}`}>{children}</div>;
}

/** Mobile-only wrapper */
export function MobileOnly({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`md:hidden ${className}`}>{children}</div>;
}
