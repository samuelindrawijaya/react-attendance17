"use client"

import { useEffect, useState, useMemo } from "react"
import {
    Card, CardContent, CardHeader,
    CardTitle, CardDescription
} from "../../components/ui/card"
import { AlertCircle, Calendar, CheckCircle, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Skeleton } from "../../components/ui/skeleton"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import axiosInstance from "../../lib/axiosInstance"
import {
    Select, SelectTrigger, SelectContent,
    SelectItem, SelectValue
} from "../ui/select"

interface AttendanceItem {
    id: string
    date: string
    check_in: string
    check_out: string | null
    type: "wfh" | "onsite"
    is_on_time: boolean
    notes?: string
}

export default function AttendanceHistory() {
    const [history, setHistory] = useState<AttendanceItem[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFrom, setDateFrom] = useState("")
    const [dateTo, setDateTo] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [showFilters, setShowFilters] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const fetchHistory = async (startDate?: string, endDate?: string) => {
        try {
            setLoading(true)
            const params: Record<string, string> = {}
            if (startDate) params.start = startDate
            if (endDate) params.end = endDate

            const res = await axiosInstance.get("http://localhost:4004/api/attendance/me", { params })
            setHistory(res.data.data || [])
        } catch (error) {
            console.error("Failed to load attendance history:", error)
            setHistory([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory(dateFrom, dateTo)
    }, [dateFrom, dateTo])

    const handleClearFilter = () => {
        setDateFrom("")
        setDateTo("")
        setTypeFilter("all")
    }

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            if (typeFilter !== "all" && item.type !== typeFilter) return false
            return true
        })
    }, [history, typeFilter])

    // Reset to page 1 on filter change
    useEffect(() => {
        setCurrentPage(1)
    }, [filteredHistory])

    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage)
    const paginatedHistory = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredHistory.slice(start, start + itemsPerPage)
    }, [filteredHistory, currentPage])

    const isFiltered = dateFrom || dateTo || typeFilter !== "all"

    return (
        <div className="pb-20">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2" />
                            Recent Attendance History
                        </CardTitle>
                        <CardDescription>Your attendance records</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setShowFilters(prev => !prev)}>
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>
                </div>

                {showFilters && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">From Date</label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">To Date</label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Work Type</label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="wfh">WFH</SelectItem>
                                    <SelectItem value="onsite">Onsite</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button onClick={handleClearFilter} variant="outline" className="w-full">
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                    </div>
                ) : !paginatedHistory.length && !isFiltered ? (
                    <div className="text-center py-6">
                        <div className="inline-flex flex-col items-center text-red-500 space-y-2">
                            <AlertCircle className="h-6 w-6" />
                            <p className="text-sm">No attendance records found.</p>
                            <Button onClick={() => fetchHistory()} variant="outline" size="sm">
                                Retry
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {paginatedHistory.map((item) => {
                                const date = new Date(item.date)
                                const dayName = date.toLocaleDateString("en-US", { weekday: "short" })
                                const typeLabel = item.type === "wfh" ? "WFH" : "Onsite"
                                const badgeColor = item.type === "wfh"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="text-center">
                                                <div className="text-sm font-medium">
                                                    {date.toLocaleDateString()}
                                                </div>
                                                <div className="text-xs text-gray-500">{dayName}</div>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}
                                                    >
                                                        {typeLabel}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {item.check_in
                                                            ? new Date(item.check_in).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })
                                                            : "-"}{" "}
                                                        -{" "}
                                                        {item.check_out
                                                            ? new Date(item.check_out).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })
                                                            : "Still working"}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.is_on_time ? "On time" : "Late"}{" "}
                                                    {item.notes ? `- ${item.notes}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages >= 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        size="sm"
                                        variant={currentPage === page ? "default" : "outline"}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </Button>
                                ))}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
        </div>
    )
}
