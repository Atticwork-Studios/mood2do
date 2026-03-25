'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type DeadlineTask = {
  id: string
  title: string
  deadline: string
}

export default function DeadlineTimeline({ category }: { category: 'work' | 'personal' }) {
  const [tasks, setTasks] = useState<DeadlineTask[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('tasks')
        .select('id, title, deadline')
        .eq('category', category)
        .eq('completed', false)
        .not('deadline', 'is', null)
        .is('recurrence_rule', null)
        .order('deadline', { ascending: true })
      setTasks(data ?? [])
    }
    load()
  }, [category])

  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const todayDay = today.getDate()
  const monthName = today.toLocaleString('en-GB', { month: 'long', year: 'numeric' })

  // Day of week for the 1st (Mon=0 … Sun=6)
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7

  // Week band per day (alternates 0/1)
  function weekBand(day: number) {
    return Math.floor((day - 1 + firstDow) / 7) % 2
  }

  // Group tasks by day
  const byDay: Record<number, DeadlineTask[]> = {}
  tasks.forEach(task => {
    const d = new Date(task.deadline)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!byDay[day]) byDay[day] = []
      byDay[day].push(task)
    }
  })

  const futureCount = tasks.filter(t => new Date(t.deadline) > new Date(year, month + 1, 0)).length

  const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">Deadlines — {monthName}</h2>
        {tasks.length === 0
          ? <span className="text-xs text-gray-400">No deadlines this month</span>
          : futureCount > 0 && <span className="text-xs text-gray-400">{futureCount} deadline{futureCount > 1 ? 's' : ''} beyond this month</span>
        }
      </div>

      {/* Calendar strip */}
      <div className="overflow-x-auto mb-4">
      <div className="flex rounded-lg overflow-hidden border border-gray-200 min-w-[600px]">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const isToday = day === todayDay
          const isPast = day < todayDay
          const hasTasks = !!byDay[day]
          const band = weekBand(day)
          const dow = (firstDow + day - 1) % 7

          let bg = band === 0 ? 'bg-white' : 'bg-gray-50'
          if (isToday) bg = 'bg-indigo-600'

          return (
            <div
              key={day}
              style={{ flex: 1 }}
              className={`${bg} flex flex-col items-center py-2 relative border-r border-gray-100 last:border-r-0`}
            >
              {/* Day of week letter */}
              <span className={`text-[9px] font-medium mb-0.5 ${
                isToday ? 'text-indigo-200' : 'text-gray-400'
              }`}>
                {DAY_LABELS[dow]}
              </span>

              {/* Day number */}
              <span className={`text-xs font-semibold ${
                isToday ? 'text-white' : isPast ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {day}
              </span>

              {/* Deadline dots — one per task */}
              {hasTasks && (
                <div className="mt-1 flex flex-col items-center gap-px">
                  {byDay[day].map(t => (
                    <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${isPast ? 'bg-gray-300' : 'bg-red-500'}`} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      </div>

      {/* Task labels */}
      <div className="space-y-1">
        {Object.entries(byDay)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([dayStr, dayTasks]) => {
            const day = Number(dayStr)
            const isPast = day < todayDay
            const dateStr = new Date(year, month, day).toLocaleDateString('en-GB', {
              weekday: 'short', day: 'numeric', month: 'short'
            })
            return (
              <div key={day} className={`flex items-center gap-2 text-xs ${isPast ? 'opacity-40' : ''}`}>
                <span className="text-gray-500 w-24 flex-shrink-0">{dateStr}</span>
                <div className="flex flex-wrap gap-1">
                  {dayTasks.map(t => (
                    <Link key={t.id} href={`/tasks?edit=${t.id}`} className={`px-2 py-0.5 rounded-full font-medium hover:opacity-70 transition-opacity ${
                      isPast ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {t.title}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
