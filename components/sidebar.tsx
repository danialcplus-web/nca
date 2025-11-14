"use client"

import { Plus, Trash2, Clock, LogOut } from 'lucide-react'
import type { Chat } from "@/app/chat/page"

interface SidebarProps {
  chats: Chat[]
  currentChatId: string
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onLogout: () => void
}

export default function Sidebar({ chats, currentChatId, onNewChat, onSelectChat, onDeleteChat, onLogout }: SidebarProps) {
  const formatTime = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString()
  }

  return (
    <div className="w-64 bg-gradient-to-b from-background to-background/95 border-r border-border/50 flex flex-col h-full sm:h-screen">
      <div className="p-4 border-b border-border/30 backdrop-blur-sm">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 text-sm font-medium"
        >
          <Plus size={18} />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Clock size={24} className="mx-auto mb-2 opacity-50" />
            No chats yet
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`group/item p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between gap-2 ${
                currentChatId === chat.id
                  ? "bg-primary/10 border border-primary/30 shadow-sm"
                  : "hover:bg-foreground/5 border border-transparent"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{chat.title}</p>
                <p className="text-xs text-muted-foreground">{formatTime(chat.createdAt)}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteChat(chat.id)
                }}
                className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 p-1 hover:bg-destructive/20 rounded text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border/30 p-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors duration-200 text-sm font-medium"
          title="Logout"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  )
}
