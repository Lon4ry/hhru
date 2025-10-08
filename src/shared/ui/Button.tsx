import { ButtonHTMLAttributes } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/shared";

const button = cva(
  "inline-flex items-center justify-center rounded-lg px-4 py-2 transition cursor-pointer",
  {
    variants: {
      size: {
        sm: "py-1 px-2",
        md: "py-3 px-6",
        lg: "px-7 py-4 text-lg",
      },
      variant: {
        default: "text-white bg-blue-500 hover:bg-blue-600",
        ghost: "bg-transparent hover:underline",
      },
      disabled: {
        true: "bg-blue-300 hover:bg-blue-300 cursor-not-allowed",
      },
    },
    defaultVariants: {
      disabled: false,
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled">,
    VariantProps<typeof button> {}

export function Button({ disabled, className, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(button({ className, disabled, size }))}
      disabled={disabled || undefined}
      {...props}
    />
  );
}
