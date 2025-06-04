import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET all sections or sections for a specific page
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const page = searchParams.get("page")

    let query = supabase.from("sections").select("*")

    if (page) {
      query = query.eq("page", page)
    }

    query = query.eq("is_active", true).order("sort_order")

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 })
  }
}

// POST a new section
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const sectionData = await request.json()

    const { data, error } = await supabase.from("sections").insert([sectionData]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create section" }, { status: 500 })
  }
}
