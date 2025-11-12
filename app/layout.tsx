import { Provider } from "@/components/ui/provider";
import TanstackProvider from "@/components/ui/tanstack";
import { Toaster } from "@/components/ui/toaster";
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
