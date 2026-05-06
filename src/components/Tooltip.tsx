import { useState, useRef } from "react";

interface TooltipProps {
  children: React.ReactNode;
  content: string | React.ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      ref={ref}
    >
      {children}
      {visible && content && (
        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-80 max-w-xs bg-popover text-popover-foreground border rounded-lg p-3 shadow-xl text-sm leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
}

export function TipBadge({ tip }: { tip: string | React.ReactNode }) {
  return (
    <Tooltip content={tip}>
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border text-xs text-muted-foreground cursor-help select-none ml-1">
        ?
      </span>
    </Tooltip>
  );
}
