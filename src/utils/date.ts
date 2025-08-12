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
        return diffInMinutes > 0 ? `in ${diffInMinutes}m` : 'now';
    } else if (diffInHours < 24) {
        return `in ${Math.round(diffInHours)}h`;
    } else if (diffInHours < 48) {
        return 'tomorrow';
    } else {
        const diffInDays = Math.round(diffInHours / 24);
        return `in ${diffInDays} days`;
    }
}
