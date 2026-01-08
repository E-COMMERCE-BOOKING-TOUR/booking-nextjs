"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { cn } from "@/libs/utils";

interface AdminFilterBarProps {
    searchPlaceholder?: string;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onSearch?: () => void;
    onClear?: () => void;
    isFiltered?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export const AdminFilterBar = ({
    searchPlaceholder,
    searchTerm,
    onSearchChange,
    onSearch,
    onClear,
    isFiltered,
    children,
    className,
}: AdminFilterBarProps) => {
    const t = useTranslations("admin");
    const placeholder = searchPlaceholder || t('search_placeholder');
    return (
        <CardHeader className={cn("border-b border-white/5 pb-6 px-6", className)}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder={placeholder}
                        className="pl-10 bg-white/5 border-white/10"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {children}
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            onClick={onSearch}
                            variant="secondary"
                            className="bg-white/5 hover:bg-white/10 text-foreground border-white/10"
                        >
                            <Search className="mr-2 size-4" />
                            {t('search_button')}
                        </Button>
                        {isFiltered && onClear && (
                            <Button
                                variant="ghost"
                                onClick={onClear}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            >
                                {t('clear_button')}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CardHeader>
    );
};
