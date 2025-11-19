"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Checkbox({ className, checked, onCheckedChange, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 rounded-sm border bg-background shadow-xs focus-visible:ring-2 focus-visible:ring-ring/50",
        className
      )}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}