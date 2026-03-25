import { generateRecurringDates, taskAgeDays, daysAway } from '@/lib/taskUtils'

// ---------------------------------------------------------------------------
// generateRecurringDates
// ---------------------------------------------------------------------------

describe('generateRecurringDates', () => {
  test('daily: produces one date per day between start and end', () => {
    const dates = generateRecurringDates('daily', '2025-01-01', '2025-01-05')
    expect(dates).toHaveLength(5)
    expect(dates[0].toISOString().startsWith('2025-01-01')).toBe(true)
    expect(dates[4].toISOString().startsWith('2025-01-05')).toBe(true)
  })

  test('weekly: produces one date per week', () => {
    const dates = generateRecurringDates('weekly', '2025-01-01', '2025-01-29')
    expect(dates).toHaveLength(5) // Jan 1, 8, 15, 22, 29
  })

  test('monthly: produces one date per month', () => {
    const dates = generateRecurringDates('monthly', '2025-01-01', '2025-06-01')
    expect(dates).toHaveLength(6)
  })

  test('yearly: produces one date per year', () => {
    const dates = generateRecurringDates('yearly', '2025-01-01', '2027-01-01')
    expect(dates).toHaveLength(3)
  })

  test('returns empty array when start is after end', () => {
    const dates = generateRecurringDates('daily', '2025-01-10', '2025-01-05')
    expect(dates).toHaveLength(0)
  })

  test('caps at 500 dates to prevent infinite loops', () => {
    const dates = generateRecurringDates('daily', '2020-01-01', '2030-01-01')
    expect(dates.length).toBeLessThanOrEqual(500)
  })

  test('unknown rule returns just the start date (no infinite loop)', () => {
    const dates = generateRecurringDates('fortnightly', '2025-01-01', '2025-12-31')
    expect(dates).toHaveLength(1)
  })
})

// ---------------------------------------------------------------------------
// taskAgeDays
// ---------------------------------------------------------------------------

describe('taskAgeDays', () => {
  test('returns 0 for a task created today', () => {
    const today = new Date().toISOString()
    expect(taskAgeDays(today)).toBe(0)
  })

  test('returns 1 for a task created yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(taskAgeDays(yesterday.toISOString())).toBe(1)
  })

  test('returns 7 for a task created 7 days ago', () => {
    const old = new Date()
    old.setDate(old.getDate() - 7)
    expect(taskAgeDays(old.toISOString())).toBe(7)
  })
})

// ---------------------------------------------------------------------------
// daysAway
// ---------------------------------------------------------------------------

describe('daysAway', () => {
  function dateString(offsetDays: number): string {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    // Format as YYYY-MM-DD (no time component so timezone ambiguity is minimal)
    return d.toISOString().split('T')[0]
  }

  test('returns empty string for null deadline', () => {
    expect(daysAway(null)).toBe('')
  })

  test('returns "today" for today\'s date', () => {
    expect(daysAway(dateString(0))).toBe('today')
  })

  test('returns "tomorrow" for tomorrow\'s date', () => {
    expect(daysAway(dateString(1))).toBe('tomorrow')
  })

  test('returns "in X days" for future dates beyond tomorrow', () => {
    expect(daysAway(dateString(5))).toBe('in 5 days')
  })

  test('returns "Xd overdue" for past dates', () => {
    expect(daysAway(dateString(-3))).toBe('3d overdue')
  })
})
