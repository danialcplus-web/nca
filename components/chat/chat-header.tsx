"use client"

import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

type ChatHeaderProps = {
  isUploading: boolean
  onUploadClick: () => void
}

export function ChatHeader({ isUploading, onUploadClick }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border p-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Chat Assistant</h1>
        <p className="text-sm text-muted-foreground mt-1">Upload a document and ask questions</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onUploadClick}
        disabled={isUploading}
        className="gap-2 bg-transparent"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload Document
          </>
        )}
      </Button>
    </div>
  )
}
