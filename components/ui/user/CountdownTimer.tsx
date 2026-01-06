"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect, memo } from "react";
import { Box, Text } from "@chakra-ui/react";

interface CountdownTimerProps {
    expiresAt: string | Date;
    onExpire?: () => void;
}

const CountdownTimer = memo(function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
    const t = useTranslations('common');
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Single robust effect to handle countdown
    useEffect(() => {
        const deadline = new Date(expiresAt).getTime();

        const tick = () => {
            const now = Date.now();
            const diff = Math.floor((deadline - now) / 1000);
            const remaining = Math.max(0, diff);

            setTimeLeft(remaining);

            if (remaining <= 0) {
                if (onExpire) onExpire();
                // Stop the timer
                return true;
            }
            return false;
        };

        // Initial check
        const isFinished = tick();
        if (isFinished) return;

        const timer = setInterval(() => {
            const finished = tick();
            if (finished) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt, onExpire]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const isWarning = timeLeft !== null && timeLeft <= 60;
    const isExpired = timeLeft !== null && timeLeft <= 0;

    return (
        <Box
            textAlign="center"
            py={3}
            px={4}
            mb={4}
            borderRadius="lg"
            bg={isWarning ? "red.50" : "blue.50"}
            borderWidth="1px"
            borderColor={isWarning ? "red.200" : "blue.200"}
        >
            <Text
                fontSize="sm"
                color={isWarning ? "red.700" : "blue.700"}
                fontWeight="medium"
            >
                {timeLeft === null ? (
                    t('loading', { defaultValue: "Loading..." })
                ) : isExpired ? (
                    t('booking_expired_desc', { defaultValue: "Your booking hold has expired. Please start again." })
                ) : (
                    <>
                        {t('booking_held_for', { defaultValue: "Your booking is held for" })}{" "}
                        <Text as="span" fontWeight="bold" fontSize="md">
                            {formatTime(timeLeft)}
                        </Text>
                    </>
                )}
            </Text>
        </Box>
    );
});

export default CountdownTimer;
