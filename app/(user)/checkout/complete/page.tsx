import Link from "next/link";
import { redirect } from "next/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutCompleteClient from "./CheckoutCompleteClient";
import bookingApi from "@/apis/booking";
import { cookies } from "next/headers";
import { cookieName, fallbackLng } from "@/libs/i18n/settings";
import { createTranslation } from "@/libs/i18n";

export const dynamic = "force-dynamic";

export default async function CheckoutCompletePage() {
    const result = await bookingApi.getCurrent();

    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;
    const { t } = await createTranslation(lng);

    if (!result.ok && result.redirectTo) {
        redirect(result.redirectTo);
    }
    console.log(result)
    if (!result.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <h2 className="text-lg font-semibold text-yellow-800">{t('booking_completed_title', { defaultValue: 'Booking completed' })}</h2>
                    <p className="text-yellow-600 mt-1">{t('booking_completed_desc', { defaultValue: 'Your booking has been confirmed. You can view it in your orders.' })}</p>
                    <div className="flex gap-3 justify-center mt-4">
                        <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                            {t('go_to_home', { defaultValue: 'Go to Home' })}
                        </Link>
                        <Link href="/user-order" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            {t('view_my_bookings', { defaultValue: 'View My Bookings' })}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const booking = result.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "waiting_supplier");
    if (redirectPath) {
        redirect(redirectPath);
    }

    return <CheckoutCompleteClient initialBooking={booking} lng={lng} />;
}
