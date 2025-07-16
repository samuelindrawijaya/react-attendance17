"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/useAuth"
import { Clock, User, KeyRound } from "lucide-react"

import HeaderBar from "../components/dashboard/HeaderBar"
import ProfileTab from "../components/dashboard/ProfileTab"
import AttendanceTab from "../components/dashboard/AttendanceTab"
import SecurityTab from "../components/dashboard/SecurityTab"

export default function EmployeeDashboard() {
  const { user, token, isLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"attendance" | "profile" | "security">("attendance")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading dashboard...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar userName={user?.name || "User"} onLogout={logout} />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-1">
          <Button
            variant={activeTab === "attendance" ? "default" : "outline"}
            onClick={() => setActiveTab("attendance")}
          >
            <Clock className="h-4 w-4 mr-2" />
            Attendance
          </Button>

          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4 mr-2" />
            Profile & History
          </Button>

          <Button
            variant={activeTab === "security" ? "default" : "outline"}
            onClick={() => setActiveTab("security")}
          >
            <KeyRound className="h-4 w-4 mr-2" />
            Security
          </Button>
        </div>

        {activeTab === "attendance" && (
          user && token ? (
            <AttendanceTab user={user} token={token} />
          ) : (
            <div className="text-center py-10 text-gray-500">Loading attendance...</div>
          )
        )}

        {activeTab === "profile" && (
          <ProfileTab />
        )}

        {activeTab === "security" && (
          <SecurityTab />
        )}
      </div>
    </div>
  )
}
