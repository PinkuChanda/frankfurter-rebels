"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function GalleryForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNew = params.id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const [image, setImage] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    is_active: true,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const categories = [
    { value: "training", label: "Training Sessions" },
    { value: "match", label: "Match Moments" },
    { value: "event", label: "Team Events" },
    { value: "behind-scenes", label: "Behind the Scenes" },
  ]

  // Fetch image data if editing
  useEffect(() => {
    if (isNew) return

    async function fetchImage() {
      try {
        const response = await fetch(`/api/gallery/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch image")
        }
        const data = await response.json()
        setImage(data)
        if (data.image_url) {
          setImagePreview(data.image_url)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [isNew, params.id])

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    setImageFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updatedImage = { ...image }

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        setUploadStatus("Uploading image...")

        console.log("Starting image upload:", {
          fileName: imageFile.name,
          fileSize: imageFile.size,
          fileType: imageFile.type,
        })

        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("folder", "gallery")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        console.log("Upload response status:", uploadResponse.status)

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error("Upload error response:", errorText)
          let errorMessage = "Failed to upload image"
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || errorMessage
            console.error("Parsed error data:", errorData)
          } catch {
            errorMessage = errorText || errorMessage
          }
          throw new Error(errorMessage)
        }

        const uploadResult = await uploadResponse.json()
        console.log("Upload success:", uploadResult)

        updatedImage.image_url = uploadResult.url
        setUploadStatus("Image uploaded successfully!")
        setUploading(false)
      }

      // Create or update image
      setUploadStatus("Saving gallery image...")
      const url = isNew ? "/api/gallery" : `/api/gallery/${params.id}`
      const method = isNew ? "POST" : "PUT"

      console.log("Saving gallery image:", updatedImage)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedImage),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = "Failed to save image"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      console.log("Gallery image saved successfully")

      // Redirect back to admin dashboard
      router.push("/cricket")
      router.refresh()
    } catch (err: any) {
      console.error("Error saving gallery image:", err)
      setError(err.message)
      setSaving(false)
      setUploading(false)
      setUploadStatus(null)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading image data...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle>{isNew ? "Add New Image" : "Edit Image"}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {uploadStatus && (
              <Alert className="mb-6 bg-blue-50">
                <AlertDescription>{uploadStatus}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={image.title}
                  onChange={(e) => setImage({ ...image, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={image.category} onValueChange={(value) => setImage({ ...image, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={image.description}
                  onChange={(e) => setImage({ ...image, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                <p className="text-sm text-gray-500 mt-1">Max file size: 5MB</p>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm mb-2">Preview:</p>
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      width={300}
                      height={200}
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={image.is_active}
                  onCheckedChange={(checked) => setImage({ ...image, is_active: checked })}
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Active (Show on website)
                </Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push("/cricket")} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
                >
                  {saving ? "Saving..." : uploading ? "Uploading..." : "Save Image"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
