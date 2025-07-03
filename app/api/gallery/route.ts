import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season")

    let query = supabase.from("gallery").select("*")

    if (season) {
      query = query.eq("season", season)
    }

    const { data: gallery, error } = await query.order("created_at", { ascending: true })

    if (error) {
      console.error("Gallery fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Gallery data fetched:", gallery?.length || 0, "items")
    return NextResponse.json(gallery || [])
  } catch (error) {
    console.error("Gallery API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    console.log("Gallery POST request body:", body)

    // Validate required fields
    if (!body.title || !body.image_url) {
      return NextResponse.json({ error: "Title and image URL are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("gallery")
      .insert([
        {
          title: body.title,
          description: body.description || "",
          image_url: body.image_url,
          category: body.category || "event",
          season: body.season || "2025",
          is_active: body.is_active !== undefined ? body.is_active : true,
        },
      ])
      .select()

    if (error) {
      console.error("Gallery insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Gallery insert success:", data)
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Gallery POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
