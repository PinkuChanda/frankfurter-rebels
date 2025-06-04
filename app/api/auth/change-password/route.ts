import { NextResponse } from "next/server"
import { changeAdminPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 })
    }

    // Add logging for debugging
    console.log("Attempting to change password from:", currentPassword, "to:", newPassword)

    const result = await changeAdminPassword("admin@frankfurterrebels.de", currentPassword, newPassword)

    // Log success
    console.log("Password change result:", result)

    return NextResponse.json(result)
  } catch (error: any) {
    // Log error
    console.error("Password change error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
