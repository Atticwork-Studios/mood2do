/**
 * Pure utility functions extracted for testability.
 * These contain no React, Supabase, or browser dependencies.
 */

export function generateRecurringDates(rule: string, start: string, end: string): Date[] {
  const dates: Date[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  const MAX = 500
  while (current <= endDate && dates.length < MAX) {
    dates.push(new Date(current))
    if (rule === 'hourly') current.setHours(current.getHours() + 1)
    else if (rule === 'daily') current.setDate(current.getDate() + 1)
    else if (rule === 'weekly') current.setDate(current.getDate() + 7)
    else if (rule === 'monthly') current.setMonth(current.getMonth() + 1)
    else if (rule === 'yearly') current.setFullYear(current.getFullYear() + 1)
    else break // unknown rule — avoid infinite loop
  }
  return dates
}

export function taskAgeDays(createdAt: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const created = new Date(createdAt); created.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - created.getTime()) / 86400000)
}

export function daysAway(deadline: string | null): string {
  if (!deadline) return ''
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(deadline); due.setHours(0, 0, 0, 0)
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'today'
  if (diff === 1) return 'tomorrow'
  return `in ${diff} days`
}
