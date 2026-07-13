import type { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

export type CtaStatus = "default" | "disabled" | "pressed";

export interface CtaProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  status?: CtaStatus;
}

const ctaVariants = cva(
  "flex h-14 w-full items-center justify-center rounded-2xl p-2 font-head1 text-head1-18 text-center text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed",
  {
    variants: {
      status: {
        default: "bg-gray-900",
        disabled: "bg-gray-200",
        // 디자이너 승인 접근성 예외: blue/100 배경과 흰색 텍스트를 유지한다.
        pressed: "bg-blue-100",
      },
    },
    defaultVariants: { status: "default" },
  },
);

export function Cta({
  children = "확인",
  className,
  disabled = false,
  status = "default",
  type = "button",
  ...props
}: CtaProps) {
  const resolvedStatus = disabled || status === "disabled" ? "disabled" : status;

  return (
    <button
      className={cn(ctaVariants({ status: resolvedStatus }), className)}
      disabled={resolvedStatus === "disabled"}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
