import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET all players
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const season = searchParams.get("season")

    let query = supabase.from("players").select("*")

    if (featured === "true") {
      // Return owners and captains for featured display
      query = query.or("is_owner.eq.true,is_captain.eq.true")
    }

    if (season) {
      query = query.eq("season", season)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Players fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Players data fetched:", data?.length || 0, "items")
    return NextResponse.json(data)
  } catch (error) {
    console.error("Players API error:", error)
    return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 })
  }
}

// POST new player
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    console.log("Player POST request body:", body)

    // Validate required fields
    if (!body.name || !body.role) {
      return NextResponse.json({ error: "Name and role are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("players")
      .insert([
        {
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Player insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Player insert success:", data)
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Player POST error:", error)
    return NextResponse.json({ error: "Failed to create player" }, { status: 500 })
  }
}
