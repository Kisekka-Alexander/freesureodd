import { getDayAbbreviation, getDateForFilter } from "@/utils/date";
import { useState, useRef, useEffect } from "react";
import { Calendar } from "./calendar";
import { Prediction } from "@/types";

interface DateFilterProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  predictions?: Prediction[];
}

export function DateFilter({
  selectedDate,
  onDateChange,
  predictions = [],
}: DateFilterProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isNavigatingRef = useRef(false);

  const dateOptions = [
    { offset: -2, label: "2 days before" },
    { offset: -1, label: "Yesterday" },
    { offset: 0, label: "Today" },
    { offset: 1, label: "Tomorrow" },
    { offset: 2, label: "2 days after" },
  ];

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close during navigation
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }

      if (
        calendarRef.current &&
        buttonRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showCalendar]);

  // Close calendar on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [showCalendar]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {/* Quick Date Options */}
        {dateOptions.map(({ offset }) => {
          const filterDate = getDateForFilter(offset);
          const dayAbbr = getDayAbbreviation(offset);
          const isSelected = selectedDate === filterDate;
          const isToday = offset === 0;

          return (
            <button
              key={offset}
              onClick={() => onDateChange(filterDate)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] ${
                isSelected
                  ? isToday
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">{dayAbbr}</div>
                <div className="text-xs opacity-75">
                  {offset === 0
                    ? "Today"
                    : offset === -1
                    ? "Yesterday"
                    : offset === 1
                    ? "Tomorrow"
                    : offset === -2
                    ? "2 days ago"
                    : "In 2 days"}
                </div>
              </div>
            </button>
          );
        })}

        {/* Calendar Dropdown Button Container */}
        <div className="relative ml-2">
          <button
            ref={buttonRef}
            onClick={() => setShowCalendar(!showCalendar)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
              showCalendar
                ? "bg-purple-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
            }`}
            title="Open Calendar"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="hidden sm:inline text-xs">Calendar</span>
          </button>

          {/* Desktop: Dropdown */}
          {showCalendar && (
            <div className="hidden sm:block absolute top-full left-0 mt-2 z-50">
              <div
                ref={calendarRef}
                className="bg-white rounded-lg shadow-lg border border-gray-200 p-4"
                style={{ minWidth: "320px" }}
              >
                <Calendar
                  selectedDate={selectedDate}
                  onDateChange={(date) => {
                    onDateChange(date);
                    setShowCalendar(false);
                  }}
                  predictions={predictions}
                  onNavigation={() => {
                    isNavigatingRef.current = true;
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Full screen modal */}
      {showCalendar && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg w-full max-w-sm"
            ref={calendarRef}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Select Date
              </h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Calendar
                selectedDate={selectedDate}
                onDateChange={(date) => {
                  onDateChange(date);
                  setShowCalendar(false);
                }}
                predictions={predictions}
                onNavigation={() => {
                  isNavigatingRef.current = true;
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
