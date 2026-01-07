"use client"

import { useEffect } from "react"
import { logout } from "@/actions/auth"
import { Box, Spinner, Text, VStack } from "@chakra-ui/react"
import { useTranslations } from "next-intl"

export default function LogoutPage() {
    const t = useTranslations('common');
    useEffect(() => {
        logout()
    }, [])

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <VStack gap={4}>
                <Spinner size="xl" color="main" />
                <Text>{t('signing_out', { defaultValue: "Signing out..." })}</Text>
            </VStack>
        </Box>
    )
}

