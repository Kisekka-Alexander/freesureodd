import { useState } from "react";
import { Prediction } from "@/types";

interface CalendarProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
  predictions?: Prediction[];
  onNavigation?: () => void;
}

// Compact Calendar Component for Dropdown/Modal
export function Calendar({
  selectedDate,
  onDateChange,
  predictions = [],
  onNavigation,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Get first day of month and how many days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Create array of days
  const days = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateClick = (day: number) => {
    if (!isDateEnabled(day)) return;
    const selectedDateObj = new Date(year, month, day);
    const formattedDate = formatDateForAPI(selectedDateObj);
    onDateChange(formattedDate);
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate || !day) return false;
    const dateObj = new Date(year, month, day);
    return formatDateForAPI(dateObj) === selectedDate;
  };

  const isToday = (day: number) => {
    if (!day) return false;
    const dateObj = new Date(year, month, day);
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };

  const isDateEnabled = (day: number) => {
    if (!day) return false;
    const dateObj = new Date(year, month, day);
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= -30 && diffDays <= 30;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigation?.();
            setCurrentMonth(new Date(year, month - 1));
          }}
          onClick={(e) => e.preventDefault()}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h3>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigation?.();
            setCurrentMonth(new Date(year, month + 1));
          }}
          onClick={(e) => e.preventDefault()}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          →
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day ? (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDateClick(day);
                }}
                onClick={(e) => e.preventDefault()}
                disabled={!isDateEnabled(day)}
                className={`w-full h-full text-xs rounded-md transition-all duration-200 relative ${
                  !isDateEnabled(day)
                    ? "text-gray-300 cursor-not-allowed"
                    : isDateSelected(day)
                    ? "bg-blue-500 text-white shadow-md"
                    : isToday(day)
                    ? "bg-green-100 text-green-800 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {day}
              </button>
            ) : (
              <div></div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex gap-2 justify-center">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDateChange(formatDateForAPI(today));
            }}
            onClick={(e) => e.preventDefault()}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}
