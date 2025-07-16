"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Building, Briefcase, Clock, TrendingUp, Loader2, Eye, X, ChevronLeft, ChevronRight } from "lucide-react"
import type { employeeNext } from "../../types"
import axiosInstance from "../../lib/axiosInstance"

// Updated interface to match API response
interface AttendanceRecord {
  id: string
  user_id: string
  employee_id: string
  date: string
  check_in: string
  check_out: string | null
  type: "wfh" | "onsite"
  photo: string
  photo_url: string
  notes: string
  createdAt: string
  updatedAt: string
  is_on_time: boolean
  employee: {
    id: string
    full_name: string
    department: string
    position: string
  }
}

interface UserData {
  id: string
  name: string
  email: string
}

interface EmployeeProfileProps {
  employee: employeeNext
  onBack: () => void
}

interface ImageModalProps {
  isOpen: boolean
  imageUrl: string
  onClose: () => void
  attendanceDate: string
}

const ImageModal = ({ isOpen, imageUrl, onClose, attendanceDate }: ImageModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Attendance Photo - {new Date(attendanceDate).toLocaleDateString()}</h3>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4">
          <img
            src={imageUrl}
            alt="Attendance photo"
            className="w-full h-auto max-h-[70vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  )
}

export default function EmployeeProfile({ employee, onBack }: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "attendance">("profile")
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(5)

  // Image modal state
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    imageUrl: '',
    attendanceDate: ''
  })

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!employee.user_id) return

    setIsLoadingUser(true)
    try {
      const response = await axiosInstance.get(
        `http://localhost:4002/api/auth/user/${employee.user_id}`
      )

      if (response.data.success) {
        setUserData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoadingUser(false)
    }
  }, [employee.user_id])

  // Fetch user data when component mounts
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Use useCallback to memoize the function and prevent unnecessary re-renders
  const fetchAttendanceHistory = useCallback(async () => {
    setIsLoadingAttendance(true)
    setAttendanceError(null)

    try {
      const response = await axiosInstance.get(
        `http://localhost:4004/api/attendance/all?employee_id=${employee.id}`
      )

      if (response.data.success) {
        setAttendanceHistory(response.data.data || [])
      } else {
        setAttendanceError("Failed to fetch attendance data")
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
      setAttendanceError("Failed to fetch attendance data")
    } finally {
      setIsLoadingAttendance(false)
    }
  }, [employee.id])

  // Fetch attendance data when component mounts or when attendance tab is selected
  useEffect(() => {
    if (activeTab === "attendance") {
      fetchAttendanceHistory()
    }
  }, [activeTab, fetchAttendanceHistory])

  // Reset pagination when attendance data changes
  useEffect(() => {
    setCurrentPage(1)
  }, [attendanceHistory])

  const calculateWorkingHours = (checkIn: string, checkOut?: string | null) => {
    if (!checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) / 10
  }

  const totalWorkingHours = attendanceHistory.reduce(
    (acc, record) => acc + calculateWorkingHours(record.check_in, record.check_out),
    0,
  )

  const averageWorkingHours = attendanceHistory.length > 0 ? totalWorkingHours / attendanceHistory.length : 0

  const wfhCount = attendanceHistory.filter((r) => r.type === "wfh").length
  const onsiteCount = attendanceHistory.filter((r) => r.type === "onsite").length

  // Pagination calculations
  const totalPages = Math.ceil(attendanceHistory.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const currentRecords = attendanceHistory.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const openImageModal = (imageUrl: string, attendanceDate: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      attendanceDate
    })
  }

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      attendanceDate: ''
    })
  }

  const isValidImageUrl = (url: string) => {
    return url && url.trim() !== '' && url !== 'null' && url !== 'undefined'
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Employee Profile</h2>
          <p className="text-gray-600">View employee details and attendance history</p>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              {employee.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt={employee.full_name}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{employee.full_name}</h3>
                  <p className="text-lg text-gray-600">{employee.position}</p>
                  <p className="text-sm text-gray-500">NIK: {employee.nik}</p>
                </div>
                <Badge variant={employee.status === "active" ? "default" : "secondary"} className="text-sm">
                  {employee.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1">
        <Button variant={activeTab === "profile" ? "default" : "outline"} onClick={() => setActiveTab("profile")}>
          <User className="h-4 w-4 mr-2" />
          Profile Details
        </Button>
        <Button variant={activeTab === "attendance" ? "default" : "outline"} onClick={() => setActiveTab("attendance")}>
          <Calendar className="h-4 w-4 mr-2" />
          Attendance History
        </Button>
      </div>

      {/* Profile Details Tab */}
      {activeTab === "profile" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  {isLoadingUser ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <p className="font-medium">
                      {userData?.email || employee.user?.email || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{employee.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{employee.address || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Hire Date</p>
                  <p className="font-medium">{new Date(employee.hire_date).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance History Tab */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Loading State */}
          {isLoadingAttendance && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading attendance data...</span>
            </div>
          )}

          {/* Error State */}
          {attendanceError && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <p>{attendanceError}</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={fetchAttendanceHistory}
                  >
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attendance Data */}
          {!isLoadingAttendance && !attendanceError && (
            <>
              {/* Attendance Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{attendanceHistory.length}</div>
                    <p className="text-sm text-gray-600">Total Days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{wfhCount}</div>
                    <p className="text-sm text-gray-600">WFH Days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{onsiteCount}</div>
                    <p className="text-sm text-gray-600">Onsite Days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">{Math.round(averageWorkingHours * 10) / 10}h</div>
                    <p className="text-sm text-gray-600">Avg. Hours/Day</p>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records</CardTitle>
                  <CardDescription>
                    {attendanceHistory.length === 0
                      ? "No attendance records found"
                      : `Showing ${startIndex + 1}-${Math.min(endIndex, attendanceHistory.length)} of ${attendanceHistory.length} records`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {attendanceHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No attendance records found for this employee.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {currentRecords.map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <div className="text-sm font-medium">
                                  {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(record.date).toLocaleDateString("en-US", { weekday: "short" })}
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={record.type === "wfh" ? "default" : "secondary"}>
                                    {record.type === "wfh" ? "WFH" : "Onsite"}
                                  </Badge>
                                  <Badge variant={record.is_on_time ? "default" : "destructive"}>
                                    {record.is_on_time ? "On Time" : "Late"}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {calculateWorkingHours(record.check_in, record.check_out)}h worked
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  {new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                                  {record.check_out ? new Date(record.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not checked out"}
                                </div>
                                {record.notes && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Note: {record.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <TrendingUp className="h-4 w-4 text-green-500" />

                              {record.photo_url && isValidImageUrl(record.photo_url) && (
                                <div className="flex items-center space-x-2">
                                  <img
                                    src={record.photo_url}
                                    alt=""
                                    className="h-8 w-8 object-cover border"
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openImageModal(record.photo_url, record.date)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                          <div className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPrevPage}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>

                            {/* Page numbers */}
                            <div className="flex space-x-1">
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }

                                return (
                                  <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => goToPage(pageNum)}
                                    className="w-8 h-8 p-0"
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              })}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextPage}
                              disabled={currentPage === totalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        imageUrl={imageModal.imageUrl}
        onClose={closeImageModal}
        attendanceDate={imageModal.attendanceDate}
      />
    </div>
  )
}