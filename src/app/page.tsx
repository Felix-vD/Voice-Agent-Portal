import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect authenticated users to home, others to login
  if (user) {
    redirect('/home')
  } else {
    redirect('/login')
  }
}
