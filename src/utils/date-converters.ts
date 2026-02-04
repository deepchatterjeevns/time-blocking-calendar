import { startOfDay, addMinutes, getHours, getMinutes, parseISO } from 'date-fns'

/**
 * Converts minutes from midnight (0-1439) to a Date object for the given base date.
 */
export function minutesToDate(minutes: number, baseDate: Date = new Date()): Date {
    const start = startOfDay(baseDate)
    return addMinutes(start, minutes)
}

/**
 * Converts a Date object (or ISO string) to minutes from midnight (0-1439).
 */
export function dateToMinutes(date: Date | string): number {
    const d = typeof date === 'string' ? parseISO(date) : date
    return getHours(d) * 60 + getMinutes(d)
}
