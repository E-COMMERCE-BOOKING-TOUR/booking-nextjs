import { useState, useEffect, useCallback } from "react";

export function useBookingExpiry(expiresAt?: string) {
    const [isExpired, setIsExpired] = useState(false);

    // Sync expiry to localStorage
    useEffect(() => {
        if (expiresAt) {
            localStorage.setItem('booking_expiry', expiresAt);

            // Optional: check if already expired on mount
            const expiryTime = new Date(expiresAt).getTime();
            if (Date.now() > expiryTime) {
                // If strictly expired, you might want to expire immediately.
                // However, letting CountdownTimer trigger the callback ensures sync with UI.
                // We'll leave it to the consumer or timer to trigger 'handleExpire'.
            }
        }
    }, [expiresAt]);

    const handleExpire = useCallback(() => {
        setIsExpired(true);
        localStorage.removeItem('booking_expiry');
    }, []);

    // Clean up localStorage if unmounting? No, we want persistence across reloads/nav.
    // Cleanup happens on explicit cancel or success elsewhere.

    return { isExpired, handleExpire };
}
