"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AlertCircle, Edit, Trash2, Plus, ImageIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"

interface GalleryImage {
  id: number
  title: string
  description: string
  image_url: string
  category: string
  created_at: string
}

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/gallery")
      if (!response.ok) {
        throw new Error("Failed to fetch gallery images")
      }
      const data = await response.json()
      setImages(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteImage = async (id: number) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      await fetchImages()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading gallery images...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <div className="flex gap-2">
          <Link href="/cricket">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/cricket/gallery/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Image
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <Card key={image.id}>
            <CardHeader className="pb-2">
              <div className="relative h-48 w-full">
                <Image
                  src={image.image_url || "/placeholder.svg"}
                  alt={image.title}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold">{image.title}</h3>
                <p className="text-sm text-gray-600">{image.description}</p>
                <p className="text-xs text-gray-500">Category: {image.category}</p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-gray-400">{new Date(image.created_at).toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Link href={`/cricket/gallery/${image.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => deleteImage(image.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {images.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-10">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No gallery images found.</p>
              <Link href="/cricket/gallery/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Image
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
