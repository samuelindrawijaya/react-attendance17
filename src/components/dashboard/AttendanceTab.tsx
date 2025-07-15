"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import axiosInstance from "../../lib/axiosInstance"
import { Calendar, Camera, Clock, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Button } from "../ui/button"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Label } from "../ui/label"
import type { TodayAttendance, User } from "../../types"

interface Profile {
    employee_id: string
    user_id: string
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

interface Props {
    user: User
    token: string
}

export default function AttendanceTab({ user, token }: Props) {
    const [isCheckedIn, setIsCheckedIn] = useState(false)
    const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null)
    const [workType, setWorkType] = useState<"wfh" | "onsite">("wfh")
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [notes, setNotes] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isProfileLoading, setIsProfileLoading] = useState(true)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const currentTime = new Date().toLocaleTimeString()
    const currentDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    })

    // Fetch user profile to get employee_id
    const fetchProfile = useCallback(async () => {
        if (!user || !token) {
            setIsProfileLoading(false)
            return
        }

        try {
            const res = await axiosInstance.get("http://localhost:4003/api/employee/profile", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setProfile(res.data.data)
        } catch (err) {
            console.error("Failed to fetch profile", err)
        } finally {
            setIsProfileLoading(false)
        }
    }, [user, token])

    const fetchTodayAttendance = useCallback(async () => {
        if (!user || !token) {
            setIsInitialLoading(false)
            return
        }

        try {
            const res = await axiosInstance.get("http://localhost:4004/api/attendance/me/today", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setTodayAttendance(res.data.data)
            setIsCheckedIn(!!res.data.data?.check_in)
        } catch (err) {
            console.error("Failed to fetch today's attendance", err)
            setTodayAttendance(null)
            setIsCheckedIn(false)
        } finally {
            setIsInitialLoading(false)
        }
    }, [user, token])

    useEffect(() => {
        const initializeData = async () => {
            await fetchProfile()
            await fetchTodayAttendance()
        }
        initializeData()
    }, [fetchProfile, fetchTodayAttendance])

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhotoFile(file)
            const reader = new FileReader()
            reader.onload = (e) => setPhotoPreview(e.target?.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleCheckIn = async () => {
        if (workType === "wfh" && !photoFile) {
            alert("Please upload a photo for WFH")
            return
        }

        if (!profile?.employee_id) {
            alert("Employee ID not found. Please try refreshing the page.")
            return
        }

        setIsLoading(true)
        try {
            const formData = new FormData()
            formData.append("employee_id", profile.employee_id) // Use employee_id from profile
            formData.append("type", workType)
            if (notes) formData.append("notes", notes)
            if (workType === "wfh" && photoFile) {
                formData.append("photo", photoFile)
            }

            await axiosInstance.post("http://localhost:4004/api/attendance/clock-in", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    'Authorization': `Bearer ${token}`
                }
            })

            await fetchTodayAttendance()
            setPhotoFile(null)
            setPhotoPreview(null)
            setNotes("")
        } catch (err) {
            console.error("Clock in failed", err)
            alert("Clock in failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCheckOut = async () => {
        if (!profile?.employee_id) {
            alert("Employee ID not found. Please try refreshing the page.")
            return
        }

        setIsLoading(true)
        try {
            await axiosInstance.patch("http://localhost:4004/api/attendance/clock-out", {
                employee_id: profile.employee_id // Use employee_id from profile
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            await fetchTodayAttendance()
        } catch (err) {
            console.error("Clock out failed", err)
            alert("Clock out failed")
        } finally {
            setIsLoading(false)
        }
    }

    // Show loading state while initial data is being fetched
    if (isInitialLoading || isProfileLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="text-center">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-400" />
                    <p className="text-gray-500">Loading attendance data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">{currentTime}</div>
                    <div className="text-lg text-gray-600 flex items-center justify-center">
                        <Calendar className="h-5 w-5 mr-2" />
                        {currentDate}
                    </div>
                </CardContent>
            </Card>

            {todayAttendance && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            Today's Attendance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Check In</p>
                                <p className="font-semibold">
                                    {todayAttendance.check_in ? new Date(todayAttendance.check_in).toLocaleTimeString() : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Check Out</p>
                                <p className="font-semibold">
                                    {todayAttendance.check_out ? new Date(todayAttendance.check_out).toLocaleTimeString() : "Not yet"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-semibold capitalize">{todayAttendance.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Photo</p>
                                {todayAttendance.photo_url ? (
                                    <a
                                        href={todayAttendance.photo_url}
                                        target="_blank"
                                        className="text-blue-600 underline text-sm"
                                        rel="noreferrer"
                                    >
                                        View Photo
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Work Type & Photo</CardTitle>
                        <CardDescription>Select work mode and upload photo if WFH</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup
                            defaultValue="wfh"
                            onValueChange={(val: "wfh" | "onsite") => setWorkType(val)}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="wfh" id="wfh" />
                                <Label htmlFor="wfh">Work From Home</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="onsite" id="onsite" />
                                <Label htmlFor="onsite">On Site</Label>
                            </div>
                        </RadioGroup>

                        {workType === "wfh" && !isCheckedIn && (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="user"
                                    onChange={handlePhotoCapture}
                                    ref={fileInputRef}
                                    className="hidden"
                                />
                                {photoPreview ? (
                                    <div className="space-y-4">
                                        <img src={photoPreview} className="w-full h-48 object-cover rounded-lg border" />
                                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Retake Photo
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400"
                                        variant="outline"
                                    >
                                        <div className="text-center">
                                            <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                            <span>Take Photo</span>
                                        </div>
                                    </Button>
                                )}

                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add notes (optional)"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
                                    rows={3}
                                />
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Actions</CardTitle>
                        <CardDescription>Check in/out for today's work session</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isCheckedIn ? (
                            <Button
                                onClick={handleCheckIn}
                                disabled={isLoading || (workType === "wfh" && !photoFile)}
                                className="w-full h-16 text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                                        Checking In...
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-5 w-5 mr-2" />
                                        Check In
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleCheckOut}
                                disabled={isLoading || !!todayAttendance?.check_out}
                                variant="outline"
                                className="w-full h-16 text-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Clock className="h-5 w-5 mr-2 animate-spin" />
                                        Checking Out...
                                    </>
                                ) : todayAttendance?.check_out ? (
                                    "Already Checked Out"
                                ) : (
                                    <>
                                        <Clock className="h-5 w-5 mr-2" />
                                        Check Out
                                    </>
                                )}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}