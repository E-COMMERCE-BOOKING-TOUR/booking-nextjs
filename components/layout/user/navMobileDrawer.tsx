'use client';
import { Button, CloseButton, Drawer, Icon, Portal, useDisclosure } from "@chakra-ui/react";
import { FiMenu } from "react-icons/fi";
import { Logo, MenuLinks } from "./navbar";

export const MobileDrawer = () => {
    const { open, onToggle } = useDisclosure();

    return (
        <Drawer.Root open={open} onOpenChange={onToggle} size="full">
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