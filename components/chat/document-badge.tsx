"use client"

import { Button } from "@/components/ui/button"
import { FileText, X } from "lucide-react"

type DocumentBadgeProps = {
  name: string
  size: number
  onRemove: () => void
}

export function DocumentBadge({ name, size, onRemove }: DocumentBadgeProps) {
  return (
    <div className="px-6 py-3 bg-secondary/50 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{name}</span>
          <span className="text-xs text-muted-foreground">({(size / 1024).toFixed(1)} KB)</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
