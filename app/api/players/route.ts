import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET all players
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")

    let query = supabase.from("players").select("*")

    if (featured === "true") {
      // Return owners and captains for featured display
      query = query.or("is_owner.eq.true,is_captain.eq.true")
    }

    const { data, error } = await supabase.from("players").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

// POST new player
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("players")
      .insert([
        {
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}
