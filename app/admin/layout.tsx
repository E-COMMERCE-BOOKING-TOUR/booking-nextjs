import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import "./admin-globals.scss"

export default function AdminDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full flex-1 p-4">
                {/* <SidebarTrigger size={"icon-lg"} /> */}
                {children}
            </main>
        </SidebarProvider>
    );
}