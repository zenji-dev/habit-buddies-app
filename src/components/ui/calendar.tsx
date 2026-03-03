import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const today = new Date();
  const initialMonth = (props as any).month ?? today;
  const [viewMonth, setViewMonth] = React.useState<Date>(initialMonth);

  // sidebar years state: start at next year
  const currentYear = today.getFullYear();
  const [sidebarStartYear, setSidebarStartYear] = React.useState<number>(currentYear + 1);
  const yearsPerPage = 5;

  React.useEffect(() => {
    // keep viewMonth in sync if parent controls month prop
    if ((props as any).month) {
      setViewMonth((props as any).month as Date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(props as any).month]);

  const handleYearSelect = (year: number) => {
    // jump to January of selected year but keep current month index if possible
    const m = viewMonth ? viewMonth.getMonth() : 0;
    setViewMonth(new Date(year, m, 1));
  };

  return (
    <div className={cn("relative flex items-start", className)}>
      <div className="flex-1">
        <DayPicker
          showOutsideDays={showOutsideDays}
          month={viewMonth}
          onMonthChange={(m) => setViewMonth(m)}
          className={cn("p-3", className)}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
            day_range_end: "day-range-end",
            day_selected:
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
            IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
          }}
          {...props}
        />
      </div>

      {/* Sidebar with quick years - shown on sm+ screens */}
      <div className="hidden sm:flex flex-col items-center ml-2 select-none">
        <div className="text-[11px] text-muted-foreground mb-1">Anos</div>
        <div className="flex flex-col gap-1">
          {Array.from({ length: yearsPerPage }).map((_, i) => {
            const y = sidebarStartYear + i;
            return (
              <button
                key={y}
                type="button"
                onClick={() => handleYearSelect(y)}
                className={cn(
                  "text-xs px-2 py-1 rounded text-white hover:bg-slate-800",
                  y === viewMonth.getFullYear() ? "bg-[#00a375] text-black font-semibold" : ""
                )}
              >
                {y}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setSidebarStartYear((s) => s + yearsPerPage)}
          className="mt-2 text-muted-foreground text-sm px-2 py-1"
          aria-label="mais anos"
        >
          ▾
        </button>
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
