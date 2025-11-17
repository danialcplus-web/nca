"use client"

// Initialize ChatKit client with your session credentials
export async function initializeChatKitSession() {
  try {
    const response = await fetch("/api/chatkit/session", {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ChatKit session error response:", errorText)
      throw new Error(`Failed to initialize ChatKit session: ${response.status}`)
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
    
    console.log("[v0] Sending to:", `${backendUrl}/api/chatkit/message`)
    
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
      const errorText = await response.text()
      console.error("[v0] ChatKit message error response:", errorText)
      throw new Error(`Failed to send message: ${response.status} - ${errorText.substring(0, 100)}`)
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      const text = await response.text()
      console.error("[v0] Failed to parse JSON response:", text)
      throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`)
    }
    
    return data.response || data.message || "Request processed"
  } catch (error) {
    console.error("[v0] Error sending message to ChatKit:", error)
    throw error
  }
}
