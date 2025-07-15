import React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/useAuth"

export default function PrivateRoute({ children }: { children: React.ReactElement }) {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-blue-600" />
            </div>
        )
    }
    if (!user) {
        return <Navigate to="/" replace />
    }
    return children
}
