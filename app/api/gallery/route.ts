import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: gallery, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Gallery fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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

    const { data, error } = await supabase
      .from("gallery")
      .insert([
        {
          title: body.title || "",
          description: body.description || "",
          image_url: body.image_url || "",
          category: body.category || "",
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
