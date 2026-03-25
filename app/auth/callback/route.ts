import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)

    // Check if this is a new user with no profile name yet
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()

      if (!profile?.name) {
        return NextResponse.redirect(`${origin}/profile`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/home`)
}
