import TanstackProvider from "@/components/ui/tanstack";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { cookieName, fallbackLng } from "@/libs/i18n/settings";

export const metadata: Metadata = {
  title: "Booking NextJS",
  description: "Booking NextJS",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lng = cookieStore.get(cookieName)?.value || fallbackLng;

  return (
    <html suppressHydrationWarning lang={lng}>
      <body>
        <SessionProvider>
          <TanstackProvider>
            {children}
          </TanstackProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
