import TanstackProvider from "@/components/ui/tanstack";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Booking NextJS",
  description: "Booking NextJS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en">
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
