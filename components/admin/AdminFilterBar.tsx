"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";

interface AdminFilterBarProps {
    searchPlaceholder?: string;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    onSearch?: () => void;
    onClear?: () => void;
    isFiltered?: boolean;
    children?: React.ReactNode;
}

export const AdminFilterBar = ({
    searchPlaceholder = "Search...",
    searchTerm,
    onSearchChange,
    onSearch,
    onClear,
    isFiltered,
    children,
}: AdminFilterBarProps) => {
    return (
        <CardHeader className="border-b border-white/5 pb-6 px-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
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
                            Search
                        </Button>
                        {isFiltered && onClear && (
                            <Button
                                variant="ghost"
                                onClick={onClear}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </CardHeader>
    );
};
