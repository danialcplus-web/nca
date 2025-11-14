"use client"

// Initialize ChatKit client with your session credentials
export async function initializeChatKitSession() {
  try {
    const response = await fetch("/api/chatkit/session", {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to initialize ChatKit session")
    }

    const { clientSecret } = await response.json()
    
    console.log("[v0] ChatKit session initialized successfully")
    
    return clientSecret
  } catch (error) {
    console.error("[v0] Error initializing ChatKit:", error)
    throw error
  }
}

// Send message through ChatKit
export async function sendMessageToChatKit(message: string, sessionId: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"
    
    const response = await fetch(`${backendUrl}/api/chatkit/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to send message")
    }

    const data = await response.json()
    
    return data.response
  } catch (error) {
    console.error("[v0] Error sending message to ChatKit:", error)
    throw error
  }
}
