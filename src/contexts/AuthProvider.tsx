// src/contexts/AuthProvider.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext"
import type { AuthContextType } from "./AuthContext"
import type { User } from "../types";
import axiosInstance from "../lib/axiosInstance";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window === "undefined") return; 

        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("token");

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }

        setIsLoading(false); 
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true)
        try {
            const res = await axios.post("http://localhost:4002/api/auth/login", {
                email,
                password,
            }, {
                withCredentials: true
            })

            const { employee, accessToken } = res.data.data

            localStorage.setItem("token", accessToken)
            localStorage.setItem("user", JSON.stringify(employee))
            setUser(employee)
            setToken(accessToken) 
            return true
        } catch (error) {
            console.error("Login failed:", error)
            return false
        } finally {
            setIsLoading(false) 
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null); 
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const updateUser = (newUser: User) => {
        setUser(newUser)
        localStorage.setItem("user", JSON.stringify(newUser))
    }

    const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
            const res = await axiosInstance.post("http://localhost:4002/api/auth/change-password", {
                user_id: userId,
                currentPassword: currentPassword,
                newPassword: newPassword
            });
            return res.data.success === true ? true : res.data.message
        } catch (err) {
            console.error("Change password error:", err)
            if (axios.isAxiosError(err)) {
                return err.response?.data?.message || "Failed to change password";
            }
            return false;
        }
    };

    const value: AuthContextType = {
        user,
        login,
        logout,
        token,
        isLoading,
        updateUser,
        changePassword
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}