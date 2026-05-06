import { useState } from "react";
import { CardTitle } from "@/components/ui/card";

interface InfoTooltipProps {
  text: string;
  label?: string;
}

export function InfoTooltip({ text, label }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold cursor-help select-none dark:bg-blue-900/30 dark:text-blue-400">
        i
      </span>
      {visible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 max-w-xs bg-popover text-popover-foreground border rounded-lg p-3 shadow-xl text-sm leading-relaxed">
          {label && <div className="font-semibold text-xs mb-1 text-muted-foreground">{label}</div>}
          <div className="text-xs">{text}</div>
        </div>
      )}
    </span>
  );
}

interface SectionHeaderProps {
  title: string;
  tooltip: string;
  required?: boolean;
  subtitle?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, tooltip, required, subtitle, children }: SectionHeaderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 flex-wrap">
        <CardTitle className="text-base">
          {title}
          <InfoTooltip text={tooltip} label={title} />
        </CardTitle>
        {required !== undefined && (
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${required ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
            {required ? 'Required' : 'Optional'}
          </span>
        )}
        {children}
      </div>
      {subtitle && (
        <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
