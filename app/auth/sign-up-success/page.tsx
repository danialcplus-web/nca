"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from "@/lib/client"

export default function SignUpSuccessPage() {
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Listen for real-time auth state changes (fires instantly when email is verified)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setIsVerified(true)
          // Redirect to chat after a brief delay to show success message
          router.push("/chat")
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          {isVerified ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">Email verified!</h1>
              <p className="text-foreground/60 mb-6">Your account is ready to use</p>
              <Link
                href="/chat"
                className="inline-block bg-foreground text-background font-medium py-3 px-8 rounded-lg hover:bg-foreground/90 transition-all"
              >
                Go to chat
              </Link>
            </>
          ) : (
            <>
              <Mail className="w-16 h-16 text-foreground/40 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">Check your email</h1>
              <p className="text-foreground/60 mb-4">
                We sent a confirmation link to your email address. Please click it to verify your account.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
                <Loader2 size={16} className="animate-spin" />
                Waiting for verification...
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-600 text-sm text-center mb-6">
            {error}
          </div>
        )}

        {/*!isVerified && (
          <div className="border border-foreground/10 rounded-lg p-4 bg-foreground/5 text-sm text-foreground/70 space-y-2">
            <p className="font-medium">Didn't receive the email?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your spam folder</li>
              <li>Make sure the email address is correct</li>
              <li>Try signing up again if needed</li>
            </ul>
          </div>
        )*/}
      </div>
    </main>
  )
}
