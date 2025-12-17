import { redirect } from "next/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutInfoClient from "./CheckoutInfoClient";
import bookingApi from "@/apis/booking";

export default async function CheckoutPage() {
    const result = await bookingApi.getCurrent();

    // Handle auth redirect
    if (!result.ok && result.redirectTo) {
        redirect(result.redirectTo);
    }

    if (!result.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800">No active booking found</h2>
                    <p className="text-red-600 mt-1">Please start a new booking from a tour page.</p>
                    <a href="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Return to Home
                    </a>
                </div>
            </div>
        );
    }

    const booking = result.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "info");
    if (redirectPath) {
        redirect(redirectPath);
    }

    return <CheckoutInfoClient initialBooking={booking} />;
}
