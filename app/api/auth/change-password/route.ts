import { NextResponse } from "next/server"
import { changeAdminPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both passwords are required" }, { status: 400 })
    }

    const result = await changeAdminPassword("admin@frankfurterrebels.de", currentPassword, newPassword)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
