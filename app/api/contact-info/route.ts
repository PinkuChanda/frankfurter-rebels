import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// GET all contact info or by type
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let query = supabase.from("contact_info").select("*")

    if (type) {
      query = query.eq("type", type)
    }

    query = query.eq("is_active", true).order("sort_order")

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contact info" }, { status: 500 })
  }
}

// POST new contact info
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient()
    const contactData = await request.json()

    const { data, error } = await supabase.from("contact_info").insert([contactData]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create contact info" }, { status: 500 })
  }
}
