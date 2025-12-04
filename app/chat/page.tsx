"use client";

import { useEffect, useState, useRef } from "react";
import ChatWindow from "@/components/chat-window";
import ChatInput from "@/components/chat-input";
import Sidebar from "@/components/sidebar";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/client";
import { useRouter } from "next/navigation";
import { initializeChatKitSession, sendMessageToChatKit } from "@/lib/chatkit-client";
import { DragDropOverlay } from "@/components/chat/drag-drop-overlay";
import ExportPptButton from "@/components/export-ppt-button"

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  lastMessage?: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string; created_at?: string }>;
}

const INITIAL_MESSAGE = {
  id: "0",
  role: "assistant" as const,
  content: "Hello! I'm your New clarity Agent. How can I help you today?",
};

export default function ChatPage() {
  const router = useRouter();
  const supabase = createClient();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // supabase user object
  const [chatKitReady, setChatKitReady] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  // Get current session user
  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/auth/login");
        return;
      }
      setUser(data.session.user);
    };
    initUser();
  }, [supabase, router]);

  // Initialize chatkit (if used)
  useEffect(() => {
    const init = async () => {
      try {
        const clientSecret = await initializeChatKitSession();
        setSessionId(clientSecret);
        setChatKitReady(true);
      } catch (err) {
        console.warn("ChatKit init failed, falling back", err);
        setChatKitReady(true);
      }
    };
    if (user) init();
  }, [user]);

  // Load chats for the logged-in user
  useEffect(() => {
    if (!user) return;

    const loadChats = async () => {
      const { data: chatRows, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load chats:", error);
        return;
      }

      const mapped: Chat[] = (chatRows || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        messages: c.messages || [],
        createdAt: new Date(c.created_at).toISOString(),
      }));

      setChats(mapped);

      // Auto-create chat if empty
      if (mapped.length === 0) createNewChat();
      else setCurrentChatId(mapped[0].id);
    };

    loadChats();
  }, [user, supabase]);




  

  // Create a new chat for this user
 const createNewChat = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data: chatRow, error } = await supabase
        .from("chats")
        .insert([{ user_id: user.id, title: "New Chat", messages: [INITIAL_MESSAGE] }])
        .select()
        .single();

      if (error) throw error;

      const newChat: Chat = {
        id: chatRow.id,
        title: chatRow.title,
        messages: chatRow.messages || [],
        createdAt: new Date(chatRow.created_at).toISOString(),
      };

      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
    } catch (err) {
      console.error("createNewChat error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const currentChat = chats.find((c) => c.id === currentChatId) || chats[0];

  const handleSendMessage = async (content: string) => {
    // Ensure there's a current chat; create one if missing
    if (!currentChat) {
      await createNewChat();
    }

    const chatId = (currentChat || chats[0])?.id;
    if (!chatId) {
      console.error("No chat available to send message");
      return;
    }

    // create user message with temp id for optimistic update
    const userMessage = { id: Date.now().toString(), role: "user" as const, content };

    // Optimistically update UI for the target chat
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, userMessage] } : c))
    );

    setIsLoading(true);

    try {
      let responseContent = "";

      // Do not change this block:
      if (chatKitReady && sessionId) {
        responseContent = await sendMessageToChatKit(content, sessionId, user.id);
      } else {
        const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
        if (!fastApiUrl) throw new Error("NEXT_PUBLIC_FASTAPI_URL is not configured");

        const userIdToSend = user || "guest";
        const sessionIdToSend = sessionId || "default-session";

        const response = await fetch(`${fastApiUrl}/agent/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionIdToSend,
            content,
            user_id: user,
          }),
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const data = await response.json();
        responseContent = data.message || data.response || "I couldn't process that request. Please try again.";
      }

      // create assistant message
      const assistantMessage = { id: Date.now().toString(), role: "assistant" as const, content: responseContent };

      // Append assistant response to state for the target chat
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, assistantMessage] } : c))
      );

      // Persist updated messages array (use the latest messages for this chat)
      const targetChat = chats.find((c) => c.id === chatId) || currentChat || { messages: [] as Array<any> };
      const updatedMessages = [...(targetChat.messages || []), userMessage, assistantMessage];
      await supabase.from("chats").update({ messages: updatedMessages }).eq("id", chatId);
    } catch (err) {
      console.error("handleSendMessage error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await supabase.from("chats").delete().eq("id", chatId).eq("user_id", user.id);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      console.error("delete chat error", err);
    }if (chats.length===0){ createNewChat();}

  };


  const handleNewChatClick = () => createNewChat();

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const exportPpt = async () => {
    setExportError(null)
    if (!currentChatId) {
      setExportError("No chat selected to export.")
      return
    }
    setExporting(true)
    try {
      const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
      if (!fastApiUrl) throw new Error("NEXT_PUBLIC_FASTAPI_URL is not configured")

      const res = await fetch(`${fastApiUrl}/chat/export/pptx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: currentChatId }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        throw new Error(text || `Export failed with status ${res.status}`)
      }

      const blob = await res.blob()
      let outName = `chat_export_${new Date().toISOString().replace(/[:.]/g, "-")}.pptx`
      const cd = res.headers.get("content-disposition")
      if (cd) {
        const m = /filename\s*=\s*"?([^\";]+)"?/i.exec(cd)
        if (m && m[1]) outName = m[1]
      }

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
      setExportError(err?.message || "Export failed")
    } finally {
      setExporting(false)
    }
  }

  return (
    <main className="flex h-screen bg-background overflow-hidden">
      <div className="group hidden lg:flex">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Sidebar
            chats={chats}
            currentChatId={currentChatId}
            onNewChat={handleNewChatClick}
            onSelectChat={setCurrentChatId}
            onDeleteChat={handleDeleteChat}
            onLogout={async () => { await supabase.auth.signOut(); router.push("/"); }}
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
              onNewChat={handleNewChatClick}
              onSelectChat={(chatId) => { setCurrentChatId(chatId); setSidebarOpen(false); }}
              onDeleteChat={handleDeleteChat}
              onLogout={async () => { await supabase.auth.signOut(); router.push("/"); }}
            />
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col relative">
        <div className="lg:hidden border-b border-border bg-background px-3 sm:px-4 py-3 flex items-center justify-between">
          <DragDropOverlay isVisible={isDragging} />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-foreground/5 rounded-lg transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-sm font-medium text-foreground">Chat</h1>
          <div className="w-8" />
        </div>

        {currentChat && (
          <>
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md p-2 border border-border">
              {/* clickable SVG will be added by you at public/ppt.svg — clicking it triggers exportPpt */}
             
                
               
              <ExportPptButton chatId={currentChatId} onClick={exportPpt} className="hidden sm:block" />
              {exportError && <div className="text-sm text-red-600">{exportError}</div>}
            </div>
            <ChatWindow messages={currentChat.messages} isLoading={isLoading} />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </>
        )}
      </div>
    </main>
  );
}