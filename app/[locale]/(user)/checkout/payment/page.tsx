import { Link, redirect } from "@/i18n/navigation";
import { getRedirectIfNeeded } from "@/libs/checkout";
import CheckoutPaymentClient from "./CheckoutPaymentClient";
import bookingApi from "@/apis/booking";
import { getTranslations } from "next-intl/server";

export default async function CheckoutPaymentPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale: lng } = await params;
    const t = await getTranslations('common');
    const [bookingResult, paymentMethodsResult] = await Promise.all([
        bookingApi.getCurrent(),
        bookingApi.getPaymentMethods(),
    ]);

    if (!bookingResult.ok && bookingResult.redirectTo) {
        redirect({ href: bookingResult.redirectTo, locale: lng });
    }

    if (!bookingResult.ok) {
        return (
            <div className="container mx-auto max-w-2xl py-10">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800">{t('no_active_booking', { defaultValue: 'No active booking found' })}</h2>
                    <p className="text-red-600 mt-1">{t('please_complete_step1', { defaultValue: 'Please complete Step 1 first.' })}</p>
                    <Link href="/checkout" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        {t('go_to_step1', { defaultValue: 'Go to Step 1' })}
                    </Link>
                </div>
            </div>
        );
    }

    const booking = bookingResult.data;
    const redirectPath = getRedirectIfNeeded(booking.status, "payment");
    if (redirectPath) {
        redirect({ href: redirectPath, locale: lng });
    }

    const paymentMethods = paymentMethodsResult.ok ? paymentMethodsResult.data : [];

    return (
        <CheckoutPaymentClient
            initialBooking={booking}
            paymentMethods={paymentMethods}
        />
    );
}
