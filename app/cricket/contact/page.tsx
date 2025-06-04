"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Edit, Trash2, Plus, Phone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ContactInfo {
  id: number
  type: string
  label: string
  value: string
  icon: string
  link: string
  is_active: boolean
  sort_order: number
}

export default function ContactManagement() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch("/api/contact-info")
      if (!response.ok) {
        throw new Error("Failed to fetch contact info")
      }
      const data = await response.json()
      setContactInfo(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteContactInfo = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact info?")) return

    try {
      const response = await fetch(`/api/contact-info/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete contact info")
      }

      await fetchContactInfo()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading contact info...</div>

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Contact Information Management</h1>
        <div className="flex gap-2">
          <Link href="/cricket">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/cricket/contact/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Contact Info
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
        {contactInfo.map((info) => (
          <Card key={info.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>{info.label}</span>
                  <Badge variant={info.is_active ? "default" : "secondary"}>
                    {info.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">{info.type}</Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/cricket/contact/${info.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" size="sm" onClick={() => deleteContactInfo(info.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <strong>Type:</strong> {info.type}
                </div>
                <div>
                  <strong>Icon:</strong> {info.icon}
                </div>
                <div>
                  <strong>Value:</strong> {info.value}
                </div>
                <div>
                  <strong>Link:</strong> {info.link || "None"}
                </div>
                <div>
                  <strong>Sort Order:</strong> {info.sort_order}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {contactInfo.length === 0 && (
          <Card>
            <CardContent className="text-center py-10">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No contact information found.</p>
              <Link href="/cricket/contact/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Contact Info
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
