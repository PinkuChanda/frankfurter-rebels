import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("players").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Player fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Player API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    console.log("Player PUT request body:", body)

    const { data, error } = await supabase
      .from("players")
      .update({
        name: body.name,
        role: body.role,
        image_url: body.image_url || "",
        experience: body.experience || "",
        description: body.description || "",
        is_owner: Boolean(body.is_owner),
        owner_title: body.owner_title || "",
        is_captain: Boolean(body.is_captain),
        is_management: Boolean(body.is_management),
        management_role: body.management_role || "",
        matches: Number(body.matches) || 0,
        runs: Number(body.runs) || 0,
        wickets: Number(body.wickets) || 0,
        season: body.season || "2025",
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Player update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Player update success:", data)
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Player PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("players").delete().eq("id", params.id)

    if (error) {
      console.error("Player delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Player DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
