import type { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { LinkIcon } from "../icons/link-icon";
import { cn } from "../lib/cn";

export type CtaSmallVariant = "stroke" | "strokeIcon" | "fill";

export interface CtaSmallProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: CtaSmallVariant;
}

const ctaSmallVariants = cva(
  "flex h-14 w-full items-center justify-center rounded-2xl py-2 font-head1 text-head1-16 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        stroke: "border border-gray-200 bg-white px-5",
        strokeIcon: "gap-0.5 border border-gray-200 bg-white pr-4 pl-3",
        fill: "bg-kakao-500 px-5",
      },
    },
    defaultVariants: { variant: "stroke" },
  },
);

export function CtaSmall({
  children,
  className,
  type = "button",
  variant = "stroke",
  ...props
}: CtaSmallProps) {
  const label = children ?? (variant === "fill" ? "카카오톡 공유" : "인스타 스토리 공유");

  return (
    <button
      className={cn(ctaSmallVariants({ variant }), className)}
      type={type}
      {...props}
    >
      {variant === "strokeIcon" ? (
        <LinkIcon className="size-6 shrink-0 text-gray-400" />
      ) : null}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
