"use client"

import { useState } from "react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Button } from "../../components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { KeyRound, Loader2 } from "lucide-react"
import { useAuth } from "../../contexts/useAuth"

export default function SecurityTab() {
    const { user, changePassword, isLoading: authLoading } = useAuth()
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [passwordMessage, setPasswordMessage] = useState("")
    const [isPasswordSuccess, setIsPasswordSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordMessage("")
        setIsPasswordSuccess(false)
        setIsLoading(true)

        if (newPassword !== confirmNewPassword) {
            setPasswordMessage("New password and confirm password do not match.")
            setIsPasswordSuccess(false)
            setIsLoading(false)
            return
        }

        if (!user) {
            setPasswordMessage("User not logged in.")
            setIsPasswordSuccess(false)
            setIsLoading(false)
            return
        }

        try {
            const success = await changePassword(user.id, currentPassword, newPassword)

            if (success === true) {
                setPasswordMessage("Password changed successfully!")
                setIsPasswordSuccess(true)
                // reset inputs
            } else {
                setPasswordMessage(success || "Failed to change password.")
                setIsPasswordSuccess(false)
            }
        } catch (err) {
            console.error("Password error:", err)
            setPasswordMessage("Unexpected error. Please try again.")
            setIsPasswordSuccess(false)
        }

        setIsLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <KeyRound className="h-5 w-5 mr-2" />
                    Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                        <Input
                            id="confirm-new-password"
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    {passwordMessage && (
                        <div className={`text-sm ${isPasswordSuccess ? "text-green-600" : "text-red-600"}`}>
                            {passwordMessage}
                        </div>
                    )}
                    <Button type="submit" disabled={isLoading || authLoading}>
                        {isLoading || authLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Changing...
                            </>
                        ) : (
                            "Change Password"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
