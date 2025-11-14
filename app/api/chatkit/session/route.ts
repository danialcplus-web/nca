import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Call your FastAPI backend to create a ChatKit session
    const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"
    
    const response = await fetch(`${backendUrl}/api/chatkit/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to create ChatKit session")
    }

    const data = await response.json()
    
    return NextResponse.json({
      clientSecret: data.client_secret,
    })
  } catch (error) {
    console.error("[v0] ChatKit session error:", error)
    return NextResponse.json(
      { error: "Failed to create ChatKit session" },
      { status: 500 }
    )
  }
}
