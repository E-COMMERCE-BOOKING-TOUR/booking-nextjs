"use client";

import { GalleryVerticalEnd, Handshake, Home, ScrollText, SquareCheck, ThumbsUp, Users } from "lucide-react";

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
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const sections = [
  {
    title: "Dashboard",
    base: "/admin/dashboard",
    icon: Home,
    children: [
      { title: "Dashboard", url: "/admin/dashboard" },
    ],
  },
  {
    title: "Tour",
    base: "/admin/tour",
    icon: GalleryVerticalEnd,
    children: [
      { title: "List Tour", url: "/admin/tour" },
      { title: "Edit Tour", url: "/admin/tour/edit" },
    ],
  },
  {
    title: "Booking",
    base: "/admin/booking",
    icon: SquareCheck,
    children: [
      { title: "List Booking", url: "/admin/booking" },
      { title: "Edit Booking", url: "/admin/booking/edit" },
    ],
  },
  {
    title: "Khách hàng",
    base: "/admin/user",
    icon: Users,
    children: [
      { title: "List Khách hàng", url: "/admin/user-list" },
    ],
  },
  {
    title: "Blogs",
    base: "/admin/blog",
    icon: ScrollText,
    children: [
      { title: "List Blog", url: "/admin/blog" },
    ],
  },
  {
    title: "Đánh giá",
    base: "/admin/review",
    icon: ThumbsUp,
    children: [
      { title: "Đánh giá", url: "/admin/review" },
    ],
  },
  // {
  //   title: "Đối tác",
  //   base: "/admin/supplier",
  //   icon: Handshake,
  //   children: [
  //     { title: "List Đối tác", url: "/admin/supplier" },
  //     { title: "Edit Đối tác", url: "/admin/supplier/edit" },
  //   ],
  // },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>{/* Header Sidebar */}</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isParentActive = pathname.startsWith(sec.base);
                return (
                  <SidebarMenuItem key={sec.title} className="py-2">
                    <SidebarMenuButton
                      asChild
                      isActive={isParentActive}
                      className={`${isParentActive ? "bg-blue-800" : ""} hover:bg-blue-100`}
                    >
                      <a href={sec.children[0]?.url || sec.base}>
                        <Icon />
                        <span>{sec.title}</span>
                      </a>
                    </SidebarMenuButton>
                    {sec.children && sec.children.length > 1 ? (
                      <SidebarMenuSub>
                        {sec.children.map((c) => {
                          const isChildActive = pathname === c.url;
                          return (
                            <SidebarMenuSubItem key={c.title}>
                              <SidebarMenuSubButton asChild isActive={isChildActive} className={`${isChildActive ? "bg-blue-500" : ""} hover:bg-blue-100`}>
                                <a href={c.url}>
                                  <span>{c.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}