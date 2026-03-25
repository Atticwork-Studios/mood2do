'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import NavBar from '@/app/components/NavBar'
import DistractionBox from '@/app/components/DistractionBox'
import TimerWidget from '@/app/components/TimerWidget'
import { createClient } from '@/lib/supabase/client'
import { getUserMoods } from '@/lib/getUserMoods'
import { taskAgeDays, daysAway } from '@/lib/taskUtils'
import DeadlineTimeline from '@/app/components/DeadlineTimeline'

type Task = {
  id: string
  title: string
  mood_tags: string[]
  deadline: string | null
  completed: boolean
  notes: string | null
  recurrence_rule: string | null
  recurrence_parent_id: string | null
  created_at: string
  snoozed_until: string | null
  important: boolean
  last_surfaced: string | null
}

function getRecurringDueNow(tasks: Task[]): Task[] {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Start of week (Monday)
  const dow = (today.getDay() + 6) % 7
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - dow)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const weekEndStr = weekEnd.toISOString().split('T')[0]

  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const monthEndStr = monthEnd.toISOString().split('T')[0]
  const yearEndStr = `${today.getFullYear()}-12-31`

  // Only recurring tasks
  const recurring = tasks.filter(t => t.recurrence_parent_id)

  // Deduplicate: one per parent — prefer the nearest upcoming deadline
  const nextPerParent = new Map<string, Task>()
  for (const t of recurring) {
    const key = t.recurrence_parent_id!
    const existing = nextPerParent.get(key)
    if (!existing) { nextPerParent.set(key, t); continue }
    const tDue = t.deadline ?? ''
    const exDue = existing.deadline ?? ''
    const tUp = tDue >= todayStr
    const exUp = exDue >= todayStr
    if (tUp && exUp) { if (tDue < exDue) nextPerParent.set(key, t) }
    else if (tUp && !exUp) { nextPerParent.set(key, t) }
    else if (!tUp && !exUp) { if (tDue > exDue) nextPerParent.set(key, t) }
  }

  // Filter to tasks due within their rule's relevant window
  return Array.from(nextPerParent.values()).filter(t => {
    const d = t.deadline ?? ''
    if (!d) return false
    switch (t.recurrence_rule) {
      case 'hourly':
      case 'daily':   return d <= todayStr
      case 'weekly':  return d >= todayStr && d <= weekEndStr
      case 'monthly': return d >= todayStr && d <= monthEndStr
      case 'yearly':  return d >= todayStr && d <= yearEndStr
      default: return false
    }
  })
}

const MOOD_STYLES: Record<string, { panelBg: string; panelBorder: string; heading: string; subtext: string; hex: string }> = {
  Focussed:   { panelBg: '#eef2ff', panelBorder: '#c7d2fe', heading: '#3730a3', subtext: '#4338ca', hex: '#6366f1' },
  Bored:      { panelBg: '#fffbeb', panelBorder: '#fde68a', heading: '#92400e', subtext: '#b45309', hex: '#f59e0b' },
  Distracted: { panelBg: '#fdf2f8', panelBorder: '#fbcfe8', heading: '#831843', subtext: '#9d174d', hex: '#ec4899' },
  Anxious:    { panelBg: '#fff7ed', panelBorder: '#fed7aa', heading: '#9a3412', subtext: '#c2410c', hex: '#f97316' },
  Creative:   { panelBg: '#f5f3ff', panelBorder: '#ddd6fe', heading: '#4c1d95', subtext: '#6d28d9', hex: '#8b5cf6' },
  Energised:  { panelBg: '#ecfdf5', panelBorder: '#a7f3d0', heading: '#064e3b', subtext: '#065f46', hex: '#10b981' },
  Tired:      { panelBg: '#f8fafc', panelBorder: '#e2e8f0', heading: '#334155', subtext: '#475569', hex: '#94a3b8' },
}

const DEFAULT_MOOD_STYLE = { panelBg: '#eef2ff', panelBorder: '#c7d2fe', heading: '#3730a3', subtext: '#4338ca', hex: '#6366f1' }

