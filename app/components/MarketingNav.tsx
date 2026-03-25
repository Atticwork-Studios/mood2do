import Link from 'next/link'

export default function MarketingNav() {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="w-full max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
        <Link href="/" style={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: '1.25rem', color: 'var(--grain-primary)' }}>
          Mood2do
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/resources" className="text-sm font-medium text-gray-600 hover:text-gray-900">Resources</Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">Pricing</Link>
          <Link href="/sign-in" className="text-sm font-medium text-gray-600 hover:text-gray-900">Log in</Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: 'var(--grain-primary)' }}
          >
            Start for free →
          </Link>
        </div>
      </div>
    </nav>
  )
}
