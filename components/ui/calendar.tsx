"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { fr } from "date-fns/locale"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
  mode?: "single" | "range" | "multiple"
  selected?: Date | Date[] | { from: Date; to: Date }
  onSelect?: (date: Date | Date[] | { from: Date; to: Date } | undefined) => void
  disabled?: { from: Date; to: Date }[] | ((date: Date) => boolean)
  className?: string
  classNames?: Record<string, string>
  showOutsideDays?: boolean
  locale?: typeof fr
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  classNames,
  showOutsideDays = true,
  locale = fr,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const handleDateSelect = (day: Date) => {
    if (onSelect) {
      if (mode === "single") {
        onSelect(day)
      } else if (mode === "multiple" && Array.isArray(selected)) {
        const isSelected = selected.some((date) => isSameDay(date, day))
        if (isSelected) {
          onSelect(selected.filter((date) => !isSameDay(date, day)))
        } else {
          onSelect([...selected, day])
        }
      } else if (mode === "range" && selected && "from" in selected && "to" in selected) {
        // Simplified range selection
        onSelect({ from: day, to: day })
      }
    }
  }

  const isDateSelected = (day: Date) => {
    if (!selected) return false

    if (mode === "single" && selected instanceof Date) {
      return isSameDay(selected, day)
    } else if (mode === "multiple" && Array.isArray(selected)) {
      return selected.some((date) => isSameDay(date, day))
    } else if (mode === "range" && selected && "from" in selected && "to" in selected) {
      return isSameDay(selected.from, day) || isSameDay(selected.to, day)
    }

    return false
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between items-center pt-1">
        <button
          onClick={handlePreviousMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">{format(currentMonth, "MMMM yyyy", { locale })}</div>
        <button
          onClick={handleNextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
          <div key={i} className="text-center text-muted-foreground text-xs">
            {day}
          </div>
        ))}

        {daysInMonth.map((day, i) => {
          const isSelected = isDateSelected(day)
          const isDayToday = isToday(day)

          return (
            <button
              key={i}
              onClick={() => handleDateSelect(day)}
              className={cn(
                "h-9 w-9 rounded-md text-center text-sm p-0 font-normal",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                !isSelected && isDayToday && "bg-accent text-accent-foreground",
                !isSelected && !isDayToday && "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
