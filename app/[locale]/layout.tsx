import TanstackProvider from "@/components/ui/tanstack";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SessionMonitor } from '@/components/auth/SessionMonitor';
import { auth } from "@/libs/auth/auth";

export const metadata: Metadata = {
  title: "Booking NextJS",
  description: "Booking NextJS",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const session = await auth();

  return (
    <html suppressHydrationWarning lang={locale}>
      <body>
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages}>
            <TanstackProvider>
              {children}
            </TanstackProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
