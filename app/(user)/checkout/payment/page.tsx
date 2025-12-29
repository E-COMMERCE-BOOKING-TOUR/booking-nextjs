import { redirect } from "next/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutPaymentClient from "./CheckoutPaymentClient";
import bookingApi from "@/apis/booking";
import { cookies } from "next/headers";
import { cookieName, fallbackLng } from "@/libs/i18n/settings";
import { createTranslation } from "@/libs/i18n";

export default async function CheckoutPaymentPage() {
    const [bookingResult, paymentMethodsResult] = await Promise.all([
        bookingApi.getCurrent(),
        bookingApi.getPaymentMethods(),
    ]);

    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;
    const { t } = await createTranslation(lng);

    if (!bookingResult.ok && bookingResult.redirectTo) {
        redirect(bookingResult.redirectTo);
    }

    if (!bookingResult.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800">{t('no_active_booking', { defaultValue: 'No active booking found' })}</h2>
                    <p className="text-red-600 mt-1">{t('please_complete_step1', { defaultValue: 'Please complete Step 1 first.' })}</p>
                    <a href="/checkout" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {t('go_to_step1', { defaultValue: 'Go to Step 1' })}
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
            lng={lng}
        />
    );
}
