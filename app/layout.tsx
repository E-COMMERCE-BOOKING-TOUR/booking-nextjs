import TanstackProvider from "@/components/ui/tanstack";
import { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Provider } from "@/components/chakra/provider";
import { Toaster } from "@/components/chakra/toaster";
import "./globals.css";

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
            <Provider>
              <Toaster />
              {children}
            </Provider>
          </TanstackProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
