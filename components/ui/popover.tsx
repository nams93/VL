"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const Popover = ({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return <>{children}</>
}

const PopoverTrigger = ({
  asChild,
  children,
  onClick,
}: {
  asChild?: boolean
  children: React.ReactNode
  onClick?: () => void
}) => {
  return (
    <div onClick={onClick} className="cursor-pointer inline-block">
      {children}
    </div>
  )
}

const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    align?: "center" | "start" | "end"
    sideOffset?: number
  }
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    style={{
      position: "absolute",
      top: `calc(100% + ${sideOffset}px)`,
      left: align === "center" ? "50%" : align === "start" ? "0" : "auto",
      right: align === "end" ? "0" : "auto",
      transform: align === "center" ? "translateX(-50%)" : "none",
    }}
    {...props}
  />
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
