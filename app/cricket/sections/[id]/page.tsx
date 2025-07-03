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

export default function SectionForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNew = params.id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [section, setSection] = useState({
    page: "",
    section_name: "",
    title: "",
    subtitle: "",
    content: "",
    image_url: "",
    button_text: "",
    button_link: "",
    button_text_secondary: "",
    button_link_secondary: "",
    is_active: true,
    sort_order: 0,
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const pages = [
    { value: "home", label: "Home Page" },
    { value: "about", label: "About Page" },
    { value: "contact", label: "Contact Page" },
    { value: "team", label: "Team Page" },
    { value: "gallery", label: "Gallery Page" },
  ]

  // Fetch section data if editing
  useEffect(() => {
    if (isNew) return

    async function fetchSection() {
      try {
        const response = await fetch(`/api/sections/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch section")
        }
        const data = await response.json()
        setSection(data)
        if (data.image_url) {
          setImagePreview(data.image_url)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSection()
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
      const updatedSection = { ...section }

      // Upload image if selected
      if (imageFile) {
        setUploading(true)
        setSuccess("Uploading image...")

        const formData = new FormData()
        formData.append("file", imageFile)
        formData.append("folder", "sections")

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image")
        }

        const { url } = await uploadResponse.json()
        updatedSection.image_url = url
        setSuccess("Image uploaded successfully!")
        setUploading(false)
      }

      // Create or update section
      setSuccess("Saving section...")
      const url = isNew ? "/api/sections" : `/api/sections/${params.id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSection),
      })

      if (!response.ok) {
        throw new Error("Failed to save section")
      }

      setSuccess("Section saved successfully!")

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push("/cricket/sections")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading section data...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle>{isNew ? "Add New Section" : "Edit Section"}</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="page">Page</Label>
                    <Select value={section.page} onValueChange={(value) => setSection({ ...section, page: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        {pages.map((page) => (
                          <SelectItem key={page.value} value={page.value}>
                            {page.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="section_name">Section Name</Label>
                    <Input
                      id="section_name"
                      value={section.section_name}
                      onChange={(e) => setSection({ ...section, section_name: e.target.value })}
                      placeholder="e.g., hero, team, stats"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={section.subtitle}
                      onChange={(e) => setSection({ ...section, subtitle: e.target.value })}
                      placeholder="Section subtitle"
                    />
                  </div>

                  <div>
                    <Label htmlFor="button_text">Primary Button Text</Label>
                    <Input
                      id="button_text"
                      value={section.button_text}
                      onChange={(e) => setSection({ ...section, button_text: e.target.value })}
                      placeholder="Button text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="button_link">Primary Button Link</Label>
                    <Input
                      id="button_link"
                      value={section.button_link}
                      onChange={(e) => setSection({ ...section, button_link: e.target.value })}
                      placeholder="Button link"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="button_text_secondary">Secondary Button Text</Label>
                    <Input
                      id="button_text_secondary"
                      value={section.button_text_secondary}
                      onChange={(e) => setSection({ ...section, button_text_secondary: e.target.value })}
                      placeholder="Secondary button text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="button_link_secondary">Secondary Button Link</Label>
                    <Input
                      id="button_link_secondary"
                      value={section.button_link_secondary}
                      onChange={(e) => setSection({ ...section, button_link_secondary: e.target.value })}
                      placeholder="Secondary button link"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={section.sort_order}
                      onChange={(e) => setSection({ ...section, sort_order: Number.parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={section.is_active}
                      onCheckedChange={(checked) => setSection({ ...section, is_active: checked as boolean })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <div>
                    <Label htmlFor="image">Section Image</Label>
                    <Input id="image" type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm mb-1">Preview:</p>
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
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title (HTML allowed)</Label>
                <Textarea
                  id="title"
                  value={section.title}
                  onChange={(e) => setSection({ ...section, title: e.target.value })}
                  placeholder="Section title (HTML allowed)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={section.content}
                  onChange={(e) => setSection({ ...section, content: e.target.value })}
                  rows={6}
                  placeholder="Section content"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/cricket/sections")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
                >
                  {saving ? (uploading ? "Uploading..." : "Saving...") : "Save Section"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
