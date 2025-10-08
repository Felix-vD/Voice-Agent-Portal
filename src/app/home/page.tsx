import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { VoiceAgentForm } from '@/components/voice-agent/VoiceAgentForm'
import { logout } from '@/app/actions/auth'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "#001a1a" }}
      className="w-full flex flex-col"
    >
      {/* Header */}
      <header style={{ borderBottom: "2px solid #004d4d", backgroundColor: "rgba(0, 41, 41, 0.8)" }} className="backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-end">
          <form action={logout}>
            <Button 
              variant="outline" 
              type="submit" 
              style={{ height: "40px", borderColor: "#004d4d", color: "#A8F0F0" }}
              className="hover:bg-[#004d4d] transition-all"
            >
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div style={{ maxWidth: "800px" }} className="w-full">
          
          {/* Welcome Section */}
          <div style={{ marginBottom: "48px" }} className="text-center">
            <h1
              style={{ fontSize: "48px", lineHeight: "56px", color: "#FFC300", marginBottom: "16px" }}
              className="font-bold tracking-tight"
            >
              Voice Agent Portal
            </h1>
            <p style={{ fontSize: "20px", lineHeight: "28px", color: "rgba(168, 240, 240, 0.7)" }}>
              Configure your AI voice agent&apos;s behavior and settings
            </p>
          </div>

          {/* Email Status */}
          {!user.email_confirmed_at && (
            <div
              style={{
                marginBottom: "32px",
                padding: "24px",
                backgroundColor: "rgba(51, 34, 0, 0.3)",
                borderColor: "rgba(255, 195, 0, 0.5)",
                borderWidth: "2px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 195, 0, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <svg className="w-6 h-6" style={{ color: "#FFC300" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 style={{ color: "#FFC300", fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                  Verify Your Email
                </h3>
                <p style={{ color: "#A8F0F0", fontSize: "16px" }}>
                  Check your inbox to verify your email address
                </p>
              </div>
            </div>
          )}

          {/* Voice Agent Form Card */}
          <div
            style={{
              backgroundColor: "rgba(0, 51, 51, 0.6)",
              backdropFilter: "blur(8px)",
              borderColor: "#004d4d",
              borderWidth: "2px",
              borderRadius: "24px",
              padding: "32px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}
          >
            <VoiceAgentForm />
          </div>
        </div>
      </main>
    </div>
  )
}