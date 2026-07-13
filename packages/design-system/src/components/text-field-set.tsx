import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";
import { TextField } from "./text-field";

export type TextFieldSetVariant = "default" | "description";

export interface TextFieldSetProps extends HTMLAttributes<HTMLDivElement> {
  description?: string;
  text?: string;
  variant?: TextFieldSetVariant;
}

export function TextFieldSet({
  className,
  description = "description",
  text,
  variant = "default",
  ...props
}: TextFieldSetProps) {
  return (
    <div className={cn("flex w-full flex-col items-start", className)} {...props}>
      <TextField status="error" text={text} />
      {variant === "description" ? (
        <p className="mt-1 w-full font-body text-body-16-medium text-red-300">
          {description}
        </p>
      ) : null}
    </div>
  );
}
