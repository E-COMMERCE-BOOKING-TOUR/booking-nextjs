import { Provider } from "@/components/ui/provider";
import TanstackProvider from "@/components/ui/Tanstack";
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
            <Provider>{children}</Provider>
          </TanstackProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
