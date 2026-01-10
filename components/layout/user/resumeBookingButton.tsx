'use client';

import { Button, ButtonProps } from '@chakra-ui/react';
import { IBookingDetail } from '@/types/booking';
import { useEffect, useState } from 'react';
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";

const STORAGE_KEY = 'booking_expiry';

export const ResumeBookingButton = ({ booking, ...props }: { booking: IBookingDetail | null } & ButtonProps) => {
    const pathname = usePathname();
    const t = useTranslations('common');

    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        // If booking exists but has no expiry (completed/confirmed), clear localStorage and hide button
        if (booking && !booking.hold_expires_at) {
            localStorage.removeItem(STORAGE_KEY);
            setTimeLeft(null);
            return;
        }

        // No booking data from server - only check localStorage if truly no booking
        // Server is source of truth, clear localStorage when no booking
        if (!booking) {
            localStorage.removeItem(STORAGE_KEY);
            setTimeLeft(null);
            return;
        }

        // If booking has valid expiry, sync to localStorage
        if (booking?.hold_expires_at) {
            localStorage.setItem(STORAGE_KEY, booking.hold_expires_at);
        }

        // Determine expiry source: prioritize booking prop, fallback to localStorage
        const getExpiryTime = (): number | null => {
            if (booking?.hold_expires_at) {
                return new Date(booking.hold_expires_at).getTime();
            }
            // Only use localStorage if no booking prop provided
            if (!booking) {
                const saved = localStorage.getItem(STORAGE_KEY);
                return saved ? new Date(saved).getTime() : null;
            }
            return null;
        };

        const updateTimer = () => {
            const expiryTime = getExpiryTime();
            if (!expiryTime) {
                setTimeLeft(null);
                return;
            }

            const now = Date.now();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setTimeLeft(0);
                // Clear expired data from localStorage
                localStorage.removeItem(STORAGE_KEY);
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
