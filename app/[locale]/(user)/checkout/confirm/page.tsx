import { Link, redirect } from "@/i18n/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutConfirmClient from "./CheckoutConfirmClient";
import bookingApi from "@/apis/booking";
import { getTranslations } from "next-intl/server";

export default async function CheckoutConfirmPage({ params }: { params: Promise<{ locale: string }> }) {
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
                    <p className="text-red-600 mt-1">{t('please_complete_previous_steps', { defaultValue: 'Please complete previous steps first.' })}</p>
                    <Link href="/checkout" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {t('go_to_step1', { defaultValue: 'Go to Step 1' })}
                    </Link>
                </div>
            </div>
        );
    }

    const booking = result.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "confirm");
    if (redirectPath) {
        redirect({ href: redirectPath, locale: lng });
    }

    return <CheckoutConfirmClient initialBooking={booking} />;
}
