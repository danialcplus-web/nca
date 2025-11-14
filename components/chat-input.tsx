"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SendIcon } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSendMessage(input)
      setInput("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-border bg-background px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="mx-auto w-full max-w-3xl flex gap-2 sm:gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 rounded-lg border border-input bg-background px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        />
        <Button type="submit" disabled={disabled || !input.trim()} className="rounded-lg px-3 sm:px-4">
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
