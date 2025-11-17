"use client"

import { useEffect } from "react"
import { logout } from "@/actions/auth"
import { Box, Spinner, Text, VStack } from "@chakra-ui/react"

export default function LogoutPage() {
    useEffect(() => {
        logout()
    }, [])

    return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
            <VStack gap={4}>
                <Spinner size="xl" color="main" />
                <Text>Signing out...</Text>
            </VStack>
        </Box>
    )
}

