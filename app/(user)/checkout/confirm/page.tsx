import { redirect } from "next/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutConfirmClient from "./CheckoutConfirmClient";
import bookingApi from "@/apis/booking";
import { cookies } from "next/headers";
import { cookieName, fallbackLng } from "@/libs/i18n/settings";
import { useTranslation } from "@/libs/i18n";

export default async function CheckoutConfirmPage() {
    const result = await bookingApi.getCurrent();

    const cookieStore = await cookies();
    const lng = cookieStore.get(cookieName)?.value || fallbackLng;
    const { t } = await useTranslation(lng);

    // Handle auth redirect
    if (!result.ok && result.redirectTo) {
        redirect(result.redirectTo);
    }

    if (!result.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800">{t('no_active_booking', { defaultValue: 'No active booking found' })}</h2>
                    <p className="text-red-600 mt-1">{t('please_complete_previous_steps', { defaultValue: 'Please complete previous steps first.' })}</p>
                    <a href="/checkout" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {t('go_to_step1', { defaultValue: 'Go to Step 1' })}
                    </a>
                </div>
            </div>
        );
    }

    const booking = result.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "confirm");
    if (redirectPath) {
        redirect(redirectPath);
    }

    return <CheckoutConfirmClient initialBooking={booking} lng={lng} />;
}
