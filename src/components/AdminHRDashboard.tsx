"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { useAuth } from "../contexts/useAuth"
import { Users, Calendar, KeyRound } from "lucide-react"

import HeaderBar from "../components/dashboard/HeaderBar"
import EmployeeManagement from "../components/admin-dashboard/EmployeeManagement"
import AttendanceMonitoring from "../components/admin-dashboard/AttendanceMonitoring"
import AdminSecurity from "../components/admin-dashboard/AdminSecurity"
import EmployeeProfile from "../components/admin-dashboard/EmployeeProfile"
import type { employeeNext } from "../types"

export default function AdminDashboard() {
    const { user, logout, isLoading } = useAuth()
    const [activeTab, setActiveTab] = useState<"employees" | "attendance" | "my-security">("employees")
    const [selectedEmployee, setSelectedEmployee] = useState<employeeNext | null>(null)
    const [photoModal, setPhotoModal] = useState<string | null>(null)

    const isAdmin = (typeof user?.role === "string" && user.role === "admin") ||
        (typeof user?.role === "object" && user.role?.name?.toLowerCase() === "admin")
    const isHR = (typeof user?.role === "string" && user.role === "hr") ||
        (typeof user?.role === "object" && user.role?.name?.toLowerCase() === "hr")

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading dashboard...
            </div>
        )
    }

    const handleViewProfile = (employee: employeeNext) => setSelectedEmployee(employee)
    const handleViewPhoto = (photo: string) => setPhotoModal(photo)

    if (selectedEmployee) {
        return <EmployeeProfile employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} />
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <HeaderBar userName={user?.name || "Admin"} onLogout={logout} />

            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 rounded-lg p-2 bg-white shadow-sm border">
                    {(isAdmin || isHR) && (
                        <>
                            <Button
                                variant={activeTab === "employees" ? "default" : "outline"}
                                onClick={() => setActiveTab("employees")}
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Employee Management
                            </Button>

                            <Button
                                variant={activeTab === "attendance" ? "default" : "outline"}
                                onClick={() => setActiveTab("attendance")}
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Attendance Monitoring
                            </Button>

                            <Button
                                variant={activeTab === "my-security" ? "default" : "outline"}
                                onClick={() => setActiveTab("my-security")}
                            >
                                <KeyRound className="h-4 w-4 mr-2" />
                                Security
                            </Button>
                        </>
                    )}
                </div>

                {/* Tab Views */}
                {activeTab === "employees" && <EmployeeManagement onViewProfile={handleViewProfile} />}
                {activeTab === "attendance" && <AttendanceMonitoring onViewPhoto={handleViewPhoto} />}
                {activeTab === "my-security" && <AdminSecurity />}
            </div>

            {/* Photo Modal */}
            {photoModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setPhotoModal(null)}
                >
                    <div className="bg-white p-4 rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Attendance Photo</h3>
                            <Button variant="outline" size="sm" onClick={() => setPhotoModal(null)}>
                                Close
                            </Button>
                        </div>
                        <img src={photoModal || "/placeholder.svg"} alt="Attendance" className="w-full h-auto rounded" />
                    </div>
                </div>
            )}
        </div>
    )
}
