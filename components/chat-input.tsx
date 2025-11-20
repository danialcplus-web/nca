"use client"

import type React from "react"

import { useState,useRef } from "react"
import { Button } from "@/components/ui/button"
import { SendIcon, Plus } from "lucide-react"

interface ChatInputProps {
  onAttach?: (files: File[]) => void
  onSendMessage: (message: string) => void
  disabled: boolean
}

export default function ChatInput({ onAttach,onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
   const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSendMessage(input)
      setInput("")
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onAttach?.(Array.from(e.target.files))
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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

        {/* Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Attach Button */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              aria-label="Attach files"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Attach files"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      
        {/* Send Button */}
      </div>  
        <Button type="submit" disabled={disabled || !input.trim()} className="rounded-lg px-3 sm:px-4">
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
