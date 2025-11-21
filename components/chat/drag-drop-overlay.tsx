"use client"

import { Upload } from "lucide-react"

type DragDropOverlayProps = {
  isVisible: boolean
}

export function DragDropOverlay({ isVisible }: DragDropOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-sm border-4 border-dashed border-primary rounded-lg flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
          <Upload className="h-10 w-10 text-primary-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground">Drop your document here</p>
        <p className="text-sm text-muted-foreground">PDF, DOC, or TXT files</p>
      </div>
    </div>
  )
}
