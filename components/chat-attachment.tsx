"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, File, Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Attachment {
  id: string
  file: File
  preview?: string
  type: "image" | "document" | "other"
}

interface ChatAttachmentProps {
  onAttach?: (attachments: Attachment[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  allowedTypes?: string[]
}

export function ChatAttachment({
  onAttach,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ["image/*", "application/pdf", ".doc", ".docx", ".txt"],
}: ChatAttachmentProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): Attachment["type"] => {
    if (file.type.startsWith("image/")) return "image"
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) return "document"
    return "other"
  }

  const processFiles = (files: FileList | File[]) => {
    const newAttachments: Attachment[] = []

    Array.from(files).forEach((file) => {
      // Validate file size
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds max size of ${maxSize} bytes`)
        return
      }

      const type = getFileType(file)
      const attachment: Attachment = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        type,
      }

      // Generate preview for images
      if (type === "image") {
        const reader = new FileReader()
        reader.onload = (e) => {
          const foundAttachment = newAttachments.find((a) => a.id === attachment.id)
          if (foundAttachment) {
            foundAttachment.preview = e.target?.result as string
          }
        }
        reader.readAsDataURL(file)
      }

      newAttachments.push(attachment)
    })

    const combined = [...attachments, ...newAttachments].slice(0, maxFiles)
    setAttachments(combined)
    onAttach?.(combined)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files)
    }
  }

  const removeAttachment = (id: string) => {
    const updated = attachments.filter((a) => a.id !== id)
    setAttachments(updated)
    onAttach?.(updated)
  }

  const removeAll = () => {
    setAttachments([])
    onAttach?.([])
  }

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50",
        )}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept={allowedTypes.join(",")}
          aria-label="Attach files"
        />

        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {attachments.length > 0
                ? `${attachments.length} file${attachments.length !== 1 ? "s" : ""} attached`
                : "Drag files here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} files, {(maxSize / 1024 / 1024).toFixed(0)}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Attachments</p>
            <Button variant="ghost" size="sm" onClick={removeAll} className="text-xs h-7">
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative group bg-muted rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
              >
                {/* Image Preview */}
                {attachment.type === "image" && attachment.preview && (
                  <img
                    src={attachment.preview || "/placeholder.svg"}
                    alt={attachment.file.name}
                    className="w-full h-24 object-cover"
                  />
                )}

                {/* Document/Other File Icon */}
                {attachment.type !== "image" && (
                  <div className="w-full h-24 flex items-center justify-center bg-muted/50">
                    {attachment.type === "document" ? (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <File className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Overlay with remove button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttachment(attachment.id)}
                    className="h-8 w-8 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    aria-label={`Remove ${attachment.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filename tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/75 p-1 translate-y-full group-hover:translate-y-0 transition-transform text-white text-xs truncate">
                  {attachment.file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
