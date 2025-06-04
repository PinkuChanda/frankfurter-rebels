import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET all about content or by section type
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const sectionType = searchParams.get("section_type")

    let query = supabase.from("about_content").select("*")

    if (sectionType) {
      query = query.eq("section_type", sectionType)
    }

    query = query.eq("is_active", true).order("sort_order")

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch about content" }, { status: 500 })
  }
}

// POST new about content
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const aboutData = await request.json()

    const { data, error } = await supabase.from("about_content").insert([aboutData]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create about content" }, { status: 500 })
  }
}
