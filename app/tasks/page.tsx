'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import NavBar from '@/app/components/NavBar'
import RichTextEditor from '@/app/components/RichTextEditor'
import { createClient } from '@/lib/supabase/client'
import { getUserMoods, PRESET_MOODS } from '@/lib/getUserMoods'
import { generateRecurringDates } from '@/lib/taskUtils'

type Task = {
  id: string
  title: string
  category: 'work' | 'personal'
  mood_tags: string[]
  custom_tags: string[]
  deadline: string | null
  completed: boolean
  important: boolean | null
  recurrence_rule: string | null
  recurrence_parent_id: string | null
  notes: string | null
  snoozed_until: string | null
  created_at: string
}

export default function TasksPage() {
  const searchParams = useSearchParams()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [userMoods, setUserMoods] = useState<string[]>([])
  const [plan, setPlan] = useState<'free' | 'pro'>('free')

  // Filters
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [filterCategory, setFilterCategory] = useState<'all' | 'work' | 'personal'>('all')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [filterSearch, setFilterSearch] = useState('')
  const [filterDeadline, setFilterDeadline] = useState(false)
  const [filterSnoozed, setFilterSnoozed] = useState(false)
  const [filterRepeating, setFilterRepeating] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Task[]>([])

  // Add / edit form
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<'work' | 'personal'>('work')
  const [formMoods, setFormMoods] = useState<string[]>([])
  const [formTags, setFormTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [formImportant, setFormImportant] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  // All distinct custom tags in use across tasks (for suggestions)
  const [filterTags, setFilterTags] = useState<string[]>([])

  // Recurring
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [recurrenceStart, setRecurrenceStart] = useState('')
  const [recurrenceEnd, setRecurrenceEnd] = useState('')

  const loadTasks = useCallback(async () => {
    const supabase = createClient()
    const [{ data: active }, { data: done }] = await Promise.all([
      supabase.from('tasks').select('*').eq('completed', false).order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').eq('completed', true).order('created_at', { ascending: false }),
    ])
    setTasks(active ?? [])
    setCompletedTasks(done ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
    getUserMoods().then(setUserMoods)
    createClient().from('profiles').select('plan').single().then(({ data }) => {
      if (data?.plan) setPlan(data.plan as 'free' | 'pro')
    })
  }, [loadTasks])

  // Auto-open edit form if ?edit=taskId is in the URL
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (!editId || tasks.length === 0) return
    const task = tasks.find(t => t.id === editId)
    if (task) openEdit(task)
  // openEdit is defined below but stable — eslint-disable-next-line is fine here
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, searchParams])


  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaveError('Not signed in.'); setSaving(false); return }

    if (isRecurring) {
      if (!recurrenceStart || !recurrenceEnd) {
        setSaveError('Please set both a start and end date for recurring tasks.')
        setSaving(false)
        return
      }
      const dates = generateRecurringDates(recurrenceRule, recurrenceStart, recurrenceEnd)
      if (dates.length === 0) { setSaveError('No dates generated — check your start and end dates.'); setSaving(false); return }
      const parentId = crypto.randomUUID()
      const rows = dates.map(d => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        title,
        category,
        mood_tags: formMoods,
        custom_tags: formTags,
        deadline: d.toISOString().split('T')[0],
        recurrence_rule: recurrenceRule,
        recurrence_parent_id: parentId,
        notes: notes || null,
      }))
      const { error } = await supabase.from('tasks').insert(rows)
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title,
        category,
        mood_tags: formMoods,
        custom_tags: formTags,
        deadline: deadline || null,
        notes: notes || null,
        important: formImportant,
      })
      if (error) { setSaveError(error.message); setSaving(false); return }
    }

    setTitle('')
    setFormMoods([])
    setFormTags([])
    setTagInput('')
    setDeadline('')
    setNotes('')
    setFormImportant(false)
    setIsRecurring(false)
    setRecurrenceStart('')
    setRecurrenceEnd('')
    setShowAdd(false)
    setSaving(false)
    loadTasks()
  }

  async function handleDelete(task: Task) {
    if (task.recurrence_parent_id) {
      setDeleteTarget(task)
      return
    }
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', task.id)
    setTasks(prev => prev.filter(t => t.id !== task.id))
  }

  async function confirmDeleteOne() {
    if (!deleteTarget) return
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', deleteTarget.id)
    setTasks(prev => prev.filter(t => t.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  async function confirmDeleteFuture() {
    if (!deleteTarget) return
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('tasks').delete()
      .eq('recurrence_parent_id', deleteTarget.recurrence_parent_id)
      .gte('deadline', today)
    setTasks(prev => prev.filter(t =>
      !(t.recurrence_parent_id === deleteTarget.recurrence_parent_id && (t.deadline ?? '') >= today)
    ))
    setDeleteTarget(null)
  }

  async function handleComplete(id: string) {
    const supabase = createClient()
    await supabase.from('tasks').update({ completed: true }).eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setCompletedTasks(prev => [...prev, tasks.find(t => t.id === id)!])
  }

  async function handleUncomplete(id: string) {
    const supabase = createClient()
    await supabase.from('tasks').update({ completed: false }).eq('id', id)
    const task = completedTasks.find(t => t.id === id)!
    setCompletedTasks(prev => prev.filter(t => t.id !== id))
    setTasks(prev => [task, ...prev])
  }

  async function handleUnsnooze(id: string) {
    const supabase = createClient()
    await supabase.from('tasks').update({ snoozed_until: null }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, snoozed_until: null } : t))
  }

  function openEdit(task: Task) {
    setEditingId(task.id)
    setTitle(task.title)
    setCategory(task.category)
    setFormMoods(task.mood_tags)
    setFormTags(task.custom_tags ?? [])
    setTagInput('')
    setDeadline(task.deadline ?? '')
    setNotes(task.notes ?? '')
    setFormImportant(task.important ?? false)
    setIsRecurring(false)
    setShowAdd(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function closeEdit() {
    setEditingId(null)
    setTitle('')
    setFormMoods([])
    setFormTags([])
    setTagInput('')
    setDeadline('')
    setNotes('')
    setSaveMessage('')
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tag = tagInput.trim().toLowerCase()
      if (tag && !formTags.includes(tag)) setFormTags(prev => [...prev, tag])
      setTagInput('')
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId) return
    setSaving(true)
    setSaveError('')
    setSaveMessage('')
    const supabase = createClient()

    if (isRecurring) {
      if (!recurrenceStart || !recurrenceEnd) {
        setSaveError('Please set both a start and end date.')
        setSaving(false)
        return
      }
      const dates = generateRecurringDates(recurrenceRule, recurrenceStart, recurrenceEnd)
      if (dates.length === 0) { setSaveError('No dates generated — check your dates.'); setSaving(false); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setSaveError('Not signed in.'); setSaving(false); return }
      // Delete the original single task then insert the series
      await supabase.from('tasks').delete().eq('id', editingId)
      const parentId = crypto.randomUUID()
      const rows = dates.map(d => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        title,
        category,
        mood_tags: formMoods,
        deadline: d.toISOString().split('T')[0],
        recurrence_rule: recurrenceRule,
        recurrence_parent_id: parentId,
        notes: notes || null,
      }))
      const { error } = await supabase.from('tasks').insert(rows)
      if (error) { setSaveError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('tasks').update({
        title,
        category,
        mood_tags: formMoods,
        custom_tags: formTags,
        deadline: deadline || null,
        notes: notes || null,
        important: formImportant,
      }).eq('id', editingId)
      if (error) { setSaveError(error.message); setSaving(false); return }
    }

    setSaving(false)
    closeEdit()
    loadTasks()
  }

  function toggleMood(mood: string) {
    setFormMoods(prev => prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood])
  }

  // All distinct custom tags currently in use (auto-cleans when no tasks use them)
  const allTags = Array.from(new Set(tasks.flatMap(t => t.custom_tags ?? []))).sort()

  const filtered = (() => {
    const today = new Date().toISOString().split('T')[0]

    // For recurring series, keep only the next upcoming instance per parent
    const nextPerParent = new Map<string, Task>()
    for (const t of tasks) {
      if (!t.recurrence_parent_id) continue
      const existing = nextPerParent.get(t.recurrence_parent_id)
      const tDue = t.deadline ?? ''
      const existingDue = existing?.deadline ?? ''
      // Prefer the earliest deadline that is >= today; fall back to most recent overdue
      if (!existing) {
        nextPerParent.set(t.recurrence_parent_id, t)
      } else {
        const tUpcoming = tDue >= today
        const existingUpcoming = existingDue >= today
        if (tUpcoming && existingUpcoming) {
          if (tDue < existingDue) nextPerParent.set(t.recurrence_parent_id, t)
        } else if (tUpcoming && !existingUpcoming) {
          nextPerParent.set(t.recurrence_parent_id, t)
        } else if (!tUpcoming && !existingUpcoming) {
          if (tDue > existingDue) nextPerParent.set(t.recurrence_parent_id, t)
        }
      }
    }

    return tasks.filter(t => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false
      if (filterMood && !t.mood_tags.includes(filterMood)) return false
      if (filterSearch && !t.title.toLowerCase().includes(filterSearch.toLowerCase())) return false
      if (filterDeadline && !t.deadline) return false
      if (filterSnoozed && !t.snoozed_until) return false
      if (filterRepeating && !t.recurrence_parent_id) return false
      if (filterTags.length > 0 && !filterTags.some(tag => (t.custom_tags ?? []).includes(tag))) return false
      // For recurring tasks, only show the representative instance
      if (t.recurrence_parent_id) {
        return nextPerParent.get(t.recurrence_parent_id)?.id === t.id
      }
      return true
    })
  })()

  return (
    <>
      <NavBar />
      <main className="w-full max-w-5xl mx-auto px-8 py-8">

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', width: '100%' }}>
          <h1 style={{ flex: 1 }} className="text-2xl font-bold text-gray-900">Task list</h1>
          {plan === 'free' && tasks.length >= 25 ? (
            <div className="text-right">
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                You&apos;ve reached the 25 task limit on the free plan.{' '}
                <a href="/pricing" className="font-semibold underline hover:text-amber-900">Upgrade to Pro →</a>
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(v => !v)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
            >
              + Add task
            </button>
          )}
        </div>

        {/* Add task form */}
        {showAdd && (
          <form onSubmit={handleAdd} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">New task</h2>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-1">What&apos;s the task?</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Write up meeting notes"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
              <div className="flex gap-2">
                {(['work', 'personal'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                      category === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Which moods suit this task?</label>
              <div className="flex flex-wrap gap-2">
                {userMoods.map(mood => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      formMoods.includes(mood)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Tags <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {tag}
                    <button type="button" onClick={() => setFormTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-500">×</button>
                  </span>
                ))}
                {allTags.filter(t => !formTags.includes(t)).map(tag => (
                  <button key={tag} type="button" onClick={() => setFormTags(prev => [...prev, tag])}
                    className="px-2 py-0.5 rounded-full text-xs border border-dashed border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-600">
                    + {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a new tag and press Enter…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <RichTextEditor value={notes} onChange={setNotes} placeholder="Add any extra detail…" />
            </div>

            {/* Recurring toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm font-semibold text-gray-800">Repeating task</span>
              </label>
            </div>

            {!isRecurring ? (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Deadline <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ) : (
              <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Repeat every</label>
                  <div className="flex flex-wrap gap-2">
                    {(['hourly', 'daily', 'weekly', 'monthly', 'yearly'] as const).map(rule => (
                      <button
                        key={rule}
                        type="button"
                        onClick={() => setRecurrenceRule(rule)}
                        className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                          recurrenceRule === rule
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {rule.charAt(0).toUpperCase() + rule.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Start date</label>
                    <input
                      type="date"
                      value={recurrenceStart}
                      onChange={e => setRecurrenceStart(e.target.value)}
                      required={isRecurring}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">End date</label>
                    <input
                      type="date"
                      value={recurrenceEnd}
                      onChange={e => setRecurrenceEnd(e.target.value)}
                      required={isRecurring}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
                {recurrenceStart && recurrenceEnd && (
                  <p className="text-xs text-indigo-600">
                    This will create {generateRecurringDates(recurrenceRule, recurrenceStart, recurrenceEnd).length} tasks.
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={formImportant}
                  onChange={e => setFormImportant(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-800">⭐ Remind me of this at least once a week</span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-7">This task will always appear in your mood list if it hasn&apos;t shown up in 7 days.</p>
            </div>

            {saveError && <p className="text-sm text-red-500 mb-2">{saveError}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save task'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Edit task form */}
        {editingId && (
          <form onSubmit={handleUpdate} className="bg-white border border-indigo-300 rounded-xl p-5 mb-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Edit task</h2>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-1">What&apos;s the task?</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Category</label>
              <div className="flex gap-2">
                {(['work', 'personal'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm border font-medium transition-colors ${
                      category === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-2">Which moods suit this task?</label>
              <div className="flex flex-wrap gap-2">
                {userMoods.map(mood => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      formMoods.includes(mood)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Tags <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formTags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {tag}
                    <button type="button" onClick={() => setFormTags(prev => prev.filter(t => t !== tag))} className="hover:text-red-500">×</button>
                  </span>
                ))}
                {allTags.filter(t => !formTags.includes(t)).map(tag => (
                  <button key={tag} type="button" onClick={() => setFormTags(prev => [...prev, tag])}
                    className="px-2 py-0.5 rounded-full text-xs border border-dashed border-gray-300 text-gray-400 hover:border-emerald-400 hover:text-emerald-600">
                    + {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Type a new tag and press Enter…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-800 mb-1">
                Notes <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <RichTextEditor value={notes} onChange={setNotes} placeholder="Add any extra detail…" />
            </div>

            {/* Recurring toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
                <span className="text-sm font-semibold text-gray-800">Make this a repeating task</span>
              </label>
            </div>

            {!isRecurring ? (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Deadline <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ) : (
              <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col gap-3">
                <p className="text-xs text-indigo-700">This will replace the task with a full repeating series.</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Repeat every</label>
                  <div className="flex flex-wrap gap-2">
                    {(['hourly', 'daily', 'weekly', 'monthly', 'yearly'] as const).map(rule => (
                      <button
                        key={rule}
                        type="button"
                        onClick={() => setRecurrenceRule(rule)}
                        className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors ${
                          recurrenceRule === rule
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {rule.charAt(0).toUpperCase() + rule.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Start date</label>
                    <input
                      type="date"
                      value={recurrenceStart}
                      onChange={e => setRecurrenceStart(e.target.value)}
                      required={isRecurring}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1">End date</label>
                    <input
                      type="date"
                      value={recurrenceEnd}
                      onChange={e => setRecurrenceEnd(e.target.value)}
                      required={isRecurring}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
                {recurrenceStart && recurrenceEnd && (
                  <p className="text-xs text-indigo-600">
                    This will create {generateRecurringDates(recurrenceRule, recurrenceStart, recurrenceEnd).length} tasks.
                  </p>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input
                  type="checkbox"
                  checked={formImportant}
                  onChange={e => setFormImportant(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-800">⭐ Remind me of this at least once a week</span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-7">This task will always appear in your mood list if it hasn&apos;t shown up in 7 days.</p>
            </div>

            {saveError && <p className="text-sm text-red-500 mb-2">{saveError}</p>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {!saveMessage && (
                <button type="button" onClick={closeEdit} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                  Cancel
                </button>
              )}
              {saveMessage && (
                <>
                  <p className="text-sm text-green-600">{saveMessage}</p>
                  <button type="button" onClick={closeEdit} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                    Close
                  </button>
                </>
              )}
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Filter by</p>
        <input
          type="text"
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          placeholder="Search tasks…"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex flex-wrap gap-2">
          {(['all', 'work', 'personal'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filterCategory === cat
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {[
            { label: 'Deadline', active: filterDeadline, toggle: () => setFilterDeadline(v => !v) },
            { label: 'Snoozed', active: filterSnoozed, toggle: () => setFilterSnoozed(v => !v) },
            { label: 'Repeating', active: filterRepeating, toggle: () => setFilterRepeating(v => !v) },
          ].map(({ label, active, toggle }) => (
            <button
              key={label}
              onClick={toggle}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                active
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="w-px bg-gray-200 mx-1" />
          {userMoods.map(mood => (
            <button
              key={mood}
              onClick={() => setFilterMood(filterMood === mood ? null : mood)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filterMood === mood
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {mood}
            </button>
          ))}
          {allTags.length > 0 && <div className="w-px bg-gray-200 mx-1" />}
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                filterTags.includes(tag)
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-emerald-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        </div>

        {/* Task list */}
        {loading ? (
          <p className="text-gray-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm">No tasks match these filters.</p>
        ) : (
          <ul className="space-y-2">
            {filtered.map(task => (
              <li key={task.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-start gap-3">
                <button
                  onClick={() => handleComplete(task.id)}
                  className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 flex-shrink-0 transition-colors"
                  title="Mark as done"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p
                      className={`text-sm font-medium text-gray-900 flex-1 ${task.notes ? 'cursor-pointer hover:text-indigo-700' : ''}`}
                      onClick={() => task.notes && setExpandedId(expandedId === task.id ? null : task.id)}
                    >
                      {task.title}
                    </p>
                    {task.notes && (
                      <span className="text-xs text-gray-400">{expandedId === task.id ? '▲' : '▼'}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      task.category === 'work' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                    </span>
                    {task.mood_tags.map(mood => (
                      <span key={mood} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{mood}</span>
                    ))}
                    {(task.custom_tags ?? []).map(tag => (
                      <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                    {task.deadline && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                        Due {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {task.snoozed_until && new Date(task.snoozed_until) > new Date() && (
                      <button
                        onClick={() => handleUnsnooze(task.id)}
                        className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200 hover:bg-amber-100"
                        title="Click to wake up"
                      >
                        💤 Snoozed until {new Date(task.snoozed_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </button>
                    )}
                    {task.recurrence_rule && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                        {task.recurrence_rule.charAt(0).toUpperCase() + task.recurrence_rule.slice(1)} ↻
                      </span>
                    )}
                  </div>
                  {task.notes && expandedId === task.id && (
                    <div
                      className="mt-2 text-xs text-gray-500 prose prose-xs max-w-none [&_p]:my-0.5"
                      dangerouslySetInnerHTML={{ __html: task.notes }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(task)}
                    className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-md hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    className="text-gray-300 hover:text-red-400 text-lg transition-colors"
                    title="Delete task"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Completed tasks */}
        <div className="mt-8 border-t border-gray-100 pt-4">
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="text-sm border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            {showCompleted ? 'Hide completed' : `Show completed (${completedTasks.length})`}
          </button>

          {showCompleted && (
            <ul className="mt-3 space-y-2">
              {completedTasks.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing completed yet.</p>
              ) : completedTasks.map(task => (
                <li key={task.id} className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 border-2 border-green-400 flex-shrink-0 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <p className="text-sm text-gray-400 line-through flex-1">{task.title}</p>
                  <button
                    onClick={() => handleUncomplete(task.id)}
                    className="text-xs border border-gray-300 text-gray-500 px-2 py-1 rounded-lg hover:bg-white flex-shrink-0"
                  >
                    Not done
                  </button>
                  <button
                    onClick={() => handleDelete(task)}
                    className="text-gray-300 hover:text-red-400 text-lg flex-shrink-0 transition-colors"
                    title="Delete"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </main>

      {/* Delete recurring task modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete repeating task</h2>
            <p className="text-sm text-gray-500 mb-6">
              <strong>{deleteTarget.title}</strong> is part of a repeating series. What would you like to delete?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDeleteOne}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Just this one
              </button>
              <button
                onClick={confirmDeleteFuture}
                className="bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                This and all future instances
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-sm text-gray-400 hover:text-gray-600 py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
