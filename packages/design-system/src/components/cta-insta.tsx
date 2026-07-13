import type { ButtonHTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type CtaInstaProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function CtaInsta({
  children = "인스타 스토리 공유",
  className,
  type = "button",
  ...props
}: CtaInstaProps) {
  return (
    <button
      className={cn(
        "flex h-14 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 py-2 font-head1 text-head1-16 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      type={type}
      {...props}
    >
      <span className="whitespace-nowrap">{children}</span>
    </button>
  );
}
