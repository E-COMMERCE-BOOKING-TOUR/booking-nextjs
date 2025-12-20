import { redirect } from "next/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutCompleteClient from "./CheckoutCompleteClient";
import bookingApi from "@/apis/booking";

export default async function CheckoutCompletePage() {
    const result = await bookingApi.getCurrent();

    if (!result.ok && result.redirectTo) {
        redirect(result.redirectTo);
    }
    console.log(result)
    if (!result.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h2 className="text-lg font-semibold text-yellow-800">Booking completed</h2>
                    <p className="text-yellow-600 mt-1">Your booking has been confirmed. You can view it in your orders.</p>
                    <div className="flex gap-3 justify-center mt-4">
                        <a href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                            Go to Home
                        </a>
                        <a href="/user-order" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            View My Bookings
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const booking = result.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "complete");
    if (redirectPath) {
        redirect(redirectPath);
    }

    return <CheckoutCompleteClient initialBooking={booking} />;
}
