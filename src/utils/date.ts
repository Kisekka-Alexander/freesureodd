/**
 * Date utility functions for handling timezone conversions
 */

/**
 * Formats a UTC timestamp to the user's local timezone
 * @param utcDateString - ISO 8601 UTC timestamp (e.g., "2025-08-10T01:04:29.254489+00:00")
 * @param options - Intl.DateTimeFormatOptions for customizing the output format
 * @returns Formatted date string in user's local timezone
 */
export function formatToLocalTimezone(
  utcDateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(utcDateString);

  // Default formatting options
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short", // Include timezone abbreviation
  };

  const formatOptions = { ...defaultOptions, ...options };

  return date.toLocaleString(undefined, formatOptions);
}

/**
 * Formats a match date specifically for the predictions table
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns Formatted date string optimized for match display
 */
export function formatMatchDate(utcDateString: string): string {
  return formatToLocalTimezone(utcDateString, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: undefined, // Remove timezone abbreviation
  });
}

/**
 * Formats a date for compact display (e.g., mobile cards)
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns Compact formatted date string
 */
export function formatCompactDate(utcDateString: string): string {
  return formatToLocalTimezone(utcDateString, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: undefined, // Remove timezone abbreviation
  });
}

/**
 * Formats a date for table display (date only, no time)
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns Date-only formatted string
 */
export function formatDateOnly(utcDateString: string): string {
  return formatToLocalTimezone(utcDateString, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZoneName: undefined,
  });
}

/**
 * Formats a date and time in MM/dd/yyyy h:mm AM/PM format
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns Formatted date and time string (e.g., "08/20/2025 7:00 PM")
 */
export function formatDateTimeAMPM(utcDateString: string): string {
  const date = new Date(utcDateString);

  return date.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: undefined,
  });
}

/**
 * Formats only the time portion of a date
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns Time string in user's local timezone (e.g., "14:30")
 */
export function formatTimeOnly(utcDateString: string): string {
  return formatToLocalTimezone(utcDateString, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: undefined, // Remove timezone abbreviation
  });
}

/**
 * Gets the user's timezone name
 * @returns Timezone name (e.g., "America/New_York", "Europe/London")
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Checks if a match is happening today in user's timezone
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns True if match is today in user's timezone
 */
