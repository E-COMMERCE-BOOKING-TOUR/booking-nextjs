'use client';

import { Button, ButtonProps } from '@chakra-ui/react';
import { IBookingDetail } from '@/types/booking';
import { useEffect, useState } from 'react';
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";

export const ResumeBookingButton = ({ booking, ...props }: { booking: IBookingDetail | null } & ButtonProps) => {
    const pathname = usePathname();
    const t = useTranslations('common');

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        // Sync to localStorage if booking provided
        if (booking?.hold_expires_at) {
            localStorage.setItem('booking_expiry', booking.hold_expires_at);
        }

        // Determine expiry source
        const getExpiryTime = () => {
            if (booking?.hold_expires_at) {
                return new Date(booking.hold_expires_at).getTime();
            }
            const saved = localStorage.getItem('booking_expiry');
            return saved ? new Date(saved).getTime() : null;
        };

        const updateTimer = () => {
            const expiryTime = getExpiryTime();
            if (!expiryTime) {
                setTimeLeft(null);
                return;
            }

            const now = new Date().getTime();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setTimeLeft(0);
                // Clear expired if we are checking local storage fallback
                if (!booking) localStorage.removeItem('booking_expiry');
            } else {
                setTimeLeft(diff);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [booking, pathname]);

    // Format time: MM:SS
    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    // Hide if:
    // 1. On checkout page
    // 2. Time expired (timeLeft === 0)
    // 3. No expiry time found (timeLeft === null)
    if (pathname.startsWith('/checkout') || timeLeft === 0 || timeLeft === null) {
        return null;
    }

    return (
        <Button
            asChild
            variant="outline"
            size="sm"
            colorPalette="blue"
            borderColor="blue.500"
            color="blue.600"
            _hover={{ bg: "blue.50" }}
            {...props}
        >
            <Link href="/checkout">
                {t('resume_booking', { defaultValue: 'Resume Booking' })} ({formatTime(timeLeft)})
            </Link>
        </Button>
    );
};
