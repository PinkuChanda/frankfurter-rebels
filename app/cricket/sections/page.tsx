"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Edit, Trash2, Plus, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Section {
  id: number
  page: string
  section_name: string
  title: string
  subtitle: string
  content: string
  button_text: string
  button_link: string
  is_active: boolean
  sort_order: number
}

export default function SectionsManagement() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const response = await fetch("/api/sections")
      if (!response.ok) {
        throw new Error("Failed to fetch sections")
      }
      const data = await response.json()
      setSections(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteSection = async (id: number) => {
    if (!confirm("Are you sure you want to delete this section?")) return

    try {
      const response = await fetch(`/api/sections/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete section")
      }

      await fetchSections()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading sections...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sections Management</h1>
        <div className="flex gap-2">
          <Link href="/cricket">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/cricket/sections/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Section
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
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>{section.title || section.section_name}</span>
                  <Badge variant={section.is_active ? "default" : "secondary"}>
                    {section.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/cricket/sections/${section.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => deleteSection(section.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <strong>Page:</strong> {section.page}
                </div>
                <div>
                  <strong>Section:</strong> {section.section_name}
                </div>
                <div>
                  <strong>Sort Order:</strong> {section.sort_order}
                </div>
                <div>
                  <strong>Button Text:</strong> {section.button_text || "None"}
                </div>
              </div>
              {section.content && (
                <div className="mt-4">
                  <strong>Content:</strong>
                  <p className="text-gray-600 mt-1 line-clamp-3">{section.content}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <Card>
            <CardContent className="text-center py-10">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No sections found.</p>
              <Link href="/cricket/sections/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Section
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
