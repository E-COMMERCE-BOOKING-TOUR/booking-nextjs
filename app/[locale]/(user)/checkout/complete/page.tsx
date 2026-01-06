import { Link, redirect } from "@/i18n/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutCompleteClient from "./CheckoutCompleteClient";
import bookingApi from "@/apis/booking";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function CheckoutCompletePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: lng } = await params;
    const t = await getTranslations('common');
    const result = await bookingApi.getCurrent();

    if (!result.ok && result.redirectTo) {
        redirect({ href: result.redirectTo, locale: lng });
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
        redirect({ href: redirectPath, locale: lng });
    }

    return <CheckoutCompleteClient initialBooking={booking} />;
}
