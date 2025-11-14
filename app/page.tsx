import Link from "next/link"
import { ArrowRight, MessageCircle, Zap, Lock } from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Navigation */}
      <nav className="border-b border-foreground/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-foreground">Clarity AI</div>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all font-medium"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center space-y-8">
          <h1 className="text-5xl sm:text-7xl font-bold text-foreground leading-tight">
            Chat with AI
            <br />
            <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Intelligently
            </span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Experience powerful AI conversations with our advanced agent-based chatbot. Get instant responses, thoughtful insights, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-medium py-3 px-8 rounded-lg hover:bg-foreground/90 transition-all"
            >
              Start chatting
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 border border-foreground/10 text-foreground font-medium py-3 px-8 rounded-lg hover:bg-foreground/5 transition-all"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border border-foreground/10 rounded-lg p-6 bg-foreground/5">
            <MessageCircle className="w-10 h-10 text-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Natural Conversations</h3>
            <p className="text-foreground/60">
              Engage in fluid, context-aware conversations that feel natural and responsive.
            </p>
          </div>
          <div className="border border-foreground/10 rounded-lg p-6 bg-foreground/5">
            <Zap className="w-10 h-10 text-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Instant Responses</h3>
            <p className="text-foreground/60">
              Get fast, intelligent responses powered by advanced AI models.
            </p>
          </div>
          <div className="border border-foreground/10 rounded-lg p-6 bg-foreground/5">
            <Lock className="w-10 h-10 text-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Secure & Private</h3>
            <p className="text-foreground/60">
              Your data is encrypted and protected with enterprise-grade security.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <div className="bg-gradient-to-br from-foreground/10 to-foreground/5 border border-foreground/20 rounded-2xl p-12 space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Ready to get started?</h2>
          <p className="text-foreground/60 max-w-xl mx-auto">
            Join thousands of users who are already using Clarity AI to enhance their productivity.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-medium py-3 px-8 rounded-lg hover:bg-foreground/90 transition-all"
          >
            Create your account now
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-foreground/60">
          <p>© 2025 Clarity AI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
