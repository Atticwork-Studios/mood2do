import Link from 'next/link'

export default function GoodbyePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-10 text-center">
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">We&apos;re sorry to see you go.</h1>
        <p className="text-sm text-gray-500 mb-8">
          Your account and all your data have been permanently deleted. We hope Mood2do was useful while it lasted.
        </p>
        <Link
          href="/"
          className="inline-block text-sm font-semibold text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: 'var(--grain-primary)' }}
        >
          Back to Mood2do →
        </Link>
      </div>
    </main>
  )
}
