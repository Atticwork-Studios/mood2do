'use client'

import { createClient } from '@/lib/supabase/client'

export function triggerWelcomeModal() {
  // Resets the welcomed flag in the database for the current user
  async function reset() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ welcomed: false }).eq('id', user.id)
  }
  reset()
}

export default function WelcomeModal({ onClose }: { onClose: () => void }) {
  async function dismiss() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('profiles').update({ welcomed: true }).eq('id', user.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome to Mood2do</h2>
        <p className="text-sm text-gray-500 mb-6">Here&apos;s how to get started in four steps.</p>

        <ol className="flex flex-col gap-4 mb-8">
          {[
            {
              step: '1',
              title: 'Add your tasks',
              detail: 'Go to Task list in the menu and add a few things you need to do — for work and personally.',
            },
            {
              step: '2',
              title: 'Tag each task with a mood',
              detail: 'When adding a task, pick which moods suit it. A task you can only do when focused is different from one you can do half-asleep.',
            },
            {
              step: '3',
              title: 'Pick Work or Personal',
              detail: 'From the home screen, choose where you\'re starting. Then select how you\'re feeling right now.',
            },
            {
              step: '4',
              title: 'Hit "I\'ll do this"',
              detail: 'Mood2do shows you tasks that match your mood. Pick one and start the timer — that\'s it.',
            },
          ].map(({ step, title, detail }) => (
            <li key={step} className="flex gap-4">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold mt-0.5"
                style={{ background: 'var(--grain-primary)' }}
              >
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{detail}</p>
              </div>
            </li>
          ))}
        </ol>

        <button
          onClick={dismiss}
          style={{ background: 'var(--grain-primary)' }}
          className="w-full py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90"
        >
          Let&apos;s go →
        </button>

      </div>
    </div>
  )
}
