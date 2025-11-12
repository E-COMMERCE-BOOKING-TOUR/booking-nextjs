import { Provider } from "@/components/chakra/provider";
import TanstackProvider from "@/components/ui/tanstack";
import { Toaster } from "@/components/chakra/toaster";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body>
        <SessionProvider>
          <TanstackProvider>
            <Provider>
              {children}
              <Toaster />
            </Provider>
          </TanstackProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
