"use client";

import React from "react";
import { GalleryVerticalEnd, Home, SquareCheck, ThumbsUp, Users, LogOut, Compass, Bell, MapPin, Settings, MessageCircle } from "lucide-react";

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
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslations } from "next-intl";

interface SidebarChild {
  title: string;
  url: string;
  permission?: string;
}

interface SidebarSection {
  title: string;
  base: string | string[];
  icon: any;
  url?: string;
  children?: SidebarChild[];
  permission?: string;
}

const sections = [
  {
    title: "dashboard_menu",
    base: "/admin/dashboard",
    icon: Home,
    url: "/admin/dashboard",
  },
  {
    title: "tour_management_menu",
    base: "/admin/tour",
    icon: GalleryVerticalEnd,
    permission: "tour:read",
    children: [
      { title: "all_tours_menu", url: "/admin/tour", permission: "tour:read" },
      { title: "refund_policies_menu", url: "/admin/tour/policies", permission: "tour:read" },
      { title: "create_new_menu", url: "/admin/tour/create", permission: "tour:create" },
    ],
  },
  {
    title: "bookings_menu",
    base: "/admin/booking",
    icon: SquareCheck,
    permission: "booking:read",
    children: [
      { title: "all_bookings_menu", url: "/admin/booking", permission: "booking:read" },
    ],
  },
  {
    title: "user_access_menu",
    base: ["/admin/users", "/admin/suppliers", "/admin/roles"],
    icon: Users,
    children: [
      { title: "users_menu", url: "/admin/users", permission: "user:read" },
      { title: "suppliers_menu", url: "/admin/suppliers", permission: "supplier:read" },
      { title: "roles_permissions_menu", url: "/admin/roles", permission: "role:read" },
    ],
  },
  {
    title: "master_data_menu",
    base: ["/admin/division", "/admin/currency"],
    icon: MapPin,
    children: [
      { title: "divisions_menu", url: "/admin/division", permission: "division:read" },
      { title: "currencies_menu", url: "/admin/currency", permission: "currency:read" },
    ],
  },
  {
    title: "reviews_menu",
    base: "/admin/review",
    icon: ThumbsUp,
    url: "/admin/review",
    permission: "review:read",
  },
  {
    title: "message_management_menu",
    base: "/admin/message",
    icon: MessageCircle,
    url: "/admin/message",
    permission: "chatbox:read",
  },
  {
    title: "notifications_menu",
    base: "/admin/notification",
    icon: Bell,
    permission: "notification:read",
    children: [
      { title: "all_notifications_menu", url: "/admin/notification", permission: "notification:read" },
      { title: "create_new_menu", url: "/admin/notification/create", permission: "notification:create" },
    ],
  },
  {
    title: "contents_menu",
    base: ["/admin/static-pages", "/admin/social"],
    icon: GalleryVerticalEnd,
    children: [
      { title: "static_pages_menu", url: "/admin/static-pages", permission: "article:read" },
      { title: "social_management_menu", url: "/admin/social", permission: "article:read" },
    ],
  },
  {
    title: "settings_menu",
    base: "/admin/settings",
    icon: Settings,
    url: "/admin/settings",
    permission: "system:config",
  },
];

export function AppSidebar() {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const { hasPermission, user } = usePermissions();

  const filteredSections = React.useMemo(() => {
    const filterSec = (sec: SidebarSection): SidebarSection | null => {
      // If user is admin (case insensitive), show everything
      if (user?.role?.name?.toLowerCase() === 'admin') return sec;

      let newChildren = undefined;
      if (sec.children) {
        newChildren = sec.children.filter(child =>
          !child.permission || hasPermission(child.permission)
        );
        if (newChildren.length === 0) return null;
      }

      if (sec.permission && !hasPermission(sec.permission)) {
        return null;
      }

      return { ...sec, children: newChildren };
    };

    return sections
      .map(sec => filterSec(sec as SidebarSection))
      .filter((sec): sec is SidebarSection => sec !== null);
  }, [sections, hasPermission, user?.role?.name]);

  const activeSection = filteredSections.find(sec =>
    sec.children && (Array.isArray(sec.base)
      ? sec.base.some(b => pathname.startsWith(b))
      : pathname.startsWith(sec.base as string))
  );

  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">TripConnect</span>
            <span className="text-xs font-medium text-muted-foreground">{t('admin_console')}</span>
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
              {filteredSections.map((sec) => {
                const Icon = sec.icon;
                const isParentActive = Array.isArray(sec.base)
                  ? sec.base.some(b => pathname.startsWith(b))
                  : pathname.startsWith(sec.base as string);

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
                            <span className="font-medium">{t(sec.title)}</span>
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
                        <span>{t(sec.title)}</span>
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
                              {t(c.title)}
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
          <span>{t('logout_button')}</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
