"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IntervalType } from "@/types/interval"


// props (the setDate function) is passed down from the parent component
interface DatePickerWithRangeProps {
    setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>
    date: DateRange | undefined,
    className: string
    interval?: IntervalType
    }

export function SelectStartEndDate({
    setDate,
    date,
    className,
    interval,
}: DatePickerWithRangeProps) {
  // For minute, five_minute, and hour intervals, restrict to 1 day max
  const isRestrictedInterval = interval === IntervalType.Minute || 
                               interval === IntervalType.FiveMinute || 
                               interval === IntervalType.Hour;

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    if (!selectedDate?.from) {
      setDate(selectedDate);
      return;
    }

    // If restricted interval and both dates are selected
    if (isRestrictedInterval && selectedDate.from && selectedDate.to) {
      const diff = selectedDate.to.getTime() - selectedDate.from.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      
      // If range exceeds 1 day, cap it to 1 day from the start date
      if (diff > oneDay) {
        const maxDate = new Date(selectedDate.from);
        maxDate.setDate(maxDate.getDate() + 1);
        maxDate.setHours(23, 59, 59, 999);
        setDate({
          from: selectedDate.from,
          to: maxDate,
        });
        return;
      }
    }

    setDate(selectedDate);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            disabled={(day) => {
              if (!isRestrictedInterval || !date?.from) return false;
              
              // If we have a start date, disable dates beyond 1 day from it
              const maxDate = new Date(date.from);
              maxDate.setDate(maxDate.getDate() + 1);
              maxDate.setHours(23, 59, 59, 999);
              
              return day > maxDate;
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
