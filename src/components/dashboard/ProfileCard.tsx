"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Upload, Pencil, User } from "lucide-react"
import { useAuth } from "../../contexts/useAuth"
import axiosInstance from "../../lib/axiosInstance"

interface ProfileCardProps {
  profile: {
    full_name: string
    nik: string
    department: string
    position: string
    phone: string
    address: string
    hire_date: string
    status: string
    photo_url: string
  }
  email: string
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    photo: "/placeholder.svg",
    photoFile: null as File | null,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        photo: profile.photo_url || "/placeholder.svg",
        photoFile: null,
      })
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")

    try {
      const form = new FormData()
      form.append("full_name", formData.full_name)
      form.append("phone", formData.phone)
      form.append("address", formData.address)
      if (formData.photoFile) form.append("photo", formData.photoFile)

      const res = await axiosInstance.put("http://localhost:4003/api/employee/profile", form)

      const updatedEmployee = res.data.data
      updateUser({
        ...user!,
        name: updatedEmployee.full_name,
        employee: updatedEmployee,
      })

      setIsEditing(false)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
      else setError("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      photo: profile?.photo_url || "/placeholder.svg",
      photoFile: null,
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, photo: event.target?.result as string, photoFile: file }))
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>You can update your personal information below.</CardDescription>
          </div>
        </div>

        {!isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form className="space-y-6" onSubmit={handleSave}>
          <div className="flex items-start space-x-6 mb-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-200">
              <img src={formData.photo} alt="Profile" className="h-full w-full object-cover" />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="hidden"
              />
              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="absolute inset-0 bg-black/40 hover:bg-black/50 text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-5 w-5" />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{formData.full_name}</h3>
              <p className="text-gray-500 text-sm">{profile?.position}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={!isEditing}
              />

              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />

              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-800 whitespace-pre-line border rounded-md p-2">
                  {formData.address}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Department</Label>
              <Input value={profile?.department || "-"} disabled />

              <Label>Position</Label>
              <Input value={profile?.position || "-"} disabled />

              <Label>Hire Date</Label>
              <Input
                value={profile?.hire_date ? new Date(profile.hire_date).toLocaleDateString() : "-"}
                disabled
              />

              <Label>Status</Label>
              <Input value={profile?.status || "Active"} disabled />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {isEditing && (
            <div className="flex space-x-2 pt-4">
              <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
