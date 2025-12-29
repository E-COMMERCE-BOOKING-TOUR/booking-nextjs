'use client'

import {
    Button,
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuTrigger,
    MenuPositioner
} from "@chakra-ui/react"
import { useTranslation } from "@/libs/i18n/client"
import { languages } from "@/libs/i18n/settings"
import { IoLanguage } from "react-icons/io5"
import Cookies from 'js-cookie'
import { cookieName } from "@/libs/i18n/settings"

export const LanguageSwitcher = ({ lng }: { lng: string }) => {
    const { i18n } = useTranslation(lng)

    const handleLanguageChange = (newLng: string) => {
        i18n.changeLanguage(newLng)
        Cookies.set(cookieName, newLng, { path: '/', expires: 365 })
        window.location.reload() // Force reload to update server-side translations if any
    }

    return (
        <MenuRoot lazyMount unmountOnExit id="user-language-switcher">
            <MenuTrigger asChild>
                <Button variant="ghost" size="sm" borderRadius="full">
                    <IoLanguage style={{ marginRight: '8px' }} />
                    {lng.toUpperCase()}
                </Button>
            </MenuTrigger>
            <MenuPositioner>
                <MenuContent>
                    {languages.map((l) => (
                        <MenuItem
                            key={l}
                            value={l}
                            onClick={() => handleLanguageChange(l)}
                            bg={l === lng ? "gray.100" : "transparent"}
                        >
                            {l === 'en' ? 'English' : 'Tiếng Việt'}
                        </MenuItem>
                    ))}
                </MenuContent>
            </MenuPositioner>
        </MenuRoot>
    )
}
