import { Provider } from '@/components/chakra/provider';
import { Toaster } from '@/components/chakra/toaster';
import { Diagonal, UserFooter, UserNavbar } from '@/components/layout/user';

export default function TopPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <UserNavbar />
      {children}
      <Toaster />
      <UserFooter />
    </Provider>
  );
}
