import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET all team stats
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.from("team_stats").select("*").eq("is_active", true).order("sort_order")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch team stats" }, { status: 500 })
  }
}

// POST a new team stat
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const statData = await request.json()

    const { data, error } = await supabase.from("team_stats").insert([statData]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create team stat" }, { status: 500 })
  }
}
