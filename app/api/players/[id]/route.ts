import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET a specific player
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { data, error } = await supabase.from("players").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch player" }, { status: 500 })
  }
}

// UPDATE a player
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const updates = await request.json()

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase.from("players").update(updates).eq("id", id).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update player" }, { status: 500 })
  }
}

// DELETE a player
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { error } = await supabase.from("players").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Player deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete player" }, { status: 500 })
  }
}
