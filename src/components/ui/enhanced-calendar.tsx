import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

export type EnhancedCalendarProps = {
  className?: string;
  classNames?: any;
  showOutsideDays?: boolean;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  mode?: "single";
};

type ViewMode = "days" | "months" | "years";

function EnhancedCalendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  onSelect,
  disabled,
  initialFocus,
  mode = "single",
  ...props
}: EnhancedCalendarProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>("days");
  const [displayDate, setDisplayDate] = React.useState<Date>(selected || new Date());

  const handleHeaderClick = () => {
    if (viewMode === "days") {
      setViewMode("months");
    } else if (viewMode === "months") {
      setViewMode("years");
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(displayDate.getFullYear(), monthIndex, 1);
    setDisplayDate(newDate);
    setViewMode("days");
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, displayDate.getMonth(), 1);
    setDisplayDate(newDate);
    setViewMode("months");
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && onSelect) {
      onSelect(date);
    }
  };

  const navigateYear = (direction: "prev" | "next") => {
    const newYear = displayDate.getFullYear() + (direction === "next" ? 1 : -1);
    setDisplayDate(new Date(newYear, displayDate.getMonth(), 1));
  };

  const navigateDecade = (direction: "prev" | "next") => {
    const newYear = displayDate.getFullYear() + (direction === "next" ? 10 : -10);
    setDisplayDate(new Date(newYear, displayDate.getMonth(), 1));
  };

  if (viewMode === "months") {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return (
      <div className={cn("p-3 pointer-events-auto", className)}>
        <div className="flex justify-center pt-1 relative items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
            onClick={() => navigateYear("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="text-sm font-medium"
            onClick={handleHeaderClick}
          >
            {displayDate.getFullYear()}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
            onClick={() => navigateYear("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month, index) => (
            <Button
              key={month}
              variant="ghost"
              className={cn(
                "h-9 p-0 font-normal",
                displayDate.getMonth() === index && "bg-primary text-primary-foreground"
              )}
              onClick={() => handleMonthSelect(index)}
            >
              {month.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === "years") {
    const currentYear = displayDate.getFullYear();
    const startYear = Math.floor(currentYear / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i - 1);

    return (
      <div className={cn("p-3 pointer-events-auto", className)}>
        <div className="flex justify-center pt-1 relative items-center mb-4">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
            onClick={() => navigateDecade("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            className="text-sm font-medium"
          >
            {startYear} - {startYear + 9}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
            onClick={() => navigateDecade("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {years.map((year) => (
            <Button
              key={year}
              variant="ghost"
              className={cn(
                "h-9 p-0 font-normal",
                displayDate.getFullYear() === year && "bg-primary text-primary-foreground",
                (year < startYear || year > startYear + 9) && "text-muted-foreground opacity-50"
              )}
              onClick={() => handleYearSelect(year)}
            >
              {year}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      month={displayDate}
      onMonthChange={setDisplayDate}
      selected={selected}
      onSelect={handleDateSelect}
      disabled={disabled}
      mode={mode}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium cursor-pointer hover:text-primary",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        CaptionLabel: ({ displayMonth }) => (
          <button
            className="text-sm font-medium cursor-pointer hover:text-primary"
            onClick={handleHeaderClick}
          >
            {format(displayMonth, "MMMM yyyy")}
          </button>
        ),
      }}
      {...props}
    />
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };