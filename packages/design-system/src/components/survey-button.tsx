import type { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

export type SurveyButtonStatus = "default" | "activated";

export interface SurveyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  status?: SurveyButtonStatus;
}

const surveyButtonVariants = cva(
  "flex h-16 w-full items-center rounded-xl px-4 py-2 text-left font-body text-body-16-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      status: {
        default: "bg-white text-gray-400",
        activated: "bg-gray-800 text-white",
      },
    },
    defaultVariants: { status: "default" },
  },
);

export function SurveyButton({
  children = "안 가. 계획 없는 여행은 상상만 해도 멀미나",
  className,
  status = "default",
  type = "button",
  ...props
}: SurveyButtonProps) {
  return (
    <button
      aria-pressed={status === "activated"}
      className={cn(surveyButtonVariants({ status }), className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
