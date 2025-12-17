import { redirect } from "next/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutPaymentClient from "./CheckoutPaymentClient";
import bookingApi from "@/apis/booking";

export default async function CheckoutPaymentPage() {
    const [bookingResult, paymentMethodsResult] = await Promise.all([
        bookingApi.getCurrent(),
        bookingApi.getPaymentMethods(),
    ]);

    if (!bookingResult.ok && bookingResult.redirectTo) {
        redirect(bookingResult.redirectTo);
    }

    if (!bookingResult.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800">No active booking found</h2>
                    <p className="text-red-600 mt-1">Please complete Step 1 first.</p>
                    <a href="/checkout" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Go to Step 1
                    </a>
                </div>
            </div>
        );
    }

    const booking = bookingResult.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "payment");
    if (redirectPath) {
        redirect(redirectPath);
    }

    const paymentMethods = paymentMethodsResult.ok ? paymentMethodsResult.data : [];

    return (
        <CheckoutPaymentClient
            initialBooking={booking}
            paymentMethods={paymentMethods}
        />
    );
}
