import { useRouter } from "next/navigation";
import { Button, Dialog, Portal, Text } from "@chakra-ui/react";
import CountdownTimer from "@/components/ui/user/CountdownTimer";
import { useTranslations } from "next-intl";

interface Props {
    isExpired: boolean;
    onExpire: () => void;
    expiresAt?: string;
}

export const BookingExpiryManager = ({ isExpired, onExpire, expiresAt }: Props) => {
    const router = useRouter();
    const t = useTranslations('common');

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
                                <Dialog.Title color="red.600">{t('booking_expired_title', { defaultValue: 'Booking Expired' })}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text color="gray.600">
                                    {t('booking_expired_desc', { defaultValue: 'Your booking hold has expired. The reservation time limit has passed. Please start a new booking to continue.' })}
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button variant="outline" onClick={() => router.push("/")}>{t('return_home', { defaultValue: 'Return to Home' })}</Button>
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
