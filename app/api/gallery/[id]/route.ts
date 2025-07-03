import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("gallery").select("*").eq("id", params.id).single()

    if (error) {
      console.error("Gallery item fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Gallery item API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    console.log("Gallery PUT request body:", body)

    const { data, error } = await supabase
      .from("gallery")
      .update({
        title: body.title,
        description: body.description || "",
        image_url: body.image_url,
        category: body.category || "event",
        season: body.season || "2025",
        is_active: body.is_active !== undefined ? body.is_active : true,
      })
      .eq("id", params.id)
      .select()

    if (error) {
      console.error("Gallery update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Gallery update success:", data)
    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Gallery PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from("gallery").delete().eq("id", params.id)

    if (error) {
      console.error("Gallery delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Gallery DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
