"use client";

import { useRouter } from "next/navigation";
import { Button, Dialog, Portal, Text } from "@chakra-ui/react";
import CountdownTimer from "@/components/ui/user/CountdownTimer";

interface Props {
    isExpired: boolean;
    onExpire: () => void;
    expiresAt?: string;
}

export const BookingExpiryManager = ({ isExpired, onExpire, expiresAt }: Props) => {
    const router = useRouter();

    if (!expiresAt) return null;

    return (
        <>
            <Dialog.Root
                open={isExpired}
                closeOnEscape={false}
                closeOnInteractOutside={false}
                role="alertdialog"
                placement="center"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title color="red.600">Booking Expired</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text color="gray.600">
                                    Your booking hold has expired. The reservation time limit has passed.
                                    Please start a new booking to continue.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="outline" onClick={() => router.push("/")}>Return to Home</Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <CountdownTimer
                expiresAt={expiresAt}
                onExpire={onExpire}
            />
        </>
    );
};
