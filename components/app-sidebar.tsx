"use client";

import { GalleryVerticalEnd, Handshake, Home, ScrollText, SquareCheck, ThumbsUp, Users, LogOut, Compass } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const sections = [
  {
    title: "Dashboard",
    base: "/admin/dashboard",
    icon: Home,
    url: "/admin/dashboard",
  },
  {
    title: "Tour Management",
    base: "/admin/tour",
    icon: GalleryVerticalEnd,
    children: [
      { title: "All Tours", url: "/admin/tour" },
      { title: "Create New", url: "/admin/tour/create" },
    ],
  },
  {
    title: "Bookings",
    base: "/admin/booking",
    icon: SquareCheck,
    children: [
      { title: "All Bookings", url: "/admin/booking" },
      { title: "Payment Logs", url: "/admin/booking/payments" },
    ],
  },
  {
    title: "Customers",
    base: "/admin/user",
    icon: Users,
    url: "/admin/user-list",
  },
  {
    title: "Articles & Blogs",
    base: "/admin/blog",
    icon: ScrollText,
    url: "/admin/blog",
  },
  {
    title: "Reviews",
    base: "/admin/review",
    icon: ThumbsUp,
    url: "/admin/review",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">TripConnect</span>
            <span className="text-xs font-medium text-muted-foreground">Admin Console</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isParentActive = pathname.startsWith(sec.base);

                return (
                  <SidebarMenuItem key={sec.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isParentActive}
                      className={`h-11 px-4 transition-all duration-200 ${isParentActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`}
                    >
                      <a href={sec.url || sec.children?.[0]?.url}>
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{sec.title}</span>
                      </a>
                    </SidebarMenuButton>

                    {sec.children && isParentActive && (
                      <SidebarMenuSub className="mt-1 ml-4 border-l-2 border-primary/20 pl-4 gap-1">
                        {sec.children.map((c) => {
                          const isChildActive = pathname === c.url;
                          return (
                            <SidebarMenuSubItem key={c.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isChildActive}
                                className={`h-9 px-3 transition-colors ${isChildActive
                                  ? "text-primary font-semibold"
                                  : "text-muted-foreground hover:text-foreground"
                                  }`}
                              >
                                <a href={c.url}>
                                  <span>{c.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}