'use client'

import {
    Button,
    MenuContent,
    MenuItem,
    MenuRoot,
    MenuTrigger,
    MenuPositioner
} from "@chakra-ui/react"
import { useLocale } from "next-intl"
import { IoLanguage } from "react-icons/io5"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

export const LanguageSwitcher = () => {
    const locale = useLocale();
    const pathname = usePathname();
    const router = useRouter();

    const handleLanguageChange = (newLocale: "en" | "vi") => {
        router.replace(pathname, { locale: newLocale });
    }

    return (
        <MenuRoot lazyMount unmountOnExit id="user-language-switcher">
            <MenuTrigger asChild>
                <Button variant="ghost" size="sm" borderRadius="full">
                    <IoLanguage style={{ marginRight: '8px' }} />
                    {locale.toUpperCase()}
                </Button>
            </MenuTrigger>
            <MenuPositioner>
                <MenuContent>
                    {routing.locales.map((l) => (
                        <MenuItem
                            key={l}
                            value={l}
                            onClick={() => handleLanguageChange(l as "en" | "vi")}
                            bg={l === locale ? "gray.100" : "transparent"}
                        >
                            {l === 'en' ? 'English' : 'Tiếng Việt'}
                        </MenuItem>
                    ))}
                </MenuContent>
            </MenuPositioner>
        </MenuRoot>
    )
}
