"use client";

import { InputHTMLAttributes, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/shared";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "name"> {
  name: string;
  leftElement?: ReactNode;
}

export function Input(props: InputProps) {
  const { register, formState } = useFormContext();
  const { name, leftElement, className, ...restProps } = props;
  return (
    <>
      <div
        className={
          "flex items-center rounded-lg border border-[#D1D5DB] bg-white px-3"
        }
      >
        {leftElement}
        <input
          id={name}
          {...register(name)}
          className={cn("min-w-0 grow py-2 focus:outline-none", className)}
          {...restProps}
        />
      </div>
      {formState.errors[name]?.message && (
        <p className={"font-normal text-red-500"}>
          {formState.errors[props.name as string]?.message as string}
        </p>
      )}
    </>
  );
}
