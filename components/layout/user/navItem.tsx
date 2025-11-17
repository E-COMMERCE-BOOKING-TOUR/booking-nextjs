'use client';
import { Link as ChakraLink } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
    name: string;
    link: string;
};

export const NavItem = ({ item }: { item: NavItem }) => {
    const pathname = usePathname();
    const isActive = pathname === item.link || pathname.startsWith(item.link + '/');
    return (
        <ChakraLink
            asChild
            position="relative"
            fontWeight="bold"
            color={isActive ? "main" : "gray.500"}
            paddingX={{ base: 5, md: 10 }}
            fontSize="18px"
            _before={{
                content: '""',
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: -3,
                width: "100%",
                height: "2px",
                bg: "main",
                borderRadius: "999px",
                opacity: isActive ? 1 : 0,
                transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
            _hover={{
                color: "main",
                _before: {
                    opacity: 1,
                },
            }}
        >
            <NextLink href={item.link}>{item.name}</NextLink>
        </ChakraLink>
    );
}