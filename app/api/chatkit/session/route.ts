// import { NextResponse } from "next/server"

// export async function POST() {
//   try {
//     const backendUrl = process.env.NEXT_PUBLIC_FASTAPI_URL 
    
//     console.log("[v0] Calling FastAPI backend at:", backendUrl)
    
//     const response = await fetch(`${backendUrl}/api/chatkit/session/`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })

//     const responseText = await response.text()
    
//     if (!response.ok) {
//       console.error("[v0] Backend error:", responseText)
//       return NextResponse.json(
//         { error: `Backend error: ${responseText.substring(0, 100)}` },
//         { status: response.status }
//       )
//     }

//     let data
//     try {
//       data = JSON.parse(responseText)
//     } catch (jsonError) {
//       console.error("[v0] Failed to parse backend response:", responseText)
//       return NextResponse.json(
//         { error: "Backend returned invalid JSON" },
//         { status: 500 }
//       )
//     }
    
//     return NextResponse.json({
//       clientSecret: data.client_secret || data.clientSecret,
//     })
//   } catch (error) {
//     console.error("[v0] ChatKit session error:", error)
//     return NextResponse.json(
//       { error: "Failed to create ChatKit session: " + String(error) },
//       { status: 500 }
//     )
//   }
// }
