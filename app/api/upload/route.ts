import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called")

    const supabase = createServerSupabaseClient()
    const formData = await request.formData()

    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      console.error("No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      folder: folder,
    })

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.error("File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type)
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
        { status: 400 },
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop()
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`

    console.log("Generated filename:", fileName)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    console.log("File converted to buffer, size:", buffer.length)

    // Check if bucket exists, create if it doesn't
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error listing buckets:", bucketsError)
      return NextResponse.json({ error: "Storage service error" }, { status: 500 })
    }

    const publicBucketExists = buckets?.some((bucket) => bucket.id === "public")

    if (!publicBucketExists) {
      console.log("Creating public bucket...")
      const { error: createBucketError } = await supabase.storage.createBucket("public", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: allowedTypes,
      })

      if (createBucketError) {
        console.error("Error creating bucket:", createBucketError)
        return NextResponse.json({ error: "Failed to create storage bucket" }, { status: 500 })
      }
      console.log("Public bucket created successfully")
    }

    // Upload file to Supabase Storage
    console.log("Uploading file to storage...")
    const { data, error } = await supabase.storage.from("public").upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json(
        {
          error: `Upload failed: ${error.message}`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log("Upload successful:", data)

    // Get public URL
    const { data: urlData } = supabase.storage.from("public").getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl
    console.log("Generated public URL:", publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: fileName,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Unexpected error in upload API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
