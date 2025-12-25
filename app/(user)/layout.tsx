import { Provider } from '@/components/chakra/provider';
import { Toaster } from '@/components/chakra/toaster';
import { UserFooter, UserNavbar } from '@/components/layout/user';
import { settingsApi } from '@/apis/settings';
import { Metadata } from 'next';
import '../globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await settingsApi.get();
    return {
      title: settings.site_title,
      description: settings.meta_description,
      keywords: settings.meta_keywords,
      icons: {
        icon: settings.favicon_url || '/favicon.ico',
      },
    };
  } catch (error) {
    return {
      title: 'TripConnect',
      description: 'TripConnect - Du Lịch & Khám Phá',
    };
  }
}

export default async function TopPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings = null;
  try {
    settings = await settingsApi.get();
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
  }

  return (
    <Provider>
      <UserNavbar settings={settings} />
      {children}
      <Toaster />
      <UserFooter settings={settings} />
    </Provider>
  );
}
