"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface MessageItem {
  role: string
  content: string
}

interface ExportPptButtonProps {
  chatId?: string
  messages?: MessageItem[]
  filename?: string
  className?: string
}

export default function ExportPptButton({ chatId, messages, filename, className }: ExportPptButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setError(null)
    setLoading(true)
    try {
      const url = `${process.env.NEXT_PUBLIC_FASTAPI_URL}/chat/export/pptx`
      const payload: any = {}
      if (chatId) payload.chat_id = chatId
      else if (messages) payload.messages = messages
      else {
        setError("Provide either chatId or messages to export.")
        setLoading(false)
        return
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Export failed with status ${res.status}`)
      }

      const blob = await res.blob()

      // Try to derive filename from Content-Disposition header
      let outName = filename
      const cd = res.headers.get("content-disposition")
      if (!outName && cd) {
        const m = /filename\s*=\s*"?([^\";]+)"?/i.exec(cd)
        if (m && m[1]) outName = m[1]
      }
      if (!outName) outName = `chat_export_${new Date().toISOString().replace(/[:.]/g, "-")}.pptx`

      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = outName
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (err: any) {
      console.error("Export PPTX failed:", err)
      setError(err?.message || "Export failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      <Button onClick={handleExport} disabled={loading} title="Export chat to PPTX">
        <Download className="mr-2 h-4 w-4" />
        {loading ? "Exporting..." : "Export PPT"}
      </Button>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  )
}
