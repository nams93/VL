"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    indeterminate?: boolean
  }
>(({ className, indeterminate, ...props }, ref) => {
  const innerRef = React.useRef<HTMLInputElement>(null)

  React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

  React.useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = !!indeterminate
    }
  }, [indeterminate])

  return (
    <div className="relative flex items-center">
      <input type="checkbox" ref={innerRef} className="peer absolute h-4 w-4 opacity-0" {...props} />
      <div
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
          className,
          props.checked ? "bg-primary text-primary-foreground" : "border-primary",
        )}
      >
        {props.checked && <Check className="h-3 w-3 text-current" />}
      </div>
    </div>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }
