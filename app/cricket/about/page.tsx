"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Edit, Trash2, Plus, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface AboutContent {
  id: number
  section_type: string
  title: string
  content: string
  icon: string
  is_active: boolean
  sort_order: number
}

export default function AboutManagement() {
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAboutContent()
  }, [])

  const fetchAboutContent = async () => {
    try {
      const response = await fetch("/api/about-content")
      if (!response.ok) {
        throw new Error("Failed to fetch about content")
      }
      const data = await response.json()
      setAboutContent(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteContent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      const response = await fetch(`/api/about-content/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete content")
      }

      await fetchAboutContent()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading about content...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">About Content Management</h1>
        <div className="flex gap-2">
          <Link href="/cricket">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/cricket/about/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Content
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {aboutContent.map((content) => (
          <Card key={content.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>{content.title}</span>
                  <Badge variant={content.is_active ? "default" : "secondary"}>
                    {content.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{content.section_type}</Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/cricket/about/${content.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => deleteContent(content.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>Section Type:</strong> {content.section_type}
                </div>
                <div>
                  <strong>Icon:</strong> {content.icon}
                </div>
                <div>
                  <strong>Sort Order:</strong> {content.sort_order}
                </div>
              </div>
              <div>
                <strong>Content:</strong>
                <p className="text-gray-600 mt-1 line-clamp-3">{content.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {aboutContent.length === 0 && (
          <Card>
            <CardContent className="text-center py-10">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No about content found.</p>
              <Link href="/cricket/about/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Content
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
