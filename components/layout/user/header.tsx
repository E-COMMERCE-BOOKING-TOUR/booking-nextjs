"use client";

import { Box, Flex, FlexProps } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const Header = ({ children, ...props }: FlexProps) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const SCROLL_DOWN_THRESHOLD = 20;
        const SCROLL_UP_THRESHOLD = 5;

        const handleScroll = () => {
            const scrollY = window.scrollY;

            setIsScrolled(prev => {
                if (prev && scrollY < SCROLL_UP_THRESHOLD) {
                    return false;
                }
                if (!prev && scrollY > SCROLL_DOWN_THRESHOLD) {
                    return true;
                }
                return prev;
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Box
            as="header"
            position="sticky"
            top="0"
            zIndex="1000"
            transition="all 0.3s ease-in-out"
            width="100%"
        >
            <Box
                position="absolute"
                inset="0"
                bg={isScrolled ? "rgba(255, 255, 255, 0.9)" : "transparent"}
                backdropFilter={isScrolled ? "blur(12px)" : "none"}
                boxShadow={isScrolled ? "sm" : "none"}
                transition="all 0.3s ease-in-out"
                zIndex="-1"
            />
            <Flex
                alignItems="center"
                justifyContent="space-between"
                paddingY={{ base: 3, md: isScrolled ? 3 : 5 }}
                paddingX={{ base: 4, md: 8, lg: 12 }}
                maxWidth="1440px"
                margin="0 auto"
                transition="padding 0.3s ease"
                {...props}
            >
                {children}
            </Flex>
        </Box>
    );
};
