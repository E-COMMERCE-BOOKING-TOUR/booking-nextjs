"use client"

import { logout } from "@/actions/auth"
import { Menu } from "@chakra-ui/react"
import { useState } from "react"

export const LogoutButton = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)
        try {
            await logout()
        } catch (error) {
            console.error("Logout error:", error)
            setIsLoading(false)
        }
    }

    return (
        <Menu.Item value="logout" onClick={handleLogout} disabled={isLoading}>
            {isLoading ? "Signing out..." : "Sign out"}
        </Menu.Item>
    )
}

