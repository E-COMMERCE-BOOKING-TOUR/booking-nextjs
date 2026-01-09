import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import "./admin-globals.scss"
import { AdminLanguageSwitcher } from "@/components/admin/AdminLanguageSwitcher"
import { AdminNotificationDropdown } from "@/components/admin/AdminNotificationDropdown"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { getServerAuth } from "@/libs/auth/getServerAuth"

export default async function AdminDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const authData = await getServerAuth();
    const user = authData?.user;
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex-1 flex flex-col min-h-screen">
                <div className="h-16 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-sidebar/50 backdrop-blur-xl sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-3">
                        <AdminNotificationDropdown />
                        <AdminLanguageSwitcher />
                        <div className="pl-2 border-l border-white/10 ml-1">
                            <Avatar className="size-9 border border-white/10 cursor-pointer hover:border-primary/50 transition-colors">
                                {(user as any)?.avatar_url && <AvatarImage src={(user as any).avatar_url} />}
                                <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-7">
                    {children}
                </div>
            </main>
            <Toaster />
        </SidebarProvider>
    );
}