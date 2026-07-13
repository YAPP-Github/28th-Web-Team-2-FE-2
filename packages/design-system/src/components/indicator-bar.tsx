import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type IndicatorBarStep = 1 | 2 | 3;

export interface IndicatorBarProps extends HTMLAttributes<HTMLDivElement> {
  step?: IndicatorBarStep;
}

export function IndicatorBar({
  className,
  step = 1,
  ...props
}: IndicatorBarProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex h-1.5 w-10 items-center gap-1.5", className)}
      {...props}
    >
      {([1, 2, 3] as const).map((item) => (
        <span
          className={cn(
            "h-1.5 rounded-full",
            item === step ? "w-4 bg-gray-900" : "w-1.5 bg-gray-50",
          )}
          key={item}
        />
      ))}
    </div>
  );
}
