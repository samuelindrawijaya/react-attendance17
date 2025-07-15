import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/useAuth"
import ProfileCard from "./ProfileCard"
import AttendanceStats from "./AttendanceStats"
import AttendanceHistory from "./AttendanceHistory"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Button } from "../ui/button"
import { AlertCircle } from "lucide-react"
import axiosInstance from "../../lib/axiosInstance"

interface ProfileData {
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

export default function ProfileTab() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const fetchProfile = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const res = await axiosInstance.get("http://localhost:4003/api/employee/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            setProfile(res.data.data)
        } catch (error) {
            console.error("Failed to load profile:", error)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchProfile()
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start space-x-6 mb-6">
                            <Skeleton className="h-20 w-20 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(2)].map((_, i) => (
                                <div className="space-y-3" key={i}>
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }


    if (!profile && !loading) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-red-600">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <AlertCircle className="h-8 w-8" />
                        <div>
                            <p className="text-sm font-medium">Failed to load profile information.</p>
                            <p className="text-xs text-gray-500">Please check your connection and try again.</p>
                        </div>
                        <Button onClick={fetchProfile} variant="outline">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {profile && <ProfileCard profile={profile} email={user?.email || "-"} />}
            <AttendanceStats />
            <AttendanceHistory />
        </div>
    )

}
