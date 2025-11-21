"use client"

import { useState, useEffect,useRef } from "react"
import ChatWindow from "@/components/chat-window"
import ChatInput from "@/components/chat-input"
import Sidebar from "@/components/sidebar"
import { Menu, X } from 'lucide-react'
import { createClient } from "@/lib/client"
import { useRouter } from 'next/navigation'
import { initializeChatKitSession, sendMessageToChatKit } from "@/lib/chatkit-client"
//import { DragDropOverlay } from "@/components/chat/drag-drop-overlay"
//import { DocumentBadge } from "@/components/chat/document-badge"






export interface Chat {
  id: string
  title: string
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>
  createdAt: Date
}

const INITIAL_MESSAGE = {
  id: "0",
  role: "assistant" as const,
  content: "Hello! I'm your OpenAI Agent. How can I help you today?",
}

// Uploaded document type
type UploadedDocument = {
  name: string
  type: string
  size: number
}



export default function ChatPage() {
  const router = useRouter()
  const supabase = createClient()
  const [chats, setChats] = useState<Chat[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [chatKitReady, setChatKitReady] = useState(false)
  const [sessionId, setSessionId] = useState<string>("")
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/auth/login")
        return
      }
      setUser(data.session.user)
    }

    checkAuth()
  }, [supabase, router])

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chats")
    if (saved) {
      const parsedChats = JSON.parse(saved)
      setChats(parsedChats)
      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id)
      } else {
        createNewChat()
      }
    } else {
      createNewChat()
    }
  }, [])

  // Save to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats))
    }
  }, [chats])

  useEffect(() => {
    const initChatKit = async () => {
      try {
        const clientSecret = await initializeChatKitSession()
        setSessionId(clientSecret)
        setChatKitReady(true)
      } catch (error) {
        console.error("[v0] Failed to initialize ChatKit:", error)
        setChatKitReady(true) // Allow fallback to work
      }
    }
    // Initialize ChatKit session when user is available
    if (user) {
      initChatKit()
    }
  }, [user])

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [INITIAL_MESSAGE],
      createdAt: new Date(),
    }
    setChats((prev) => [newChat, ...prev])
    setCurrentChatId(newChat.id)
  }

  const currentChat = chats.find((c) => c.id === currentChatId) || chats[0]

  const handleSendMessage = async (content: string) => {
    if (!currentChat) return

    // Create the user message object once so we can both update state
    // optimistically and include the exact same message in the request payload.
    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content,
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === currentChatId) {
          const updatedMessages = [...chat.messages, userMessage]

          const updatedChat = { ...chat, messages: updatedMessages }
          if (chat.messages.length === 1) {
            updatedChat.title = content.substring(0, 30) + (content.length > 30 ? "..." : "")
          }

          return updatedChat
        }
        return chat
      }),
    )

    setIsLoading(true)

    try {
      let responseContent = ""
      
      if (chatKitReady && sessionId) {
        responseContent = await sendMessageToChatKit(content, sessionId)
      } else {
        // Use FastAPI endpoint from environment variable
        const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
        
        if (!fastApiUrl) {
          throw new Error("NEXT_PUBLIC_FASTAPI_URL is not configured")
        }

        // Build the messages payload including the newly created userMessage
        const messagesPayload = (currentChat?.messages ?? []).concat(userMessage)

        const response = await fetch(`${fastApiUrl}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            messages: messagesPayload.map(msg => ({ role: msg.role, content: msg.content }))
          }),
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        responseContent = data.message || data.response || "I couldn't process that request. Please try again."
      }

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant" as const,
                  content: responseContent,
                },
              ],
            }
          }
          return chat
        }),
      )
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: (Date.now() + 1).toString(),
                  role: "assistant" as const,
                  content: "Sorry, I encountered an error. Please try again.",
                },
              ],
            }
          }
          return chat
        }),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (currentChatId === chatId) {
      const remaining = chats.filter((c) => c.id !== chatId)
      setCurrentChatId(remaining[0]?.id || "")
      if (remaining.length === 0) {
        createNewChat()
      }
    }
  }

   /* const processFile = async (file: File) => {
    const fileType = file.name.split(".").pop()?.toLowerCase()
    if (!["pdf", "doc", "docx", "txt"].includes(fileType || "")) {
      alert("Please upload a PDF, DOC, or TXT file")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("file_type", fileType || "")
      formData.append("title", file.name)

      const response = await fetch("http://localhost:8001/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()

      setUploadedDoc({
        name: file.name,
        type: fileType || "",
        size: file.size,
      })

    /* const docMessage: chats = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Document "${file.name}" uploaded successfully. You can now ask questions about it.`,
        documentName: file.name,
      }
      setChats((prev) => [...prev, docMessage])
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      await processFile(file)
    }
  
  }
  
  const handleRemoveDocument = () => {
    setUploadedDoc(null)
  }
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
*/


  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <main className="flex h-screen bg-background overflow-hidden">
      <div className="group hidden lg:flex">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sidebar
            chats={chats}
            currentChatId={currentChatId}
            onNewChat={createNewChat}
            onSelectChat={setCurrentChatId}
            onDeleteChat={handleDeleteChat}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 bg-background">
            <Sidebar
              chats={chats}
              currentChatId={currentChatId}
              onNewChat={createNewChat}
              onSelectChat={(chatId) => {
                setCurrentChatId(chatId)
                setSidebarOpen(false)
              }}
              onDeleteChat={handleDeleteChat}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col" >        {/*onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}*/}
        <div className="lg:hidden border-b border-border bg-background px-3 sm:px-4 py-3 flex items-center justify-between">
          <DragDropOverlay isVisible={isDragging} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-foreground/5 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-sm font-medium text-foreground">Chat</h1>
          <div className="w-8" />
        </div>

        {currentChat && (
          <>
            <ChatWindow messages={currentChat.messages} isLoading={isLoading} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </>
        )}
      </div>
    </main>
  )
}