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
            color={isActive ? "main" : "gray.600"}
            paddingX={{ base: 4, md: 6 }}
            paddingY={2}
            fontSize={{ base: "lg", md: "sm" }}
            letterSpacing="wide"
            textTransform="uppercase"
            transition="color 0.2s ease"
            _before={{
                content: '""',
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 0,
                width: isActive ? "20px" : "0px",
                height: "2px",
                bg: "main",
                borderRadius: "full",
                opacity: isActive ? 1 : 0,
                transition: "all 0.3s ease",
            }}
            _hover={{
                color: "main",
                textDecoration: "none",
                _before: {
                    width: "20px",
                    opacity: 1,
                },
            }}
        >
            <NextLink href={item.link}>{item.name}</NextLink>
        </ChakraLink>
    );
}