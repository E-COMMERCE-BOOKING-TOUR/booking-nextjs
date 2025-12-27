"use client";

import * as React from "react";
import { Bell, Check, CheckCircle2, Info, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import notificationApi from "@/apis/notification";
import { INotification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/libs/utils";
import Link from "next/link";
import Cookies from "js-cookie";
import { cookieName } from "@/libs/i18n/settings";

export function AdminNotificationDropdown() {
    const { data: session } = useSession();
    const token = session?.user?.accessToken;
    const [readIds, setReadIds] = React.useState<number[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);

    // Get current language for date formatting
    const lng = Cookies.get(cookieName) || 'vi';

    const { data: response, isLoading, refetch } = useQuery({
        queryKey: ["notifications", token, "admin-dropdown"],
        queryFn: async () => {
            if (!token) return { data: [], total: 0 };
            const res = await notificationApi.getMe(token, 1, 10);
            if (!res.ok) throw new Error(res.error);
            return res.data;
        },
        enabled: !!token,
        // Refresh every minute
        refetchInterval: 60000,
    });

    const notifications = response?.data || [];

    // Calculate unread count (excluding locally read IDs)
    const unreadCount = React.useMemo(() => {
        return Math.max(0, (notifications.length) - readIds.length);
    }, [notifications.length, readIds.length]);

    const handleRead = (id: number) => {
        if (!readIds.includes(id)) {
            setReadIds(prev => [...prev, id]);
        }
    };

    const handleMarkAllRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadIds(prev => Array.from(new Set([...prev, ...allIds])));
    };

    const getIcon = (n: INotification) => {
        if (n.is_error) return <AlertCircle className="h-4 w-4 text-destructive" />;
        // Check keywords for success/info - Update to check both En and Vi keywords if needed, or better rely on type
        const titleLower = n.title.toLowerCase();
        if (titleLower.includes('success') || titleLower.includes('confirmed') || titleLower.includes('thành công'))
            return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
        return <Info className="h-4 w-4 text-sky-500" />;
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full hover:bg-white/5">
                        <Bell className="size-5" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full bg-destructive text-destructive-foreground text-[10px] ring-2 ring-background pointer-events-none"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto text-xs text-muted-foreground hover:text-foreground px-2 py-0.5"
                            onClick={handleMarkAllRead}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
                            Loading...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                            <Bell className="h-8 w-8 opacity-20" />
                            <span className="text-sm">No new notifications</span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((n) => {
                                const isRead = readIds.includes(n.id);
                                return (
                                    <DropdownMenuItem
                                        key={n.id}
                                        className={cn(
                                            "flex items-start gap-3 p-4 cursor-pointer focus:bg-accent/50 border-b last:border-0",
                                            !isRead && "bg-accent/5"
                                        )}
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            handleRead(n.id);
                                        }}
                                    >
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full bg-background border shrink-0",
                                            !isRead && "ring-1 ring-primary/20 bg-primary/5"
                                        )}>
                                            {getIcon(n)}
                                        </div>
                                        <div className="flex flex-col gap-1 w-full min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("text-sm font-medium leading-none truncate", !isRead && "text-primary font-bold")}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(n.created_at), {
                                                        addSuffix: true,
                                                        locale: enUS
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {n.description}
                                            </p>
                                        </div>
                                        {!isRead && (
                                            <div className="absolute right-2 top-11 h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-2 border-t bg-muted/20">
                    <Button variant="ghost" className="w-full h-8 text-xs font-medium" asChild>
                        <Link href="/admin/notification">
                            View All
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
