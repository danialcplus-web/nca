"use client"

const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
// Initialize ChatKit client with your session credentials
export async function initializeChatKitSession() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL 
    
    // Add validation
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_FASTAPI_URL is not defined")
    }
    
    console.log("[v0] Backend URL:", backendUrl) // Debug log
    
    const response = await fetch(`${backendUrl}/api/chatkit/session`, {
      method: "POST",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] ChatKit session error response:", errorText)
      throw new Error(`Failed to initialize ChatKit session: ${response.status}`)
    }

    const { client_secret } = await response.json()
    
    console.log("[v0] ChatKit session initialized successfully")
    
    return client_secret
  } catch (error) {
    console.error("[v0] Error initializing ChatKit:", error)
    throw error
  }
}

// Send message through ChatKit
export async function sendMessageToChatKit(message: string, sessionId: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL
    
    if (!backendUrl) {
      throw new Error("NEXT_PUBLIC_FASTAPI_URL is not defined")
    }
    
    console.log("Sending to:", `${backendUrl}/api/chatkit/message`)
    
    const response = await fetch(`${backendUrl}/api/chatkit/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
        session_id: sessionId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ChatKit message error response:", errorText)
      throw new Error(`Failed to send message: ${response.status} - ${errorText.substring(0, 100)}`)
    }

    let data
    try {
      data = await response.json()
    } catch (jsonError) {
      const text = await response.text()
      console.error("Failed to parse JSON response:", text)
      throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`)
    }
    
    return data.response || data.message || "Request processed"
  } catch (error) {
    console.error("Error sending message to ChatKit:", error)
    throw error
  }
}