export default function Dashboard({ category }: { category: 'work' | 'personal' }) {
  const label = category === 'work' ? 'Work' : 'Personal'

  const [tasks, setTasks] = useState<Task[]>([])
  const [completedToday, setCompletedToday] = useState<Task[]>([])
  const [moods, setMoods] = useState<string[]>([])
  const [taskCount, setTaskCount] = useState(5)
  const [plan, setPlan] = useState<'free' | 'pro'>('free')
  const [loading, setLoading] = useState(true)

  // Mood / day plan
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const [activeMood, setActiveMood] = useState<string | null>(null)
  const [dayPlan, setDayPlan] = useState<Task[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Brain dump
  const [dumpInput, setDumpInput] = useState('')
  const [dumpSaving, setDumpSaving] = useState(false)

  // Snooze
  const [snoozeTaskId, setSnoozeTaskId] = useState<string | null>(null)

  // Pattern nudge
  const [suggestedMood, setSuggestedMood] = useState<string | null>(null)

  // Needs attention (important tasks force-surfaced this session)
  const [needsAttentionIds, setNeedsAttentionIds] = useState<Set<string>>(new Set())

  // Inline edit
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editMoodTags, setEditMoodTags] = useState<string[]>([])
  const [editDeadline, setEditDeadline] = useState('')

  // Task timer
  const [durationTaskId, setDurationTaskId] = useState<string | null>(null)
  const [durationInput, setDurationInput] = useState('')
  const [activeTimer, setActiveTimer] = useState<{ taskId: string; startTime: number; estimatedMinutes: number } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [overdue, setOverdue] = useState(false)
  const [paused, setPaused] = useState(false)
  const [pausedElapsed, setPausedElapsed] = useState(0)
  const [adjustments, setAdjustments] = useState<{ delta: number; atSecs: number }[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const sessionRestoredRef = useRef(false)

  const loadTasks = useCallback(async () => {
    const supabase = createClient()
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayStr = new Date().toISOString().split('T')[0]
    const [{ data }, { data: done }] = await Promise.all([
      supabase.from('tasks').select('*').eq('category', category).eq('completed', false)
        .or(`snoozed_until.is.null,snoozed_until.lte.${todayStr}`)
        .order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').eq('category', category).eq('completed', true).gte('completed_at', todayStart.toISOString()).order('completed_at', { ascending: false }),
    ])
    setTasks(data ?? [])
    setCompletedToday(done ?? [])
    setLoading(false)
  }, [category])

  useEffect(() => {
    loadTasks()
    getUserMoods().then(setMoods)
    createClient().from('profiles').select('task_count, plan').single().then(({ data }) => {
      if (data?.task_count) setTaskCount(data.task_count)
      if (data?.plan) setPlan(data.plan as 'free' | 'pro')
    })

    // Pattern nudge — find the most common mood at this day+hour
    async function loadNudge() {
      const supabase = createClient()
      const { data } = await supabase
        .from('tasks')
        .select('completed_mood, completed_at')
        .eq('completed', true)
        .not('completed_mood', 'is', null)
        .not('completed_at', 'is', null)
      if (!data || data.length < 10) return // not enough data yet
      const now = new Date()
      const currentDow = (now.getDay() + 6) % 7 // Mon=0
      const currentHour = now.getHours()
      // Count moods within ±1 hour on the same day of week
      const counts: Record<string, number> = {}
      data.forEach(t => {
        const d = new Date(t.completed_at)
        const dow = (d.getDay() + 6) % 7
        const hour = d.getHours()
        if (dow === currentDow && Math.abs(hour - currentHour) <= 1) {
          counts[t.completed_mood] = (counts[t.completed_mood] ?? 0) + 1
        }
      })
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
      if (top && top[1] >= 3) setSuggestedMood(top[0]) // only nudge if 3+ data points
    }
    loadNudge()

    // Restore timer from localStorage
    try {
      const saved = localStorage.getItem('activeTimer')
      if (saved) {
        const { taskId, startTime, estimatedMinutes, paused: wasPaused, pausedElapsed: savedPausedElapsed, adjustments: savedAdj } = JSON.parse(saved)
        setActiveTimer({ taskId, startTime, estimatedMinutes })
        if (savedAdj) setAdjustments(savedAdj)
        if (wasPaused) {
          setPaused(true)
          setPausedElapsed(savedPausedElapsed)
          setElapsed(savedPausedElapsed)
        } else {
          setElapsed(Math.floor((Date.now() - startTime) / 1000))
        }
      }
    } catch { /* ignore corrupt storage */ }
  }, [loadTasks])

  // Restore mood + day plan from sessionStorage once tasks have loaded
  useEffect(() => {
    if (sessionRestoredRef.current || tasks.length === 0) return
    try {
      const saved = sessionStorage.getItem(`dashboard-${category}`)
      if (saved) {
        const { mood, taskIds } = JSON.parse(saved)
        const restored = tasks.filter(t => (taskIds as string[]).includes(t.id))
        if (restored.length > 0) {
          setActiveMood(mood)
          setDayPlan(restored)
        } else if (mood) {
          setActiveMood(mood)
        }
      }
    } catch { /* ignore corrupt storage */ }
    sessionRestoredRef.current = true
  }, [tasks, category])

  // Timer tick
  useEffect(() => {
    if (!activeTimer || paused) { if (timerRef.current) clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - activeTimer.startTime) / 1000)
      setElapsed(secs)
      if (secs >= activeTimer.estimatedMinutes * 60) setOverdue(true)
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeTimer, paused])

  function pauseTimer() {
    setPausedElapsed(elapsed)
    setPaused(true)
    if (activeTimer) {
      localStorage.setItem('activeTimer', JSON.stringify({ ...activeTimer, paused: true, pausedElapsed: elapsed }))
    }
  }

  function resumeTimer() {
    if (!activeTimer) return
    const newStartTime = Date.now() - pausedElapsed * 1000
    const updated = { ...activeTimer, startTime: newStartTime }
    setActiveTimer(updated)
    setPaused(false)
    localStorage.setItem('activeTimer', JSON.stringify({ ...updated, paused: false, pausedElapsed: 0 }))
  }

  function addMinutes(mins: number) {
    if (!activeTimer) return
    const updated = Math.max(1, activeTimer.estimatedMinutes + mins)
    const newTimer = { ...activeTimer, estimatedMinutes: updated }
    const newAdj = [...adjustments, { delta: mins, atSecs: elapsed }]
    setActiveTimer(newTimer)
    setAdjustments(newAdj)
    setOverdue(false)
    localStorage.setItem('activeTimer', JSON.stringify({ ...newTimer, paused, pausedElapsed, adjustments: newAdj }))
  }

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current)
    setActiveTimer(null)
    setElapsed(0)
    setOverdue(false)
    setPaused(false)
    setPausedElapsed(0)
    setAdjustments([])
    localStorage.removeItem('activeTimer')
  }

  function formatElapsed(secs: number) {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function startTimer(taskId: string) {
    const mins = parseInt(durationInput)
    if (!mins || mins < 1) return
    const timer = { taskId, startTime: Date.now(), estimatedMinutes: mins }
    setActiveTimer(timer)
    setAdjustments([])
    setDurationTaskId(null)
    setDurationInput('')
    setOverdue(false)
    localStorage.setItem('activeTimer', JSON.stringify({ ...timer, paused: false, pausedElapsed: 0, adjustments: [] }))
  }

  async function handleComplete(id: string) {
    const supabase = createClient()
    const isTimedTask = activeTimer?.taskId === id
    const actualMinutes = isTimedTask ? Math.round(elapsed / 60) : null
    const estimatedMinutes = isTimedTask ? activeTimer!.estimatedMinutes : null
    await supabase.from('tasks').update({
      completed: true,
      completed_at: new Date().toISOString(),
      completed_mood: activeMood ?? null,
      ...(isTimedTask && { estimated_minutes: estimatedMinutes, actual_minutes: actualMinutes, time_adjustments: adjustments.length > 0 ? adjustments : null }),
    }).eq('id', id)
    if (isTimedTask) {
      if (timerRef.current) clearInterval(timerRef.current)
      setActiveTimer(null)
      setOverdue(false)
      setAdjustments([])
      localStorage.removeItem('activeTimer')
    }
    const completed = tasks.find(t => t.id === id) ?? dayPlan.find(t => t.id === id)
    if (completed) setCompletedToday(prev => [completed, ...prev])
    setTasks(prev => prev.filter(t => t.id !== id))
    setDayPlan(prev => prev.filter(t => t.id !== id))
  }

  async function handleDump(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = dumpInput.trim()
    if (!trimmed) return
    setDumpSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: newTask } = await supabase.from('tasks').insert({
        user_id: user.id, title: trimmed, category, mood_tags: [], completed: false,
      }).select().single()
      if (newTask) setTasks(prev => [newTask, ...prev])
    }
    setDumpInput('')
    setDumpSaving(false)
  }

  async function handleSnooze(taskId: string, days: number) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    const date = d.toISOString().split('T')[0]
    const supabase = createClient()
    await supabase.from('tasks').update({ snoozed_until: date }).eq('id', taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setDayPlan(prev => prev.filter(t => t.id !== taskId))
    setSnoozeTaskId(null)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditMoodTags(task.mood_tags)
    setEditDeadline(task.deadline ?? '')
  }

  async function handleUpdate() {
    if (!editingTask) return
    const supabase = createClient()
    const updates = { title: editTitle.trim(), mood_tags: editMoodTags, deadline: editDeadline || null }
    await supabase.from('tasks').update(updates).eq('id', editingTask.id)
    const updated = { ...editingTask, ...updates }
    setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t))
    setDayPlan(prev => prev.map(t => t.id === editingTask.id ? updated : t))
    setEditingTask(null)
  }

  async function toggleImportant(task: Task) {
    const supabase = createClient()
    const next = !task.important
    await supabase.from('tasks').update({ important: next }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, important: next } : t))
    setDayPlan(prev => prev.map(t => t.id === task.id ? { ...t, important: next } : t))
  }

  function getOverdueImportant(pool: Task[]): Task[] {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cutoff = sevenDaysAgo.toISOString().split('T')[0]
    return pool.filter(t =>
      !t.recurrence_parent_id &&
      t.important &&
      (!t.last_surfaced || t.last_surfaced <= cutoff)
    )
  }

  async function surfaceImportant(forced: Task[]) {
    if (forced.length === 0) return
    const todayStr = new Date().toISOString().split('T')[0]
    const supabase = createClient()
    const ids = forced.map(t => t.id)
    await supabase.from('tasks').update({ last_surfaced: todayStr }).in('id', ids)
    setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, last_surfaced: todayStr } : t))
    setNeedsAttentionIds(new Set(ids))
  }

  function pickMood(mood: string) {
    const overdue = getOverdueImportant(tasks)
    const overdueIds = new Set(overdue.map(t => t.id))
    const matching = tasks
      .filter(t => !t.recurrence_parent_id && t.mood_tags.includes(mood) && !overdueIds.has(t.id))
      .sort(() => Math.random() - 0.5)
    const plan = [...overdue, ...matching].slice(0, taskCount)
    setActiveMood(mood)
    setDayPlan(plan)
    setShowMoodPicker(false)
    surfaceImportant(overdue.filter(t => plan.find(p => p.id === t.id)))
    sessionStorage.setItem(`dashboard-${category}`, JSON.stringify({ mood, taskIds: plan.map(t => t.id) }))
  }

  function reroll() {
    if (!activeMood) return
    const overdue = getOverdueImportant(tasks)
    const overdueIds = new Set(overdue.map(t => t.id))
    const pool = tasks
      .filter(t => !t.recurrence_parent_id && t.mood_tags.includes(activeMood) && !overdueIds.has(t.id))
      .sort(() => Math.random() - 0.5)
    const plan = [...overdue, ...pool].slice(0, taskCount)
    setDayPlan(plan)
    surfaceImportant(overdue.filter(t => plan.find(p => p.id === t.id)))
    sessionStorage.setItem(`dashboard-${category}`, JSON.stringify({ mood: activeMood, taskIds: plan.map(t => t.id) }))
  }

  const recurringDue = getRecurringDueNow(tasks)


  if (loading) return (
    <>
      <NavBar />
      <div className="p-8 text-gray-600">Loading…</div>
    </>
  )

  return (
    <>
      <NavBar />
      <main className="w-full max-w-5xl mx-auto px-8 py-8">

        {/* Timer & Distraction side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <TimerWidget taskTimer={activeTimer ? {
            taskTitle: [...dayPlan, ...recurringDue].find(t => t.id === activeTimer.taskId)?.title ?? 'Task',
            elapsed,
            paused,
            overdue,
            estimatedMinutes: activeTimer.estimatedMinutes,
            onPause: pauseTimer,
            onResume: resumeTimer,
            onStop: stopTimer,
            onComplete: () => handleComplete(activeTimer.taskId),
            onAddMinutes: addMinutes,
          } : null} />
          <DistractionBox />
        </div>


        {/* Brain dump */}
        {plan === 'free' && tasks.length >= 25 ? (
          <div className="flex items-center gap-3 mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <p className="text-sm text-amber-700 flex-1">
              You&apos;ve reached the 25 task limit on the free plan.
            </p>
            <a href="/pricing" className="text-sm font-semibold text-amber-800 underline hover:text-amber-900 flex-shrink-0">
              Upgrade to Pro →
            </a>
          </div>
        ) : (
        <form onSubmit={handleDump} className="flex gap-2 mb-6">
          <input
            type="text"
            value={dumpInput}
            onChange={e => setDumpInput(e.target.value)}
            placeholder="Quick capture — type a task and hit Enter to save it instantly"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={dumpSaving || !dumpInput.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40"
          >
            Capture
          </button>
        </form>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <h1 style={{ flex: 1 }} className="text-2xl font-bold text-gray-900">{label}</h1>
          <button
            onClick={() => setShowMoodPicker(true)}
            style={{ background: 'var(--grain-primary)' }}
            className="text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
          >
            Go with your mood!
          </button>
        </div>

        {/* Mood-matched tasks */}
        {activeMood && (() => {
          const ms = MOOD_STYLES[activeMood] ?? DEFAULT_MOOD_STYLE
          return (
          <div style={{ background: ms.panelBg, borderColor: ms.panelBorder }} className="border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-1">
              <h2 style={{ color: ms.heading }} className="font-semibold">Feeling {activeMood}</h2>
              <div className="flex items-center gap-2">
                {suggestedMood && suggestedMood !== activeMood && (
                  <button
                    onClick={() => pickMood(suggestedMood)}
                    style={{ background: (MOOD_STYLES[suggestedMood] ?? DEFAULT_MOOD_STYLE).panelBg, borderColor: (MOOD_STYLES[suggestedMood] ?? DEFAULT_MOOD_STYLE).panelBorder, color: (MOOD_STYLES[suggestedMood] ?? DEFAULT_MOOD_STYLE).heading }}
                    className="text-xs border px-2 py-1 rounded-lg hover:opacity-80"
                    title="Switch based on your historical patterns"
                  >
                    Your data says: {suggestedMood} →
                  </button>
                )}
              </div>
            </div>

            {dayPlan.length === 0 ? (
              <p style={{ color: ms.subtext }} className="text-sm mt-2">
                No tasks tagged <strong>{activeMood}</strong> yet.{' '}
                <Link href="/tasks" className="underline">Add one?</Link>
              </p>
            ) : (
              <>
                <p style={{ color: ms.subtext }} className="text-xs mb-3">Tick a task when you&apos;ve done it. Hit Nope to swap the whole list.</p>
                <ul className="space-y-2 mb-4">
                  {dayPlan.map(task => (
                    <li key={task.id} className="bg-white rounded-lg px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleComplete(task.id)}
                          className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0 transition-colors"
                          title="Mark as done"
                        />
                        <button
                          type="button"
                          onClick={() => task.notes && setExpandedId(expandedId === task.id ? null : task.id)}
                          className={`text-sm text-gray-900 flex-1 text-left flex items-center gap-1 ${task.notes ? 'cursor-pointer hover:text-indigo-700' : 'cursor-default'}`}
                        >
                          <span className="flex-1">{task.title}</span>
                          {task.notes && (
                            <span className="text-xs text-gray-400">{expandedId === task.id ? '▲' : '▼'}</span>
                          )}
                        </button>

                        {needsAttentionIds.has(task.id) && (
                          <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full flex-shrink-0">
                            Needs attention
                          </span>
                        )}

                        {taskAgeDays(task.created_at) >= 7 && (
                          <span className="text-xs text-orange-500 flex-shrink-0" title={`Added ${taskAgeDays(task.created_at)} days ago`}>
                            {taskAgeDays(task.created_at)}d
                          </span>
                        )}

                        <button
                          onClick={() => openEdit(task)}
                          className="text-xs text-gray-400 hover:text-indigo-600 px-1 flex-shrink-0"
                          title="Edit task"
                        >✎</button>

                        <button
                          onClick={() => setSnoozeTaskId(snoozeTaskId === task.id ? null : task.id)}
                          className="text-xs text-gray-400 hover:text-amber-500 px-1 flex-shrink-0"
                          title="Not today"
                        >💤</button>

                        {/* Snooze picker */}
                        {snoozeTaskId === task.id && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {[['Tomorrow', 1], ['3 days', 3], ['1 week', 7]].map(([label, days]) => (
                              <button
                                key={label}
                                onClick={() => handleSnooze(task.id, days as number)}
                                className="text-xs bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded-lg hover:bg-amber-100"
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* I'll do this / duration picker */}
                        {durationTaskId === task.id ? (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <input
                              type="number" min={1} max={240}
                              value={durationInput}
                              onChange={e => setDurationInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && startTimer(task.id)}
                              placeholder="mins" autoFocus
                              className="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                            <button onClick={() => startTimer(task.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Start</button>
                            <button onClick={() => setDurationTaskId(null)} className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
                          </div>
                        ) : activeTimer?.taskId === task.id ? (
                          <span className="text-xs text-indigo-600 font-medium flex-shrink-0">Timing ↗</span>
                        ) : !activeTimer && (
                          <button
                            onClick={() => setDurationTaskId(task.id)}
                            className="text-xs border border-indigo-200 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 flex-shrink-0"
                          >
                            I&apos;ll do this
                          </button>
                        )}
                      </div>

                      {task.notes && expandedId === task.id && (
                        <div
                          className="mt-2 ml-8 text-xs text-gray-500 prose prose-xs max-w-none [&_p]:my-0.5"
                          dangerouslySetInnerHTML={{ __html: task.notes }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={reroll}
                  style={{ borderColor: ms.panelBorder, color: ms.subtext }}
                  className="text-sm bg-white border px-4 py-2 rounded-lg hover:opacity-80 font-medium"
                >
                  Nope — give me different ones
                </button>
              </>
            )}
          </div>
          )
        })()}

        {/* Recurring tasks due now */}
        {recurringDue.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <h2 className="font-semibold text-amber-900 mb-1">Upcoming repeating tasks</h2>
            <p className="text-xs text-amber-700 mb-3">These repeat regularly — tick them off when done.</p>
            <ul className="space-y-2">
              {recurringDue.map(task => (
                <li key={task.id} className="bg-white rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0 transition-colors"
                      title="Mark as done"
                    />
                    <button
                      type="button"
                      onClick={() => task.notes && setExpandedId(expandedId === task.id ? null : task.id)}
                      className={`text-sm text-gray-900 flex-1 text-left flex items-center gap-1 ${task.notes ? 'cursor-pointer hover:text-indigo-700' : 'cursor-default'}`}
                    >
                      <span className="flex-1">{task.title}</span>
                      {task.notes && (
                        <span className="text-xs text-gray-400">{expandedId === task.id ? '▲' : '▼'}</span>
                      )}
                    </button>
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      {task.recurrence_rule}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{daysAway(task.deadline)}</span>

                    {durationTaskId === task.id ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <input
                          type="number" min={1} max={240}
                          value={durationInput}
                          onChange={e => setDurationInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && startTimer(task.id)}
                          placeholder="mins" autoFocus
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                        <button onClick={() => startTimer(task.id)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">Start</button>
                        <button onClick={() => setDurationTaskId(null)} className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100">Cancel</button>
                      </div>
                    ) : activeTimer?.taskId === task.id ? (
                      <span className="text-xs text-indigo-600 font-medium flex-shrink-0">Timing ↗</span>
                    ) : !activeTimer && (
                      <button
                        onClick={() => setDurationTaskId(task.id)}
                        className="text-xs border border-indigo-200 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 flex-shrink-0"
                      >
                        I&apos;ll do this
                      </button>
                    )}
                  </div>

                  {task.notes && expandedId === task.id && (
                    <div
                      className="mt-2 ml-8 text-xs text-gray-500 prose prose-xs max-w-none [&_p]:my-0.5"
                      dangerouslySetInnerHTML={{ __html: task.notes }}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {tasks.length === 0 && !activeMood && recurringDue.length === 0 && (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-10 text-center mb-6">
            <p className="text-2xl mb-3">👋</p>
            <h2 className="text-base font-semibold text-gray-800 mb-1">No tasks here yet</h2>
            <p className="text-sm text-gray-400 mb-5">
              Use the box above to capture a task, or head to your full task list to add and tag them.
            </p>
            <a
              href="/tasks"
              className="inline-block text-sm font-semibold text-white px-5 py-2 rounded-lg hover:opacity-90"
              style={{ background: 'var(--grain-primary)' }}
            >
              Go to task list →
            </a>
          </div>
        )}

        <DeadlineTimeline category={category} />

        {/* What did I do today */}
        {completedToday.length > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="font-semibold text-green-900 mb-1">
              Done today — {completedToday.length} task{completedToday.length !== 1 ? 's' : ''} ✓
            </h2>
            <p className="text-xs text-green-700 mb-3">Here&apos;s what you&apos;ve achieved so far today.</p>
            <ul className="space-y-1">
              {completedToday.map(task => (
                <li key={task.id} className="flex items-center gap-2 text-sm text-green-800">
                  <span className="text-green-500 flex-shrink-0">✓</span>
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      </main>

      {/* Mood picker modal */}
      {showMoodPicker && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-1">How are you feeling right now?</h2>
            <p className="text-sm text-gray-500 mb-6">I&apos;ll find tasks that match your energy, not your whole day.</p>
            <div className="grid grid-cols-2 gap-3">
              {moods.map(mood => (
                <button
                  key={mood}
                  onClick={() => pickMood(mood)}
                  style={{
                    background: (MOOD_STYLES[mood] ?? DEFAULT_MOOD_STYLE).panelBg,
                    borderColor: (MOOD_STYLES[mood] ?? DEFAULT_MOOD_STYLE).panelBorder,
                    color: (MOOD_STYLES[mood] ?? DEFAULT_MOOD_STYLE).heading,
                  }}
                  className="border font-medium py-3 rounded-xl text-sm hover:opacity-80 transition-opacity"
                >
                  {mood}
                </button>
              ))}
            </div>
            <button onClick={() => setShowMoodPicker(false)} className="mt-5 w-full text-sm border border-gray-200 text-gray-500 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit task modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit task</h2>

            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <label className="block text-xs font-medium text-gray-600 mb-2">Mood tags</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {moods.map(mood => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => setEditMoodTags(prev =>
                    prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
                  )}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    editMoodTags.includes(mood)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium text-gray-600 mb-1">Deadline (optional)</label>
            <input
              type="date"
              value={editDeadline}
              onChange={e => setEditDeadline(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />

            <div className="flex gap-3 mb-3">
              <button
                onClick={handleUpdate}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
            <Link
              href={`/tasks?edit=${editingTask.id}`}
              className="block text-center text-xs text-indigo-600 hover:underline"
            >
              Full edit (notes, recurrence, category) →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
