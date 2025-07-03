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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AboutForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNew = params.id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [aboutContent, setAboutContent] = useState({
    section_type: "",
    title: "",
    content: "",
    image_url: "",
    icon: "",
    is_active: true,
    sort_order: 0,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const sectionTypes = [
    { value: "mission", label: "Mission" },
    { value: "vision", label: "Vision" },
    { value: "values", label: "Values" },
    { value: "history", label: "History" },
  ]

  const icons = [
    { value: "Heart", label: "Heart" },
    { value: "Users", label: "Users" },
    { value: "Target", label: "Target" },
    { value: "Award", label: "Award" },
    { value: "Trophy", label: "Trophy" },
    { value: "Shield", label: "Shield" },
  ]

  // Fetch about content data if editing
  useEffect(() => {
    if (isNew) return

    async function fetchAboutContent() {
      try {
        const response = await fetch(`/api/about-content/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch about content")
        }
        const data = await response.json()
        setAboutContent(data)
        if (data.image_url) {
          setImagePreview(data.image_url)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutContent()
  }, [isNew, params.id])

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)

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
    setSuccess(null)

    try {
      const updatedAboutContent = { ...aboutContent }

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        setSuccess("Uploading image...")

        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("folder", "about")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }

        const { url } = await uploadResponse.json()
        updatedAboutContent.image_url = url
        setSuccess("Image uploaded successfully!")
        setUploading(false)
      }

      // Create or update about content
      setSuccess("Saving about content...")
      const url = isNew ? "/api/about-content" : `/api/about-content/${params.id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAboutContent),
      })

      if (!response.ok) {
        throw new Error("Failed to save about content")
      }

      setSuccess("About content saved successfully!")

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push("/cricket/about")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading about content data...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle>{isNew ? "Add New About Content" : "Edit About Content"}</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="section_type">Section Type</Label>
                <Select
                  value={aboutContent.section_type}
                  onValueChange={(value) => setAboutContent({ ...aboutContent, section_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={aboutContent.title}
                  onChange={(e) => setAboutContent({ ...aboutContent, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={aboutContent.icon}
                  onValueChange={(value) => setAboutContent({ ...aboutContent, icon: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {icons.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        {icon.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={aboutContent.content}
                  onChange={(e) => setAboutContent({ ...aboutContent, content: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div>
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-sm mb-2">Preview:</p>
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      width={200}
                      height={150}
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={aboutContent.sort_order}
                    onChange={(e) =>
                      setAboutContent({ ...aboutContent, sort_order: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="is_active"
                    checked={aboutContent.is_active}
                    onCheckedChange={(checked) => setAboutContent({ ...aboutContent, is_active: checked as boolean })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => router.push("/cricket/about")} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
                >
                  {saving ? (uploading ? "Uploading..." : "Saving...") : "Save Content"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
