import Link from 'next/link'
import MarketingNav from '@/app/components/MarketingNav'

const features = [
  {
    title: 'Tasks matched to your mood',
    body: 'Tell Mood2do how you\'re feeling and it shows you the tasks that actually suit that state. Focused? Here\'s your deep work. Scattered? Here\'s something easy to tick off.',
  },
  {
    title: 'No more list overwhelm',
    body: 'Mood2do never shows you everything at once. You see a small, manageable set of tasks — chosen for right now, not for some ideal version of you.',
  },
  {
    title: 'Learn when you do your best work',
    body: 'Every task you time adds to a picture of how you actually work. Mood2do spots the patterns so you can stop guessing and start planning around your real brain.',
  },
  {
    title: 'Built for ADHD brains',
    body: 'By someone with ADHD, for people with ADHD. Every decision — from the number of tasks shown to the way the timer works — is made with your brain in mind.',
  },
]

export default function MarketingHome() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section style={{ background: 'var(--grain-primary-light)' }} className="border-b border-orange-100">
        <div className="w-full max-w-6xl mx-auto px-8 py-24 flex flex-col items-center text-center">
          <span
            className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ background: 'var(--grain-primary-border)', color: 'var(--grain-primary-dark)' }}
          >
            Built for ADHD brains
          </span>
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6 max-w-2xl" style={{ letterSpacing: '-0.03em' }}>
            Work how your brain does.
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
            Stop staring at a list of 50 things. Mood2do matches your tasks to how you actually feel right now — so you can just get started.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link
              href="/sign-up"
              className="text-sm font-semibold text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              style={{ background: 'var(--grain-primary)' }}
            >
              Start for free →
            </Link>
            <Link
              href="/resources"
              className="text-sm font-semibold text-gray-700 px-6 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">Why Mood2do works differently</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map(f => (
            <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div
                className="w-2 h-8 rounded-full mb-4"
                style={{ background: 'var(--grain-primary)' }}
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section style={{ background: 'var(--background)' }} className="border-t border-gray-100">
        <div className="w-full max-w-6xl mx-auto px-8 py-16 flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Free to start, no card needed</h2>
          <p className="text-gray-500 text-sm mb-6">Try Mood2do with up to 25 tasks. Upgrade when you&apos;re ready for more.</p>
          <Link href="/pricing" className="text-sm font-semibold underline" style={{ color: 'var(--grain-primary)' }}>
            See pricing →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="w-full max-w-6xl mx-auto px-8 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} Atticwork Studios &nbsp;·&nbsp;{' '}
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            &nbsp;·&nbsp;{' '}
            <Link href="/terms" className="hover:text-gray-600">Terms</Link>
          </p>
        </div>
      </footer>
    </>
  )
}
