import { Provider } from "@/components/chakra/provider";
import { Toaster } from "@/components/chakra/toaster";

export default function TopPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      {children}
      <Toaster />
    </Provider>
  );
}

