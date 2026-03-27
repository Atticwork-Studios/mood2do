'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavBar from '@/app/components/NavBar'
import { createClient } from '@/lib/supabase/client'
import { PRESET_MOODS, DEFAULT_MOODS } from '@/lib/getUserMoods'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Plan
  const [plan, setPlan] = useState<string>('free')

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Profile
  const [name, setName] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // Task count
  const [taskCount, setTaskCount] = useState(5)
  const [taskCountSaving, setTaskCountSaving] = useState(false)
  const [taskCountMessage, setTaskCountMessage] = useState('')

  // Moods
  const [selectedMoods, setSelectedMoods] = useState<string[]>(DEFAULT_MOODS)
  const [savedMoods, setSavedMoods] = useState<string[]>(DEFAULT_MOODS)
  const [customInput, setCustomInput] = useState('')
  const [moodSaving, setMoodSaving] = useState(false)
  const [moodMessage, setMoodMessage] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/sign-in'); return }

      const { data } = await supabase
        .from('profiles')
        .select('name, moods, task_count, plan')
        .eq('id', user.id)
        .single()

      if (data?.name) setName(data.name)
      if (data?.moods && data.moods.length > 0) { setSelectedMoods(data.moods); setSavedMoods(data.moods) }
      if (data?.task_count) setTaskCount(data.task_count)
      if (data?.plan) setPlan(data.plan)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMessage('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').upsert({ id: user.id, name })
    if (error) {
      setProfileMessage('Could not save — please try again.')
      setProfileSaving(false)
    } else {
      router.push('/home')
    }
  }

  async function handleSaveTaskCount() {
    setTaskCountSaving(true)
    setTaskCountMessage('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ task_count: taskCount }).eq('id', user.id)
    setTaskCountMessage(error ? 'Could not save — please try again.' : 'Saved!')
    setTaskCountSaving(false)
  }

  function toggleMood(mood: string) {
    setSelectedMoods(prev =>
      prev.includes(mood) ? prev.filter(m => m !== mood) : [...prev, mood]
    )
  }

  function addCustomMood() {
    const trimmed = customInput.trim()
    if (!trimmed || selectedMoods.includes(trimmed)) return
    setSelectedMoods(prev => [...prev, trimmed])
    setCustomInput('')
  }

  function removeCustomMood(mood: string) {
    setSelectedMoods(prev => prev.filter(m => m !== mood))
  }

  async function handleSaveMoods() {
    if (selectedMoods.length === 0) { setMoodMessage('Pick at least one mood.'); return }
    setMoodSaving(true)
    setMoodMessage('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Remove deleted moods from any tasks that still carry them
    const removedMoods = savedMoods.filter(m => !selectedMoods.includes(m))
    for (const mood of removedMoods) {
      const { data: affected } = await supabase
        .from('tasks')
        .select('id, mood_tags')
        .eq('user_id', user.id)
        .contains('mood_tags', [mood])
      for (const task of affected ?? []) {
        await supabase.from('tasks')
          .update({ mood_tags: task.mood_tags.filter((t: string) => t !== mood) })
          .eq('id', task.id)
      }
    }

    const { error } = await supabase.from('profiles').update({ moods: selectedMoods }).eq('id', user.id)
    if (!error) setSavedMoods(selectedMoods)
    setMoodMessage(error ? 'Could not save — please try again.' : 'Saved!')
    setMoodSaving(false)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError('')
    const res = await fetch('/api/delete-account', { method: 'DELETE' })
    if (res.ok) {
      router.push('/goodbye')
    } else {
      const { error } = await res.json()
      setDeleteError(error ?? 'Something went wrong. Please try again.')
      setDeleting(false)
    }
  }

  const inactivePresets = PRESET_MOODS.filter(m => !selectedMoods.includes(m))

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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="flex flex-col gap-6">

          {/* Plan + Help row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-1">Your plan</h2>
              <p className="text-sm text-gray-500 mb-4">
                {plan === 'pro_monthly'
                  ? 'You are on the Pro Monthly plan — unlimited tasks and full insights.'
                  : plan === 'pro_annual'
                  ? 'You are on the Pro Annual plan — unlimited tasks and full insights.'
                  : 'You are on the Free plan — up to 25 tasks.'}
              </p>
              {plan === 'free' && (
                <a
                  href="/pricing"
                  className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Upgrade to Pro →
                </a>
              )}
              {plan !== 'free' && (
                <span className="inline-block bg-green-50 text-green-700 border border-green-200 px-4 py-1.5 rounded-lg text-sm font-semibold">
                  ✓ Pro
                </span>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 mb-1">Help &amp; Resources</h2>
              <p className="text-sm text-gray-500 mb-4">Guides, tips, and walkthroughs for getting the most out of Mood2do.</p>
              <a
                href="/resources"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Open Help →
              </a>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Profile</h2>
            <p className="text-sm text-gray-500 mb-4">How should we refer to you?</p>
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {profileSaving ? 'Saving…' : 'Save'}
                </button>
                {profileMessage && (
                  <p className={`text-sm ${profileMessage === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                    {profileMessage}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Task count */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Tasks shown per mood</h2>
            <p className="text-sm text-gray-500 mb-4">How many tasks should appear when you pick your mood?</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => setTaskCount(n)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold border transition-colors ${
                    taskCount === n
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveTaskCount}
                disabled={taskCountSaving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {taskCountSaving ? 'Saving…' : 'Save'}
              </button>
              {taskCountMessage && (
                <p className={`text-sm ${taskCountMessage === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                  {taskCountMessage}
                </p>
              )}
            </div>
          </div>

          {/* Moods */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">Your mood labels</h2>
            <p className="text-sm text-gray-500 mb-5">
              These appear in the mood picker and when tagging tasks. Remove any that don&apos;t fit you.
            </p>

            {/* Active moods */}
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active</label>
            <div className="flex flex-wrap gap-2 mb-5">
              {selectedMoods.length === 0 && (
                <p className="text-sm text-gray-400">No moods selected — add some below.</p>
              )}
              {selectedMoods.map(mood => (
                <span key={mood} className="flex items-center gap-1 bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1.5 rounded-full text-sm font-medium">
                  {mood}
                  <button
                    onClick={() => setSelectedMoods(prev => prev.filter(m => m !== mood))}
                    className="text-gray-400 hover:text-red-500 ml-1 leading-none text-base"
                    title="Remove"
                  >×</button>
                </span>
              ))}
            </div>

            {/* Inactive presets */}
            {inactivePresets.length > 0 && (
              <>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add a preset</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {inactivePresets.map(mood => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMoods(prev => [...prev, mood])}
                      className="px-3 py-1.5 rounded-full text-sm border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-800 transition-colors"
                    >
                      + {mood}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Add custom */}
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add your own</label>
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomMood())}
                placeholder="e.g. Hyperfocussed"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button onClick={addCustomMood} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                Add
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveMoods}
                disabled={moodSaving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {moodSaving ? 'Saving…' : 'Save'}
              </button>
              {moodMessage && (
                <p className={`text-sm ${moodMessage === 'Saved!' ? 'text-green-600' : 'text-red-500'}`}>
                  {moodMessage}
                </p>
              )}
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-red-700 mb-1">Danger zone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Permanently delete your account and all your data. This cannot be undone.
            </p>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="bg-white border border-red-300 text-red-600 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-50"
              >
                Delete my account
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 mb-1">Are you sure?</p>
                <p className="text-xs text-red-600 mb-4">This will delete your account, all your tasks, and all your data. There is no way back.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting…' : 'Yes, delete everything'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
                {deleteError && <p className="text-xs text-red-500 mt-2">{deleteError}</p>}
              </div>
            )}
          </div>

        </div>

        <p className="text-xs text-gray-400 mt-8 text-right">v1.0</p>
      </main>
    </>
  )
}
