import {
  getDayAbbreviation,
  getDateForFilter,
  getUserTimezone,
  getTodayLocalDate,
} from "@/utils/date";

interface DateFilterProps {
  selectedDate: string | null;
  onDateChange: (date: string | null) => void;
}

export function DateFilter({ selectedDate, onDateChange }: DateFilterProps) {
  const dateOptions = [
    { offset: -2, label: "2 days before" },
    { offset: -1, label: "Yesterday" },
    { offset: 0, label: "Today" },
    { offset: 1, label: "Tomorrow" },
    { offset: 2, label: "2 days after" },
  ];

  const userTimezone = getUserTimezone();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium text-gray-700">
          🗓️ Filter by Date
        </div>
        <div className="text-xs text-gray-500">
          Your timezone: {userTimezone.split("/").pop()?.replace("_", " ")}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {/* All Dates Option */}
        <button
          onClick={() => onDateChange(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedDate === null
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          <div className="text-center">
            <div className="font-semibold">All</div>
            <div className="text-xs opacity-75">Dates</div>
          </div>
        </button>

        {/* Date Options */}
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
      </div>

      {selectedDate && (
        <div className="mt-3 text-xs text-gray-500">
          <div>
            Showing matches for:{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-gray-400 mt-1">
            🌍 Filtered by your timezone:{" "}
            {userTimezone.split("/").pop()?.replace("_", " ")}
            <br />
            ℹ️ All match times converted from UTC to your local time
          </div>
        </div>
      )}
    </div>
  );
}
