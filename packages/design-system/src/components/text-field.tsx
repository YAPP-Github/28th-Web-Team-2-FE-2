import type { HTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";

export type TextFieldStatus = "focused" | "entered" | "placeholder" | "error";

export interface TextFieldProps extends HTMLAttributes<HTMLDivElement> {
  status?: TextFieldStatus;
  text?: string;
}

const textFieldVariants = cva(
  "flex h-15 w-full items-center rounded-xl border bg-white px-4 py-2 font-body text-body-16-medium",
  {
    variants: {
      status: {
        focused: "border-blue-400 text-gray-900",
        entered: "border-gray-200 text-gray-900",
        placeholder: "border-gray-200 text-gray-200",
        error: "border-red-300 text-gray-900",
      },
    },
    defaultVariants: { status: "focused" },
  },
);

export function TextField({
  className,
  status = "focused",
  text,
  ...props
}: TextFieldProps) {
  const content = text ?? (status === "placeholder" ? "플레이스 홀더" : "김루키");

  return (
    <div className={cn(textFieldVariants({ status }), className)} {...props}>
      {content}
    </div>
  );
}
