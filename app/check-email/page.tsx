import Link from 'next/link'

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-10 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h1>
        <p className="text-sm text-gray-500 mb-8">
          We&apos;ve sent a confirmation link to your email address. Click it to activate your account and get started.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Can&apos;t find it? Check your spam folder.
        </p>
        <Link
          href="/sign-in"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  )
}
