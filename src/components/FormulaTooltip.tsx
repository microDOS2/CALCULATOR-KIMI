import { useState } from "react";

interface FormulaTooltipProps {
  children: React.ReactNode;
  formula: string | React.ReactNode;
  label?: string;
}

export function FormulaTooltip({ children, formula, label }: FormulaTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && formula && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-w-xs bg-popover text-popover-foreground border rounded-lg p-3 shadow-xl text-sm leading-relaxed">
          {label && <div className="font-semibold text-xs mb-1 text-muted-foreground">{label}</div>}
          <div className="text-xs">{formula}</div>
        </div>
      )}
    </div>
  );
}

export function FormulaBadge({ formula, label }: { formula: string | React.ReactNode; label?: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-[10px] text-muted-foreground cursor-help select-none">
        ƒ
      </span>
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-w-xs bg-popover text-popover-foreground border rounded-lg p-3 shadow-xl text-sm leading-relaxed">
          {label && <div className="font-semibold text-xs mb-1 text-muted-foreground">{label}</div>}
          <div className="text-xs">{formula}</div>
        </div>
      )}
    </span>
  );
}
