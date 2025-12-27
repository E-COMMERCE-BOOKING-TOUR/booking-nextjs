'use client';
import { Box, Button, CloseButton, Drawer, Icon, Portal, useDisclosure } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { Logo, MenuLinks } from "./navCommon";
import { IBookingDetail } from "@/types/booking";
import { ResumeBookingButton } from "./resumeBookingButton";

interface MobileDrawerProps {
    activeBooking?: IBookingDetail | null;
    navItems?: any[];
}

export const MobileDrawer = ({ activeBooking, navItems }: MobileDrawerProps) => {
    const { open, onToggle } = useDisclosure();

    return (
        <Drawer.Root open={open} onOpenChange={onToggle} size="full" id="mobile-nav-drawer">
            <Drawer.Trigger asChild>
                <Button variant="outline" size="sm">
                    <Icon as={FiMenu} />
                </Button>
            </Drawer.Trigger>
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content bg="white" maxW="300px">
                        <Drawer.Header borderBottomWidth="1px" borderColor="gray.100" py={6}>
                            <Drawer.Title>
                                <Logo />
                            </Drawer.Title>
                        </Drawer.Header>
                        <Drawer.Body py={8}>
                            <MenuLinks items={navItems} isMobile />
                            <Box mt={8} pt={8} borderTopWidth="1px" borderColor="gray.100">
                                <ResumeBookingButton
                                    booking={activeBooking || null}
                                    width="full"
                                />
                            </Box>
                        </Drawer.Body>
                        <Drawer.CloseTrigger asChild>
                            <CloseButton size="lg" position="absolute" top={4} right={4} color="gray.500" />
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
};