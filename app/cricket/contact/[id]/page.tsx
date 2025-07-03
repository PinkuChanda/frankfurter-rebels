"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ContactForm({ params }: { params: { id: string } }) {
  const router = useRouter()
  const isNew = params.id === "new"
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [contactInfo, setContactInfo] = useState({
    type: "",
    label: "",
    value: "",
    icon: "",
    link: "",
    is_active: true,
    sort_order: 0,
  })

  const types = [
    { value: "contact", label: "Contact" },
    { value: "location", label: "Location" },
    { value: "hours", label: "Hours" },
    { value: "social", label: "Social Media" },
  ]

  const icons = [
    { value: "Mail", label: "Mail" },
    { value: "Phone", label: "Phone" },
    { value: "MapPin", label: "Map Pin" },
    { value: "Clock", label: "Clock" },
    { value: "Facebook", label: "Facebook" },
    { value: "Instagram", label: "Instagram" },
    { value: "Twitter", label: "Twitter" },
  ]

  // Fetch contact info data if editing
  useEffect(() => {
    if (isNew) return

    async function fetchContactInfo() {
      try {
        const response = await fetch(`/api/contact-info/${params.id}`)
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

    fetchContactInfo()
  }, [isNew, params.id])

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      setSuccess("Saving contact info...")

      // Create or update contact info
      const url = isNew ? "/api/contact-info" : `/api/contact-info/${params.id}`
      const method = isNew ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactInfo),
      })

      if (!response.ok) {
        throw new Error("Failed to save contact info")
      }

      setSuccess("Contact info saved successfully!")

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push("/cricket/contact")
        router.refresh()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="container mx-auto py-10">Loading contact info data...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-sm">
          <CardHeader>
            <CardTitle>{isNew ? "Add New Contact Info" : "Edit Contact Info"}</CardTitle>
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
                <Label htmlFor="type">Type</Label>
                <Select
                  value={contactInfo.type}
                  onValueChange={(value) => setContactInfo({ ...contactInfo, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={contactInfo.label}
                  onChange={(e) => setContactInfo({ ...contactInfo, label: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  value={contactInfo.value}
                  onChange={(e) => setContactInfo({ ...contactInfo, value: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={contactInfo.icon}
                  onValueChange={(value) => setContactInfo({ ...contactInfo, icon: value })}
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
                <Label htmlFor="link">Link (optional)</Label>
                <Input
                  id="link"
                  value={contactInfo.link}
                  onChange={(e) => setContactInfo({ ...contactInfo, link: e.target.value })}
                  placeholder="mailto:, tel:, or URL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={contactInfo.sort_order}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, sort_order: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="is_active"
                    checked={contactInfo.is_active}
                    onCheckedChange={(checked) => setContactInfo({ ...contactInfo, is_active: checked as boolean })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/cricket/contact")}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700"
                >
                  {saving ? "Saving..." : "Save Contact Info"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
