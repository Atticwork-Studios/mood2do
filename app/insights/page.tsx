'use client'

import { useState, useEffect } from 'react'
import NavBar from '@/app/components/NavBar'
import { createClient } from '@/lib/supabase/client'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const RANGES = [
  { label: 'Last 7 days',   days: 7   },
  { label: 'Last 30 days',  days: 30  },
  { label: 'Last 3 months', days: 90  },
  { label: 'Last 6 months', days: 180 },
  { label: 'All time',      days: 0   },
]

const MOOD_COLOURS: Record<string, string> = {
  Focussed:   '#6366f1',
  Bored:      '#f59e0b',
  Distracted: '#ec4899',
  Anxious:    '#f97316',
  Creative:   '#8b5cf6',
  Energised:  '#10b981',
  Tired:      '#94a3b8',
}

function moodColour(mood: string) {
  return MOOD_COLOURS[mood] ?? '#6366f1'
}

type CompletedTask = {
  completed_mood: string
  completed_at: string
}

type TimedTask = {
  title: string
  estimated_minutes: number
  actual_minutes: number
  completed_mood: string | null
  completed_at: string
  time_adjustments: { delta: number; atSecs: number }[] | null
}

// Deterministic jitter so dots at same day+hour spread out without overlapping
function jitter(index: number, total: number): number {
  if (total <= 1) return 0
  const spread = Math.min(total - 1, 6) * 5
  return (index - (total - 1) / 2) * (spread / Math.max(total - 1, 1))
}

