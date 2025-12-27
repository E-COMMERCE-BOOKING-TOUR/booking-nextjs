"use client"

import { logout } from "@/actions/auth"
import { Menu } from "@chakra-ui/react"
import { useState } from "react"

import { useTranslation } from "@/libs/i18n/client"
import { fallbackLng } from "@/libs/i18n/settings"
import { useSearchParams } from "next/navigation"

export const LogoutButton = ({ lng: propLng }: { lng?: string }) => {
    const searchParams = useSearchParams()
    const lng = propLng || searchParams?.get('lng') || fallbackLng
    const { t } = useTranslation(lng as string)
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

