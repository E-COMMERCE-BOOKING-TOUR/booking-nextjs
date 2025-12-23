'use client';
import { Button, CloseButton, Drawer, Icon, Portal, useDisclosure } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { Logo, MenuLinks } from "./navbar";
import { IBookingDetail } from "@/types/booking";
import { ResumeBookingButton } from "./resumeBookingButton";

interface MobileDrawerProps {
    activeBooking?: IBookingDetail | null;
}

export const MobileDrawer = ({ activeBooking }: MobileDrawerProps) => {
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
                    <Drawer.Content>
                        <Drawer.Header>
                            <Drawer.Title>
                                <Logo />
                            </Drawer.Title>
                        </Drawer.Header>
                        <Drawer.Body>
                            <ResumeBookingButton
                                booking={activeBooking || null}
                                width="full"
                                mb={4}
                            />
                            <MenuLinks isMobile />
                        </Drawer.Body>
                        <Drawer.CloseTrigger asChild>
                            <CloseButton size="md" />
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    );
};