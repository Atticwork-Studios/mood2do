import { createClient } from '@/lib/supabase/client'

export const DEFAULT_MOODS = ['Focussed', 'Bored', 'Distracted', 'Scattered', 'Creative']

export const PRESET_MOODS = [
  'Focussed', 'Bored', 'Distracted', 'Anxious', 'Creative',
  'Energised', 'Tired', 'Overwhelmed', 'Motivated', 'Restless',
  'Calm', 'Frustrated', 'Curious', 'Stressed', 'Happy',
  'Low', 'Scattered', 'Sharp', 'Determined', 'Procrastinating',
]

export async function getUserMoods(): Promise<string[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return DEFAULT_MOODS

  const { data } = await supabase
    .from('profiles')
    .select('moods')
    .eq('id', user.id)
    .single()

  if (data?.moods && data.moods.length > 0) return data.moods
  return DEFAULT_MOODS
}