export default function InsightsPage() {
  const [data, setData] = useState<CompletedTask[]>([])
  const [timedTasks, setTimedTasks] = useState<TimedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState(90)
  const [activeMoods, setActiveMoods] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [{ data: moodData }, { data: timeData }] = await Promise.all([
        supabase
          .from('tasks')
          .select('completed_mood, completed_at')
          .eq('completed', true)
          .not('completed_mood', 'is', null)
          .not('completed_at', 'is', null),
        supabase
          .from('tasks')
          .select('title, estimated_minutes, actual_minutes, completed_mood, completed_at, time_adjustments')
          .eq('completed', true)
          .not('estimated_minutes', 'is', null)
          .not('actual_minutes', 'is', null)
          .order('completed_at', { ascending: false }),
      ])
      setData(moodData ?? [])
      setTimedTasks(timeData ?? [])
      const moods = Array.from(new Set((moodData ?? []).map((d: CompletedTask) => d.completed_mood)))
      setActiveMoods(new Set(moods))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = range === 0 ? data : data.filter(d => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    return new Date(d.completed_at) >= cutoff
  })

  const allMoods = Array.from(new Set(data.map(d => d.completed_mood))).sort()

  function toggleMood(mood: string) {
    setActiveMoods(prev => {
      const next = new Set(prev)
      next.has(mood) ? next.delete(mood) : next.add(mood)
      return next
    })
  }

  // SVG layout
  const svgWidth = 800
  const svgHeight = 420
  const marginLeft = 52
  const marginRight = 20
  const marginTop = 32
  const marginBottom = 24
  const plotW = svgWidth - marginLeft - marginRight
  const plotH = svgHeight - marginTop - marginBottom
  const colWidth = plotW / 7

  const startHour = 6
  const endHour = 22
  const hourRange = endHour - startHour

  // Centre of each day column
  function xPos(dayIndex: number) {
    return marginLeft + (dayIndex + 0.5) * colWidth
  }

  // Left edge of each day column (for grid lines)
  function xCol(dayIndex: number) {
    return marginLeft + dayIndex * colWidth
  }

  function yPos(hour: number, minute = 0) {
    const h = Math.max(startHour, Math.min(endHour, hour + minute / 60))
    return marginTop + ((h - startHour) / hourRange) * plotH
  }

  // Group dots by day+hour for jitter
  const groups: Record<string, CompletedTask[]> = {}
  filtered.forEach(t => {
    const day = (new Date(t.completed_at).getDay() + 6) % 7
    const hour = new Date(t.completed_at).getHours()
    const key = `${day}-${hour}`
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  // Timing section — filter by range
  const timedFiltered = range === 0 ? timedTasks : timedTasks.filter(t => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    return new Date(t.completed_at) >= cutoff
  })

  const avgDiff = timedFiltered.length > 0
    ? timedFiltered.reduce((sum, t) => sum + (t.actual_minutes - t.estimated_minutes), 0) / timedFiltered.length
    : null

  // Average overrun per mood
  const moodDiffs: Record<string, number[]> = {}
  timedFiltered.forEach(t => {
    if (!t.completed_mood) return
    if (!moodDiffs[t.completed_mood]) moodDiffs[t.completed_mood] = []
    moodDiffs[t.completed_mood].push(t.actual_minutes - t.estimated_minutes)
  })
  const moodAvgs = Object.entries(moodDiffs)
    .map(([mood, diffs]) => ({ mood, avg: diffs.reduce((a, b) => a + b, 0) / diffs.length }))
    .sort((a, b) => b.avg - a.avg)

  const maxMinutes = timedFiltered.length > 0
    ? Math.max(...timedFiltered.map(t => Math.max(t.estimated_minutes, t.actual_minutes)))
    : 1

  const hourLabels = [6, 8, 10, 12, 14, 16, 18, 20, 22]
  const hourLabelText: Record<number, string> = {
    6: '6am', 8: '8am', 10: '10am', 12: '12pm',
    14: '2pm', 16: '4pm', 18: '6pm', 20: '8pm', 22: '10pm'
  }

  return (
    <>
      <NavBar />
      <main className="w-full max-w-5xl mx-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Insights</h1>
        <p className="text-sm text-gray-500 mb-4">
          Each dot is a completed task. Toggle moods to focus — clusters show your natural patterns.
        </p>

        {/* Range filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {RANGES.map(r => (
            <button
              key={r.label}
              onClick={() => setRange(r.days)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                range === r.days
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Mood filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allMoods.map(mood => {
            const active = activeMoods.has(mood)
            const colour = moodColour(mood)
            return (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                style={{
                  borderColor: colour,
                  backgroundColor: active ? colour : 'white',
                  color: active ? 'white' : colour,
                }}
                className="px-3 py-1.5 rounded-full text-sm border-2 font-medium transition-colors"
              >
                {mood}
              </button>
            )
          })}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">No data yet — complete some tasks with a mood selected on the Work or Personal page.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ display: 'block', width: '100%', minWidth: '600px' }}>

              {/* Hour grid lines */}
              {hourLabels.map(h => (
                <g key={h}>
                  <line
                    x1={marginLeft} y1={yPos(h)}
                    x2={svgWidth - marginRight} y2={yPos(h)}
                    stroke="#f3f4f6" strokeWidth={1}
                  />
                  <text
                    x={marginLeft - 6} y={yPos(h)}
                    textAnchor="end" dominantBaseline="middle"
                    fontSize={11} fill="#9ca3af"
                  >
                    {hourLabelText[h]}
                  </text>
                </g>
              ))}

              {/* Day columns */}
              {DAYS.map((day, di) => (
                <g key={day}>
                  <line
                    x1={xCol(di)} y1={marginTop}
                    x2={xCol(di)} y2={svgHeight - marginBottom}
                    stroke="#f3f4f6" strokeWidth={1}
                  />
                  <text
                    x={xPos(di)} y={marginTop - 10}
                    textAnchor="middle"
                    fontSize={12} fontWeight={600} fill="#6b7280"
                  >
                    {day}
                  </text>
                </g>
              ))}
              {/* Right edge */}
              <line x1={xCol(7)} y1={marginTop} x2={xCol(7)} y2={svgHeight - marginBottom} stroke="#f3f4f6" strokeWidth={1} />

              {/* Dots */}
              {Object.entries(groups).map(([key, groupTasks]) => {
                const [dayStr, hourStr] = key.split('-')
                const di = parseInt(dayStr)
                const hour = parseInt(hourStr)
                return groupTasks.map((task, idx) => {
                  if (!activeMoods.has(task.completed_mood)) return null
                  const colour = moodColour(task.completed_mood)
                  const x = xPos(di) + jitter(idx, groupTasks.filter(t => activeMoods.has(t.completed_mood)).length)
                  const y = yPos(hour) + (Math.sin(idx * 1.7) * 4)
                  return (
                    <circle
                      key={`${key}-${idx}`}
                      cx={x} cy={y} r={6}
                      fill={colour}
                      fillOpacity={0.75}
                      stroke="white"
                      strokeWidth={1.5}
                    >
                      <title>{task.completed_mood} — {new Date(task.completed_at).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} {new Date(task.completed_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</title>
                    </circle>
                  )
                })
              })}

            </svg>
          </div>
        )}

        {/* Time estimation section */}
        <h2 className="text-lg font-semibold text-gray-900 mt-10 mb-1">Time estimation</h2>
        <p className="text-sm text-gray-500 mb-4">
          How well do your time estimates match reality? The bar shows actual time — the grey line marks your estimate.
        </p>

        {timedFiltered.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">No timed tasks yet — use &quot;I&apos;ll do this&quot; on a task, set a duration, and complete it.</p>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Timed tasks</p>
                <p className="text-2xl font-bold text-gray-900">{timedFiltered.length}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Average over/under</p>
                {avgDiff !== null && (
                  <p className={`text-2xl font-bold ${avgDiff > 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {avgDiff > 0 ? '+' : ''}{Math.round(avgDiff)} min
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {avgDiff === null ? '—' : avgDiff > 5 ? 'You tend to underestimate' : avgDiff < -5 ? 'You tend to overestimate' : 'Pretty accurate'}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Biggest underestimate mood</p>
                {moodAvgs.length > 0 && moodAvgs[0].avg > 0 ? (
                  <>
                    <p className="text-lg font-bold" style={{ color: moodColour(moodAvgs[0].mood) }}>{moodAvgs[0].mood}</p>
                    <p className="text-xs text-gray-400 mt-1">+{Math.round(moodAvgs[0].avg)} min over on average</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 mt-1">No overruns yet</p>
                )}
              </div>
            </div>

            {/* Per-task bars */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
              {timedFiltered.slice(0, 20).map((t, i) => {
                const overrun = t.actual_minutes > t.estimated_minutes
                const colour = t.completed_mood ? moodColour(t.completed_mood) : '#6366f1'
                const actPct = Math.min((t.actual_minutes / maxMinutes) * 100, 100)
                const estPct = (t.estimated_minutes / maxMinutes) * 100
                const dateStr = new Date(t.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 font-medium truncate max-w-xs">{t.title}</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 h-5 bg-gray-100 rounded">
                        {/* Actual bar */}
                        <div
                          style={{ width: `${actPct}%`, background: overrun ? '#ef4444' : colour, opacity: 0.8 }}
                          className="absolute left-0 top-0 bottom-0 rounded"
                        />
                        {/* Estimated marker */}
                        <div
                          style={{ left: `${estPct}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
                        />
                        {/* Adjustment markers */}
                        {t.time_adjustments?.map((adj, ai) => {
                          const pct = Math.min(((adj.atSecs / 60) / maxMinutes) * 100, 99)
                          const isAdd = adj.delta > 0
                          return (
                            <div
                              key={ai}
                              style={{ left: `${pct}%` }}
                              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-20"
                              title={`${isAdd ? '+' : ''}${adj.delta} min at ${Math.floor(adj.atSecs / 60)}m${adj.atSecs % 60 > 0 ? `${adj.atSecs % 60}s` : ''}`}
                            >
                              <span
                                style={{ left: '2px' }}
                                className={`absolute -top-0.5 text-[9px] font-bold leading-none ${isAdd ? 'text-amber-600' : 'text-blue-500'}`}
                              >
                                {isAdd ? '+' : ''}{adj.delta}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      <span className={`text-xs font-medium flex-shrink-0 w-28 text-right ${overrun ? 'text-red-500' : 'text-gray-500'}`}>
                        {t.actual_minutes} min (est {t.estimated_minutes})
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </>
  )
}
