"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Send, Plus, X } from "lucide-react"
// import { Session } from "@supabase/supabase-js" // Not needed for test

interface ChatInputProps {
  onAttach?: (files: File[]) => void
  onSendMessage: (message: string) => void
  disabled: boolean
  // session: Session | null // Commented out, no JWT needed
}

interface UploadProgress {
  filename: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export default function ChatInput({ onAttach, onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSendMessage(input)
      setInput("")
    }
  }

  const uploadFile = async (file: File) => {
    // Skip JWT/session check
    // if (!session?.access_token) { ... } 

    const formData = new FormData()
    formData.append('file', file)
    // formData.append('file_type', file.type || 'txt') // optional
    // formData.append('filename', file.name) // optional

    setUploads(prev => [...prev, {
      filename: file.name,
      progress: 0,
      status: 'uploading'
    }])

    try {
      const xhr = new XMLHttpRequest()

      // JWT header removed for testing
      xhr.open('POST', `${process.env.NEXT_PUBLIC_FASTAPI_URL}/documents/upload`)
      // xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`) // COMMENTED OUT

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploads(prev => prev.map(upload =>
            upload.filename === file.name
              ? { ...upload, progress: percentComplete }
              : upload
          ))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploads(prev => prev.map(upload =>
            upload.filename === file.name
              ? { ...upload, progress: 100, status: 'success' }
              : upload
          ))
          setTimeout(() => {
            setUploads(prev => prev.filter(u => u.filename !== file.name))
          }, 3000)
        } else {
          setUploads(prev => prev.map(upload =>
            upload.filename === file.name
              ? { ...upload, status: 'error', error: 'Upload failed' }
              : upload
          ))
        }
      })

      xhr.addEventListener('error', () => {
        setUploads(prev => prev.map(upload =>
          upload.filename === file.name
            ? { ...upload, status: 'error', error: 'Network error' }
            : upload
        ))
      })

      xhr.send(formData)

    } catch (error: any) {
      setUploads(prev => prev.map(upload =>
        upload.filename === file.name
          ? { ...upload, status: 'error', error: error.message || 'Upload failed' }
          : upload
      ))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      onAttach?.(files)
      files.forEach(file => uploadFile(file))
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeUpload = (filename: string) => {
    setUploads(prev => prev.filter(u => u.filename !== filename))
  }

  return (
    <div className="border-t border-border bg-background">
      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="px-3 sm:px-4 md:px-6 py-2 space-y-2 border-b border-border">
          {uploads.map((upload) => (
            <div key={upload.filename} className="flex items-center gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="truncate text-foreground">{upload.filename}</span>
                  <div className="flex items-center gap-2">
                    {upload.status === 'uploading' && (
                      <span className="text-muted-foreground">{Math.round(upload.progress)}%</span>
                    )}
                    {upload.status === 'success' && (
                      <span className="text-green-600">✓ Uploaded</span>
                    )}
                    {upload.status === 'error' && (
                      <span className="text-red-600">{upload.error}</span>
                    )}
                    <button
                      onClick={() => removeUpload(upload.filename)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {upload.status === 'uploading' && (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="mx-auto w-full max-w-3xl flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder="Type your message..."
            disabled={disabled}
            className="flex-1 rounded-lg border border-input bg-background px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
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
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Attach files"
              disabled={disabled}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="rounded-lg px-3 sm:px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
