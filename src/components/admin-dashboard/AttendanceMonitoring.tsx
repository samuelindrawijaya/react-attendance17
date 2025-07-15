import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Calendar, Filter, Eye, Download, MapPin, Clock, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import axiosInstance from "../../lib/axiosInstance"
import { AxiosError } from "axios"

// Updated types based on API response
interface AttendanceRecord {
  id: string
  user_id: string
  employee_id: string
  date: string
  check_in: string
  check_out: string | null
  type: "wfh" | "onsite"
  photo: string
  notes: string
  createdAt: string
  updatedAt: string
  photo_url: string
  is_on_time: boolean
  employee: {
    id: string
    full_name: string
    department: string
    position: string
  }
}

interface AttendanceStats {
  total_days: number
  total_wfh: number
  total_onsite: number
  on_time: number
  late: number
}

interface AttendanceFilter {
  employee_id: string
  date_from: string
  date_to: string
  type: string
  department: string
}

interface AttendanceMonitoringProps {
  onViewPhoto: (photo: string) => void
}

export default function AttendanceMonitoring({ onViewPhoto }: AttendanceMonitoringProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<AttendanceFilter>({
    employee_id: "",
    date_from: "",
    date_to: "",
    type: "",
    department: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [attendanceRes, statsRes] = await Promise.all([
        axiosInstance.get("http://localhost:4004/api/attendance/all"),
        axiosInstance.get("http://localhost:4004/api/attendance/stats/all")
      ])

      if (attendanceRes.data.success) {
        setAttendance(attendanceRes.data.data)
      } else {
        throw new Error(attendanceRes.data.message || "Failed to fetch attendance records")
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data)
      } else {
        throw new Error(statsRes.data.message || "Failed to fetch attendance stats")
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response) {
          // Server responded with error status
          setError(err.response.data?.message || `Server error: ${err.response.status}`)
        } else if (err.request) {
          // Network error
          setError("Network error: Unable to connect to server")
        } else {
          // Other axios error
          setError(err.message || "Request failed")
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  // Get unique departments and employees for filter options
  const departments = [...new Set(attendance.map((record) => record.employee.department))]
  const employees = attendance.reduce((acc, record) => {
    const existingEmployee = acc.find(emp => emp.id === record.employee.id)
    if (!existingEmployee) {
      acc.push({
        id: record.employee.id,
        full_name: record.employee.full_name,
        department: record.employee.department
      })
    }
    return acc
  }, [] as Array<{id: string, full_name: string, department: string}>)

  // Filter attendance records
  const filteredAttendance = attendance.filter((record) => {
    if (filters.employee_id && record.employee_id !== filters.employee_id) return false
    if (filters.date_from && record.date < filters.date_from) return false
    if (filters.date_to && record.date > filters.date_to) return false
    if (filters.type && record.type !== filters.type) return false
    if (filters.department && record.employee.department !== filters.department) return false
    return true
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAttendance = filteredAttendance.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show first page, current page range, and last page
      if (currentPage <= 3) {
        // Near beginning
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        if (totalPages > 4) pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near end
        pages.push(1)
        if (totalPages > 4) pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Middle
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const calculateWorkingHours = (checkIn: string, checkOut?: string | null) => {
    if (!checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) / 10
  }

  const exportToCSV = () => {
    const headers = ["Employee", "Department", "Position", "Date", "Check In", "Check Out", "Type", "Working Hours", "On Time", "Notes"]
    const csvData = filteredAttendance.map((record) => [
      record.employee.full_name,
      record.employee.department,
      record.employee.position,
      record.date,
      new Date(record.check_in).toLocaleString(),
      record.check_out ? new Date(record.check_out).toLocaleString() : "",
      record.type,
      calculateWorkingHours(record.check_in, record.check_out),
      record.is_on_time ? "Yes" : "No",
      record.notes || ""
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_report_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading attendance data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchAttendanceData} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Attendance Monitoring</h2>
          <p className="text-gray-600">Monitor and track employee attendance records</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchAttendanceData}>
            <Calendar className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="employee_id">Employee</Label>
                <select
                  id="employee_id"
                  value={filters.employee_id}
                  onChange={(e) => setFilters((prev) => ({ ...prev, employee_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date_from">From Date</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters((prev) => ({ ...prev, date_from: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="date_to">To Date</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters((prev) => ({ ...prev, date_to: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="type">Work Type</Label>
                <select
                  id="type"
                  value={filters.type}
                  onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="wfh">Work From Home</option>
                  <option value="onsite">On Site</option>
                </select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <select
                  id="department"
                  value={filters.department}
                  onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setFilters({ employee_id: "", date_from: "", date_to: "", type: "", department: "" })}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats?.total_days || 0}</div>
            <p className="text-sm text-gray-600">Total Days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats?.total_wfh || 0}</div>
            <p className="text-sm text-gray-600">WFH Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats?.total_onsite || 0}</div>
            <p className="text-sm text-gray-600">Onsite Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{stats?.on_time || 0}</div>
            <p className="text-sm text-gray-600">On Time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-500">{stats?.late || 0}</div>
            <p className="text-sm text-gray-600">Late</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Employee</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Check In</th>
                  <th className="text-left p-4 font-medium">Check Out</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Working Hours</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentAttendance.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{record.employee.full_name}</p>
                        <p className="text-sm text-gray-600">
                          {record.employee.department} • {record.employee.position}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(record.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        {new Date(record.check_in).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {record.check_out ? (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-red-500" />
                          {new Date(record.check_out).toLocaleTimeString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not yet</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={record.type === "wfh" ? "default" : "secondary"}>
                        <MapPin className="h-3 w-3 mr-1" />
                        {record.type === "wfh" ? "Work From Home" : "On Site"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="font-mono">{calculateWorkingHours(record.check_in, record.check_out)}h</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={record.is_on_time ? "default" : "destructive"}>
                        {record.is_on_time ? "On Time" : "Late"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button size="sm" variant="outline" onClick={() => onViewPhoto(record.photo_url)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {currentAttendance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No attendance records found matching your filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAttendance.length)} of {filteredAttendance.length} records
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                    className={currentPage === page ? "bg-black text-white" : ""}
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}