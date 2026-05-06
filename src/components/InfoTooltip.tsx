import { useState } from "react";

interface InfoTooltipProps {
  content: string;
}

export function InfoBadge({ content }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/10 text-[10px] text-primary cursor-help select-none font-bold">
        i
      </span>
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-xs bg-popover text-popover-foreground border rounded-lg p-3 shadow-xl text-xs leading-relaxed">
          {content}
        </div>
      )}
    </span>
  );
}

export function HelperText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
      {children}
    </p>
  );
}
