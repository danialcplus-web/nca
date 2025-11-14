"use client"

interface MessageBubbleProps {
  message: {
    id: string
    role: "user" | "assistant"
    content: string
  }
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 break-words ${
          isUser
            ? "bg-primary text-primary-foreground max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl"
            : "bg-card text-card-foreground border border-border max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-2xl"
        }`}
      >
        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
