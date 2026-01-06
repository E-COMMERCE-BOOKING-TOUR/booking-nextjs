import { Link, redirect } from "@/i18n/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutInfoClient from "./CheckoutInfoClient";
import bookingApi from "@/apis/booking";
import { getTranslations } from "next-intl/server";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: lng } = await params;
    const t = await getTranslations('common');
    const result = await bookingApi.getCurrent();

    // Handle auth redirect
    if (!result.ok && result.redirectTo) {
        redirect({ href: result.redirectTo, locale: lng });
    }

    if (!result.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800">{t('no_active_booking', { defaultValue: 'No active booking found' })}</h2>
                    <p className="text-red-600 mt-1">{t('start_new_booking_desc', { defaultValue: 'Please start a new booking from a tour page.' })}</p>
                    <Link href="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {t('return_to_home', { defaultValue: 'Return to Home' })}
                    </Link>
                </div>
            </div>
        );
    }

    const booking = result.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "info");
    if (redirectPath) {
        redirect({ href: redirectPath, locale: lng });
    }

    return <CheckoutInfoClient initialBooking={booking} />;
}
