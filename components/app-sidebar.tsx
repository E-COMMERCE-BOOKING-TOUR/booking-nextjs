"use client";

import { Calendar, GalleryVerticalEnd, Handshake, Home, Inbox, ScrollText, Search, Settings, SquareCheck, ThumbsUp, Users } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useState } from "react";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: Home,
    },
    {
        title: "Tour",
        url: "/admin/tour-list",
        icon: GalleryVerticalEnd,
    },
    {
        title: "Booking",
        url: "/admin/booking",
        icon: SquareCheck,
    },
    {
        title: "Khách hàng",
        url: "/admin/user-list",
        icon: Users,
    },
    {
        title: "Blogs",
        url: "/admin/blog",
        icon: ScrollText,
    },
    {
        title: "Đánh giá",
        url: "/admin/review",
        icon: ThumbsUp,
    },
    {
        ///Admin Web
        title: "Đối tác",
        url: "/admin/supplier",
        icon: Handshake,
    },
]

export function AppSidebar() {

    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader >
                {/* Header Siderbar */}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} className="py-2">
                                    <SidebarMenuButton asChild 
                                    className={`
                                        ${pathname === item.url ? 'bg-blue-300' : ''} 
                                        hover:bg-blue-100
                                        h-[50]
                                        `} >
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}