export function isMatchToday(utcDateString: string): boolean {
  const matchDate = new Date(utcDateString);
  const today = new Date();

  return (
    matchDate.getDate() === today.getDate() &&
    matchDate.getMonth() === today.getMonth() &&
    matchDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Gets relative time string (e.g., "in 2 hours", "tomorrow")
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns Relative time string
 */
export function getRelativeTime(utcDateString: string): string {
  const matchDate = new Date(utcDateString);
  const now = new Date();
  const diffInHours = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    const diffInMinutes = Math.round(diffInHours * 60);
    return diffInMinutes > 0 ? `in ${diffInMinutes}m` : "now";
  } else if (diffInHours < 24) {
    return `in ${Math.round(diffInHours)}h`;
  } else if (diffInHours < 48) {
    return "tomorrow";
  } else {
    const diffInDays = Math.round(diffInHours / 24);
    return `in ${diffInDays} days`;
  }
}

/**
 * Gets a date string for API filtering (YYYY-MM-DD format) in user's local timezone
 * @param daysOffset - Number of days to offset from today (can be negative)
 * @returns Date string in YYYY-MM-DD format in user's timezone
 */
export function getDateForFilter(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  // Convert to local timezone YYYY-MM-DD format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Gets a readable label for a date filter
 * @param daysOffset - Number of days to offset from today
 * @returns Readable date label
 */
export function getDateLabel(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  if (daysOffset === 0) return "Today";
  if (daysOffset === -1) return "Yesterday";
  if (daysOffset === 1) return "Tomorrow";
  if (daysOffset === -2) return "2 days ago";
  if (daysOffset === 2) return "In 2 days";

  // For other dates, show the actual date
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Gets the day abbreviation for a date
 * @param daysOffset - Number of days to offset from today
 * @returns Day abbreviation (e.g., "Sat", "Sun", "Mon")
 */
export function getDayAbbreviation(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Checks if a match date falls on a specific filter date
 * @param matchDateString - ISO 8601 UTC timestamp of the match
 * @param filterDate - Date string in YYYY-MM-DD format in user's timezone
 * @returns True if match is on the filter date in user's timezone
 */
export function isMatchOnDate(
  matchDateString: string,
  filterDate: string
): boolean {
  const matchDate = new Date(matchDateString);

  // Convert match date to user's local timezone YYYY-MM-DD format
  const year = matchDate.getFullYear();
  const month = String(matchDate.getMonth() + 1).padStart(2, "0");
  const day = String(matchDate.getDate()).padStart(2, "0");
  const matchDateLocal = `${year}-${month}-${day}`;

  return matchDateLocal === filterDate;
}

/**
 * Converts a UTC date string to local date string (YYYY-MM-DD format)
 * @param utcDateString - ISO 8601 UTC timestamp
 * @returns Date string in YYYY-MM-DD format in user's timezone
 */
export function convertUtcToLocalDate(utcDateString: string): string {
  const date = new Date(utcDateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date in user's local timezone (YYYY-MM-DD format)
 * @returns Today's date string in YYYY-MM-DD format
 */
export function getTodayLocalDate(): string {
  return getDateForFilter(0);
}

/**
 * Checks if a date string represents today in user's timezone
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns True if the date is today in user's timezone
 */
export function isDateToday(dateString: string): boolean {
  return dateString === getTodayLocalDate();
}

/**
 * Converts a local date to UTC date range for API filtering
 * @param localDateString - Date string in YYYY-MM-DD format in user's timezone
 * @returns Object with UTC start and end timestamps for the local date
 */
export function getUtcDateRangeForLocalDate(localDateString: string): {
  startUtc: string;
  endUtc: string;
} {
  // Create date objects for start and end of the local date
  const startOfDay = new Date(`${localDateString}T00:00:00`);
  const endOfDay = new Date(`${localDateString}T23:59:59.999`);

  // Convert to UTC by considering the user's timezone
  // Note: This creates dates in local browser timezone, but we need to adjust for user's timezone

  // For API filtering, we'll send the local date and timezone to the server
  // and let the server handle the UTC conversion properly
  return {
    startUtc: startOfDay.toISOString(),
    endUtc: endOfDay.toISOString(),
  };
}

/**
 * Prepares date filter parameters for the API
 * @param selectedDate - Date string in YYYY-MM-DD format in user's timezone (null for no filter)
 * @returns API parameters object with date filtering
 */
export function prepareDateFilterForApi(selectedDate: string | null): {
  match_date?: string;
  timezone?: string;
} {
  if (!selectedDate) {
    return {}; // No date filter
  }

  return {
    match_date: selectedDate, // Send user's local date
    timezone: getUserTimezone(), // Send user's timezone for server conversion
  };
}

/**
 * Debug function to log timezone information and date comparisons
 * @param matchDateString - UTC match date
 * @param filterDate - Filter date in local timezone
 */
export function debugTimezoneInfo(
  matchDateString: string,
  filterDate: string
): void {
  if (process.env.NODE_ENV === "development") {
    const matchDate = new Date(matchDateString);
    const matchDateLocal = convertUtcToLocalDate(matchDateString);
    const userTz = getUserTimezone();

    console.log("🕐 Timezone Debug Info:", {
      userTimezone: userTz,
      utcMatchDate: matchDateString,
      localMatchDate: matchDateLocal,
      filterDate: filterDate,
      matches: matchDateLocal === filterDate,
      utcDate: matchDate.toISOString().split("T")[0],
      localTime: matchDate.toLocaleString(),
    });
  }
}
