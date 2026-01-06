"use client"

import { logout } from "@/actions/auth"
import { Menu } from "@chakra-ui/react"
import { useState } from "react"

import { useTranslations } from "next-intl"

export const LogoutButton = () => {
    const t = useTranslations('common')
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
            {isLoading ? t('sign_out', { defaultValue: 'Signing out...' }) : t('sign_out', { defaultValue: 'Sign out' })}
        </Menu.Item>
    )
}

