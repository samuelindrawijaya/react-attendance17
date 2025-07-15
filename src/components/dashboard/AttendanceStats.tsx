import { useEffect, useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { AlertCircle } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Skeleton } from "../../components/ui/skeleton"
import axiosInstance from "../../lib/axiosInstance"

interface AttendanceStatsData {
    total_days: number
    total_wfh: number
    total_onsite: number
    on_time: number
    late: number
}

export default function AttendanceStats() {
    const [stats, setStats] = useState<AttendanceStatsData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = async () => {
        try {
            setLoading(true)
            const res = await axiosInstance.get("http://localhost:4004/api/attendance/me/stats")
            setStats(res.data.data)
        } catch (err) {
            console.error("Failed to fetch stats:", err)
            setStats(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
            </div>
        )
    }

    if (!stats && !loading) {
        return (
            <div className="text-center py-6">
                <div className="inline-flex flex-col items-center text-red-500 space-y-2">
                    <AlertCircle className="h-6 w-6" />
                    <p className="text-sm">Failed to load attendance stats.</p>
                    <Button onClick={fetchStats} variant="outline" size="sm">
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="text-2xl font-bold">{stats!.total_days}</div>
                    <p className="text-sm text-gray-600">Days This Month</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{stats!.total_wfh}</div>
                    <p className="text-sm text-gray-600">WFH Days</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{stats!.total_onsite}</div>
                    <p className="text-sm text-gray-600">Onsite Days</p>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">{stats!.late}</div>
                    <p className="text-sm text-gray-600">Late Arrivals</p>
                </CardContent>
            </Card>
        </div>
    )
}
