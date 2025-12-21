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
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

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
  const activeSection = sections.find(sec => sec.children && pathname.startsWith(sec.base));

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

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <Accordion
              type="single"
              collapsible
              className="w-full space-y-1 border-none"
              defaultValue={activeSection?.title}
            >
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isParentActive = pathname.startsWith(sec.base);

                if (!sec.children) {
                  return (
                    <SidebarMenu key={sec.title}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          asChild
                          isActive={isParentActive}
                          className={`h-11 px-4 transition-all duration-200 ${isParentActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            }`}
                        >
                          <Link href={sec.url || "#"}>
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{sec.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  );
                }

                return (
                  <AccordionItem key={sec.title} value={sec.title} className="border-none">
                    <AccordionTrigger
                      className={`flex h-11 w-full items-center gap-3 px-4 py-0 font-medium transition-all duration-200 hover:no-underline rounded-md ${isParentActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        } [&>svg:last-child]:h-4 [&>svg:last-child]:w-4`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="h-5 w-5" />
                        <span>{sec.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-1 ml-4 border-l-2 border-primary/20 pl-2">
                      <div className="flex flex-col gap-1">
                        {sec.children.map((c) => {
                          const isChildActive = pathname === c.url;
                          return (
                            <Link
                              key={c.title}
                              href={c.url}
                              className={`flex h-9 items-center px-4 rounded-md text-sm transition-colors ${isChildActive
                                ? "text-primary font-semibold bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                                }`}
                            >
                              {c.title}
                            </Link>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-11 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-semibold"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
